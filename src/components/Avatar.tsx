import React from 'react';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  roleColor?: 'indigo' | 'purple' | 'emerald' | 'blue' | 'amber';
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', roleColor = 'indigo' }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  let sizeClass = 'w-10 h-10 text-sm';
  switch (size) {
    case 'sm':
      sizeClass = 'w-8 h-8 text-xs';
      break;
    case 'lg':
      sizeClass = 'w-12 h-12 text-base';
      break;
    case 'xl':
      sizeClass = 'w-16 h-16 text-xl';
      break;
  }

  let colorClass = 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white';
  if (roleColor === 'emerald') colorClass = 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white';
  if (roleColor === 'blue') colorClass = 'bg-gradient-to-tr from-blue-500 to-cyan-500 text-white';
  if (roleColor === 'amber') colorClass = 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-2xl object-cover shadow-[3px_3px_8px_rgba(180,175,205,0.4),-3px_-3px_8px_rgba(255,255,255,0.9)] border-2 border-white`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-2xl flex items-center justify-center font-bold tracking-wider shadow-[4px_4px_10px_rgba(180,175,205,0.35),-4px_-4px_10px_rgba(255,255,255,0.9)] border-2 border-white`}
    >
      {initials || 'U'}
    </div>
  );
};
