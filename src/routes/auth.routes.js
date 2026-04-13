import express from "express";
import { register, login, updateFcmToken, sendNotificationToUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/fcm-token", authMiddleware, updateFcmToken);

// RUTA TEMPORAL DE PRUEBA - quitar en producción
router.post("/test-notification", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await sendNotificationToUser(
      userId,
      "🎉 Prueba exitosa",
      "Las notificaciones Firebase están funcionando!"
    );
    res.json({ success: true, message: "Notificación enviada" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;