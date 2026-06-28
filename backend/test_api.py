import requests
import uuid

base_url = 'http://localhost:8000/api'

resp = requests.post(f'{base_url}/hosted-zones', json={'name': 'test.com', 'description': 'test', 'is_private': False})
zone_id = resp.json()['id']
print('Created zone:', zone_id)

test_json = '[{"name": "www", "type": "A", "value": "1.2.3.4", "ttl": 300, "routing_policy": "Simple"}]'
resp = requests.post(f'{base_url}/hosted-zones/{zone_id}/import', files={'file': ('test.json', test_json)})
print('Import resp:', resp.json())

resp = requests.get(f'{base_url}/hosted-zones/{zone_id}/records')
print('Records:', resp.json())
