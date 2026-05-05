const asyncHandler = require("@/utils/asyncHandler");
const { sendSuccess } = require("@/utils/http");
const publicService = require("@/services/public.service");

const getLandingSummary = asyncHandler(async (_req, res) => {
  const summary = await publicService.getLandingSummary();
  return sendSuccess(res, summary);
});

module.exports = {
  getLandingSummary,
};
