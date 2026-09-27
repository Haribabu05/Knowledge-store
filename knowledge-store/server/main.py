import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your real frontend domain(s) before going to production
    allow_methods=["*"],
    allow_headers=["*"],
)

SCOPES = ["https://www.googleapis.com/auth/drive"]

credentials = service_account.Credentials.from_service_account_info(
    {
        "type": os.getenv("TYPE"),
        "project_id": os.getenv("PROJECT_ID"),
        "private_key_id": os.getenv("PRIVATE_KEY_ID"),
        "private_key": os.getenv("PRIVATE_KEY", "").replace("\\n", "\n"),
        "client_email": os.getenv("CLIENT_EMAIL"),
        "client_id": os.getenv("CLIENT_ID"),
        "token_uri": os.getenv("TOKEN_URI", "https://oauth2.googleapis.com/token"),
    },
    scopes=SCOPES,
)

drive = build("drive", "v3", credentials=credentials)


@app.post("/")
async def upload_file(file: UploadFile = File(...)):
    folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    if not folder_id:
        raise HTTPException(500, "Server configuration error: Folder ID missing")

    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted")

    file_bytes = await file.read()
    media = MediaIoBaseUpload(io.BytesIO(file_bytes), mimetype=file.content_type, resumable=False)

    try:
        created = (
            drive.files()
            .create(
                body={"name": file.filename, "parents": [folder_id]},
                media_body=media,
                fields="id, webViewLink, webContentLink",
            )
            .execute()
        )

        # The step that was missing in the original Node version: without this,
        # every uploaded file stays private to the service account and no one
        # else can view or download it.
        drive.permissions().create(
            fileId=created["id"],
            body={"role": "reader", "type": "anyone"},
        ).execute()

    except Exception as exc:  # noqa: BLE001 - surfaced to the client for now
        raise HTTPException(500, f"Error uploading file: {exc}") from exc

    return {
        "message": "File uploaded successfully",
        "fileId": created["id"],
        "fileLink": created["webViewLink"],
        "downloadLink": created["webContentLink"],
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "folderConfigured": bool(os.getenv("GOOGLE_DRIVE_FOLDER_ID")),
    }
