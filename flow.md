# Backend System Flow (Mermaid)

เอกสารนี้สรุป system flow ของ backend แบบแยกเป็นส่วนๆของระบบหลักด้วย marmaid

## 1) Backend Architecture Overview

```mermaid
flowchart TB
  Client[Client / Frontend / Internal Consumer] --> App[Express App]

  subgraph Core["Core Runtime"]
    Server[src/server.js]
    Config[src/config/env.js]
    Prisma[src/lib/prisma.js]
    ErrorMW[errorHandler + notFound]
  end

  Server --> App
  Config --> App
  App --> ErrorMW
  App --> Prisma

  subgraph PublicAndJwt["Public + JWT Systems (no apiKey middleware)"]
    Health["GET /health"]
    Docs["GET /docs + /openapi.json"]
    Public["/public/*"]
    Auth["/auth/*"]
    Profile["/profile/*"]
    MediaAssets["/media-assets/*"]
  end

  subgraph ApiKeyProtected["Business Systems (after apiKeyAuth)"]
    Categories["/categories/*"]
    Gigs["/gigs/*"]
    Orders["/orders/*"]
    Reviews["/reviews/*"]
    Admin["/admin/*"]
  end

  App --> Health
  App --> Docs
  App --> Public
  App --> Auth
  App --> Profile
  App --> MediaAssets
  App --> ApiKeyAuth[apiKeyAuth middleware]
  ApiKeyAuth --> Categories
  ApiKeyAuth --> Gigs
  ApiKeyAuth --> Orders
  ApiKeyAuth --> Reviews
  ApiKeyAuth --> Admin

  subgraph Storage["Storage"]
    DB[(PostgreSQL via Prisma)]
    MediaFS["media folder: profiles, uploads, thumbnails"]
  end

  Auth --> DB
  Profile --> DB
  Profile --> MediaFS
  MediaAssets --> DB
  MediaAssets --> MediaFS
  Categories --> DB
  Gigs --> DB
  Orders --> DB
  Reviews --> DB
  Admin --> DB
```

## 2) Request Pipeline (App-Level)

```mermaid
flowchart LR
  Req[Incoming Request] --> CORS[CORS + express.json]
  CORS --> StaticMedia["/media static"]
  CORS --> OpenAPI["/openapi.json resolver"]
  CORS --> Swagger["/docs swagger-ui"]
  CORS --> Health["/health"]
  CORS --> Public["/public"]
  CORS --> Auth["/auth"]
  CORS --> Profile["/profile (requireJwtAuth)"]
  CORS --> MediaAssets["/media-assets (requireJwtAuth)"]
  CORS --> ApiKeyAuth[apiKeyAuth]

  ApiKeyAuth --> Categories["/categories"]
  ApiKeyAuth --> Gigs["/gigs"]
  ApiKeyAuth --> Orders["/orders"]
  ApiKeyAuth --> Reviews["/reviews"]
  ApiKeyAuth --> Admin["/admin (requireJwtAuth + requireAdmin)"]

  Categories --> NotFound[notFound]
  Gigs --> NotFound
  Orders --> NotFound
  Reviews --> NotFound
  Admin --> NotFound
  Public --> NotFound
  Auth --> NotFound
  Profile --> NotFound
  MediaAssets --> NotFound
  NotFound --> ErrorHandler[errorHandler]
```

## 3) Data Model (Prisma ERD)

```mermaid
erDiagram
  USER ||--o{ GIG : owns
  USER ||--o{ MEDIA_ASSET : uploads
  USER ||--o{ ORDER : places_as_client
  USER ||--o{ ORDER : fulfills_as_seller
  USER ||--o{ REVIEW : writes
  USER ||--o{ REVIEW : receives
  CATEGORY ||--o{ GIG : classifies
  GIG ||--o{ ORDER : ordered_in
  GIG ||--o{ REVIEW : reviewed_in
  GIG ||--o{ GIG_MEDIA : links
  MEDIA_ASSET ||--o{ GIG_MEDIA : linked_as
  ORDER ||--o| REVIEW : has_one

  USER {
    int id PK
    string email UK
    string passwordHash
    string displayName
    string firstName
    string lastName
    datetime birthday
    string telephoneNumber
    string skills
    enum role
    string bio
    string profileImageUrl
    datetime createdAt
    datetime updatedAt
  }

  CATEGORY {
    int id PK
    string name UK
    datetime createdAt
  }

  GIG {
    int id PK
    string title
    string description
    int price
    boolean isActive
    int ownerId FK
    int categoryId FK
    datetime createdAt
    datetime updatedAt
  }

  MEDIA_ASSET {
    int id PK
    int ownerId FK
    string originalName
    string sourceMimeType
    string format
    int width
    int height
    int sourceSizeBytes
    int webpSizeBytes
    int thumbnailSizeBytes
    string webpUrl
    string thumbnailUrl
    datetime createdAt
    datetime updatedAt
  }

  GIG_MEDIA {
    int id PK
    int gigId FK
    int mediaAssetId FK
    int sortOrder
    datetime createdAt
    datetime updatedAt
  }

  ORDER {
    int id PK
    string message
    int agreedPrice
    enum status
    int gigId FK
    int clientId FK
    int sellerId FK
    datetime createdAt
    datetime updatedAt
  }

  REVIEW {
    int id PK
    int rating
    string comment
    int orderId FK
    int gigId FK
    int authorId FK
    int targetUserId FK
    datetime createdAt
  }
```

## 4) Auth + Profile Flow

```mermaid
flowchart TB
  subgraph AuthSystem["Auth System (/auth)"]
    Reg[POST /auth/register] --> ValidateReg[validate email/password/name/birthday/tel/skills/role]
    ValidateReg --> CreateUser[auth.service.register + bcrypt hash]
    CreateUser --> Token1[sign JWT]
    Token1 --> RegResp[user + auth token]

    Login[POST /auth/login] --> ValidateLogin[validate email/password]
    ValidateLogin --> CheckPwd[auth.service.login + bcrypt compare]
    CheckPwd --> Token2[sign JWT]
    Token2 --> LoginResp[user + auth token]

    Me[GET /auth/me] --> JwtMW1[requireJwtAuth]
    JwtMW1 --> FindMe[auth.service.getMe]
    FindMe --> MeResp[sanitized user]

    Logout[POST /auth/logout] --> JwtMW2[requireJwtAuth]
    JwtMW2 --> LogoutResp[success message]
  end

  subgraph ProfileSystem["Profile System (/profile)"]
    GetP[GET /profile] --> JwtP1[requireJwtAuth] --> GetProfile[profile.service.getProfile] --> GetPResp[user]

    PatchP[PATCH /profile] --> JwtP2[requireJwtAuth]
    JwtP2 --> ValidateP[at least one field + validators]
    ValidateP --> UpdateP[profile.service.updateProfile]
    UpdateP --> PatchResp[user]

    UploadImg[POST /profile/image] --> JwtP3[requireJwtAuth]
    JwtP3 --> MulterProfile[uploadProfileImage diskStorage]
    MulterProfile --> UpdateImg[profile.service.updateProfileImage]
    UpdateImg --> UploadResp[user + uploadedFile]

    DelImg[DELETE /profile/image] --> JwtP4[requireJwtAuth]
    JwtP4 --> RemoveImg[profile.service.removeProfileImage]
    RemoveImg --> DelResp[user + message]
  end
```

## 5) Media Assets + Gig Media Flow

```mermaid
flowchart TB
  subgraph MediaAssetSystem["Media Assets (/media-assets)"]
    Upload[POST /media-assets/upload] --> JwtM1[requireJwtAuth]
    JwtM1 --> MulterMem[uploadMediaAsset memoryStorage]
    MulterMem --> Process[sharp: rotate + convert webp + thumbnail]
    Process --> SaveFiles[write uploads/ + thumbnails/]
    SaveFiles --> SaveDB[create mediaAsset record]
    SaveDB --> Cleanup1[cleanupOrphanMediaFiles]
    Cleanup1 --> UploadDone[201 mediaAsset]

    List[GET /media-assets] --> JwtM2[requireJwtAuth] --> ListDB[listMyMediaAssets] --> ListResp["data list"]
    GetOne[GET /media-assets/:id] --> JwtM3[requireJwtAuth] --> GetDB[getMyMediaAssetById] --> GetResp[data]
    Delete[DELETE /media-assets/:id] --> JwtM4[requireJwtAuth] --> DelFiles[unlink webp+thumb] --> DelDB[delete row] --> Cleanup2[cleanupOrphanMediaFiles] --> DelResp[message]
  end

  subgraph GigMediaSystem["Gig Media (/gigs/:id/media/*)"]
    UpGigMedia[POST /gigs/:id/media/upload] --> JwtG1[requireJwtAuth]
    JwtG1 --> OwnerCheck1[gig.ownerId == req.auth.userId]
    OwnerCheck1 --> CreateAsset[mediaAssetService.createMediaAsset]
    CreateAsset --> LinkGig[create gigMedia + sortOrder]
    LinkGig --> UpGigDone[201 mediaAsset]

    DelGigMedia[DELETE /gigs/:id/media/:mediaId] --> JwtG2[requireJwtAuth]
    JwtG2 --> OwnerCheck2[owner check]
    OwnerCheck2 --> DelLink[delete gigMedia link]
    DelLink --> DelAsset[mediaAssetService.deleteMyMediaAsset]
    DelAsset --> DelGigDone[message]
  end
```

## 6) Marketplace Business Flow (Categories, Gigs, Orders, Reviews)

```mermaid
flowchart TB
  subgraph Marketplace["Business Systems (apiKey protected)"]
    Categories["/categories"]
    Gigs["/gigs"]
    Orders["/orders"]
    Reviews["/reviews"]
  end

  Categories --> CatList[GET listCategories]
  Categories --> CatCreate[POST createCategory]

  Gigs --> GigList[GET list with q/categoryId/isActive]
  Gigs --> GigGet[GET by id + owner/category/mediaLinks]
  Gigs --> GigCreate["POST create (JWT)"]
  Gigs --> GigUpdate["PUT update (JWT + owner)"]
  Gigs --> GigDelete["DELETE (JWT + owner)"]
  Gigs --> GigMediaList[GET /:id/media]

  Orders --> OrderList[GET list with clientId/sellerId/status]
  Orders --> OrderGet[GET by id]
  Orders --> OrderCreate["POST create -> resolve sellerId from gig.ownerId"]
  Orders --> OrderStatus[PATCH /:id/status]

  Reviews --> RevList[GET list]
  Reviews --> RevGet[GET by id]
  Reviews --> RevCreate["POST create -> 1 review per order + rating 1..5"]

  OrderCreate --> DB1[(Order table)]
  RevCreate --> DB2[(Review table)]
  GigDelete --> Cascade1[delete gig + linked media cleanup path]
```

## 7) Admin Flow

```mermaid
flowchart TB
  subgraph AdminSystem["Admin System (/admin, after apiKeyAuth)"]
    JWT[requireJwtAuth] --> RoleCheck[requireAdmin]
    RoleCheck --> Summary[GET /summary]
    RoleCheck --> Users[Users CRUD]
    RoleCheck --> AdminCats[Categories CRUD]
    RoleCheck --> AdminGigs[Gigs read/update/delete]
    RoleCheck --> AdminOrders[Orders read + status update]
    RoleCheck --> AdminReviews[Reviews read/delete]
  end

  Users --> Rule1[cannot change own role]
  Users --> Rule2[cannot delete self]
  Users --> Rule3[cannot delete last ADMIN]

  AdminCats --> Rule4[cannot delete category with gigs]
  AdminOrders --> Rule5[status only PENDING/IN_PROGRESS/COMPLETED/CANCELLED]
```

## 8) Infra / Docs / Seed Flow

```mermaid
flowchart LR
  subgraph InfraAndDocs["Infra / Docs / Seed System"]
    Env[.env -> config/env.js]
    OpenAPI["/openapi.json dynamic servers"]
    Swagger["/docs swagger-ui"]
    Seed[prisma/seed.js]
  end

  Env --> OpenAPI
  Env --> Swagger
  Seed --> DB[(PostgreSQL)]
  Seed --> UsersSeed[create ADMIN/FREELANCER/CLIENT]
  Seed --> DomainSeed[create categories/gigs/orders/reviews]
```

