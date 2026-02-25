// Elements
const menuItems = document.querySelectorAll('.menu-item');
const viewSections = document.querySelectorAll('.view-section');

// API Base URL
const API_URL = 'http://localhost:8080/api';

// Event Listeners for Navigation
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all menu items
        menuItems.forEach(menu => menu.classList.remove('active'));
        // Add active to clicked item
        item.classList.add('active');

        // Hide all views
        viewSections.forEach(section => section.classList.remove('active'));

        // Show target view
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Fetch data if switching to views that display data
        if (targetId === 'dashboard') loadDashboard();
        if (targetId === 'show-books') loadCatalog();
    });
});

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Fetch and Render Functions
async function fetchBooks() {
    try {
        const res = await fetch(`${API_URL}/books`);
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch books", err);
        return [];
    }
}

async function loadDashboard() {
    const books = await fetchBooks();
    const total = books.length;
    const issued = books.filter(b => b.isIssued).length;
    const available = total - issued;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-issued').textContent = issued;
    document.getElementById('stat-available').textContent = available;

    // Render Recent
    const recentList = document.getElementById('recent-books-list');
    recentList.innerHTML = '';
    const recentBooks = books.slice(-5).reverse();

    recentBooks.forEach(b => {
        const tr = document.createElement('tr');
        const badgeClass = b.isIssued ? 'badge-warning' : 'badge-success';
        const statusText = b.isIssued ? 'Issued' : 'Available';

        tr.innerHTML = `
            <td>#${b.id}</td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
        `;
        recentList.appendChild(tr);
    });
}

async function loadCatalog() {
    const books = await fetchBooks();
    const catalogList = document.getElementById('all-books-list');
    catalogList.innerHTML = '';

    books.forEach(b => {
        const badgeClass = b.isIssued ? 'badge-warning' : 'badge-success';
        const statusText = b.isIssued ? 'Issued' : 'Available';
        const issuedToText = b.isIssued ? b.issuedTo : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${b.id}</td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td>₹${b.price}</td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
            <td>${issuedToText}</td>
        `;
        catalogList.appendChild(tr);
    });
}

// Form Submissions
document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('bookId').value);
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const price = parseInt(document.getElementById('bookPrice').value);

    try {
        const res = await fetch(`${API_URL}/books`, {
            method: 'POST',
            body: JSON.stringify({ id, title, author, price })
        });
        const data = await res.json();

        if (data.success) {
            e.target.reset();
            showToast("Book added successfully!");
            loadDashboard();
            loadCatalog();
        } else {
            showToast(data.error || "Failed to add book");
        }
    } catch (err) {
        showToast("Network error checking backend");
    }
});

document.getElementById('issueBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('issueBookId').value);
    const name = document.getElementById('issueMemberName').value;

    try {
        const res = await fetch(`${API_URL}/issue`, {
            method: 'POST',
            body: JSON.stringify({ id, name })
        });
        const data = await res.json();

        if (data.success) {
            e.target.reset();
            showToast(`Book #${id} issued to ${name}`);
            loadDashboard();
            loadCatalog();
        } else {
            showToast(data.error || "Failed to issue book");
        }
    } catch (err) {
        showToast("Network error checking backend");
    }
});

document.getElementById('returnBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('returnBookId').value);

    try {
        const res = await fetch(`${API_URL}/return`, {
            method: 'POST',
            body: JSON.stringify({ id })
        });
        const data = await res.json();

        if (data.success) {
            e.target.reset();
            showToast(`Book #${id} returned successfully`);
            loadDashboard();
            loadCatalog();
        } else {
            showToast(data.error || "Failed to return book");
        }
    } catch (err) {
        showToast("Network error checking backend");
    }
});

// Initial Render
loadDashboard();
loadCatalog();
