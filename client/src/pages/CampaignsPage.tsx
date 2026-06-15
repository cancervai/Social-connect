import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';
import { getCampaigns } from '../services/campaignService';
import type { Campaign, CampaignStatus } from '../types';

const statusVariant: Record<CampaignStatus, 'success' | 'warning' | 'neutral' | 'error'> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  DRAFT: 'neutral',
  COMPLETED: 'neutral',
};

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCampaigns({ limit: 50 })
      .then((data) => { setCampaigns(data.campaigns); setTotal(data.total); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <TopBar title="Campaigns" />
      <div className="flex-1 p-6">
        <p className="text-sm text-text-muted mb-4">{total} total campaigns</p>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : campaigns.length === 0 ? (
          <Card className="flex flex-col items-center py-16 text-center">
            <Megaphone size={32} className="text-text-muted mb-3" />
            <p className="text-text-primary font-medium mb-1">No campaigns found</p>
            <p className="text-sm text-text-muted">
              Campaigns will appear here once you sync your Meta Ads and LinkedIn ad accounts.
            </p>
          </Card>
        ) : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Campaign</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Platform</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Budget</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Spend</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Impressions</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Clicks</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">CPC</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">CTR</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-raised transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.platform === 'META' ? 'info' : 'cyan'}>{c.platform}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-right tabular-nums">
                      {c.budget != null ? formatCurrency(c.budget) : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-right tabular-nums">{formatCurrency(c.spend)}</td>
                    <td className="px-4 py-3 text-text-secondary text-right tabular-nums">{formatNumber(c.impressions)}</td>
                    <td className="px-4 py-3 text-text-secondary text-right tabular-nums">{formatNumber(c.clicks)}</td>
                    <td className="px-4 py-3 text-text-secondary text-right tabular-nums">
                      {c.cpc != null ? formatCurrency(c.cpc) : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-right tabular-nums">
                      {c.ctr != null ? formatPercent(c.ctr) : '—'}
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
