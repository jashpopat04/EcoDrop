const express = require("express");
const router = express.Router();

const {
  uploadWaste,
  verifyWaste,
  getAvailableWastes,
  purchaseWaste,
  getSellerDashboard,
  getRecyclerDashboard,
  getAdminDashboard,
  scanPickup,
  getAllWastesForAdmin,
  assignDriver,
  bulkPurchase // Ensure this is imported!
} = require("../controllers/wasteController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// 1. Seller Routes
router.post("/upload", protect, authorizeRoles("seller"), uploadWaste);
router.get("/seller/dashboard", protect, authorizeRoles("seller"), getSellerDashboard);

// 2. Recycler Routes (Payment & Dashboard)
router.get("/available", protect, authorizeRoles("recycler"), getAvailableWastes);
router.post("/bulk-purchase", protect, authorizeRoles("recycler"), bulkPurchase);
router.get("/recycler/dashboard", protect, authorizeRoles("recycler"), getRecyclerDashboard);

// 3. Admin Routes
router.put("/verify/:wasteId", protect, authorizeRoles("admin"), verifyWaste);
router.get("/admin/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);
router.get("/admin/all-wastes", protect, authorizeRoles("admin"), getAllWastesForAdmin);
router.put("/assign-driver/:wasteId", protect, authorizeRoles("admin"), assignDriver);

// 4. Logistics
router.post("/scan-pickup", scanPickup);

module.exports = router;