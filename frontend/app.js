document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        const mes = document.getElementById('registerMessage');
        mes.style.display = 'block';
        mes.textContent = result.message || 'Ошибка при регистрации';

        if (response.ok) {
            window.location.href = '/profile';
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        const result = await response.json();
        if (response.ok) {
            const mes = document.getElementById('loginMessage');
            mes.style.display = 'block';
            mes.textContent = result.message || 'Вход выполнен успешно!';
            window.location.href = '/profile';
        } else {
            const mes = document.getElementById('loginMessage');
            mes.style.display = 'block';
            mes.textContent = result.message || 'Ошибка при входе';
        }
    });

    document.getElementById('toggle-theme').addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const themeButton = document.getElementById('toggle-theme');
        themeButton.textContent = newTheme === 'light' ? '🌞' : '🌜';
    });

    function loadTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', theme);

        const themeButton = document.getElementById('toggle-theme');
        themeButton.textContent = theme === 'light' ? '🌞' : '🌜';
    }

    loadTheme();
});
