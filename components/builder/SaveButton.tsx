'use client';

interface SaveButtonProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
}

export default function SaveButton({ onSave, isSaving, lastSaved }: SaveButtonProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Last Saved Indicator */}
      {lastSaved && (
        <div className="text-xs text-gray-400">
          Saved: {formatTime(lastSaved)}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          flex items-center gap-2
          ${isSaving 
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-blue-500/25'
          }
        `}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Workflow
          </>
        )}
      </button>
    </div>
  );
}
