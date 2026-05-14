"""
Real-Time Engine - Handles all WebSocket events and broadcasting
- Message sending/receiving
- Typing indicators
- Read receipts
- Online/offline status
- Notifications
"""

from flask_socketio import emit
from datetime import datetime

class RealTimeEngine:
    def __init__(self, socketio):
        self.socketio = socketio
    
    # ============ Message Broadcasting ============
    
    def send_message(self, message):
        """Send message to recipient"""
        recipient_room = f'user_{message["recipient_id"]}'
        
        data = {
            'type': 'message',
            'id': message.get('id'),
            'sender_id': message['sender_id'],
            'recipient_id': message['recipient_id'],
            'content': message.get('content'),
            'attachments': message.get('attachments', []),
            'timestamp': message.get('timestamp'),
            'is_read': message.get('is_read', False)
        }
        
        self.socketio.emit(
            'message',
            data,
            room=recipient_room
        )
    
    # ============ Typing Indicator ============
    
    def broadcast_typing_indicator(self, sender_id, recipient_id, is_stopped=False):
        """Broadcast typing indicator to recipient"""
        recipient_room = f'user_{recipient_id}'
        
        data = {
            'type': 'typing',
            'sender_id': sender_id,
            'recipient_id': recipient_id,
            'is_stopped': is_stopped
        }
        
        self.socketio.emit(
            'typing',
            data,
            room=recipient_room,
            skip_sid=True
        )
    
    # ============ Read Receipts ============
    
    def send_read_receipt(self, recipient_id, sender_id):
        """Send read receipt to sender"""
        sender_room = f'user_{sender_id}'
        
        data = {
            'type': 'read_receipt',
            'sender_id': sender_id,
            'recipient_id': recipient_id,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'read_receipt',
            data,
            room=sender_room,
            skip_sid=True
        )
    
    # ============ Online Status ============
    
    def broadcast_user_online(self, user_id, is_online):
        """Broadcast user online status to all connected clients"""
        data = {
            'type': 'online_status',
            'user_id': user_id,
            'is_online': is_online,
            'timestamp': datetime.now().isoformat()
        }
        
        # Broadcast to all users (except sender)
        self.socketio.emit(
            'online_status',
            data,
            skip_sid=True
        )
    
    def get_online_users(self):
        """Get list of online users"""
        # This would be implemented by the server to track connected users
        pass
    
    # ============ Notifications ============
    
    def send_notification(self, user_id, message, sender_id):
        """Send notification to a user"""
        user_room = f'user_{user_id}'
        
        data = {
            'type': 'notification',
            'message': message,
            'sender_id': sender_id,
            'sender_name': f'User {sender_id}',
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'notification',
            data,
            room=user_room
        )
    
    def broadcast_notification(self, message):
        """Broadcast notification to all users"""
        data = {
            'type': 'notification',
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'notification',
            data
        )
    
    # ============ Conversation Events ============
    
    def notify_new_conversation(self, user_id, other_user_data):
        """Notify user of new conversation started"""
        user_room = f'user_{user_id}'
        
        data = {
            'type': 'new_conversation',
            'user': other_user_data,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'new_conversation',
            data,
            room=user_room
        )
    
    # ============ File Sharing ============
    
    def send_file(self, message_id, sender_id, recipient_id, file_data):
        """Send file message"""
        recipient_room = f'user_{recipient_id}'
        
        data = {
            'type': 'file',
            'message_id': message_id,
            'sender_id': sender_id,
            'file': file_data,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'file',
            data,
            room=recipient_room
        )
    
    # ============ Presence Broadcasting ============
    
    def broadcast_presence(self, user_id, action='online'):
        """Broadcast presence (online/offline/away)"""
        data = {
            'type': 'presence',
            'user_id': user_id,
            'action': action,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'presence',
            data,
            skip_sid=True
        )
    
    # ============ Bulk Operations ============
    
    def mark_messages_read(self, message_ids):
        """Mark multiple messages as read"""
        data = {
            'type': 'bulk_read',
            'message_ids': message_ids,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'bulk_read',
            data
        )
    
    def send_batch_messages(self, messages):
        """Send multiple messages"""
        for message in messages:
            self.send_message(message)
    
    # ============ Group Chat Events (Future) ============
    
    def create_group_chat(self, group_id, members):
        """Create group chat notification"""
        data = {
            'type': 'group_created',
            'group_id': group_id,
            'members': members,
            'timestamp': datetime.now().isoformat()
        }
        
        for member_id in members:
            member_room = f'user_{member_id}'
            self.socketio.emit(
                'group_created',
                data,
                room=member_room
            )
    
    def send_group_message(self, group_id, message):
        """Send message to group"""
        group_room = f'group_{group_id}'
        
        data = {
            'type': 'group_message',
            'group_id': group_id,
            **message
        }
        
        self.socketio.emit(
            'group_message',
            data,
            room=group_room
        )
    
    # ============ Error Handling ============
    
    def send_error(self, user_id, error_message):
        """Send error message to user"""
        user_room = f'user_{user_id}'
        
        data = {
            'type': 'error',
            'message': error_message,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            'error',
            data,
            room=user_room
        )
