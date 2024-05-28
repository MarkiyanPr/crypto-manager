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
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Registering user: ${username}, email: ${email}, hashedPassword: ${hashedPassword}`);

    function saveUserToDatabase(username, email, hashedPassword) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('database.db');
            const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
            db.run(query, [username, email, hashedPassword], (error) => {
                db.close();
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    saveUserToDatabase(username, email, hashedPassword)
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
    console.log(`Attempting login for user: ${username}, password: ${password}`);
    console.log('Request body:', req.body);

    function checkUserInDatabase(username) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database('database.db');
            const query = `SELECT * FROM users WHERE username = ?`;
            db.get(query, [username], (error, row) => {
                db.close();
                if (error) {
                    reject(error);
                } else {
                    console.log('User found:', row);  // Додайте це логування
                    resolve(row);
                }
            });
        });
    }

    checkUserInDatabase(username)
        .then(user => {
            if (user) {
                console.log(`User found: ${user.username}, comparing password...`);
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        res.status(500).json({ message: 'Error checking user. Please try again later.' });
                    } else if (isMatch) {
                        console.log('Password match successful');
                        const accessToken = jwt.sign({ username: user.username }, secretKey);
                        res.json({ accessToken });
                    } else {
                        console.log('Password does not match');
                        res.status(401).json({ message: 'Invalid username or password' });
                    }
                });
            } else {
                console.log('User not found');
                res.status(401).json({ message: 'Invalid username or password' });
            }
        })
        .catch(error => {
            console.error('Error checking user:', error);
            res.status(500).json({ message: 'Error checking user. Please try again later.' });
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
