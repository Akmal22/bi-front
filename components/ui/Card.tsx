import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
