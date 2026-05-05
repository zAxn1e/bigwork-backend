require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");

async function main() {
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.gig.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, freelancer1, freelancer2, client1, client2] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@bigwork.com",
        passwordHash,
        displayName: "System Admin",
        firstName: "System",
        lastName: "Admin",
        birthday: new Date("1990-01-01"),
        telephoneNumber: "0800000000",
        skills: ["Management", "Operations"],
        role: "ADMIN",
        bio: "Internal system administrator",
      },
    }),
    prisma.user.create({
      data: {
        email: "freelancer1@bigwork.com",
        passwordHash,
        displayName: "Narin Dev",
        firstName: "Narin",
        lastName: "Dev",
        birthday: new Date("1996-04-21"),
        telephoneNumber: "0811111111",
        skills: ["Backend", "Node.js", "Automation"],
        role: "FREELANCER",
        bio: "Backend API and automation specialist",
      },
    }),
    prisma.user.create({
      data: {
        email: "freelancer2@bigwork.com",
        passwordHash,
        displayName: "Mali Design",
        firstName: "Mali",
        lastName: "Design",
        birthday: new Date("1997-09-09"),
        telephoneNumber: "0822222222",
        skills: ["UI/UX", "Branding"],
        role: "FREELANCER",
        bio: "UI and branding freelancer",
      },
    }),
    prisma.user.create({
      data: {
        email: "client1@bigwork.com",
        passwordHash,
        displayName: "Acme Team",
        firstName: "Acme",
        lastName: "Team",
        birthday: new Date("1992-11-12"),
        telephoneNumber: "0833333333",
        skills: ["Product", "Planning"],
        role: "CLIENT",
        bio: "Startup team looking for quick delivery",
      },
    }),
    prisma.user.create({
      data: {
        email: "client2@bigwork.com",
        passwordHash,
        displayName: "Orbit Studio",
        firstName: "Orbit",
        lastName: "Studio",
        birthday: new Date("1993-06-30"),
        telephoneNumber: "0844444444",
        skills: ["Creative", "Marketing"],
        role: "CLIENT",
        bio: "Creative studio with recurring freelance tasks",
      },
    }),
  ]);

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Web Development" } }),
    prisma.category.create({ data: { name: "Mobile Development" } }),
    prisma.category.create({ data: { name: "UI/UX Design" } }),
    prisma.category.create({ data: { name: "Content Writing" } }),
    prisma.category.create({ data: { name: "Digital Marketing" } }),
  ]);

  const gigs = await Promise.all([
    prisma.gig.create({
      data: {
        title: "Build Fastify REST API",
        description: "Create scalable REST API with clean project structure.",
        price: 12000,
        ownerId: freelancer1.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.gig.create({
      data: {
        title: "Landing Page UI Design",
        description: "Modern landing page design in Figma.",
        price: 8000,
        ownerId: freelancer2.id,
        categoryId: categories[2].id,
      },
    }),
    prisma.gig.create({
      data: {
        title: "Node.js Bug Fix Session",
        description: "Fix production bugs and improve logs.",
        price: 5000,
        ownerId: freelancer1.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.gig.create({
      data: {
        title: "SEO Blog Article Pack",
        description: "Five SEO-focused Thai/English articles.",
        price: 4500,
        ownerId: freelancer2.id,
        categoryId: categories[3].id,
      },
    }),
  ]);

  const order1 = await prisma.order.create({
    data: {
      gigId: gigs[0].id,
      clientId: client1.id,
      sellerId: gigs[0].ownerId,
      agreedPrice: 11500,
      status: "COMPLETED",
      message: "Need API with category, gigs, and order endpoints",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      gigId: gigs[1].id,
      clientId: client2.id,
      sellerId: gigs[1].ownerId,
      agreedPrice: 8000,
      status: "COMPLETED",
      message: "Brand refresh and landing page concept",
    },
  });

  const order3 = await prisma.order.create({
    data: {
      gigId: gigs[2].id,
      clientId: client1.id,
      sellerId: gigs[2].ownerId,
      agreedPrice: 5000,
      status: "PENDING",
      message: "Debug intermittent timeout issues",
    },
  });

  await prisma.review.create({
    data: {
      orderId: order1.id,
      gigId: order1.gigId,
      authorId: client1.id,
      targetUserId: freelancer1.id,
      rating: 5,
      comment: "Very clean API code and clear communication.",
    },
  });

  await prisma.review.create({
    data: {
      orderId: order2.id,
      gigId: order2.gigId,
      authorId: client2.id,
      targetUserId: freelancer2.id,
      rating: 4,
      comment: "Good design quality and on-time updates.",
    },
  });

  console.log("Seed completed successfully.");
  console.log({
    adminId: admin.id,
    freelancers: [freelancer1.id, freelancer2.id],
    clients: [client1.id, client2.id],
    sampleOrderIds: [order1.id, order2.id, order3.id],
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
