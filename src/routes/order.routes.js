import express from "express";

import {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrderStatus
} from "../controllers/order.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);

router.get("/", authMiddleware, getOrders);

router.delete("/:id", authMiddleware, deleteOrder);

router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;