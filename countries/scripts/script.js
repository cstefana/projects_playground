async function searchCountry(queryParam = null, isCode = false) {
    const input = document.querySelector('.country-input');
    const searchTerm = queryParam || input.value.trim();
    const resultDiv = document.querySelector('.result');
    
    if (!isCode && searchTerm.length < 3) {
        resultDiv.innerHTML = `<p class="error">Please type at least 3 characters to search.</p>`;
        return;
    }

    // check cache first
    const cacheKey = isCode ? `code:${searchTerm}` : `name:${searchTerm}`;
    const cachedData = getCachedCountry(cacheKey);
    
    if (cachedData) {
        resultDiv.innerHTML = cachedData.map(country => createCountryCard(country)).join('');
        updateStar();
        cachedData.forEach(country => {
            if (typeof saveSearch === "function") saveSearch(country.name.common);
            if (typeof updateStar === "function") updateStar(country.name.common);
        });
        return;
    }

    resultDiv.innerHTML = `<p style="color: var(--primary-purple)">Searching for "${searchTerm}"...</p>`;

    try {
        const url = isCode 
            ? `https://restcountries.com/v3.1/alpha/${searchTerm}`
            : `https://restcountries.com/v3.1/name/${searchTerm}`;

        const response = await fetch(url);
        
        if (!response.ok) throw new Error('No countries found matching that name');

        const data = await response.json();
        
        // cache the results
        setCachedCountry(cacheKey, data);

        resultDiv.innerHTML = data.map(country => createCountryCard(country)).join('');

        updateStar();

        // update history and stars for each result
        data.forEach(country => {
            if (typeof saveSearch === "function") saveSearch(country.name.common);
            if (typeof updateStar === "function") updateStar(country.name.common);
        });

    } catch (error) {
        resultDiv.innerHTML = `<p class="error">Oops! ${error.message}. ✨</p>`;
    }
}

// helper function to generate the HTML for one card
function createCountryCard(country) {
    const currencies = country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A';
    const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
    const timezones = country.timezones ? country.timezones[0] : 'N/A';
    
    let bordersHTML = 'None';
    if (country.borders && country.borders.length > 0) {
        bordersHTML = country.borders.map(code => 
            `<span class="border-tag" tabindex="0" onclick="searchCountry('${code}', true)" onkeydown="handleBorderKeydown(event, '${code}')">${code}</span>`
        ).join(' ');
    }

    return `
        <div class="country-card">
            <img src="${country.flags.svg}" alt="Flag" class="flag">
            <h2>${country.flag || ''} ${country.name.common} 
                <span class="star" onclick="toggleStar('${country.name.common}', '${languages.replace(/'/g, "\\'")}')" data-country="${country.name.common}">☆</span>
            </h2>
            
            <div class="info-group"><strong>Official Name:</strong> ${country.name.official}</div>
            <div class="info-group"><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</div>
            <div class="info-group"><strong>Population:</strong> ${country.population.toLocaleString()}</div>
            <div class="info-group"><strong>Languages:</strong> ${languages}</div>
            <div class="info-group"><strong>Neighbors:</strong><br>${bordersHTML}</div>
            <div class="info-group">
                <a href="${country.maps.googleMaps}" target="_blank" style="color: var(--accent-pink); text-decoration: none; font-weight: bold;">
                    View Map ↗
                </a>
            </div>
        </div>
    `;
}

function handleBorderKeydown(event, code) {
    const borders = document.querySelectorAll('.border-tag');
    const currentIndex = Array.from(borders).indexOf(event.target);
    
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % borders.length;
        borders[nextIndex].focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + borders.length) % borders.length;
        borders[prevIndex].focus();
    } else if (event.key === 'Enter') {
        event.preventDefault();
        searchCountry(code, true);
    }
}

// event listener for enter key
document.querySelector('.country-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchCountry();
    }
});