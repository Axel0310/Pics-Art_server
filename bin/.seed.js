require("dotenv").config();
require("../config/dbConnection.js");

const User = require("../models/User");
const Image = require("../models/Image");

const users = [
  {
    name: "toto1",
    email: "toto1@toto1.com",
    password: "toto1",
  },
  {
    name: "toto2",
    email: "toto2@toto2.com",
    password: "toto2",
  },
  {
    name: "toto3",
    email: "toto3@toto3.com",
    password: "toto3",
  },
];

User
  .insertMany(users)
  .then((dbRes) => console.log(dbRes))
  .catch((dbErr) => console.log(dbErr));
