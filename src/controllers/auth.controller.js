import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const removePassword = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;
  return data;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email và password là bắt buộc",
        error: "BadRequest",
        statusCode: 400
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password phải có ít nhất 6 ký tự",
        error: "BadRequest",
        statusCode: 400
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email đã được đăng ký",
        error: "Conflict",
        statusCode: 409
      });
    }

    // Pass plain password -> user.model.js pre('save') hook will hash it
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || "user"
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: removePassword(user)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email và password là bắt buộc",
        error: "BadRequest",
        statusCode: 400
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: normalizedEmail
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
        error: "Unauthorized",
        statusCode: 401
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
        error: "Unauthorized",
        statusCode: 401
      });
    }

    const secret = process.env.JWT_SECRET || "default_jwt_secret";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      secret,
      {
        expiresIn: "1d"
      }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: removePassword(user),
      token,
      expiresIn: "1d"
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
        error: "NotFound",
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin thành công",
      user: removePassword(user)
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "oldPassword và newPassword là bắt buộc",
        error: "BadRequest",
        statusCode: 400
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password mới phải có ít nhất 6 ký tự",
        error: "BadRequest",
        statusCode: 400
      });
    }

    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
        error: "NotFound",
        statusCode: 404
      });
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: "Mật khẩu hiện tại không đúng",
        error: "Unauthorized",
        statusCode: 401
      });
    }

    // Set plain newPassword, hook pre('save') in user.model.js will hash it
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    message: "Đăng xuất thành công"
  });
};

export default {
  register,
  login,
  getMe,
  changePassword,
  removePassword,
  logout
};
