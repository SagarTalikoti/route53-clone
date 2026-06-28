import dns.zone
text = """$ORIGIN example.com.
$TTL 300
@ IN A 1.2.3.4
www IN A 1.2.3.5
"""
zone = dns.zone.from_text(text, origin='example.com', check_origin=False)
print("Nodes in zone:", len(zone.nodes))
for name, node in zone.nodes.items():
    print("Name:", name.to_text())
