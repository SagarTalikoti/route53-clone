import sys
sys.path.append('d:/Projects/ScalarAi Labs project/backend')
from fastapi.testclient import TestClient
from main import app, engine
import models
models.Base.metadata.create_all(bind=engine)
client = TestClient(app)

# create a zone
res = client.post('/api/hosted-zones', json={'name': 'test.com', 'description': '', 'is_private': False})
zone_id = res.json()['id']

# try import
import io
file_content = b'[{"name": "www", "type": "A", "value": "1.2.3.4", "ttl": 300, "routing_policy": "Simple"}]'
file = {'file': ('test.json', io.BytesIO(file_content), 'application/json')}
res2 = client.post(f'/api/hosted-zones/{zone_id}/import', files=file)
print(res2.json())
