---
title: State และ Data Fetching
---

## แนะนำใช้ React Query

Query keys ตัวอย่าง

- ['auth', 'me']
- ['profile']
- ['media', 'list']
- ['media', 'detail', id]
- ['gigs', filters]
- ['orders', filters]

## Invalidation policy

- upload/delete media -> invalidate ['media', 'list']
- update profile -> invalidate ['profile']
- login/logout -> invalidate ['auth', 'me']

## แยก state

- Server state: React Query
- UI state: useState/Zustand

## การกัน stale UI

- ใช้ optimistic update เฉพาะ action ที่มั่นใจ rollback ได้
- ถ้าไม่ชัวร์ ให้ refetch หลัง mutation สำเร็จ
