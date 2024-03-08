require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const signuproutes = require("./routes/signup");
const loginroutes = require("./routes/login");
const publishOffer = require("./routes/offers");

app.use(signuproutes);
app.use(loginroutes);
app.use(publishOffer);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
