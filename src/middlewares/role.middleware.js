export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autorizado"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso solo para administradores"
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error en validación de rol"
    });
  }
};

export const vendorMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autorizado"
      });
    }

    if (req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Acceso solo para vendedores"
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error en validación de rol"
    });
  }
};

export const deliveryMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autorizado"
      });
    }

    if (req.user.role !== "delivery") {
      return res.status(403).json({
        success: false,
        message: "Acceso solo para repartidores"
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error en validación de rol"
    });
  }
};