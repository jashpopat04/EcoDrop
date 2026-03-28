const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["seller", "recycler", "admin"], default: "seller" },

  companyName: String,
  authorizedPerson: String,
  contactNumber: String,
  gstNumber: String,

  ecoCoins: { type: Number, default: 0, min: 0 },
  walletBalance: { type: Number, default: 0, min: 0 },

  // 🚀 YEH 2 NAYI LINES ADD KAR DE:
  totalPoints: { type: Number, default: 0 },
  totalMoney: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);