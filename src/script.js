document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.querySelector('#message');

    // Fetch a message from the server
    const fetchMessage = async () => {
        const response = await fetch('/api/message');
        const data = await response.json();
        messageDiv.textContent = data.message;
    };

    fetchMessage(); // Call the function when the page loads
});
