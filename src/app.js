import express from "express";
import authRoutes from "./routes/auth.routes.js";
import setupSwagger from "./config/swagger.js";
import cors from "cors";

const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",


  // Vercel frontend
  "https://fe-auth-five.vercel.app",
  "https://test-lua-1cf98.firebaseapp.com",
  "https://test-lua-1cf98.firebasestorage.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request không có Origin
      // Ví dụ: Postman, Swagger, server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,
  })
);
// Tích hợp Swagger UI tại /api-docs và raw JSON tại /api-docs.json
setupSwagger(app);

app.get("/", (req, res) => {
  res.json({
    message: "Auth API is running",
    swaggerDocs: "/api-docs"
  });
});

app.use("/api/auth", authRoutes);

export default app;
