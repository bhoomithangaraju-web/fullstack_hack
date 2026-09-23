import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  Clock,
  User,
  LogOut,
  Cross,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  let navItems: { label: string; path: string; icon: React.ReactNode }[] = [];

  if (user.role === 'ADMIN') {
    navItems = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Doctors', path: '/admin/doctors', icon: <Stethoscope className="w-4 h-4" /> },
      { label: 'Patients', path: '/admin/patients', icon: <Users className="w-4 h-4" /> },
      { label: 'Appointments', path: '/admin/appointments', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Daily Schedule', path: '/admin/daily-schedule', icon: <Clock className="w-4 h-4" /> },
    ];
  } else if (user.role === 'DOCTOR') {
    navItems = [
      { label: 'Dashboard', path: '/doctor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'My Appointments', path: '/doctor/appointments', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Profile', path: '/doctor/profile', icon: <User className="w-4 h-4" /> },
    ];
  } else if (user.role === 'PATIENT') {
    navItems = [
      { label: 'Dashboard', path: '/patient/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'My Appointments', path: '/patient/appointments', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Profile', path: '/patient/profile', icon: <User className="w-4 h-4" /> },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 p-4 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="clay-card h-full flex flex-col justify-between p-5 bg-white/95">
          {/* Top Brand Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2 pt-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-[4px_4px_10px_rgba(99,102,241,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)]">
                <Cross className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 tracking-tight leading-tight">ClinicCare</span>
                <span className="text-[10px] font-semibold text-purple-600 tracking-wider uppercase">
                  {user.role} Portal
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2 mt-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[4px_4px_12px_rgba(99,102,241,0.35),-2px_-2px_8px_rgba(255,255,255,0.8)]'
                        : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50/60'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom Logout Section */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-500 rounded-2xl hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
