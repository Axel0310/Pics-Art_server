const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
const User = require("../models/User");
const fileUploader = require("../config/cloudinary");

// Add a new image
router.post("/", fileUploader.single("url"), async (req, res, next) => {
    const newImage = {...req.body};
    const userId = req.session.currentUser._id;
    newImage.url = req.file.path;
    newImage.creator = userId;
    try {
        const createdImage = await Image.create(newImage);
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
    // const newImage = {...req.body};
    // const userId = req.session.currentUser._id;
    // newImage.url = req.file.path;
    // newImage.creator = userId;
    // try {
    //     const createdImage = await Image.create(newImage);
    //     const user = await User.findById(userId);
    //     user.images.push(createdImage._id);
    //     await User.findByIdAndUpdate(userId, user);
    //     res.status(201).json(createdImage);
    // } catch (error) {
    //     res.status(500).json(error);   
    // }
});


module.exports = router;
