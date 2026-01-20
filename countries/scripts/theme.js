// theme switcher functionality

// Initialize theme immediately (before DOMContentLoaded)
(function () {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    }
})();

// Set up event listeners after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    updateThemeButton(savedTheme);
});

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'light') {
        html.classList.add('light-theme');
    } else {
        html.classList.remove('light-theme');
    }

    localStorage.setItem('theme', theme);
    updateThemeButton(theme);
}

function updateThemeButton(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    if (theme === 'light') {
        themeToggle.textContent = '☀️';
        themeToggle.title = 'Switch to dark theme';
    } else {
        themeToggle.textContent = '🌙';
        themeToggle.title = 'Switch to light theme';
    }
}
