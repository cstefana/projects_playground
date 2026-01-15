async function searchCountry(queryParam = null, isCode = false) {
    const input = document.querySelector('.country-input');
    // if queryParam is provided from a click in the web page, use it
    // otherwise, take from input box
    const searchTerm = queryParam || input.value.trim();
    const resultDiv = document.querySelector('.result');
    
    if (!searchTerm) {
        resultDiv.innerHTML = `<p class="error">Please enter a country name.</p>`;
        return;
    }

    resultDiv.innerHTML = `<p style="color: var(--primary-purple)">Searching for ${searchTerm}...</p>`;

    try {

        const url = isCode 
            ? `https://restcountries.com/v3.1/alpha/${searchTerm}`
            : `https://restcountries.com/v3.1/name/${searchTerm}?fullText=true`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Country not found');
        }

        const data = await response.json();
        const country = data[0];
        let bordersHTML = 'none';
        if (country.borders && country.borders.length > 0) {
            bordersHTML = country.borders.map(code => 
                `<span class="border-tag" onclick="searchCountry('${code}', true)">${code}</span>`
            ).join(' ');
        }

        const currencies = country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A';
        const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
        const timezones = country.timezones.join(', ');

        resultDiv.innerHTML = `
            <div class="country-card">
                <img src="${country.flags.svg}" alt="Flag" class="flag">
                <h2>${country.flag} ${country.name.common}</h2>
                <div class="star-container"><span class="star" onclick="toggleStar('${country.name.common}', '${languages.replace(/'/g, "\\'")}')" style="color: ${isStarred('${country.name.common}') ? '#ffd700' : '#ccc'};">${isStarred('${country.name.common}') ? '★' : '☆'}</span></div>
                
                <div class="info-group"><strong>Official Name:</strong> ${country.name.official}</div>
                <div class="info-group"><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</div>
                <div class="info-group"><strong>Region:</strong> ${country.region}</div>
                <div class="info-group"><strong>Population:</strong> ${country.population.toLocaleString()}</div>
                <div class="info-group"><strong>Languages:</strong> ${languages}</div>
                <div class="info-group"><strong>Currency:</strong> ${currencies}</div>
                <div class="info-group"><strong>Neighbors:</strong><br>${bordersHTML}</div>
                <div class="info-group"><strong>Timezones:</strong> ${timezones}</div>
                <div class="info-group">
                    <strong>See on Map:</strong> 
                    <a href="${country.maps.googleMaps}" target="_blank" style="color: var(--accent-pink); text-decoration: none;">Open Google Maps ↗</a>
                </div>
            </div>
        `;

        // clear input after search if it was a manual search
        if(!isCode) input.value = "";

        // save to history
        saveSearch(country.name.common);

    } catch (error) {
        resultDiv.innerHTML = `<p class="error">Oops! ${error.message}. Try again.</p>`;
    }
}
// use an event listener to trigger search on enter key press
document.querySelector('.country-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchCountry();
    }
});