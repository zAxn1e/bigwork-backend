---
title: โครงสร้างโปรเจกต์ Frontend ที่แนะนำ
---

```text
src/
  app/
    providers.tsx
    router.tsx
  config/
    env.ts
  lib/
    http.ts
  shared/
    types/
    ui/
  features/
    auth/
      api.ts
      hooks.ts
      pages/
    profile/
      api.ts
      pages/
      components/
    media/
      api.ts
      pages/
      components/
    gigs/
      api.ts
      pages/
    orders/
      api.ts
      pages/
```

## แนวทางจัดการงานทีม

- แยกตาม feature เพื่อลดการชนกันเวลา dev
- ให้แต่ละ feature มี api.ts ของตัวเอง
- ใช้ shared types สำหรับ response กลาง

## Naming convention

- Page: PascalCasePage
- Hook: useSomething
- API function: verb + resource เช่น getMyProfile, uploadMediaAsset
