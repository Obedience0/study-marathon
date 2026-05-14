# Setup Guide - Study Marathon Modern Chat

This guide will walk you through setting up the modern chat system for Study Marathon.

## Quick Start (5 minutes)

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
cd ..
python setup.py
```

This will:
- Create SQLite database
- Set up all tables
- Create sample users for testing
- Create uploads directory

### 3. Start Backend Server

```bash
cd backend
python server.py
```

You should see:
```
 * Serving Flask-SocketIO app 'server'
 * WARNING in app.run(), this is a development server
 * Running on http://0.0.0.0:5000
```

### 4. Open Frontend

Open `frontend/index.html` in your web browser.

### 5. Test the Chat

- Conversations are populated with sample data
- Click any conversation to start chatting
- Try sending messages with attachments
- Test typing indicators and read receipts

## System Requirements

- Python 3.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 50MB free disk space

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Web Browser                         │
│  ┌────────────────────────────────────────────────┐ │
│  │  Frontend (chat.html, chat.css, chat.js)       │ │
│  │  - Modern UI (Facebook/Instagram style)        │ │
│  │  - Real-time message display                   │ │
│  │  - File upload/preview                         │ │
│  │  - Responsive mobile design                    │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │
         WebSocket │ REST API
                   │
┌──────────────────▼──────────────────────────────────┐
│        Backend Server (Flask-SocketIO)              │
│  ┌────────────────────────────────────────────────┐ │
│  │  server.py - Main application                  │ │
│  │  - REST endpoints                              │ │
│  │  - WebSocket handlers                          │ │
│  │  - Connection management                       │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  database.py - Data persistence                │ │
│  │  - SQLite database                             │ │
│  │  - User management                             │ │
│  │  - Message storage                             │ │
│  │  - File management                             │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  real_time_engine.py - Real-time features      │ │
│  │  - WebSocket broadcasting                      │ │
│  │  - Typing indicators                           │ │
│  │  - Read receipts                               │ │
│  │  - Online status                               │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ SQLite
                   │
┌──────────────────▼──────────────────────────────────┐
│  chat.db - Local Database                           │
│  - Users table                                      │
│  - Messages table                                   │
│  - Attachments table                                │
│  - Conversations table                              │
│  - User status table                                │
└─────────────────────────────────────────────────────┘
```

## File Structure Explained

```
chat/
├── frontend/
│   ├── index.html              # Chat UI HTML
│   │   ├── Sidebar with conversations
│   │   ├── Main chat area
│   │   ├── Message input area
│   │   └── Modals (new chat)
│   │
│   ├── chat.css                # Responsive styling
│   │   ├── Layout (sidebar, main, header)
│   │   ├── Mobile breakpoints (480px, 768px, 1024px, 1200px)
│   │   ├── Message bubbles (sent/received)
│   │   ├── Animations (typing, notifications)
│   │   └── Component styles (modals, buttons, inputs)
│   │
│   └── chat.js                 # Frontend logic
│       ├── WebSocket management
│       ├── Message handling
│       ├── Event listeners
│       ├── File upload
│       ├── UI interactions
│       └── Responsive features
│
├── backend/
│   ├── server.py               # Main server
│   │   ├── Flask app setup
│   │   ├── CORS configuration
│   │   ├── WebSocket events
│   │   ├── REST endpoints
│   │   └── Connection handling
│   │
│   ├── database.py             # Database layer
│   │   ├── SQLite connection
│   │   ├── User management
│   │   ├── Message CRUD
│   │   ├── Conversation handling
│   │   ├── File storage
│   │   └── Status tracking
│   │
│   ├── real_time_engine.py     # Real-time features
│   │   ├── Message broadcasting
│   │   ├── Typing indicators
│   │   ├── Read receipts
│   │   ├── Online status
│   │   ├── Notifications
│   │   └── Presence updates
│   │
│   ├── requirements.txt         # Python dependencies
│   ├── README.md               # Backend documentation
│   ├── chat.db                 # SQLite database (auto-created)
│   └── uploads/                # File uploads (auto-created)
│
├── setup.py                    # Setup wizard
├── SETUP_GUIDE.md              # This file
└── assets/                     # Assets folder (placeholder)
```

## Features Explained

### Real-Time Messaging
- **WebSocket**: Instant message delivery
- **Event-Driven**: No polling required
- **Room-Based**: Messages sent to specific users

### Typing Indicators
- Shows when someone is typing
- Auto-hides after 2 seconds
- Animated dots animation

### Read Receipts
- Single ✓: Message delivered to server
- Double ✓✓: Message read by recipient
- Automatic when message is viewed

### Online Status
- Green dot: User is online
- Gray dot: User is offline
- "Active now" or "Away" status text
- Real-time status updates

### File Sharing
- Image preview before sending
- Multiple file support
- Secure file storage
- File type validation

### Mobile Responsive
- Works on all screen sizes
- Touch-friendly UI (44px buttons)
- Mobile sidebar navigation
- Optimized keyboard handling

## Configuration

### Change Backend URL (if needed)

Edit `frontend/chat.js`:
```javascript
const API_URL = 'http://your-server:5000';
```

### Change Server Port

Edit `backend/server.py`:
```python
socketio.run(app, port=YOUR_PORT)
```

### Modify Database Location

Edit `backend/database.py`:
```python
def __init__(self, db_name='your_path/chat.db'):
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER,
    recipient_id INTEGER,
    content TEXT,
    is_read BOOLEAN,
    read_at TIMESTAMP,
    created_at TIMESTAMP
)
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY,
    user_1_id INTEGER,
    user_2_id INTEGER,
    last_message_id INTEGER,
    created_at TIMESTAMP
)
```

## Testing the System

### Test Messaging
1. Open 2 browser windows
2. Click different conversations in each
3. Send a message from one to the other
4. Verify message appears instantly

### Test Typing Indicator
1. Click message input in one window
2. Start typing
3. Watch the other window for "User is typing..." indicator

### Test Read Receipts
1. Send a message
2. View it in recipient's window
3. Watch for double checkmark in sender's window

### Test File Upload
1. Click attachment button (📎)
2. Select an image
3. See preview appear
4. Send and verify attachment displays

### Test Online Status
1. Open chat in first window
2. Green indicator shows for users
3. Close/refresh to disconnect
4. Indicator changes to gray

### Test Mobile View
1. Open browser DevTools (F12)
2. Toggle Device Toolbar
3. Select mobile device
4. Test all features on mobile

## Troubleshooting

### Problem: Backend won't start
**Solution:**
- Check Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 5000 is available: `netstat -an | grep 5000`

### Problem: WebSocket connection fails
**Solution:**
- Ensure backend is running
- Check API_URL in chat.js matches server address
- Check browser console (F12) for errors
- Verify firewall allows WebSocket connections

### Problem: Messages don't appear
**Solution:**
- Check browser console for JavaScript errors
- Verify both windows have correct user IDs selected
- Check network tab in DevTools
- Restart backend server

### Problem: File upload fails
**Solution:**
- Check uploads folder exists: `backend/uploads/`
- Verify folder has write permissions
- Check file size isn't too large
- Check browser console for errors

### Problem: Database file not created
**Solution:**
- Ensure backend directory exists
- Run setup.py from correct directory
- Check folder has write permissions
- Run Python 3.7 or higher

## Performance Tips

### For Production
1. Use production WSGI server (Gunicorn, uWSGI)
2. Enable database connection pooling
3. Implement message pagination
4. Use CDN for static files
5. Enable gzip compression
6. Use Redis for session management

### For Development
- Current setup is fine for testing
- Use SQLite for rapid development
- Enable debug mode in Flask
- Use browser DevTools for debugging

## Security Notes

### Current Implementation
- Basic authentication via user_id
- File upload validation
- SQL injection protection (parameterized queries)
- XSS protection (HTML escaping)

### For Production
- Implement proper user authentication (JWT, OAuth)
- Enable HTTPS/WSS
- Implement rate limiting
- Add user input validation
- Use environment variables for secrets
- Enable CORS properly
- Implement request size limits

## Next Steps

1. **Test Thoroughly**: Try all features on desktop and mobile
2. **Customize UI**: Modify colors/fonts in chat.css
3. **Add Users**: Create more users in database.py
4. **Deploy**: Follow production deployment guide
5. **Monitor**: Check server logs for issues

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Check backend server logs
3. Read README.md in backend folder
4. Check database file permissions

## Conclusion

Your modern chat system is now ready! Enjoy real-time messaging with professional features.
