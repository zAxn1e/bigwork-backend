---
title: API Key และ Security Integration
---

## x-api-key ใช้เมื่อไร

- ถ้า backend ตั้ง API_KEY_REQUIRED=true -> ต้องส่ง x-api-key ใน business endpoints กลุ่ม `/categories`, `/gigs`, `/orders`, `/reviews`, `/admin`
- endpoint กลุ่ม auth/profile/media-assets ใช้ JWT (Authorization: Bearer) โดยไม่ผ่าน middleware api-key

## แนวปฏิบัติ

- เก็บ key ใน env เท่านั้น
- อย่า hardcode key ใน source code
- แยก env ของ dev/staging/prod

## Header strategy

- ใช้ interceptor กลางระดับ http client
- ไม่กระจายเขียน header ซ้ำในแต่ละหน้า

## ข้อควรระวัง

- ถ้าเปิด API_KEY_REQUIRED ใน backend แต่ไม่ส่ง x-api-key ใน business endpoints (รวม `/admin`) จะเจอ 401
- ถ้าไม่แนบ Authorization Bearer token จะเจอ 401 ใน endpoint ที่ต้อง login
