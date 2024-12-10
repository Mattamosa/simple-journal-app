# Simple Journal App

The Simple Journal App allows users to create, save, edit, and delete journal entries. Each entry includes a title, date, and content. Users can search, filter, and sort entries, mark entries as favorites, and customize their viewing preferences.

## Running the Server

To start the server, run the following command:
node server.js


## Starting nodemon

nodemon server.js


## API Endpoints Overview

### Journal App API Documentation  
**URL:** `http://localhost:3000`  

### Endpoints  

1. **POST /api/entries**  
   - **Description:** Create a new journal entry.  
   - **Request Body:**  
     - `title` (required) string: Title of the journal entry.  
     - `date` (required) string: Date of the journal entry.  
     - `content` (required) string: Content of the journal entry.  
     - `category` (required) string: Category of the journal entry.  
     - `mood` (required) string: Mood of the journal entry.  
     - `tags` (required) array: Tags associated with the journal entry.  
   - **Response:** Returns the created journal entry in JSON format.  

2. **PUT /api/entries/:id**  
   - **Description:** Update an existing journal entry by its ID.  
   - **Request Body:**  
     - `title` (optional) string: Updated title of the entry.  
     - `content` (optional) string: Updated content of the entry.  
     - `category` (optional) string: Updated category of the entry.  
     - `mood` (optional) string: Updated mood of the entry.  
     - `tags` (optional) array: Updated tags for the entry.  
   - **Response:** Returns the updated journal entry in JSON format.  

3. **DELETE /api/entries/:id**  
   - **Description:** Archive a journal entry by its ID.  
   - **Response:** Returns a success message and the updated entry in JSON format.  

4. **PATCH /api/entries/:id/favorite**  
   - **Description:** Toggle the favorite status of a journal entry by its ID.  
   - **Response:** Returns the updated journal entry in JSON format.  

5. **GET /api/entries**  
   - **Description:** Retrieve all journal entries.  
   - **Response:** Returns an array of all entries in JSON format.  

6. **GET /api/entries/:id**  
   - **Description:** Retrieve a single journal entry by its ID.  
   - **Response:** Returns the requested journal entry in JSON format.  

7. **GET /api/archived**  
   - **Description:** Retrieve all archived journal entries.  
   - **Response:** Returns an array of archived entries in JSON format.  

8. **DELETE /api/archived**  
   - **Description:** Permanently delete all archived journal entries.  
   - **Response:** Returns a success message with the count of deleted entries.  

9. **GET /api/analytics**  
   - **Description:** Retrieve analytics for journal entries.  
   - **Response:**  
     - `totalEntries`: Total number of entries.  
     - `favoriteCount`: Number of favorite entries.  
     - `archivedCount`: Number of archived entries.  
