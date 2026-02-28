# How to Test – Pharma DMS Phase 1

## Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** running with database `pharma_dms_test` created
- **Backend** and **frontend** run from separate terminals

---

## 1. Start the backend

```powershell
cd backend
npm run dev
```

- Server should start at **http://localhost:4000**
- Check: open http://localhost:4000/api/health → should return `{"ok":true,"service":"pharma-dms-api"}`

If the database is empty, run migrations and seed once:

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

---

## 2. Start the frontend

```powershell
cd frontend
npm run dev
```

- App runs at **http://localhost:3000** (or the port Vite prints)
- Ensure `frontend/.env` has `VITE_API_URL=http://localhost:4000` so the app talks to the backend

---

## 3. Test Auth

1. Open **http://localhost:3000** in the browser.
2. You should see the **login** page.
3. **Quick login (demo):**
   - Use the dropdown **“Choose demo account...”**.
   - Pick e.g. **Admin** → username and password fill.
   - Click **Sign In**.
4. **Or type credentials:**
   - Username: `admin`
   - Password: `admin123`
   - Click **Sign In**.
5. You should land on the app (Admin Home or Dashboard).
6. **Sign out** (header) → you should return to the login page.
7. **Invalid login:** try `admin` / `wrong` → red error message “Invalid username or password”.

---

## 4. Test AI Conversion

1. **Log in** as `admin` (or preparator/manager).
2. Go to **AI Conversion** (or **Upload Templates** / **Document Management** from the sidebar).
3. **Upload a file:**
   - Click the upload area or “Choose file” and select a **Word (.docx)**, **Excel (.xlsx)**, or **PDF**.
   - Click **Upload** / **Analyze** (or the button that starts the flow).
4. You should see:
   - Toasts: “Uploading…”, then “Analyzing…”.
   - Either **Workflow Approval** (approve the workflow) or directly **AI Conversion Preview**.
5. **In AI Conversion Preview:**
   - Check that sections and fields from the file are shown.
   - Optionally edit section title or a field, then click **Save**.
6. You should see **“Template Saved Successfully!”** and be taken back to Document Management or Upload Templates.
7. **Verify in UI:** The template list should show the new template (from the backend).

**Backend check (optional):**

- In backend, under `uploads/templates/` you should see the uploaded file.
- In DB: `templates` table has a row with the same `id` and `parsed_sections` (after save).

---

## 5. Test Raise Request (when implemented)

1. Go to **Raise Request**.
2. Pick a template from the list (from AI Conversion).
3. Create a request and fill the form; save.
4. Confirm the request appears in the list and form data is saved.

---

## 6. Test Document Library (when implemented)

1. Go to **Document Library**.
2. Confirm documents/requests from the API appear.
3. Open a document; preview and (if implemented) edit and save.

---

## Quick checklist

| Step | What to do | Expected |
|------|------------|----------|
| Backend | `cd backend && npm run dev` | “Pharma DMS API running at http://localhost:4000” |
| Health | Open http://localhost:4000/api/health | `{"ok":true,...}` |
| Frontend | `cd frontend && npm run dev` | App at http://localhost:3000 |
| Login | admin / admin123 | Dashboard or Admin Home |
| Logout | Click Sign out | Back to login |
| AI Conversion | Upload .docx/.xlsx/.pdf → Save in preview | “Template Saved Successfully!”, template in list |

---

## Troubleshooting

- **“Invalid username or password”**  
  Run `npm run db:seed` in `backend` and use `admin` / `admin123` (see `users.md`).

- **Click "Upload Templates" and nothing happens (requests stay "pending")**  
  The frontend is waiting for the backend. Check: (1) Backend is running: `cd backend && npm run dev`; open http://localhost:4000/api/health — it should return `{"ok":true,...}`. (2) In `frontend/.env` set `VITE_API_URL=http://localhost:4000` and restart the frontend. You should then see toasts and the button show "Uploading..."; if the server still doesn't respond, an error appears after ~60s.

- **Upload or save fails**  
  - Backend running on 4000?  
  - Frontend `.env`: `VITE_API_URL=http://localhost:4000`?  
  - Browser dev tools → Network: check the failing request (status, response body).

- **401 on API calls**  
  Log in again; token may have expired or be missing.

- **Port 4000 already in use**  
  Stop the other process or set `PORT=4001` in `backend/.env` and use `VITE_API_URL=http://localhost:4001` in `frontend/.env`.
