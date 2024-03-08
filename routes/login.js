const express = require("express");
const SHA256 = require("crypto-js/sha256"); // Sert à hasher
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string
const router = express.Router();

//Import du modèle User
const User = require("../models/User");
const { get } = require("mongoose");

router.post("/user/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    console.log(email, password);

    const getUser = await User.findOne({ email: email });
    const display = {
      id: getUser.id,
      token: getUser.token,
      account: { username: getUser.account.username },
    };
    if (!getUser) {
      return res.status(401).json({ message: "Email ou password incorrect" });
    }

    //Comparaison du hash de la concaténation password + salt
    const hash_user = SHA256(password + getUser.salt).toString(encBase64);
    if (getUser.hash === hash_user) {
      console.log("Connexion success");
      res.status(200).json(display);
    } else {
      return res.status(401).json({ message: "Email ou password incorrect" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la requete de login" });
  }
});

module.exports = router;
