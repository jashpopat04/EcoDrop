const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

  waste: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Waste",
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  recycler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  finalValue: {
    type: Number,
    required: true,
    min: 0
  },

  pickupCharge: {
    type: Number,
    default: 0,
    min: 0
  },

  sellerAmount: {
    type: Number,
    required: true,
    min: 0
  },

  commission: {
    type: Number,
    required: true,
    min: 0
  },

  recyclerTotal: {
    type: Number,
    required: true,
    min: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);