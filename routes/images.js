const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
const User = require("../models/User");
const fileUploader = require("../config/cloudinary");

// Get one image based on its ID
router.get("/:id", async (req, res, next) => {
  try {
    const fetchedImage = await Image.findById(req.params.id);
    res.status(200).json(fetchedImage);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all images
router.get("/", async (req, res, next) => {
  try {
    const fetchedImages = await Image.find()
      .populate("creator")
      .populate("likes", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(fetchedImages);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Upload a new image
router.post("/", fileUploader.single("image"), async (req, res, next) => {
  const newImage = { ...req.body };
  const userId = req.session.currentUser._id;
  newImage.url = req.file.path;
  newImage.creator = userId;
  try {
    const createdImage = await Image.create(newImage);

    //Image ID is added to the related user
    const user = await User.findById(userId);
    user.images.push(createdImage._id);
    await User.findByIdAndUpdate(userId, user);
    res.status(201).json(createdImage);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update an image
router.patch("/:id", async (req, res, next) => {
  const updatedInfo = { ...req.body };
  try {
    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      updatedInfo,
      { new: true }
    );
    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete one image based on its Id
router.delete("/:id", async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const imageId = req.params.id;
  try {
    const user = await User.findById(userId);
    const updatedImages = user.images.filter((id) => id != imageId);
    const updatedNotifs = user.notifications.filter(
      (notif) => notif.image != imageId
    );
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { images: updatedImages, notifications: updatedNotifs },
      { new: true }
    );
    await Image.findByIdAndDelete(imageId);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all images of a user
router.get("/profile/:id", async (req, res, next) => {
  try {
    const images = await Image.find({ creator: req.params.id })
      .populate("creator")
      .populate("likes");
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/like/:id", async (req, res, next) => {
  const imgId = req.params.id;
  const userId = req.session.currentUser._id;
  try {
    const image = await Image.findById(imgId);
    const creator = await User.findById(image.creator);
    let updatedLikes = [];
    let updatedNotifs = [];
    if (image.likes.includes(userId)) {
      updatedLikes = image.likes.filter((id) => id != userId);
      updatedNotifs = creator.notifications.filter(
        ({ user, image }) => user != userId || image != imgId
      );
    } else {
      updatedLikes = [...image.likes];
      updatedLikes.push(userId);
      updatedNotifs = [...creator.notifications];
      updatedNotifs.push({ user: userId, event: "liked", image: imgId });
    }
    const updatedImage = await Image.findByIdAndUpdate(
      imgId,
      { likes: updatedLikes },
      { new: true }
    )
      .populate("creator")
      .populate("likes", "name");
    const updatedUser = await User.findByIdAndUpdate(
      creator._id,
      { notifications: updatedNotifs },
      { new: true }
    );

    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
