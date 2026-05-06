const gigService = require("@/services/gig.service");
const asyncHandler = require("@/utils/asyncHandler");
const { AppError, sendSuccess } = require("@/utils/http");
const {
  parseBooleanQuery,
  parseId,
  parseOptionalId,
  requireNonEmptyString,
  requirePositiveInt,
  optionalPositiveInt,
} = require("@/utils/validation");

const listGigs = asyncHandler(async (req, res) => {
  const filters = {
    q: typeof req.query.q === "string" ? req.query.q.trim() : undefined,
    categoryId: parseOptionalId(req.query.categoryId, "categoryId"),
    isActive: parseBooleanQuery(req.query.isActive, "isActive"),
  };

  const page = parseOptionalId(req.query.page, "page");
  const limit = parseOptionalId(req.query.limit, "limit");
  const pagination = page !== undefined || limit !== undefined ? { page, limit } : undefined;

  const gigs = await gigService.listGigs(filters, pagination);
  return sendSuccess(res, gigs);
});

const getGigById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const gig = await gigService.getGigById(id);
  return sendSuccess(res, gig);
});

const createGig = asyncHandler(async (req, res) => {
  const payload = {
    title: requireNonEmptyString(req.body.title, "title"),
    description: requireNonEmptyString(req.body.description, "description"),
    price: requirePositiveInt(req.body.price, "price"),
    ownerId: req.auth.userId,
    categoryId: requirePositiveInt(req.body.categoryId, "categoryId"),
  };

  if (req.body.isActive !== undefined) {
    if (typeof req.body.isActive !== "boolean") {
      throw new AppError(400, "isActive must be a boolean");
    }
    payload.isActive = req.body.isActive;
  }

  const gig = await gigService.createGig(payload);
  return sendSuccess(res, gig, 201);
});

const updateGig = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const payload = {};

  if (req.body.title !== undefined) {
    payload.title = requireNonEmptyString(req.body.title, "title");
  }

  if (req.body.description !== undefined) {
    payload.description = requireNonEmptyString(req.body.description, "description");
  }

  if (req.body.price !== undefined) {
    payload.price = optionalPositiveInt(req.body.price, "price");
  }

  if (req.body.categoryId !== undefined) {
    payload.categoryId = optionalPositiveInt(req.body.categoryId, "categoryId");
  }

  if (req.body.isActive !== undefined) {
    if (typeof req.body.isActive !== "boolean") {
      throw new AppError(400, "isActive must be a boolean");
    }
    payload.isActive = req.body.isActive;
  }

  const updated = await gigService.updateGig(id, payload, req.auth.userId);
  return sendSuccess(res, updated);
});

const deleteGig = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  await gigService.deleteGig(id, req.auth.userId);

  return res.status(200).json({
    success: true,
    data: {
      message: "Gig deleted successfully",
    },
  });
});

const listGigMedia = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const items = await gigService.listGigMedia(id);
  return sendSuccess(res, items.map((item) => item.mediaAsset));
});

const uploadGigMedia = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!req.file) {
    throw new AppError(400, "file is required");
  }
  const item = await gigService.uploadGigMedia(id, req.auth.userId, req.file);
  return sendSuccess(res, item, 201);
});

const deleteGigMedia = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const mediaAssetId = parseId(req.params.mediaId, "mediaId");
  await gigService.deleteGigMedia(id, mediaAssetId, req.auth.userId);
  return sendSuccess(res, { message: "Gig media deleted" });
});

module.exports = {
  listGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  listGigMedia,
  uploadGigMedia,
  deleteGigMedia,
};
