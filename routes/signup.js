const express = require("express");
const uid2 = require("uid2"); // Sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // Sert à hasher
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2; // On n'oublie pas le `.v2` à la fin

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//Import du modèle User
const User = require("../models/User");
const convertToBase64 = require("../utils/convertToBase64");

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const newsletter = req.body.newsletter;
    uploadResult = { secure_url: null };
    if (req.files !== undefined) {
      const convertedPict = convertToBase64(req.files.picture);
      uploadResult = await cloudinary.uploader.upload(convertedPict);
    }
    console.log(req.files);
    //Gestion de la partie password
    //Création de la partie salt (chaine de caractère supplémentaire adossée au password client)
    const salt = uid2(16);
    //console.log("salt   ", salt);
    //encryptage de la concaténation password + salt
    const hash = SHA256(password + salt).toString(encBase64);
    //console.log("hash    ", hash);
    //Token
    const token = uid2(64);
    //console.log("token   ", token);
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing parameter" });
    }

    const tryuser = await User.findOne({ email: email });
    console.log(tryuser);
    if (!tryuser) {
      //Création du nouvel utilisateur en BDD
      const newUser = new User({
        email: email,
        account: { username: username, avatar: uploadResult },
        newsletter: newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });

      //Sauvegarde de la BDD
      await newUser.save();

      const rspObj = {
        _id: newUser.id,
        token: newUser.token,
        account: {
          username: newUser.account.username,
        },
      };
      //Réponse à l'utilisateur
      res.status(201).json(rspObj);
      console.log("Nouvel utilisateur sauvé");
    } else {
      return res
        .status(409)
        .json({ message: "There is already an account with this email" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'enregistrement :(" + error.message.data,
    });
  }
});

module.exports = router;
