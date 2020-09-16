const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    firstUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    secondUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: "Message",
      }],
  },
  { timestamps: { createdAt: "createdAt" } }
);

const Conversation = mongoose.model("Message", conversationSchema);

module.exports = Conversation;
