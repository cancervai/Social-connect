import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { AppShell } from '../components/layout/AppShell';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { formatNumber } from '../utils/formatters';
import { getOverview, getMetaAnalytics, getLinkedInAnalytics } from '../services/analyticsService';
import type { AnalyticsOverview, DateRange } from '../types';

const RANGES: { label: string; value: DateRange }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

const chartColors = { purple: '#7C3AED', cyan: '#06B6D4', grid: '#2A2A38', axis: '#6B6B82' };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-raised border border-border rounded-lg px-3 py-2 shadow-raised text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatNumber(p.value)}</p>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>('30d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [metaData, setMetaData] = useState<Record<string, number>>({});
  const [liData, setLiData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const r = range as '7d' | '30d' | '90d';
    Promise.all([getOverview({ range: r }), getMetaAnalytics({ range: r }), getLinkedInAnalytics({ range: r })])
      .then(([ov, meta, li]) => {
        setOverview(ov);
        setMetaData(meta);
        setLiData(li);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <AppShell>
      <TopBar title="Analytics" />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-2">
          {RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                range === value
                  ? 'bg-accent-purple text-white border-accent-purple'
                  : 'text-text-secondary border-border hover:border-border-strong',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Reach', value: overview?.summary.totalReach ?? 0 },
                { label: 'Impressions', value: overview?.summary.totalImpressions ?? 0 },
                { label: 'Engagements', value: overview?.summary.totalEngagements ?? 0 },
                { label: 'Follower Growth', value: overview?.summary.followerGrowth ?? 0 },
              ].map(({ label, value }) => (
                <Card key={label}>
                  <p className="text-2xl font-bold text-text-primary tabular-nums">{formatNumber(value)}</p>
                  <p className="text-sm text-text-muted mt-1">{label}</p>
                </Card>
              ))}
            </div>

            <Card>
              <h2 className="text-base font-semibold text-text-primary mb-4">Reach & Engagement Over Time</h2>
              {(overview?.timeSeries?.length ?? 0) === 0 ? (
                <div className="flex items-center justify-center h-48 text-text-muted text-sm">
                  No data available for this period. Connect your accounts and publish posts to see analytics.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={overview?.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="date" tick={{ fill: chartColors.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: chartColors.axis, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="reach" stroke={chartColors.purple} strokeWidth={2} dot={false} name="Reach" />
                    <Line type="monotone" dataKey="engagements" stroke={chartColors.cyan} strokeWidth={2} dot={false} name="Engagements" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-base font-semibold text-text-primary mb-4">Meta Performance</h2>
                <dl className="space-y-3">
                  {Object.entries(metaData).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center">
                      <dt className="text-sm text-text-secondary capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-sm font-medium text-text-primary tabular-nums">{formatNumber(val)}</dd>
                    </div>
                  ))}
                  {Object.keys(metaData).length === 0 && (
                    <p className="text-sm text-text-muted">No Meta data available</p>
                  )}
                </dl>
              </Card>
              <Card>
                <h2 className="text-base font-semibold text-text-primary mb-4">LinkedIn Performance</h2>
                <dl className="space-y-3">
                  {Object.entries(liData).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center">
                      <dt className="text-sm text-text-secondary capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-sm font-medium text-text-primary tabular-nums">{formatNumber(val)}</dd>
                    </div>
                  ))}
                  {Object.keys(liData).length === 0 && (
                    <p className="text-sm text-text-muted">No LinkedIn data available</p>
                  )}
                </dl>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
