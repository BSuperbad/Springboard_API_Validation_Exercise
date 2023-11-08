process.env.NODE_ENV = "test"

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '00000000',
          'amazon.com/testBook',
          'Test Author',
          'English',
          500,
          'Publisher',
          'Test Book', 
          2008)
        RETURNING isbn,
        amazon_url,
        author,
        language,
        pages,
        publisher,
        title,
        year`);

    testBook = result.rows;
});



describe('GET /books', () => {
    test('responds with status 200 and an array of books', async () => {
        const response = await request(app).get('/books');
        const books = response.body.books;
        expect(response.status).toBe(200);
        expect(books).toBeInstanceOf(Array);
        expect(books[0].isbn).toBe('00000000');
    });
});


describe('GET /books/:isbn', () => {
    test('responds with status 200 and returns a single book', async () => {
        const response = await request(app).get(`/books/${testBook[0].isbn}`);
        expect(response.status).toBe(200);
        expect(response.body.book.isbn).toBe('00000000');
    });
    test('responds with a 404 status if isbn not found', async () => {
        const response = await request(app).get('/books/0');
        expect(response.status).toBe(404);
    })
});

describe('POST /books', () => {
    test('posts a new book to the database and returns it', async () => {
        const response = await request(app)
            .post('/books')
            .send({
                "isbn": "0691161519",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane Again",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking Hidden Math in Video Games",
                "year": 2017
            });
        expect(response.status).toBe(201);
        expect(response.body.book.isbn).toBe('0691161519')
    })
    test('responds with a 400 status if required columns are not posted', async () => {
        const response = await request(app)
            .post('/books')
            .send({
                "isbn": "0691161519"
            })
        expect(response.status).toBe(400);
    })
})

describe('PUT /books/:isbn', () => {
    test('updates an existing book in the database and returns it', async () => {
        const response = await request(app)
            .put(`/books/${testBook[0].isbn}`)
            .send({
                "isbn": "00000000",
                "amazon_url": "amazon.com/testBook",
                "author": "New Test Author",
                "language": "English and German",
                "pages": 1000,
                "publisher": "Publisher",
                "title": "Test Book 2",
                "year": 2023
            });
        expect(response.body.book.isbn).toBe('00000000')
        expect(response.body.book.title).toBe('Test Book 2')

    })
    test('responds with a 400 status if required columns are not posted', async () => {
        const response = await request(app)
            .put(`/books/${testBook[0].isbn}`)
            .send({
                "isbn": 1234
            })
        expect(response.status).toBe(400);
    })
})

describe('DELETE /books/:isbn', () => {
    test('deletes an existing book from the database by isbn', async () => {
        const response = await request(app)
            .delete(`/books/${testBook[0].isbn}`)
        expect(response.body).toEqual({
            message: "Book deleted"
        });
    })
    test('responds with a 404 status if isbn not found', async () => {
        const response = await request(app).delete('/books/0');
        expect(response.status).toBe(404);
    })

})






afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});


afterAll(async function () {
    await db.end()
});