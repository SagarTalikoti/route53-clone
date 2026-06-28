import sqlite3

conn = sqlite3.connect('route53_clone.db')
cursor = conn.cursor()

print("--- Hosted Zones ---")
for row in cursor.execute("SELECT * FROM hosted_zones"):
    print(row)

print("\n--- DNS Records ---")
for row in cursor.execute("SELECT * FROM dns_records"):
    print(row)

conn.close()
