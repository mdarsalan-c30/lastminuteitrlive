import urllib.request
import json
req = urllib.request.Request(
    'https://taxsahaatimvp.vercel.app/_/backend/api/advisor/action', 
    data=json.dumps({"action": "explain", "context": {}}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    print("SUCCESS", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP ERROR", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("ERROR", str(e))
