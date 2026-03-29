import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import townshipRoutes from "./routes/townships";
import reportRoutes from "./routes/reports";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running! 🚀" });
});

// Routes
app.use("/api/townships", townshipRoutes);
app.use("/api/reports", reportRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});