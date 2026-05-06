const { Prisma } = require("@prisma/client");
const { AppError } = require("@/utils/http");

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Duplicate value violates a unique field",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
  }

  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Uploaded file is too large",
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

module.exports = errorHandler;
