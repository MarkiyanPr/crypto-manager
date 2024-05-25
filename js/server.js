const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const userDir = path.join(__dirname, 'user_folders', username);

    try {
        await fs.ensureDir(userDir);
        const userData = { email, password };
        await fs.writeJson(path.join(userDir, 'user.json'), userData);

        res.status(201).json({ message: 'Registration successful!' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
