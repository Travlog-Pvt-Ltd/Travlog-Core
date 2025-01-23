import fs from 'fs';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import { Place } from './tags/model.js';

const API_KEY = process.env.PLACES_API_KEY;
const DATA_FILE = 'tourist_attractions.json';

const latitudes = [];
const longitudes = [];

createReadStream('indiancities.csv')
    .pipe(csv())
    .on('data', (row) => {
        latitudes.push(parseFloat(row.Lat));
        longitudes.push(parseFloat(row.Long));
    });

function initializeFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ places: [] }, null, 4));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveToFile(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

async function fetchPlaces(location, radius = 10000) {
    let data = JSON.stringify({
        includedTypes: ['tourist_attraction'],
        maxResultCount: 20,
        locationRestriction: {
            circle: {
                center: {
                    latitude: location[0],
                    longitude: location[1],
                },
                radius: radius,
            },
        },
        rankPreference: 'POPULARITY',
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://places.googleapis.com/v1/places:searchNearby',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask':
                'places.displayName,places.id,places.formattedAddress,places.location',
        },
        data: data,
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error(
            'Error fetching places:',
            error.response?.data || error.message
        );
        return null;
    }
}

async function buildTouristDatabase() {
    let fileData = initializeFile();
    const radius = 10000;

    for (let i = 0; i < latitudes.length; i++) {
        const currentLocation = [latitudes[i], longitudes[i]];
        const data = await fetchPlaces(currentLocation, radius);

        if (data && data.places) {
            data.places.forEach((place) => {
                const newPlace = {
                    id: place.id,
                    name: place.displayName.text,
                    location: place.location,
                    formattedAddress: place.formattedAddress,
                };
                fileData.places.push(newPlace);
            });
        }

        saveToFile(fileData);
    }
}

const savePlacesFromJson = async () => {
    try {
        const data = await fs.promises.readFile(
            './tourist_attractions.json',
            'utf8'
        );
        const parsedData = JSON.parse(data);

        for (const place of parsedData.places) {
            // TODO[Rishikant]: Find a way to work out without using trimming
            // to extract country name and pincodes to avoid ambiguity
            const address = place.formattedAddress.trim().split(/[ ,]+/);

            const newPlace = new Place({
                placeId: place.id,
                name: place.name,
                location: place.location,
                formattedAddress: place.formattedAddress,
                country: address[address.length - 1],
                pincode: address[address.length - 2],
            });

            await newPlace.save();
            console.log(`Saved place: ${place.name}`);
        }
    } catch (error) {
        console.error('Error reading or saving data:', error);
    }
};

// Get all the locations in the file indiancities.csv
// Run this function to get all data in json file tourist_attractions.json
// buildTouristDatabase();

// Filter out the data in the json file to remove unwanted places
// Comment the upper function now and run this function to save data to DB
savePlacesFromJson();
