const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let entries = [];

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'src')));

// Create New Journal Entry
app.post('/api/entries', (req, res) => {
    const { title, date, content, category, mood, tags } = req.body;
    console.log('Received new entry:', { title, date, content, category, mood, tags }); // Log the received data
    if (!title || !date || !content || !category || !mood || !tags) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const newEntry = { id: Date.now(), title, date, content, category, mood, tags, isFavorite: false, archived: false, history: [] };
    entries.push(newEntry);
    console.log('Entries after adding new entry:', entries); // Log the entries array after adding the new entry
    res.status(201).json(newEntry);
});

// Update Entry
app.put('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, category, mood, tags } = req.body;
    const entry = entries.find(entry => entry.id == id);
    if (entry) {
        entry.history.push({ updatedAt: new Date(), title, content, category, mood, tags }); // Push the new state to history
        entry.title = title || entry.title;
        entry.content = content || entry.content;
        entry.category = category || entry.category;
        entry.mood = mood || entry.mood;
        entry.tags = tags || entry.tags;
        entry.history.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Sort history from newest to oldest
        res.json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

// Archive Entry
app.delete('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    const entry = entries.find(entry => entry.id == id);
    if (entry) {
        entry.archived = true;
        entry.isFavorite = false; // Ensure archived entries cannot be favorites
        res.json({ message: 'Entry archived', entry });
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

// Endpoint to delete all archived entries
app.delete('/api/archived', (req, res) => {
    const initialLength = entries.length;
    entries = entries.filter(entry => !entry.archived);
    const deletedCount = initialLength - entries.length;
    res.json({ message: `All archived entries have been deleted. ${deletedCount} entries removed.` });
});

// Fetch Archived Entries
app.get('/api/archived', (req, res) => {
    const archivedEntries = entries.filter(entry => entry.archived);
    res.json(archivedEntries);
});

// Toggle Favorite
app.patch('/api/entries/:id/favorite', (req, res) => {
    const { id } = req.params;
    const entry = entries.find(entry => entry.id == id);
    if (entry) {
        if (entry.archived) {
            return res.status(400).json({ error: 'Archived entries cannot be marked as favorite' });
        }
        entry.isFavorite = !entry.isFavorite;
        console.log('Updated entry:', entry); // updated entry
        res.json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

// Fetch Analytics
app.get('/api/analytics', (req, res) => {
    const totalEntries = entries.filter(entry => !entry.archived).length;
    const favoriteCount = entries.filter(entry => entry.isFavorite && !entry.archived).length;
    const archivedCount = entries.filter(entry => entry.archived).length;
    res.json({ totalEntries, favoriteCount, archivedCount });
});

// Fetch Entries
app.get('/api/entries', (req, res) => {
    res.json(entries);
});

// Fetch Single Entry
app.get('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    const entry = entries.find(entry => entry.id == id);
    if (entry) {
        res.json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
