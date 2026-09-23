import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/Avatar';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.role === 'ADMIN') return 'Clinic Administrator';
    if (user.profile && 'fullName' in user.profile) {
      return user.profile.fullName;
    }
    return user.email.split('@')[0];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-30 pt-4 px-4 lg:px-8">
      <div className="clay-card py-3 px-6 flex items-center justify-between bg-white/90">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400">{getGreeting()} 👋</span>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">{getDisplayName()}</h2>
          </div>
        </div>

        {/* Right profile info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-700">{user?.email}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              {user?.role}
            </span>
          </div>
          <Avatar name={getDisplayName()} size="md" />
        </div>
      </div>
    </header>
  );
};
