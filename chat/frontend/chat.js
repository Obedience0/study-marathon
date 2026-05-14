/* ============================================
   CHAT.JS - Frontend Functionality
   ============================================ */

// ============ Configurations ============

const API_URL = 'http://localhost:5000';
let ws = null;
let currentUserId = 1;
let currentChatUserId = 1;
let isTyping = false;
let typingTimeout;

// ============ DOM Elements ============

const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const attachmentBtn = document.getElementById('attachmentBtn');
const fileInput = document.getElementById('fileInput');
const emojiBtn = document.getElementById('emojiBtn');
const searchInput = document.getElementById('searchInput');
const conversationItems = document.querySelectorAll('.conversation-item');
const newChatBtn = document.getElementById('newChatBtn');
const newChatBtn2 = document.getElementById('newChatBtn2');
const newChatModal = document.getElementById('newChatModal');
const closeModal = document.getElementById('closeModal');
const backBtn = document.getElementById('backBtn');
const statusText = document.getElementById('statusText');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const attachmentPreview = document.getElementById('attachmentPreview');
const closePreview = document.getElementById('closePreview');
const emptyState = document.getElementById('emptyState');
const chatMain = document.querySelector('.chat-main');
const sidebar = document.querySelector('.sidebar');

// ============ Initialize ============

document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    setupEventListeners();
    loadConversations();
});

// ============ WebSocket Connection ============

function initializeWebSocket() {
    ws = new WebSocket(`ws://localhost:5000/ws?user_id=${currentUserId}`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        updateStatusIndicator(true);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateStatusIndicator(false);
        // Attempt to reconnect
        setTimeout(initializeWebSocket, 3000);
    };
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'message':
            handleNewMessage(data);
            break;
        case 'typing':
            handleTypingIndicator(data);
            break;
        case 'online_status':
            handleOnlineStatus(data);
            break;
        case 'read_receipt':
            handleReadReceipt(data);
            break;
        case 'notification':
            showNotification(data.message, data.sender_name);
            break;
    }
}

// ============ Event Listeners ============

function setupEventListeners() {
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Typing indicator
    messageInput.addEventListener('input', () => {
        sendTypingIndicator();
        autoExpandTextarea();
    });

    // Attachments
    attachmentBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelection);
    closePreview.addEventListener('click', clearAttachments);

    // Emoji
    emojiBtn.addEventListener('click', insertEmoji);

    // Search
    searchInput.addEventListener('input', searchConversations);

    // Conversations
    conversationItems.forEach(item => {
        item.addEventListener('click', selectConversation);
    });

    // New Chat Modal
    newChatBtn.addEventListener('click', openNewChatModal);
    newChatBtn2.addEventListener('click', openNewChatModal);
    closeModal.addEventListener('click', closeNewChatModal);
    newChatModal.addEventListener('click', (e) => {
        if (e.target === newChatModal) closeNewChatModal();
    });

    // Back button (mobile)
    backBtn.addEventListener('click', closeSidebar);

    // User search in modal
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', searchUsers);
    }
}

// ============ Message Functions ============

function sendMessage() {
    const message = messageInput.value.trim();
    const attachments = getAttachmentPreview();

    if (!message && attachments.length === 0) {
        return;
    }

    const messageData = {
        type: 'message',
        sender_id: currentUserId,
        recipient_id: currentChatUserId,
        content: message,
        attachments: attachments,
        timestamp: new Date().toISOString()
    };

    // Send via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(messageData));
    }

    // Display message locally
    displayMessage({
        ...messageData,
        is_own: true
    });

    // Clear input
    messageInput.value = '';
    clearAttachments();
    autoExpandTextarea();

    // Send read receipt after a short delay
    setTimeout(() => {
        sendReadReceipt(currentChatUserId);
    }, 1000);

    // Stop typing indicator
    stopTyping();
}

function displayMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message ' + (message.is_own ? 'sent' : 'received');

    const time = new Date(message.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    let content = `
        ${!message.is_own ? `<img src="${message.sender_avatar || 'https://via.placeholder.com/32'}" alt="" class="message-avatar">` : ''}
        <div class="message-bubble">
            ${message.attachments && message.attachments.length > 0 ? 
                message.attachments.map(att => `<img src="${att}" class="message-image">`).join('') : ''
            }
            ${message.content ? `<p>${escapeHtml(message.content)}</p>` : ''}
            <span class="message-time">${time}</span>
            ${message.is_own ? `<span class="read-receipt" title="Delivered"><i class="fas fa-check"></i></span>` : ''}
        </div>
    `;

    messageEl.innerHTML = content;
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
}

function handleNewMessage(data) {
    if (data.sender_id === currentChatUserId) {
        displayMessage({
            ...data,
            is_own: false
        });
        // Send read receipt
        sendReadReceipt(data.sender_id);
    } else {
        // Message from someone else, show notification
        showNotification(`New message from user ${data.sender_id}`);
    }
}

// ============ Typing Indicator ============

function sendTypingIndicator() {
    if (!isTyping) {
        isTyping = true;
        const data = {
            type: 'typing',
            sender_id: currentUserId,
            recipient_id: currentChatUserId
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 2000);
}

function stopTyping() {
    if (isTyping) {
        isTyping = false;
        const data = {
            type: 'typing_stop',
            sender_id: currentUserId,
            recipient_id: currentChatUserId
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
}

function handleTypingIndicator(data) {
    if (data.sender_id === currentChatUserId && !data.is_stopped) {
        // Show typing indicator
        if (!document.querySelector('.typing-message')) {
            const typingEl = document.createElement('div');
            typingEl.className = 'message received typing-message';
            typingEl.innerHTML = `
                <img src="https://via.placeholder.com/32" alt="" class="message-avatar">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            messagesContainer.appendChild(typingEl);
            scrollToBottom();
        }
    } else {
        // Remove typing indicator
        const typingEl = document.querySelector('.typing-message');
        if (typingEl) typingEl.remove();
    }
}

// ============ Read Receipt ============

function sendReadReceipt(userId) {
    const data = {
        type: 'read_receipt',
        sender_id: currentUserId,
        recipient_id: userId,
        timestamp: new Date().toISOString()
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function handleReadReceipt(data) {
    // Mark messages as read
    const messages = document.querySelectorAll('.message.sent');
    messages.forEach(msg => {
        const receipt = msg.querySelector('.read-receipt');
        if (receipt) {
            receipt.innerHTML = '<i class="fas fa-check-double"></i>';
            receipt.title = 'Read';
        }
    });
}

// ============ Online Status ============

function updateStatusIndicator(isOnline) {
    statusText.textContent = isOnline ? 'Active now' : 'Away';
    statusText.style.color = isOnline ? '#31a24c' : '#65676b';
}

function handleOnlineStatus(data) {
    const item = document.querySelector(`.conversation-item[data-user-id="${data.user_id}"]`);
    if (item) {
        const indicator = item.querySelector('.online-indicator');
        if (data.is_online) {
            indicator.classList.add('online');
            indicator.classList.remove('offline');
        } else {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
        }
    }
}

// ============ File/Image Handling ============

function handleFileSelection(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                addAttachmentPreview(event.target.result, file.name, 'image');
            };
            reader.readAsDataURL(file);
        } else {
            addAttachmentPreview(null, file.name, 'file');
        }
    });
}

function addAttachmentPreview(src, name, type) {
    attachmentPreview.classList.add('active');
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    if (type === 'image' && src) {
        previewItem.innerHTML = `
            <img src="${src}" alt="${name}">
        `;
    } else {
        previewItem.innerHTML = `
            <div class="file-icon">
                <i class="fas fa-file"></i>
            </div>
        `;
    }

    document.querySelector('.preview-items').appendChild(previewItem);
}

function clearAttachments() {
    attachmentPreview.classList.remove('active');
    document.querySelector('.preview-items').innerHTML = '';
}

function getAttachmentPreview() {
    const attachments = [];
    document.querySelectorAll('.preview-item img').forEach(img => {
        attachments.push(img.src);
    });
    return attachments;
}

// ============ Emoji Picker ============

function insertEmoji() {
    const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '😍', '🤔', '😢'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    messageInput.value += emoji;
    messageInput.focus();
}

// ============ Conversation Selection ============

function selectConversation(e) {
    const item = e.currentTarget;
    currentChatUserId = parseInt(item.dataset.userId);

    // Update active state
    conversationItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Load messages
    loadMessages(currentChatUserId);

    // Hide sidebar on mobile
    if (window.innerWidth <= 768) {
        closeSidebar();
    }

    // Show chat main
    emptyState.style.display = 'none';
    chatMain.style.display = 'flex';
}

function loadMessages(userId) {
    // Clear current messages
    messagesContainer.innerHTML = `
        <div class="message-group">
            <div class="message-date">
                <span>Today</span>
            </div>
        </div>
    `;

    // Fetch messages from server
    fetch(`${API_URL}/messages/${currentUserId}/${userId}`)
        .then(res => res.json())
        .then(messages => {
            messages.forEach(msg => {
                displayMessage(msg);
            });
        })
        .catch(err => console.error('Error loading messages:', err));
}

// ============ Conversations ============

function loadConversations() {
    fetch(`${API_URL}/conversations/${currentUserId}`)
        .then(res => res.json())
        .then(data => {
            // Conversations are already displayed
            console.log('Conversations loaded');
        })
        .catch(err => console.error('Error loading conversations:', err));
}

function searchConversations(e) {
    const query = e.target.value.toLowerCase();
    conversationItems.forEach(item => {
        const name = item.querySelector('.conversation-header h3').textContent.toLowerCase();
        const message = item.querySelector('.last-message').textContent.toLowerCase();
        
        if (name.includes(query) || message.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ============ New Chat Modal ============

function openNewChatModal() {
    newChatModal.classList.add('active');
}

function closeNewChatModal() {
    newChatModal.classList.remove('active');
}

function searchUsers(e) {
    const query = e.target.value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');
    
    userItems.forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        const username = item.querySelector('p').textContent.toLowerCase();
        
        if (name.includes(query) || username.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Add event listeners to user items
document.addEventListener('click', (e) => {
    if (e.target.closest('.user-item')) {
        const userId = e.target.closest('.user-item').dataset.userId;
        currentChatUserId = userId;
        closeNewChatModal();
        selectConversation({ currentTarget: document.querySelector(`.conversation-item[data-user-id="${userId}"]`) || createNewConversation(userId) });
    }
});

function createNewConversation(userId) {
    // Create new conversation in DOM
    const item = document.createElement('div');
    item.className = 'conversation-item active';
    item.dataset.userId = userId;
    item.innerHTML = `
        <div class="conversation-avatar">
            <img src="https://via.placeholder.com/50?text=U" alt="">
            <span class="online-indicator online"></span>
        </div>
        <div class="conversation-info">
            <div class="conversation-header">
                <h3>New User</h3>
                <span class="time">now</span>
            </div>
            <p class="last-message">Start a conversation</p>
        </div>
    `;
    item.addEventListener('click', selectConversation);
    document.querySelector('.conversations-list').prepend(item);
    return item;
}

// ============ Notifications ============

function showNotification(message, userName = '') {
    notificationText.textContent = userName ? `${userName}: ${message}` : message;
    notification.classList.add('show');

    // Request browser notification if permitted
    if (Notification.permission === 'granted') {
        new Notification('Study Marathon Chat', {
            body: message,
            icon: 'https://via.placeholder.com/128?text=Chat'
        });
    }

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// ============ Mobile Navigation ============

function closeSidebar() {
    sidebar.classList.remove('active');
}

// ============ Utility Functions ============

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function autoExpandTextarea() {
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, 100);
    messageInput.style.height = newHeight + 'px';
}

// ============ Responsive Handling ============

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
});

// Show back button on mobile
if (window.innerWidth <= 768) {
    backBtn.style.display = 'flex';
}

// Initialize
console.log('Chat app initialized');
