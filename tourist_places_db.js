import fs from 'fs';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import axios from 'axios';

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

buildTouristDatabase();
