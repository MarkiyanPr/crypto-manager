import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const secretKey = 'your_secret_key';

app.use(express.json());
app.use(express.static(__dirname));

// Функція для створення папки користувача
function createUserFolder(username) {
    const userFolderPath = path.join(__dirname, 'users folders', username);

    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
        console.log(`Folder created for user: ${username}`);
    } else {
        console.log(`Folder already exists for user: ${username}`);
    }
}

// Middleware для аутентифікації токену
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

// Функція для хешування паролю
async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

// Функція для перевірки хешу пароля
async function comparePasswords(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

// Функція для збереження користувача в базу даних
async function saveUserToDatabase(username, email, password) {
    const db = new sqlite3.Database('database.db');
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(query, [username, email, password], (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// Обробник для POST-запиту на реєстрацію
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        await saveUserToDatabase(username, email, hashedPassword);
        createUserFolder(username); // Створюємо папку для користувача
        res.json({ message: 'Реєстрація успішна!' });
    } catch (error) {
        console.error('Помилка збереження користувача:', error);
        res.status(500).json({ message: 'Помилка реєстрації. Будь ласка, спробуйте пізніше.' });
    }
});



// Обробник для POST-запиту на вхід
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await checkUserInDatabase(username);
        if (user) {
            console.log(user);
            const passwordMatch = await comparePasswords(password, user.password);
            if (passwordMatch) {
                const accessToken = jwt.sign({ username: user.username }, secretKey);
                res.json({ accessToken });
            } else {
                res.status(401).json({ message: 'Неправильний логін або пароль' });
            }
        } else {
            res.status(401).json({ message: 'Неправильний логін або пароль' });
        }
    } catch (error) {
        console.error('Помилка перевірки користувача:', error);
        res.status(500).json({ message: 'Помилка перевірки користувача. Будь ласка, спробуйте пізніше.' });
    }
});

// Функція для перевірки користувача в базі даних
async function checkUserInDatabase(username) {
    const db = new sqlite3.Database('database.db');
    const query = `SELECT * FROM users WHERE username = ?`;
    console.log(query);
    return new Promise((resolve, reject) => {
        db.get(query, [username], (error, row) => {
            if (error) {
                reject(error);
                
            } else {
                resolve(row);
                
            }
        });
    });
}

// Захищений маршрут
app.get('/my_files', authenticateToken, (req, res) => {
    // Доступні тільки авторизованим користувачам
    res.json({ message: `Welcome, ${req.user.username}! Here are your files.` });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
