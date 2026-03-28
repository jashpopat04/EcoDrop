const Waste = require("../models/Waste");
const User = require("../models/User");
const Transaction = require("../models/Transaction");


// ===============================
// Seller Upload Waste
// ===============================
const crypto = require("crypto");

exports.uploadWaste = async (req, res) => {
  try {
    await Waste.updateMany({ method: "drop" }, { $set: { method: "dropoff" } });
    
    const { itemName, category, weight, method, warehouse, pickupDate, pickupSlot } = req.body;

    const estimatedValue = weight * 500;
    const pickupCharge = method === "pickup" ? 50 : 0;

    let pickupCode = null;

    if (method === "pickup") {
      if (!pickupDate || !pickupSlot) {
        return res.status(400).json({
          message: "Pickup date and slot required"
        });
      }

      pickupCode = crypto.randomBytes(4).toString("hex");
    }

    const waste = await Waste.create({
      itemName,
      seller: req.user.id,
      category,
      weight,
      method: method === "drop" ? "dropoff" : method, // 🚀 FIX: Frontend ka "drop" ab DB ka "dropoff" ban jayega
      warehouse,
      pickupCharge,
      estimatedValue,
      pickupDate,
      pickupSlot,
      pickupCode,
      status: method === "pickup" ? "pickup_scheduled" : "in_warehouse"
    });

    res.status(201).json({
      message: "Waste uploaded successfully",
      waste
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Verify & Approve Waste (Admin)
// ===============================
exports.verifyWaste = async (req, res) => {
  try {
    const { finalValue } = req.body;
    const waste = await Waste.findById(req.params.wasteId).populate("seller");

    if (!waste) {
      return res.status(404).json({ message: "Waste not found" });
    }
    if (waste.status === "listed_for_recycler" || waste.status === "sold") {
      return res.status(400).json({ message: "Item is already verified!" });
    }

    // 🛑 NAYA CHECK YAHAN LAGA: Math shuru hone se pehle!
    if (Number(finalValue) <= 0) {
      return res.status(400).json({ 
        message: "Value must be greater than zero! Don't bankrupt the seller 😂" 
      });
    }

    // 🚀 NAYA LOGIC: Strict Minimum ₹50 Rule for Pickups
    let sellerAmount = Number(finalValue);
    let deductionMsg = "No deductions";

    if (waste.method === "pickup") {
        // Agar admin 50 se kam daalega, toh error fek do!
        if (sellerAmount < 50) {
            return res.status(400).json({ 
                message: "Pickup logistics cost is ₹50! Minimum final value must be at least ₹50 to avoid loss." 
            });
        }
        
        sellerAmount = sellerAmount - 50; 
        deductionMsg = "₹50 Pickup Charge Deducted";
    }

    // Eco Points Calculation (Tera formula)
    const ecoCoins = Math.round((waste.weight * 5) + (finalValue * 0.01)); 

    // Update Seller's Money and Points
    const seller = waste.seller;
    seller.totalMoney = (seller.totalMoney || 0) + sellerAmount;
    seller.totalPoints = (seller.totalPoints || 0) + ecoCoins;
    await seller.save();

    // Update Waste Status
    waste.status = "listed_for_recycler"; // Ready for Recycler to buy
    waste.finalValue = Number(finalValue); 
    waste.ecoCoins = ecoCoins;
    
    await waste.save();

    res.json({ 
        message: "Waste verified successfully", 
        sellerFinalAmount: sellerAmount, 
        ecoCoins: ecoCoins,
        note: deductionMsg
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Get Available Wastes (For Recycler)
// ===============================
exports.getAvailableWastes = async (req, res) => {
  try {
    // Sirf wo waste dikhao jo Admin ne verify kar diye hain
    const wastes = await Waste.find({ status: "listed_for_recycler" }).populate("seller", "name email");
    res.json(wastes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Recycler Purchase Waste
// ===============================
exports.purchaseWaste = async (req, res) => {
  try {
    const { wasteId } = req.params;

    if (req.user.role !== "recycler") {
      return res.status(403).json({ message: "Only recyclers can purchase" });
    }

    const waste = await Waste.findById(wasteId);

    if (!waste || waste.isSold) {
      return res.status(400).json({ message: "Waste not available" });
    }

    if (!waste.finalValue) {
      return res.status(400).json({ message: "Waste not verified yet" });
    }

    const commission = waste.finalValue * 0.1;
    const recyclerTotal = waste.finalValue + commission;

    const sellerAmount = waste.finalValue - (waste.pickupCharge || 0);

    waste.isSold = true;
    waste.status = "sold";
    waste.recycler = req.user.id;

    await waste.save();

    // Create transaction record
    await Transaction.create({
      waste: waste._id,
      seller: waste.seller,
      recycler: req.user.id,
      finalValue: waste.finalValue,
      pickupCharge: waste.pickupCharge,
      sellerAmount,
      commission,
      recyclerTotal
    });

    res.json({
      message: "Waste purchased successfully",
      recyclerTotal,
      commission
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Seller Dashboard
// ===============================
exports.getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const wastes = await Waste.find({ seller: sellerId });

    let totalKg = 0;
    let totalMoney = 0;
    let totalPoints = 0;

    wastes.forEach(w => {
      totalKg += w.weight;
      totalMoney += w.finalValue || 0;
      totalPoints += w.ecoCoins || 0;
    });

    res.json({
      totalKg: Number(totalKg.toFixed(2)), // 🚀 YE FIX HAI (Sirf 2 decimal tak limit karega)
      totalMoney: Number(totalMoney.toFixed(2)), // Paison ke liye bhi safe side
      totalPoints: Number(totalPoints.toFixed(2)),
      co2Saved: (totalKg * 0.8).toFixed(2),
      wastes
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ===============================
// Recycler Dashboard
// ===============================
exports.getRecyclerDashboard = async (req, res) => {
  try {
    const recyclerId = req.user.id;

    const purchases = await Waste.find({ recycler: recyclerId })
      .sort({ createdAt: -1 })
      .populate("seller", "name");

    const totalPurchases = purchases.length;

    let totalSpent = 0;
    let totalCommission = 0;

    purchases.forEach(waste => {
      const commission = waste.finalValue * 0.1;
      totalCommission += commission;
      totalSpent += waste.finalValue + commission;
    });

    res.json({
      totalPurchases,
      totalSpent,
      totalCommission,
      purchases
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Admin Analytics Dashboard (Updated)
// ===============================
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalRecyclers = await User.countDocuments({ role: "recycler" });

    const totalWaste = await Waste.countDocuments();
    const totalVerified = await Waste.countDocuments({ status: "listed_for_recycler" });
    
    // 1. Sirf 'sold' status waale items fetch karo
    const soldWastes = await Waste.find({ status: "sold" });
    const totalSold = soldWastes.length;

    let totalCommission = 0;
    let totalEcoCoins = 0;

    // 2. Commission calculation logic
    soldWastes.forEach(waste => {
      // 10% commission jo Recycler ne pay kiya hai
      const commission = (waste.finalValue || 0) * 0.1; 
      totalCommission += commission;
      totalEcoCoins += (waste.ecoCoins || 0);
    });

    res.json({
      totalUsers,
      totalSellers,
      totalRecyclers,
      totalWaste,
      totalVerified,
      totalSold, // Dashboard par ye update ho jayega
      totalCommission, // 💰 Money card update karne ke liye
      totalEcoCoinsDistributed: totalEcoCoins
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
// Logistics Scan Pickup
// ===============================
exports.scanPickup = async (req, res) => {
  try {
    const { pickupCode } = req.body;

    const waste = await Waste.findOne({ pickupCode });

    if (!waste) {
      return res.status(404).json({ message: "Invalid pickup code" });
    }

    if (waste.status !== "pickup_scheduled") {
      return res.status(400).json({ message: "Pickup already processed" });
    }

    waste.status = "picked";
    await waste.save();

    res.json({
      message: "Pickup confirmed",
      wasteId: waste._id,
      newStatus: waste.status
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Admin Get All Wastes (For Verification List & Analytics)
// ===============================
exports.getAllWastesForAdmin = async (req, res) => {
  try {
    const wastes = await Waste.find()
      .populate("seller", "name email")
      .populate("recycler", "name email") // 🚀 YEH NAYI LINE ADD KI HAI
      .sort({ createdAt: -1 });
      
    res.json(wastes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Admin Assign Driver & Update Stage
// ===============================
exports.assignDriver = async (req, res) => {
  try {
    const { driverName, pickupStage } = req.body; // driverPhone hata diya UI ke hisaab se
    const waste = await Waste.findById(req.params.wasteId);

    if (!waste) return res.status(404).json({ message: "Waste not found" });

    // Update data
    if (driverName) waste.driverName = driverName;
    if (pickupStage) waste.pickupStage = pickupStage;

    await waste.save();

    res.json({ message: "Pickup timeline updated successfully!", waste });
  } catch (err) {
    console.log("🚨 BACKEND ME ERROR AAYA HAI:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Recycler Bulk Purchase (Payment Success ke baad)
// ===============================
exports.bulkPurchase = async (req, res) => {
  try {
    const { wasteIds, paymentId } = req.body;

    if (!wasteIds || wasteIds.length === 0) {
      return res.status(400).json({ message: "No items selected" });
    }

    // 1. Saare items ko dhoondho aur 'Sold' mark karo
    const wastes = await Waste.find({ _id: { $in: wasteIds } });

    for (let waste of wastes) {
      const commission = waste.finalValue * 0.1;
      const recyclerTotal = waste.finalValue + commission;
      const sellerAmount = waste.finalValue - (waste.pickupCharge || 0);

      // Status Update
      waste.isSold = true;
      waste.status = "sold";
      waste.recycler = req.user.id;
      waste.razorpayPaymentId = paymentId; // Record keeping ke liye
      await waste.save();

      // 2. Har item ke liye Transaction record banao
      await Transaction.create({
        waste: waste._id,
        seller: waste.seller,
        recycler: req.user.id,
        finalValue: waste.finalValue,
        pickupCharge: waste.pickupCharge,
        sellerAmount,
        commission,
        recyclerTotal,
        paymentId: paymentId
      });
    }

    res.json({ message: "Bulk purchase successful and records updated" });

  } catch (err) {
    console.error("🚨 Bulk Purchase Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};