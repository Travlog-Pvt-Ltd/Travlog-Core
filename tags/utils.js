import fs from 'fs';
import axios from 'axios';
import log from 'npmlog';
import redis from '../redis/index.js';
import { Trie } from '../common/utils.js';
import { searchAllTags } from './searchUtils.js';
import { Place } from './model.js';
import { tagsProducer } from './producer.js';

const placesDataFile = 'places_data_review.json';

export const parseEsTagData = (data) => {
    const result = data.map((el) => {
        const { _source, _id, ..._ } = el;
        _source['_id'] = _id;
        return _source;
    });
    return result;
};

const initializeFile = () => {
    if (!fs.existsSync(placesDataFile)) {
        fs.writeFileSync(
            placesDataFile,
            JSON.stringify({ places: [] }, null, 4)
        );
    }
    return JSON.parse(fs.readFileSync(placesDataFile, 'utf-8'));
};

const saveToFile = (data) => {
    fs.writeFileSync(placesDataFile, JSON.stringify(data, null, 4));
};

const fetchPlaces = async (location, radius = 10000) => {
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
            'X-Goog-Api-Key': process.env.PLACES_API_KEY,
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
};

export const fetchPlacesFromGoogle = async (latitudes, longitudes) => {
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
    return fileData.places;
};

export const savePlacesFromJson = async () => {
    try {
        const data = await fs.promises.readFile(`./${placesDataFile}`, 'utf8');
        const parsedData = JSON.parse(data);
        const places = [];

        for (const place of parsedData.places) {
            // TODO[Rishikant]: Find a way to work out without using trimming
            // to extract country name and pincodes to avoid ambiguity
            const address = place.formattedAddress.trim().split(/[ ,]+/);

            const newPlace = {
                placeId: place.id,
                name: place.name,
                location: place.location,
                formattedAddress: place.formattedAddress,
                country: address[address.length - 1],
                pincode: address[address.length - 2],
            };

            places.push(newPlace);
        }
        if (places.length === 0) places;
        const insertedPlaces = await Place.insertMany(places);
        await tagsProducer.tagsIndexProducer({
            places: insertedPlaces.map((place) => place._id),
        });
        await fs.promises.writeFile(
            `./${placesDataFile}`,
            JSON.stringify({ places: [] }, null, 4)
        );
        return insertedPlaces;
    } catch (error) {
        log.error('Error reading or saving data:', error);
    }
};

export const getAllTagsName = async () => {
    try {
        const result = await searchAllTags(['name', 'isPlace']);
        return result.map((doc) => [
            doc._source.name,
            doc._id,
            doc._source.isPlace,
        ]);
    } catch (error) {
        throw error;
    }
};

const generateNameVariations = (tag) => {
    const variations = [];
    variations.push(tag);
    const match = tag[0].match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
        variations.push([match[1].trim(), tag[1], tag[2]]);
        variations.push([match[2].trim(), tag[1], tag[2]]);
    }
    return variations;
};

export const createAndStoreTagsTrie = async () => {
    try {
        const tags = await getAllTagsName();
        const tagsTrie = new Trie();
        // Handle names where another name is added in parantheses
        const variations = tags.flatMap((tag) => generateNameVariations(tag));
        tagsTrie.bulkInsert(variations);
        const serializedTrie = JSON.stringify(tagsTrie);
        await redis.setEx('tagsTrie', 84600, serializedTrie);
        return serializedTrie;
    } catch (error) {
        throw error;
    }
};

export const getTagsTrie = async () => {
    try {
        let serializedTrie = await redis.get('tagsTrie');
        if (!serializedTrie) {
            log.info('Tags trie not found in cache. Creating and storing it.');
            serializedTrie = await createAndStoreTagsTrie();
        }
        const parsedTrie = JSON.parse(serializedTrie);
        const restoredTrie = new Trie();
        restoredTrie.root = parsedTrie.root;
        return restoredTrie;
    } catch (error) {
        log.error(error.message);
    }
};
