const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const fileUploader = require("../config/cloudinary");

const salt = 10;

router.post("/signin", (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((fetchedUser) => {
    if (!fetchedUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isValidPassword = bcrypt.compareSync(password, fetchedUser.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const userObj = fetchedUser.toObject();
    delete userObj.password;
    req.session.currentUser = userObj;
    res.status(200).json(userObj);
  });
});

router.post(
  "/signup",
  fileUploader.single("profilePicture"),
  (req, res, next) => {
    const { email, password, name, description } = req.body;

    User.findOne({ email })
      .then((fetchedUser) => {
        if (fetchedUser) {
          return res.status(400).json({ message: "Email already taken" });
        }

        const hashedPassword = bcrypt.hashSync(password, salt);
        const newUser = { email, name, password: hashedPassword, description };

        if (req.file) newUser.profilePricture = req.file.path;

        User.create(newUser).then((createdUser) => {
          const userObj = createdUser.toObject();
          delete userObj.password;
          req.session.currentUser = userObj;
          res.status(201).json(userObj);
        });
      })
      .catch(next);
  }
);

router.get("/isLoggedIn", (req, res, next) => {
  if (req.session.currentUser) {
    const id = req.session.currentUser._id;
    User.findById(id)
      .then((userDocument) => {
        const userObj = userDocument.toObject();
        delete userObj.password;
        res.status(200).json(userObj);
      })
      .catch((error) => {
        res.status(401).json(error);
      });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

router.get("/logout", (req, res, next) => {
  req.session.destroy(function (error) {
    if (error) res.status(500).json(error);
    else res.status(200).json({ message: "Succesfully disconnected." });
  });
});

module.exports = router;
