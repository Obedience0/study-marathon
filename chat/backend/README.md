# Study Marathon - Modern Chat Application

A modern, real-time chat application built with Facebook/Instagram-style UI and complete feature set.

## Features

### Core Features
- ✅ Real-time messaging with WebSocket
- ✅ Modern Facebook/Instagram-style UI
- ✅ Online/Offline status indicators
- ✅ Typing indicators
- ✅ Read receipts (single ✓ and double ✓✓ check)
- ✅ Image and file sharing
- ✅ Message search
- ✅ Conversation management
- ✅ Browser notifications
- ✅ Mobile responsive design (works on all screen sizes)

### Real-Time Features
- **WebSocket Communication**: Instant message delivery
- **Typing Indicators**: See when someone is typing
- **Online Status**: Real-time user presence
- **Read Receipts**: Know when messages are read
- **Notifications**: Desktop and in-app notifications

### Mobile Features
- Responsive design for all devices
- Touch-friendly UI with proper button sizes
- Mobile-optimized sidebar
- One-handed navigation
- Smooth animations

## Project Structure

```
chat/
├── frontend/
│   ├── index.html      # Main chat UI
│   ├── chat.css        # Modern styling
│   └── chat.js         # Frontend logic
├── backend/
│   ├── server.py       # Flask WebSocket server
│   ├── database.py     # Database operations
│   ├── real_time_engine.py  # Real-time broadcasting
│   └── requirements.txt # Python dependencies
└── assets/
    └── (placeholder for icons/images)
```

## Installation

### Backend Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Run the server:**
```bash
python server.py
```

The server will start at `http://localhost:5000`

### Frontend Setup

1. **Open the chat application:**
   - Simply open `frontend/index.html` in a web browser
   - Or serve it through a web server

2. **Connect to the backend:**
   - Update `API_URL` in `chat.js` if backend is running on a different host
   - Default: `http://localhost:5000`

## API Endpoints

### REST API

- `GET /conversations/<user_id>` - Get all conversations
- `GET /messages/<user_id>/<recipient_id>` - Get messages between users
- `POST /messages` - Create new message
- `PUT /messages/<message_id>/read` - Mark message as read
- `GET /users/<user_id>/online` - Get user online status
- `POST /upload` - Upload file/image
- `GET /search/users` - Search for users

### WebSocket Events

#### Client → Server

- `message` - Send message
- `typing` - Send typing indicator
- `typing_stop` - Stop typing indicator
- `read_receipt` - Send read receipt
- `online_status` - Request online status

#### Server → Client

- `message` - Receive message
- `typing` - Receive typing indicator
- `read_receipt` - Receive read receipt
- `online_status` - Receive online status update
- `notification` - Receive notification

## Usage

### Sending Messages

1. Type your message in the input field
2. Press Enter or click the send button
3. Message will be delivered in real-time to recipient

### File Sharing

1. Click the attachment button (📎)
2. Select images or files
3. Files will be uploaded and shared with recipient

### Typing Indicators

- Typing indicator automatically shows when the recipient starts typing
- Automatically hides after 2 seconds of inactivity

### Online Status

- Green indicator: User is online
- Gray indicator: User is offline
- "Active now" text shows current status

### Read Receipts

- Single ✓: Message delivered
- Double ✓✓: Message read

## Database Schema

### Tables

- **users**: User profiles
- **messages**: Chat messages
- **attachments**: File attachments linked to messages
- **conversations**: Conversation threads between users
- **user_status**: Online/offline status tracking

## Configuration

### Frontend (chat.js)

```javascript
const API_URL = 'http://localhost:5000'; // Backend URL
let currentUserId = 1;                     // Current user ID
```

### Backend (server.py)

```python
app.config['SECRET_KEY'] = 'study-marathon-chat-secret-key'
socketio.run(app, debug=True, host='0.0.0.0', port=5000)
```

## Features in Detail

### Online/Offline Status

- Users are automatically marked online when they connect
- Status updates broadcast to all connected users in real-time
- Last seen timestamp is recorded for offline users

### Typing Indicator

- Triggered when user starts typing
- Broadcast to conversation partner
- Auto-clears after 2 seconds of inactivity
- Shows animated dots: • • •

### Read Receipts

- Single checkmark: Message sent and delivered
- Double checkmark: Message has been read by recipient
- Automatically updated when recipient views message

### Image/File Sharing

- Support for multiple file types
- Image preview in attachments area
- Files are securely saved to server
- Attachment preview before sending

### Notifications

- Browser push notifications (with user permission)
- In-app toast notifications
- Shows sender name and message preview
- Auto-dismisses after 4 seconds

### Mobile Design

- Fully responsive layout
- Touch-friendly button sizes (44px minimum)
- Mobile sidebar navigation
- Bottom-fixed input area
- Smooth animations and transitions

## Security Considerations

- CORS enabled for cross-origin requests
- File upload validation
- SQL injection protection via parameterized queries
- XSS protection via HTML escaping
- WebSocket authentication via user_id

## Performance Optimization

- Database indexing on frequently queried columns
- Pagination for message history
- Lazy loading of conversations
- Efficient WebSocket room-based broadcasting
- Optimized CSS with minimal repaints

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### WebSocket Connection Failed
- Ensure backend server is running
- Check API_URL in chat.js matches server address
- Check browser console for errors
- Verify firewall allows WebSocket connections

### Messages Not Appearing
- Check browser console for JavaScript errors
- Verify user IDs are correct
- Ensure database file has proper permissions

### File Upload Issues
- Check uploads folder exists and is writable
- Verify file size limits
- Check browser console for upload errors

## Future Enhancements

- Group messaging
- Voice/video calls
- Message reactions (emoji reactions)
- Message search and filtering
- User profiles
- Settings and preferences
- Message history export
- End-to-end encryption
- Message pinning
- Story/status updates

## License

Study Marathon Chat © 2026

## Support

For issues or feature requests, contact the development team.
