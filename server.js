const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const entriesFilePath = path.join(__dirname, 'entries.json');

// Helper function to read entries from the JSON file
const readEntries = () => {
    if (fs.existsSync(entriesFilePath)) {
        const data = fs.readFileSync(entriesFilePath);
        return JSON.parse(data);
    }
    return [];
};

// Helper function to write entries to the JSON file
const writeEntries = (entries) => {
    fs.writeFileSync(entriesFilePath, JSON.stringify(entries, null, 2));
};

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'src')));

// Helper function to find entry by ID
const findEntryById = (id) => {
    const entries = readEntries();
    return entries.find(entry => entry.id == id);
};

// Create New Journal Entry
app.post('/api/entries', (req, res) => {
    const { title, date, content, category } = req.body;
    console.log('Received new entry:', { title, date, content, category }); // Log the received data
    if (!title || !date || !content || !category) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const newEntry = { id: Date.now(), title, date, content, category, isFavorite: false, tags: [], archived: false, history: [] };
    const entries = readEntries();
    entries.push(newEntry);
    writeEntries(entries);
    console.log('Entries after adding new entry:', entries); // Log the entries array after adding the new entry
    res.status(201).json(newEntry);
});

// Update Entry
app.put('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const entries = readEntries();
    const entry = entries.find(entry => entry.id == id);
    if (entry) {
        entry.history.push({ updatedAt: new Date(), title: entry.title, content: entry.content, category: entry.category });
        entry.title = title || entry.title;
        entry.content = content || entry.content;
        entry.category = category || entry.category;
        writeEntries(entries);
        res.json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

// Archive Entry
app.delete('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    let entries = readEntries();
    const entryIndex = entries.findIndex(entry => entry.id == id);
    if (entryIndex !== -1) {
        entries.splice(entryIndex, 1);
        writeEntries(entries);
        res.json({ message: 'Entry deleted' });
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

// Toggle Favorite
app.patch('/api/entries/:id/favorite', (req, res) => {
    const { id } = req.params;
    const entries = readEntries();
    const entry = entries.find(entry => entry.id == id);
    if (entry) {
        entry.isFavorite = !entry.isFavorite;
        writeEntries(entries);
        console.log('Updated entry:', entry); // Log the updated entry
        res.json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

// Fetch Analytics
app.get('/api/analytics', (req, res) => {
    const entries = readEntries();
    const totalEntries = entries.length;
    const favoriteCount = entries.filter(entry => entry.isFavorite).length;
    res.json({ totalEntries, favoriteCount });
});

// Fetch Entries
app.get('/api/entries', (req, res) => {
    const entries = readEntries();
    res.json(entries);
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
