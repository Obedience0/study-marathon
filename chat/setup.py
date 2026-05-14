"""
Quick Start Configuration for Study Marathon Chat
Run this to initialize the chat system
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

from database import Database

def setup_chat_system():
    """Initialize chat system"""
    print("=" * 50)
    print("Study Marathon Chat - Setup Wizard")
    print("=" * 50)
    
    # Initialize database
    print("\n[1/3] Initializing database...")
    db = Database('backend/chat.db')
    print("✓ Database initialized")
    
    # Create sample users
    print("\n[2/3] Creating sample users...")
    sample_users = [
        ('john_doe', 'john@example.com', 'https://via.placeholder.com/50?text=JD'),
        ('sarah_mike', 'sarah@example.com', 'https://via.placeholder.com/50?text=SM'),
        ('alex_lee', 'alex@example.com', 'https://via.placeholder.com/50?text=AL'),
        ('emma_carter', 'emma@example.com', 'https://via.placeholder.com/50?text=EC'),
    ]
    
    user_ids = []
    for username, email, avatar in sample_users:
        user_id = db.create_user(username, email, avatar)
        if user_id:
            user_ids.append(user_id)
            print(f"  ✓ Created user: {username}")
        else:
            print(f"  ! User already exists: {username}")
    
    # Create uploads directory
    print("\n[3/3] Setting up file uploads...")
    os.makedirs('backend/uploads', exist_ok=True)
    print("✓ Uploads directory ready")
    
    print("\n" + "=" * 50)
    print("Setup Complete!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Start the backend server:")
    print("   python backend/server.py")
    print("\n2. Open the chat interface:")
    print("   Open 'frontend/index.html' in your browser")
    print("\n3. Use one of these test users:")
    for username, _, _ in sample_users:
        print(f"   - {username}")
    print("\n" + "=" * 50)

if __name__ == '__main__':
    try:
        setup_chat_system()
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        sys.exit(1)
