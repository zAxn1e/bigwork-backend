---
sidebar_position: 2
---

# UI Blueprint

หน้านี้เป็นแบบร่างโครง UI สำหรับทำระบบฝั่ง frontend ให้ต่อกับ backend นี้ได้เร็ว และไม่หลุด flow หลักของระบบ

## Global Layout

- Public layout
- App layout (หลัง login)
- Shared components: Header, Footer, Toast, Modal, EmptyState, Loading

## Route Map

- `/` Home / Landing
- `/login` Login
- `/register` Register
- `/dashboard` Dashboard
- `/profile` Profile
- `/gigs` Gig list
- `/gigs/:id` Gig detail
- `/orders` Order list
- `/orders/:id` Order detail

## Page Blueprint

### 1) Home / Landing

- Hero + CTA
- Categories preview
- Featured gigs
- CTA login/register

### 2) Login/Register

- Form validation (required, email format, password length)
- Error summary area
- Success redirect to `/dashboard`

### 3) Dashboard

- User summary card
- Recent orders
- Shortcuts: create order, edit profile, upload media

### 4) Profile

- Profile fields + profile image upload
- Save action + inline validation
- Avatar preview ก่อนกดบันทึก

### 5) Gig List + Detail

- Search/filter/sort bar
- Card list with pagination
- Detail page: title, description, category, price, ratings

### 6) Order List + Detail

- Tabs by status: pending / in_progress / done / canceled
- Detail timeline + review action

## Component Blueprint

- `AuthForm`
- `ProfileCard`
- `GigCard`
- `GigFilterBar`
- `OrderStatusBadge`
- `MediaUploader`
- `ApiErrorBanner`
- `ConfirmDialog`

## State Blueprint

- Auth state: currentUser, isAuthenticated, loading
- Entities: categories, gigs, orders, reviews, mediaAssets
- UI state: modal, toast, pending actions

## Request/Response Contract Notes

- ทุก request ที่เป็น business endpoint ต้องมี `x-api-key` (ถ้าเปิด `API_KEY_REQUIRED=true`) รวม `/admin/*`
- ใช้ `Authorization: Bearer <token>` ใน request ที่ต้อง login (auth/profile/media/gig manage)
- จัดการ 401 และ 403 ที่ชั้น http client กลาง

## UX and Accessibility Checklist

- Keyboard navigation ครบ (Tab, Enter, Escape)
- Form labels ผูกกับ input ชัดเจน
- Error text อ่านง่ายและบอกวิธีแก้
- มี loading/skeleton สำหรับ request ที่นาน
- รองรับมือถืออย่างน้อย 360px

## Suggested Delivery Order

1. Auth pages + JWT integration
2. Profile page + profile image upload
3. Gig list/detail
4. Order list/detail
5. Media management and polishing
