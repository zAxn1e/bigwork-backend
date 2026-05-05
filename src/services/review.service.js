const prisma = require("@/lib/prisma");
const { AppError } = require("@/utils/http");

async function createReview(payload) {
  const order = await prisma.order.findUnique({
    where: { id: payload.orderId },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.sellerId === payload.authorId) {
    throw new AppError(403, "Gig owners cannot review their own gigs");
  }

  const existingReview = await prisma.review.findUnique({
    where: { orderId: payload.orderId },
  });

  if (existingReview) {
    throw new AppError(409, "Only one review is allowed per order");
  }

  return prisma.review.create({
    data: {
      orderId: payload.orderId,
      gigId: order.gigId,
      authorId: payload.authorId,
      targetUserId: payload.targetUserId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      order: true,
      gig: true,
      author: true,
      targetUser: true,
    },
  });
}

async function listReviews() {
  return prisma.review.findMany({
    include: {
      order: true,
      gig: true,
      author: true,
      targetUser: true,
    },
    orderBy: { id: "desc" },
  });
}

async function getReviewById(id) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      order: true,
      gig: true,
      author: true,
      targetUser: true,
    },
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  return review;
}

module.exports = {
  createReview,
  listReviews,
  getReviewById,
};
