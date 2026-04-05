// server/src/index.ts
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import townshipRoutes from "./routes/townships";
import reportRoutes from "./routes/reports";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Production-ready CORS
const allowedOrigins = [
  "http://localhost:5173",                        // local Vite dev
  "http://localhost:8080",                        // local Vite dev
  "https://community-reporting-system.vercel.app", // your Vercel frontend
  "https://crs-web-app-k6wbs.ondigitalocean.app",  // your DigitalOcean frontend
  "https://crsmyanmar.tech",                    // your custom domain
];

// Debug logging for CORS issues
app.use((req, res, next) => {
  console.log(`[CORS Debug] Origin: ${req.get('origin')}, Method: ${req.method}, Path: ${req.path}`);
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    console.log(`[CORS Check] Checking origin: ${origin}`);
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ Origin allowed: ${origin}`);
      callback(null, true);
    } else {
      console.log(`[CORS] ❌ Origin rejected: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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