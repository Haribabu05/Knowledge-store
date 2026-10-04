import io
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SCOPES = ["https://www.googleapis.com/auth/drive"]

BASE_DIR = Path(__file__).resolve().parent

# OAuth token belonging to YOUR Google account
TOKEN_FILE = BASE_DIR / "token.json"


def get_drive_service():
    if not TOKEN_FILE.exists():
        raise RuntimeError(
            "token.json not found. Run get_refresh_token.py first."
        )

    credentials = Credentials.from_authorized_user_file(
        TOKEN_FILE,
        SCOPES,
    )

    # Refresh expired access token automatically
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())

        # Save updated token
        TOKEN_FILE.write_text(credentials.to_json())

    if not credentials.valid:
        raise RuntimeError("Google OAuth credentials are invalid.")

    return build("drive", "v3", credentials=credentials)


drive = get_drive_service()


@app.post("/")
async def upload_file(file: UploadFile = File(...)):
    folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

    if not folder_id:
        raise HTTPException(
            status_code=500,
            detail="Server configuration error: Folder ID missing",
        )

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted",
        )

    file_bytes = await file.read()

    media = MediaIoBaseUpload(
        io.BytesIO(file_bytes),
        mimetype="application/pdf",
        resumable=True,
        chunksize=1024 * 1024,
    )

    try:
        request = drive.files().create(
            body={
                "name": file.filename,
                "parents": [folder_id],
            },
            media_body=media,
            fields="id, webViewLink, webContentLink",
        )

        response = None

        while response is None:
            status, response = request.next_chunk()

        created = response

        # Make the uploaded PDF publicly readable
        drive.permissions().create(
            fileId=created["id"],
            body={
                "role": "reader",
                "type": "anyone",
            },
        ).execute()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading file: {exc}",
        ) from exc

    return {
        "message": "File uploaded successfully",
        "fileId": created["id"],
        "fileLink": created.get("webViewLink"),
        "downloadLink": created.get("webContentLink"),
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "folderConfigured": bool(
            os.getenv("GOOGLE_DRIVE_FOLDER_ID")
        ),
    }