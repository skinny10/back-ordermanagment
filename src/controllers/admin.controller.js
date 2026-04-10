import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Order from "../models/Order.js";
import Client from "../models/Client.js";


// =========================
// GET USERS
// =========================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        let activeOrders = 0;

        if (user.role === "vendor") {
          activeOrders = await Order.countDocuments({
            seller: user._id,
            status: { $ne: "delivered" }
          });
        }

        if (user.role === "delivery") {
          activeOrders = await Order.countDocuments({
            delivery: user._id,
            status: { $ne: "delivered" }
          });
        }

        return {
          id: user._id,
          name: `${user.name} ${user.lastName}`,
          role: user.role,
          email: user.email,
          activeOrders
        };
      })
    );

    res.json(usersWithOrders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================
// CREATE USER
// =========================
export const createUser = async (req, res) => {
  try {
    const { name, lastName, role, email, password } = req.body;

    if (!name || !lastName || !role || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      lastName,
      role,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      user: {
        id: newUser._id,
        name: `${newUser.name} ${newUser.lastName}`,
        role: newUser.role,
        email: newUser.email,
        activeOrders: 0
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================
// DELETE USER
// =========================
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "Usuario eliminado"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================
// GET CLIENTS
// =========================
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find();

    const formattedClients = await Promise.all(
      clients.map(async (client) => {

        const totalOrders = await Order.countDocuments({
          client: client._id
        });

        return {
          id: client._id,
          name: client.name,
          phone: client.phone,
          address: client.address,
          totalOrders
        };
      })
    );

    res.json(formattedClients);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================
// CREATE CLIENT
// =========================
export const createClient = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    const existingClient = await Client.findOne({ phone });

    if (existingClient) {
      return res.status(400).json({
        message: "El cliente ya existe"
      });
    }

    const client = new Client({
      name,
      phone,
      address
    });

    await client.save();

    res.status(201).json({
      client
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================
// DELETE CLIENT
// =========================
export const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);

    res.json({
      message: "Cliente eliminado"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================
// DASHBOARD
// =========================
export const getDashboard = async (req, res) => {
  try {

    const totalSellers = await User.countDocuments({
      role: "vendor"
    });

    const totalDelivery = await User.countDocuments({
      role: "delivery"
    });

    const totalClients = await Client.countDocuments();

    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: "pending"
    });

    const preparingOrders = await Order.countDocuments({
      status: "preparing"
    });

    const onWayOrders = await Order.countDocuments({
      status: "onWay"
    });

    const deliveredOrders = await Order.countDocuments({
      status: "delivered"
    });

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: "delivered"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);

    const totalRevenue =
      revenueData.length > 0
        ? revenueData[0].total
        : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client")
      .populate("seller", "name lastName")
      .populate("delivery", "name lastName");

    const formattedRecentOrders =
      recentOrders.map(order => ({
        id: order._id,
        clientName: order.client?.name || "",
        sellerName: order.seller
          ? `${order.seller.name} ${order.seller.lastName}`
          : "",
        deliveryName: order.delivery
          ? `${order.delivery.name} ${order.delivery.lastName}`
          : "",
        total: order.total,
        status: order.status,
        date: order.createdAt
      }));

    res.json({
      totalOrders,
      totalClients,
      totalSellers,
      totalDelivery,
      pendingOrders,
      preparingOrders,
      onWayOrders,
      deliveredOrders,
      totalRevenue,
      recentOrders: formattedRecentOrders
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// NUEVO ENDPOINT: GET /admin/orders
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("client")
      .populate("seller", "name lastName")
      .populate("delivery", "name lastName");

    const formattedOrders = orders.map(order => ({
      id: order._id,
      clientName: order.client?.name || "",
      sellerName: order.seller ? `${order.seller.name} ${order.seller.lastName}` : "",
      deliveryName: order.delivery ? `${order.delivery.name} ${order.delivery.lastName}` : "",
      total: order.total,
      status: order.status,
      date: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
