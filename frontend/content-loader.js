// Content Display Helper Functions
// These functions fetch data from the API and display it on user pages

// Display all books on the books page
async function loadBooksContent() {
    try {
        const books = await bookAPI.getAll();
        const booksContainer = document.getElementById('books');
        
        if (!books || books.length === 0) {
            booksContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No books available yet. Check back soon!</p>';
            return;
        }

        booksContainer.innerHTML = books.map(book => `
            <div class="book-card">
                <h3>${book.title}</h3>
                <div class="book-actions">
                    ${book.pdf ? `<a href="${book.pdf}" target="_blank" class="read-btn">📖 Read PDF</a>` : ''}
                    ${book.video ? `<a href="${book.video}" target="_blank" class="join-btn">🎥 Watch Video</a>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load books:', error);
        document.getElementById('books').innerHTML = '<p style="color: red;">Failed to load books. Please refresh the page.</p>';
    }
}

// Display all lessons on the lessons page
async function loadLessonsContent() {
    try {
        const lessons = await lessonAPI.getAll();
        const liveLessonsDiv = document.getElementById('liveLessons');
        const upcomingLessonsDiv = document.getElementById('upcomingLessons');
        
        if (!lessons || lessons.length === 0) {
            if (liveLessonsDiv) liveLessonsDiv.innerHTML = '<p>No live lessons at the moment.</p>';
            if (upcomingLessonsDiv) upcomingLessonsDiv.innerHTML = '<p>No upcoming lessons scheduled.</p>';
            return;
        }

        const now = new Date();
        const live = [];
        const upcoming = [];

        lessons.forEach(lesson => {
            const startTime = new Date(lesson.startTime);
            const endTime = new Date(lesson.endTime);
            
            if (now >= startTime && now <= endTime) {
                live.push(lesson);
            } else if (startTime > now) {
                upcoming.push(lesson);
            }
        });

        // Sort upcoming by start time
        upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        // Display live lessons
        if (liveLessonsDiv) {
            if (live.length > 0) {
                liveLessonsDiv.innerHTML = live.map(lesson => `
                    <div class="lesson-card live">
                        <div class="lesson-header">
                            <h4>${lesson.title}</h4>
                            <span class="live-badge">🔴 LIVE</span>
                        </div>
                        <div class="lesson-details">
                            <p><strong>Start:</strong> ${new Date(lesson.startTime).toLocaleString()}</p>
                            <p><strong>End:</strong> ${new Date(lesson.endTime).toLocaleString()}</p>
                        </div>
                        <div class="lesson-actions">
                            <a href="${lesson.zoomLink}" target="_blank" class="join-btn">📹 Join Zoom</a>
                        </div>
                    </div>
                `).join('');
            } else {
                liveLessonsDiv.innerHTML = '<p>No live lessons at the moment.</p>';
            }
        }

        // Display upcoming lessons
        if (upcomingLessonsDiv) {
            if (upcoming.length > 0) {
                upcomingLessonsDiv.innerHTML = upcoming.map(lesson => `
                    <div class="lesson-card upcoming">
                        <div class="lesson-header">
                            <h4>${lesson.title}</h4>
                        </div>
                        <div class="lesson-details">
                            <p><strong>Start:</strong> ${new Date(lesson.startTime).toLocaleString()}</p>
                            <p><strong>End:</strong> ${new Date(lesson.endTime).toLocaleString()}</p>
                        </div>
                        <div class="lesson-actions">
                            <a href="${lesson.zoomLink}" target="_blank" class="calendar-btn">📅 Add to Calendar</a>
                            <a href="${lesson.zoomLink}" target="_blank" class="join-btn">📹 Join Zoom</a>
                        </div>
                    </div>
                `).join('');
            } else {
                upcomingLessonsDiv.innerHTML = '<p>No upcoming lessons scheduled.</p>';
            }
        }
    } catch (error) {
        console.error('Failed to load lessons:', error);
        console.log('Falling back to default content display');
    }
}

// Display all quiz questions on the quiz page
async function loadQuizContent() {
    try {
        const questions = await quizAPI.getAll();
        const quizContainer = document.getElementById('quizContainer');
        
        if (!questions || questions.length === 0) {
            if (quizContainer) {
                quizContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No quiz questions available yet. Check back soon!</p>';
            }
            return;
        }

        // Shuffle questions
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        
        const quizHTML = shuffled.map((q, index) => `
            <div class="question">
                <h4>${index + 1}. ${q.q}</h4>
                <label>
                    <input type="radio" name="q${index}" value="a" required>
                    A) ${q.a}
                </label>
                <label>
                    <input type="radio" name="q${index}" value="b">
                    B) ${q.b}
                </label>
                <label>
                    <input type="radio" name="q${index}" value="c">
                    C) ${q.c}
                </label>
            </div>
        `).join('');

        if (quizContainer) {
            quizContainer.innerHTML = quizHTML + '<button id="submitBtn" onclick="submitQuiz()" style="display: block; margin: 20px auto; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Submit Quiz</button>';
        }

        // Store quiz data for submission
        window.quizData = shuffled;
    } catch (error) {
        console.error('Failed to load quiz:', error);
        const quizContainer = document.getElementById('quizContainer');
        if (quizContainer) {
            quizContainer.innerHTML = '<p style="color: red;">Failed to load quiz. Please refresh the page.</p>';
        }
    }
}

// Function to calculate and submit quiz results
async function submitQuiz() {
    if (!window.quizData || window.quizData.length === 0) {
        alert('Quiz data not found. Please refresh the page.');
        return;
    }

    let score = 0;
    const totalQuestions = window.quizData.length;

    window.quizData.forEach((question, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected && selected.value === question.correct) {
            score++;
        }
    });

    const percentage = Math.round((score / totalQuestions) * 100);

    // Hide quiz and submit button
    const quizContainer = document.getElementById('quizContainer');
    const submitBtn = document.getElementById('submitBtn');
    if (quizContainer) quizContainer.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'none';

    // Display results
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        const scoreEl = document.getElementById('score');
        const percentageEl = document.getElementById('percentage');
        if (scoreEl) scoreEl.innerHTML = `<strong>Score: ${score}/${totalQuestions}</strong>`;
        if (percentageEl) percentageEl.innerHTML = `<strong>Percentage: ${percentage}%</strong>`;
    }

    // Store result in backend if user is logged in
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            await resultAPI.create({
                user: user.email,
                score: score,
                total: totalQuestions,
                percentage: percentage,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.log('Could not save quiz result:', error);
    }
}

// Retake quiz function
function retakeQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    const submitBtn = document.getElementById('submitBtn');
    const resultsDiv = document.getElementById('results');
    
    if (quizContainer) quizContainer.style.display = 'block';
    if (submitBtn) submitBtn.style.display = 'block';
    if (resultsDiv) resultsDiv.style.display = 'none';
    
    loadQuizContent();
}

// Auto-load content when page loads
document.addEventListener('DOMContentLoaded', function() {
    const pageURL = window.location.pathname;
    
    if (pageURL.includes('books')) {
        loadBooksContent();
    } else if (pageURL.includes('lessons')) {
        loadLessonsContent();
    } else if (pageURL.includes('quiz')) {
        loadQuizContent();
    }
});