import { useEffect, useState } from 'react';
import { Users, RefreshCw, Search } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { formatDate } from '../utils/formatters';
import { getLeads, syncLeads, updateLead } from '../services/leadsService';
import type { Lead, LeadStatus } from '../types';

const statusVariant: Record<LeadStatus, 'neutral' | 'info' | 'success' | 'warning'> = {
  NEW: 'neutral',
  CONTACTED: 'info',
  QUALIFIED: 'success',
  CLOSED: 'warning',
};

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const data = await getLeads({ search: q, limit: 50 });
      setLeads(data.leads);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncLeads();
      await load();
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await updateLead(id, { status });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <AppShell>
      <TopBar title="Leads" onSync={handleSync} />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 max-w-sm">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={14} />}
            />
          </form>
          <p className="text-sm text-text-muted ml-auto">{total} total leads</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : leads.length === 0 ? (
          <Card className="flex flex-col items-center py-16 text-center">
            <Users size={32} className="text-text-muted mb-3" />
            <p className="text-text-primary font-medium mb-1">No leads yet</p>
            <p className="text-sm text-text-muted mb-4">Sync leads from your connected platforms</p>
            <Button icon={<RefreshCw size={14} />} onClick={handleSync} loading={syncing}>
              Sync Leads
            </Button>
          </Card>
        ) : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Source</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-raised transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{lead.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.source === 'META' ? 'info' : 'cyan'}>{lead.source}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="text-xs bg-raised border border-border rounded px-2 py-1 text-text-secondary focus:outline-none focus:border-border-strong"
                      >
                        {(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'] as LeadStatus[]).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
