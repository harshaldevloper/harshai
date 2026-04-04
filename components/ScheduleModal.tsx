// HarshAI - Schedule Modal Component
// Day 28: Background Scheduler (Cron-based Workflow Execution)

'use client';

import { useState, useEffect } from 'react';
import CronPicker from './CronPicker';

interface ScheduleModalProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  currentSchedule?: {
    cronExpression?: string | null;
    scheduleEnabled?: boolean;
    nextRun?: string | null;
    lastRun?: string | null;
  };
  onSave?: () => void;
}

export default function ScheduleModal({
  workflowId,
  isOpen,
  onClose,
  currentSchedule,
  onSave
}: ScheduleModalProps) {
  const [cronExpression, setCronExpression] = useState(
    currentSchedule?.cronExpression || '0 9 * * *'
  );
  const [isEnabled, setIsEnabled] = useState(
    currentSchedule?.scheduleEnabled || false
  );
  const [nextRun, setNextRun] = useState<string | null>(
    currentSchedule?.nextRun || null
  );
  const [lastRun, setLastRun] = useState<string | null>(
    currentSchedule?.lastRun || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCronExpression(currentSchedule?.cronExpression || '0 9 * * *');
      setIsEnabled(currentSchedule?.scheduleEnabled || false);
      setNextRun(currentSchedule?.nextRun || null);
      setLastRun(currentSchedule?.lastRun || null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, currentSchedule]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cronExpression,
          triggerType: 'cron'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save schedule');
      }

      setNextRun(data.nextRun);
      setIsEnabled(true);
      setSuccessMessage('Schedule saved successfully!');
      
      setTimeout(() => {
        onSave?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled,
          cronExpression
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update schedule');
      }

      setNextRun(data.schedule.nextRun);
      setSuccessMessage('Schedule updated successfully!');
      
      setTimeout(() => {
        onSave?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove the schedule? The workflow will no longer run automatically.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove schedule');
      }

      setSuccessMessage('Schedule removed successfully!');
      
      setTimeout(() => {
        onSave?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled';
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Workflow</h2>
              <p className="text-sm text-gray-500 mt-1">
                Set up automated execution for this workflow
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Enable Scheduled Execution</h3>
              <p className="text-sm text-gray-500 mt-1">
                Turn on to run this workflow automatically on a schedule
              </p>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Cron Picker */}
          {isEnabled && (
            <div className="space-y-4">
              <CronPicker
                value={cronExpression}
                onChange={setCronExpression}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Schedule Info */}
          {(nextRun || lastRun) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
              {nextRun && (
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800 font-medium">Next Run:</span>
                  <span className="text-sm text-blue-900">{formatDateTime(nextRun)}</span>
                </div>
              )}
              {lastRun && (
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800 font-medium">Last Run:</span>
                  <span className="text-sm text-blue-900">{formatDateTime(lastRun)}</span>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">Success</p>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          {currentSchedule?.cronExpression && (
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="px-4 py-2 text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
            >
              Remove Schedule
            </button>
          )}
          
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            {isEnabled ? (
              <button
                onClick={currentSchedule?.cronExpression ? handleUpdate : handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : currentSchedule?.cronExpression ? 'Update Schedule' : 'Save Schedule'}
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Disable Schedule'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
