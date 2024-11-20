document.addEventListener('DOMContentLoaded', () => {
    const entriesDiv = document.querySelector('#entries');
    const totalEntriesSpan = document.querySelector('#total-entries');
    const favoriteCountSpan = document.querySelector('#favorite-count');
    const newEntryForm = document.querySelector('#new-entry-form');
    const searchInput = document.querySelector('#search');
    const filterSelect = document.querySelector('#filter');
    const sortSelect = document.querySelector('#sort');

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
            let filteredEntries = data;

            if (filter) {
                if (filter === 'recent') {
                    filteredEntries = data.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
                } else if (filter === 'favorites') {
                    filteredEntries = data.filter(entry => entry.isFavorite);
                } else if (filter === 'categories') {
                    // No additional filtering needed for categories
                } else if (filter === 'all') {
                    // No additional filtering needed for all entries
                }
            }

            displayEntries(filteredEntries);
        }
    };

    // Fetch analytics from the server
    const fetchAnalytics = async () => {
        if (totalEntriesSpan && favoriteCountSpan) {
            const data = await fetchData('/api/analytics');
            totalEntriesSpan.textContent = data.totalEntries;
            favoriteCountSpan.textContent = data.favoriteCount;
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
                    <button class="border-2 bg-blue-500 text-white p-2 rounded-full" onclick="toggleFavorite(${entry.id})">${entry.isFavorite ? 'Unfavorite' : 'Favorite'}</button>
                    <button class="border-2 bg-red-500 text-white p-2 rounded-full ml-2" onclick="deleteEntry(${entry.id})">Delete</button>
                `;
                entriesDiv.appendChild(entryDiv);
            });
        }
    };

    // Toggle favorite status
    window.toggleFavorite = async (id) => {
        console.log(`Toggling favorite status for entry with ID: ${id}`);
        const response = await fetchData(`/api/entries/${id}/favorite`, 'PATCH');
        console.log('Response from server:', response); // Log the response from the server
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'favorites.html') {
            fetchEntries('favorites');
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

    // Handle new entry form submission
    if (newEntryForm) {
        newEntryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.querySelector('#title').value;
            const date = document.querySelector('#date').value;
            const content = document.querySelector('#content').value;
            const category = document.querySelector('#category').value;
            console.log('Submitting new entry:', { title, date, content, category }); // Log the data being submitted
            const response = await fetchData('/api/entries', 'POST', { title, date, content, category });
            console.log('Response from server:', response); // Log the response from the server
            fetchEntries();
            fetchAnalytics();
            newEntryForm.reset();
        });
    }

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
            if (filterSelect.value !== 'all') {
                filteredEntries = filteredEntries.filter(entry =>
                    filterSelect.value === 'favorites' ? entry.isFavorite : entry.archived
                );
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
        filterSelect.addEventListener('change', handleSearchFilterSort);
        sortSelect.addEventListener('change', handleSearchFilterSort);
    }

    fetchEntries();
    fetchAnalytics();
});

// console.log('Hello from script.js!');