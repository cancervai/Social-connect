import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Users,
  Megaphone,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/posts', icon: FileText, label: 'Posts' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-purple flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-text-primary text-sm">Social Connect</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150',
                isActive
                  ? 'bg-accent-purple-dim text-accent-purple-light border-l-2 border-accent-purple pl-[10px]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-raised border-l-2 border-transparent pl-[10px]',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="my-3 border-t border-border" />

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150',
              isActive
                ? 'bg-accent-purple-dim text-accent-purple-light border-l-2 border-accent-purple pl-[10px]'
                : 'text-text-secondary hover:text-text-primary hover:bg-raised border-l-2 border-transparent pl-[10px]',
            ].join(' ')
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <Avatar name={user?.name} size="sm" src={user?.avatarUrl} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.role}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-raised transition-colors"
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
