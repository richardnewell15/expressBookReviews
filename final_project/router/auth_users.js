const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let isValid = users.filter((user)=> user.username === username);
 if(isValid.length > 0 ){
  return true;
 }else{
  return false;
 }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
        data: password
      }, 'access',{expiresIn : 60 * 60})

      // Store access token and username in session
      req.session.authorization = {
        accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).send("Invalid Login. Check username and password");
  }
});

regd_users.get("/users", (req,res) => {
  return res.send(JSON.stringify(users));
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session.authorization.username;
  if(!username){
    return res.status(404).json({message: "User not authenticated"});
  }
  try {
    if(!books[isbn]){
      return res.status(404).json({message: "book not found"});
    }
    books[isbn].reviews[username] = review;
    const rev =books[isbn].reviews[username];
    return res.status(200).json({message: "Review addedd successfully", rev});
  } catch (err) {
    return res.status(401).json({message: "Invalid token"});
  }

  return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve username from session

    if (!username) {
      return res.status(401).json({ message: "Unauthorized" }); // Handle unauthorized access
    }

    const book = books[isbn];

    if (book) {
      if (book.reviews[username]) { // Check if a review exists for the user
        delete book.reviews[username]; // Delete the user's review
        res.json({ message: "Review deleted successfully" });
      } else {
        res.status(404).json({ message: "Review not found" }); // Handle review not found
      }
    } else {
      res.status(404).json({ message: "Book not found" }); // Handle book not found
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
