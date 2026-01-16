// cache management system
const CACHE_KEY = 'countryCache';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getCachedCountry(identifier) {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
        const cachedData = cache[identifier];
        
        if (!cachedData) return null;
        
        // check if cache has expired
        const now = Date.now();
        if (now - cachedData.timestamp > CACHE_EXPIRATION) {
            // cache is expired and it needs to be removed
            delete cache[identifier];
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            return null;
        }
        
        return cachedData.data;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

function setCachedCountry(identifier, data) {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
        cache[identifier] = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error('Error writing to cache:', error);
    }
}

function clearCountryCache(identifier = null) {
    try {
        if (identifier) {
            // clear specific country cache
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
            delete cache[identifier];
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } else {
            // clear all country cache
            localStorage.removeItem(CACHE_KEY);
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}