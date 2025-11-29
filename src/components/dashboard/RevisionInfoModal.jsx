const RevisionInfoModal = ({ isOpen, onClose, revisionData }) => {
  if (!isOpen || !revisionData) return null;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revision Information</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Number Change Section */}
          <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between">
              {/* Old Number */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Original</p>
                <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 border-2 border-red-200 dark:border-red-800">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{revisionData.old_number}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="px-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* New Number */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Corrected</p>
                <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 border-2 border-green-200 dark:border-green-800">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{revisionData.new_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Change Reason */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Reason</p>
              <p className="text-sm text-gray-900 dark:text-white">{revisionData.change_reason}</p>
            </div>

            {/* Changed By & At */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Changed By</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{revisionData.changed_by}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Changed At</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatTimestamp(revisionData.changed_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionInfoModal;