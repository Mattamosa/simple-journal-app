document.addEventListener("DOMContentLoaded", () => {
  const entriesDiv = document.querySelector("#entries");
  const totalEntriesSpan = document.querySelector("#total-entries");
  const favoriteCountSpan = document.querySelector("#favorite-count");
  const archivedCountSpan = document.querySelector("#archived-count");
  const newEntryForm = document.querySelector("#new-entry-form");
  const editEntryForm = document.querySelector("#edit-entry-form");
  const searchInput = document.querySelector("#search");
  const filterSelect = document.querySelector("#filter");
  const sortSelect = document.querySelector("#sort");
  const fontSizeSelect = document.querySelector("#font-size");
  const moodSelect = document.querySelector("#mood");
  const tagsInput = document.querySelector("#tags");

  // Fetch data from the server
  const fetchData = async (url, method = "GET", body = null) => {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to fetch data:", response.statusText);
      return [];
    }
    return response.json();
  };

  // Fetch entries from the server
  window.fetchEntries = async (filter = null) => {
    if (entriesDiv) {
      const data = await fetchData("/api/entries");
      let filteredEntries = data.filter((entry) => !entry.archived); // Exclude archived entries by default

      if (filter) {
        if (filter === "recent") {
          filteredEntries = filteredEntries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        } else if (filter === "favorites") {
          filteredEntries = filteredEntries.filter((entry) => entry.isFavorite);
        } else if (filter === "archived") {
          filteredEntries = data.filter((entry) => entry.archived); // only archived entries
        } else if (filter === "categories") {
        } else if (filter === "all") {
          filteredEntries = data.filter((entry) => !entry.archived); // Exclude archived entries
        }
      }

      displayEntries(filteredEntries);
    }
  };


  // Function to fetch analytics from the server
  window.fetchAnalytics = async () => {
    if (totalEntriesSpan && favoriteCountSpan && archivedCountSpan) {
      try {
        const data = await fetchData("/api/analytics");
        totalEntriesSpan.textContent = data.totalEntries;
        favoriteCountSpan.textContent = data.favoriteCount;
        archivedCountSpan.textContent = data.archivedCount;
        console.log("Analytics fetched successfully:", data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
  };

  // Function to determine if the current page is index.html
  const isIndexPage = () =>
    window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

  // Fetch analytics when the page is loaded or shown
  const handlePageLoadOrShow = () => {
    if (isIndexPage()) {
      console.log("Landing on index.html. Fetching analytics.");
      fetchAnalytics();
    }
  };

  // Trigger analytics fetch on initial load
  document.addEventListener('DOMContentLoaded', handlePageLoadOrShow);

  // Trigger analytics fetch on page show (e.g., back/forward navigation)
  window.addEventListener('pageshow', handlePageLoadOrShow);

  // // Fetch analytics from the server
  // window.fetchAnalytics = async () => {
  //   if (totalEntriesSpan && favoriteCountSpan && archivedCountSpan) {
  //     const data = await fetchData("/api/analytics");
  //     totalEntriesSpan.textContent = data.totalEntries;
  //     favoriteCountSpan.textContent = data.favoriteCount;
  //     archivedCountSpan.textContent = data.archivedCount;
  //     fetchAnalytics(); <-- *Recursion Nightmare*
  //   }
  // };

  // Display entries
  const displayEntries = (entries) => {
    if (entriesDiv) {
      entriesDiv.innerHTML = "";
      entries.forEach((entry) => {
        const entryDiv = document.createElement("div");
        entryDiv.className =
          "entry p-4 m-4 bg-white rounded-lg shadow-lg border border-gray-200 rounded-xl"; // Journal entry div styling
        entryDiv.innerHTML = `
                    <div id="entry-view-${entry.id}">
                        <h3 class="text-2xl font-bold mb-2">${entry.title}</h3>
                        <p class="text-gray-500 mb-4">${entry.date}</p>
                        <p class="text-gray-700 mb-4">${entry.content}</p>
                        <p class="text-gray-600 mb-4">Category: ${
                          entry.category
                        }</p>
                        <p class="text-gray-600 mb-4">Mood: ${entry.mood}</p>
                        <p class="text-gray-600 mb-4">Tags: ${entry.tags.join(
                          ", "
                        )}</p>
                        <button class="border-2 bg-blue-500 text-white p-2 rounded-md px-6" onclick="toggleFavorite(${
                          entry.id
                        })">${
          entry.isFavorite ? "Unfavorite" : "Favorite"
        }</button>
                        
                        <button class="border-2 bg-yellow-500 text-white p-2 rounded-md ml-1 px-6" onclick="showEditForm(${
                          entry.id
                        })">Edit</button>
                        <button class="border-2 bg-red-500 text-white p-2 rounded-md ml-1 px-6" onclick="deleteEntry(${
                          entry.id
                        })">Delete</button>
                        <div class="history mt-4">
                            <h4 class="text-xl font-bold mb-2">Edit History</h4>
                            <ul>
                                ${entry.history
                                  .map(
                                    (h) =>
                                      `<li>${new Date(
                                        h.updatedAt
                                      ).toLocaleString()} - ${h.title}</li>`
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    </div>
                    <form id="edit-form-${
                      entry.id
                    }" style="display: none;" class="mt-4 space-y-4">
                        <input type="text" id="edit-title-${entry.id}" value="${
          entry.title
        }" class="w-full p-2 border rounded-md" />
                        <input type="date" id="edit-date-${entry.id}" value="${
          entry.date
        }" class="w-full p-2 border rounded-md" />
                        <textarea id="edit-content-${
                          entry.id
                        }" class="w-full p-2 border rounded-md">${
          entry.content
        }</textarea>
                        <select id="edit-category-${
                          entry.id
                        }" class="w-full p-2 border rounded-md">
                            <option value="work" ${
                              entry.category === "work" ? "selected" : ""
                            }>Work</option>
                            <option value="personal" ${
                              entry.category === "personal" ? "selected" : ""
                            }>Personal</option>
                            <option value="other" ${
                              entry.category === "other" ? "selected" : ""
                            }>Other</option>
                        </select>
                        <select id="edit-mood-${
                          entry.id
                        }" class="w-full p-2 border rounded-md">
                            <option value="happy" ${
                              entry.mood === "happy" ? "selected" : ""
                            }>Happy</option>
                            <option value="neutral" ${
                              entry.mood === "neutral" ? "selected" : ""
                            }>Neutral</option>
                            <option value="sad" ${
                              entry.mood === "sad" ? "selected" : ""
                            }>Sad</option>
                        </select>
                        <input type="text" placeholder="Tags" id="edit-tags-${
                          entry.id
                        }" value="${entry.tags.join(
          ", "
        )}" class="w-full p-2 border rounded-md" />
                        <button type="button" class="w-full bg-green-600 text-white p-2 rounded-md" onclick="submitEditForm(${
                          entry.id
                        })">Save</button>
                        <button type="button" class="w-full bg-rose-500 text-white p-2 rounded-md" onclick="hideEditForm(${
                          entry.id
                        })">Cancel</button>
                    </form>
                `;
        entriesDiv.appendChild(entryDiv);
      });
    }
  };

  // Show edit form
  window.showEditForm = (id) => {
    document.getElementById(`entry-view-${id}`).style.display = "none";
    document.getElementById(`edit-form-${id}`).style.display = "block";
  };

  // Hide edit form
  window.hideEditForm = (id) => {
    document.getElementById(`entry-view-${id}`).style.display = "block";
    document.getElementById(`edit-form-${id}`).style.display = "none";
  };

  // Submit edit form
  window.submitEditForm = async (id) => {
    const title = document.getElementById(`edit-title-${id}`).value;
    const date = document.getElementById(`edit-date-${id}`).value;
    const content = document.getElementById(`edit-content-${id}`).value;
    const category = document.getElementById(`edit-category-${id}`).value;
    const mood = document.getElementById(`edit-mood-${id}`).value;
    const tags = document
      .getElementById(`edit-tags-${id}`)
      .value.split(",")
      .map((tag) => tag.trim());

    console.log("Updating entry:", {
      title,
      date,
      content,
      category,
      mood,
      tags,
    });

    // Send PUT request to update the entry
    const response = await fetchData(`/api/entries/${id}`, "PUT", {
      title,
      date,
      content,
      category,
      mood,
      tags,
    });

    if (!response || response.error) {
      console.error("Failed to update entry:", response.error);
      return;
    }

    console.log("Entry updated successfully:", response);

    // Dynamically update the history in the frontend
    const historyList = document.querySelector(`#entry-view-${id} .history ul`);
    if (historyList) {
      historyList.innerHTML = response.history
        .map(
          (h) =>
            `<li>${new Date(h.updatedAt).toLocaleString()} - ${h.title}</li>`
        )
        .join("");
    }

    // Optionally fetch entries again to refresh the UI
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "favorites.html") {
      fetchEntries("favorites");
    } else if (currentPage === "archived.html") {
      fetchEntries("archived");
    } else if (currentPage === "recent.html") {
      fetchEntries("recent");
    } else {
      fetchEntries();
    }
    fetchAnalytics(); // Update analytics after editing an entry
  };

  // Edit entry
  window.editEntry = async (id) => {
    const entry = await fetchData(`/api/entries/${id}`);
    if (entry) {
      document.querySelector("#title").value = entry.title;
      document.querySelector("#date").value = entry.date;
      document.querySelector("#content").value = entry.content;
      document.querySelector("#category").value = entry.category;
      moodSelect.value = entry.mood;
      tagsInput.value = entry.tags.join(", ");

      editEntryForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = document.querySelector("#title").value;
        const date = document.querySelector("#date").value;
        const content = document.querySelector("#content").value;
        const category = document.querySelector("#category").value;
        const mood = moodSelect.value;
        const tags = tagsInput.value.split(",").map((tag) => tag.trim());
        console.log("Updating entry:", {
          title,
          date,
          content,
          category,
          mood,
          tags,
        }); // Log the data being submitted
        const response = await fetchData(`/api/entries/${id}`, "PUT", {
          title,
          date,
          content,
          category,
          mood,
          tags,
        });
        console.log("Response from server:", response); // Log response
        fetchEntries();
        fetchAnalytics();
        editEntryForm.reset();
      };
    }
  };

  // Handle new entry form submission
  const handleNewEntrySubmit = async (e) => {
    e.preventDefault();
    const title = document.querySelector("#title").value;
    const date = document.querySelector("#date").value;
    const content = document.querySelector("#content").value;
    const category = document.querySelector("#category").value;
    const mood = moodSelect.value;
    const tags = tagsInput.value.split(",").map((tag) => tag.trim());
    console.log("Submitting new entry:", {
      title,
      date,
      content,
      category,
      mood,
      tags,
    }); // Log the data being submitted
    const response = await fetchData("/api/entries", "POST", {
      title,
      date,
      content,
      category,
      mood,
      tags,
    });
    console.log("Response from server:", response); // Log response
    fetchEntries();
    fetchAnalytics();
    newEntryForm.reset();
  };

  if (newEntryForm) {
    newEntryForm.addEventListener("submit", async (e) => {
      await handleNewEntrySubmit(e);
      fetchAnalytics(); // Update analytics after adding a new entry
    });
  }

  // Toggle favorite status
  window.toggleFavorite = async (id) => {
    console.log(`Toggling favorite status for entry with ID: ${id}`);
    const response = await fetchData(`/api/entries/${id}/favorite`, "PATCH");
    if (response.error) {
      alert(response.error); // Display error message if the entry cannot be marked as favorite
      return;
    }
    console.log("Response from server:", response); // Log the response from the server
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "favorites.html") {
      fetchEntries("favorites");
    } else if (currentPage === "archived.html") {
      fetchEntries("archived");
    } else {
      fetchEntries();
    }
    fetchAnalytics(); // Update analytics after toggling favorite status
  };

  // Archive entry instead of deleting
  window.deleteEntry = async (id) => {
    console.log(`Archiving entry with ID: ${id}`);
    const response = await fetchData(`/api/entries/${id}`, "DELETE");
    if (response.error) {
      alert(response.error);
      return;
    }
    console.log("Entry archived successfully:", response);
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "favorites.html") {
      fetchEntries("favorites");
    } else if (currentPage === "archived.html") {
      fetchEntries("archived");
    } else if (currentPage === "recent.html") {
      fetchEntries("recent");
    } else {
      fetchEntries();
    }
    fetchAnalytics(); // Update analytics after archiving an entry
  };

  // Function to empty the archive
  window.emptyArchive = async () => {
    try {
      const response = await fetch('/api/archived', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
  
      if (response.ok) {
        console.log('Archived entries deleted:', result.message);
        // alert('All archived entries have been successfully deleted!');
        const currentPage = window.location.pathname.split("/").pop();
        if (currentPage === "all-entries.html") {
          fetchEntries("archived"); // Refresh the displayed entries with the archived filter
        } else {
          fetchEntries("all"); // Refresh the displayed entries
        }
        fetchAnalytics(); // Update analytics
      } else {
        console.error('Error deleting archived entries:', result.error);
        alert('Failed to delete archived entries.');
      }
    } catch (error) {
      console.error('Request failed:', error);
      alert('Failed to delete archived entries.');
    }
  };

  // Handle search, filter, and sort
  if (searchInput || filterSelect || sortSelect) {
    const handleSearchFilterSort = async () => {
      const data = await fetchData("/api/entries");
      let filteredEntries = data;

      // Filter by search
      if (searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredEntries = filteredEntries.filter(
          (entry) =>
            entry.title.toLowerCase().includes(searchTerm) ||
            entry.date.includes(searchTerm)
        );
      }

      // Filter by category
      if (filterSelect.value === "favorites") {
        filteredEntries = filteredEntries.filter((entry) => entry.isFavorite);
      } else if (filterSelect.value === "archived") {
        filteredEntries = data.filter((entry) => entry.archived); // Include only archived entries
      } else {
        filteredEntries = filteredEntries.filter((entry) => !entry.archived); // Exclude archived entries
      }

      // Sort entries
      if (sortSelect.value === "date") {
        filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortSelect.value === "title") {
        filteredEntries.sort((a, b) => a.title.localeCompare(b.title));
      }

      displayEntries(filteredEntries);
    };

    searchInput.addEventListener("input", handleSearchFilterSort);
    filterSelect.addEventListener("change", handleSearchFilterSort);
    sortSelect.addEventListener("change", handleSearchFilterSort);
  }

  // Handle font size adjustment
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", () => {
      document.body.style.fontSize = fontSizeSelect.value;
    });
  }

  fetchAnalytics();
  // Empty Archive Modal
  window.openModal = function(modalId) {
    document.getElementById(modalId).style.display = 'block'
    document.getElementsByTagName('body')[0].classList.add('overflow-y-hidden')
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none'
    document.getElementsByTagName('body')[0].classList.remove('overflow-y-hidden')
}

// Close all modals when press ESC
document.onkeydown = function(event) {
    event = event || window.event;
    if (event.keyCode === 27) {
        document.getElementsByTagName('body')[0].classList.remove('overflow-y-hidden')
        let modals = document.getElementsByClassName('modal');
        Array.prototype.slice.call(modals).forEach(i => {
            i.style.display = 'none'
        })
    }
};
});


function adjustFontSize(action) {
  const content = document.getElementById('content');
  const currentSize = parseFloat(window.getComputedStyle(content, null).getPropertyValue('font-size'));
  if (action === 'increase') {
    content.style.fontSize = (currentSize + 2) + 'px';
  } else if (action === 'decrease') {
    content.style.fontSize = (currentSize - 2) + 'px';
  }
}