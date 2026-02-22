const mongoose = require("mongoose");

const redeemedCouponSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: true
  },

  code: {
    type: String,
    required: true
  },

  isUsed: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("RedeemedCoupon", redeemedCouponSchema);