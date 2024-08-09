const mongoose = require("mongoose");
const Trades = mongoose.Schema({
  discName: {
    type: String,
    required: [false, "disc name is required"],
  },
  habName: {
    type: String,
    required: [false, "disc name is required"],
  },
  yourItems: {
    type: Array,
    required: [false, "disc name is required"],
  },
  otherItems: {
    type: Array,
    required: [false, "disc name is required"],
  },
  profit: {
    type: Number,
    required: [false, "disc name is required"],
  },
  Date: {
    type: Date,
    required: [false, "disc name is required"],
  },
});
const trade = mongoose.model("trades", Trades);
module.exports = trade;
