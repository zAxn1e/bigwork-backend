const port = Number(process.env.PORT) || 3000;
const maxUploadFileSizeMb = Number(process.env.MAX_UPLOAD_FILE_SIZE_MB) || 5;
const webpQuality = Number(process.env.WEBP_QUALITY) || 95;
const thumbnailWidth = Number(process.env.THUMBNAIL_WIDTH) || 320;

function normalizePathPrefix(value, fallback) {
  const raw = (value || fallback || "").trim();
  if (!raw) {
    return "/";
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function normalizeBaseUrl(value, fallback) {
  const raw = (value || fallback || "").trim();
  return raw.replace(/\/+$/, "");
}

function parseBaseUrlList(value) {
  return String(value || "")
    .split(",")
    .map((item) => normalizeBaseUrl(item, ""))
    .filter(Boolean);
}

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
  thumbnailWidth,
  frontendDocsEnabled: parseBoolean(process.env.FRONTEND_DOCS_ENABLED, true),
  frontendDocsPath: normalizePathPrefix(process.env.FRONTEND_DOCS_PATH, "/frontend-guide"),
  frontendDocsDistDir: process.env.FRONTEND_DOCS_DIST_DIR || "frontend-docs/build",
  openApiServerUrl: normalizeBaseUrl(
    process.env.OPENAPI_SERVER_URL,
    `http://localhost:${port}`,
  ),
  openApiServerUrls: (() => {
    const fallback = normalizeBaseUrl(
      process.env.OPENAPI_SERVER_URL,
      `http://localhost:${port}`,
    );
    const parsed = parseBaseUrlList(process.env.OPENAPI_SERVER_URLS);
    return parsed.length ? parsed : [fallback];
  })(),
};
