const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: String,
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        commentId: {
          type: Schema.Types.ObjectId,
          default: new mongoose.Types.ObjectId(),
        },
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
  },
  { timestamps: { createdAt: "createdAt" } }
);

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
