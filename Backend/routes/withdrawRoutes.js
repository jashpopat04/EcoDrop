const express = require("express");
const router = express.Router();

const {
  requestWithdraw,
  getAllWithdrawRequests,
  updateWithdrawStatus
} = require("../controllers/withdrawController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");


// Seller request
router.post(
  "/request",
  protect,
  authorizeRoles("seller"),
  requestWithdraw
);

// Admin view all
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllWithdrawRequests
);

// Admin approve/reject
router.put(
  "/:requestId",
  protect,
  authorizeRoles("admin"),
  updateWithdrawStatus
);

module.exports = router;