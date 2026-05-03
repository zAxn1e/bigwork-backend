# BigWork Internal API

โปรเจกต์นี้เป็น backend API แบบ Internal-use สาหรับระบบ freelance marketplace ของ BigWork เพื่อใช้ใน Project Demo ของงานกลุ่ม

## 1) ภาพรวมโปรเจกต์

ระบบนี้มี API สาหรับจัดการข้อมูลหลักดังนี้
- categories
- gigs
- orders
- reviews
- auth (register/login/logout/JWT)
- profile (อ่าน/แก้ไขโปรไฟล์)
- profile image upload (media เก็บใน backend)
- media assets ทั่วไป (upload/list/get/delete)

โค้ดถูกออกแบบให้ทีมอ่านง่ายและขยายต่อได้ โดยทุก business endpoint จะถูกป้องกันด้วย API key ผ่าน header x-api-key

## 2) Tech Stack

- Node.js (JavaScript, CommonJS)
- Express
- Prisma ORM
- PostgreSQL
- dotenv
- bcrypt (ใช้ใน seed ของ sample users)
- module-alias (ใช้ path แบบ @/...)
- Swagger UI (เอกสาร API แบบ interactive)
- jsonwebtoken (JWT auth)
- multer (upload รูป profile)

## 3) โครงสร้างโฟลเดอร์

```text
prisma/
  schema.prisma
  seed.js
src/
  app.js
  server.js
  config/
    env.js
  controllers/
    auth.controller.js
    category.controller.js
    gig.controller.js
    order.controller.js
    profile.controller.js
    review.controller.js
    mediaAsset.controller.js
  lib/
    prisma.js
  middlewares/
    apiKeyAuth.js
    errorHandler.js
    notFound.js
    requireJwtAuth.js
    uploadMediaAsset.js
    uploadProfileImage.js
  routes/
      media.routes.js
    auth.routes.js
    category.routes.js
    gig.routes.js
    order.routes.js
    profile.routes.js
    review.routes.js
  services/
      mediaAsset.service.js
    auth.service.js
    category.service.js
    gig.service.js
    order.service.js
    profile.service.js
    review.service.js
  utils/
    asyncHandler.js
    http.js
    sanitizeUser.js
    validation.js
docs/
  API.md
  FRONTEND_GUIDE.md
```

## 4) ขั้นตอนติดตั้ง

1. clone โปรเจกต์และเข้าโฟลเดอร์
2. ติดตั้ง dependencies

```bash
npm install
```

3. สร้างไฟล์ environment

```bash
copy .env.example .env
```

4. แก้ค่าใน .env ให้ตรงกับ PostgreSQL ในเครื่อง

## PostgreSQL ด้วย Docker (ไม่รัน backend ใน container)

โปรเจกต์นี้มี `docker-compose.yml` สำหรับ PostgreSQL เท่านั้น โดย backend ยังรันบนเครื่องตามปกติ (`npm run dev` หรือ `npm start`)

1. start PostgreSQL

```bash
docker compose up -d
```

2. ตรวจสอบสถานะ

```bash
docker compose ps
```

3. stop PostgreSQL

```bash
docker compose down
```

ถ้าต้องการลบข้อมูลฐานข้อมูลทั้งหมด (volume)

```bash
docker compose down -v
```

ค่า default ของ DB ใน compose:
- user: `postgres`
- password: `postgres`
- db: `bigwork_mini`
- port: `5432`

ดังนั้น `DATABASE_URL` ใน `.env` ใช้ค่า default นี้ได้ทันที:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bigwork_mini?schema=public"
```

## 5) Environment Variables

อ้างอิงจากไฟล์ .env.example

- DATABASE_URL: Prisma PostgreSQL connection string
- PORT: พอร์ตของ API server (ค่าเริ่มต้น 3000)
- OPENAPI_SERVER_URL: base URL เดี่ยว fallback สำหรับ OpenAPI/Swagger (เช่น `https://api.example.com`)
- OPENAPI_SERVER_URLS: รายการ base URL หลายตัว (คั่นด้วย comma) สำหรับแสดงใน Swagger servers dropdown (เช่น `https://api.example.com,https://staging-api.example.com`)
- INTERNAL_API_KEY: API key ที่บังคับใช้กับทุก endpoint ยกเว้น /health
- API_KEY_REQUIRED: เปิด/ปิดการบังคับ x-api-key (`true` หรือ `false`)
- JWT_SECRET: secret สำหรับ sign JWT token
- JWT_EXPIRES_IN: อายุ token (เช่น 7d, 12h)
- MEDIA_BASE_DIR: โฟลเดอร์เก็บไฟล์ media ใน backend
- MAX_UPLOAD_FILE_SIZE_MB: ขนาดไฟล์อัปโหลดสูงสุด (MB)
- WEBP_QUALITY: คุณภาพไฟล์ webp (ค่าเริ่มต้น 95)
- THUMBNAIL_WIDTH: ความกว้าง thumbnail (ค่าเริ่มต้น 320)

## 6) Prisma Commands

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:push
npm run prisma:studio
```

## 7) การรันเซิร์ฟเวอร์

```bash
npm run dev
# หรือ
npm start
```

ค่าเริ่มต้นเซิร์ฟเวอร์จะรันที่ http://localhost:3000

## Quick Start สำหรับส่งให้เพื่อนในทีม (Backend พร้อมรัน)

ใช้ชุดคำสั่งนี้เพื่อให้เพื่อน clone แล้วรัน backend ได้ทันทีในเครื่อง local

```bash
npm install
copy .env.example .env
docker compose up -d
npm run prisma:push
npm run db:seed
npm run dev
```

สิ่งที่เพื่อนต้องเปิดเช็กหลังรัน:

- Health: http://localhost:3000/health
- Swagger: http://localhost:3000/docs
- OpenAPI: http://localhost:3000/openapi.json

บัญชีทดสอบจาก seed:

- admin: `admin@internal.local` / `Password123!`
- freelancer: `freelancer1@internal.local` / `Password123!`
- client: `client1@internal.local` / `Password123!`

Swagger docs
- UI: http://localhost:3000/docs
- OpenAPI JSON: http://localhost:3000/openapi.json
- ถ้าไม่ตั้ง `OPENAPI_SERVER_URL/OPENAPI_SERVER_URLS` ระบบจะพยายาม auto-detect จาก `x-forwarded-proto` และ `x-forwarded-host` (เหมาะกับ nginx reverse proxy)
- ถ้า deploy แล้วต้องการ fix ค่าเอง ให้ตั้ง `OPENAPI_SERVER_URLS` (หรืออย่างน้อย `OPENAPI_SERVER_URL`) ใน `.env`
- ถ้ามี `x-forwarded-host` จาก reverse proxy ระบบจะใช้ค่านี้เป็นลำดับแรกเพื่อหลีกเลี่ยงการโชว์ localhost ภายใน
- แนะนำให้ตั้ง header ใน nginx:
  - `proxy_set_header X-Forwarded-Host $host;`
  - `proxy_set_header X-Forwarded-Proto $scheme;`

เอกสารเพิ่มเติม
- API summary: docs/API.md
- Frontend integration guide (ละเอียด): docs/FRONTEND_GUIDE.md
- Team handoff (backend runbook): docs/TEAMMATE_BACKEND_INSTRUCTIONS.md

## 8) การ seed ข้อมูล

หลังจาก migrate หรือ push schema แล้ว ให้รัน

```bash
npm run db:seed
```

ข้อมูลตัวอย่างที่ถูกสร้าง
- 1 admin
- 2 freelancers
- 2 clients
- 5 categories
- หลายรายการ gigs
- หลายรายการ orders
- 2 reviews

## 9) JWT Auth และ Profile

Auth endpoints
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/me
- หมายเหตุ: `/auth/register` รับ `firstname`, `lastname`, `birthday`, `telephoneNumber`, `email`, `password`, `skills[]`
- role ที่เปิดให้สมัครได้: `CLIENT`, `FREELANCER`

Profile endpoints (ต้องแนบ JWT ก่อน)
- GET /profile
- PATCH /profile
- POST /profile/image (multipart/form-data field: image)
- DELETE /profile/image

Media assets endpoints (ต้องแนบ JWT ก่อน)
- POST /media-assets/upload (multipart field: file)
- GET /media-assets
- GET /media-assets/:id
- DELETE /media-assets/:id

Media processing ที่ระบบทาอัตโนมัติ
- แปลงไฟล์ภาพที่อัปโหลดเป็น webp
- สร้าง thumbnail webp
- เก็บ metadata ในฐานข้อมูล (width/height/size/mimeType)
- cleanup orphan files อัตโนมัติหลัง upload/delete

Media static URL
- GET /media/profiles/<filename>

หลัง login/register สำเร็จ จะได้ JWT (`accessToken`) จากเซิร์ฟเวอร์

Gig media endpoints
- GET /gigs/:id/media
- POST /gigs/:id/media/upload (multipart field: file, owner only)
- DELETE /gigs/:id/media/:mediaId (owner only)

Admin endpoints (ต้องเป็นผู้ใช้ role `ADMIN` และแนบ JWT)
- GET /admin/summary
- Users: GET `/admin/users`, GET `/admin/users/:id`, PATCH `/admin/users/:id`, DELETE `/admin/users/:id`
- Categories: GET/POST/PATCH/DELETE `/admin/categories...`
- Gigs: GET/PATCH/DELETE `/admin/gigs...`
- Orders: GET `/admin/orders`, GET `/admin/orders/:id`, PATCH `/admin/orders/:id/status`
- Reviews: GET `/admin/reviews`, GET `/admin/reviews/:id`, DELETE `/admin/reviews/:id`

## 10) วิธีเรียก Protected Internal API (x-api-key)

- Public/JWT endpoints: GET /health, กลุ่ม /auth, /profile, /media-assets
- Business endpoints ที่ต้องส่ง `x-api-key` เมื่อ `API_KEY_REQUIRED=true`: /categories, /gigs, /orders, /reviews

```http
x-api-key: <INTERNAL_API_KEY>
```

ถ้าไม่ส่งหรือส่ง key ไม่ถูกต้อง ระบบจะตอบ 401 Unauthorized

หมายเหตุการเปิด/ปิดการบังคับ API key
- ถ้า `API_KEY_REQUIRED=true` ระบบจะบังคับ `x-api-key` ตามปกติ
- ถ้า `API_KEY_REQUIRED=false` จะไม่บังคับ `x-api-key` (เหมาะกับ local dev/demo)

## 11) ตัวอย่าง curl

Health check (public)

```bash
curl http://localhost:3000/health
```

List gigs (protected)

```bash
curl -H "x-api-key: change-this" \
  "http://localhost:3000/gigs?q=api&isActive=true"
```

Create category

```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "x-api-key: change-this" \
  -d '{"name":"Video Editing"}'
```

Create order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: change-this" \
  -d '{"gigId":1,"clientId":4,"message":"Need this in 3 days"}'
```

Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"New","lastname":"User","birthday":"1998-01-15","telephoneNumber":"0890000000","email":"newuser@example.com","password":"Password123!","skills":["Design","Figma"]}'
```

Login (รับ JWT)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"Password123!"}'
```

Upload profile image

```bash
curl -X POST http://localhost:3000/profile/image \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "image=@./avatar.png"
```

## 12) ข้อจากัด / สิ่งที่ตั้งใจให้เรียบง่าย

- ใช้ JWT auth แบบเรียบง่าย (ยังไม่ใช้ refresh token / OAuth)
- ยังไม่มี pagination
- media เก็บใน local backend (ยังไม่แยก object storage)

## 13) แนวทางพัฒนาต่อ

1. เพิ่ม auth ของผู้ใช้จริง (เช่น JWT หรือ internal SSO)
2. เพิ่ม ownership checks (เช่น เฉพาะ owner แก้ gig ได้)
3. เพิ่ม pagination และ sorting
4. เพิ่ม automated tests (unit + integration)
5. เพิ่ม rate limiting และ request logging

## 14) Frontend Guide (ละเอียด)

ถ้าทีม frontend จะเริ่มเชื่อมระบบ ให้ดูขั้นตอนละเอียดที่

- Docusaurus docs site (ผ่าน backend path): /frontend-guide
- เอกสาร markdown เดิม: docs/FRONTEND_GUIDE.md

หัวข้อที่ครอบคลุมใน guide

- โครงสร้าง frontend ที่แนะนา
- การตั้งค่า env ฝั่ง frontend
- การตั้งค่า HTTP client (credentials/include + x-api-key)
- JWT auth flow (register/login/me/logout)
- profile/media upload flow
- แนวทาง state management, route guard, และ checklist ก่อนส่งงาน

วิธีรัน Docusaurus docs แยกเดี่ยว (กรณีไม่พ่วงกับ backend)

หมายเหตุ: แนะนำ Node.js LTS (18/20/22)

```bash
cd frontend-docs
npm install
npm start
```

ค่าเริ่มต้น: http://localhost:3001
