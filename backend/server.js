const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

dotenv.config();
const app = express();
const cacheDir = path.join(__dirname, 'cache');
const PORT = 3000;

if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

let users = [];

app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false, // Для разработки на localhost
      httpOnly: true,
      sameSite: 'lax'
  }
}));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Пользователь уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword };
    users.push(newUser);

    req.session.user = { username };
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован!' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { username };
        res.json({ message: 'Вход выполнен успешно!' });
    } else {
        res.status(401).json({ message: 'Неверные учетные данные' });
    }
});

app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'profile.html'));
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Ошибка выхода');
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
  });
});

app.get('/data', (req, res) => {
    const data = getCachedData('api_data');
    res.json(data);
});

function getCachedData(key, ttlSeconds = 60) {
    const cacheFile = path.join(cacheDir, `${key}.json`);

    if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const now = new Date().getTime();
        const fileAge = (now - stats.mtimeMs) / 1000;

        if (fileAge < ttlSeconds) {
            const cachedData = fs.readFileSync(cacheFile, 'utf-8');
            return JSON.parse(cachedData);
        }
    }

    const randomString = Math.random().toString(36).substring(2, 15);
    const newData = {
        items: randomString,
        timestamp: Date.now(),
        source: 'Файловый кэш'
    };

    fs.writeFileSync(cacheFile, JSON.stringify(newData));

    setTimeout(() => {
        if (fs.existsSync(cacheFile)) {
            fs.unlinkSync(cacheFile);
        }
    }, ttlSeconds * 1000);

    return newData;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Кэш хранится в папке:', cacheDir);
});
