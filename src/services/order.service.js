const prisma = require("@/lib/prisma");
const { AppError } = require("@/utils/http");

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

async function createOrder(payload) {
  const gig = await prisma.gig.findUnique({
    where: { id: payload.gigId },
  });

  if (!gig) {
    throw new AppError(404, "Gig not found");
  }

  if (gig.ownerId === payload.clientId) {
    throw new AppError(403, "Gig owners cannot order their own gigs");
  }
  
  return prisma.order.create({
    data: {
      gigId: payload.gigId,
      clientId: payload.clientId,
      sellerId: gig.ownerId,
      message: payload.message,
      agreedPrice: payload.agreedPrice ?? gig.price,
    },
    include: {
      gig: true,
      client: true,
      seller: true,
    },
  });
}

async function listOrders(filters) {
  return prisma.order.findMany({
    where: buildOrderWhere(filters),
    include: {
      gig: true,
      client: true,
      seller: true,
    },
    orderBy: { id: "desc" },
  });
}

async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      gig: true,
      client: true,
      seller: true,
      review: true,
    },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return order;
}

async function updateOrderStatus(id, status) {
  await getOrderById(id);

  return prisma.order.update({
    where: { id },
    data: { status },
    include: {
      gig: true,
      client: true,
      seller: true,
      review: true,
    },
  });
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
};
