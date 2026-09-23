import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  colorVariant?: 'white' | 'lavender' | 'blue' | 'mint' | 'peach' | 'rose';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  colorVariant = 'white',
  onClick,
}) => {
  let bgStyles = 'bg-white/90';

  switch (colorVariant) {
    case 'lavender':
      bgStyles = 'bg-[#FAF8FF] border-purple-100';
      break;
    case 'blue':
      bgStyles = 'bg-[#F4F8FF] border-blue-100';
      break;
    case 'mint':
      bgStyles = 'bg-[#F4FBF7] border-emerald-100';
      break;
    case 'peach':
      bgStyles = 'bg-[#FFFDF9] border-amber-100';
      break;
    case 'rose':
      bgStyles = 'bg-[#FFF5F5] border-rose-100';
      break;
    case 'white':
    default:
      bgStyles = 'bg-white/90 border-white/60';
      break;
  }

  return (
    <div
      onClick={onClick}
      className={`clay-card ${bgStyles} ${interactive ? 'clay-card-interactive cursor-pointer' : ''} p-6 ${className}`}
    >
      {children}
    </div>
  );
};
