from unittest.mock import MagicMock

from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


def test_health_reports_folder_configured():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "folderConfigured": True}


def test_upload_rejects_non_pdf_files():
    resp = client.post("/", files={"file": ("notes.txt", b"hello", "text/plain")})
    assert resp.status_code == 400
    assert "PDF" in resp.json()["detail"]


def test_successful_upload_grants_anyone_read_permission(monkeypatch):
    """
    This is the regression test for the original bug: a successful upload
    must call drive.permissions().create() with {"role": "reader", "type":
    "anyone"}. Without it, every file stays private and downloads break —
    exactly what happened before this was fixed.
    """
    fake_created = {
        "id": "abc123",
        "webViewLink": "https://drive.google.com/view/abc123",
        "webContentLink": "https://drive.google.com/download/abc123",
    }

    mock_request = MagicMock()
    mock_request.next_chunk.return_value = (None, fake_created)

    mock_files = MagicMock()
    mock_files.create.return_value = mock_request

    mock_permissions = MagicMock()
    mock_permissions.create.return_value.execute.return_value = {}

    mock_drive = MagicMock()
    mock_drive.files.return_value = mock_files
    mock_drive.permissions.return_value = mock_permissions

    monkeypatch.setattr(main, "drive", mock_drive)

    resp = client.post(
        "/", files={"file": ("notes.pdf", b"%PDF-1.4 fake pdf bytes", "application/pdf")}
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["fileId"] == "abc123"
    assert body["fileLink"] == "https://drive.google.com/view/abc123"
    assert body["downloadLink"] == "https://drive.google.com/download/abc123"

    mock_permissions.create.assert_called_once()
    _, kwargs = mock_permissions.create.call_args
    assert kwargs["fileId"] == "abc123"
    assert kwargs["body"] == {"role": "reader", "type": "anyone"}


def test_drive_error_surfaces_as_500_with_real_message(monkeypatch):
    """
    Mirrors the actual failures hit during manual testing (storage quota,
    file not found, API not enabled) — confirms the real Drive error
    message reaches the client instead of being swallowed.
    """
    mock_request = MagicMock()
    mock_request.next_chunk.side_effect = Exception("storageQuotaExceeded")

    mock_files = MagicMock()
    mock_files.create.return_value = mock_request

    mock_drive = MagicMock()
    mock_drive.files.return_value = mock_files

    monkeypatch.setattr(main, "drive", mock_drive)

    resp = client.post(
        "/", files={"file": ("notes.pdf", b"%PDF-1.4 fake pdf bytes", "application/pdf")}
    )

    assert resp.status_code == 500
    assert "storageQuotaExceeded" in resp.json()["detail"]


def test_missing_folder_id_returns_500(monkeypatch):
    monkeypatch.delenv("GOOGLE_DRIVE_FOLDER_ID", raising=False)
    resp = client.post(
        "/", files={"file": ("notes.pdf", b"%PDF-1.4 fake pdf bytes", "application/pdf")}
    )
    assert resp.status_code == 500
    assert "Folder ID missing" in resp.json()["detail"]
