const { default: mongoose } = require("mongoose");

const user = mongoose.model("User", {
  email: { type: String, required: true },
  account: {
    username: { type: String, required: true },
    avatar: { type: Object, default: { secure_url: {} } },
  },
  newsletter: { type: Boolean, default: false },
  token: String,
  hash: String,
  salt: String,
});

//export du modèle user
module.exports = user;
