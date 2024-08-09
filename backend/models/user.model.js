const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  discID: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
