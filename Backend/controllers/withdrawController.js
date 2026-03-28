const WithdrawRequest = require("../models/WithdrawRequest");
const User = require("../models/User");


// ===============================
// Seller Request Withdraw
// ===============================
exports.requestWithdraw = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { amount } = req.body;

    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Deduct immediately
    seller.walletBalance -= amount;
    await seller.save();

    const request = await WithdrawRequest.create({
      seller: sellerId,
      amount
    });

    res.json({
      message: "Withdraw request submitted",
      request
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
// Admin View All Withdraw Requests
// ===============================
exports.getAllWithdrawRequests = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============================
// Admin Approve / Reject
// ===============================
exports.updateWithdrawStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await WithdrawRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    if (status === "rejected") {
      // refund seller
      const seller = await User.findById(request.seller);
      seller.walletBalance += request.amount;
      await seller.save();
    }

    request.status = status;
    await request.save();

    res.json({
      message: "Withdraw request updated",
      request
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};