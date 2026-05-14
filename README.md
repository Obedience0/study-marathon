# Study Marathon - Project Structure

This project has been organized into a clean, maintainable folder structure for better development and deployment.

## 📁 Folder Structure

```
study-marathon/
├── frontend/          # Client-side application
│   ├── index.html    # Landing page
│   ├── admin-dashboard.html  # Admin dashboard
│   ├── admin.html    # Admin management panel
│   ├── dashbord.html # Student dashboard
│   ├── books.html    # Books page
│   ├── chat.html     # Chat page
│   ├── dashbord.html # Dashboard page
│   ├── lessons.html  # Lessons page
│   ├── log.html      # Login page
│   ├── quiz.html     # Quiz page
│   ├── admin-dashboard.js  # Admin dashboard logic
│   ├── admin.js      # Admin functionality
│   ├── api.js        # API utilities
│   ├── auth.js       # Authentication
│   ├── books.js      # Books functionality
│   ├── chat.js       # Chat functionality
│   ├── dashbord.js   # Student dashboard logic
│   ├── firebase.js   # Firebase configuration
│   ├── lessons.js    # Lessons functionality
│   └── quiz.js       # Quiz functionality
│
├── backend/          # Server-side application
│   ├── app.py       # Flask application
│   ├── Procfile     # Heroku deployment
│   ├── README.md    # Backend documentation
│   ├── requirements.txt
│   └── runtime.txt
│   └── uploads/     # File uploads directory
│
├── assets/          # Static assets
│   └── style.css    # Main stylesheet
│
├── config/          # Configuration files
│   ├── nginx.conf   # Nginx configuration
│   └── deploy.sh    # Deployment script
│
├── chat/            # Modern chat system
│   ├── frontend/    # Chat UI
│   ├── backend/     # Chat server
│   ├── setup.py     # Setup script
│   ├── QUICK_START.md
│   └── SETUP_GUIDE.md
│
└── README.md        # This file
```

## 🎯 User Roles & Dashboards

### Admin Users
- **Login**: `admin@studymarathon.com` / `admin123`
- **Dashboard**: `admin-dashboard.html`
- **Features**: Platform management, user analytics, content creation
- **Access**: Full system control and monitoring

### Student Users
- **Login**: Register with email/password or use Firebase auth
- **Dashboard**: `dashbord.html`
- **Features**: Learning progress, upcoming lessons, book access
- **Access**: Study materials, quizzes, chat, lessons

## 🚀 Getting Started

### Frontend Development
1. Open any HTML file in `frontend/` directory
2. Files will load CSS from `../assets/style.css`
3. JavaScript files are referenced locally within frontend/

### Backend Development
1. Navigate to `backend/` directory
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `python app.py`

### Chat System
1. Navigate to `chat/` directory
2. Follow `QUICK_START.md` for setup

## 📋 File Organization Benefits

- **Separation of Concerns**: Frontend, backend, and assets are clearly separated
- **Scalability**: Easy to add new features in appropriate folders
- **Deployment**: Clear structure for different deployment strategies
- **Team Development**: Multiple developers can work on different parts simultaneously
- **Maintenance**: Easier to find and update specific components

## 🔧 Configuration

- **Web Server**: `config/nginx.conf`
- **Deployment**: `config/deploy.sh`
- **Dependencies**: `backend/requirements.txt`

## 📖 Documentation

- **Main App**: This README
- **Backend**: `backend/README.md`
- **Chat System**: `chat/SETUP_GUIDE.md` and `chat/QUICK_START.md`