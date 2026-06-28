const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface HostedZone {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  record_count: number;
}

export interface HostedZoneCreate {
  name: string;
  description: string;
  is_private: boolean;
}

export interface DNSRecord {
  id: number;
  hosted_zone_id: string;
  name: string;
  type: string;
  value: string;
  ttl: number;
  routing_policy: string;
}

export interface DNSRecordCreate {
  name: string;
  type: string;
  value: string;
  ttl: number;
  routing_policy: string;
}

export const api = {
  // Hosted Zones
  async getHostedZones(): Promise<HostedZone[]> {
    const res = await fetch(`${API_URL}/hosted-zones`);
    if (!res.ok) throw new Error("Failed to fetch hosted zones");
    return res.json();
  },
  
  async getHostedZone(id: string): Promise<HostedZone> {
    const res = await fetch(`${API_URL}/hosted-zones/${id}`);
    if (!res.ok) throw new Error("Failed to fetch hosted zone");
    return res.json();
  },

  async createHostedZone(zone: HostedZoneCreate): Promise<HostedZone> {
    const res = await fetch(`${API_URL}/hosted-zones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(zone),
    });
    if (!res.ok) throw new Error("Failed to create hosted zone");
    return res.json();
  },

  async deleteHostedZone(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/hosted-zones/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete hosted zone");
  },

  // DNS Records
  async getRecords(zoneId: string): Promise<DNSRecord[]> {
    const res = await fetch(`${API_URL}/hosted-zones/${zoneId}/records`);
    if (!res.ok) throw new Error("Failed to fetch records");
    return res.json();
  },

  async createRecord(zoneId: string, record: DNSRecordCreate): Promise<DNSRecord> {
    const res = await fetch(`${API_URL}/hosted-zones/${zoneId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error("Failed to create record");
    return res.json();
  },

  async deleteRecord(zoneId: string, recordId: number): Promise<void> {
    const res = await fetch(`${API_URL}/hosted-zones/${zoneId}/records/${recordId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete record");
  },

  async bulkDeleteRecords(zoneId: string, recordIds: number[]): Promise<void> {
    const res = await fetch(`${API_URL}/hosted-zones/${zoneId}/records/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recordIds),
    });
    if (!res.ok) throw new Error("Failed to bulk delete records");
  },
};
