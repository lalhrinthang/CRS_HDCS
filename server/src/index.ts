// server/src/index.ts
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import townshipRoutes from "./routes/townships";
import reportRoutes from "./routes/reports";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Production-ready CORS
const allowedOrigins = [
  "http://localhost:5173",                        // local Vite dev
  "http://localhost:8080",                        // alternate local
  "https://community-reporting-system.vercel.app", // your Vercel frontend
  "https://crs-app-ocltk.ondigitalocean.app/" // your DigitalOcean backend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running! 🚀" });
});

// Routes
app.use("/api/townships", townshipRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});