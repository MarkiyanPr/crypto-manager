import express from 'express';
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
            res.json({ message: 'Реєстрація успішна!' });
        })
        .catch(error => {
            console.error('Помилка збереження користувача:', error);
            res.status(500).json({ message: 'Помилка реєстрації. Будь ласка, спробуйте пізніше.' });
        });
});

// Обробник для POST-запиту на вхід
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Тут потрібно додати логіку для перевірки користувача в базі даних
    // Наприклад, ви можете викликати функцію для перевірки користувача, передавши дані, які ви отримали з тіла запиту

    function checkUserInDatabase(username, password) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('database.db');
            const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
            db.get(query, [username, password], (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    }

    checkUserInDatabase(username, password)
        .then(row => {
            if (row) {
                res.json({ message: 'Успішний вхід!' });
            } else {
                res.status(401).json({ message: 'Неправильний логін або пароль' });
            }
        })
        .catch(error => {
            console.error('Помилка перевірки користувача:', error);
            res.status(500).json({ message: 'Помилка перевірки користувача. Будь ласка, спробуйте пізніше.' });
        });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});