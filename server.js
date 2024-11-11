const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware that serves files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// API test route
app.get('/api/message', (req, res) => {
    res.json({ message: 'Welcome to the Simple Journal App API!' });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
