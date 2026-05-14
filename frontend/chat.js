let currentUser = localStorage.getItem('userEmail') || 'Anonymous';
let socket;
let onlineUsers = new Set();
let statusUpdateInterval;

// Initialize SocketIO connection
function initSocket() {
    const socketURL = window.location.protocol + '//' + window.location.host;
    socket = io(socketURL);

    socket.on('connect', () => {
        console.log('Connected to chat server');
        updateConnectionStatus(true);
        socket.emit('join_chat', { email: currentUser });
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        // Show offline indicator
        updateConnectionStatus(false);
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        updateConnectionStatus(false);
    });

    socket.on('reconnect', () => {
        console.log('Reconnected to chat server');
        socket.emit('join_chat', { email: currentUser });
        updateConnectionStatus(true);
    });

    socket.on('new_message', (message) => {
        // Reload messages to show the new message with proper filtering
        if (typeof loadMessages === 'function') {
            loadMessages();
        } else {
            displayMessage(message);
        }
    });

    socket.on('user_joined', (data) => {
        console.log(`${data.email} joined the chat`);
        updateOnlineStatus();
    });

    socket.on('user_left', (data) => {
        console.log(`${data.email} left the chat`);
        updateOnlineStatus();
    });
}

function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = isConnected ? '🟢 Connected' : '🔴 Disconnected';
        statusElement.className = isConnected ? 'status-connected' : 'status-disconnected';
    }
}

async function send(){
    const messageText = document.getElementById('msg').value.trim();
    if (messageText !== "") {
        await sendMessage(messageText);
    }
}

function displayMessage(message) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    
    // Support both old and new message formats
    const sender = message.sender_email || message.user || message.sender;
    const text = message.message || message.text;
    
    const isOwnMessage = sender === currentUser;
    messageElement.className = `message ${isOwnMessage ? 'own' : 'other'}`;

    if (!isOwnMessage) {
        messageElement.innerHTML = `
            <div class="message-user">${sender}</div>
            <div class="message-text">${text}</div>
        `;
    } else {
        messageElement.innerHTML = `
            <div class="message-text">${text}</div>
        `;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to bottom
}

async function loadOnlineUsers() {
    try {
        const users = await onlineAPI.getOnlineUsers();
        onlineUsers = new Set(users.map(user => user.email));
        updateOnlineStatus();
    } catch (error) {
        console.error('Error loading online users:', error);
    }
}

function updateOnlineStatus() {
    const onlineStatusElement = document.getElementById('online-status');
    if (!onlineStatusElement) return;

    const onlineCount = onlineUsers.size;
    const isCurrentUserOnline = onlineUsers.has(currentUser);

    onlineStatusElement.innerHTML = `
        <div class="online-indicator">
            <span class="online-dot ${isCurrentUserOnline ? 'online' : 'offline'}"></span>
            ${onlineCount} user${onlineCount !== 1 ? 's' : ''} online
        </div>
    `;
}

async function markOnline() {
    try {
        await onlineAPI.markOnline(currentUser);
        await loadOnlineUsers();
    } catch (error) {
        console.error('Error marking online:', error);
    }
}

async function markOffline() {
    try {
        await onlineAPI.markOffline(currentUser);
    } catch (error) {
        console.error('Error marking offline:', error);
    }
}

// Initialize chat
document.addEventListener('DOMContentLoaded', async () => {
    updateConnectionStatus(false); // Start as disconnected
    initSocket();
    await markOnline();
    // loadMessages and switchChatMode are called by chat-helper.js
    await loadOnlineUsers();

    // Update online status every 30 seconds
    statusUpdateInterval = setInterval(async () => {
        await markOnline();
        await loadOnlineUsers();
    }, 30000);

    // Mark offline when page is unloaded
    window.addEventListener('beforeunload', () => {
        socket.emit('leave_chat', { email: currentUser });
        markOffline();
        if (statusUpdateInterval) {
            clearInterval(statusUpdateInterval);
        }
    });
});

function logout(){
    socket.emit('leave_chat', { email: currentUser });
    markOffline();
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
    }
    localStorage.removeItem('userEmail');
    window.location = "index.html";
}