import requests
import json

base_url = 'http://localhost:8000/api'

# 1. Create a zone
resp = requests.post(f'{base_url}/hosted-zones', json={'name': 'test.com', 'description': 'test', 'is_private': False})
zone_id = resp.json()['id']
print('Created zone:', zone_id)

# 2. Export (returns empty JSON list)
resp = requests.get(f'{base_url}/hosted-zones/{zone_id}/export?format=json')
print('Exported:', resp.text)

# 3. Import some JSON
test_json = '[{"name": "www", "type": "A", "value": "1.2.3.4", "ttl": 300, "routing_policy": "Simple"}]'
files = {'file': ('test.json', test_json, 'application/json')}
resp = requests.post(f'{base_url}/hosted-zones/{zone_id}/import', files=files)
print('Import resp:', resp.json())

# 4. Get records
resp = requests.get(f'{base_url}/hosted-zones/{zone_id}/records')
print('Records:', resp.json())
