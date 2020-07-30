const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
const User = require("../models/User");
const fileUploader = require("../config/cloudinary");

// Get one image based on its ID
router.get("/:id", async (req, res, next) => {
  try {
    const fetchedImages = await Image.findById(req.params.id);
    res.status(200).json(fetchedImages);
  } catch (error) {
    next(error);
  }
});

// Get all images
router.get("/", async (req, res, next) => {
  try {
    const fetchedImages = await Image.find();
    res.status(200).json(fetchedImages);
  } catch (error) {
    next(error);
  }
});

// Get the 5 latest image uploaded
// router.get("/new", async (req, res, next) => {
//     try {

//     } catch (error) {
//       next(error);
//     }
//   });

// Add a new image
router.post("/", fileUploader.single("url"), async (req, res, next) => {
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
    next(error);
  }
});

// Update an image
router.patch("/:id", async (req, res, next) => {
  const updatedInfo = { ...req.body };
  try {
    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      updatedInfo
    );
    res.status(200).json(updatedImage);
  } catch (error) {
    next(error);
  }
});

// Delete one image based on its Id
router.delete("/:id", async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const imageId = req.params.id;
  try {
    const user = await User.findById(userId);
    user.images.filter((id) => id !== imageId);
    await User.findByIdAndUpdate({ images: user.images });
    await Image.findByIdAndDelete(imageId);
    res.status(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
