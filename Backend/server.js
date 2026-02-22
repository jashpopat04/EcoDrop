const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Razorpay = require('razorpay');
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({
  origin: "https://jashpopat04.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
// 🚀 NAYA ADDITION: Backend ko bolo ki Frontend folder serve kare
// app.use(express.static(path.join(__dirname, "../Frontend")));

// 🚀 NAYA ADDITION: Jab koi direct "localhost:5000" khole, toh seedha Login page aaye
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../docs/pages/login.html"));
// });

// Tere baaki routes iske neeche hone chahiye...
// app.use("/api/users", userRoutes);
// app.use("/api/waste", wasteRoutes);

// RAZORPAY INSTANCE
const rzp = new Razorpay({
  key_id: 'rzp_test_SIvjLWnnReNzAM',    // 👈 Dashboard se Key ID nikaal ke yahan daal
  key_secret: 'SEGq7WlG1QgNgiL0o7cEdB0M'    // 👈 Dashboard se Secret nikaal ke yahan daal
});

// CREATE ORDER API
app.post('/api/payment/order', async (req, res) => {
  try {
    const options = {
      amount: Math.round(req.body.amount * 100), // Razorpay paise mein leta hai
      currency: "INR",
      receipt: "eco_" + Date.now(),
    };

    const order = await rzp.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json(error);
  }
});

const authRoutes = require("./routes/authRoutes");
const wasteRoutes = require("./routes/wasteRoutes");
const couponRoutes = require("./routes/couponRoutes");

const { protect } = require("./middleware/authMiddleware");

const withdrawRoutes = require("./routes/withdrawRoutes");
app.use("/api/withdraw", withdrawRoutes);

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Agar atka toh 5 sec me retry karega
    family: 4 // Ye force karega ki simple IPv4 network use ho (Block bypass)
})
.then(() => console.log("MongoDB Connected 🚀"))
.catch(err => console.log("Mongo Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

app.get("/", (req, res) => {
  res.send("EcoDrop API Running");
});

app.get("/", (req, res) => {
  res.send("EcoDrop Backend is Live 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});