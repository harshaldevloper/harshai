// HarshAI - StatsCard Component
// Day 30: Analytics Dashboard

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'purple',
  className = ''
}: StatsCardProps) {
  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400'
  };

  const bgGradient = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${bgGradient} backdrop-blur-lg rounded-xl p-6 border ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white/70 mb-1">{title}</h3>
          <div className="text-3xl font-bold text-white">{value}</div>
          {subtitle && (
            <p className="text-xs text-white/50 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-80">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-white/50">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
