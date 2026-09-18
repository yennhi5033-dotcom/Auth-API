import express from "express";
import authRoutes from "./routes/auth.routes.js";
import setupSwagger from "./config/swagger.js";

const app = express();

app.use(express.json());

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
