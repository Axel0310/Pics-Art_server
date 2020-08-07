const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Image = require("../models/Image");
const fileUploader = require("../config/cloudinary");
const bcrypt = require("bcrypt");

const salt = 10;

//Get all connected user's notifications
router.get("/notifications", async (req, res, next) => {
  try {
    const user = await User.findById(req.session.currentUser._id)
      .select("notifications")
      .populate("notifications.user", "name")
      .populate("notifications.image", "url")
    res.status(200).json(user.notifications);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get one user from its ID
router.get("/:id", async (req, res, next) => {
  try {
    const fetchedUser = await User.findById(req.params.id).populate("images");
    const userObj = fetchedUser.toObject();
    delete userObj.password;
    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Search users based on name
router.get("/search/:query", async (req, res, next) => {
  try {
    const fetchedUser = await User.find({
      name: { $regex: req.params.query, $options: "i" },
    });
    res.status(200).json(fetchedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Update connected user profile
router.patch(
  "/",
  fileUploader.single("profilePicture"),
  async (req, res, next) => {
    const updatedInputs = { ...req.body };

    if (req.file) updatedInputs.profilePicture = req.file.path;

    if (Object.keys(updatedInputs).length === 0) {
      console.log("fooo");
      return res.status(200).json({ message: "No update provided" });
    }

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

// Update subscriptions and followers of users
router.patch("/follow", async (req, res, next) => {
  const { connectedUserId, profileUserId } = req.body;

  try {
    const connectedUser = await User.findById(connectedUserId);
    const profileUser = await User.findById(profileUserId);

    let updatedSubs = [];
    let updatedFollowers = [];

    if (connectedUser.subscriptions.includes(profileUserId)) {
      updatedSubs = connectedUser.subscriptions.filter(
        (userId) => userId != profileUserId
      ); //The user ID corresponding to the profil viewed is removed from the subscriptions of the connected user
      updatedFollowers = profileUser.followers.filter(
        (userId) => userId != connectedUserId
      ); //The connected user ID is removed from the followers of the profile user
    } else {
      updatedSubs.push(profileUserId); //The user ID corresponding to the profil viewed is added to the subscriptions of the connected user
      updatedFollowers.push(connectedUserId); //The connected user ID is added to the followers array of the profile user
    }

    let updatedConnectedUser = await User.findByIdAndUpdate(
      connectedUserId,
      {
        subscriptions: updatedSubs,
      },
      { new: true }
    );
    let updatedProfileUser = await User.findByIdAndUpdate(
      profileUserId,
      {
        followers: updatedFollowers,
      },
      { new: true }
    );

    updatedConnectedUser = updatedConnectedUser.toObject();
    delete updatedConnectedUser.password;
    updatedProfileUser = updatedProfileUser.toObject();
    delete updatedProfileUser.password;

    res.status(200).json({ updatedConnectedUser, updatedProfileUser });
  } catch (error) {
    res.status(500).json(error);
  }
});

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
