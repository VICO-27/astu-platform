import sys
import os
import json
from urllib import request, error

TOKEN = os.environ.get('SMOKE_JWT') or ''
if not TOKEN:
    token_file = os.path.join(os.path.dirname(__file__), 'token.txt')
    if os.path.exists(token_file):
        with open(token_file, 'r') as f:
            TOKEN = f.read().strip()
if not TOKEN:
    print('MISSING_TOKEN')
    sys.exit(2)

HEADERS = {'User-Agent': 'smoke-check/1.0', 'Authorization': f'Bearer {TOKEN}'}

URLS = [
    'http://127.0.0.1:8000/api/v1/users/me/',
    'http://127.0.0.1:8000/api/v1/courses/',
    'http://127.0.0.1:8000/api/v1/courses/my/',
    'http://127.0.0.1:8000/api/v1/materials/',
    'http://127.0.0.1:8000/api/v1/projects/',
    'http://127.0.0.1:8000/api/v1/ai/home/',
]

for u in URLS:
    try:
        req = request.Request(u, headers=HEADERS)
        with request.urlopen(req, timeout=10) as r:
            body = r.read(800)
            print(u, r.getcode())
            print(body.decode(errors='replace')[:400].replace('\n',' '))
    except error.HTTPError as e:
        print(u, 'HTTP', e.code, e.read().decode(errors='replace')[:200])
    except Exception as e:
        print(u, 'ERROR', type(e).__name__, str(e))
