document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket(`ws://localhost:${window.location.port}`);
    const messagesDiv = document.getElementById('messages');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
        const message = document.createElement('p');
        message.textContent = event.data;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            ws.send(message);
            messageInput.value = '';
        }
    });
});