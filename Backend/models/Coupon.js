const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  partner: {
    type: String,
    required: true,
    trim: true
  },

  ecoCoinsRequired: {
    type: Number,
    required: true,
    min: 0
  },

  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },

  remainingQuantity: {
    type: Number,
    required: true,
    min: 0
  },

  expiryDate: {
    type: Date
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);