const prisma = require("@/lib/prisma");

async function getLandingSummary() {
  const [freelancersCount, completedOrders, ratingAggregate] = await Promise.all([
    prisma.user.count({
      where: { role: "FREELANCER" },
    }),
    prisma.order.count({
      where: { status: "COMPLETED" },
    }),
    prisma.review.aggregate({
      _avg: { rating: true },
    }),
  ]);

  return {
    freelancersCount,
    completedOrders,
    averageRating: ratingAggregate?._avg?.rating ?? 0,
  };
}

module.exports = {
  getLandingSummary,
};
