const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  count: Number,
});

const Tag = mongoose.model("User", tagSchema);

module.exports = Tag;
