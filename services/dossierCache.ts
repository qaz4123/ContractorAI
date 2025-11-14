import { Dossier } from '../types';

const CACHE_KEY = 'projectprospect_dossier_cache';

// Get the cache object from localStorage
const getCache = (): Record<string, Dossier> => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : {};
    } catch (e) {
        console.error("Failed to parse dossier cache:", e);
        return {};
    }
};

// Normalize address to use as a consistent key
const normalizeAddress = (address: string): string => {
    return address.trim().toLowerCase().replace(/\s+/g, ' ');
};


// Get a specific dossier by address
export const getCachedDossier = (address: string): Dossier | null => {
    const cache = getCache();
    const normalizedAddress = normalizeAddress(address);
    return cache[normalizedAddress] || null;
};

// Set a dossier in the cache
export const setCachedDossier = (address: string, dossier: Dossier): void => {
    const cache = getCache();
    const normalizedAddress = normalizeAddress(address);
    cache[normalizedAddress] = dossier;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};
