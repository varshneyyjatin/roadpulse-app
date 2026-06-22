import { useState, useEffect, useMemo } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../utils/notificationApi';
import { DEFAULT_PREFERENCES } from '../../utils/notificationHelpers';
import { canManageNotificationPreferences } from '../../utils/userRole';
import { showToast } from '../../utils/toast';
import Loader from '../common/Loader';

const ALERT_OPTIONS = [
  {
    key: 'alert_blacklist',
    label: 'Blacklist',
    hint: 'Blacklisted vehicles',
    accent: 'red',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
  },
  {
    key: 'alert_whitelist',
    label: 'Whitelist',
    hint: 'Whitelisted vehicles',
    accent: 'green',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    key: 'alert_unlisted',
    label: 'Unlisted',
    hint: 'Normal / not on watchlist',
    accent: 'slate',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    ),
  },
];

const themes = {
  red: {
    activeBg: 'bg-red-500/10 dark:bg-red-500/15',
    activeIcon: 'bg-red-500 text-white shadow-sm shadow-red-500/25',
    idleIcon: 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500',
    toggleOn: 'bg-red-500',
    labelOn: 'text-red-700 dark:text-red-300',
  },
  green: {
    activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    activeIcon: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25',
    idleIcon: 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500',
    toggleOn: 'bg-emerald-500',
    labelOn: 'text-emerald-700 dark:text-emerald-300',
  },
  slate: {
    activeBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    activeIcon: 'bg-violet-600 text-white shadow-sm shadow-violet-500/25',
    idleIcon: 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500',
    toggleOn: 'bg-violet-600',
    labelOn: 'text-violet-700 dark:text-violet-300',
  },
};

const Toggle = ({ checked, onChange, onClass }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`relative h-[22px] w-[40px] rounded-full transition-colors duration-300 ease-out ${
      checked ? onClass : 'bg-gray-200/90 dark:bg-slate-600'
    }`}
  >
    <span
      className={`absolute top-[3px] left-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
        checked ? 'translate-x-[18px]' : 'translate-x-0'
      }`}
    />
  </button>
);

/** Settings-only: vehicle detection alert preferences (Manager & Creator) */
const NotificationAlertPreferences = () => {
  const { user } = useAccessControl();

  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);
  const [savedPrefs, setSavedPrefs] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canManageNotificationPreferences(user)) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getNotificationPreferences();
        if (!cancelled) {
          setPrefs(data);
          setSavedPrefs(data);
        }
      } catch {
        if (!cancelled) {
          setPrefs(DEFAULT_PREFERENCES);
          setSavedPrefs(DEFAULT_PREFERENCES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const canManagePrefs = canManageNotificationPreferences(user);

  const hasChanges = useMemo(
    () => ALERT_OPTIONS.some(({ key }) => prefs[key] !== savedPrefs[key]),
    [prefs, savedPrefs]
  );

  const enabledCount = ALERT_OPTIONS.filter(({ key }) => prefs[key]).length;

  const atLeastOneEnabled = enabledCount > 0;

  const handleToggle = (key) => {
    setError('');
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!atLeastOneEnabled) {
      setError('Enable at least one alert type.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const data = await updateNotificationPreferences(prefs);
      setPrefs(data);
      setSavedPrefs(data);
      showToast('Alert preferences saved', 'success');
    } catch (err) {
      const msg = err.message || 'At least one alert type must be enabled.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!canManagePrefs) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader message="" showDots={false} />
      </div>
    );
  }

  const statusContent = () => {
    if (error) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </span>
      );
    }
    if (!atLeastOneEnabled) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Select at least one type
        </span>
      );
    }
    if (hasChanges) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Unsaved changes
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Up to date · {enabledCount} active
      </span>
    );
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Vehicle detection alerts
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
        Choose which detections trigger in-app alerts. Limited to your assigned locations and checkpoints.
      </p>

      <div className="rounded-xl border border-gray-200/90 dark:border-slate-600/90 overflow-hidden bg-white dark:bg-slate-800/40 shadow-sm">
        <div className="grid grid-cols-3 divide-x divide-gray-200/80 dark:divide-slate-600/80">
          {ALERT_OPTIONS.map(({ key, label, hint, accent, icon }) => {
            const on = !!prefs[key];
            const t = themes[accent];

            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                title={hint}
                onClick={() => handleToggle(key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(key);
                  }
                }}
                className={`group flex flex-col items-center gap-2.5 px-2 py-4 cursor-pointer transition-colors duration-200 ${
                  on ? t.activeBg : 'hover:bg-gray-50/80 dark:hover:bg-slate-700/30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    on ? t.activeIcon : t.idleIcon
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>

                <span
                  className={`text-xs font-semibold tracking-tight transition-colors ${
                    on ? t.labelOn : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {label}
                </span>

                <Toggle
                  checked={on}
                  onChange={() => handleToggle(key)}
                  onClass={t.toggleOn}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-t border-gray-200/80 dark:border-slate-600/80 bg-gray-50/60 dark:bg-slate-800/60">
          <div className="min-w-0 flex-1">{statusContent()}</div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges || !atLeastOneEnabled}
            className="flex-shrink-0 px-4 py-1.5 text-xs font-semibold tracking-wide rounded-lg transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-sm disabled:shadow-none disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-600 dark:disabled:text-slate-400"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationAlertPreferences;
