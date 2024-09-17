const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   res.send(JSON.stringify(books),null,4);
// });

// TASK 10
function getBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}
public_users.get('/', async function (req, res) {
  try {
    const books = await getBooks();
    res.send(JSON.stringify(books));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//   const isbn = req.params.isbn;
//   return res.status(200).json(books[isbn]);
// });

// TASK 11
function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbn_number = parseInt(isbn);
        if (books[isbn_number]) {
            resolve(books[isbn_number]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    getByISBN(req.params.isbn)
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});

// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   const author = req.params.author;
//   const book = Object.values(books).filter(book => book.author === author);
//   return res.status(200).json(book);
// });

// TASK 12
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   const title = req.params.title;
//   const book = Object.values(books).filter(book => book.title === title);
//   return res.status(200).json(book);
// });

// TASK 13
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  return res.status(200).json(book.reviews)
});

module.exports.general = public_users;
