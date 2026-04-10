import express from "express";
import {
  getClients,
  createClient,
  deleteClient
} from "../controllers/admin.controller.js";
import {
  getVendorStats,    // ← agrega esto
  getVendorOrders    // ← agrega esto
} from "../controllers/vendor.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { vendorMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/stats",  authMiddleware, vendorMiddleware, getVendorStats);
router.get("/orders", authMiddleware, vendorMiddleware, getVendorOrders);
router.get("/clients", authMiddleware, vendorMiddleware, getClients);
router.post("/clients", authMiddleware, vendorMiddleware, createClient);
router.delete("/clients/:id", authMiddleware, vendorMiddleware, deleteClient);

export default router;