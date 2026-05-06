---
title: Profile และ Media Integration
---

## Profile endpoints

- GET /profile
- PATCH /profile
- POST /profile/image (field: image)
- DELETE /profile/image

## Media assets endpoints

- POST /media-assets/upload (field: file)
- GET /media-assets
- GET /media-assets/:id
- DELETE /media-assets/:id

## Gig media endpoints

- GET /gigs/:id/media
- POST /gigs/:id/media/upload (field: file, owner only)
- DELETE /gigs/:id/media/:mediaId (owner only)

## การแสดงผลรูป

backend คืน url แบบ relative เช่น /media/uploads/... ให้ต่อกับ base URL

```ts
const absolute = `${import.meta.env.VITE_API_BASE_URL}${relativeUrl}`;
```

## Upload media example

```ts
const form = new FormData();
form.append('file', selectedFile);
await http.post('/media-assets/upload', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

## หมายเหตุสำคัญ

- backend จะแปลงเป็น webp และสร้าง thumbnail อัตโนมัติ
- backend เก็บ metadata ในฐานข้อมูล
- backend cleanup orphan file อัตโนมัติหลัง upload/delete
