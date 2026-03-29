import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// POST /api/auth/login — validate a token
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      include: { township: true },
    });

    if (!accessToken || !accessToken.isActive) {
      res.status(401).json({ error: "Invalid or revoked token" });
      return;
    }

    res.json({
      message: "Login successful",
      accessToken: {
        id: accessToken.id,
        token: accessToken.token,
        label: accessToken.label,
        township: accessToken.township?.name || null,
        townshipId: accessToken.townshipId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/verify — check if a token is still valid
router.get("/verify", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ valid: false });
      return;
    }

    const token = authHeader.split(" ")[1];
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      include: { township: true },
    });

    if (!accessToken || !accessToken.isActive) {
      res.status(401).json({ valid: false });
      return;
    }

    res.json({
      valid: true,
      accessToken: {
        id: accessToken.id,
        label: accessToken.label,
        township: accessToken.township?.name || null,
      },
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

export default router;