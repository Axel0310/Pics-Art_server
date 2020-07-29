const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Image = require("../models/Image");
const fileUploader = require("../config/cloudinary");

//Get one user from its ID
router.get("/:id", async (req, res, next) => {
  try {
    const fetchedUser = await User.findById(req.params.id);
    res.status(200).json(fetchedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Search users based on name
router.get("/:search", async (req, res, next) => {
  try {
    const fetchedUser = await User.find({
      name: { $regex: req.params.search, $options: "i" },
    });
    res.status(200).json(fetchedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Update user profile
router.patch(
  "/",
  fileUploader.single("profilePicture"),
  async (req, res, next) => {
    const updatedInputs = { ...req.body };

    if (updatedInputs.email) {
      try {
        const fetchedUser = await User.findOne({ email: updatedInputs.email });
        if (fetchedUser) {
          return res.status(400).json({ message: "Email already taken" });
        }
      } catch (error) {
        res.status(500).json(error);
      }
    }

    if (updatedInputs.password) {
      const hashedPassword = bcrypt.hashSync(updatedInputs.password, salt);
      updatedInputs.password = hashedPassword;
    }

    if (req.file) updatedInputs.profilePicture = req.file.path;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.session.currentUser._id,
        updatedInputs,
        { new: true }
      );
      const userObj = updatedUser.toObject();
      delete userObj.password;
      req.session.currentUser = userObj;
      res.status(201).json(userObj);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

//Delete user profile
router.delete("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.session.currentUser._id);

    // Before deleting the user, all its images are deleted.
    const imagesDeletion = [];
    user.images.forEach((imageId) => {
      const deletionPromise = Image.findByIdAndDelete(imageId);
      imagesDeletion.push(deletionPromise);
    });
    await Promise.all(imagesDeletion); // Waiting for the completion of all deletion promises to delete the user

    const deletedUser = await User.findByIdAndDelete(
      req.session.currentUser._id
    );
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
