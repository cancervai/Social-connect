import { Bell, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopBarProps {
  title: string;
  onNewPost?: () => void;
  onSync?: () => void;
}

export function TopBar({ title, onNewPost, onSync }: TopBarProps) {
  return (
    <header className="h-16 border-b border-border bg-base flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        {onSync && (
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={onSync}>
            Sync Leads
          </Button>
        )}
        {onNewPost && (
          <Button size="sm" icon={<Plus size={14} />} onClick={onNewPost}>
            New Post
          </Button>
        )}
        <button
          className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-raised transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
