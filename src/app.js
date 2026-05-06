const express = require("express");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const { openApiSpec } = require("@/docs/openapi");
const {
  mediaBaseDir,
  frontendDocsEnabled,
  frontendDocsPath,
  frontendDocsDistDir,
  openApiServerUrls,
} = require("@/config/env");
const apiKeyAuth = require("@/middlewares/apiKeyAuth");
const notFound = require("@/middlewares/notFound");
const errorHandler = require("@/middlewares/errorHandler");
const authRoutes = require("@/routes/auth.routes");
const mediaRoutes = require("@/routes/media.routes");
const profileRoutes = require("@/routes/profile.routes");
const categoryRoutes = require("@/routes/category.routes");
const gigRoutes = require("@/routes/gig.routes");
const orderRoutes = require("@/routes/order.routes");
const reviewRoutes = require("@/routes/review.routes");
const adminRoutes = require("@/routes/admin.routes");
const publicRoutes = require("@/routes/public.routes");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow no-origin
    return callback(null, origin);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
}));
app.options('/*', cors());
app.use(express.json());

function firstHeaderValue(value) {
  return String(value || "")
    .split(",")[0]
    .trim();
}

function isLocalHostname(hostname) {
  const normalized = String(hostname || "").trim().toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "0.0.0.0" ||
    normalized === "::1" ||
    normalized.startsWith("127.")
  );
}

function isLocalServerUrl(url) {
  try {
    const parsed = new URL(url);
    return isLocalHostname(parsed.hostname);
  } catch (_error) {
    return false;
  }
}

function resolveRequestBaseUrl(req) {
  const forwardedProto = firstHeaderValue(req.get("x-forwarded-proto"));
  const host = req.get("host");
  const proto = forwardedProto || req.protocol || "http";
  if (!host) {
    return null;
  }
  return `${proto}://${host}`;
}

function resolveForwardedBaseUrl(req) {
  const forwardedProto = firstHeaderValue(req.get("x-forwarded-proto"));
  const forwardedHost = firstHeaderValue(req.get("x-forwarded-host"));
  if (!forwardedHost) {
    return null;
  }
  return `${forwardedProto || "https"}://${forwardedHost}`;
}

const absoluteMediaDir = path.resolve(process.cwd(), mediaBaseDir);
const absoluteFrontendDocsDistDir = path.resolve(process.cwd(), frontendDocsDistDir);
fs.mkdirSync(path.join(absoluteMediaDir, "profiles"), { recursive: true });
fs.mkdirSync(path.join(absoluteMediaDir, "uploads"), { recursive: true });
fs.mkdirSync(path.join(absoluteMediaDir, "thumbnails"), { recursive: true });

app.use("/media", express.static(absoluteMediaDir));

if (frontendDocsEnabled) {
  if (fs.existsSync(absoluteFrontendDocsDistDir)) {
    app.use(frontendDocsPath, express.static(absoluteFrontendDocsDistDir));
  } else {
    app.get(frontendDocsPath, (_req, res) => {
      res.status(503).json({
        success: false,
        message: "Frontend docs build not found. Run `npm run docs:frontend:build` first.",
        data: {
          expectedDir: absoluteFrontendDocsDistDir,
        },
      });
    });
  }
}

app.get("/openapi.json", (req, res) => {
  const hasExplicitOpenApiEnv =
    Boolean(String(process.env.OPENAPI_SERVER_URL || "").trim()) ||
    Boolean(String(process.env.OPENAPI_SERVER_URLS || "").trim());
  const forwardedBaseUrl = resolveForwardedBaseUrl(req);
  const requestBaseUrl = resolveRequestBaseUrl(req);
  const hasOnlyLocalConfiguredServers =
    openApiServerUrls.length > 0 &&
    openApiServerUrls.every((url) => isLocalServerUrl(url));
  const effectiveServerUrls = forwardedBaseUrl
    ? [forwardedBaseUrl]
    : requestBaseUrl && (!hasExplicitOpenApiEnv || hasOnlyLocalConfiguredServers)
      ? [requestBaseUrl]
      : openApiServerUrls;

  res.json({
    ...openApiSpec,
    servers: effectiveServerUrls.map((url) => ({ url })),
  });
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    explorer: true,
    customSiteTitle: "BigWork Internal API Docs",
    swaggerOptions: {
      url: "/openapi.json",
    },
  }),
);

app.get("/health", (_req, res) => {
    res.json({
        success: true,
        data: {
            status: "ok",
            timestamp: new Date().toISOString(),
        },
    });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/media-assets", mediaRoutes);
app.use("/public", publicRoutes);

app.use(apiKeyAuth);

app.use("/categories", categoryRoutes);
app.use("/gigs", gigRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
