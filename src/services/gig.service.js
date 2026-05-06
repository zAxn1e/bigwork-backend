const prisma = require("@/lib/prisma");
const { AppError } = require("@/utils/http");
const mediaAssetService = require("@/services/mediaAsset.service");

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

async function createGig(payload) {
  return prisma.gig.create({
    data: payload,
    include: gigInclude,
  });
}

async function listGigs(filters, pagination) {
  const where = buildGigWhere(filters);

  if (!pagination) {
    return prisma.gig.findMany({
      where,
      include: gigInclude,
      orderBy: { id: "desc" },
    });
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.gig.findMany({
      where,
      include: gigInclude,
      orderBy: { id: "desc" },
      skip,
      take: limit,
    }),
    prisma.gig.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
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

function assertGigOwner(gig, actorUserId) {
  if (gig.ownerId !== actorUserId) {
    throw new AppError(403, "You can only modify your own gig");
  }
}

async function updateGig(id, payload, actorUserId) {
  const existing = await getGigById(id);
  assertGigOwner(existing, actorUserId);

  return prisma.gig.update({
    where: { id },
    data: payload,
    include: gigInclude,
  });
}

async function deleteGig(id, actorUserId) {
  const existing = await getGigById(id);
  assertGigOwner(existing, actorUserId);

  for (const link of existing.mediaLinks) {
    await mediaAssetService.deleteMyMediaAsset(actorUserId, link.mediaAssetId);
  }

  await prisma.gig.delete({ where: { id } });
}

async function listGigMedia(id) {
  await getGigById(id);
  return prisma.gigMedia.findMany({
    where: { gigId: id },
    include: { mediaAsset: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

async function uploadGigMedia(id, actorUserId, file) {
  const gig = await getGigById(id);
  assertGigOwner(gig, actorUserId);

  const mediaAsset = await mediaAssetService.createMediaAsset(actorUserId, file);
  const maxSortOrder = await prisma.gigMedia.aggregate({
    where: { gigId: id },
    _max: { sortOrder: true },
  });

  await prisma.gigMedia.create({
    data: {
      gigId: id,
      mediaAssetId: mediaAsset.id,
      sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
    },
  });

  return mediaAsset;
}

async function deleteGigMedia(id, mediaAssetId, actorUserId) {
  const gig = await getGigById(id);
  assertGigOwner(gig, actorUserId);

  const link = await prisma.gigMedia.findUnique({
    where: {
      gigId_mediaAssetId: {
        gigId: id,
        mediaAssetId,
      },
    },
  });

  if (!link) {
    throw new AppError(404, "Gig media not found");
  }

  await prisma.gigMedia.delete({
    where: {
      gigId_mediaAssetId: {
        gigId: id,
        mediaAssetId,
      },
    },
  });

  await mediaAssetService.deleteMyMediaAsset(actorUserId, mediaAssetId);
}

module.exports = {
  createGig,
  listGigs,
  getGigById,
  updateGig,
  deleteGig,
  listGigMedia,
  uploadGigMedia,
  deleteGigMedia,
};
