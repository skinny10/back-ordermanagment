import Order from "../models/Order.js";


// =========================
// CREATE ORDER
// =========================
export const createOrder = async (req, res) => {
  try {
    const { clientId, total } = req.body;

    if (!clientId || !total) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    const order = new Order({
      client: clientId,
      total,
      seller: req.user.id
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("client")
      .populate("seller", "name lastName");

    res.status(201).json({
      message: "Pedido creado",
      order: populatedOrder
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// =========================
// GET ORDERS
// =========================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("client")
      .populate("seller", "name lastName")
      .populate("delivery", "name lastName");

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// =========================
// DELETE ORDER
// =========================
export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: "Pedido eliminado"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// =========================
// UPDATE STATUS
// =========================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Pedido no encontrado"
      });
    }

    order.status = status;

    await order.save();

    res.json({
      message: "Estado actualizado",
      order
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};