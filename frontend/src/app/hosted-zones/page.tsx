"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Search, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { api, HostedZone } from "@/lib/api";
import toast from "react-hot-toast";

export default function HostedZonesPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Form State
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  
  const loadZones = async () => {
    try {
      const data = await api.getHostedZones();
      setZones(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      await api.createHostedZone({
        name: domainName,
        description,
        is_private: isPrivate
      });
      setIsModalOpen(false);
      setDomainName("");
      setDescription("");
      setIsPrivate(false);
      loadZones();
      toast.success("Hosted zone created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create hosted zone.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Hosted Zone?")) return;
    try {
      await api.deleteHostedZone(id);
      loadZones();
      toast.success("Hosted zone deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete.");
    }
  };

  const filteredZones = zones.filter(zone => zone.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredZones.length / itemsPerPage));
  const paginatedZones = filteredZones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hosted Zones</h1>
          <p className="text-muted mt-1">Manage your DNS domains and routing traffic</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-[0_4px_14px_0_rgba(59,130,246,0.2)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.2)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Create hosted zone
        </button>
      </div>
      
      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="bg-surface border border-border text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-11 p-3 outline-none transition-all shadow-sm"
            placeholder="Search hosted zones by domain name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Domain name</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Type</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs">Description</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs text-center">Records</th>
                <th className="px-6 py-4 font-semibold text-muted uppercase tracking-wider text-xs w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedZones.length === 0 && zones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">No hosted zones yet</h3>
                    <p className="text-muted">Create your first hosted zone to get started.</p>
                  </td>
                </tr>
              ) : paginatedZones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    No hosted zones match your search "{searchQuery}".
                  </td>
                </tr>
              ) : (
                paginatedZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/hosted-zones/${zone.id}`} className="text-primary hover:text-primary-hover font-medium flex items-center gap-2">
                        {zone.name}
                        <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${zone.is_private ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                        {zone.is_private ? "Private" : "Public"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted truncate max-w-[200px]">{zone.description || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-hover text-xs font-medium border border-border">
                        {zone.record_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(zone.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredZones.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted">
            Showing <span className="font-medium text-foreground">{Math.min(filteredZones.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-medium text-foreground">{Math.min(filteredZones.length, currentPage * itemsPerPage)}</span> of <span className="font-medium text-foreground">{filteredZones.length}</span> zones
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
          <div className="bg-surface w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-border/50">
            <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
              <h2 className="text-xl font-bold tracking-tight">Create hosted zone</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground hover:bg-surface-hover p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="flex flex-col min-h-0">
              <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                <label className="block text-sm font-semibold mb-2">Domain name</label>
                <input 
                  type="text" 
                  required
                  value={domainName}
                  onChange={e => setDomainName(e.target.value)}
                  placeholder="example.com"
                  className="w-full bg-background border border-border p-3 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Description <span className="font-normal text-muted ml-1">(optional)</span></label>
                <input 
                  type="text" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter a description..."
                  className="w-full bg-background border border-border p-3 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Zone Type</label>
                <div className="flex flex-col gap-3">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${!isPrivate ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface-hover'}`}>
                    <input 
                      type="radio" 
                      name="zoneType" 
                      checked={!isPrivate} 
                      onChange={() => setIsPrivate(false)} 
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium">Public hosted zone</div>
                      <div className="text-xs text-muted mt-1">Routes traffic on the internet.</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isPrivate ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface-hover'}`}>
                    <input 
                      type="radio" 
                      name="zoneType" 
                      checked={isPrivate} 
                      onChange={() => setIsPrivate(true)} 
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium">Private hosted zone</div>
                      <div className="text-xs text-muted mt-1">Routes traffic within Amazon VPCs.</div>
                    </div>
                  </label>
                </div>
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
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 text-sm rounded-xl font-semibold shadow-md transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
