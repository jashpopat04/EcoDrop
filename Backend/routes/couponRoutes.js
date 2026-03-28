const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getAvailableCoupons,
  redeemCoupon,
  getMyCoupons
} = require("../controllers/couponController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");


// Admin create coupon
router.post(
  "/create",
  protect,
  authorizeRoles("admin"),
  createCoupon
);

// Seller view coupons
router.get(
  "/",
  protect,
  authorizeRoles("seller"),
  getAvailableCoupons
);

// Seller redeem coupon
router.post(
  "/redeem/:couponId",
  protect,
  authorizeRoles("seller"),
  redeemCoupon
);

// Seller my coupons
router.get(
  "/my",
  protect,
  authorizeRoles("seller"),
  getMyCoupons
);

module.exports = router;