module.exports = (req, res, next) => {
    req.session.currentUser = {
      _id: "5f2417b0d4e4767346852d40",
      profilePicture: "https://res.cloudinary.com/direuudpy/image/upload/v1596033402/insta/profile_picture_default_tzqyoh.jpg",
      email: "axel@gmail.com",
      name: "Axel"
    };
    next();
  };
  