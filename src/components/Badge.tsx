import React from 'react';
import { AppointmentStatus, AccountStatus } from '../types';

interface BadgeProps {
  status: AppointmentStatus | AccountStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  let styleClass = 'clay-badge-scheduled';
  let label = status;

  switch (status) {
    case 'SCHEDULED':
      styleClass = 'clay-badge-scheduled';
      label = 'Scheduled';
      break;
    case 'COMPLETED':
      styleClass = 'clay-badge-completed';
      label = 'Completed';
      break;
    case 'CANCELLED':
      styleClass = 'clay-badge-cancelled';
      label = 'Cancelled';
      break;
    case 'ACTIVE':
      styleClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      label = 'Active';
      break;
    case 'INACTIVE':
      styleClass = 'bg-slate-100 text-slate-600 border-slate-200';
      label = 'Inactive';
      break;
  }

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-full border shadow-sm ${sizeClass} ${styleClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {label}
    </span>
  );
};
