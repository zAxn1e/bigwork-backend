const { apiKeyRequired, jwtExpiresIn, openApiServerUrls } = require("@/config/env");

const protectedSecurity = apiKeyRequired ? [{ ApiKeyAuth: [] }] : [];
const jwtSecurity = [{ BearerAuth: [] }];
const protectedWithJwtSecurity = apiKeyRequired
  ? [{ ApiKeyAuth: [], BearerAuth: [] }]
  : [{ BearerAuth: [] }];

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "BigWork Internal API",
    version: "1.0.0",
    description:
      "Internal API for BigWork freelance marketplace.",
  },
  servers: openApiServerUrls.map((url) => ({ url })),
  tags: [
    { name: "Health" },
    { name: "Public" },
    { name: "Auth" },
    { name: "Profile" },
    { name: "Media" },
    { name: "Categories" },
    { name: "Gigs" },
    { name: "Orders" },
    { name: "Reviews" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "Internal API key header",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT access token from /auth/login or /auth/register",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Unauthorized: invalid or missing x-api-key" },
        },
        required: ["success", "message"],
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Web Development" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 2 },
          email: { type: "string", example: "freelancer1@internal.local" },
          firstname: { type: "string", example: "Narin" },
          lastname: { type: "string", example: "Dev" },
          birthday: { type: "string", format: "date-time", example: "1996-04-21T00:00:00.000Z" },
          telephoneNumber: { type: "string", example: "0811111111" },
          skills: { type: "array", items: { type: "string" }, example: ["Backend", "Node.js"] },
          displayName: { type: "string", example: "Narin Dev" },
          role: { type: "string", enum: ["CLIENT", "FREELANCER", "ADMIN"] },
          bio: { type: "string", nullable: true },
          profileImageUrl: { type: "string", nullable: true, example: "/media/profiles/abc.png" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Gig: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Build Fastify REST API" },
          description: { type: "string", example: "Create scalable REST API with clean structure." },
          price: { type: "integer", example: 12000 },
          isActive: { type: "boolean", example: true },
          ownerId: { type: "integer", example: 2 },
          categoryId: { type: "integer", example: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          owner: { $ref: "#/components/schemas/User" },
          category: { $ref: "#/components/schemas/Category" },
          mediaLinks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer", example: 10 },
                sortOrder: { type: "integer", example: 1 },
                mediaAsset: { $ref: "#/components/schemas/MediaAsset" },
              },
            },
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          message: { type: "string", nullable: true },
          agreedPrice: { type: "integer", example: 11500 },
          status: {
            type: "string",
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
            example: "PENDING",
          },
          gigId: { type: "integer", example: 1 },
          clientId: { type: "integer", example: 4 },
          sellerId: { type: "integer", example: 2 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          gig: { $ref: "#/components/schemas/Gig" },
          client: { $ref: "#/components/schemas/User" },
          seller: { $ref: "#/components/schemas/User" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", nullable: true, example: "Great work" },
          orderId: { type: "integer", example: 1 },
          gigId: { type: "integer", example: 1 },
          authorId: { type: "integer", example: 4 },
          targetUserId: { type: "integer", example: 2 },
          createdAt: { type: "string", format: "date-time" },
          order: { $ref: "#/components/schemas/Order" },
          gig: { $ref: "#/components/schemas/Gig" },
          author: { $ref: "#/components/schemas/User" },
          targetUser: { $ref: "#/components/schemas/User" },
        },
      },
      MediaAsset: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          ownerId: { type: "integer", example: 7 },
          originalName: { type: "string", example: "photo.png" },
          sourceMimeType: { type: "string", example: "image/png" },
          format: { type: "string", example: "webp" },
          width: { type: "integer", example: 1920 },
          height: { type: "integer", example: 1080 },
          sourceSizeBytes: { type: "integer", example: 453123 },
          webpSizeBytes: { type: "integer", example: 421000 },
          thumbnailSizeBytes: { type: "integer", example: 24300 },
          webpUrl: { type: "string", example: "/media/uploads/17111111-abc.webp" },
          thumbnailUrl: { type: "string", example: "/media/thumbnails/17111111-abc-thumb.webp" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SuccessCategoryList: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
        },
      },
      SuccessGigList: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Gig" },
          },
        },
      },
      SuccessOrderList: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Order" },
          },
        },
      },
      SuccessReviewList: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Review" },
          },
        },
      },
      SuccessMessage: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              message: { type: "string", example: "Deleted successfully" },
            },
          },
        },
      },
      AdminSummary: {
        type: "object",
        properties: {
          users: { type: "integer", example: 12 },
          gigs: { type: "integer", example: 24 },
          orders: { type: "integer", example: 18 },
          reviews: { type: "integer", example: 10 },
          categories: { type: "integer", example: 6 },
        },
      },
      AdminCategory: {
        allOf: [
          { $ref: "#/components/schemas/Category" },
          {
            type: "object",
            properties: {
              _count: {
                type: "object",
                properties: {
                  gigs: { type: "integer", example: 4 },
                },
              },
            },
          },
        ],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        security: [],
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    status: "ok",
                    timestamp: "2026-04-08T12:34:56.000Z",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/public/landing/summary": {
      get: {
        tags: ["Public"],
        summary: "Landing page summary",
        description: "Public landing summary without JWT or x-api-key",
        security: [],
        responses: {
          200: {
            description: "Landing summary",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    freelancersCount: 12,
                    completedOrders: 54,
                    averageRating: 4.6,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user and return JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "firstname",
                  "lastname",
                  "birthday",
                  "telephoneNumber",
                  "email",
                  "password",
                  "skills",
                ],
                properties: {
                  firstname: { type: "string", example: "New" },
                  lastname: { type: "string", example: "User" },
                  birthday: { type: "string", format: "date-time", example: "1998-01-15T00:00:00.000Z" },
                  telephoneNumber: { type: "string", example: "0890000000" },
                  email: { type: "string", example: "newuser@example.com" },
                  password: { type: "string", minLength: 6, example: "Password123!" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Design", "Figma", "UI/UX"],
                  },
                  role: { type: "string", enum: ["CLIENT", "FREELANCER"], default: "CLIENT" },
                  bio: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Registered successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    user: {
                      id: 9,
                      firstname: "New",
                      lastname: "User",
                      birthday: "1998-01-15T00:00:00.000Z",
                      telephoneNumber: "0890000000",
                      email: "newuser@example.com",
                      skills: ["Design", "Figma", "UI/UX"],
                      displayName: "New User",
                      role: "CLIENT",
                    },
                    auth: {
                      tokenType: "Bearer",
                      accessToken: "<jwt-token>",
                      expiresIn: jwtExpiresIn,
                    },
                  },
                },
              },
            },
          },
          409: {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and return JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "client1@internal.local" },
                  password: { type: "string", example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logged in successfully",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    user: {
                      id: 4,
                      firstname: "Acme",
                      lastname: "Team",
                      birthday: "1992-11-12T00:00:00.000Z",
                      telephoneNumber: "0833333333",
                      email: "client1@internal.local",
                      skills: ["Product", "Planning"],
                      displayName: "Client One",
                      role: "CLIENT",
                    },
                    auth: {
                      tokenType: "Bearer",
                      accessToken: "<jwt-token>",
                      expiresIn: jwtExpiresIn,
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current token context",
        security: jwtSecurity,
        responses: {
          200: {
            description: "Logout success",
          },
          401: {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: jwtSecurity,
        responses: {
          200: {
            description: "Current user",
          },
          401: {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/profile": {
      get: {
        tags: ["Profile"],
        summary: "Get my profile",
        security: jwtSecurity,
        responses: {
          200: {
            description: "Profile detail",
          },
        },
      },
      patch: {
        tags: ["Profile"],
        summary: "Update profile fields",
        security: jwtSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstname: { type: "string" },
                  lastname: { type: "string" },
                  birthday: { type: "string", format: "date-time" },
                  telephoneNumber: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                  bio: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated",
          },
        },
      },
    },
    "/profile/image": {
      post: {
        tags: ["Profile"],
        summary: "Upload profile image",
        security: jwtSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile image uploaded",
          },
          400: {
            description: "Invalid file",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Profile"],
        summary: "Delete profile image",
        security: jwtSecurity,
        responses: {
          200: {
            description: "Profile image deleted",
          },
        },
      },
    },
    "/media-assets": {
      get: {
        tags: ["Media"],
        summary: "List my media assets",
        security: jwtSecurity,
        responses: {
          200: {
            description: "My media assets",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/MediaAsset" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/media-assets/upload": {
      post: {
        tags: ["Media"],
        summary: "Upload image media and auto convert to webp + thumbnail",
        security: jwtSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Image file (jpeg/png/webp/gif/tiff)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Uploaded and processed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/MediaAsset" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid file",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          413: {
            description: "Uploaded file is too large",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/media-assets/{id}": {
      get: {
        tags: ["Media"],
        summary: "Get media asset by id",
        security: jwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Media asset detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/MediaAsset" },
                  },
                },
              },
            },
          },
          404: {
            description: "Media asset not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Media"],
        summary: "Delete media asset",
        security: jwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    message: "Media asset deleted",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        security: protectedSecurity,
        responses: {
          200: {
            description: "Category list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessCategoryList" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        security: protectedSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Video Editing" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Category created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/gigs": {
      get: {
        tags: ["Gigs"],
        summary: "List gigs",
        security: protectedSecurity,
        parameters: [
          { in: "query", name: "q", schema: { type: "string" }, description: "Search by title keyword" },
          { in: "query", name: "categoryId", schema: { type: "integer" } },
          { in: "query", name: "isActive", schema: { type: "boolean" } },
        ],
        responses: {
          200: {
            description: "Gig list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessGigList" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Gigs"],
        summary: "Create gig (owner from JWT)",
        security: protectedWithJwtSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "price", "categoryId"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "integer", minimum: 1 },
                  categoryId: { type: "integer", minimum: 1 },
                  isActive: { type: "boolean", default: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Gig created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Gig" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/gigs/{id}": {
      get: {
        tags: ["Gigs"],
        summary: "Get gig by id",
        security: protectedSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Gig detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Gig" },
                  },
                },
              },
            },
          },
          404: {
            description: "Gig not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Gigs"],
        summary: "Update gig (owner only)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "integer", minimum: 1 },
                  categoryId: { type: "integer", minimum: 1 },
                  isActive: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Gig updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Gig" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Gigs"],
        summary: "Delete gig (owner only)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Gig deleted",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: { message: "Gig deleted successfully" },
                },
              },
            },
          },
        },
      },
    },
    "/gigs/{id}/media": {
      get: {
        tags: ["Gigs"],
        summary: "List gig media assets",
        security: protectedSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Gig media list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/MediaAsset" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/gigs/{id}/media/upload": {
      post: {
        tags: ["Gigs"],
        summary: "Upload media for gig (owner only)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Image file (jpeg/png/webp/gif/tiff)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Uploaded and linked to gig",
          },
          413: {
            description: "Uploaded file is too large",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/gigs/{id}/media/{mediaId}": {
      delete: {
        tags: ["Gigs"],
        summary: "Delete gig media (owner only)",
        security: protectedWithJwtSecurity,
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } },
          { in: "path", name: "mediaId", required: true, schema: { type: "integer", minimum: 1 } },
        ],
        responses: {
          200: {
            description: "Gig media deleted",
          },
        },
      },
    },
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "List orders",
        security: protectedSecurity,
        parameters: [
          { in: "query", name: "clientId", schema: { type: "integer" } },
          { in: "query", name: "sellerId", schema: { type: "integer" } },
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
          },
        ],
        responses: {
          200: {
            description: "Order list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessOrderList" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Create order from gig",
        security: protectedSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["gigId", "clientId"],
                properties: {
                  gigId: { type: "integer", minimum: 1 },
                  clientId: { type: "integer", minimum: 1 },
                  message: { type: "string" },
                  agreedPrice: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Order created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by id",
        security: protectedSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Order detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status",
        security: protectedSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Order updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List reviews",
        security: protectedSecurity,
        responses: {
          200: {
            description: "Review list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessReviewList" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Reviews"],
        summary: "Create review",
        security: protectedSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "authorId", "targetUserId", "rating"],
                properties: {
                  orderId: { type: "integer", minimum: 1 },
                  authorId: { type: "integer", minimum: 1 },
                  targetUserId: { type: "integer", minimum: 1 },
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Review created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Review" },
                  },
                },
              },
            },
          },
          409: {
            description: "Only one review per order",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/reviews/{id}": {
      get: {
        tags: ["Reviews"],
        summary: "Get review by id",
        security: protectedSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Review detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Review" },
                  },
                },
              },
            },
          },
          404: {
            description: "Review not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/admin/summary": {
      get: {
        tags: ["Admin"],
        summary: "Get admin dashboard summary",
        security: protectedWithJwtSecurity,
        responses: {
          200: {
            description: "Admin summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/AdminSummary" },
                  },
                },
              },
            },
          },
          403: {
            description: "Admin access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List users (admin)",
        security: protectedWithJwtSecurity,
        parameters: [
          { in: "query", name: "q", schema: { type: "string" }, description: "Search by email/name" },
          { in: "query", name: "role", schema: { type: "string", enum: ["CLIENT", "FREELANCER", "ADMIN"] } },
        ],
        responses: {
          200: {
            description: "User list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/users/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get user by id (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "User detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Update user fields (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstname: { type: "string" },
                  lastname: { type: "string" },
                  birthday: { type: "string", format: "date-time" },
                  telephoneNumber: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                  bio: { type: "string" },
                  role: { type: "string", enum: ["CLIENT", "FREELANCER", "ADMIN"] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete user (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "User deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessMessage" },
              },
            },
          },
          409: {
            description: "Conflict (e.g. deleting last admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/admin/categories": {
      get: {
        tags: ["Admin"],
        summary: "List categories (admin)",
        security: protectedWithJwtSecurity,
        responses: {
          200: {
            description: "Category list with counts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AdminCategory" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Create category (admin)",
        security: protectedWithJwtSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Data Science" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Category created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/categories/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Update category (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Category updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete category (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Category deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessMessage" },
              },
            },
          },
        },
      },
    },
    "/admin/gigs": {
      get: {
        tags: ["Admin"],
        summary: "List gigs (admin)",
        security: protectedWithJwtSecurity,
        parameters: [
          { in: "query", name: "q", schema: { type: "string" } },
          { in: "query", name: "categoryId", schema: { type: "integer" } },
          { in: "query", name: "isActive", schema: { type: "boolean" } },
        ],
        responses: {
          200: {
            description: "Gig list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessGigList" },
              },
            },
          },
        },
      },
    },
    "/admin/gigs/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get gig by id (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Gig detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Gig" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Update gig fields (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "integer", minimum: 1 },
                  categoryId: { type: "integer", minimum: 1 },
                  ownerId: { type: "integer", minimum: 1 },
                  isActive: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Gig updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Gig" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete gig (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Gig deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessMessage" },
              },
            },
          },
        },
      },
    },
    "/admin/orders": {
      get: {
        tags: ["Admin"],
        summary: "List orders (admin)",
        security: protectedWithJwtSecurity,
        parameters: [
          { in: "query", name: "clientId", schema: { type: "integer" } },
          { in: "query", name: "sellerId", schema: { type: "integer" } },
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
          },
        ],
        responses: {
          200: {
            description: "Order list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessOrderList" },
              },
            },
          },
        },
      },
    },
    "/admin/orders/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get order by id (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Order detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/orders/{id}/status": {
      patch: {
        tags: ["Admin"],
        summary: "Update order status (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Order updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/reviews": {
      get: {
        tags: ["Admin"],
        summary: "List reviews (admin)",
        security: protectedWithJwtSecurity,
        responses: {
          200: {
            description: "Review list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessReviewList" },
              },
            },
          },
        },
      },
    },
    "/admin/reviews/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get review by id (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Review detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Review" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete review (admin)",
        security: protectedWithJwtSecurity,
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Review deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessMessage" },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = {
  openApiSpec,
};
