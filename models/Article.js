const { default: mongoose } = require("mongoose");

const user = require("./User");

const Article = mongoose.model("Article", {
  product_name: { type: String, maxLength: 50 },
  product_description: { type: String, maxLength: 500 },
  product_price: { type: Number, max: 100000 },
  product_details: Array,
  product_image: Object,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: user },
  product_pictures: Array,
});

//export du modèle user
module.exports = Article;
