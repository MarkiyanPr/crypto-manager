import express from 'express';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

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

// Обробник для POST-запиту на реєстрацію
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    function saveUserToDatabase(username, email, password) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('database.db');
            const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
            db.run(query, [username, email, password], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    saveUserToDatabase(username, email, password)
        .then(() => {
            createUserFolder(username); // Створюємо папку для користувача
            res.json({ message: 'Реєстрація успішна!' });
        })
        .catch(error => {
            console.error('Помилка збереження користувача:', error);
            res.status(500).json({ message: 'Помилка реєстрації. Будь ласка, спробуйте пізніше.' });
        });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
