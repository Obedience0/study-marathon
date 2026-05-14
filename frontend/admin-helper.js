// Admin Content Management Helper Functions
// These functions help admins add content to the platform

// Add a new book
async function addBookViaAPI() {
    try {
        const title = document.getElementById('bookTitle')?.value;
        const videoLink = document.getElementById('videoLink')?.value;
        const fileInput = document.getElementById('bookFile');

        if (!title) {
            alert('Please enter a book title');
            return;
        }

        let bookData;

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            // Upload with file
            const formData = new FormData();
            formData.append('title', title);
            formData.append('pdf', fileInput.files[0]);
            if (videoLink) formData.append('video', videoLink);

            bookData = formData;
        } else if (videoLink) {
            // Just video link
            bookData = {
                title: title,
                video: videoLink
            };
        } else {
            alert('Please provide either a PDF file or video link');
            return;
        }

        const result = await bookAPI.create(bookData);
        alert('Book added successfully!');
        
        // Clear form
        if (document.getElementById('bookTitle')) document.getElementById('bookTitle').value = '';
        if (document.getElementById('videoLink')) document.getElementById('videoLink').value = '';
        if (document.getElementById('bookFile')) document.getElementById('bookFile').value = '';

        // Reload books on user pages
        if (typeof loadBooksContent === 'function') {
            loadBooksContent();
        }
    } catch (error) {
        console.error('Failed to add book:', error);
        alert('Failed to add book: ' + error.message);
    }
}

// Add a new lesson
async function addLessonViaAPI() {
    try {
        const title = document.getElementById('lessonTitle')?.value;
        const zoomLink = document.getElementById('zoomLink')?.value;
        const startTime = document.getElementById('startTime')?.value;
        const endTime = document.getElementById('endTime')?.value;

        if (!title || !zoomLink || !startTime || !endTime) {
            alert('Please fill in all lesson fields');
            return;
        }

        const lessonData = {
            title: title,
            zoomLink: zoomLink,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString()
        };

        const result = await lessonAPI.create(lessonData);
        alert('Lesson added successfully!');

        // Clear form
        if (document.getElementById('lessonTitle')) document.getElementById('lessonTitle').value = '';
        if (document.getElementById('zoomLink')) document.getElementById('zoomLink').value = '';
        if (document.getElementById('startTime')) document.getElementById('startTime').value = '';
        if (document.getElementById('endTime')) document.getElementById('endTime').value = '';

        // Reload lessons on user pages
        if (typeof loadLessonsContent === 'function') {
            loadLessonsContent();
        }
    } catch (error) {
        console.error('Failed to add lesson:', error);
        alert('Failed to add lesson: ' + error.message);
    }
}

// Add a new quiz question
async function addQuizViaAPI() {
    try {
        const question = document.getElementById('question')?.value;
        const optionA = document.getElementById('a')?.value;
        const optionB = document.getElementById('b')?.value;
        const optionC = document.getElementById('c')?.value;
        const correct = document.getElementById('correct')?.value?.toLowerCase();

        if (!question || !optionA || !optionB || !optionC || !correct) {
            alert('Please fill in all quiz fields');
            return;
        }

        if (!['a', 'b', 'c'].includes(correct)) {
            alert('Correct answer must be a, b, or c');
            return;
        }

        const quizData = {
            question: question,
            a: optionA,
            b: optionB,
            c: optionC,
            correct: correct
        };

        const result = await quizAPI.create(quizData);
        alert('Quiz question added successfully!');

        // Clear form
        if (document.getElementById('question')) document.getElementById('question').value = '';
        if (document.getElementById('a')) document.getElementById('a').value = '';
        if (document.getElementById('b')) document.getElementById('b').value = '';
        if (document.getElementById('c')) document.getElementById('c').value = '';
        if (document.getElementById('correct')) document.getElementById('correct').value = '';

        // Reload quiz on user pages
        if (typeof loadQuizContent === 'function') {
            loadQuizContent();
        }
    } catch (error) {
        console.error('Failed to add quiz:', error);
        alert('Failed to add quiz: ' + error.message);
    }
}

// Load all books for admin management
async function loadBooksForAdmin() {
    try {
        const books = await bookAPI.getAll();
        const booksList = document.getElementById('booksList');
        
        if (!booksList) return;

        if (!books || books.length === 0) {
            booksList.innerHTML = '<p>No books added yet.</p>';
            return;
        }

        booksList.innerHTML = books.map(book => `
            <div class="item">
                <h4>${book.title}</h4>
                <div class="book-actions" style="display: flex; gap: 10px;">
                    ${book.pdf ? `<a href="${book.pdf}" target="_blank" style="color: #3498db; text-decoration: none;">View PDF</a>` : ''}
                    ${book.video ? `<a href="${book.video}" target="_blank" style="color: #3498db; text-decoration: none;">View Video</a>` : ''}
                    <button onclick="deleteBook(${book.id})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load books:', error);
    }
}

// Load all lessons for admin management
async function loadLessonsForAdmin() {
    try {
        const lessons = await lessonAPI.getAll();
        const lessonsList = document.getElementById('lessonsList');
        
        if (!lessonsList) return;

        if (!lessons || lessons.length === 0) {
            lessonsList.innerHTML = '<p>No lessons added yet.</p>';
            return;
        }

        lessonsList.innerHTML = lessons.map(lesson => `
            <div class="item">
                <h4>${lesson.title}</h4>
                <p>Start: ${new Date(lesson.startTime).toLocaleString()}</p>
                <p>End: ${new Date(lesson.endTime).toLocaleString()}</p>
                <a href="${lesson.zoomLink}" target="_blank" style="color: #3498db; text-decoration: none;">Zoom Link</a>
                <button onclick="deleteLesson(${lesson.id})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load lessons:', error);
    }
}

// Load all quiz questions for admin management
async function loadQuizForAdmin() {
    try {
        const questions = await quizAPI.getAll();
        const quizList = document.getElementById('quizList');
        
        if (!quizList) return;

        if (!questions || questions.length === 0) {
            quizList.innerHTML = '<p>No quiz questions added yet.</p>';
            return;
        }

        quizList.innerHTML = questions.map(q => `
            <div class="item">
                <h4>${q.q}</h4>
                <p><strong>A)</strong> ${q.a}</p>
                <p><strong>B)</strong> ${q.b}</p>
                <p><strong>C)</strong> ${q.c}</p>
                <p><strong>Correct:</strong> ${q.correct.toUpperCase()}</p>
                <button onclick="deleteQuiz(${q.id})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load quiz:', error);
    }
}

// Delete functions
async function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        try {
            await bookAPI.delete(bookId);
            alert('Book deleted successfully');
            if (typeof loadBooksForAdmin === 'function') loadBooksForAdmin();
        } catch (error) {
            alert('Failed to delete book: ' + error.message);
        }
    }
}

async function deleteLesson(lessonId) {
    if (confirm('Are you sure you want to delete this lesson?')) {
        try {
            await lessonAPI.delete(lessonId);
            alert('Lesson deleted successfully');
            if (typeof loadLessonsForAdmin === 'function') loadLessonsForAdmin();
        } catch (error) {
            alert('Failed to delete lesson: ' + error.message);
        }
    }
}

async function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this question?')) {
        try {
            await quizAPI.delete(quizId);
            alert('Question deleted successfully');
            if (typeof loadQuizForAdmin === 'function') loadQuizForAdmin();
        } catch (error) {
            alert('Failed to delete question: ' + error.message);
        }
    }
}