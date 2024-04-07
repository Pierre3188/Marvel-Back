const express = require("express");
const router = express.Router();
router.use(express.json());
const axios = require("axios");

//Get a list of characters

router.get(
  "/characters",

  async (req, res) => {
    try {
      const { limit, skip, name } = req.query;
      // API key is mandatory
      let url = `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.REACTEUR_API_KEY}`;
      // if limit is defined
      if (limit) {
        url += `&limit=${limit}`;
      }
      // if skip is defined
      if (skip) {
        url += `&skip=${skip}`;
      }
      // if name is defined
      if (name) {
        url += `&name=${name}`;
      }

      const response = await axios.get(url);

      res.status(200).json({ data: response.data });
    } catch (error) {
      res.status(500).json({ message: error.response.data });
    }
  }
);

//Get a the infos of a specific character
router.get(
  "/character/:characterId",

  async (req, res) => {
    try {
      const { characterId } = req.params;
      // API key is mandatory
      let url = `https://lereacteur-marvel-api.herokuapp.com/character/${characterId}?apiKey=${process.env.REACTEUR_API_KEY}`;

      const response = await axios.get(url);

      res.status(200).json({ data: response.data });
    } catch (error) {
      res.status(500).json({ message: error.response.data });
    }
  }
);

module.exports = router;
