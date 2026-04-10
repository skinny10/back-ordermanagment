import express from "express";
import {
  getUsers,
  createUser,
  deleteUser,
  getDashboard,
  getClients,
  createClient,
  deleteClient,
  getAdminOrders
} from "../controllers/admin.controller.js";



import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

// USERS
router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.post("/users", authMiddleware, adminMiddleware, createUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

// admin Dashboard
router.get("/dashboard", authMiddleware, adminMiddleware, getDashboard);

// clients - GET (only admin can view)
router.get("/clients", authMiddleware, adminMiddleware, getClients);
router.delete("/clients/:id", authMiddleware, adminMiddleware, deleteClient);

router.get("/orders", authMiddleware, adminMiddleware, getAdminOrders);


export default router;