// Student Dashboard JavaScript
const db = firebase.database();
const auth = firebase.auth();

function logout(){
    firebase.auth().signOut().then(()=>{
        window.location = "index.html";
    });
}

// Load user profile information
function loadUserProfile() {
    auth.onAuthStateChanged(user => {
        if (user) {
            const displayName = user.email ? user.email.split('@')[0] : 'Student';
            const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            document.getElementById('profileWelcome').textContent = 'Welcome, ' + formattedName + '!';

            // Load user statistics
            loadUserStats(user.uid);
        } else {
            window.location = 'log.html';
        }
    });
}

// Load user statistics
function loadUserStats(userId) {
    // Load completed lessons count
    db.ref('user_progress/' + userId + '/lessons_completed').once('value', snapshot => {
        const completed = snapshot.val() || 0;
        document.getElementById('lessonsCompleted').textContent = completed;
    });

    // Load quiz scores
    db.ref('user_progress/' + userId + '/quiz_scores').once('value', snapshot => {
        const scores = snapshot.val();
        if (scores) {
            const scoreValues = Object.values(scores);
            const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
            document.getElementById('quizScores').textContent = 'Average: ' + Math.round(average) + '%';
        }
    });

    // Load study streak
    db.ref('user_progress/' + userId + '/study_streak').once('value', snapshot => {
        const streak = snapshot.val() || 0;
        document.getElementById('studyStreak').textContent = streak + ' days';
    });

    // Load books read
    db.ref('user_progress/' + userId + '/books_read').once('value', snapshot => {
        const booksRead = snapshot.val() || 0;
        document.getElementById('booksRead').textContent = booksRead;
    });
}

// Check for notifications
function checkNotifications() {
    const notificationsDiv = document.getElementById('notifications');
    let notifications = [];

    // Check for quiz questions
    db.ref("quizzes").once("value", snapshot => {
        if (snapshot.exists() && snapshot.numChildren() > 0) {
            notifications.push('<div class="notification quiz-notif"><a href="quiz.html">📝 New quiz questions available!</a></div>');
        }
        checkMessages();
    });

    function checkMessages() {
        db.ref("messages").orderByChild('timestamp').limitToLast(1).once("value", snapshot => {
            if (snapshot.exists()) {
                notifications.push('<div class="notification message-notif"><a href="chat.html">💬 New messages in chat!</a></div>');
            }
            checkLessons();
        });
    }

    function checkLessons() {
        db.ref("lessons").once("value", snapshot => {
            if (snapshot.exists()) {
                const now = Date.now();
                snapshot.forEach(childSnapshot => {
                    const lesson = childSnapshot.val();
                    const startTime = new Date(lesson.startTime).getTime();
                    const endTime = new Date(lesson.endTime).getTime();
                    if (now >= startTime && now <= endTime) {
                        notifications.push(`<div class="notification lesson-notif"><a href="lessons.html">🎥 Online class "${lesson.title}" is ongoing!</a></div>`);
                    }
                });
            }
            displayNotifications(notifications);
        });
    }
}

// Display notifications
function displayNotifications(notifications) {
    const notificationsDiv = document.getElementById('notifications');
    if (notifications.length > 0) {
        notificationsDiv.innerHTML = '<h3>Notifications</h3>' + notifications.join('');
    } else {
        notificationsDiv.innerHTML = '<h3>Notifications</h3><p>No new notifications.</p>';
    }
}

// Load upcoming lessons
function loadUpcomingLessons() {
    const upcomingDiv = document.getElementById('upcomingLessons');
    const now = Date.now();

    db.ref('lessons').orderByChild('startTime').once('value', snapshot => {
        const lessons = [];
        snapshot.forEach(childSnapshot => {
            const lesson = childSnapshot.val();
            const startTime = new Date(lesson.startTime).getTime();
            if (startTime > now) {
                lessons.push({
                    ...lesson,
                    startTime: startTime
                });
            }
        });

        // Sort by start time and take first 3
        lessons.sort((a, b) => a.startTime - b.startTime);
        const upcoming = lessons.slice(0, 3);

        if (upcoming.length > 0) {
            upcomingDiv.innerHTML = upcoming.map(lesson => `
                <div class="upcoming-item">
                    <h4>${lesson.title}</h4>
                    <p>📅 ${new Date(lesson.startTime).toLocaleString()}</p>
                    <button onclick="joinLesson('${lesson.zoomLink}')" class="join-btn">Join Lesson</button>
                </div>
            `).join('');
        } else {
            upcomingDiv.innerHTML = '<p>No upcoming lessons scheduled.</p>';
        }
    });
}

// Load recent books
function loadRecentBooks() {
    const booksDiv = document.getElementById('recentBooks');

    db.ref('books').orderByChild('timestamp').limitToLast(3).once('value', snapshot => {
        const books = [];
        snapshot.forEach(childSnapshot => {
            books.push(childSnapshot.val());
        });

        books.reverse(); // Show newest first

        if (books.length > 0) {
            booksDiv.innerHTML = books.map(book => `
                <div class="recent-book-item">
                    <h4>${book.title}</h4>
                    <div class="book-actions">
                        ${book.fileUrl ? `<a href="${book.fileUrl}" target="_blank" class="read-btn">📖 Read</a>` : ''}
                        ${book.videoLink ? `<a href="${book.videoLink}" target="_blank" class="join-btn">🎥 Watch</a>` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            booksDiv.innerHTML = '<p>No books available yet.</p>';
        }
    });
}

// Join lesson function
function joinLesson(zoomLink) {
    if (zoomLink) {
        window.open(zoomLink, '_blank');
    } else {
        alert('Zoom link not available for this lesson.');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    checkNotifications();
    loadUpcomingLessons();
    loadRecentBooks();
});