import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

// Extend Request to carry token info
export interface AuthRequest extends Request {
  accessToken?: {
    id: string;
    token: string;
    label: string;
    townshipId: string | null;
  };
}

// Middleware: validate access token
export const requireToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
    });

    if (!accessToken || !accessToken.isActive) {
      res.status(401).json({ error: "Invalid or revoked token" });
      return;
    }

    // Attach token info to request
    req.accessToken = {
      id: accessToken.id,
      token: accessToken.token,
      label: accessToken.label,
      townshipId: accessToken.townshipId,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};