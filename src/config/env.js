const port = Number(process.env.PORT) || 3000;
const maxUploadFileSizeMb = Number(process.env.MAX_UPLOAD_FILE_SIZE_MB) || 5;
const webpQuality = Number(process.env.WEBP_QUALITY) || 95;
const thumbnailWidth = Number(process.env.THUMBNAIL_WIDTH) || 320;

function parseBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n", "off"].includes(normalized)) {
    return false;
  }
  return defaultValue;
}

module.exports = {
  port,
  internalApiKey: process.env.INTERNAL_API_KEY || "",
  apiKeyRequired: parseBoolean(process.env.API_KEY_REQUIRED, true),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "change-this-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  mediaBaseDir: process.env.MEDIA_BASE_DIR || "media",
  maxUploadFileSizeBytes: maxUploadFileSizeMb * 1024 * 1024,
  webpQuality,
  thumbnailWidth
};
