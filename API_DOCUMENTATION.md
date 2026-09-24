# Auth API - Tài liệu Tích hợp Frontend

Tài liệu hướng dẫn chi tiết các endpoint API, định dạng Payload (Request body / Headers) và Response (Thành công & Thất bại) để đội ngũ Front-end dễ dàng tích hợp.

---

## 1. Thông tin chung (General Information)

- **Base URL:** `http://localhost:3001` (tuỳ chỉnh theo `.env`)
- **API Prefix:** `/api/auth`
- **Swagger Docs:** `http://localhost:3001/api-docs`
- **Swagger JSON:** `http://localhost:3001/api-docs.json`
- **Content-Type:** `application/json` cho toàn bộ request có body.
- **Cơ chế xác thực:** JWT Bearer Token qua header:
  ```http
  Authorization: Bearer <access_token>
  ```

---

## 2. Bảng tổng hợp Endpoints

| STT | Method | Endpoint | Yêu cầu Token | Phân quyền | Mô tả |
| :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | `GET` | `/` | ❌ | All | Kiểm tra trạng thái server |
| 2 | `POST` | `/api/auth/register` | ❌ | All | Đăng ký tài khoản mới |
| 3 | `POST` | `/api/auth/login` | ❌ | All | Đăng nhập hệ thống & lấy Token |
| 4 | `GET` | `/api/auth/me` | ✅ | User / Admin | Lấy thông tin user hiện tại |
| 5 | `PUT` | `/api/auth/change-password` | ✅ | User / Admin | Đổi mật khẩu |
| 6 | `POST` | `/api/auth/logout` | ❌ | All | Đăng xuất |
| 7 | `GET` | `/api/auth/admin/dashboard` | ✅ | `admin` | Trang thống kê / Dashboard Admin |

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
Tạo mới một tài khoản trong hệ thống.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
  | Trường | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
  | :--- | :--- | :---: | :---: | :--- |
  | `name` | `string` | **Có** | - | Họ tên người dùng |
  | `email` | `string` | **Có** | - | Email (được tự động lowercase & trim) |
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

### 3.3. Đăng nhập (Login)
Xác thực email + password và nhận JWT token để sử dụng cho các request sau.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Headers:**
  ```http
  Content-Type: application/json
  ```
- **Request Body:**
  | Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :---: | :--- |
  | `email` | `string` | **Có** | Email đăng ký |
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
      "role": "user",
      "createdAt": "2026-09-18T07:30:00.000Z",
      "updatedAt": "2026-09-18T07:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzBjNTM4ZGYwYjViMWE4ZjljMTEyMjMiLCJyb2xlIjoidXNlciIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoxNjcwMDg2NDAwfQ...",
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

### 3.4. Lấy thông tin tài khoản hiện tại (Get Me)
Lấy thông tin profile người dùng đang đăng nhập dựa trên token gửi kèm.

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

### 3.5. Đổi mật khẩu (Change Password)
Thay đổi mật khẩu tài khoản người dùng đang đăng nhập.

- **URL:** `/api/auth/change-password`
- **Method:** `PUT`
- **Headers:**
  ```http
  Content-Type: application/json
  Authorization: Bearer <your_jwt_token>
  ```
- **Request Body:**
  | Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
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
  - `400 Bad Request` (Thiếu field):
    ```json
    {
      "message": "oldPassword và newPassword là bắt buộc",
      "error": "BadRequest",
      "statusCode": 400
    }
    ```
  - `400 Bad Request` (Mật khẩu mới ngắn hơn 6 ký tự):
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

### 3.6. Đăng xuất (Logout)
Gửi yêu cầu đăng xuất người dùng (Phía FE xóa token khỏi LocalStorage / Cookie / State).

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

### 3.7. Admin Dashboard (Role-based Authorization)
Kiểm tra quyền truy cập vào trang Admin dành riêng cho tài khoản có `role: "admin"`.

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
  role: "user" | "admin";
  createdAt: string; // ISO 8601 Date format
  updatedAt: string; // ISO 8601 Date format
}
```

### Chuẩn Response Lỗi chung
```typescript
interface ErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}
```

---

## 5. Hướng dẫn FE tích hợp (Axios Example)

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api/auth",
  headers: {
    "Content-Type": "application/json"
  }
});

// Gắn Bearer Token tự động vào Header nếu có
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý bắt lỗi hết hạn token (401)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Điều hướng về login nếu cần
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
```