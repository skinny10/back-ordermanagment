import express from "express";
import {
  getDeliveryStats,
  getDeliveryOrders,
  updateDeliveryOrderStatus
} from "../controllers/dellivery.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { deliveryMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, deliveryMiddleware, getDeliveryStats);
router.get("/orders", authMiddleware, deliveryMiddleware, getDeliveryOrders);
router.put("/orders/:id/status", authMiddleware, deliveryMiddleware, updateDeliveryOrderStatus);

export default router;