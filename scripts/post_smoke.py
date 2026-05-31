import json
import os
from urllib import request, error

ROOT = 'http://127.0.0.1:8000'

def post_json(url, data, headers=None):
    headers = headers or {}
    headers['Content-Type'] = 'application/json'
    req = request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with request.urlopen(req, timeout=20) as r:
            body = r.read().decode(errors='replace')
            print(url, r.getcode())
            print(body[:800])
    except error.HTTPError as e:
        print(url, 'HTTP', e.code)
        try:
            print(e.read().decode(errors='replace')[:800])
        except Exception:
            pass
    except Exception as e:
        print(url, 'ERROR', type(e).__name__, str(e))


# 1. Login
login_url = ROOT + '/api/v1/auth/login/'
login_data = {'email': 'smoke+tester@example.com', 'password': 'TestPass123!'}
post_json(login_url, login_data)

# If login returns tokens, use them to call AI home endpoint
token_file = os.path.join(os.path.dirname(__file__), 'token.txt')
token = None
if os.path.exists(token_file):
    token = open(token_file).read().strip()

if token:
    ai_url = ROOT + '/api/v1/ai/home/'
    headers = {'Authorization': f'Bearer {token}'}
    post_json(ai_url, {'question': 'What is a good study strategy for calculus?'}, headers=headers)
else:
    print('No token available to call AI endpoint')
