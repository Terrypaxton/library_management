import java.util.ArrayList;

public class Library {

    private ArrayList<book> books = new ArrayList<book>();

    public boolean addBook(book b) {
        books.add(b);
        System.out.println("\n\nBook added to library.\n\n");
        return true;
    }

    public ArrayList<book> getBooks() {
        return books;
    }

    public void showBooks() {
        for (int i = 0; i < books.size(); i++) {
            book b = books.get(i);
            b.displayBook();
        }
    }

    public boolean issueBook(int id, String name) {
        for (int i = 0; i < books.size(); i++) {
            book b = books.get(i);

            if (b.getId() == id) {
                return b.issueBook(name);
            }
        }

        System.out.println("\n\nBook not found.\n\n");
        return false;
    }

    public boolean returnBook(int id) {
        for (int i = 0; i < books.size(); i++) {
            book b = books.get(i);

            if (b.getId() == id) {
                return b.returnBook();
            }
        }

        System.out.println("\n\nBook not found.\n\n");
        return false;
    }
}