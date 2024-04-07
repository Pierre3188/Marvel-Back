const express = require("express");
const router = express.Router();
router.use(express.json());
const axios = require("axios");

//Get all informations of specific comic
router.get("/comic/:comicId", async (req, res) => {
  try {
    const { comicId } = req.params;
    console.log(req.params.comicId);
    const APIurl = `https://lereacteur-marvel-api.herokuapp.com/comic/${comicId}?apiKey=${process.env.REACTEUR_API_KEY}`;
    const response = await axios.get(APIurl);

    res.status(200).json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: error.response.data });
  }
});

//Get a list of comics
router.get("/comics", async (req, res) => {
  try {
    const { limit, skip, title } = req.query;

    let url = `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.REACTEUR_API_KEY}`;
    // if limit is defined
    if (limit) {
      url += `&limit=${limit}`;
    }
    // if skip is defined
    if (skip) {
      url += `&skip=${skip}`;
    }
    // if name is defined
    if (title) {
      url += `&title=${title}`;
    }

    const response = await axios.get(url);

    res.status(200).json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: error.response.data });
  }
});

//Get a list of comics containing a specific character
router.get("/comics/:characterId", async (req, res) => {
  try {
    const characterId = req.params.characterId;

    let url = `https://lereacteur-marvel-api.herokuapp.com/comics/${characterId}?apiKey=${process.env.REACTEUR_API_KEY}`;

    const response = await axios.get(url);

    res.status(200).json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: error.response.data });
  }
});

module.exports = router;
