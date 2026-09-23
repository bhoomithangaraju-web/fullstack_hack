import React, { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  subtitle?: string;
  colorVariant?: 'lavender' | 'blue' | 'mint' | 'peach' | 'rose' | 'white';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  colorVariant = 'white',
}) => {
  return (
    <Card colorVariant={colorVariant} interactive className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <span className="text-3xl font-extrabold text-slate-800">{value}</span>
        {subtitle && <span className="text-[11px] text-slate-400 font-medium">{subtitle}</span>}
      </div>
      <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-clay-sm flex items-center justify-center text-slate-700">
        {icon}
      </div>
    </Card>
  );
};
