var mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    members: {type: Array, required: true},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", ChatSchema);