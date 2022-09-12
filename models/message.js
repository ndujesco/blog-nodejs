const { Schema, default: mongoose } = require("mongoose");

const messageSchema = Schema({
  name: String,
  enail: String,
  number: Number,
  message: String,
});

module.exports = mongoose.model("Message", messageSchema);
