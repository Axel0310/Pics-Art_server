const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    req.session.currentUser = await User.findById("5f27c62fcb27ba313a3cb94e");
    next();
  } catch (error) {
    next(error);
  }
};

//5f2417b0d4e4767346852d40
//5f27c62fcb27ba313a3cb94e