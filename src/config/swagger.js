import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth & RBAC API Documentation",
      version: "1.0.0",
      description:
        "Tài liệu API xác thực người dùng (Authentication), phân quyền (Role-Based Access Control) và quản lý tài khoản sử dụng Express, Mongoose, JWT & Bcrypt."
    },
    servers: [
      {
        url: "/",
        description: "Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Nhập JWT token theo cú pháp: Bearer <token>"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "670c538df0b5b1a8f9c11223"
            },
            name: {
              type: "string",
              example: "Pham Haa"
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com"
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user"
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-18T07:30:00.000Z"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-18T07:30:00.000Z"
            }
          }
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "Pham Haa"
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com"
            },
            password: {
              type: "string",
              minLength: 6,
              example: "password123"
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              default: "user",
              example: "user"
            }
          }
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com"
            },
            password: {
              type: "string",
              example: "password123"
            }
          }
        },
        ChangePasswordInput: {
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: {
              type: "string",
              example: "password123"
            },
            newPassword: {
              type: "string",
              minLength: 6,
              example: "newpassword123"
            }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Đăng nhập thành công"
            },
            user: {
              $ref: "#/components/schemas/User"
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            expiresIn: {
              type: "string",
              example: "1d"
            }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Email hoặc mật khẩu không đúng"
            },
            error: {
              type: "string",
              example: "Unauthorized"
            },
            statusCode: {
              type: "number",
              example: 401
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
