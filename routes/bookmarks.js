const express = require("express");
const router = express.Router();

// import model
const Bookmarks = require("../models/Bookmarks");
const { get } = require("mongoose");

// Route to create a Bookmarks
router.post("/bookmarks", async (req, res) => {
  try {
    const { elementId, title, name, path, extension } = req.body;
    const newBookmarks = new Bookmarks({
      elementId,
      title,
      name,
      path,
      extension,
      owner: req.user,
    });
    await newBookmarks.save();
    res.status(200).json(newBookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get all Bookmarks
router.get("/bookmarks", async (req, res) => {
  try {
    const newBookmarks = await Bookmarks.find({ owner: req.user });
    console.log("Signe de vie");
    res.status(200).json(newBookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a Bookmarks by id
router.delete("/bookmarks/:id", async (req, res) => {
  try {
    await Bookmarks.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Bookmarks deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
