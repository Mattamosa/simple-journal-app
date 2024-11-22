document.addEventListener('DOMContentLoaded', () => {
    const entriesDiv = document.querySelector('#entries');
    const totalEntriesSpan = document.querySelector('#total-entries');
    const favoriteCountSpan = document.querySelector('#favorite-count');
    const archivedCountSpan = document.querySelector('#archived-count'); // Add this line
    const newEntryForm = document.querySelector('#new-entry-form');
    const editEntryForm = document.querySelector('#edit-entry-form');
    const searchInput = document.querySelector('#search');
    const filterSelect = document.querySelector('#filter');
    const sortSelect = document.querySelector('#sort');
    const fontSizeSelect = document.querySelector('#font-size');
    const moodSelect = document.querySelector('#mood');
    const tagsInput = document.querySelector('#tags');

    // Fetch data from the server
    const fetchData = async (url, method = 'GET', body = null) => {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error('Failed to fetch data:', response.statusText);
            return [];
        }
        return response.json();
    };

    // Fetch entries from the server
    window.fetchEntries = async (filter = null) => {
        if (entriesDiv) {
            const data = await fetchData('/api/entries');
            let filteredEntries = data.filter(entry => !entry.archived); // Exclude archived entries by default

            if (filter) {
                if (filter === 'recent') {
                    filteredEntries = filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
                } else if (filter === 'favorites') {
                    filteredEntries = filteredEntries.filter(entry => entry.isFavorite);
                } else if (filter === 'archived') {
                    filteredEntries = data.filter(entry => entry.archived); // Include only archived entries
                } else if (filter === 'categories') {
                    // No additional filtering needed for categories
                } else if (filter === 'all') {
                    filteredEntries = data.filter(entry => !entry.archived); // Exclude archived entries
                }
            }

            displayEntries(filteredEntries);
        }
    };

    // Fetch analytics from the server
    window.fetchAnalytics = async () => {
        if (totalEntriesSpan && favoriteCountSpan && archivedCountSpan) { // Update this line
            const data = await fetchData('/api/analytics');
            totalEntriesSpan.textContent = data.totalEntries;
            favoriteCountSpan.textContent = data.favoriteCount;
            archivedCountSpan.textContent = data.archivedCount; // Add this line
        }
    };

    // Display entries
    const displayEntries = (entries) => {
        if (entriesDiv) {
            entriesDiv.innerHTML = '';
            entries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'entry p-4 m-4 bg-white rounded-lg shadow-lg border border-gray-200 bg-red-300 rounded-xl'; // Journal entry div styling
                entryDiv.innerHTML = `
                    <h3 class="text-2xl font-bold mb-2">${entry.title}</h3>
                    <p class="text-gray-500 mb-4">${entry.date}</p>
                    <p class="text-gray-700 mb-4">${entry.content}</p>
                    <p class="text-gray-600 mb-4">Category: ${entry.category}</p>
                    <p class="text-gray-600 mb-4">Mood: ${entry.mood}</p>
                    <p class="text-gray-600 mb-4">Tags: ${entry.tags.join(', ')}</p>
                    <button class="border-2 bg-blue-500 text-white p-2 rounded-full" onclick="toggleFavorite(${entry.id})">${entry.isFavorite ? 'Unfavorite' : 'Favorite'}</button>
                    <button class="border-2 bg-red-500 text-white p-2 rounded-full ml-2" onclick="deleteEntry(${entry.id})">Delete</button>
                    <button class="border-2 bg-yellow-500 text-white p-2 rounded-full ml-2" onclick="editEntry(${entry.id})">Edit</button>
                    <div class="history mt-4">
                        <h4 class="text-xl font-bold mb-2">Edit History</h4>
                        <ul>
                            ${entry.history.map(h => `<li>${new Date(h.updatedAt).toLocaleString()} - ${h.title}</li>`).join('')}
                        </ul>
                    </div>
                `;
                entriesDiv.appendChild(entryDiv);
            });
        }
    };

    // Edit entry
    window.editEntry = async (id) => {
        const entry = await fetchData(`/api/entries/${id}`);
        if (entry) {
            document.querySelector('#title').value = entry.title;
            document.querySelector('#date').value = entry.date;
            document.querySelector('#content').value = entry.content;
            document.querySelector('#category').value = entry.category;
            moodSelect.value = entry.mood;
            tagsInput.value = entry.tags.join(', ');

            editEntryForm.onsubmit = async (e) => {
                e.preventDefault();
                const title = document.querySelector('#title').value;
                const date = document.querySelector('#date').value;
                const content = document.querySelector('#content').value;
                const category = document.querySelector('#category').value;
                const mood = moodSelect.value;
                const tags = tagsInput.value.split(',').map(tag => tag.trim());
                console.log('Updating entry:', { title, date, content, category, mood, tags }); // Log the data being submitted
                const response = await fetchData(`/api/entries/${id}`, 'PUT', { title, date, content, category, mood, tags });
                console.log('Response from server:', response); // Log the response from the server
                fetchEntries();
                fetchAnalytics();
                editEntryForm.reset();
            };
        }
    };

    // Handle new entry form submission
    const handleNewEntrySubmit = async (e) => {
        e.preventDefault();
        const title = document.querySelector('#title').value;
        const date = document.querySelector('#date').value;
        const content = document.querySelector('#content').value;
        const category = document.querySelector('#category').value;
        const mood = moodSelect.value;
        const tags = tagsInput.value.split(',').map(tag => tag.trim());
        console.log('Submitting new entry:', { title, date, content, category, mood, tags }); // Log the data being submitted
        const response = await fetchData('/api/entries', 'POST', { title, date, content, category, mood, tags });
        console.log('Response from server:', response); // Log the response from the server
        fetchEntries();
        fetchAnalytics();
        newEntryForm.reset();
    };

    if (newEntryForm) {
        newEntryForm.addEventListener('submit', handleNewEntrySubmit);
    }

    // Toggle favorite status
    window.toggleFavorite = async (id) => {
        console.log(`Toggling favorite status for entry with ID: ${id}`);
        const response = await fetchData(`/api/entries/${id}/favorite`, 'PATCH');
        console.log('Response from server:', response); // Log the response from the server
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'favorites.html') {
            fetchEntries('favorites');
        } else if (currentPage === 'archived.html') {
            fetchEntries('archived');
        } else {
            fetchEntries();
        }
        fetchAnalytics();
    };

    // Delete entry
    window.deleteEntry = async (id) => {
        console.log(`Deleting entry with ID: ${id}`);
        const response = await fetchData(`/api/entries/${id}`, 'DELETE');
        console.log('Response from server:', response); // Log the response from the server
        fetchEntries();
        fetchAnalytics();
    };

    // Handle search, filter, and sort
    if (searchInput || filterSelect || sortSelect) {
        const handleSearchFilterSort = async () => {
            const data = await fetchData('/api/entries');
            let filteredEntries = data;

            // Filter by search
            if (searchInput.value) {
                const searchTerm = searchInput.value.toLowerCase();
                filteredEntries = filteredEntries.filter(entry =>
                    entry.title.toLowerCase().includes(searchTerm) ||
                    entry.date.includes(searchTerm)
                );
            }

            // Filter by category
            if (filterSelect.value === 'favorites') {
                filteredEntries = filteredEntries.filter(entry => entry.isFavorite);
            } else if (filterSelect.value === 'archived') {
                filteredEntries = data.filter(entry => entry.archived); // Include only archived entries
            } else {
                filteredEntries = filteredEntries.filter(entry => !entry.archived); // Exclude archived entries
            }

            // Sort entries
            if (sortSelect.value === 'date') {
                filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else if (sortSelect.value === 'title') {
                filteredEntries.sort((a, b) => a.title.localeCompare(b.title));
            }

            displayEntries(filteredEntries);
        };

        searchInput.addEventListener('input', handleSearchFilterSort);
        filterSelect.addEventListener('change', () => {
            localStorage.setItem('selectedFilter', filterSelect.value);
            handleSearchFilterSort();
        });
        sortSelect.addEventListener('change', handleSearchFilterSort);
    }

    // Handle font size adjustment
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', () => {
            document.body.style.fontSize = fontSizeSelect.value;
            localStorage.setItem('fontSize', fontSizeSelect.value);
        });
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            document.body.style.fontSize = savedFontSize;
            fontSizeSelect.value = savedFontSize;
        }
    }

    fetchAnalytics();
});