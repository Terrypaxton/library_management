import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public class WebServer {
    private static Library library = new Library();

    public static void main(String[] args) throws IOException {
        // Pre-populate some books
        library.addBook(new book(101, "Effective Java", false, null, 45, "Joshua Bloch"));
        library.addBook(new book(102, "Clean Code", true, "Alice", 40, "Robert C. Martin"));

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Setup API routes
        server.createContext("/api/books", new BooksHandler());
        server.createContext("/api/issue", new IssueHandler());
        server.createContext("/api/return", new ReturnHandler());

        server.setExecutor(null); // creates a default executor
        server.start();
        System.out.println("Server started on http://localhost:8080");
        System.out.println("Open the frontend index.html in your browser!");

        try {
            Thread.currentThread().join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    // Utility for CORS and sending response
    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        // Enable CORS
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    // Handler for getting all books and adding a new book
    static class BooksHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                sendResponse(exchange, 204, "");
                return;
            }

            if (exchange.getRequestMethod().equals("GET")) {
                ArrayList<book> books = library.getBooks();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < books.size(); i++) {
                    book b = books.get(i);
                    json.append(String.format(
                            "{\"id\":%d, \"title\":\"%s\", \"author\":\"%s\", \"price\":%d, \"isIssued\":%b, \"issuedTo\":%s}",
                            b.getId(),
                            escapeJson(b.getTitle()),
                            escapeJson(b.getAuthor()),
                            b.getPrice(),
                            b.isIssued(),
                            b.getIssuedTo() == null ? "null" : "\"" + escapeJson(b.getIssuedTo()) + "\""));
                    if (i < books.size() - 1)
                        json.append(",");
                }
                json.append("]");
                sendResponse(exchange, 200, json.toString());
            } else if (exchange.getRequestMethod().equals("POST")) {
                // Read request body
                InputStream is = exchange.getRequestBody();
                String body = "";
                try (java.util.Scanner scanner = new java.util.Scanner(is, StandardCharsets.UTF_8.name())
                        .useDelimiter("\\A")) {
                    body = scanner.hasNext() ? scanner.next() : "";
                }
                // Extremely simple JSON parsing (assuming expected format from our frontend)
                try {
                    int id = Integer.parseInt(extractJsonValue(body, "id"));
                    String title = extractJsonString(body, "title");
                    String author = extractJsonString(body, "author");
                    int price = Integer.parseInt(extractJsonValue(body, "price"));

                    // Check if book exists
                    boolean exists = false;
                    for (book b : library.getBooks()) {
                        if (b.getId() == id) {
                            exists = true;
                            break;
                        }
                    }

                    if (exists) {
                        sendResponse(exchange, 400, "{\"error\":\"Book ID already exists\"}");
                        return;
                    }

                    book newBook = new book(id, title, false, null, price, author);
                    library.addBook(newBook);
                    sendResponse(exchange, 200, "{\"success\":true}");
                } catch (Exception e) {
                    sendResponse(exchange, 400, "{\"error\":\"Invalid request data\"}");
                }
            }
        }
    }

    static class IssueHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                sendResponse(exchange, 204, "");
                return;
            }

            if (exchange.getRequestMethod().equals("POST")) {
                InputStream is = exchange.getRequestBody();
                String body = "";
                try (java.util.Scanner scanner = new java.util.Scanner(is, StandardCharsets.UTF_8.name())
                        .useDelimiter("\\A")) {
                    body = scanner.hasNext() ? scanner.next() : "";
                }
                try {
                    int id = Integer.parseInt(extractJsonValue(body, "id"));
                    String name = extractJsonString(body, "name");

                    boolean success = library.issueBook(id, name);
                    if (success) {
                        sendResponse(exchange, 200, "{\"success\":true}");
                    } else {
                        sendResponse(exchange, 400,
                                "{\"error\":\"Could not issue book (not found or already issued)\"}");
                    }
                } catch (Exception e) {
                    sendResponse(exchange, 400, "{\"error\":\"Invalid request data\"}");
                }
            }
        }
    }

    static class ReturnHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                sendResponse(exchange, 204, "");
                return;
            }

            if (exchange.getRequestMethod().equals("POST")) {
                InputStream is = exchange.getRequestBody();
                String body = "";
                try (java.util.Scanner scanner = new java.util.Scanner(is, StandardCharsets.UTF_8.name())
                        .useDelimiter("\\A")) {
                    body = scanner.hasNext() ? scanner.next() : "";
                }
                try {
                    int id = Integer.parseInt(extractJsonValue(body, "id"));

                    boolean success = library.returnBook(id);
                    if (success) {
                        sendResponse(exchange, 200, "{\"success\":true}");
                    } else {
                        sendResponse(exchange, 400, "{\"error\":\"Could not return book (not found or not issued)\"}");
                    }
                } catch (Exception e) {
                    sendResponse(exchange, 400, "{\"error\":\"Invalid request data\"}");
                }
            }
        }
    }

    // Helper functions for simple JSON extraction without a library
    private static String extractJsonValue(String json, String key) {
        String pattern = "\"" + key + "\":";
        int start = json.indexOf(pattern);
        if (start == -1)
            return "0";
        start += pattern.length();

        int end = json.indexOf(",", start);
        if (end == -1)
            end = json.indexOf("}", start);
        if (end == -1)
            end = json.length();

        return json.substring(start, end).trim();
    }

    private static String extractJsonString(String json, String key) {
        String pattern = "\"" + key + "\":\"";
        int start = json.indexOf(pattern);
        if (start == -1)
            return "";
        start += pattern.length();

        int end = json.indexOf("\"", start);
        if (end == -1)
            return "";

        return json.substring(start, end);
    }

    private static String escapeJson(String s) {
        if (s == null)
            return null;
        return s.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
