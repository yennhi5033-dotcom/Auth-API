# Auth API - Tài liệu Tích hợp Frontend

Tài liệu hướng dẫn chi tiết các endpoint API, định dạng Payload (Request body / Headers) và Response (Thành công & Thất bại) để đội ngũ Front-end dễ dàng tích hợp.

---

## 1. Thông tin chung (General Information)

- **Base URL:** `http://localhost:3001` (tuỳ chỉnh theo biến môi trường `.env`)
- **API Prefix:** `/api/auth`
- **Swagger UI:** `http://localhost:3001/api-docs`
- **Swagger JSON:** `http://localhost:3001/api-docs.json`
- **Content-Type:** `application/json` cho toàn bộ request có body.
- **Cơ chế xác thực:** JWT Bearer Token gửi qua header:
  ```http
  Authorization: Bearer <access_token>
  ```

---

## 2. Bảng tổng hợp Endpoints

| STT | Method | Endpoint | Yêu cầu Token | Phân quyền | Mô tả |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `GET` | `/` | ❌ | All | Kiểm tra trạng thái server |
| 2 | `POST` | `/api/auth/register` | ❌ | All | Đăng ký tài khoản mới bằng Email/Password |
| 3 | `POST` | `/api/auth/login` | ❌ | All | Đăng nhập bằng Email/Password & nhận JWT |
| 4 | `POST` | `/api/auth/google-login` | ❌ | All | Đăng nhập qua Google (Firebase ID Token) |
| 5 | `GET` | `/api/auth/me` | ✅ | User / Admin | Lấy thông tin user hiện tại |
| 6 | `PUT` | `/api/auth/change-password` | ✅ | User / Admin | Đổi mật khẩu tài khoản |
| 7 | `POST` | `/api/auth/logout` | ❌ | All | Đăng xuất |
| 8 | `GET` | `/api/auth/admin/dashboard` | ✅ | `admin` | Khu vực quản trị Admin (RBAC) |

---

## 3. Chi tiết từng Endpoint

### 3.1. Health Check
Kiểm tra server đang hoạt động.

- **URL:** `/`
- **Method:** `GET`
- **Headers:** Không yêu cầu
- **Response Success (`200 OK`):**
  ```json
  {
    "message": "Auth API is running",
    "swaggerDocs": "/api-docs"
  }
  ```

---

### 3.2. Đăng ký tài khoản (Register)
Tạo tài khoản mới bằng email và mật khẩu.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
  | Field | Type | Required | Default | Description |
  | :--- | :--- | :---: | :---: | :--- |
  | `name` | `string` | **Có** | - | Họ tên người dùng |
  | `email` | `string` | **Có** | - | Email (tự động lowercase & trim) |
  | `password` | `string` | **Có** | - | Mật khẩu (tối thiểu 6 ký tự) |
  | `role` | `string` | Không | `"user"` | Vai trò: `"user"` hoặc `"admin"` |

- **Body mẫu:**
  ```json
  {
    "name": "Pham Haa",
    "email": "haa12@example.com",
    "password": "password123",
    "role": "user"
  }
  ```

- **Response Success (`201 Created`):**
  ```json
  {
    "message": "Đăng ký thành công",
    "user": {
      "_id": "670c538df0b5b1a8f9c11223",
      "name": "Pham Haa",
      "email": "haa12@example.com",
      "avatar": "default.jpg",
      "authType": "local",
      "googleId": null,
      "role": "user",
      "createdAt": "2026-09-18T07:30:00.000Z",
      "updatedAt": "2026-09-18T07:30:00.000Z"
    }
  }
  ```

- **Response Errors:**
  - `400 Bad Request` (Thiếu trường bắt buộc):
    ```json
    {
      "message": "Name, email và password là bắt buộc",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `400 Bad Request` (Mật khẩu quá ngắn):
    ```json
    {
      "message": "Password phải có ít nhất 6 ký tự",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `409 Conflict` (Email đã tồn tại):
    ```json
    {
      "message": "Email đã được đăng ký",
      "error": "Conflict",
      "statusCode": 409
    }
    ```

---

### 3.3. Đăng nhập truyền thống (Login)
Xác thực email + mật khẩu và nhận JWT token.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `email` | `string` | **Có** | Email tài khoản |
  | `password` | `string` | **Có** | Mật khẩu tài khoản |

- **Body mẫu:**
  ```json
  {
    "email": "haa12@example.com",
    "password": "password123"
  }
  ```

- **Response Success (`200 OK`):**
  ```json
  {
    "message": "Đăng nhập thành công",
    "user": {
      "_id": "670c538df0b5b1a8f9c11223",
      "name": "Pham Haa",
      "email": "haa12@example.com",
      "avatar": "default.jpg",
      "authType": "local",
      "googleId": null,
      "role": "user",
      "createdAt": "2026-09-18T07:30:00.000Z",
      "updatedAt": "2026-09-18T07:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1d"
  }
  ```

- **Response Errors:**
  - `400 Bad Request` (Thiếu thông tin):
    ```json
    {
      "message": "Email và password là bắt buộc",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `401 Unauthorized` (Sai email hoặc mật khẩu):
    ```json
    {
      "message": "Email hoặc mật khẩu không đúng",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```

---

### 3.4. Đăng nhập bằng Google (Google Login)
Xác thực Firebase ID Token nhận được từ client Google Sign-In, tự động tạo mới tài khoản nếu chưa có hoặc liên kết nếu đã có, sau đó trả về JWT Token của hệ thống.

- **URL:** `/api/auth/google-login`
- **Method:** `POST`
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `idToken` | `string` | **Có** | Firebase ID Token lấy từ `user.getIdToken()` trên Client |

- **Body mẫu:**
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyM..."
  }
  ```

- **Response Success (`200 OK`):**
  ```json
  {
    "message": "Đăng nhập Google thành công",
    "user": {
      "_id": "670c538df0b5b1a8f9c11223",
      "name": "Pham Haa",
      "email": "haa12@gmail.com",
      "avatar": "https://lh3.googleusercontent.com/a/...",
      "authType": "google",
      "googleId": "108392019283019283019",
      "role": "user",
      "createdAt": "2026-09-18T07:30:00.000Z",
      "updatedAt": "2026-09-18T07:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1d"
  }
  ```

- **Response Errors:**
  - `400 Bad Request` (Thiếu idToken):
    ```json
    {
      "message": "idToken là bắt buộc",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `400 Bad Request` (Tài khoản Google không có email):
    ```json
    {
      "message": "Tài khoản Google không cung cấp email hợp lệ",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `401 Unauthorized` (Token hết hạn):
    ```json
    {
      "message": "Firebase ID Token đã hết hạn",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```
  - `401 Unauthorized` (Token không hợp lệ):
    ```json
    {
      "message": "Firebase ID Token không hợp lệ",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```

---

### 3.5. Lấy thông tin tài khoản hiện tại (Get Me)
Lấy thông tin profile người dùng đang đăng nhập dựa trên JWT token.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Request Body:** Không có

- **Response Success (`200 OK`):**
  ```json
  {
    "message": "Lấy thông tin thành công",
    "user": {
      "_id": "670c538df0b5b1a8f9c11223",
      "name": "Pham Haa",
      "email": "haa12@example.com",
      "avatar": "default.jpg",
      "authType": "local",
      "googleId": null,
      "role": "user",
      "createdAt": "2026-09-18T07:30:00.000Z",
      "updatedAt": "2026-09-18T07:30:00.000Z"
    }
  }
  ```

- **Response Errors:**
  - `401 Unauthorized` (Thiếu hoặc token không hợp lệ / hết hạn):
    ```json
    {
      "message": "Access token is missing or invalid",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```
    hoặc:
    ```json
    {
      "message": "Token không hợp lệ hoặc đã hết hạn",
      "error": "jwt expired",
      "statusCode": 401
    }
    ```
  - `404 Not Found` (Người dùng không tồn tại):
    ```json
    {
      "message": "Không tìm thấy người dùng",
      "error": "NotFound",
      "statusCode": 404
    }
    ```

---

### 3.6. Đổi mật khẩu (Change Password)
Thay đổi mật khẩu tài khoản người dùng đang đăng nhập.

- **URL:** `/api/auth/change-password`
- **Method:** `PUT`
- **Headers:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <your_jwt_token>
  ```
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `oldPassword` | `string` | **Có** | Mật khẩu hiện tại |
  | `newPassword` | `string` | **Có** | Mật khẩu mới (tối thiểu 6 ký tự) |

- **Body mẫu:**
  ```json
  {
    "oldPassword": "password123",
    "newPassword": "newpassword123"
  }
  ```

- **Response Success (`200 OK`):**
  ```json
  {
    "message": "Đổi mật khẩu thành công"
  }
  ```

- **Response Errors:**
  - `400 Bad Request` (Thiếu trường):
    ```json
    {
      "message": "oldPassword và newPassword là bắt buộc",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `400 Bad Request` (Mật khẩu mới quá ngắn):
    ```json
    {
      "message": "Password mới phải có ít nhất 6 ký tự",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `401 Unauthorized` (Mật khẩu cũ không chính xác):
    ```json
    {
      "message": "Mật khẩu hiện tại không đúng",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```

---

### 3.7. Đăng xuất (Logout)
Gửi yêu cầu đăng xuất người dùng (Phía Frontend xóa token khỏi LocalStorage / Cookie / State).

- **URL:** `/api/auth/logout`
- **Method:** `POST`
- **Headers:** Không bắt buộc
- **Request Body:** Không có

- **Response Success (`200 OK`):**
  ```json
  {
    "message": "Đăng xuất thành công"
  }
  ```

---

### 3.8. Admin Dashboard (RBAC Authorization)
Kiểm tra quyền truy cập vào endpoint Admin dành riêng cho tài khoản có `role: "admin"`.

- **URL:** `/api/auth/admin/dashboard`
- **Method:** `GET`
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Request Body:** Không có

- **Response Success (`200 OK`):**
  ```json
  {
    "message": "Bạn đã truy cập khu vực admin"
  }
  ```

- **Response Errors:**
  - `401 Unauthorized` (Chưa gửi hoặc token sai):
    ```json
    {
      "message": "Access token is missing or invalid",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```
  - `403 Forbidden` (Đã đăng nhập nhưng không phải role `admin`):
    ```json
    {
      "message": "Forbidden: Bạn không có quyền truy cập",
      "error": "Forbidden",
      "statusCode": 403
    }
    ```

---

## 4. Quy ước Cấu trúc Dữ liệu (Data Models)

### User Object
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  authType: "local" | "google";
  googleId?: string | null;
  role: "user" | "admin";
  createdAt: string; // ISO 8601 Date
  updatedAt: string; // ISO 8601 Date
}
```

### Chuẩn Auth Response (Login / Google Login)
```typescript
interface AuthResponse {
  message: string;
  user: User;
  token: string;
  expiresIn: string; // ví dụ: "1d"
}
```

### Chuẩn Error Response
```typescript
interface ErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}
```

---

## 5. Hướng dẫn FE tích hợp

### 5.1. Cấu hình Axios Instance (`apiClient.js`)

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api/auth",
  headers: {
    "Content-Type": "application/json"
  }
});

// Tự động gắn Bearer Token vào Headers nếu có trong LocalStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bắt lỗi 401 để tự động xóa token và chuyển hướng login
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export default apiClient;
```

### 5.2. Luồng xử lý Google Sign-In trên Frontend (React + Firebase)

```javascript
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import apiClient from "./apiClient";

export const handleGoogleLogin = async () => {
  try {
    // 1. Popup Google Sign-In với Firebase Client
    const result = await signInWithPopup(auth, googleProvider);

    // 2. Lấy Firebase ID Token
    const idToken = await result.user.getIdToken();

    // 3. Gửi ID Token về Backend để xác thực và lấy Token JWT của hệ thống
    const data = await apiClient.post("/google-login", { idToken });

    // 4. Lưu JWT Token và User vào localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    console.error("Google Login Failed:", error);
    throw error;
  }
};
```
