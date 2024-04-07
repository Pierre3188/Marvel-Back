const mongoose = require("mongoose");

const Bookmarks = mongoose.model("Bookmarks", {
  itemId: String,
  title: String,
  name: String,

  path: String,
  extension: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Bookmarks;
