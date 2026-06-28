import urllib.request
import json
import urllib.parse
from uuid import uuid4

import mimetypes
def get_content_type(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'

def encode_multipart_formdata(fields, files):
    boundary = uuid4().hex
    body = []
    for (key, value) in fields.items():
        body.extend(
            [
                f'--{boundary}'.encode('utf-8'),
                f'Content-Disposition: form-data; name="{key}"'.encode('utf-8'),
                b'',
                value.encode('utf-8'),
            ]
        )
    for (key, filename, value) in files:
        body.extend(
            [
                f'--{boundary}'.encode('utf-8'),
                f'Content-Disposition: form-data; name="{key}"; filename="{filename}"'.encode('utf-8'),
                f'Content-Type: {get_content_type(filename)}'.encode('utf-8'),
                b'',
                value,
            ]
        )
    body.extend([f'--{boundary}--'.encode('utf-8'), b''])
    return b'\r\n'.join(body), boundary

# Create zone
req = urllib.request.Request('http://127.0.0.1:8000/api/hosted-zones', data=json.dumps({'name': 'test.com', 'description': 'desc', 'is_private': False}).encode('utf-8'), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as response:
    zone = json.loads(response.read())
print('zone:', zone)
zone_id = zone['id']

# Import
file_content = b'[{"name": "www", "type": "A", "value": "1.2.3.4", "ttl": 300, "routing_policy": "Simple"}]'
body, boundary = encode_multipart_formdata({}, [('file', 'test.json', file_content)])
req2 = urllib.request.Request(f'http://127.0.0.1:8000/api/hosted-zones/{zone_id}/import', data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
with urllib.request.urlopen(req2) as response:
    print('import result:', json.loads(response.read()))

# Check records
req3 = urllib.request.Request(f'http://127.0.0.1:8000/api/hosted-zones/{zone_id}/records')
with urllib.request.urlopen(req3) as response:
    print('records:', json.loads(response.read()))
