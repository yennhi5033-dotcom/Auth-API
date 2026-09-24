import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import firebaseAuth from "../config/firebase.js";

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
      message: "�ang nh?p th�nh c�ng",
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
        message: "Kh�ng t�m th?y ngu?i d�ng",
        error: "NotFound",
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: "L?y th�ng tin th�nh c�ng",
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
        message: "oldPassword v� newPassword l� b?t bu?c",
        error: "BadRequest",
        statusCode: 400
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password m?i ph?i c� �t nh?t 6 k� t?",
        error: "BadRequest",
        statusCode: 400
      });
    }

    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Kh�ng t�m th?y ngu?i d�ng",
        error: "NotFound",
        statusCode: 404
      });
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: "M?t kh?u hi?n t?i kh�ng d�ng",
        error: "Unauthorized",
        statusCode: 401
      });
    }

    // Set plain newPassword, hook pre('save') in user.model.js will hash it
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: "�?i m?t kh?u th�nh c�ng"
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    message: "�ang xu?t th�nh c�ng"
  });
};

/**
 * POST /api/auth/google-login
 * Nh?n Firebase ID Token -> X�c th?c qua Firebase Admin SDK -> T�m ho?c t?o User -> K� JWT h? th?ng.
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "idToken l� b?t bu?c",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    if (!firebaseAuth) {
      return res.status(500).json({
        message: "Firebase Admin SDK chua du?c c?u h�nh tr�n server",
        error: "InternalServerError",
        statusCode: 500,
      });
    }

    // 1. X�c th?c ID Token qua Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    } catch (err) {
      if (err.code === "auth/id-token-expired") {
        return res.status(401).json({
          message: "Firebase ID Token d� h?t h?n",
          error: "Unauthorized",
          statusCode: 401,
        });
      }
      return res.status(401).json({
        message: "Firebase ID Token kh�ng h?p l?",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        message: "T�i kho?n Google kh�ng cung c?p email h?p l?",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. T�m User trong Database
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // N?u d� c� t�i kho?n: c?p nh?t th�m googleId/avatar n?u tru?c d� dang k� local
      let updated = false;
      if (!user.googleId) {
        user.googleId = uid;
        updated = true;
      }
      if (picture && user.avatar === "default.jpg") {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // 3. N?u chua c� t�i kho?n: t?o User m?i v?i authType = 'google'
      user = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId: uid,
        avatar: picture || "default.jpg",
        authType: "google",
        role: "user",
      });
    }

    // 4. K� JWT c?a h? th?ng (d�ng chung quy u?c v?i login thu?ng)
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn },
    );

    return res.status(200).json({
      message: "�ang nh?p Google th�nh c�ng",
      user: removePassword(user),
      token,
      expiresIn,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
  changePassword,
  removePassword,
  logout,
  googleLogin,
};
