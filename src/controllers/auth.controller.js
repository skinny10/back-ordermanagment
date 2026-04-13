import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from '../config/firebase.js';


// REGISTER
export const register = async (req, res) => {
  try {
    const { name, lastName, email, password } = req.body;

    // Validar campos vacíos
    if (!name || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios"
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Correo inválido"
      });
    }

    // Validar contraseña
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener mínimo 8 caracteres"
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe"
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario (SIEMPRE DELIVERY)
    const user = new User({
      name,
      lastName,
      email,
      password: hashedPassword,
      role: "delivery"
    });

    await user.save();

    res.json({
      success: true,
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Campos requeridos"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Usuario no existe"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Contraseña incorrecta"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      role: user.role,
      name: user.name,
      lastName: user.lastName,
      fullName: `${user.name} ${user.lastName}`
    });

    // ← NUEVO: notificación automática de bienvenida
    if (user.fcmToken) {
      await sendNotificationToUser(
        user._id,
        "👋 Bienvenido de vuelta",
        `Hola ${user.name}, has iniciado sesión correctamente`
      );
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ACTUALIZAR FCM TOKEN
export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token requerido"
      });
    }

    await User.findByIdAndUpdate(userId, { fcmToken });

    res.json({
      success: true,
      message: "FCM token actualizado"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ENVIAR NOTIFICACIÓN A UN USUARIO
export const sendNotificationToUser = async (userId, title, body) => {
  try {
    const user = await User.findById(userId);

    if (!user?.fcmToken) {
      console.log("Usuario sin FCM token:", userId);
      return;
    }

    await admin.messaging().send({
      token: user.fcmToken,
      notification: { title, body },
      android: { priority: "high" }
    });

    console.log("Notificación enviada a:", user.email);

  } catch (error) {
    console.error("Error enviando notificación:", error.message);
  }
};