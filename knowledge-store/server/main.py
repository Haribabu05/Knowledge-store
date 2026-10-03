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


from pathlib import Path

SERVICE_ACCOUNT_FILE = Path(__file__).resolve().parent / "knowledge-store-a7eee-510513-abc8749c7ec9.json"

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
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

    media = MediaIoBaseUpload(

    io.BytesIO(file_bytes),
    mimetype=file.content_type,
    resumable=True,
    chunksize=1024 * 1024,  # 1 MB chunks

    )

    try:

        request = drive.files().create(

        body={"name": file.filename, "parents": [folder_id]},
        media_body=media,
        fields="id, webViewLink, webContentLink",
               
        )

        response = None
        while response is None:
            status, response = request.next_chunk()



        created = response

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
