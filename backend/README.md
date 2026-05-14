# Study Marathon Backend

This is the Flask backend for the Study Marathon e-learning platform with real-time chat functionality.

## 🚀 Production Deployment

### Prerequisites

- Python 3.8+
- PostgreSQL database
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt for free)

### 1. Environment Setup

```bash
# Clone or copy project files
cd study-marathon/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

#### Option A: PostgreSQL (Recommended for Production)
```sql
-- Create database
CREATE DATABASE study_marathon;

-- Create user (optional)
CREATE USER study_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE study_marathon TO study_user;
```

#### Option B: Use Cloud Database (Heroku, AWS RDS, etc.)
Most cloud platforms provide managed PostgreSQL databases.

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

Required environment variables:
```env
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://username:password@host:port/database
ALLOWED_ORIGINS=https://yourdomain.com
```

### 4. Firebase Configuration (Optional)

If using Firebase for authentication:
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id
```

### 5. Deployment Options

#### Option A: Heroku (Easiest)

1. **Install Heroku CLI**
2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DATABASE_URL=your-postgres-url
   heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com
   ```

4. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

#### Option B: DigitalOcean App Platform

1. **Connect GitHub repository**
2. **Configure environment variables**
3. **Set build command**: `pip install -r requirements.txt`
4. **Set run command**: `gunicorn --worker-class eventlet -w 1 app:app`

#### Option C: VPS (Ubuntu/Debian)

1. **Server setup**:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip postgresql nginx
   ```

2. **PostgreSQL setup**:
   ```bash
   sudo -u postgres createdb study_marathon
   sudo -u postgres createuser study_user
   sudo -u postgres psql -c "ALTER USER study_user PASSWORD 'your_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE study_marathon TO study_user;"
   ```

3. **Application deployment**:
   ```bash
   # Create systemd service
   sudo nano /etc/systemd/system/study-marathon.service
   ```

   Service file content:
   ```ini
   [Unit]
   Description=Study Marathon Flask App
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/path/to/your/app
   Environment="PATH=/path/to/your/venv/bin"
   Environment="FLASK_ENV=production"
   Environment="DATABASE_URL=postgresql://study_user:password@localhost/study_marathon"
   ExecStart=/path/to/your/venv/bin/gunicorn --worker-class eventlet -w 1 -b 127.0.0.1:8000 app:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start service**:
   ```bash
   sudo systemctl enable study-marathon
   sudo systemctl start study-marathon
   ```

5. **Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/study-marathon
   ```

   Nginx config:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /socket.io {
           proxy_pass http://127.0.0.1:8000/socket.io;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### 6. Frontend Deployment

#### Option A: Static Hosting (Netlify, Vercel, GitHub Pages)

1. **Build static files** (if needed)
2. **Update API URLs** in JavaScript files:
   ```javascript
   const API_BASE_URL = 'https://your-backend-domain.com/api';
   const socket = io('https://your-backend-domain.com');
   ```

3. **Deploy frontend** to static hosting service

#### Option B: Same Server as Backend

Serve static files from Flask:
```python
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)
```

## 📊 Production Features

- ✅ **PostgreSQL Database**: Production-ready database
- ✅ **Environment Variables**: Secure configuration
- ✅ **CORS Security**: Restricted origins in production
- ✅ **Gunicorn + Eventlet**: Production WSGI server with WebSocket support
- ✅ **SSL/TLS**: HTTPS encryption
- ✅ **Load Balancing Ready**: Multiple worker processes
- ✅ **Logging**: Production logging configuration
- ✅ **Error Handling**: Production error pages

## 🔧 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Database** | SQLite | PostgreSQL |
| **CORS** | Allow all | Restricted origins |
| **Server** | Flask dev server | Gunicorn + Eventlet |
| **Debug** | Enabled | Disabled |
| **Logging** | Console | File/structured |
| **Security** | Basic | Enhanced |

## 🧪 Testing Production Deployment

1. **API Testing**:
   ```bash
   curl https://yourdomain.com/api/messages
   ```

2. **SocketIO Testing**:
   ```javascript
   const socket = io('https://yourdomain.com');
   socket.on('connect', () => console.log('Connected!'));
   ```

3. **Database Connection**:
   ```bash
   python -c "from app import db; db.create_all(); print('Database ready')"
   ```

## 🚨 Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] SSL certificate installed
- [ ] CORS origins configured
- [ ] Firebase credentials (if used)
- [ ] Static files accessible
- [ ] SocketIO connections working
- [ ] Error logging configured
- [ ] Backup strategy in place

## � Monitoring & Maintenance

### Health Checks

- **Health Endpoint**: `GET /health` - Returns application status
- **Database Check**: Automatic database connectivity verification
- **SocketIO Status**: Real-time connection monitoring

### Logs

Production logs are available at:
- Application logs: `/var/log/study-marathon/app.log`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`

### Database Backup

```bash
# PostgreSQL backup
pg_dump study_marathon > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql study_marathon < backup_file.sql
```

### Performance Monitoring

Key metrics to monitor:
- **Response Time**: API endpoints should respond < 500ms
- **WebSocket Connections**: Monitor active connections
- **Database Queries**: Slow queries > 1000ms
- **Memory Usage**: Keep under 80% of available RAM
- **CPU Usage**: Monitor during peak hours

### Scaling Considerations

For high traffic:
1. **Load Balancer**: Distribute traffic across multiple servers
2. **Redis**: Use Redis for session storage and caching
3. **CDN**: Serve static files from CDN
4. **Database Replication**: Read replicas for better performance
5. **Horizontal Scaling**: Multiple application servers

## 🔒 Security Best Practices

### Production Security
- [ ] Use strong SECRET_KEY (32+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS properly (restrict origins)
- [ ] Use environment variables for sensitive data
- [ ] Regular security updates for dependencies
- [ ] Database connection encryption
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization

### Firebase Security (if used)
- [ ] Restrict Firebase rules to authenticated users only
- [ ] Use Firebase Authentication properly
- [ ] Secure API keys (don't expose in frontend)
- [ ] Monitor Firebase usage and costs

## 🚀 Quick Production Setup (Heroku Example)

```bash
# 1. Create Heroku app
heroku create study-marathon-prod

# 2. Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set ALLOWED_ORIGINS=https://study-marathon-prod.herokuapp.com

# 3. Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev

# 4. Deploy
git push heroku main

# 5. Run database migrations
heroku run python backend/app.py db upgrade

# 6. Open app
heroku open
```

## 🎯 Success Metrics

Your application is production-ready when:
- ✅ Loads in < 3 seconds
- ✅ Chat messages appear instantly
- ✅ No console errors in production
- ✅ SSL certificate is valid
- ✅ Database backups are automated
- ✅ Monitoring alerts are configured
- ✅ 99% uptime achieved

## 📞 Production Support

### Common Issues & Solutions

**Issue**: SocketIO connections failing
**Solution**: Check CORS settings and WebSocket proxy configuration

**Issue**: Database connection errors
**Solution**: Verify DATABASE_URL and database server status

**Issue**: Static files not loading
**Solution**: Configure web server to serve static files or use CDN

**Issue**: High memory usage
**Solution**: Implement connection pooling and optimize database queries

**Issue**: Slow response times
**Solution**: Add caching, optimize queries, and consider scaling

---

**🎉 Congratulations!** Your Study Marathon application is now production-ready. Follow the deployment guide above to get your educational platform online and serving students worldwide! 🌍📚

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/<email>` - Get user by email

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Add a new book
- `DELETE /api/books/<id>` - Delete a book

### Lessons
- `GET /api/lessons` - Get all lessons
- `POST /api/lessons` - Add a new lesson
- `DELETE /api/lessons/<id>` - Delete a lesson

### Quiz
- `GET /api/quiz` - Get all quiz questions
- `POST /api/quiz` - Add a quiz question
- `DELETE /api/quiz/<id>` - Delete a quiz question

### Chat Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send a message
- `DELETE /api/messages/<id>` - Delete a message

### Quiz Results
- `GET /api/results` - Get all quiz results
- `POST /api/results` - Save a quiz result

## SocketIO Events (Real-time Chat)

The backend supports WebSocket connections for real-time chat:

### Client Events (sent by frontend):
- `join_chat` - User joins the chat room
- `leave_chat` - User leaves the chat room
- `send_message` - Send a chat message

### Server Events (broadcast to all clients):
- `new_message` - New message received
- `user_joined` - User joined the chat
- `user_left` - User left the chat

## Frontend Integration

The frontend JavaScript files have been updated to use the Flask API instead of Firebase. Make sure to:

1. Start the Flask backend server
2. Open the HTML files in a browser
3. The frontend will communicate with `http://localhost:5000`

## Database Models

- **User**: email, role, created_at
- **Book**: title, pdf_link, video_link
- **Lesson**: title, zoom_link, start_time, end_time
- **QuizQuestion**: question, option_a, option_b, option_c, correct_answer
- **ChatMessage**: user_email, message, timestamp
- **QuizResult**: user_email, score, total_questions, percentage, timestamp

## Development

To modify the database schema:
1. Update the models in `app.py`
2. Delete the `study_marathon.db` file
3. Restart the Flask app (it will recreate the tables)

## CORS

CORS is enabled to allow the frontend to communicate with the backend from different origins.