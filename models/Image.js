const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: String,
  likes: {
    type: Number,
    default: 0
  },
  comments: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
    },
  ],
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
});

const Image = mongoose.model("User", imageSchema);

module.exports = Image;
