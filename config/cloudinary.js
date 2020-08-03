const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "insta",
    transformation: {
      widht: 375,
      height: 375,
      // crop: "scale"
    }
    // crop: "imagga_scale", 
    // width: 375, 
    // height: 375,
    // signed_url: true
  },
});

const fileUploader = multer({ storage });
module.exports = fileUploader;
