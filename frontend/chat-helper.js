// Chat Helper - Handles direct messaging and group chat logic

let chatMode = 'group'; // 'group' or 'direct'
let selectedContact = null;
let allUsers = [];
let allMessages = [];

// Switch between group and direct chat modes
async function switchChatMode(mode) {
    chatMode = mode;

    // Update button styles
    document.getElementById('groupChatBtn').classList.toggle('active', mode === 'group');
    document.getElementById('directChatBtn').classList.toggle('active', mode === 'direct');

    // Show/hide sidebar
    const sidebar = document.getElementById('chatSidebar');
    const groupHeader = document.getElementById('groupChatHeader');
    const directHeader = document.getElementById('directChatHeader');

    if (mode === 'group') {
        sidebar.style.display = 'none';
        groupHeader.style.display = 'block';
        directHeader.style.display = 'none';
        selectedContact = null;
    } else {
        sidebar.style.display = 'block';
        groupHeader.style.display = 'none';
        directHeader.style.display = 'block';
        await loadUsersForDirectChat();
    }

    // Reload messages
    await loadMessages();
}

// Load all users for direct messaging
async function loadUsersForDirectChat() {
    try {
        const users = await onlineAPI.getOnlineUsers();
        allUsers = users.filter(user => user.email !== currentUser); // Exclude self

        renderUsersList();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

// Render users list in sidebar
function renderUsersList() {
    const usersList = document.getElementById('usersList');
    
    if (allUsers.length === 0) {
        usersList.innerHTML = '<p class="no-users">No users available for direct chat</p>';
        return;
    }

    usersList.innerHTML = allUsers.map(user => `
        <div class="user-item ${selectedContact === user.email ? 'active' : ''}" onclick="selectContact('${user.email}')">
            <div class="user-avatar">👤</div>
            <div class="user-info">
                <p class="user-name">${user.email}</p>
                <p class="user-status">Online</p>
            </div>
        </div>
    `).join('');
}

// Select a contact for direct messaging
async function selectContact(email) {
    selectedContact = email;
    
    // Update UI
    const userItems = document.querySelectorAll('.user-item');
    userItems.forEach(item => item.classList.remove('active'));
    event.target.closest('.user-item').classList.add('active');

    // Update header
    const directTitle = document.getElementById('directChatTitle');
    const directStatus = document.getElementById('directUserStatus');
    directTitle.textContent = email;
    directStatus.textContent = '🟢 Online';

    // Load direct chat messages
    await loadMessages();
}

// Search users in sidebar
function searchUsers(query) {
    const filteredUsers = allUsers.filter(user => 
        user.email.toLowerCase().includes(query.toLowerCase())
    );

    const usersList = document.getElementById('usersList');
    
    if (filteredUsers.length === 0) {
        usersList.innerHTML = '<p class="no-users">No users found</p>';
        return;
    }

    usersList.innerHTML = filteredUsers.map(user => `
        <div class="user-item ${selectedContact === user.email ? 'active' : ''}" onclick="selectContact('${user.email}')">
            <div class="user-avatar">👤</div>
            <div class="user-info">
                <p class="user-name">${user.email}</p>
                <p class="user-status">Online</p>
            </div>
        </div>
    `).join('');
}

// Load messages based on chat mode
async function loadMessages() {
    try {
        const messages = await chatAPI.getAll();
        allMessages = messages;

        const chatBox = document.getElementById("chat-box");
        chatBox.innerHTML = "";

        let filteredMessages;

        if (chatMode === 'group') {
            // Show only group chat messages
            filteredMessages = messages.filter(msg => msg.chat_type === 'group' || !msg.recipient_email);
        } else {
            // Show only direct messages between current user and selected contact
            if (!selectedContact) {
                chatBox.innerHTML = '<p class="no-messages">Please select a contact to start chatting</p>';
                return;
            }

            filteredMessages = messages.filter(msg => 
                msg.chat_type === 'direct' &&
                ((msg.sender_email === currentUser && msg.recipient_email === selectedContact) ||
                 (msg.sender_email === selectedContact && msg.recipient_email === currentUser))
            );
        }

        // Display messages
        filteredMessages.forEach(message => {
            displayMessage(message);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Send message (group or direct)
async function sendMessage(text) {
    if (!text.trim()) return;

    try {
        const messageData = {
            sender_email: currentUser,
            message: text,
            timestamp: new Date().toISOString()
        };

        if (chatMode === 'group') {
            messageData.chat_type = 'group';
        } else {
            if (!selectedContact) {
                alert('Please select a contact first');
                return;
            }
            messageData.chat_type = 'direct';
            messageData.recipient_email = selectedContact;
        }

        // Save to backend
        await chatAPI.create(messageData);

        // Emit via socket for real-time display
        if (socket && socket.connected) {
            socket.emit('send_message', messageData);
        }

        // Clear input
        document.getElementById('msg').value = '';

        // Reload messages to show new message
        await loadMessages();
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message: ' + error.message);
    }
}

// Handle Enter key to send message
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send();
    }
}

// Update group member count
async function updateGroupMemberCount() {
    try {
        const users = await onlineAPI.getOnlineUsers();
        const count = users.length;
        const memberCount = document.getElementById('groupMemberCount');
        if (memberCount) {
            memberCount.textContent = `${count} member${count !== 1 ? 's' : ''} online`;
        }
    } catch (error) {
        console.error('Failed to update member count:', error);
    }
}

// Initialize chat helper
document.addEventListener('DOMContentLoaded', async () => {
    // Set default to group chat
    await switchChatMode('group');
    await updateGroupMemberCount();

    // Update member count every 10 seconds
    setInterval(updateGroupMemberCount, 10000);
});
