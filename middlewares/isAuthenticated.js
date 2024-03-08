const bdd = require("mongoose");

const user = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const receivedToken = req.headers.authorization.replace("Bearer ", "");

    const isTokeninBdd = await user.findOne({ token: receivedToken });
    //console.log(isTokeninBdd.id);
    if (isTokeninBdd !== null) {
      req.user = isTokeninBdd;
      next();
    } else {
      return res.status(401).json("Unauthorized");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
