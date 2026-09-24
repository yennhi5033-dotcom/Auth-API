import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

// dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
};

startServer();



