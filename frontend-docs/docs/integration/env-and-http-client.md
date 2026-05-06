---
title: Env และ HTTP Client
---

## Env mapping

- VITE_API_BASE_URL -> backend base URL
- VITE_ENABLE_API_KEY -> เปิด/ปิดการส่ง x-api-key ใน business endpoints
- VITE_INTERNAL_API_KEY -> ค่า key ที่ต้องส่ง
- VITE_AUTH_TOKEN -> (optional) ค่า token ที่โหลดตอน bootstrap

ตัวอย่าง:

```env
# deploy
VITE_API_BASE_URL=https://api.example.com

# local dev
# VITE_API_BASE_URL=http://localhost:3000
```

## ตัวอย่าง http client (axios)

```ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_API_KEY = String(import.meta.env.VITE_ENABLE_API_KEY) === 'true';
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY;
const API_KEY_PATH_PREFIXES = ['/categories', '/gigs', '/orders', '/reviews'];

function shouldAttachApiKey(url = '') {
  return API_KEY_PATH_PREFIXES.some((prefix) => String(url).startsWith(prefix));
}

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (ENABLE_API_KEY && shouldAttachApiKey(config.url)) {
    config.headers['x-api-key'] = INTERNAL_API_KEY;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Response และ Error format

สำเร็จ

```json
{
  "success": true,
  "data": {}
}
```

ผิดพลาด

```json
{
  "success": false,
  "message": "..."
}
```

แนะนำให้มี helper กลางสำหรับ map error ไปยัง toast
