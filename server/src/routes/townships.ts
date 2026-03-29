import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/townships — Get all townships
router.get("/", async (req: Request, res: Response) => {
  try {
    const townships = await prisma.township.findMany({
      orderBy: { name: "asc" },
    });
    res.json(townships);
  } catch (error) {
    console.error("Error fetching townships:", error);
    res.status(500).json({ error: "Failed to fetch townships" });
  }
});

// GET /api/townships/:id — Get a single township by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const township = await prisma.township.findUnique({
      where: { id: req.params.id as string },
      include: { reports: true }, // Also return all reports in this township
    });

    if (!township) {
      res.status(404).json({ error: "Township not found" });
      return;
    }

    res.json(township);
  } catch (error) {
    console.error("Error fetching township:", error);
    res.status(500).json({ error: "Failed to fetch township" });
  }
});

export default router;