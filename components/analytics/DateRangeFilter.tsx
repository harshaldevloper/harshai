// HarshAI - DateRangeFilter Component
// Day 30: Analytics Dashboard

'use client';

import React, { useState } from 'react';

interface DateRangeFilterProps {
  onRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

type PresetRange = 'today' | 'week' | 'month' | 'all' | 'custom';

export default function DateRangeFilter({ onRangeChange, className = '' }: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetRange>('week');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const getPresetRange = (preset: PresetRange): { start: Date | null; end: Date | null } => {
    const now = new Date();
    let endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate: Date | null = null;

    switch (preset) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        startDate = null;
        break;
      case 'custom':
        if (customStart) {
          startDate = new Date(customStart);
          startDate.setHours(0, 0, 0, 0);
        }
        if (customEnd) {
          endDate = new Date(customEnd);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { start: startDate, end: endDate };
  };

  const handlePresetChange = (preset: PresetRange) => {
    setSelectedPreset(preset);
    const { start, end } = getPresetRange(preset);
    onRangeChange?.(start, end);
  };

  const handleCustomDateChange = () => {
    const { start, end } = getPresetRange('custom');
    onRangeChange?.(start, end);
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
        {(['today', 'week', 'month', 'all'] as PresetRange[]).map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedPreset === preset
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
        <button
          onClick={() => handlePresetChange('custom')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            selectedPreset === 'custom'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          Custom
        </button>
      </div>

      {selectedPreset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => {
              setCustomStart(e.target.value);
              handleCustomDateChange();
            }}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-purple-500/50"
          />
          <span className="text-white/50">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => {
              setCustomEnd(e.target.value);
              handleCustomDateChange();
            }}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>
      )}
    </div>
  );
}
