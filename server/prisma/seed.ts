import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ─── All 45 Yangon Region Townships ───
// Sources: Wikipedia, MIMU, GAD Township Profiles
const townships = [
  // Kyauktada District (Downtown)
  { name: "Kyauktada", lat: 16.7775, lng: 96.1608, district: "Kyauktada" },
  { name: "Pabedan", lat: 16.7803, lng: 96.1553, district: "Kyauktada" },
  { name: "Lanmadaw", lat: 16.7839, lng: 96.1477, district: "Kyauktada" },
  { name: "Latha", lat: 16.7753, lng: 96.1558, district: "Kyauktada" },
  { name: "Dagon", lat: 16.781, lng: 96.1735, district: "Kyauktada" },
  { name: "Seikkan", lat: 16.77, lng: 96.14, district: "Kyauktada" },

  // Ahlon District
  { name: "Ahlone", lat: 16.7829, lng: 96.1288, district: "Ahlon" },
  { name: "Kyimyindaing", lat: 16.795, lng: 96.13, district: "Ahlon" },
  { name: "Sanchaung", lat: 16.8, lng: 96.1333, district: "Ahlon" },

  // Kamayut District
  { name: "Kamayut", lat: 16.8208, lng: 96.1347, district: "Kamayut" },
  { name: "Bahan", lat: 16.8167, lng: 96.1583, district: "Kamayut" },

  // Mayangon District
  { name: "Mayangone", lat: 16.8625, lng: 96.1389, district: "Mayangon" },
  { name: "Hlaing", lat: 16.8458, lng: 96.1194, district: "Mayangon" },
  { name: "North Okkalapa", lat: 16.8542, lng: 96.1917, district: "Mayangon" },

  // Thingangyun District
  { name: "Thingangyun", lat: 16.8417, lng: 96.1833, district: "Thingangyun" },
  { name: "South Okkalapa", lat: 16.825, lng: 96.2083, district: "Thingangyun" },
  { name: "Tamwe", lat: 16.8167, lng: 96.1917, district: "Thingangyun" },
  { name: "Yankin", lat: 16.8333, lng: 96.1667, district: "Thingangyun" },

  // Botahtaung District
  { name: "Botataung", lat: 16.7711, lng: 96.1913, district: "Botahtaung" },
  { name: "Dawbon", lat: 16.8042, lng: 96.2167, district: "Botahtaung" },
  { name: "Mingala Taungnyunt", lat: 16.795, lng: 96.18, district: "Botahtaung" },
  { name: "Pazundaung", lat: 16.7826, lng: 96.1807, district: "Botahtaung" },
  { name: "Thaketa", lat: 16.7792, lng: 96.2208, district: "Botahtaung" },

  // Dagon Myothit District (New Dagon)
  { name: "Dagon Seikkan", lat: 16.845, lng: 96.26, district: "Dagon Myothit" },
  { name: "South Dagon", lat: 16.81, lng: 96.25, district: "Dagon Myothit" },
  { name: "North Dagon", lat: 16.87, lng: 96.22, district: "Dagon Myothit" },
  { name: "East Dagon", lat: 16.855, lng: 96.27, district: "Dagon Myothit" },

  // Insein District
  { name: "Insein", lat: 16.8994, lng: 96.1003, district: "Insein" },
  { name: "Hlaingthaya", lat: 16.88, lng: 96.06, district: "Insein" },

  // Mingaladon District
  { name: "Mingaladon", lat: 16.9333, lng: 96.0833, district: "Mingaladon" },
  { name: "Shwepyitha", lat: 16.93, lng: 96.04, district: "Mingaladon" },

  // Twantay District (Southern)
  { name: "Seikkyi Kanaungto", lat: 16.76, lng: 96.11, district: "Twantay" },
  { name: "Dala", lat: 16.75, lng: 96.16, district: "Twantay" },
  { name: "Twante", lat: 16.71, lng: 95.93, district: "Twantay" },
  { name: "Kawhmu", lat: 16.55, lng: 96.15, district: "Twantay" },
  { name: "Kungyangon", lat: 16.58, lng: 96.03, district: "Twantay" },

  // Thanlyin District
  { name: "Thanlyin", lat: 16.7659, lng: 96.2515, district: "Thanlyin" },
  { name: "Kyauktan", lat: 16.65, lng: 96.43, district: "Thanlyin" },
  { name: "Thongwa", lat: 16.75, lng: 96.52, district: "Thanlyin" },
  { name: "Kayan", lat: 17.07, lng: 96.55, district: "Thanlyin" },

  // Northern Yangon
  { name: "Hlegu", lat: 17.1, lng: 96.2, district: "Northern Yangon" },
  { name: "Hmawbi", lat: 17.1362, lng: 96.0097, district: "Northern Yangon" },
  { name: "Htantabin", lat: 17.05, lng: 95.95, district: "Northern Yangon" },
  { name: "Taikkyi", lat: 17.35, lng: 95.98, district: "Northern Yangon" },

  // Cocokyun (remote island township)
  { name: "Cocokyun", lat: 14.12, lng: 93.37, district: "Cocokyun" },
];

// ─── Access Tokens ───
const tokens = [
  { token: "crs-ygn-thanlyin-1", label: "Thanlyin Community Lead", township: "Thanlyin" },
  { token: "crs-ygn-hlaing-2", label: "Hlaing Township Reporter", township: "Hlaing" },
  { token: "crs-ygn-insein-3", label: "Insein Area Monitor", township: "Insein" },
  { token: "crs-ygn-tamwe-4", label: "Tamwe Safety Officer", township: "Tamwe" },
  { token: "crs-ygn-mingala-5", label: "Mingaladon Reporter", township: "Mingaladon" },
  { token: "crs-ygn-dagon-6", label: "Dagon Community Watch", township: "Dagon" },
  { token: "crs-ygn-yankin-7", label: "Yankin Area Lead", township: "Yankin" },
  { token: "crs-ygn-botahtaung-8", label: "Botataung Monitor", township: "Botataung" },
  { token: "crs-ygn-latha-9", label: "Latha Safety Reporter", township: "Latha" },
  { token: "crs-ygn-admin-10", label: "System Administrator", township: null },
];

// ─── Sample Reports ───
const sampleReports = [
  {
    title: "Broken street light on Main Road",
    description: "Street light near the market has been out for 2 weeks. Area is very dark at night, creating safety concerns for pedestrians.",
    category: "infrastructure" as const,
    township: "Tamwe",
    latOffset: 0.003, lngOffset: -0.002,
  },
  {
    title: "Large pothole causing accidents",
    description: "Deep pothole on the main road near the bus stop. Multiple motorbikes have fallen. Needs urgent repair.",
    category: "infrastructure" as const,
    township: "Hlaing",
    latOffset: -0.004, lngOffset: 0.003,
  },
  {
    title: "Illegal dumping near canal",
    description: "Residents are dumping garbage near the drainage canal. Causing foul smell and potential flooding during rainy season.",
    category: "environmental" as const,
    township: "Insein",
    latOffset: 0.005, lngOffset: -0.001,
  },
  {
    title: "Stagnant water breeding mosquitoes",
    description: "Large pool of stagnant water in abandoned lot. Dengue cases have been reported in the area recently.",
    category: "health" as const,
    township: "North Okkalapa",
    latOffset: -0.002, lngOffset: 0.004,
  },
  {
    title: "Unsafe construction site without barriers",
    description: "Construction site on residential street has no safety barriers or warning signs. Children play nearby.",
    category: "safety" as const,
    township: "Dagon",
    latOffset: 0.001, lngOffset: -0.003,
  },
  {
    title: "Broken traffic signal at intersection",
    description: "Traffic light at the main intersection has been malfunctioning for 3 days. Causing traffic jams and near-accidents.",
    category: "traffic" as const,
    township: "Botataung",
    latOffset: -0.001, lngOffset: 0.002,
  },
  {
    title: "Flooded road after rain",
    description: "Road floods every time it rains due to blocked drainage. Vehicles and pedestrians cannot pass safely.",
    category: "environmental" as const,
    township: "Latha",
    latOffset: 0.002, lngOffset: 0.001,
  },
  {
    title: "Exposed electrical wiring on pole",
    description: "Electrical wires are hanging low and exposed near a school. Extremely dangerous, especially during rain.",
    category: "safety" as const,
    township: "Yankin",
    latOffset: -0.003, lngOffset: -0.002,
  },
  {
    title: "Faded road markings near school",
    description: "Pedestrian crossing markings near the primary school are completely faded. Drivers don't slow down.",
    category: "traffic" as const,
    township: "Mayangone",
    latOffset: 0.004, lngOffset: 0.002,
  },
  {
    title: "Open sewage on residential street",
    description: "Sewage drain cover is missing, exposing open sewage. Strong smell and health hazard for nearby residents.",
    category: "health" as const,
    township: "South Okkalapa",
    latOffset: -0.005, lngOffset: 0.003,
  },
  {
    title: "Collapsed drainage in Hlaingthaya",
    description: "Main drainage channel has collapsed near the industrial zone. Flooding risk during monsoon season.",
    category: "infrastructure" as const,
    township: "Hlaingthaya",
    latOffset: 0.002, lngOffset: -0.004,
  },
  {
    title: "Noise pollution from factory",
    description: "Factory operating heavy machinery late at night. Residents in nearby apartments cannot sleep.",
    category: "other" as const,
    township: "Shwepyitha",
    latOffset: -0.003, lngOffset: 0.001,
  },
  {
    title: "Damaged bridge railing in Dala",
    description: "Bridge railing is broken and rusted. Pedestrians, especially children, are at risk of falling.",
    category: "safety" as const,
    township: "Dala",
    latOffset: 0.001, lngOffset: -0.002,
  },
  {
    title: "Water contamination in Thanlyin",
    description: "Tap water has unusual color and smell. Multiple households affected. Needs water quality testing.",
    category: "health" as const,
    township: "Thanlyin",
    latOffset: -0.002, lngOffset: 0.003,
  },
  {
    title: "Traffic congestion at Hledan Junction",
    description: "Daily gridlock at Hledan junction during rush hours. No traffic police present to manage flow.",
    category: "traffic" as const,
    township: "Kamayut",
    latOffset: 0.003, lngOffset: -0.001,
  },
];

// ─── Helper ───
function randomRecentDate(): Date {
  const now = new Date();
  now.setDate(now.getDate() - Math.floor(Math.random() * 30));
  return now;
}

// ─── Main Seed ───
async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Seed all 45 Townships
  console.log("📍 Seeding 45 Yangon Region townships...");
  const townshipMap = new Map<string, string>();

  for (const t of townships) {
    const township = await prisma.township.upsert({
      where: { name: t.name },
      update: { latitude: t.lat, longitude: t.lng },
      create: { name: t.name, latitude: t.lat, longitude: t.lng },
    });
    townshipMap.set(t.name, township.id);
  }
  console.log("  ✅ Townships seeded!\n");

  // 2. Seed default admin user
  console.log("👤 Seeding default admin user...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@crs-yangon.org" },
    update: {},
    create: {
      email: "admin@crs-yangon.org",
      password: "not-used-with-token-auth",
      name: "CRS System",
      role: "ADMIN",
    },
  });
  console.log(`  ✅ Admin user: ${adminUser.email}\n`);

  // 3. Seed Access Tokens
  console.log("🔑 Seeding 10 access tokens...");
  for (const t of tokens) {
    const townshipId = t.township ? townshipMap.get(t.township) || null : null;
    await prisma.accessToken.upsert({
      where: { token: t.token },
      update: { label: t.label, townshipId },
      create: {
        token: t.token,
        label: t.label,
        townshipId,
        isActive: true,
      },
    });
  }
  console.log("  ✅ Access tokens seeded!\n");

  // 4. Seed Sample Reports
  console.log("📝 Seeding 15 sample reports...");
  for (const r of sampleReports) {
    const townshipId = townshipMap.get(r.township);
    const township = townships.find((t) => t.name === r.township)!;

    await prisma.report.create({
      data: {
        title: r.title,
        description: r.description,
        category: r.category,
        status: "active",
        latitude: township.lat + r.latOffset,
        longitude: township.lng + r.lngOffset,
        authorId: adminUser.id,
        townshipId: townshipId!,
        createdAt: randomRecentDate(),
      },
    });
  }
  console.log("  ✅ Sample reports seeded!\n");

  // 5. Summary
  const counts = {
    townships: await prisma.township.count(),
    tokens: await prisma.accessToken.count(),
    reports: await prisma.report.count(),
    users: await prisma.user.count(),
  };

  console.log("🎉 Seed complete! Database summary:");
  console.log(`  📍 Townships: ${counts.townships}`);
  console.log(`  🔑 Access Tokens: ${counts.tokens}`);
  console.log(`  📝 Reports: ${counts.reports}`);
  console.log(`  👤 Users: ${counts.users}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());