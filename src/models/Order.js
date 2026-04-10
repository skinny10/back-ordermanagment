import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  total: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: [
      "pending",
      "preparing",
      "onWay",
      "delivered"
    ],
    default: "pending"
  }

}, {
  timestamps: true
});

export default mongoose.model("Order", orderSchema);