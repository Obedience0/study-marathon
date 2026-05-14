"""
Study Marathon Chat Server
- Real-time messaging with WebSocket
- Message persistence
- Online/offline status
- Typing indicators
- Read receipts
- Image/file sharing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import json
import os
from database import Database
from real_time_engine import RealTimeEngine

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'study-marathon-chat-secret-key'
CORS(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize database
db = Database()

# Initialize real-time engine
rt_engine = RealTimeEngine(socketio)

# Track connected users
connected_users = {}

# ============================================
# REST API Endpoints
# ============================================

@app.route('/conversations/<int:user_id>', methods=['GET'])
def get_conversations(user_id):
    """Get all conversations for a user"""
    try:
        conversations = db.get_conversations(user_id)
        return jsonify(conversations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/messages/<int:user_id>/<int:recipient_id>', methods=['GET'])
def get_messages(user_id, recipient_id):
    """Get messages between two users"""
    try:
        messages = db.get_messages(user_id, recipient_id)
        return jsonify(messages), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/messages', methods=['POST'])
def create_message():
    """Create a new message"""
    try:
        data = request.get_json()
        message = {
            'sender_id': data['sender_id'],
            'recipient_id': data['recipient_id'],
            'content': data.get('content', ''),
            'attachments': data.get('attachments', []),
            'timestamp': datetime.now().isoformat(),
            'is_read': False
        }
        message_id = db.save_message(message)
        message['id'] = message_id
        
        # Emit message via WebSocket
        rt_engine.send_message(message)
        
        return jsonify(message), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/messages/<int:message_id>/read', methods=['PUT'])
def mark_message_read(message_id):
    """Mark message as read"""
    try:
        db.mark_message_read(message_id)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<int:user_id>/online', methods=['GET'])
def get_user_status(user_id):
    """Get online status of a user"""
    is_online = user_id in connected_users
    return jsonify({'user_id': user_id, 'is_online': is_online}), 200

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file
        filename = db.save_file(file)
        file_url = f'/uploads/{filename}'
        
        return jsonify({'url': file_url}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search/users', methods=['GET'])
def search_users():
    """Search for users"""
    query = request.args.get('q', '')
    try:
        users = db.search_users(query)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# WebSocket Events
# ============================================

@socketio.on('connect')
def handle_connect(auth):
    """Handle user connection"""
    user_id = auth.get('user_id') if auth else None
    
    if not user_id:
        return False
    
    user_id = int(user_id)
    connected_users[user_id] = {
        'sid': request.sid,
        'connected_at': datetime.now().isoformat()
    }
    
    # Join user room
    join_room(f'user_{user_id}')
    
    # Notify others of online status
    rt_engine.broadcast_user_online(user_id, True)
    
    print(f'User {user_id} connected')
    emit('connection_response', {'status': 'Connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle user disconnection"""
    # Find user_id from connected_users
    user_id = None
    for uid, user_data in connected_users.items():
        if user_data['sid'] == request.sid:
            user_id = uid
            break
    
    if user_id:
        del connected_users[user_id]
        
        # Notify others of offline status
        rt_engine.broadcast_user_online(user_id, False)
        
        print(f'User {user_id} disconnected')

@socketio.on('message')
def handle_message(data):
    """Handle incoming message"""
    try:
        message = {
            'sender_id': data['sender_id'],
            'recipient_id': data['recipient_id'],
            'content': data.get('content', ''),
            'attachments': data.get('attachments', []),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'is_read': False
        }
        
        # Save to database
        message_id = db.save_message(message)
        message['id'] = message_id
        message['is_own'] = False
        
        # Send to recipient
        rt_engine.send_message(message)
        
        # Send notification
        if data['recipient_id'] in connected_users:
            rt_engine.send_notification(
                data['recipient_id'],
                f"Message from User {data['sender_id']}",
                data['sender_id']
            )
        
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator"""
    try:
        rt_engine.broadcast_typing_indicator(
            data['sender_id'],
            data['recipient_id'],
            is_stopped=False
        )
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('typing_stop')
def handle_typing_stop(data):
    """Handle typing stop"""
    try:
        rt_engine.broadcast_typing_indicator(
            data['sender_id'],
            data['recipient_id'],
            is_stopped=True
        )
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('read_receipt')
def handle_read_receipt(data):
    """Handle read receipt"""
    try:
        message_id = data.get('message_id')
        if message_id:
            db.mark_message_read(message_id)
        
        rt_engine.send_read_receipt(data['recipient_id'], data['sender_id'])
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('online_status')
def handle_online_status_request(data):
    """Handle online status request"""
    user_id = data.get('user_id')
    is_online = user_id in connected_users
    
    emit('online_status', {
        'user_id': user_id,
        'is_online': is_online
    })

# ============================================
# Error Handlers
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================
# Main
# ============================================

if __name__ == '__main__':
    # Create uploads directory if it doesn't exist
    os.makedirs('uploads', exist_ok=True)
    
    # Run the server
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
