import os

# Dummy values so importing main.py doesn't fail when it reads these at
# module load time. Credentials objects don't validate on construction —
# they only matter when an actual request is made, and every test below
# replaces `main.drive` before that can happen, so these never get used
# for a real network call.
os.environ.setdefault("OAUTH_CLIENT_ID", "test-client-id")
os.environ.setdefault("OAUTH_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("OAUTH_REFRESH_TOKEN", "test-refresh-token")
os.environ.setdefault("GOOGLE_DRIVE_FOLDER_ID", "test-folder-id")
