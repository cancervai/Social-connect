import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-base">
      <Sidebar />
      <main className="ml-64 min-h-screen flex flex-col">{children}</main>
    </div>
  );
}
