const express = require("express");
const path = require("path");
const fs = require("fs");
const {
    mediaBaseDir
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
app.use(express.json());

const absoluteMediaDir = path.resolve(process.cwd(), mediaBaseDir);
fs.mkdirSync(path.join(absoluteMediaDir, "profiles"), { recursive: true });
fs.mkdirSync(path.join(absoluteMediaDir, "uploads"), { recursive: true });
fs.mkdirSync(path.join(absoluteMediaDir, "thumbnails"), { recursive: true });

app.use("/media", express.static(absoluteMediaDir));

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
