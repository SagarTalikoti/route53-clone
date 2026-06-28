"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronRight, Plus, X, Search, ChevronLeft, Globe, Settings2, Trash2, CheckSquare } from "lucide-react";
import { api, HostedZone, DNSRecord } from "@/lib/api";
import toast from "react-hot-toast";

export default function HostedZoneDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Bulk selection state
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Form State
  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [recordValue, setRecordValue] = useState("");
  const [ttl, setTtl] = useState(300);
  const [routingPolicy, setRoutingPolicy] = useState("Simple");
  
  const loadData = async () => {
    try {
      const zoneData = await api.getHostedZone(id);
      setZone(zoneData);
      const recordsData = await api.getRecords(id);
      setRecords(recordsData);
      setSelectedRecords([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRecord(id, {
        name: recordName,
        type: recordType,
        value: recordValue,
        ttl,
        routing_policy: routingPolicy
      });
      setIsModalOpen(false);
      setRecordName("");
      setRecordType("A");
      setRecordValue("");
      setTtl(300);
      loadData();
      toast.success("Record created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create record.");
    }
  };

  const handleDelete = async (recordId: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.deleteRecord(id, recordId);
      loadData();
      toast.success("Record deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRecords.length} records?`)) return;
    try {
      await api.bulkDeleteRecords(id, selectedRecords);
      loadData();
      toast.success(`${selectedRecords.length} records deleted`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to bulk delete.");
    }
  };



  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRecords(paginatedRecords.map(r => r.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const toggleRecord = (recordId: number) => {
    if (selectedRecords.includes(recordId)) {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    } else {
      setSelectedRecords([...selectedRecords, recordId]);
    }
  };

  if (!zone) return <div className="p-4">Loading...</div>;

  const filteredRecords = records.filter(record => record.name.toLowerCase().includes(searchQuery.toLowerCase()) || (record.name === "" && zone.name.toLowerCase().includes(searchQuery.toLowerCase())));
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isAllSelected = paginatedRecords.length > 0 && selectedRecords.length === paginatedRecords.length;
  const isSomeSelected = selectedRecords.length > 0 && !isAllSelected;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center text-sm text-muted mb-6 gap-2 bg-surface w-fit px-4 py-2 rounded-full border border-border shadow-sm">
        <Link href="/hosted-zones" className="hover:text-primary transition-colors font-medium">Hosted zones</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-semibold">{zone.name}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          {zone.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-[0_4px_14px_0_rgba(59,130,246,0.2)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.2)] transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Create record
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm relative z-10">
          <div className="space-y-1">
            <div className="text-muted font-medium text-xs uppercase tracking-wider">Hosted zone ID</div>
            <div className="font-mono text-foreground">{zone.id}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted font-medium text-xs uppercase tracking-wider">Type</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${zone.is_private ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <span className="font-medium text-foreground">{zone.is_private ? "Private" : "Public"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted font-medium text-xs uppercase tracking-wider">Record count</div>
            <div className="font-semibold text-lg text-foreground">{zone.record_count}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted font-medium text-xs uppercase tracking-wider">Description</div>
            <div className="text-foreground truncate">{zone.description || "No description provided"}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="bg-surface border border-border text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-11 p-3 outline-none transition-all shadow-sm"
            placeholder="Search records by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {selectedRecords.length > 0 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="text-sm font-medium text-muted">{selectedRecords.length} selected</span>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Record name</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Type</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Routing policy</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Value/Route traffic to</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">TTL</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRecords.length === 0 && records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <Settings2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">No DNS records</h3>
                    <p className="text-muted">Create your first record for this hosted zone.</p>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    No records match your search "{searchQuery}".
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const isSelected = selectedRecords.includes(record.id);
                  return (
                    <tr key={record.id} className={`hover:bg-surface-hover/50 transition-colors group ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRecord(record.id)}
                          className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{record.name ? `${record.name}.${zone.name}` : zone.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{record.routing_policy}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted max-w-xs truncate" title={record.value}>{record.value}</td>
                      <td className="px-6 py-4 text-muted">{record.ttl}s</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted">
            Showing <span className="font-medium text-foreground">{Math.min(filteredRecords.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-medium text-foreground">{Math.min(filteredRecords.length, currentPage * itemsPerPage)}</span> of <span className="font-medium text-foreground">{filteredRecords.length}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium px-4 py-2 bg-surface border border-border rounded-xl">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-border/50">
            <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
              <h2 className="text-xl font-bold tracking-tight">Create record</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground hover:bg-surface-hover p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="flex flex-col min-h-0">
              <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                <label className="block text-sm font-semibold mb-2">Record name</label>
                <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input 
                    type="text" 
                    value={recordName}
                    onChange={e => setRecordName(e.target.value)}
                    placeholder="www"
                    className="w-full bg-background p-3 text-sm focus:outline-none"
                  />
                  <div className="bg-surface-hover px-4 py-3 text-sm text-muted font-medium border-l border-border">
                    .{zone.name}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Record type</label>
                  <select 
                    value={recordType}
                    onChange={e => setRecordType(e.target.value)}
                    className="w-full bg-background border border-border p-3 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all shadow-sm"
                  >
                    {["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">TTL (seconds)</label>
                  <input 
                    type="number" 
                    value={ttl}
                    onChange={e => setTtl(Number(e.target.value))}
                    className="w-full bg-background border border-border p-3 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Value</label>
                <textarea 
                  required
                  value={recordValue}
                  onChange={e => setRecordValue(e.target.value)}
                  placeholder="192.0.2.44"
                  rows={3}
                  className="w-full bg-background border border-border p-3 text-sm rounded-xl font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all shadow-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Routing policy</label>
                <select 
                  value={routingPolicy}
                  onChange={e => setRoutingPolicy(e.target.value)}
                  className="w-full bg-background border border-border p-3 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all shadow-sm"
                >
                  <option value="Simple">Simple routing</option>
                  <option value="Weighted">Weighted routing</option>
                  <option value="Geolocation">Geolocation routing</option>
                  <option value="Latency">Latency routing</option>
                  <option value="Failover">Failover routing</option>
                </select>
              </div>
              </div>
              
              <div className="p-6 pt-4 flex justify-end gap-3 border-t border-border shrink-0 rounded-b-2xl bg-surface">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold border border-border rounded-xl hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 text-sm rounded-xl font-semibold shadow-md transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
