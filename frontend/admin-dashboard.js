// Admin Dashboard JavaScript
const db = firebase.database();

function logout(){
    // For admin, just redirect to login page
    window.location = "log.html";
}

// Load dashboard statistics
function loadDashboardStats() {
    // Load total users
    db.ref('users').once('value', (snapshot) => {
        const users = snapshot.val();
        const userCount = users ? Object.keys(users).length : 0;
        document.getElementById('totalUsers').textContent = userCount;
    });

    // Load active lessons
    db.ref('lessons').once('value', (snapshot) => {
        const lessons = snapshot.val();
        let activeCount = 0;
        if (lessons) {
            const now = Date.now();
            Object.values(lessons).forEach(lesson => {
                if (lesson.endTime > now) {
                    activeCount++;
                }
            });
        }
        document.getElementById('activeLessons').textContent = activeCount;
    });

    // Load total books
    db.ref('books').once('value', (snapshot) => {
        const books = snapshot.val();
        const bookCount = books ? Object.keys(books).length : 0;
        document.getElementById('totalBooks').textContent = bookCount;
    });

    // Load total quizzes
    db.ref('quizzes').once('value', (snapshot) => {
        const quizzes = snapshot.val();
        const quizCount = quizzes ? Object.keys(quizzes).length : 0;
        document.getElementById('totalQuizzes').textContent = quizCount;
    });

    // Load recent activity
    loadRecentActivity();
}

// Load recent activity
function loadRecentActivity() {
    const activityRef = db.ref('activity').orderByChild('timestamp').limitToLast(5);
    activityRef.once('value', (snapshot) => {
        const activities = snapshot.val();
        let activityText = 'No recent activity';

        if (activities) {
            const activityList = Object.values(activities).reverse();
            activityText = activityList.map(activity => {
                const date = new Date(activity.timestamp);
                return `${activity.action} - ${date.toLocaleDateString()}`;
            }).join('<br>');
        }

        document.getElementById('recentActivity').innerHTML = activityText;
    });
}

// Load system alerts
function loadSystemAlerts() {
    const alertsRef = db.ref('system_alerts').orderByChild('timestamp').limitToLast(3);
    alertsRef.once('value', (snapshot) => {
        const alerts = snapshot.val();
        const alertsContainer = document.getElementById('systemAlerts');

        if (alerts) {
            const alertList = Object.values(alerts).reverse();
            alertsContainer.innerHTML = alertList.map(alert => `
                <div class="notification ${alert.type || 'message-notif'}">
                    <strong>${alert.title}</strong><br>
                    ${alert.message}<br>
                    <small>${new Date(alert.timestamp).toLocaleString()}</small>
                </div>
            `).join('');
        } else {
            alertsContainer.innerHTML = '<p>No system alerts</p>';
        }
    });
}

// Quick action functions
function viewUserAnalytics() {
    alert('User Analytics feature coming soon!');
    // TODO: Implement user analytics view
}

function systemSettings() {
    alert('System Settings feature coming soon!');
    // TODO: Implement system settings
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadSystemAlerts();

    // Refresh stats every 30 seconds
    setInterval(() => {
        loadDashboardStats();
        loadSystemAlerts();
    }, 30000);
});