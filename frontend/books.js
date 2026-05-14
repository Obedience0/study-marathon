// Load books from API
async function loadBooks() {
    try {
        const books = await bookAPI.getAll();
        const booksDiv = document.getElementById("books");
        booksDiv.innerHTML = "";

        if (books.length === 0) {
            booksDiv.innerHTML = "<p>No books available yet. Check back later!</p>";
            return;
        }

        books.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            const videoEmbed = book.video ? book.video.replace("watch?v=", "embed/") : null;

            bookCard.innerHTML = `
                <h3>${book.title}</h3>
                <div class="book-actions">
                    ${book.pdf ? `<a href="${book.pdf}" target="_blank" class="read-btn">📖 Read PDF</a>` : ''}
                </div>
                ${videoEmbed ? `<div class="video-container"><iframe width="300" height="200" src="${videoEmbed}" frameborder="0" allowfullscreen></iframe></div>` : ''}
            `;

            booksDiv.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error loading books:', error);
        document.getElementById("books").innerHTML = "<p>Error loading books. Please try again later.</p>";
    }
}

// Load books when page loads
document.addEventListener('DOMContentLoaded', loadBooks);

function logout(){
    // For now, just redirect to the home page
    window.location = "index.html";
}