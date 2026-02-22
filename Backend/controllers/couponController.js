const Coupon = require("../models/Coupon");
const RedeemedCoupon = require("../models/RedeemedCoupon");
const User = require("../models/User");


// ===============================
// Admin Create Coupon
// ===============================
exports.createCoupon = async (req, res) => {
  try {
    const { title, partner, ecoCoinsRequired, totalQuantity, expiryDate } = req.body;

    const coupon = await Coupon.create({
      title,
      partner,
      ecoCoinsRequired,
      totalQuantity,
      remainingQuantity: totalQuantity,
      expiryDate
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
// Seller View Available Coupons
// ===============================
exports.getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      remainingQuantity: { $gt: 0 }
    }).sort({ ecoCoinsRequired: 1 });

    res.json(coupons);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
// Generate Unique Coupon Code
// ===============================
const generateCode = (partner) => {
  const prefix = partner.substring(0, 4).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomString}`;
};


// ===============================
// Seller Redeem Coupon
// ===============================
exports.redeemCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const userId = req.user.id;

    const coupon = await Coupon.findById(couponId);
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Coupon not available" });
    }

    if (coupon.remainingQuantity <= 0) {
      return res.status(400).json({ message: "Coupon out of stock" });
    }

    const user = await User.findById(userId);

    if (user.ecoCoins < coupon.ecoCoinsRequired) {
      return res.status(400).json({ message: "Not enough ecoCoins" });
    }

    // Deduct coins
    user.ecoCoins -= coupon.ecoCoinsRequired;
    await user.save();

    // Decrease stock
    coupon.remainingQuantity -= 1;
    await coupon.save();

    // Generate code
    const code = generateCode(coupon.partner);

    const redeemed = await RedeemedCoupon.create({
      user: userId,
      coupon: couponId,
      code
    });

    res.json({
      message: "Coupon redeemed successfully",
      code,
      redeemed
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
// Seller My Coupons
// ===============================
exports.getMyCoupons = async (req, res) => {
  try {
    const userId = req.user.id;

    const myCoupons = await RedeemedCoupon.find({ user: userId })
      .populate("coupon", "title partner ecoCoinsRequired")
      .sort({ createdAt: -1 });

    res.json(myCoupons);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};