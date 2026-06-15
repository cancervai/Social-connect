import { useState } from 'react';
import { User, Building2, Link2, Users, ShieldCheck } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { getMetaOAuthUrl } from '../services/metaService';
import { getLinkedInOAuthUrl } from '../services/linkedinService';

type Tab = 'profile' | 'workspace' | 'connections' | 'team';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={14} /> },
  { id: 'workspace', label: 'Workspace', icon: <Building2 size={14} /> },
  { id: 'connections', label: 'Connections', icon: <Link2 size={14} /> },
  { id: 'team', label: 'Team', icon: <Users size={14} /> },
];

export function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');

  const handleConnectMeta = async () => {
    const url = await getMetaOAuthUrl();
    window.location.href = url;
  };

  const handleConnectLinkedIn = async () => {
    const url = await getLinkedInOAuthUrl();
    window.open(url, 'linkedin-oauth', 'width=600,height=700');
  };

  return (
    <AppShell>
      <TopBar title="Settings" />
      <div className="flex-1 p-6 max-w-3xl">
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === id
                  ? 'border-accent-purple text-accent-purple-light'
                  : 'border-transparent text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="space-y-4">
            <Card>
              <h2 className="text-base font-semibold text-text-primary mb-4">Your Profile</h2>
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={user?.name} size="lg" src={user?.avatarUrl} />
                <div>
                  <p className="font-semibold text-text-primary">{user?.name}</p>
                  <p className="text-sm text-text-muted">{user?.email}</p>
                  <Badge variant="purple" className="mt-1">{user?.role}</Badge>
                </div>
              </div>
              <p className="text-sm text-text-muted">
                Profile editing is not yet implemented. Add a PUT /users/:id endpoint and form here.
              </p>
            </Card>
          </div>
        )}

        {tab === 'workspace' && (
          <Card>
            <h2 className="text-base font-semibold text-text-primary mb-4">Workspace Settings</h2>
            <p className="text-sm text-text-muted">
              Workspace name and plan management. Implement GET/PUT /workspace endpoints and form here.
            </p>
          </Card>
        )}

        {tab === 'connections' && (
          <div className="space-y-4">
            <Card>
              <h2 className="text-base font-semibold text-text-primary mb-4">Connected Accounts</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-raised border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-meta/10 flex items-center justify-center text-meta font-bold text-sm">f</div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Meta Business Suite</p>
                      <p className="text-xs text-text-muted">Facebook Pages & Instagram</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">Not connected</Badge>
                    <Button variant="secondary" size="sm" onClick={handleConnectMeta}>Connect</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-raised border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linkedin/10 flex items-center justify-center">
                      <span className="text-linkedin font-bold text-xs">in</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">LinkedIn</p>
                      <p className="text-xs text-text-muted">Company page & ad account</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">Not connected</Badge>
                    <Button variant="secondary" size="sm" onClick={handleConnectLinkedIn}>Connect</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === 'team' && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-accent-purple-light" />
              <h2 className="text-base font-semibold text-text-primary">Team Management</h2>
              {user?.role !== 'ADMIN' && <Badge variant="warning">Admin only</Badge>}
            </div>
            <p className="text-sm text-text-muted">
              Team member invitation and role management. Implement POST /workspace/invites and GET /workspace/members endpoints, then build the invite form and member table here.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
