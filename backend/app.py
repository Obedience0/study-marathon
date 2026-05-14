from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# Production CORS configuration
if os.environ.get('FLASK_ENV') == 'production':
    # Allow specific origins in production
    allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'https://yourdomain.com').split(',')
    CORS(app, origins=allowed_origins)
    socketio = SocketIO(app, cors_allowed_origins=allowed_origins)
else:
    # Development - allow all origins
    CORS(app)
    socketio = SocketIO(app, cors_allowed_origins="*")

# Database configuration - use PostgreSQL in production
if os.environ.get('DATABASE_URL'):
    # Production: Use PostgreSQL from environment variable
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
else:
    # Development: Use SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///study_marathon.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    pdf_link = db.Column(db.String(500))
    video_link = db.Column(db.String(500))

class Lesson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    zoom_link = db.Column(db.String(500), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

class QuizQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500), nullable=False)
    option_a = db.Column(db.String(200), nullable=False)
    option_b = db.Column(db.String(200), nullable=False)
    option_c = db.Column(db.String(200), nullable=False)
    correct_answer = db.Column(db.String(10), nullable=False)  # 'a', 'b', or 'c'

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_email = db.Column(db.String(120), nullable=False)  # Who sent the message
    recipient_email = db.Column(db.String(120))  # Who it's to (None for group chat)
    message = db.Column(db.Text, nullable=False)
    chat_type = db.Column(db.String(20), default='group')  # 'group' or 'direct'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class QuizResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    percentage = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class OnlineUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create database tables
with app.app_context():
    db.create_all()

# API Routes

# User routes
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    new_user = User(email=data['email'], role=data.get('role', 'user'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully', 'id': new_user.id}), 201

@app.route('/api/users/<email>', methods=['GET'])
def get_user(email):
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        })
    return jsonify({'message': 'User not found'}), 404

# Book routes
@app.route('/api/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{
        'id': book.id,
        'title': book.title,
        'pdf': book.pdf_link,
        'video': book.video_link
    } for book in books])

@app.route('/api/books', methods=['POST'])
def add_book():
    # Handle file upload
    if 'pdf' in request.files:
        # File upload request
        title = request.form.get('title')
        video = request.form.get('video')
        pdf_file = request.files['pdf']

        if not title or not pdf_file:
            return jsonify({'message': 'Title and PDF file are required'}), 400

        # Ensure uploads directory exists
        uploads_dir = os.path.join(app.root_path, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)

        # Save the file
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{pdf_file.filename}"
        file_path = os.path.join(uploads_dir, filename)
        pdf_file.save(file_path)

        # Store relative path in database
        pdf_link = f"/uploads/{filename}"

    else:
        # JSON request (backward compatibility)
        data = request.get_json()
        title = data['title']
        pdf_link = data.get('pdf')
        video = data.get('video')

    new_book = Book(
        title=title,
        pdf_link=pdf_link,
        video_link=video
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify({'message': 'Book added successfully', 'id': new_book.id}), 201

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'})

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)

# Lesson routes
@app.route('/api/lessons', methods=['GET'])
def get_lessons():
    lessons = Lesson.query.all()
    return jsonify([{
        'id': lesson.id,
        'title': lesson.title,
        'zoomLink': lesson.zoom_link,
        'startTime': lesson.start_time.isoformat(),
        'endTime': lesson.end_time.isoformat()
    } for lesson in lessons])

@app.route('/api/lessons', methods=['POST'])
def add_lesson():
    data = request.get_json()
    new_lesson = Lesson(
        title=data['title'],
        zoom_link=data['zoomLink'],
        start_time=datetime.fromisoformat(data['startTime']),
        end_time=datetime.fromisoformat(data['endTime'])
    )
    db.session.add(new_lesson)
    db.session.commit()
    return jsonify({'message': 'Lesson added successfully', 'id': new_lesson.id}), 201

@app.route('/api/lessons/<int:lesson_id>', methods=['DELETE'])
def delete_lesson(lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)
    db.session.delete(lesson)
    db.session.commit()
    return jsonify({'message': 'Lesson deleted successfully'})

# Quiz routes
@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    questions = QuizQuestion.query.all()
    return jsonify([{
        'id': q.id,
        'q': q.question,
        'a': q.option_a,
        'b': q.option_b,
        'c': q.option_c,
        'correct': q.correct_answer
    } for q in questions])

@app.route('/api/quiz', methods=['POST'])
def add_quiz_question():
    data = request.get_json()
    new_question = QuizQuestion(
        question=data['question'],
        option_a=data['a'],
        option_b=data['b'],
        option_c=data['c'],
        correct_answer=data['correct']
    )
    db.session.add(new_question)
    db.session.commit()
    return jsonify({'message': 'Quiz question added successfully', 'id': new_question.id}), 201

@app.route('/api/quiz/<int:question_id>', methods=['DELETE'])
def delete_quiz_question(question_id):
    question = QuizQuestion.query.get_or_404(question_id)
    db.session.delete(question)
    db.session.commit()
    return jsonify({'message': 'Quiz question deleted successfully'})

# Chat routes
@app.route('/api/messages', methods=['GET'])
def get_messages():
    # Get messages based on type parameter
    chat_type = request.args.get('type')  # None means all messages, 'group' or 'direct'
    recipient = request.args.get('recipient') or request.args.get('recipient_email')
    sender = request.args.get('sender') or request.args.get('sender_email')
    
    if chat_type == 'direct' and sender and recipient:
        # Get direct messages between sender and recipient
        messages = ChatMessage.query.filter(
            ChatMessage.chat_type == 'direct',
            db.or_(
                db.and_(ChatMessage.sender_email == sender, ChatMessage.recipient_email == recipient),
                db.and_(ChatMessage.sender_email == recipient, ChatMessage.recipient_email == sender)
            )
        ).order_by(ChatMessage.timestamp).all()
    elif chat_type == 'group':
        # Get group chat messages
        messages = ChatMessage.query.filter_by(chat_type='group').order_by(ChatMessage.timestamp).all()
    else:
        # Get all messages if no type specified
        messages = ChatMessage.query.order_by(ChatMessage.timestamp).all()
    
    return jsonify([{
        'id': msg.id,
        'sender_email': msg.sender_email,
        'sender': msg.sender_email,  # Backwards compatibility
        'recipient_email': msg.recipient_email,
        'recipient': msg.recipient_email,  # Backwards compatibility
        'message': msg.message,
        'text': msg.message,  # Backwards compatibility
        'chat_type': msg.chat_type,
        'type': msg.chat_type,  # Backwards compatibility
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages])

@app.route('/api/messages', methods=['POST'])
def add_message():
    data = request.get_json()
    
    # Support both field naming conventions
    sender = data.get('sender') or data.get('sender_email')
    recipient = data.get('recipient') or data.get('recipient_email')
    text = data.get('text') or data.get('message')
    chat_type = data.get('chat_type') or data.get('type', 'group')
    
    new_message = ChatMessage(
        sender_email=sender,
        recipient_email=recipient,  # None for group chat
        message=text,
        chat_type=chat_type
    )
    db.session.add(new_message)
    db.session.commit()
    return jsonify({'message': 'Message sent successfully', 'id': new_message.id}), 201

@app.route('/api/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    message = ChatMessage.query.get_or_404(message_id)
    db.session.delete(message)
    db.session.commit()
    return jsonify({'message': 'Message deleted successfully'})

# Get all users (for direct messaging)
@app.route('/api/users/list', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'email': user.email,
        'role': user.role
    } for user in users])

# Results routes
@app.route('/api/results', methods=['GET'])
def get_results():
    results = QuizResult.query.order_by(QuizResult.timestamp.desc()).all()
    return jsonify([{
        'id': result.id,
        'user': result.user_email,
        'score': result.score,
        'total': result.total_questions,
        'percentage': result.percentage,
        'timestamp': result.timestamp.isoformat()
    } for result in results])

@app.route('/api/results', methods=['POST'])
def add_result():
    data = request.get_json()
    new_result = QuizResult(
        user_email=data['user'],
        score=data['score'],
        total_questions=data['total'],
        percentage=data['percentage']
    )
    db.session.add(new_result)
    db.session.commit()
    return jsonify({'message': 'Result saved successfully', 'id': new_result.id}), 201

# Online status routes
@app.route('/api/online', methods=['POST'])
def mark_online():
    data = request.get_json()
    email = data['email']

    # Check if user already exists
    online_user = OnlineUser.query.filter_by(email=email).first()
    if online_user:
        online_user.last_seen = datetime.utcnow()
    else:
        online_user = OnlineUser(email=email)
        db.session.add(online_user)

    db.session.commit()
    return jsonify({'message': 'User marked as online'}), 200

@app.route('/api/online/<email>', methods=['DELETE'])
def mark_offline(email):
    online_user = OnlineUser.query.filter_by(email=email).first()
    if online_user:
        db.session.delete(online_user)
        db.session.commit()
        return jsonify({'message': 'User marked as offline'}), 200
    return jsonify({'message': 'User not found'}), 404

@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/')
def index():
    """Serve the main application page"""
    return send_from_directory('../', 'index.html')
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_chat')
def handle_join_chat(data):
    email = data.get('email', 'Anonymous')
    emit('user_joined', {'email': email}, broadcast=True)

@socketio.on('leave_chat')
def handle_leave_chat(data):
    email = data.get('email', 'Anonymous')
    emit('user_left', {'email': email}, broadcast=True)

@socketio.on('send_message')
def handle_send_message(data):
    user_email = data.get('user', 'Anonymous')
    message_text = data.get('text', '')

    if message_text.strip():
        # Save message to database
        new_message = ChatMessage(
            user_email=user_email,
            message=message_text
        )
        db.session.add(new_message)
        db.session.commit()

        # Emit to all connected clients
        emit('new_message', {
            'id': new_message.id,
            'user': user_email,
            'text': message_text,
            'timestamp': new_message.timestamp.isoformat()
        }, broadcast=True)

if __name__ == '__main__':
    # Load environment variables from .env file if it exists
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass  # dotenv not installed, use system environment variables

    if os.environ.get('FLASK_ENV') == 'production':
        # Production: Use gunicorn with eventlet for SocketIO
        import eventlet
        import eventlet.wsgi
        eventlet.wsgi.server(eventlet.listen(('0.0.0.0', int(os.environ.get('PORT', 5000)))), app)
    else:
        # Development: Use built-in Flask development server
        socketio.run(app, debug=True, port=int(os.environ.get('PORT', 5000)))