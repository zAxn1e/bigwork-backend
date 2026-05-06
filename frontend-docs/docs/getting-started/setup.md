---
title: Setup และ Bootstrapping
---

## สิ่งที่ต้องมี

- Node.js >= 18
- npm
- backend ที่เข้าถึงได้จาก frontend (local หรือ deploy domain ก็ได้)

## เตรียม backend (แนะนำสำหรับรับงานต่อในทีม)

รันในโปรเจกต์ `bigwork-backend`:

```bash
npm install
copy .env.example .env
docker compose up -d
npm run prisma:push
npm run db:seed
npm run dev
```

เช็กว่า backend พร้อมก่อนเริ่ม frontend:

- `http://localhost:3000/health`
- `http://localhost:3000/docs`

## สร้างโปรเจกต์ frontend (ตัวอย่าง Vite + React)

```bash
npm create vite@latest bigwork-frontend -- --template react
cd bigwork-frontend
npm install
```

## แพ็กเกจที่แนะนำ

```bash
npm install axios @tanstack/react-query react-router-dom zod
```

## สร้างไฟล์ env

ไฟล์ .env.local

```env
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_API_KEY=true
VITE_INTERNAL_API_KEY=change-this
```

สำหรับ local dev ให้ใช้ตัวอย่างนี้แทน:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Run

```bash
npm run dev
```

## ข้อควรรู้

- ถ้า backend เปิด API_KEY_REQUIRED=true ต้องส่ง x-api-key ใน business endpoints (รวม `/admin/*`)
- auth เป็น JWT-based ต้องส่ง Authorization: Bearer ใน request ที่ต้อง login
