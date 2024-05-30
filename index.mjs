import express from 'express';
import session from 'express-session';
import path from 'path';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';

// Your other imports...

const app = express();
const PORT = 3000;
const secretKey = 'your_secret_key';


// Configure express-session
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure option to false
}));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(express.json());
app.use(express.static(__dirname));



function createUserFolder(username) {
    const userFolderPath = path.join(__dirname, 'users_folders', username);
    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
        console.log(`Folder created for user: ${username}`);
    } else {
        console.log(`Folder already exists for user: ${username}`);
    }
}

// Middleware for token authentication
function authenticateToken(req, res, next) {
    const token = req.headers.cookie.split('=')[1];  // Retrieve token from cookies
    console.log("token");
    console.log(token);
    if (!token) return res.sendStatus(401);
    console.log("authenticateToken викликана");
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
                        const { username, email, firstName, surname } = user;
                        const accessToken = jwt.sign({ username, email, firstName, surname }, secretKey);
                        console.log('User token:', accessToken);
                        // Store token in localStorage
                        res.cookie('token', accessToken, { httpOnly: true });
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

const upload = multer({ dest: 'uploads/' });

app.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
    const file = req.file;
    const username = req.user.username;
    const userFolderPath = path.join(__dirname, 'users_folders', username);

    console.log('Received upload request:', file);
    const token = req.headers.authorization;
    console.log('Authorization header:', token);

    // Перевірка, чи користувач залогінений і чи він є в базі даних
    if (!req.user) {
        console.error('User is not logged in');
        return res.status(401).json({ message: 'User is not logged in' });
    }

    // Перевірка, чи існує папка користувача, якщо ні - створення нової
    if (!fs.existsSync(userFolderPath)) {
        console.log(`User folder not found for ${username}, creating new folder...`);
        fs.mkdirSync(userFolderPath, { recursive: true });
        console.log(`New folder created for ${username}`);
    }

    console.log('Request headers:', req.headers);

    fs.readFile(file.path, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ message: 'Error reading file' });
        }

        fs.writeFile(path.join(userFolderPath, file.originalname), data, (err) => {
            if (err) {
                console.error('Error saving file:', err);
                return res.status(500).json({ message: 'Error saving file' });
            }
            console.log('File saved successfully');
            res.json({ message: 'File saved successfully' });
        });
    });
});

// Protected route
app.get('/my_files', authenticateToken, (req, res) => {
    const username = req.user.username;
    const userFolderPath = path.join(__dirname, 'users_folders', username);

    if (!fs.existsSync(userFolderPath)) {
        return res.status(404).json({ message: 'User folder not found' });
    }

    fs.readdir(userFolderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading user folder' });
        }
        res.json({ files });
    });
});




// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
