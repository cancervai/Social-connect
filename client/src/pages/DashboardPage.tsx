import { useEffect, useState } from 'react';
import { TrendingUp, Users, Eye, MousePointer, FileText, Activity } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { formatNumber, formatRelative } from '../utils/formatters';
import { getOverview } from '../services/analyticsService';
import type { AnalyticsOverview } from '../types';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-accent-purple-dim">
          <span className="text-accent-purple-light">{icon}</span>
        </div>
        {trend && (
          <Badge variant="success" className="text-xs">
            {trend}
          </Badge>
        )}
      </div>
      <p className="text-3xl font-bold text-text-primary tabular-nums">{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </Card>
  );
}

function PlatformStatusCard({ platform, connected }: { platform: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-raised border border-border">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}
        />
        <span className="text-sm text-text-primary font-medium">{platform}</span>
      </div>
      <Badge variant={connected ? 'success' : 'error'}>{connected ? 'Connected' : 'Disconnected'}</Badge>
    </div>
  );
}

export function DashboardPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview({ range: '30d' })
      .then(setOverview)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const stats = overview?.summary;

  return (
    <AppShell>
      <TopBar title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <StatCard label="Total Reach (30d)" value={formatNumber(stats?.totalReach ?? 0)} icon={<Eye size={18} />} trend="+12%" />
              <StatCard label="Impressions (30d)" value={formatNumber(stats?.totalImpressions ?? 0)} icon={<Activity size={18} />} trend="+8%" />
              <StatCard label="Engagements (30d)" value={formatNumber(stats?.totalEngagements ?? 0)} icon={<MousePointer size={18} />} trend="+5%" />
              <StatCard label="Follower Growth" value={`+${formatNumber(stats?.followerGrowth ?? 0)}`} icon={<TrendingUp size={18} />} />
              <StatCard label="Posts Published" value={String(stats?.postsPublished ?? 0)} icon={<FileText size={18} />} />
              <StatCard label="Engagement Rate" value={`${stats?.engagementRate ?? 0}%`} icon={<Users size={18} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <h2 className="text-base font-semibold text-text-primary mb-4">Platform Status</h2>
                <div className="space-y-2">
                  <PlatformStatusCard platform="Facebook / Meta" connected={true} />
                  <PlatformStatusCard platform="Instagram" connected={true} />
                  <PlatformStatusCard platform="LinkedIn" connected={false} />
                </div>
                <p className="text-xs text-text-muted mt-4">
                  Go to Settings → Connected Accounts to manage platform connections.
                </p>
              </Card>

              <Card>
                <h2 className="text-base font-semibold text-text-primary mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Post scheduled for tomorrow', time: '2 hours ago', type: 'post' },
                    { label: '3 new leads synced from Meta', time: '5 hours ago', type: 'lead' },
                    { label: 'Q1 campaign paused', time: '1 day ago', type: 'campaign' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm text-text-primary">{item.label}</p>
                        <p className="text-xs text-text-muted">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
