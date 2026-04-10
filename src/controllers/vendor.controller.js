import Order from "../models/Order.js";
import Client from "../models/Client.js";

// Mapeo de status BD → app Android
const statusMap = {
  pending:   "Pendiente",
  preparing: "Preparando",
  onWay:     "En camino",
  delivered: "Entregado"
};

export const getVendorStats = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // Fechas para "hoy"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Todos los pedidos del vendedor
    const allOrders = await Order.find({ seller: sellerId })
      .populate("client", "name address")
      .sort({ createdAt: -1 });

    const todayOrders = allOrders.filter(o =>
      o.createdAt >= startOfDay && o.createdAt <= endOfDay
    );

    const totalClients = await Client.countDocuments();

    const recentOrders = allOrders.slice(0, 10).map(o => ({
      id:         o._id.toString(),
      clientName: o.client?.name ?? "Sin nombre",
      address:    o.client?.address ?? "",
      total:      o.total,
      status:     statusMap[o.status] ?? o.status,
      date:       o.createdAt.toISOString().split("T")[0]
    }));

    const clients = await Client.find().lean();
    const clientsWithOrders = await Promise.all(clients.map(async c => {
      const count = await Order.countDocuments({ client: c._id });
      return {
        id:          c._id.toString(),
        name:        c.name,
        phone:       c.phone,
        address:     c.address,
        totalOrders: count
      };
    }));

    res.json({
      totalClients:    totalClients,
      todayOrders:     todayOrders.length,
      pendingOrders:   allOrders.filter(o => o.status === "pending").length,
      preparingOrders: allOrders.filter(o => o.status === "preparing").length,
      onWayOrders:     allOrders.filter(o => o.status === "onWay").length,
      deliveredOrders: allOrders.filter(o => o.status === "delivered").length,
      recentOrders,
      clients: clientsWithOrders
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const orders = await Order.find({ seller: sellerId })
      .populate("client", "name address")
      .sort({ createdAt: -1 });

    const mapped = orders.map(o => ({
      id:         o._id.toString(),
      clientName: o.client?.name ?? "Sin nombre",
      address:    o.client?.address ?? "",
      total:      o.total,
      status:     statusMap[o.status] ?? o.status,
      date:       o.createdAt.toISOString().split("T")[0]
    }));

    res.json(mapped);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
