// star functions
function toggleStar(countryName, languages) {
    let starred = JSON.parse(localStorage.getItem('starredCountries')) || [];
    const index = starred.findIndex(item => item.name === countryName);
    if (index > -1) {
        starred.splice(index, 1);
    } else {
        starred.push({ name: countryName, languages: languages });
    }
    localStorage.setItem('starredCountries', JSON.stringify(starred));
    updateStar(countryName);
}

function updateStar(countryName = null) {
    // select all stars on the page 
    const stars = document.querySelectorAll('.star');
    
    stars.forEach(star => {
        const countryAttribute = star.getAttribute('data-country');
        
        // if we provided a specific name, only update that one. 
        // otherwise, update every star based on its own data-country attribute.
        if (!countryName || countryAttribute === countryName) {
            const starredStatus = isStarred(countryAttribute);
            star.textContent = starredStatus ? '★' : '☆';
            star.style.color = starredStatus ? '#ffd700' : '#ccc';
        }
    });
}

function isStarred(countryName) {
    let starred = JSON.parse(localStorage.getItem('starredCountries')) || [];
    return starred.some(item => item.name === countryName);
}

function loadStarred() {
    const starred = JSON.parse(localStorage.getItem('starredCountries')) || [];
    const list = document.querySelector('.starred-list');
    list.innerHTML = '';
    starred.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'starred-item';
        li.innerHTML = `
            <div class="starred-header">
                <div class="starred-info">
                    <strong>${item.name}</strong><br>Languages: ${item.languages}
                </div>
                <div class="starred-actions">
                    <button class="expand-btn" onclick="expandCountry('${item.name}', this)">▼</button>
                    <span class="star" onclick="toggleStar('${item.name}', '${item.languages}'); loadStarred();" style="color: #f9e2af;">★</span>
                </div>
            </div>
            <div class="starred-details" style="display: none;"></div>
        `;
        list.appendChild(li);
    });
}

function showStarred() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('history').style.display = 'none';
    document.getElementById('starred').style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-btn:nth-child(3)').classList.add('active');
    loadStarred();
}

async function expandCountry(countryName, button) {
    const detailsDiv = button.closest('.starred-item').querySelector('.starred-details');
    
    // Toggle expand/collapse
    if (detailsDiv.style.display === 'none') {
        // Expanding
        button.textContent = '▲';
        detailsDiv.style.display = 'block';
        detailsDiv.innerHTML = '<p style="color: #a6adc8;">Loading...</p>';
        
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
            if (!response.ok) throw new Error('Failed to fetch');
            
            const data = await response.json();
            const country = data[0];
            
            const continents = country.continents ? country.continents.join(', ') : 'N/A';
            const area = country.area ? `${country.area.toLocaleString()} km²` : 'N/A';
            const subregion = country.subregion || 'N/A';
            const landlocked = country.landlocked ? 'Yes' : 'No';
            const independent = country.independent ? 'Yes' : 'No';
            const unMember = country.unMember ? 'Yes' : 'No';
            const gini = country.gini ? Object.entries(country.gini).map(([year, value]) => `${year}: ${value}`).join(', ') : 'N/A';
            const tld = country.tld ? country.tld.join(', ') : 'N/A';
            const carSide = country.car ? country.car.side : 'N/A';
            const fifa = country.fifa || 'N/A';
            const idd = country.idd ? (country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '')) : 'N/A';
            
            let neighbors = 'None (Island)';
            if (country.borders && country.borders.length > 0) {
                neighbors = country.borders.map(code => 
                    `<span class="border-tag" onclick="searchCountry('${code}', true)">${code}</span>`
                ).join(' ');
            }
            
            detailsDiv.innerHTML = `
                <div class="expanded-details">
                    <div class="detail-row"><strong>Subregion:</strong> ${subregion}</div>
                    <div class="detail-row"><strong>Continents:</strong> ${continents}</div>
                    <div class="detail-row"><strong>Area:</strong> ${area}</div>
                    <div class="detail-row"><strong>Landlocked:</strong> ${landlocked}</div>
                    <div class="detail-row"><strong>Independent:</strong> ${independent}</div>
                    <div class="detail-row"><strong>UN Member:</strong> ${unMember}</div>
                    <div class="detail-row"><strong>Driving Side:</strong> ${carSide}</div>
                    <div class="detail-row"><strong>Dialing Code:</strong> ${idd}</div>
                    <div class="detail-row"><strong>Top Level Domain:</strong> ${tld}</div>
                    <div class="detail-row"><strong>FIFA Code:</strong> ${fifa}</div>
                    <div class="detail-row"><strong>Gini Index:</strong> ${gini}</div>
                </div>
            `;
        } catch (error) {
            detailsDiv.innerHTML = '<p style="color: #f38ba8;">Failed to load details</p>';
        }
    } else {
        // collapsing
        button.textContent = '▼';
        detailsDiv.style.display = 'none';
    }
}