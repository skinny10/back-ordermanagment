import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import orderRoutes from "./routes/order.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
  
// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/delivery", deliveryRoutes);

// Conexión DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// Ruta test
app.get("/", (req, res) => {
  res.send("API funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {  // ← agregar "0.0.0.0"
  console.log(`Servidor corriendo en puerto ${PORT}`);
});