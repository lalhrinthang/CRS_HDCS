// server/src/routes/reports.ts
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { requireToken, AuthRequest } from "../middleware/auth";

const router = Router();

// ─── GET /api/reports — Get all reports (public) ───
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, status, township, search } = req.query;

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
          select: { id: true, name: true, email: true },
        },
        township: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ─── GET /api/reports/stats/summary — Dashboard stats (public) ───
// ⚠️ This MUST be before /:id or Express treats "stats" as an id
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    const [totalReports, byCategory, byStatus, byTownship] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
      prisma.report.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.report.findMany({
        select: {
          township: { select: { name: true } },
        },
      }),
    ]);

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

// ─── GET /api/reports/:id — Get single report (public) ───
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id as string },
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

// ─── POST /api/reports — Create report (requires token) ───
router.post("/", requireToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      status,
      latitude,
      longitude,
      township,
      photoUrl,
    } = req.body;

    // Validation
    if (!title || !description || !category || !latitude || !longitude || !township) {
      res.status(400).json({
        error: "Missing required fields",
        required: ["title", "description", "category", "latitude", "longitude", "township"],
        received: { title, description, category, latitude, longitude, township },
      });
      return;
    }

    // Look up township by name
    const townshipRecord = await prisma.township.findFirst({
      where: { name: { equals: township, mode: "insensitive" } },
    });

    if (!townshipRecord) {
      res.status(400).json({ error: `Township "${township}" not found` });
      return;
    }

    // ✅ Use accessToken from requireToken middleware
    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        status: status || "active",
        latitude: parseFloat(String(latitude)),
        longitude: parseFloat(String(longitude)),
        townshipId: townshipRecord.id,
        accessTokenId: req.accessToken!.id,
        // authorId is required by schema — we need a default user
        // See note below
        authorId: await getOrCreateSystemUser(),
        photoUrl,
      },
      include: {
        township: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// ─── PUT /api/reports/:id — Update report (requires token) ───
router.put("/:id", requireToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, status, latitude, longitude, photoUrl } = req.body;

    const report = await prisma.report.update({
      where: { id: req.params.id as string },
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
        author: { select: { id: true, name: true, email: true } },
        township: true,
      },
    });

    res.json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// ─── DELETE /api/reports/:id — Delete report (requires token) ───
router.delete("/:id", requireToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.report.delete({
      where: { id: req.params.id as string },
    });
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

// ─── Helper: get or create a system user for token-based reports ───
async function getOrCreateSystemUser(): Promise<string> {
  const systemEmail = "system@crs-hdcs.local";
  let user = await prisma.user.findUnique({ where: { email: systemEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: systemEmail,
        password: "not-used", // Token auth doesn't use passwords
        name: "Community Reporter",
        role: "USER",
      },
    });
  }

  return user.id;
}

export default router;