'use client';

/**
 * NotificationSettings Component
 * User preferences modal for email notifications
 */

import React, { useState, useEffect } from 'react';

interface NotificationPreferences {
  id?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notifyOnStart: boolean;
  emailAddress: string;
  workflowId?: string | null;
}

interface NotificationSettingsProps {
  workflowId?: string;
  workflowName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettings({
  workflowId,
  workflowName,
  isOpen,
  onClose
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: false,
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notifyOnStart: false,
    emailAddress: '',
    workflowId: workflowId || null
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch preferences on mount or when workflowId changes
  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen, workflowId]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = workflowId
        ? `/api/notifications/preferences?workflowId=${workflowId}`
        : '/api/notifications/preferences';

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setPreferences(data.preferences);
      } else {
        setError(data.error || 'Failed to load preferences');
      }
    } catch (err) {
      setError('Failed to load preferences');
      console.error('[NotificationSettings] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      setError('Failed to save preferences');
      console.error('[NotificationSettings] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      emailAddress: e.target.value
    });
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Notification Settings
            </h2>
            {workflowName && (
              <p className="text-sm text-gray-500 mt-1">
                For workflow: <span className="font-medium">{workflowName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={preferences.emailAddress}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  disabled={!preferences.emailEnabled}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Notifications will be sent to this email address
                </p>
              </div>

              {/* Email Enabled Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-xs text-gray-500">Enable or disable all email notifications</p>
                </div>
                <button
                  onClick={() => handleToggle('emailEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Notification Types */}
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-900">Notification Types</h3>
                
                {/* Notify on Start */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Workflow Started</p>
                      <p className="text-xs text-gray-500">Get notified when workflow begins execution</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('notifyOnStart')}
                    disabled={!preferences.emailEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !preferences.emailEnabled ? 'bg-gray-100 cursor-not-allowed' :
                      preferences.notifyOnStart ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        !preferences.emailEnabled ? 'translate-x-1' :
                        preferences.notifyOnStart ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Notify on Success */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Workflow Completed</p>
                      <p className="text-xs text-gray-500">Get notified when workflow finishes successfully</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('notifyOnSuccess')}
                    disabled={!preferences.emailEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !preferences.emailEnabled ? 'bg-gray-100 cursor-not-allowed' :
                      preferences.notifyOnSuccess ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        !preferences.emailEnabled ? 'translate-x-1' :
                        preferences.notifyOnSuccess ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Notify on Failure */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Workflow Failed</p>
                      <p className="text-xs text-gray-500">Get notified when workflow encounters an error</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('notifyOnFailure')}
                    disabled={!preferences.emailEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !preferences.emailEnabled ? 'bg-gray-100 cursor-not-allowed' :
                      preferences.notifyOnFailure ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        !preferences.emailEnabled ? 'translate-x-1' :
                        preferences.notifyOnFailure ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Email Template Preview */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Email Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Subject Line:</div>
                  <div className="text-sm font-medium text-gray-900 mb-3">
                    {preferences.notifyOnStart && '🚀 Your workflow is now running'}
                    {preferences.notifyOnSuccess && '✅ Workflow completed successfully'}
                    {preferences.notifyOnFailure && '❌ Workflow failed'}
                    {!preferences.notifyOnStart && !preferences.notifyOnSuccess && !preferences.notifyOnFailure && 
                      'No notifications enabled'}
                  </div>
                  <div className="text-xs text-gray-500">
                    You'll receive beautifully formatted HTML emails with execution details, 
                    error messages, and troubleshooting tips.
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  ✓ Preferences saved successfully!
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
