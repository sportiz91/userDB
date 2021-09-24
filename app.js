////////////////////////////////////// SETTING UP THE SERVER & DB //////////////////////////////////////
require("dotenv").config(); //It's important to require dotenv in the first line of our code. That's because we have to load up the .env files
//with the sensitive keys as soon as posible. No need to save it in a variable. Only, run config(). Then, we have to create an ".env" file in the
//root directory with the secret keys. The secret key must follow: MY_SECRET=blablabla (no spaces, no ";", no nothing. Is not a JS file, is just
//plain text that we load up in our app.js). It's then important to touch .gitignore, go to github.com/github/gitignore, and copy paste the node template
//into the gitignore created. Then, when we load our repo on GitHub, .env, node_modules and other files will be not loaded up.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const port = 3000;

const app = express();

//In order to tap for the secrets keys, we must perform: process.env.NAME_OF_KEY. We loaded up all our secrets key in the first line of the app (require dotenv)
console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//Setting up the DB:
//1. Connecting to DB. Because we don't have an "userDB" till now, the DB is gonna be created.
mongoose.connect("mongodb://localhost:27017/userDB");

//2. Creating new Schema
const userSchema = new mongoose.Schema({
  user: String,
  pass: String,
});

//2.a) Add plugIns to the Schema created. After this step, we don't have to do anything else (in the login or the register). When the new document is saved, it'll be
//encrypted. When the document is find, it'll be decrypted. When we create a document and touch save, behind the scenes mongoDB will encrypt the password field.
//When later on we try to find the document (in our case, based on the email), the password will be decrypted.

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["pass"],
});

//3. Creating new Model
const User = mongoose.model("User", userSchema);

////////////////////////////////////// GET REQUESTS //////////////////////////////////////

//GET Requests. Remember that GET Requests are used when the user needs to obtain certain web pages or certain resources (images, files, etc) from server.
//GET Requests can be done through the browser (or POSTMAN). If the API you are building is intended to follow the RESTful rules, GET Requests must point
//to the whole collection instead of a particular document. GET Requests are similar to the READ in CRUD.
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

////////////////////////////////////// POST REQUESTS //////////////////////////////////////

app.post("/register", (req, res) => {
  const aNewOne = new User({
    user: req.body.username,
    pass: req.body.password,
  });

  aNewOne.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;

  User.findOne({ user: userName }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.pass === password) {
          res.render("secrets");
        }
      }
    }
  });
});

////////////////////////////////////// SETTING UP THE SERVER //////////////////////////////////////
app.listen(port, () => {
  console.log(`Server up and running on port: ${port}`);
});
