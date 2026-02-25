public class book {

    private int id;
    private String title;
    private boolean isIssued;
    private String issuedTo;
    private int price;
    private String author;

    public book(int id, String title, boolean isIssued, String issuedTo, int price, String author) {
        this.id = id;
        this.title = title;
        this.isIssued = isIssued;
        this.issuedTo = issuedTo;
        this.price = price;
        this.author = author;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public boolean isIssued() {
        return isIssued;
    }

    public String getIssuedTo() {
        return issuedTo;
    }

    public int getPrice() {
        return price;
    }

    public String getAuthor() {
        return author;
    }

    public boolean issueBook(String name) {
        if (!isIssued) {
            isIssued = true;
            issuedTo = name;
            System.out.println("\n\nBook issued successfully.\n\n");
            return true;
        } else {
            System.out.println("\n\nBook already issued.\n\n");
            return false;
        }
    }

    public boolean returnBook() {
        if (isIssued) {
            isIssued = false;
            issuedTo = null;
            System.out.println("\n\nBook returned successfully.\n\n");
            return true;
        }
        return false;
    }

    public void displayBook() {
        System.out.println("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
        System.out.println("ID: " + id);
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Price: " + price);
        System.out.println("Issued: " + isIssued);
        System.out.println("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
    }
}