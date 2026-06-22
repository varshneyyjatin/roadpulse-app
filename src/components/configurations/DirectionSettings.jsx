import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import { handleApiError } from '../../utils/apiErrorHandler';
import { useAccessControl } from '../../contexts/AccessControl';
import { showToast } from '../../utils/toast';
import { FullPageLoader } from '../common/Loader';
import ErrorState from '../common/ErrorState';

// ─── CustomDropdown ────────────────────────────────────────────────────────────
const CustomDropdown = ({
  label, value, onChange, options, placeholder,
  icon, showSearch = true, required = false, disabled = false, name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && buttonRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center gap-2 px-4 h-[42px] bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-50 dark:hover:bg-slate-600'
        }`}
      >
        {icon && (
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        )}
        <span className={`text-sm flex-1 text-left ${value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700"
        >
          {showSearch && options.length > 5 && (
            <div className="p-3 border-b border-gray-200 dark:border-slate-700">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>
          )}

          <div className="p-2 max-h-80 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(name, option.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition mb-1 relative ${
                    value === option.value
                      ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {value === option.value && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 dark:bg-purple-400 rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      value === option.value ? 'bg-purple-600 dark:bg-purple-400' : 'bg-gray-300 dark:bg-slate-600'
                    }`} />
                    <span className={`text-sm flex-1 ${
                      value === option.value
                        ? 'font-semibold text-purple-600 dark:text-purple-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No results found</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ─── Default config ────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  approaching: { enable: true, loi: [], name: 'IN' },
  departing:   { enable: true, loi: [], name: 'OUT' },
};

// ─── Main Component ────────────────────────────────────────────────────────────
const DirectionSettings = () => {
  const { accessControl } = useAccessControl();
  const locations = accessControl?.locations || [];

  // All cameras (preloaded once)
  const [allCameras, setAllCameras] = useState([]);
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [camerasError, setCamerasError] = useState(null);

  // Selector state
  const [locationId, setLocationId] = useState('');
  const [cameraId, setCameraId] = useState('');

  // Direction settings for selected camera
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState(null);

  // Form state
  const [directionEnabled, setDirectionEnabled] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loiText, setLoiText] = useState({
    approaching: '[]',
    departing: '[]',
  });
  const [loiError, setLoiError] = useState({ approaching: '', departing: '' });

  // Submit state
  const [saving, setSaving] = useState(false);

  // ── Load cameras once ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCameras(true);
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_BASE_URL}/configuration/assigned-resources`,
          { method: 'POST', body: JSON.stringify({ scope: 'camera' }) }
        );
        if (!res.ok) { const e = new Error(); e.response = { status: res.status }; throw e; }
        const data = await res.json();
        setAllCameras(data.data || []);
      } catch (err) {
        setCamerasError(handleApiError(err).error);
      } finally {
        setLoadingCameras(false);
      }
    };
    load();
  }, []);

  // ── Reset camera when location changes ──────────────────────────────────────
  useEffect(() => {
    setCameraId('');
    setSettings(null);
    setSettingsError(null);
  }, [locationId]);

  // ── Fetch direction settings when camera selected ────────────────────────────
  useEffect(() => {
    if (!cameraId) { setSettings(null); setSettingsError(null); return; }

    const load = async () => {
      try {
        setLoadingSettings(true);
        setSettingsError(null);
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_BASE_URL}/configuration/direction-settings/${cameraId}`
        );
        if (!res.ok) { const e = new Error(); e.response = { status: res.status }; throw e; }
        const data = await res.json();
        setSettings(data);

        const cfg = data.direction_config ?? DEFAULT_CONFIG;
        setDirectionEnabled(data.direction_enabled ?? false);
        setConfig(cfg);
        setLoiText({
          approaching: JSON.stringify(cfg.approaching?.loi ?? [], null, 2),
          departing:   JSON.stringify(cfg.departing?.loi ?? [],   null, 2),
        });
        setLoiError({ approaching: '', departing: '' });
      } catch (err) {
        setSettingsError(handleApiError(err).error);
      } finally {
        setLoadingSettings(false);
      }
    };
    load();
  }, [cameraId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLocationChange = (_, val) => setLocationId(val);
  const handleCameraChange   = (_, val) => setCameraId(val);

  const updateConfigField = (dir, field, value) => {
    setConfig(prev => ({ ...prev, [dir]: { ...prev[dir], [field]: value } }));
  };

  const handleLoiChange = (dir, raw) => {
    setLoiText(prev => ({ ...prev, [dir]: raw }));
    try {
      const parsed = JSON.parse(raw);
      setConfig(prev => ({ ...prev, [dir]: { ...prev[dir], loi: parsed } }));
      setLoiError(prev => ({ ...prev, [dir]: '' }));
    } catch {
      setLoiError(prev => ({ ...prev, [dir]: 'Invalid JSON' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loiError.approaching || loiError.departing) {
      showToast('Please fix the LOI JSON errors before saving.', 'error');
      return;
    }

    setSaving(true);
    try {
      const body = {
        direction_enabled: directionEnabled,
        ...(directionEnabled ? { direction_config: config } : {}),
      };
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/configuration/direction-settings/${cameraId}`,
        { method: 'PUT', body: JSON.stringify(body) }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save direction settings');
      }
      const updated = await res.json();
      setSettings(updated);
      showToast('Direction settings saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save direction settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const camerasForLocation = allCameras.filter(
    c => c.location_id === Number(locationId)
  );

  const locationOptions = locations.map(loc => ({
    value: loc.location_id.toString(),
    label: loc.location_name,
  }));

  const cameraOptions = camerasForLocation.map(cam => ({
    value: cam.camera_id.toString(),
    label: cam.camera_name
      ? `${cam.camera_name}${cam.checkpoint_name ? ` — ${cam.checkpoint_name}` : ''}`
      : cam.device_id,
  }));

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loadingCameras) return <FullPageLoader message="Loading Cameras" />;

  if (camerasError) {
    return (
      <ErrorState
        title={camerasError.title}
        message={camerasError.message}
        icon={camerasError.icon}
        statusCode={camerasError.statusCode}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Selection Card ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomDropdown
            name="location_id"
            label="Location"
            value={locationId}
            onChange={handleLocationChange}
            options={locationOptions}
            placeholder="Select Location"
            required
            icon={
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </>
            }
          />

          <CustomDropdown
            name="camera_id"
            label="Camera"
            value={cameraId}
            onChange={handleCameraChange}
            options={cameraOptions}
            placeholder={locationId ? 'Select Camera' : 'Select a location first'}
            required
            disabled={!locationId}
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            }
          />
        </div>
      </div>

      {/* ── Settings Card ────────────────────────────────────────────────────── */}
      {cameraId && (
        <>
          {/* Loading */}
          {loadingSettings && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 flex justify-center items-center">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm font-medium">Loading direction settings…</span>
              </div>
            </div>
          )}

          {/* Error */}
          {settingsError && !loadingSettings && (
            <ErrorState
              title={settingsError.title}
              message={settingsError.message}
              icon={settingsError.icon}
              statusCode={settingsError.statusCode}
              onRetry={() => setCameraId(prev => { const v = prev; setCameraId(''); setTimeout(() => setCameraId(v), 0); return ''; })}
            />
          )}

          {/* Form */}
          {settings && !loadingSettings && !settingsError && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">

              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {settings.camera_name || settings.device_id}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {settings.device_id} · {settings.location_name}
                    </p>
                  </div>

                  {/* Master Enable Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Direction Tracking
                    </span>
                    <Toggle
                      checked={directionEnabled}
                      onChange={setDirectionEnabled}
                    />
                    <span className={`text-xs font-semibold min-w-[52px] ${
                      directionEnabled
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {directionEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Preserved-config notice */}
                {!directionEnabled && settings.direction_config && (
                  <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Direction tracking is disabled. The existing configuration is preserved and will be reused when re-enabled.
                    </p>
                  </div>
                )}
              </div>

              {/* Direction Config Fields */}
              {directionEnabled && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['approaching', 'departing'].map((dir) => (
                      <div
                        key={dir}
                        className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 space-y-5"
                      >
                        {/* Direction Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              dir === 'approaching'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              <svg
                                className={`w-4 h-4 ${dir === 'approaching' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                {dir === 'approaching'
                                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7M12 3v18" />
                                }
                              </svg>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                              {dir}
                            </span>
                          </div>

                          {/* Per-direction enable toggle */}
                          <div className="flex items-center gap-2">
                            <Toggle
                              checked={config[dir]?.enable ?? true}
                              onChange={(val) => updateConfigField(dir, 'enable', val)}
                            />
                            <span className={`text-xs font-medium ${
                              config[dir]?.enable
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-400'
                            }`}>
                              {config[dir]?.enable ? 'On' : 'Off'}
                            </span>
                          </div>
                        </div>

                        {/* Direction Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Direction Name
                          </label>
                          <input
                            type="text"
                            value={config[dir]?.name ?? ''}
                            onChange={(e) => updateConfigField(dir, 'name', e.target.value)}
                            placeholder={dir === 'approaching' ? 'e.g. IN' : 'e.g. OUT'}
                            disabled={!config[dir]?.enable}
                            className="w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          />
                        </div>

                        {/* LOI */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            LOI Coordinates <span className="text-xs text-gray-400 font-normal">JSON array</span>
                          </label>
                          <textarea
                            rows={4}
                            value={loiText[dir]}
                            onChange={(e) => handleLoiChange(dir, e.target.value)}
                            disabled={!config[dir]?.enable}
                            placeholder="e.g. [[100, 200], [300, 200]]"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none ${
                              loiError[dir]
                                ? 'border-red-400 dark:border-red-600'
                                : 'border-gray-300 dark:border-slate-600'
                            }`}
                          />
                          {loiError[dir] ? (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{loiError[dir]}</p>
                          ) : (
                            <p className="mt-1 text-xs text-gray-400">Array of [x, y] coordinate pairs defining the line</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const cfg = settings.direction_config ?? DEFAULT_CONFIG;
                    setDirectionEnabled(settings.direction_enabled ?? false);
                    setConfig(cfg);
                    setLoiText({
                      approaching: JSON.stringify(cfg.approaching?.loi ?? [], null, 2),
                      departing:   JSON.stringify(cfg.departing?.loi ?? [],   null, 2),
                    });
                    setLoiError({ approaching: '', departing: '' });
                  }}
                  className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </form>
  );
};

export default DirectionSettings;
