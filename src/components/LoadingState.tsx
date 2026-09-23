import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading details...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 opacity-30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wide">{message}</p>
    </div>
  );
};
