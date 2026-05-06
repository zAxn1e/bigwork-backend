# BigWork Frontend Docs (Docusaurus)

## Start

Recommended Node version: 18/20/22 LTS (avoid Node 25 for now)

1. Install dependencies

```bash
npm install
```

2. Start docs site

```bash
npm start
```

Default URL: http://localhost:3001

## Build

```bash
npm run build
```

## Notes

- This docs site is for frontend team integration with bigwork-backend.
- Backend API summary is in ../docs/API.md
- Backend handoff/runbook is in ../docs/TEAMMATE_BACKEND_INSTRUCTIONS.md
- Swagger UI is served by backend at `${VITE_API_BASE_URL}/docs` (local example: `http://localhost:3000/docs`)
