const prisma = require("@/lib/prisma");
const { AppError } = require("@/utils/http");

const ORDER_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const gigInclude = {
  owner: true,
  category: true,
  mediaLinks: {
    include: {
      mediaAsset: true,
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  },
};

const orderInclude = {
  gig: true,
  client: true,
  seller: true,
  review: true,
};

const reviewInclude = {
  order: true,
  gig: true,
  author: true,
  targetUser: true,
};

function buildUserWhere(filters) {
  const where = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.q) {
    where.OR = [
      {
        email: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        displayName: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        firstName: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

function buildOrderWhere(filters) {
  const where = {};

  if (filters.clientId !== undefined) {
    where.clientId = filters.clientId;
  }

  if (filters.sellerId !== undefined) {
    where.sellerId = filters.sellerId;
  }

  if (filters.status !== undefined) {
    where.status = filters.status;
  }

  return where;
}

function buildGigWhere(filters) {
  const where = {};

  if (filters.q) {
    where.title = {
      contains: filters.q,
      mode: "insensitive",
    };
  }

  if (filters.categoryId !== undefined) {
    where.categoryId = filters.categoryId;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return where;
}

async function getAdminSummary() {
  const [users, gigs, orders, reviews, categories] = await Promise.all([
    prisma.user.count(),
    prisma.gig.count(),
    prisma.order.count(),
    prisma.review.count(),
    prisma.category.count(),
  ]);

  return {
    users,
    gigs,
    orders,
    reviews,
    categories,
  };
}

async function listUsers(filters) {
  return prisma.user.findMany({
    where: buildUserWhere(filters),
    orderBy: { id: "desc" },
  });
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
}

async function updateUser(id, payload, actorUserId) {
  const existing = await getUserById(id);

  if (
    id === actorUserId &&
    payload.role !== undefined &&
    payload.role !== existing.role
  ) {
    throw new AppError(400, "You cannot change your own role");
  }

  if (payload.firstName !== undefined || payload.lastName !== undefined) {
    const firstName = payload.firstName ?? existing.firstName ?? "";
    const lastName = payload.lastName ?? existing.lastName ?? "";
    payload.displayName = `${firstName} ${lastName}`.trim();
  }

  return prisma.user.update({
    where: { id },
    data: payload,
  });
}

async function deleteUser(id, actorUserId) {
  const user = await getUserById(id);

  if (id === actorUserId) {
    throw new AppError(400, "You cannot delete your own account");
  }

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount <= 1) {
      throw new AppError(409, "Cannot delete the last admin");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({
      where: {
        OR: [
          { authorId: id },
          { targetUserId: id },
        ],
      },
    });

    await tx.order.deleteMany({
      where: {
        OR: [
          { clientId: id },
          { sellerId: id },
        ],
      },
    });

    await tx.user.delete({
      where: { id },
    });
  });
}

async function listCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { gigs: true },
      },
    },
    orderBy: { id: "asc" },
  });
}

async function createCategory(name) {
  return prisma.category.create({
    data: { name },
  });
}

async function updateCategory(id, name) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return prisma.category.update({
    where: { id },
    data: { name },
  });
}

async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { gigs: true },
      },
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  if (category._count.gigs > 0) {
    throw new AppError(409, "Cannot delete category that still has gigs");
  }

  await prisma.category.delete({ where: { id } });
}

async function listGigs(filters) {
  return prisma.gig.findMany({
    where: buildGigWhere(filters),
    include: gigInclude,
    orderBy: { id: "desc" },
  });
}

async function getGigById(id) {
  const gig = await prisma.gig.findUnique({
    where: { id },
    include: gigInclude,
  });

  if (!gig) {
    throw new AppError(404, "Gig not found");
  }

  return gig;
}

async function updateGig(id, payload) {
  await getGigById(id);

  return prisma.gig.update({
    where: { id },
    data: payload,
    include: gigInclude,
  });
}

async function deleteGig(id) {
  await getGigById(id);
  await prisma.gig.delete({ where: { id } });
}

async function listOrders(filters) {
  return prisma.order.findMany({
    where: buildOrderWhere(filters),
    include: orderInclude,
    orderBy: { id: "desc" },
  });
}

async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return order;
}

async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new AppError(
      400,
      `status must be one of: ${ORDER_STATUSES.join(", ")}`,
    );
  }

  await getOrderById(id);
  return prisma.order.update({
    where: { id },
    data: { status },
    include: orderInclude,
  });
}

async function listReviews() {
  return prisma.review.findMany({
    include: reviewInclude,
    orderBy: { id: "desc" },
  });
}

async function getReviewById(id) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: reviewInclude,
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  return review;
}

async function deleteReview(id) {
  await getReviewById(id);
  await prisma.review.delete({ where: { id } });
}

module.exports = {
  getAdminSummary,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listGigs,
  getGigById,
  updateGig,
  deleteGig,
  listOrders,
  getOrderById,
  updateOrderStatus,
  listReviews,
  getReviewById,
  deleteReview,
};
