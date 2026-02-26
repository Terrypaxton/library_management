# Lumina Library System

A comprehensive Java-based Library Management System with both a Command Line Interface (CLI) and a web-based Dashboard.

## Features

- **Add Book:** Add new books to the library catalog with ID, Title, Author, and Price.
- **Show Books:** View the complete library catalog and see whether books are available or issued.
- **Issue Book:** Assign an available book to a library member.
- **Return Book:** Process the return of an issued book, making it available again.
- **Delete Book:** Completely remove a book from the system.
- **Dual Interface:** Run operations from a terminal CLI or use the web-based visual Dashboard.

## Technologies Used

- **Backend:** Java (JDK built-in `HttpServer` for the API)
- **Frontend:** HTML5, Vanilla CSS, JavaScript
- **Icons:** Ionicons

## Project Structure

```
Library/
│
├── backend/
│   ├── book.java           # Book entity model
│   ├── Library.java        # Core library logic and state management
│   ├── Main.java           # CLI Entry Point
│   ├── Members.java        # Member entity model
│   └── WebServer.java      # HTTP Server and REST API Endpoints
│
└── frontend/
    ├── index.html          # Main Dashboard and User Interface
    ├── style.css           # Styling and layout rules
    └── script.js           # API integration and UI interactions
```

## How to Run

### Command Line Interface (CLI)

1. Navigate to the `backend` directory.
2. Compile the Java files:
   ```bash
   javac *.java
   ```
3. Run the complete CLI application:
   ```bash
   java Main
   ```

### Web Application

1. Navigate to the `backend` directory.
2. Compile the Java files:
   ```bash
   javac *.java
   ```
3. Start the Web Server:
   ```bash
   java WebServer
   ```
   *The server will start locally on port 8080.*
4. Open the frontend dashboard:
   Open `frontend/index.html` in your favorite web browser.

## API Endpoints

The web server exposes the following endpoints internally for the Dashboard logic:

- `GET /api/books`: Retrieves all books in the catalog.
- `POST /api/books`: Adds a new book. Needs JSON `{ "id": 123, "title": "...", "author": "...", "price": 0 }`.
- `POST /api/issue`: Issues a book. Needs JSON `{ "id": 123, "name": "Member Name" }`.
- `POST /api/return`: Returns a book. Needs JSON `{ "id": 123 }`.
- `POST /api/delete`: Deletes a book. Needs JSON `{ "id": 123 }`.

## License

This project is open-source and available for educational and personal use.
