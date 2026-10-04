from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow


SCOPES = [
    "https://www.googleapis.com/auth/drive"
]

BASE_DIR = Path(__file__).resolve().parent

CLIENT_SECRET_FILE = BASE_DIR / "client_secret.json"
TOKEN_FILE = BASE_DIR / "token.json"


flow = InstalledAppFlow.from_client_secrets_file(
    CLIENT_SECRET_FILE,
    SCOPES
)

creds = flow.run_local_server(
    port=0,
    access_type="offline",
    prompt="consent"
)

# Save OAuth credentials
TOKEN_FILE.write_text(creds.to_json())

print("\nGoogle authentication successful!")
print("Token saved to:")
print(TOKEN_FILE)