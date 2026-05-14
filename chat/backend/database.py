"""
Database Module - Handles all data persistence
- SQLite for lightweight storage
- Message storage and retrieval
- User conversations
- File storage
"""

import sqlite3
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename

class Database:
    def __init__(self, db_name='chat.db'):
        self.db_name = db_name
        self.upload_folder = 'uploads'
        self.init_db()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                avatar_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                sender_id INTEGER NOT NULL,
                recipient_id INTEGER NOT NULL,
                content TEXT,
                is_read BOOLEAN DEFAULT 0,
                read_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (recipient_id) REFERENCES users(id)
            )
        ''')
        
        # Message attachments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attachments (
                id INTEGER PRIMARY KEY,
                message_id INTEGER NOT NULL,
                file_url TEXT NOT NULL,
                file_type TEXT,
                file_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id)
            )
        ''')
        
        # Conversations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY,
                user_1_id INTEGER NOT NULL,
                user_2_id INTEGER NOT NULL,
                last_message_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_1_id) REFERENCES users(id),
                FOREIGN KEY (user_2_id) REFERENCES users(id),
                UNIQUE(user_1_id, user_2_id)
            )
        ''')
        
        # Online status table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_status (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE,
                is_online BOOLEAN DEFAULT 0,
                last_seen TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Create indices for better query performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user_1_id, user_2_id)')
        
        conn.commit()
        conn.close()
    
    # ============ User Methods ============
    
    def create_user(self, username, email, avatar_url=None):
        """Create a new user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                'INSERT INTO users (username, email, avatar_url) VALUES (?, ?, ?)',
                (username, email, avatar_url)
            )
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def get_user(self, user_id):
        """Get user details"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        return dict(user) if user else None
    
    def search_users(self, query):
        """Search for users by username"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT id, username, avatar_url FROM users WHERE username LIKE ? LIMIT 10',
            (f'%{query}%',)
        )
        users = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return users
    
    # ============ Message Methods ============
    
    def save_message(self, message):
        """Save a message to database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                '''INSERT INTO messages 
                   (sender_id, recipient_id, content, is_read, created_at) 
                   VALUES (?, ?, ?, ?, ?)''',
                (
                    message['sender_id'],
                    message['recipient_id'],
                    message['content'],
                    0,
                    message.get('timestamp', datetime.now().isoformat())
                )
            )
            
            message_id = cursor.lastrowid
            
            # Save attachments
            if message.get('attachments'):
                for attachment in message['attachments']:
                    cursor.execute(
                        'INSERT INTO attachments (message_id, file_url) VALUES (?, ?)',
                        (message_id, attachment)
                    )
            
            # Update or create conversation
            self._update_conversation(
                message['sender_id'],
                message['recipient_id'],
                message_id,
                cursor
            )
            
            conn.commit()
            return message_id
        finally:
            conn.close()
    
    def get_messages(self, user_id, recipient_id, limit=50, offset=0):
        """Get messages between two users"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, sender_id, recipient_id, content, is_read, created_at
            FROM messages
            WHERE (sender_id = ? AND recipient_id = ?) 
               OR (sender_id = ? AND recipient_id = ?)
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ''', (user_id, recipient_id, recipient_id, user_id, limit, offset))
        
        messages = []
        for row in cursor.fetchall():
            msg = dict(row)
            msg['timestamp'] = msg['created_at']
            msg['is_own'] = msg['sender_id'] == user_id
            
            # Get attachments
            cursor.execute(
                'SELECT file_url FROM attachments WHERE message_id = ?',
                (msg['id'],)
            )
            msg['attachments'] = [row[0] for row in cursor.fetchall()]
            messages.append(msg)
        
        conn.close()
        return list(reversed(messages))
    
    def mark_message_read(self, message_id):
        """Mark a message as read"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE messages SET is_read = 1, read_at = ? WHERE id = ?',
            (datetime.now().isoformat(), message_id)
        )
        conn.commit()
        conn.close()
    
    def get_unread_count(self, user_id):
        """Get count of unread messages for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT COUNT(*) FROM messages WHERE recipient_id = ? AND is_read = 0',
            (user_id,)
        )
        count = cursor.fetchone()[0]
        conn.close()
        
        return count
    
    # ============ Conversation Methods ============
    
    def get_conversations(self, user_id):
        """Get all conversations for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT DISTINCT
                CASE 
                    WHEN user_1_id = ? THEN user_2_id
                    ELSE user_1_id
                END as other_user_id,
                (SELECT content FROM messages 
                 WHERE (sender_id = ? AND recipient_id IN (user_1_id, user_2_id))
                    OR (sender_id IN (user_1_id, user_2_id) AND recipient_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages 
                 WHERE (sender_id = ? AND recipient_id IN (user_1_id, user_2_id))
                    OR (sender_id IN (user_1_id, user_2_id) AND recipient_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message_time
            FROM conversations
            WHERE user_1_id = ? OR user_2_id = ?
            ORDER BY last_message_time DESC
        ''', (user_id, user_id, user_id, user_id, user_id, user_id, user_id))
        
        conversations = []
        for row in cursor.fetchall():
            other_user = self.get_user(row[0])
            conversations.append({
                'user_id': other_user['id'],
                'username': other_user['username'],
                'avatar': other_user['avatar_url'],
                'last_message': row[1],
                'timestamp': row[2]
            })
        
        conn.close()
        return conversations
    
    def _update_conversation(self, user_1_id, user_2_id, message_id, cursor):
        """Update or create conversation"""
        if user_1_id > user_2_id:
            user_1_id, user_2_id = user_2_id, user_1_id
        
        cursor.execute(
            '''INSERT OR REPLACE INTO conversations 
               (user_1_id, user_2_id, last_message_id)
               VALUES (?, ?, ?)''',
            (user_1_id, user_2_id, message_id)
        )
    
    # ============ File Methods ============
    
    def save_file(self, file):
        """Save uploaded file"""
        os.makedirs(self.upload_folder, exist_ok=True)
        
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f'{timestamp}_{filename}'
        
        filepath = os.path.join(self.upload_folder, filename)
        file.save(filepath)
        
        return filename
    
    # ============ User Status Methods ============
    
    def update_user_status(self, user_id, is_online):
        """Update user online status"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            '''INSERT OR REPLACE INTO user_status 
               (user_id, is_online, last_seen)
               VALUES (?, ?, ?)''',
            (user_id, is_online, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
    
    def get_user_status(self, user_id):
        """Get user status"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT is_online, last_seen FROM user_status WHERE user_id = ?',
            (user_id,)
        )
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'is_online': bool(result[0]),
                'last_seen': result[1]
            }
        return {'is_online': False, 'last_seen': None}
