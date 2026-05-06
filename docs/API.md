# Internal API Documentation

เอกสารฉบับเต็มและอัปเดตล่าสุดให้ใช้งานผ่าน Swagger UI
- UI: /docs
- OpenAPI JSON: /openapi.json

ไฟล์นี้เป็นสรุปการใช้งานแบบย่อ

ถ้าต้องการแนวทางฝั่ง frontend แบบละเอียด ให้ดูที่
- docs/FRONTEND_GUIDE.md

## Base URL

ค่า default สำหรับ local:

```text
http://localhost:3000
```

สำหรับ environment อื่น (staging/prod) ให้ตั้งค่าใน `.env` ดังนี้:

- `OPENAPI_SERVER_URLS` (แนะนำ): ใส่หลาย URL คั่นด้วย comma เพื่อให้ Swagger UI แสดง servers dropdown ตาม environment
- `OPENAPI_SERVER_URL` (fallback): ใช้เมื่อไม่ได้ตั้ง `OPENAPI_SERVER_URLS`

ถ้าไม่ตั้ง 2 ค่านี้ ระบบจะ auto-detect base URL จาก `x-forwarded-proto` และ `x-forwarded-host` ของ reverse proxy
และถ้ามี `x-forwarded-host` ระบบจะใช้ค่านี้ก่อนเพื่อให้ Swagger แสดง public URL แทน localhost ภายใน
แนะนำให้ตั้งใน nginx ด้วย:
- `proxy_set_header X-Forwarded-Host $host;`
- `proxy_set_header X-Forwarded-Proto $scheme;`

## Authentication

- API นี้เป็น Internal API
- endpoint กลุ่ม business (`/categories`, `/gigs`, `/orders`, `/reviews`, `/admin`) ต้องส่ง x-api-key (เมื่อ `API_KEY_REQUIRED=true`)
- รูปแบบ header

```http
x-api-key: <INTERNAL_API_KEY>
```

Public endpoints
- GET /health
- GET /public/landing/summary
- กลุ่ม auth/profile/media-assets ใช้ JWT เป็นหลักและไม่ผ่าน middleware api-key

Protected endpoints
- กลุ่ม `/categories`, `/gigs`, `/orders`, `/reviews`, `/admin` (เมื่อ `API_KEY_REQUIRED=true`)

JWT auth
- Login/Register จะคืน `accessToken`
- Endpoint กลุ่ม auth/profile/media และการแก้ไข gig ต้องส่ง `Authorization: Bearer <token>`
- ถ้า backend เปิด API_KEY_REQUIRED=true ให้ส่ง x-api-key ใน business endpoint

## Response Format

Success

```json
{
  "success": true,
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "..."
}
```

## Endpoints

### Public

#### GET /public/landing/summary

สรุปข้อมูลสาหรับหน้า landing page (ไม่ต้องใช้ JWT หรือ x-api-key)

Example success

```json
{
  "success": true,
  "data": {
    "freelancersCount": 12,
    "completedOrders": 54,
    "averageRating": 4.6
  }
}
```

### Auth / JWT

#### POST /auth/register

สมัครผู้ใช้ใหม่และคืน JWT ทันที
- fields ที่รับ: `firstname`, `lastname`, `birthday`, `telephoneNumber`, `email`, `password`, `skills[]`
- role ที่เปิดให้สมัครได้: `CLIENT`, `FREELANCER`

#### POST /auth/login

เข้าสู่ระบบและคืน JWT

#### POST /auth/logout

ออกจากระบบฝั่ง API (ต้องมี JWT)

#### GET /auth/me

ดึงข้อมูลผู้ใช้จาก JWT ปัจจุบัน

### Profile

#### GET /profile

ดูโปรไฟล์ของผู้ใช้ที่ login อยู่

#### PATCH /profile

แก้ไขข้อมูลโปรไฟล์ (`firstname`, `lastname`, `birthday`, `telephoneNumber`, `skills`, `bio`)

#### POST /profile/image

อัปโหลดรูปโปรไฟล์ด้วย `multipart/form-data`
- field ชื่อ `image`
- รองรับ jpeg/png/webp/gif

#### DELETE /profile/image

ลบรูปโปรไฟล์ปัจจุบัน

Media URL
- ไฟล์ที่อัปโหลดจะเรียกผ่าน `/media/...`

### Media Assets

#### POST /media-assets/upload

อัปโหลดไฟล์ภาพทั่วไป (`multipart/form-data` field: `file`)

ระบบจะทำอัตโนมัติ
- convert เป็น webp (quality สูง, บีบอัดน้อย)
- สร้าง thumbnail webp
- เก็บ metadata (dimension/size/mime)
- เก็บไฟล์ใน backend local storage

#### GET /media-assets

ดึงรายการ media ของผู้ใช้ที่ login อยู่

#### GET /media-assets/:id

ดึงรายละเอียด media รายการเดียว

#### DELETE /media-assets/:id

ลบ media (ทั้งไฟล์จริงและ metadata)

Orphan cleanup
- หลัง upload/delete ระบบจะลบไฟล์ orphan ที่ไม่ถูกอ้างอิงในฐานข้อมูลแบบอัตโนมัติ

Frontend tip
- ใช้ thumbnailUrl สาหรับแสดง list/grid
- ใช้ webpUrl สาหรับ preview หรือรายละเอียดไฟล์

### GET /health

ใช้ตรวจสอบสถานะ service แบบ public

Example success

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-04-08T12:34:56.000Z"
  }
}
```

### Categories

#### GET /categories

ดึงรายการ categories ทั้งหมด

#### POST /categories

สร้าง category ใหม่

Request body

```json
{
  "name": "Web Development"
}
```

### Gigs

#### GET /gigs

ดึงรายการ gigs พร้อม filter แบบง่าย

Query params
- q (title keyword)
- categoryId (number)
- isActive (true หรือ false)
- page (number, optional)
- limit (number, optional)

หมายเหตุ:
- ถ้าไม่ส่ง `page` และ `limit` จะได้ response แบบเดิม (array ของ gigs)
- ถ้าส่งอย่างน้อยหนึ่งตัว จะได้ response แบบ pagination:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### GET /gigs/:id

ดึงข้อมูล gig ตาม id

#### POST /gigs (ต้องมี JWT)

สร้าง gig ใหม่

Request body

```json
{
  "title": "Build Express API",
  "description": "Need CRUD endpoints",
  "price": 9000,
  "categoryId": 1,
  "isActive": true
}
```

#### PUT /gigs/:id (ต้องมี JWT และเป็น owner)

อัปเดต gig (ส่งเฉพาะ field ที่ต้องการเปลี่ยนได้)

Request body example

```json
{
  "price": 10000,
  "isActive": false
}
```

#### DELETE /gigs/:id (ต้องมี JWT และเป็น owner)

ลบ gig ตาม id

#### GET /gigs/:id/media

ดึงรายการ media ของ gig

#### POST /gigs/:id/media/upload (ต้องมี JWT และเป็น owner)

อัปโหลด media (image) เข้า gig ด้วย `multipart/form-data` field `file`

#### DELETE /gigs/:id/media/:mediaId (ต้องมี JWT และเป็น owner)

ลบ media ของ gig

### Orders

#### GET /orders

ดึงรายการ orders

Optional query params
- clientId
- sellerId
- status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)

#### GET /orders/:id

ดึงข้อมูล order ตาม id

#### POST /orders

สร้าง order จาก gig

Request body

```json
{
  "gigId": 1,
  "clientId": 4,
  "message": "Please deliver in 5 days",
  "agreedPrice": 9000
}
```

หมายเหตุ
- sellerId จะถูก resolve อัตโนมัติจาก owner ของ gig
- agreedPrice ถ้าไม่ส่งมา จะใช้ราคา gig เป็นค่าเริ่มต้น

#### PATCH /orders/:id/status

อัปเดตสถานะ order

Request body

```json
{
  "status": "IN_PROGRESS"
}
```

### Reviews

#### GET /reviews

ดึงรายการ reviews

#### GET /reviews/:id

ดึงข้อมูล review ตาม id

#### POST /reviews

สร้าง review ใหม่

Request body

```json
{
  "orderId": 1,
  "authorId": 4,
  "targetUserId": 2,
  "rating": 5,
  "comment": "Great work"
}
```

Business rules
- order ต้องมีอยู่จริง
- 1 order สร้าง review ได้แค่ 1 รายการ
- rating ต้องเป็นจำนวนเต็ม 1-5

### Admin (ต้องมี JWT ของผู้ใช้ role = ADMIN)

ทุก endpoint ในกลุ่มนี้ต้องอยู่ภายใต้เงื่อนไขเดียวกัน:
- ต้องส่ง `Authorization: Bearer <token>`
- ถ้า `API_KEY_REQUIRED=true` ต้องส่ง `x-api-key`

#### GET /admin/summary
- สรุปจำนวน users, gigs, orders, reviews, categories

#### Users
- GET /admin/users
- GET /admin/users/:id
- PATCH /admin/users/:id
- DELETE /admin/users/:id

#### Categories
- GET /admin/categories
- POST /admin/categories
- PATCH /admin/categories/:id
- DELETE /admin/categories/:id

#### Gigs
- GET /admin/gigs
- GET /admin/gigs/:id
- PATCH /admin/gigs/:id
- DELETE /admin/gigs/:id

#### Orders
- GET /admin/orders
- GET /admin/orders/:id
- PATCH /admin/orders/:id/status

#### Reviews
- GET /admin/reviews
- GET /admin/reviews/:id
- DELETE /admin/reviews/:id

Example success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": 1,
    "gigId": 1,
    "authorId": 4,
    "targetUserId": 2,
    "rating": 5,
    "comment": "Great work",
    "createdAt": "2026-04-08T12:34:56.000Z"
  }
}
```

## Common Error Cases

- 400: validation error (bad input)
- 401: missing/invalid x-api-key
- 404: resource not found
- 409: conflict/duplicate resource
- 500: server error
