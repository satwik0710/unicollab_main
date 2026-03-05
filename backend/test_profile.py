import urllib.request
import urllib.error
import os

from dotenv import load_dotenv

load_dotenv()
token = os.getenv("VITE_TEST_TOKEN")

req = urllib.request.Request('http://127.0.0.1:8000/api/v1/users/profile/e4f71a93-51bb-45e0-843e-7a4c0228d7ee')
if token:
    req.add_header('Authorization', f'Bearer {token}')

try:
    res = urllib.request.urlopen(req)
    print(res.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
