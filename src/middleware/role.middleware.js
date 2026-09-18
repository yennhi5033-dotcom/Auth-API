export const authorizeMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Bạn không có quyền truy cập",
        error: "Forbidden",
        statusCode: 403
      });
    }
    next();
  };
};

export const authorizeRoles = authorizeMiddleware;

export default {
  authorizeMiddleware,
  authorizeRoles
};
