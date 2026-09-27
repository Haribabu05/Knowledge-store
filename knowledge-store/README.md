# Knowledge Store

A notes-sharing site: students sign in with a `.edu` Google account, upload PDFs
(stored in Google Drive via a service account), and everyone else can browse,
filter by category/uploader, preview, download, and share them.

## Structure

```
knowledge-store/
├── frontend/   Vite + React + Tailwind + Firebase (Auth + Firestore)
└── server/     FastAPI — the only piece that talks to Google Drive
```

Only the upload action touches `server/`. Browsing, searching, viewing, and
downloading all go straight from the frontend to Firestore/Drive.

## 1. Firebase project setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method** → enable **Google**.
3. **Firestore Database** → create database (start in production mode).
4. **Project settings → General → Your apps** → add a Web app, copy the config
   values into `frontend/.env` (see `frontend/.env.example`).

### Firestore security rules

Paste into **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /notes/{noteId} {
      allow read: if true;                          // public browsing/search
      allow create: if request.auth != null;        // must be signed in to upload
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.uploaderUid;
    }

    match /profiles/{uid} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /usernames/{name} {
      allow read: if true;
      allow create: if request.auth != null;         // claimed once, never overwritten
    }
  }
}
```

## 2. Google Drive service account (for the upload server)

1. In [Google Cloud Console](https://console.cloud.google.com), create a service
   account → generate a JSON key.
2. Create a Google Drive folder, share it with the service account's email
   (found in the JSON key) as an **Editor**.
3. Copy the folder's ID (from its URL) and the JSON key's fields into
   `server/.env` (see `server/.env.example`).

## 3. Run locally

```bash
# Backend
cd server
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env   # fill in real values
npm run dev
```

## 4. Deploy

- **Frontend** → [Vercel](https://vercel.com): import the repo, set root
  directory to `frontend`, add the same env vars from `frontend/.env`.
- **Backend** → [Render](https://render.com): new Web Service, root directory
  `server`, build command `pip install -r requirements.txt`, start command
  `uvicorn main:app --host 0.0.0.0 --port $PORT`, add the env vars from
  `server/.env`.
- Update `VITE_UPLOAD_SERVER_URL` in Vercel's env vars to your Render URL.

Render's free tier spins the backend down after ~15 minutes idle — the first
upload after a gap takes 30–60s to wake back up. This only affects uploads;
everything else (browsing, downloading, viewing) is unaffected since it never
touches Render. Upgrade to Render's Starter tier (~$5–7/mo) if you want to
remove that delay.

## Already have files uploaded without permissions set?

Run `server/fix_existing_permissions.py` once — it loops over every file in
the Drive folder and grants "anyone with the link can view" to any that are
still missing it.
