import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userFilesFolder = path.join(__dirname, 'user_files');

const app = express();
const PORT = 3000;
const secretKey = 'your_secret_key';

app.use(express.json());
app.use(express.static(__dirname));

// Function to create user folder
function createUserFolder(username) {
    const userFolderPath = path.join(__dirname, 'users folders', username);
    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
        console.log(`Folder created for user: ${username}`);
    } else {
        console.log(`Folder already exists for user: ${username}`);
    }
}

// Middleware for token authentication
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

// Handler for registration
app.post('/register', async (req, res) => {
    const { username, firstname, surname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Registering user: ${username}, first name: ${firstname}, surname: ${surname}, email: ${email}, hashedPassword: ${hashedPassword}`);

    function saveUserToDatabase(username, firstname, surname, email, hashedPassword) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('database.db');
            const query = `INSERT INTO users (username, password, email, firstName, surname) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [username, hashedPassword ,email, firstname, surname ], (error) => {
                db.close();
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    saveUserToDatabase(username, firstname, surname, email, hashedPassword)
        .then(() => {
            createUserFolder(username);
            res.json({ message: 'Registration successful!' });
        })
        .catch(error => {
            console.error('Error saving user:', error);
            res.status(500).json({ message: 'Registration error. Please try again later.' });
        });
});

// Handler for login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Attempting login for user: ${username}`);

    function checkUserInDatabase(username) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('database.db');
            const query = `SELECT * FROM users WHERE username = ?`;
            db.get(query, [username], (error, row) => {
                db.close();
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    }

    checkUserInDatabase(username)
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        res.status(500).json({ message: 'Error checking user. Please try again later.' });
                    } else if (isMatch) {
                        const { username, email, firstName, surname } = user; // Destructure the user object
                        const accessToken = jwt.sign({ username, email, firstName, surname }, secretKey); // Include firstname and surname in the token payload
                        console.log('User token:', accessToken); // Logging the token here
                        res.json({ accessToken });
                    } else {
                        res.status(401).json({ message: 'Invalid username or password' });
                    }
                });
            } else {
                res.status(401).json({ message: 'Invalid username or password' });
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'Error checking user. Please try again later.' });
        });
});

app.get('/user', authenticateToken, (req, res) => {
    const user = req.user; // User information is stored in req.user after authentication
    res.json({ user });
});

app.post('/upload', authenticateToken, (req, res) => {
    const { file } = req.body; // Припустимо, що файл передається у тілі запиту
    const username = req.user.username; // Отримання імені користувача з токену
    const userFolderPath = path.join(__dirname, 'users_folders', username);

    // Перевірка існування папки користувача і створення, якщо її не існує
    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
    }

    // Збереження файлу у папці користувача
    fs.writeFile(path.join(userFolderPath, file.name), file.data, (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).json({ message: 'Error saving file' });
        }
        console.log('File saved successfully');
        res.json({ message: 'File saved successfully' });
    });
});

// Protected route
app.get('/my_files', authenticateToken, (req, res) => {
    res.json({ message: `Welcome, ${req.user.username}! Here are your files.` });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
