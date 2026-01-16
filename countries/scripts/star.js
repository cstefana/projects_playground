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

function updateStar(countryName) {
    const star = document.querySelector('.star');
    if (star && star.getAttribute('data-country') === countryName) {
        star.textContent = isStarred(countryName) ? '★' : '☆';
        star.style.color = isStarred(countryName) ? '#ffd700' : '#ccc';
    }
}

function isStarred(countryName) {
    let starred = JSON.parse(localStorage.getItem('starredCountries')) || [];
    return starred.some(item => item.name === countryName);
}

function loadStarred() {
    const starred = JSON.parse(localStorage.getItem('starredCountries')) || [];
    const list = document.querySelector('.starred-list');
    list.innerHTML = '';
    starred.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<div><strong>${item.name}</strong><br>Languages: ${item.languages}</div><span class="star" onclick="toggleStar('${item.name}', '${item.languages}'); loadStarred(); updateStar('${item.name}');" style="color: #ffd700;">★</span>`;
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