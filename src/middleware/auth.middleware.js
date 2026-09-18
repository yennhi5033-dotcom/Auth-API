import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token is missing or invalid",
        error: "Unauthorized",
        statusCode: 401
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default_jwt_secret";

    const decoded = jwt.verify(token, secret);

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found or token is invalid",
        error: "Unauthorized",
        statusCode: 401
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
      error: error.message,
      statusCode: 401
    });
  }
};

export default {
  authenticateMiddleware
};
