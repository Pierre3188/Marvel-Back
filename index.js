require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

//Déclarations des routes utilisées
const comicsroutes = require("./routes/comics");
const charactersroutes = require("./routes/characters");
const loginroutes = require("./routes/login");
const signuproutes = require("./routes/signup");
const bookmarkroutes = require("./routes/bookmarks");

app.use(comicsroutes);
app.use(charactersroutes);
app.use(loginroutes);
app.use(signuproutes);
app.use(bookmarkroutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
