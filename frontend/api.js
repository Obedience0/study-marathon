// API configuration - works in both development and production
const API_BASE_URL = window.location.protocol + '//' + window.location.host + '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options
    };

    // Only set Content-Type for non-FormData bodies
    if (!(options.body instanceof FormData)) {
        config.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
    }

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// User API functions
const userAPI = {
    create: (userData) => apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    get: (email) => apiCall(`/users/${email}`)
};

// Book API functions
const bookAPI = {
    getAll: () => apiCall('/books'),

    create: (bookData) => apiCall('/books', {
        method: 'POST',
        body: bookData instanceof FormData ? bookData : JSON.stringify(bookData)
    }),

    delete: (bookId) => apiCall(`/books/${bookId}`, {
        method: 'DELETE'
    })
};

// Lesson API functions
const lessonAPI = {
    getAll: () => apiCall('/lessons'),

    create: (lessonData) => apiCall('/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData)
    }),

    delete: (lessonId) => apiCall(`/lessons/${lessonId}`, {
        method: 'DELETE'
    })
};

// Quiz API functions
const quizAPI = {
    getAll: () => apiCall('/quiz'),

    create: (questionData) => apiCall('/quiz', {
        method: 'POST',
        body: JSON.stringify(questionData)
    }),

    delete: (questionId) => apiCall(`/quiz/${questionId}`, {
        method: 'DELETE'
    })
};

// Chat API functions
const chatAPI = {
    getAll: () => apiCall(`/messages`),  // Get all messages (both group and direct)

    getAllGroup: () => apiCall(`/messages?type=group`),  // Get only group messages

    getAllDirect: (sender, recipient) => {
        if (sender && recipient) {
            return apiCall(`/messages?type=direct&sender=${sender}&recipient=${recipient}`);
        }
        return apiCall(`/messages?type=direct`);
    },

    create: (messageData) => apiCall('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
    }),

    delete: (messageId) => apiCall(`/messages/${messageId}`, {
        method: 'DELETE'
    }),

    getDirect: (sender, recipient) => apiCall(`/messages?type=direct&sender=${sender}&recipient=${recipient}`),

    getGroup: () => apiCall(`/messages?type=group`)
};

// User List API functions
const userListAPI = {
    getAll: () => apiCall('/users/list'),

    get: (email) => apiCall(`/users/${email}`)
};

// Results API functions
const resultAPI = {
    getAll: () => apiCall('/results'),

    create: (resultData) => apiCall('/results', {
        method: 'POST',
        body: JSON.stringify(resultData)
    })
};

// Online status API functions
const onlineAPI = {
    markOnline: (email) => apiCall('/online', {
        method: 'POST',
        body: JSON.stringify({ email })
    }),

    markOffline: (email) => apiCall(`/online/${email}`, {
        method: 'DELETE'
    }),

    getOnlineUsers: () => apiCall('/online')
};

// Online status API functions
const onlineAPI = {
    markOnline: (email) => apiCall('/online', {
        method: 'POST',
        body: JSON.stringify({ email })
    }),

    markOffline: (email) => apiCall(`/online/${email}`, {
        method: 'DELETE'
    }),

    getOnlineUsers: () => apiCall('/online')
};