import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/reports — Get all reports (with filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, status, township, search } = req.query;

    // Build filter object dynamically
    const where: any = {};

    if (category && category !== "all") {
      where.category = category;
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (township && township !== "all") {
      where.township = { name: township };
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true }, // Don't send password!
        },
        township: true,
      },
      orderBy: { createdAt: "desc" }, // Newest first
    });

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// GET /api/reports/:id — Get a single report
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        township: true,
      },
    });

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// POST /api/reports — Create a new report
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      townshipId,
      authorId,
      photoUrl,
    } = req.body;

    // Basic validation
    if (!title || !description || !category || !latitude || !longitude || !townshipId || !authorId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        photoUrl,
        authorId,
        townshipId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        township: true,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// PUT /api/reports/:id — Update a report (e.g., change status)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { title, description, category, status, latitude, longitude, photoUrl } = req.body;

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(status && { status }),
        ...(latitude && { latitude: parseFloat(latitude) }),
        ...(longitude && { longitude: parseFloat(longitude) }),
        ...(photoUrl !== undefined && { photoUrl }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        township: true,
      },
    });

    res.json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// DELETE /api/reports/:id — Delete a report
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.report.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

// GET /api/reports/stats/summary — Dashboard statistics
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    const [totalReports, byCategory, byStatus, byTownship] = await Promise.all([
      // Total count
      prisma.report.count(),

      // Count by category
      prisma.report.groupBy({
        by: ["category"],
        _count: { id: true },
      }),

      // Count by status
      prisma.report.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Count by township
      prisma.report.findMany({
        select: {
          township: { select: { name: true } },
        },
      }),
    ]);

    // Count reports per township
    const townshipCounts: Record<string, number> = {};
    byTownship.forEach((r) => {
      const name = r.township.name;
      townshipCounts[name] = (townshipCounts[name] || 0) + 1;
    });

    res.json({
      totalReports,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      byTownship: Object.entries(townshipCounts).map(([name, count]) => ({
        township: name,
        count,
      })),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;