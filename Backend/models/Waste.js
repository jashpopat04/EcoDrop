const mongoose = require("mongoose");

const wasteSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  weight: { type: Number, required: true },
  condition: { type: String },
  method: { type: String, enum: ["pickup", "dropoff"], required: true },
  warehouse: { type: String },
  status: { 
    type: String, 
    enum: ["in_warehouse", "pickup_scheduled", "listed_for_recycler", "sold"], 
    // Default pickup_scheduled rakha hai household sellers ke liye
    default: "pickup_scheduled" 
  },
  finalValue: { type: Number, default: 0 },
  recycler: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  ecoCoins: { type: Number, default: 0 },

  // 🚀 NAYE FIELDS LOGISTICS AUR FIGMA TIMELINE KE LIYE
  driverName: { type: String, default: null },
  pickupStage: { 
    type: String, 
    enum: ["Pending", "Accepted", "Driver Assigned", "In Transit", "At Warehouse", "Completed"], 
    default: "Pending" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Waste", wasteSchema);