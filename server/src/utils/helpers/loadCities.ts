import fs from 'fs/promises';
import path from 'path';

export interface CityData {
    country: string;
    city: string;
    lat: number;
    lng: number;
}

export async function loadCities(): Promise<CityData[]> {
    try {
        const jsonPath = path.resolve(__dirname, '../data/cities.json');
        const data = await fs.readFile(jsonPath, 'utf8');
        return JSON.parse(data) as CityData[];
    } catch (error) {
        console.error('Failed to load cities:', error);
        throw new Error('Unable to load cities data');
    }
}
