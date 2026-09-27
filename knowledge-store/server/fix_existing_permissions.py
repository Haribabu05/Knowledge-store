"""
Run this once to fix files uploaded before the permission grant existed.

It loops over every file currently in the Drive folder (not a hardcoded count)
and makes each one readable by anyone with the link, same as new uploads.

Usage:
    python fix_existing_permissions.py
"""
import os

from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

load_dotenv()

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


def main():
    folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    if not folder_id:
        raise SystemExit("GOOGLE_DRIVE_FOLDER_ID is not set")

    page_token = None
    fixed, skipped = 0, 0

    while True:
        response = (
            drive.files()
            .list(
                q=f"'{folder_id}' in parents and trashed = false",
                fields="nextPageToken, files(id, name)",
                pageToken=page_token,
            )
            .execute()
        )

        for f in response.get("files", []):
            existing = drive.permissions().list(fileId=f["id"], fields="permissions(type,role)").execute()
            already_public = any(
                p["type"] == "anyone" and p["role"] == "reader" for p in existing.get("permissions", [])
            )

            if already_public:
                skipped += 1
                continue

            drive.permissions().create(
                fileId=f["id"], body={"role": "reader", "type": "anyone"}
            ).execute()
            print(f"Fixed: {f['name']} ({f['id']})")
            fixed += 1

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    print(f"\nDone. Fixed {fixed} file(s), {skipped} already had public access.")


if __name__ == "__main__":
    main()
