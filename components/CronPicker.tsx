// HarshAI - Cron Expression Picker Component
// Day 28: Background Scheduler (Cron-based Workflow Execution)

'use client';

import { useState } from 'react';

interface CronPickerProps {
  value: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
}

interface PresetOption {
  label: string;
  value: string;
  description: string;
}

const PRESETS: PresetOption[] = [
  { label: 'Every Minute', value: '* * * * *', description: 'Run every minute' },
  { label: 'Every Hour', value: '0 * * * *', description: 'Run at the start of every hour' },
  { label: 'Every 6 Hours', value: '0 */6 * * *', description: 'Run every 6 hours' },
  { label: 'Daily at 9 AM', value: '0 9 * * *', description: 'Run every day at 9:00 AM' },
  { label: 'Daily at Midnight', value: '0 0 * * *', description: 'Run every day at 12:00 AM' },
  { label: 'Weekly (Monday 9 AM)', value: '0 9 * * 1', description: 'Run every Monday at 9:00 AM' },
  { label: 'Weekly (Sunday)', value: '0 0 * * 0', description: 'Run every Sunday at midnight' },
  { label: 'Monthly (1st at 9 AM)', value: '0 9 1 * *', description: 'Run on the 1st of every month at 9:00 AM' },
];

export default function CronPicker({ value, onChange, disabled = false }: CronPickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    PRESETS.find(p => p.value === value)?.value || null
  );
  const [showCustom, setShowCustom] = useState(!selectedPreset);

  const handlePresetClick = (presetValue: string) => {
    setSelectedPreset(presetValue);
    setShowCustom(false);
    onChange(presetValue);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    onChange(e.target.value);
  };

  const parseCron = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length !== 5) return null;
    
    const [minute, hour, day, month, dayOfWeek] = parts;
    
    const minuteDesc = minute === '*' ? 'Every minute' : `Minute ${minute}`;
    const hourDesc = hour === '*' ? 'every hour' : `at ${hour}:00`;
    const dayDesc = day === '*' ? 'every day' : `on day ${day}`;
    const monthDesc = month === '*' ? 'every month' : `in month ${month}`;
    
    const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekDesc = dayOfWeek === '*' ? 'every day of the week' : `on ${dayOfWeekNames[parseInt(dayOfWeek)] || 'day ' + dayOfWeek}`;
    
    return {
      minute: minuteDesc,
      hour: hourDesc,
      day: dayDesc,
      month: monthDesc,
      dayOfWeek: dayOfWeekDesc,
      human: `${minuteDesc}, ${hourDesc}, ${dayDesc}, ${monthDesc}, ${dayOfWeekDesc}`
    };
  };

  const parsed = parseCron(value);

  return (
    <div className="space-y-4">
      {/* Preset Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Presets
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              disabled={disabled}
              className={`p-3 text-left border rounded-md transition-all ${
                selectedPreset === preset.value
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium text-sm text-gray-900">{preset.label}</div>
              <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              <div className="text-xs text-gray-400 mt-1 font-mono">{preset.value}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or custom expression</span>
        </div>
      </div>

      {/* Custom Cron Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Cron Expression
          <span className="text-gray-500 text-xs ml-2 font-normal">
            (minute hour day month dayOfWeek)
          </span>
        </label>
        <input
          type="text"
          value={value}
          onChange={handleCustomChange}
          onFocus={() => setShowCustom(true)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="0 0 * * *"
        />
        
        {/* Cron Expression Breakdown */}
        {parsed && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Expression Breakdown:</div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Minute:</span>
                <span className="ml-1 font-medium">{parsed.minute}</span>
              </div>
              <div>
                <span className="text-gray-500">Hour:</span>
                <span className="ml-1 font-medium">{parsed.hour}</span>
              </div>
              <div>
                <span className="text-gray-500">Day:</span>
                <span className="ml-1 font-medium">{parsed.day}</span>
              </div>
              <div>
                <span className="text-gray-500">Month:</span>
                <span className="ml-1 font-medium">{parsed.month}</span>
              </div>
              <div>
                <span className="text-gray-500">Day of Week:</span>
                <span className="ml-1 font-medium">{parsed.dayOfWeek}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Human readable: </span>
              <span className="text-xs font-medium text-gray-700">{parsed.human}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cron Guide */}
      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
        <div className="text-xs font-medium text-blue-800 mb-2">Cron Expression Guide:</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div><code className="bg-white px-1 py-0.5 rounded">*</code> = Any value (every)</div>
          <div><code className="bg-white px-1 py-0.5 rounded">,</code> = Value list separator</div>
          <div><code className="bg-white px-1 py-0.5 rounded">-</code> = Range of values</div>
          <div><code className="bg-white px-1 py-0.5 rounded">/</code> = Step values</div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          <div>Minute: 0-59 | Hour: 0-23 | Day: 1-31 | Month: 1-12 | Day of Week: 0-7 (0 and 7 are Sunday)</div>
        </div>
      </div>
    </div>
  );
}
