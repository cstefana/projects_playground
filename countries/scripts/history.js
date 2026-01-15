// history functions
function saveSearch(term) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history.unshift(term);
    history = history.slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const list = document.querySelector('.history-list');
    list.innerHTML = '';
    history.forEach((term, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="history-term">${term}</span><button class="delete-btn" onclick="deleteHistory(${index})">×</button>`;
        li.querySelector('.history-term').onclick = () => {
            searchCountry(term);
            showHome();
        };
        list.appendChild(li);
    });
}

function deleteHistory(index) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    loadHistory();
}

function showHome() {
    document.getElementById('home').style.display = 'block';
    document.getElementById('history').style.display = 'none';
    document.getElementById('starred').style.display = 'none';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-btn:first-child').classList.add('active');
}

function showHistory() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('history').style.display = 'block';
    document.getElementById('starred').style.display = 'none';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-btn:nth-child(2)').classList.add('active');
    loadHistory();
}