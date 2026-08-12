import { useState } from 'react';

const MaintenanceBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/60 dark:from-amber-900/20 dark:via-amber-900/15 dark:to-orange-900/10 border-b border-amber-200/70 dark:border-amber-800/50 shadow-sm">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 rounded-lg flex items-center justify-center shadow-sm shadow-amber-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 tracking-tight">
            Scheduled Maintenance in Progress
          </p>
          <p className="text-xs text-amber-700/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
            Some data displayed during this period may be temporarily inaccurate or incomplete. Our team is actively working to resolve this at the earliest and expects normal service to resume shortly.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notice"
          className="flex-shrink-0 p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100/60 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-800/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
