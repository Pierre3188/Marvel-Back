const cloudinary = require("cloudinary").v2; // On n'oublie pas le `.v2` à la fin
const express = require("express");
const bdd = require("mongoose");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const router = express.Router();
router.use(express.json());

// Configuration du compte cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Article = require("../models/Article");

//Supprimer un article
router.delete(
  "/offer/delete",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      let title = req.body.title;
      token = req.user;
      console.log(title, token);

      const isFileExist = await Article.findOneAndDelete(
        { title: title },
        { owner: ({ token } = token) }
      );
      console.log(isFileExist);
      if (!isFileExist) {
        return res.status(500).json("Erreur le fichier demandé n'existe pas");
      }
      res.status(201).json("Suppression effectuée");
    } catch {
      res.status(500).json("Erreur lors de la suppression" + error.message);
    }
  }
);

//Modifier un article
router.put("/offer/modify", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } =
      req.body;
    token = req.user;
    //console.log(title, description);

    const isFileExist = await Article.findOne(
      { title: title },
      { owner: ({ token } = token) }
    ).populate("owner");
    console.log(isFileExist);
    if (!isFileExist) {
      return res.status(500).json("Erreur le fichier demandé n'existe pas");
    }

    const root = `vinted/offers/${isFileExist.id}`;

    const convertedPict = convertToBase64(req.files.picture);
    const uploadResult = await cloudinary.uploader.upload(convertedPict, {
      folder: root,
    });
    const data_owner = await Article.findByIdAndUpdate(
      isFileExist.id,
      {
        title: title,
        description: description,
        price: price,
        product: [
          {
            brand: brand,
            size: size,
            condition: condition,
            color: color,
            city: city,
          },
        ],
        picture: { secure_url: uploadResult.secure_url },
      },
      { new: true }
    );

    res.status(200).json(data_owner);
  } catch (error) {
    res.status(500).json("Erreur lors de la modification" + error.message);
  }
});

//Publier un article
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      //console.log(req.body);

      //console.log("Je glisse");
      if (!req.files) {
        return res.status(401).json({ message: "Il manque une image" });
      }

      const newarticle = new Article({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ETAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        product_image: { secure_url: "" },
        owner: req.user,
      });

      await newarticle.save();
      console.log(newarticle);

      const root = `vinted/offers/${newarticle.id}`;
      //console.log(root);
      const convertedPict = convertToBase64(req.files.picture);
      const uploadResult = await cloudinary.uploader.upload(convertedPict, {
        folder: root,
      });
      const data_owner = await Article.findByIdAndUpdate(
        newarticle.id,
        {
          picture: { uploadResult },
        },
        { new: true }
      ).populate("owner", "account");

      //console.log(data_owner.product_details);
      //console.log(data_owner.product_details);

      const display = {
        id: data_owner.id,
        product_name: data_owner.title,
        product_description: data_owner.description,
        product_price: data_owner.price,
        product_details: [
          { MARQUE: data_owner.product_details.brand },
          { TAILLE: data_owner.product_details.size },
          { ETAT: data_owner.product_details.condition },
          { COULEUR: data_owner.product_details.color },
          { EMPLACEMENT: data_owner.product_details.city },
        ],
        owner: {
          account: {
            username: data_owner.owner.account.username,
            avatar: { secure_url: data_owner.owner.account.avatar.secure_url },
          },
        },
        product_image: { secure_url: data_owner.picture },
      };
      // console.log(display);
      res.status(200).json({ message: display });
    } catch (error) {
      res.status(500).json({
        message: "Error during the publish of an offer " + error.message,
      });
    }
  }
);

//Obtenir les articles filtrés
router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    //console.log(req.query);
    const { title, priceMin, priceMax, sort, page } = req.query;
    const max_pg = 3;
    let Userdisplay = ["0", "0"]; //skip / limit
    let Userfilter = {};
    let Fsort = {};

    //console.log(title, priceMin, priceMax, sort, page);
    if (page !== undefined) {
      // Je souhaite afficher les résultats présents sur la page X (skip : 0, limit : 5) / page
      Userdisplay[0] = (page - 1) * max_pg;
      Userdisplay[1] = max_pg;
      console.log(Userdisplay[0], Userdisplay[1]);
    }

    if (title !== undefined) {
      // Je souhaite filtrer via title
      const regExp = new RegExp(title, "i"); // Permet de créer une RegExp
      Userfilter = { title: regExp };
    }

    if (priceMin) {
      Userfilter.product_price = { $gte: priceMin };
    }

    if (priceMax) {
      if (priceMin) {
        Userfilter.product_price.$lte = priceMax; //ajout de la clé priceMax à la clé product price déjà existante
      } else {
        Userfilter.product_price = { $lte: priceMax };
      }
    }

    //console.log(Userfilter);

    if (sort !== undefined) {
      //On divise la string en deux partie pour avoir ce que l'on doit trier (intitulé) + la manière de trier
      const arr = sort.split("-");
      //On recréer tout ça sous forme d'objet grace au tableau créé
      Fsort[arr[0]] = arr[1];
    }
    const resultOffer = await Article.find(Userfilter)
      .skip(Userdisplay[0])
      .limit(Userdisplay[1])
      .sort(Fsort)
      .populate("owner");
    //console.log(resultOffer);

    const count = await Article.countDocuments(Userfilter);
    console.log(count);
    //   .select("title price")
    //console.log(resultOffer);
    const DisplayOffer = {
      count: count,
      product_details: resultOffer[0].product,
      product_image: resultOffer[0].picture,
      id: resultOffer[0]._id,
      product_name: resultOffer[0].title,
      product_description: resultOffer[0].description,
      product_price: resultOffer[0].price,
      owner: {
        account: {
          username: resultOffer[0].owner.account.username,
          avatar: resultOffer[0].owner.account.avatar.secure_url,
        },
        id: resultOffer[0].owner._id,
      },
    };

    // const responseObject = {
    //   _id: newUser._id,
    //   token: newUser.token,
    //   account: {
    //     username: newUser.account.username,
    //   },
    // };
    console.log(DisplayOffer);
    res.status(200).json({ Offers: DisplayOffer });
  } catch (error) {
    res
      .status(500)
      .json("Erreur lors de l'affichage des articles filtrés " + error.message);
  }
});

router.get("/offers/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;

    const OfferID = await Article.findById(id).populate("owner");

    const DisplayOffer = {
      product_details: OfferID.product,
      product_image: OfferID.picture,
      id: OfferID.id,
      product_name: OfferID.title,
      product_description: OfferID.description,
      product_price: OfferID.price,
      owner: {
        account: {
          username: OfferID.owner.account.username,
          avatar: OfferID.owner.account.avatar.secure_url,
        },
        id: OfferID.owner._id,
      },
      product_image: { secure_url: OfferID.picture.uploadResult.secure_url },
    };

    console.log(DisplayOffer);
    res.status(201).json(DisplayOffer);
  } catch (error) {
    res.status(500).json({ message: "Oups " + error.message });
  }
});
module.exports = router;
