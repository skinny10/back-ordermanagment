import Order from "../models/Order.js";

// Mapeo de status BD → app Android
const statusMap = {
  pending:   "Pendiente",
  preparing: "Preparando",
  onWay:     "En camino",
  delivered: "Entregado"
};

export const getDeliveryStats = async (req, res) => {
  try {
    const deliveryId = req.user.id;

    // Fechas para "hoy"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Todos los pedidos disponibles para repartidor
    const allOrders = await Order.find()
      .populate("client", "name address")
      .sort({ createdAt: -1 });

    console.log('delivery allOrders length:', allOrders.length);

    const todayOrders = allOrders.filter(o =>
      o.createdAt >= startOfDay && o.createdAt <= endOfDay
    );

    const recentOrders = allOrders.slice(0, 10).map(o => ({
      id:         o._id.toString(),
      clientName: o.client?.name ?? "Sin nombre",
      address:    o.client?.address ?? "",
      total:      o.total,
      status:     statusMap[o.status] ?? o.status,
      date:       o.createdAt.toISOString().split("T")[0]
    }));

    console.log('delivery recentOrders length:', recentOrders.length);

    res.json({
      todayOrders:     todayOrders.length,
      pendingOrders:   allOrders.filter(o => o.status === "pending").length,
      preparingOrders: allOrders.filter(o => o.status === "preparing").length,
      onWayOrders:     allOrders.filter(o => o.status === "onWay").length,
      deliveredOrders: allOrders.filter(o => o.status === "delivered").length,
      recentOrders
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDeliveryOrders = async (req, res) => {
  try {
    // ✅ Devuelve TODOS los pedidos disponibles para el repartidor
    const orders = await Order.find()
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

export const updateDeliveryOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Estado requerido" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("client", "name address");

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.json({
      message: "Estado del pedido actualizado",
      order: {
        id:         order._id.toString(),
        clientName: order.client?.name ?? "Sin nombre",
        address:    order.client?.address ?? "",
        total:      order.total,
        status:     statusMap[order.status] ?? order.status,
        date:       order.createdAt.toISOString().split("T")[0]
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
