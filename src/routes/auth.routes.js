import express from "express";
import {
  register,
  login,
  googleLogin,
  getMe,
  changePassword,
  logout
} from "../controllers/auth.controller.js";
import { authenticateMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Các API xác thực và quản lý tài khoản người dùng
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản người dùng mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *           example:
 *             name: "Pham Haa"
 *             email: "haa12@example.com"
 *             password: "password123"
 *             role: "user"
 *     responses:
 *       201:
 *         description: Đăng ký tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Thiếu dữ liệu hoặc mật khẩu ngắn hơn 6 ký tự
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Name, email và password là bắt buộc"
 *               error: "BadRequest"
 *               statusCode: 400
 *       409:
 *         description: Email đã tồn tại trong hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email đã được đăng ký"
 *               error: "Conflict"
 *               statusCode: 409
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống và nhận JWT Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: "haa12@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về user và JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Thiếu email hoặc password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email và password là bắt buộc"
 *               error: "BadRequest"
 *               statusCode: 400
 *       401:
 *         description: Sai email hoặc mật khẩu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email hoặc mật khẩu không đúng"
 *               error: "Unauthorized"
 *               statusCode: 401
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/google-login:
 *   post:
 *     summary: Đăng nhập bằng Google (Firebase ID Token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase ID Token nhận được từ Google Sign-In trên client
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEy..."
 *     responses:
 *       200:
 *         description: Đăng nhập Google thành công, trả về user và JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Thiếu idToken hoặc tài khoản Google không cung cấp email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "idToken là bắt buộc"
 *               error: "BadRequest"
 *               statusCode: 400
 *       401:
 *         description: Firebase ID Token không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Firebase ID Token không hợp lệ"
 *               error: "Unauthorized"
 *               statusCode: 401
 */
router.post("/google-login", googleLogin);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin tài khoản đang đăng nhập
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lấy thông tin thành công"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token thiếu, không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token không hợp lệ hoặc đã hết hạn"
 *               error: "jwt malformed"
 *               statusCode: 401
 *       404:
 *         description: Không tìm thấy user tương ứng với token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Không tìm thấy người dùng"
 *               error: "NotFound"
 *               statusCode: 404
 */
router.get("/me", authenticateMiddleware, getMe);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất người dùng
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng xuất thành công"
 */
router.post("/logout", logout);

/**
 * @openapi
 * /api/auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu tài khoản
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *           example:
 *             oldPassword: "password123"
 *             newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đổi mật khẩu thành công"
 *       400:
 *         description: Thiếu dữ liệu hoặc mật khẩu mới quá ngắn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Password mới phải có ít nhất 6 ký tự"
 *               error: "BadRequest"
 *               statusCode: 400
 *       401:
 *         description: Mật khẩu hiện tại không đúng hoặc chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Mật khẩu hiện tại không đúng"
 *               error: "Unauthorized"
 *               statusCode: 401
 */
router.put("/change-password", authenticateMiddleware, changePassword);

/**
 * @openapi
 * /api/auth/admin/dashboard:
 *   get:
 *     summary: Truy cập khu vực Admin (Yêu cầu quyền admin - RBAC)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Truy cập admin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bạn đã truy cập khu vực admin"
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Access token is missing or invalid"
 *               error: "Unauthorized"
 *               statusCode: 401
 *       403:
 *         description: Không có quyền admin (Forbidden)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Forbidden: Bạn không có quyền truy cập"
 *               error: "Forbidden"
 *               statusCode: 403
 */
router.get(
  "/admin/dashboard",
  authenticateMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    return res.status(200).json({
      message: "Bạn đã truy cập khu vực admin"
    });
  }
);

export default router;
