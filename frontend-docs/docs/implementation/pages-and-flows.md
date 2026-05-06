---
title: หน้า UI ที่ควรทำและลำดับ flow
---

## หน้า UI ขั้นต่ำ

- Login Page
- Register Page
- Profile Page
- Media Library Page
- Gig List / Gig Detail
- Gig Manage Page (create/edit/upload media)
- Order List

## Flow ของผู้ใช้ (ขั้นต่ำ)

1. Register หรือ Login
2. เข้าหน้า Profile เพื่อแก้ข้อมูลพื้นฐาน
3. อัปโหลด profile image
4. ไปหน้า Media Library และอัปโหลดไฟล์ทั่วไป
5. จัดการ gigs และ media ของ gig (สำหรับ owner)
6. เรียกดู gigs และสร้าง order

## UX ที่แนะนำ

- มี loading skeleton สำหรับ list
- มี error banner ที่อ่านง่าย
- มี toast เมื่อ upload/delete สำเร็จ
