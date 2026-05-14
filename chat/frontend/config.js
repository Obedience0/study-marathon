/* ============================================
   CONFIG.JS - Chat Configuration
   ============================================ */

// Server Configuration
const CONFIG = {
    // Backend API Configuration
    API_URL: 'http://localhost:5000',
    WS_URL: 'ws://localhost:5000',
    
    // User Configuration
    CURRENT_USER_ID: 1,
    CURRENT_USERNAME: 'User',
    
    // Message Configuration
    MESSAGE_HISTORY_LIMIT: 50,
    MESSAGE_PAGE_SIZE: 20,
    MESSAGE_DEBOUNCE: 300,
    
    // Typing Indicator Configuration
    TYPING_TIMEOUT: 2000,
    TYPING_DEBOUNCE: 500,
    
    // Connection Configuration
    RECONNECT_TIMEOUT: 3000,
    RECONNECT_ATTEMPTS: 5,
    CONNECTION_TIMEOUT: 5000,
    
    // File Upload Configuration
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    UPLOAD_CHUNK_SIZE: 1 * 1024 * 1024, // 1 MB
    
    // UI Configuration
    NOTIFICATION_DURATION: 4000,
    ANIMATION_DURATION: 300,
    SCROLL_SMOOTH: true,
    ENABLE_ANIMATIONS: true,
    
    // Feature Flags
    FEATURES: {
        TYPING_INDICATORS: true,
        READ_RECEIPTS: true,
        ONLINE_STATUS: true,
        FILE_SHARING: true,
        NOTIFICATIONS: true,
        MESSAGE_SEARCH: true,
        GROUP_CHAT: false, // Coming soon
        VOICE_CALLS: false, // Coming soon
        VIDEO_CALLS: false, // Coming soon
    },
    
    // Color Scheme
    COLORS: {
        PRIMARY: '#0084ff',
        SECONDARY: '#e5e5ea',
        DARK: '#1c1e21',
        LIGHT: '#fff',
        GRAY: '#65676b',
        GRAY_LIGHT: '#f0f2f5',
        SUCCESS: '#31a24c',
        DANGER: '#f56565',
    },
    
    // Messages
    MESSAGES: {
        CONNECTING: 'Connecting...',
        CONNECTED: 'Connected',
        DISCONNECTED: 'Disconnected',
        ERROR: 'An error occurred',
        NO_CONVERSATIONS: 'No conversations',
        NEW_MESSAGE: 'New message from',
        USER_TYPING: 'User is typing...',
        USER_ONLINE: 'Active now',
        USER_OFFLINE: 'Away',
    },
    
    // Logging
    DEBUG: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
};

// Utility Functions
const Logger = {
    debug: (message, data) => {
        if (CONFIG.DEBUG && CONFIG.LOG_LEVEL === 'debug') {
            console.log(`[DEBUG] ${message}`, data);
        }
    },
    info: (message, data) => {
        if (CONFIG.DEBUG) {
            console.log(`[INFO] ${message}`, data);
        }
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${message}`, data);
    },
    error: (message, data) => {
        console.error(`[ERROR] ${message}`, data);
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, Logger };
}
