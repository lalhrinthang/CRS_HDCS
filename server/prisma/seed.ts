import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Available models:", Object.keys(prisma));
  // First, make sure townships exist (adjust to match your existing townships)
  const townships = await prisma.township.findMany();

  const tokens = [
    { token: "crs-ygn-thanlyin-1", label: "Thanlyin Community Lead" },
    { token: "crs-ygn-hlaing-2", label: "Hlaing Township Reporter" },
    { token: "crs-ygn-insein-3", label: "Insein Area Monitor" },
    { token: "crs-ygn-tamwe-4", label: "Tamwe Safety Officer" },
    { token: "crs-ygn-mingala-5", label: "Mingaladon Reporter" },
    { token: "crs-ygn-dagon-6", label: "Dagon Community Watch" },
    { token: "crs-ygn-yankin-7", label: "Yankin Area Lead" },
    { token: "crs-ygn-botahtaung-8", label: "Botahtaung Monitor" },
    { token: "crs-ygn-latha-9", label: "Latha Safety Reporter" },
    { token: "crs-ygn-admin-10", label: "System Administrator" },
  ];

  for (const t of tokens) {
    // Try to match township from token name
    const townshipName = t.token.split("-")[2]; // e.g. "thanlyin"
    const matchedTownship = townships.find((tw) =>
      tw.name.toLowerCase().includes(townshipName)
    );

    await prisma.accessToken.upsert({
      where: { token: t.token },
      update: { label: t.label },
      create: {
        token: t.token,
        label: t.label,
        townshipId: matchedTownship?.id || null,
      },
    });
  }

  console.log("✅ 10 access tokens seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());