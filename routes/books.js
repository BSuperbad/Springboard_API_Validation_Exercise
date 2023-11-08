const express = require("express");
const Book = require("../models/book");
const ExpressError = require("../expressError");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json")
const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({
      books
    });
  } catch (err) {
    return next(err);
  }
});

/** GET /[isbn]  => {book: book} */

router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({
      book
    });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);
    if (!result.valid) {
      console.log(result);
      const listOfErrors = result.errors.map(e => e.stack);
      const err = new ExpressError(listOfErrors, 400);
      return next(err);
    }
    const book = await Book.create(req.body);
    return res.status(201).json({
      book
    });
  } catch (e) {
    return next(e);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);
    if (!result.valid) {
      console.log(result);
      const listOfErrors = result.errors.map(e => e.stack);
      const err = new ExpressError(listOfErrors, 400);
      return next(err)
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({
      book
    });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({
      message: "Book deleted"
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;