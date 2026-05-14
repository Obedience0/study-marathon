async function addBook(){
    const title = document.getElementById('bookTitle').value;
    const pdfFile = document.getElementById('bookFile').files[0];
    const video = document.getElementById('videoLink').value;

    if (title && pdfFile) {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('pdf', pdfFile);
            formData.append('video', video);

            await bookAPI.create(formData);
            clearBookForm();
            alert("Book added successfully!");
            loadBooks(); // Reload the books list
        } catch (error) {
            alert("Error adding book: " + error.message);
        }
    } else {
        alert("Please fill in title and select a PDF file");
    }
}

async function addLesson(){
    const title = document.getElementById('lessonTitle').value;
    const zoomLink = document.getElementById('zoomLink').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (title && zoomLink && startTime && endTime) {
        try {
            await lessonAPI.create({
                title: title,
                zoomLink: zoomLink,
                startTime: startTime,
                endTime: endTime
            });
            clearLessonForm();
            alert("Lesson added successfully!");
            loadLessons(); // Reload the lessons list
        } catch (error) {
            alert("Error adding lesson: " + error.message);
        }
    } else {
        alert("Please fill in all lesson fields");
    }
}

async function addQuiz(){
    const question = document.getElementById('question').value;
    const a = document.getElementById('a').value;
    const b = document.getElementById('b').value;
    const c = document.getElementById('c').value;
    const correct = document.getElementById('correct').value;

    if (question && a && b && c && correct) {
        try {
            await quizAPI.create({
                question: question,
                a: a,
                b: b,
                c: c,
                correct: correct
            });
            clearQuizForm();
            alert("Quiz question added successfully!");
            loadQuiz(); // Reload the quiz list
        } catch (error) {
            alert("Error adding quiz question: " + error.message);
        }
    } else {
        alert("Please fill in all quiz fields");
    }
}

function clearBookForm() {
    document.getElementById('bookTitle').value = "";
    document.getElementById('bookFile').value = "";
    document.getElementById('videoLink').value = "";
}

function clearLessonForm() {
    document.getElementById('lessonTitle').value = "";
    document.getElementById('zoomLink').value = "";
    document.getElementById('startTime').value = "";
    document.getElementById('endTime').value = "";
}

function clearQuizForm() {
    document.getElementById('question').value = "";
    document.getElementById('a').value = "";
    document.getElementById('b').value = "";
    document.getElementById('c').value = "";
    document.getElementById('correct').value = "";
}

async function loadBooks() {
    try {
        const books = await bookAPI.getAll();
        const booksList = document.getElementById("booksList");
        booksList.innerHTML = "<h4>Books</h4>";

        if (books.length === 0) {
            booksList.innerHTML += "<p>No books found.</p>";
            return;
        }

        books.forEach(book => {
            booksList.innerHTML += `
                <div class="item">
                    <p><strong>${book.title}</strong></p>
                    <p>PDF: ${book.pdf || 'N/A'}</p>
                    <p>Video: ${book.video || 'N/A'}</p>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading books:', error);
        document.getElementById("booksList").innerHTML = "<h4>Books</h4><p>Error loading books.</p>";
    }
}

async function loadLessons() {
    try {
        const lessons = await lessonAPI.getAll();
        const lessonsList = document.getElementById("lessonsList");
        lessonsList.innerHTML = "<h4>Lessons</h4>";

        if (lessons.length === 0) {
            lessonsList.innerHTML += "<p>No lessons found.</p>";
            return;
        }

        lessons.forEach(lesson => {
            lessonsList.innerHTML += `
                <div class="item">
                    <p><strong>${lesson.title}</strong></p>
                    <p>Zoom: ${lesson.zoomLink}</p>
                    <p>Start: ${new Date(lesson.startTime).toLocaleString()}</p>
                    <p>End: ${new Date(lesson.endTime).toLocaleString()}</p>
                    <button onclick="deleteLesson(${lesson.id})">Delete</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading lessons:', error);
        document.getElementById("lessonsList").innerHTML = "<h4>Lessons</h4><p>Error loading lessons.</p>";
    }
}

async function loadQuiz() {
    try {
        const questions = await quizAPI.getAll();
        const quizList = document.getElementById("quizList");
        quizList.innerHTML = "<h4>Quiz Questions</h4>";

        if (questions.length === 0) {
            quizList.innerHTML += "<p>No quiz questions found.</p>";
            return;
        }

        questions.forEach(q => {
            quizList.innerHTML += `
                <div class="item">
                    <p><strong>Q:</strong> ${q.q}</p>
                    <p>A: ${q.a}, B: ${q.b}, C: ${q.c}</p>
                    <p>Correct: ${q.correct}</p>
                    <button onclick="deleteQuizQuestion(${q.id})">Delete</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading quiz:', error);
        document.getElementById("quizList").innerHTML = "<h4>Quiz Questions</h4><p>Error loading quiz questions.</p>";
    }
}

function loadUsers() {
    const usersList = document.getElementById("usersList");
    usersList.innerHTML = "<h4>Users</h4><p>User management requires backend implementation.</p>";
}

async function loadMessages() {
    try {
        const messages = await chatAPI.getAll();
        const messagesList = document.getElementById("messagesList");
        messagesList.innerHTML = "<h4>Chat Messages</h4>";

        if (messages.length === 0) {
            messagesList.innerHTML += "<p>No messages found.</p>";
            return;
        }

        messages.forEach(msg => {
            messagesList.innerHTML += `
                <div class="item">
                    <p><strong>${msg.user}:</strong> ${msg.text}</p>
                    <button onclick="deleteMessage(${msg.id})">Delete</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById("messagesList").innerHTML = "<h4>Chat Messages</h4><p>Error loading messages.</p>";
    }
}

async function deleteBook(bookId) {
    if (confirm("Are you sure you want to delete this book?")) {
        try {
            await bookAPI.delete(bookId);
            alert("Book deleted successfully!");
            loadBooks();
        } catch (error) {
            alert("Error deleting book: " + error.message);
        }
    }
}

async function deleteLesson(lessonId) {
    if (confirm("Are you sure you want to delete this lesson?")) {
        try {
            await lessonAPI.delete(lessonId);
            alert("Lesson deleted successfully!");
            loadLessons();
        } catch (error) {
            alert("Error deleting lesson: " + error.message);
        }
    }
}

async function deleteQuizQuestion(questionId) {
    if (confirm("Are you sure you want to delete this quiz question?")) {
        try {
            await quizAPI.delete(questionId);
            alert("Quiz question deleted successfully!");
            loadQuiz();
        } catch (error) {
            alert("Error deleting quiz question: " + error.message);
        }
    }
}

async function deleteMessage(messageId) {
    if (confirm("Are you sure you want to delete this message?")) {
        try {
            await chatAPI.delete(messageId);
            alert("Message deleted successfully!");
            loadMessages();
        } catch (error) {
            alert("Error deleting message: " + error.message);
        }
    }
}

function logout(){
    window.location = "index.html";
}