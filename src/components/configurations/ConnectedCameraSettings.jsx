import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import { handleApiError } from '../../utils/apiErrorHandler';
import { useAccessControl } from '../../contexts/AccessControl';
import { showToast } from '../../utils/toast';
import { FullPageLoader } from '../common/Loader';
import ErrorState from '../common/ErrorState';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

// Turns a FastAPI error body into a readable message. 422s come back as
// detail: [{ loc: ["body", "devices", 0, "port"], msg: "...", type: "..." }, ...]
// while our own HTTPExceptions send detail as a plain string - handle both.
const formatApiError = (errData, fallback) => {
  const detail = errData?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((d) => {
        const loc = Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join(' → ') : '';
        return loc ? `${loc}: ${d.msg}` : d.msg;
      })
      .join('; ');
  }
  return fallback;
};

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

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((opt) =>
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
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-slate-600'
        }`}
      >
        {icon && (
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        )}
        <span className={`text-sm flex-1 text-left truncate ${value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
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
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
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
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {value === option.value && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      value === option.value ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-slate-600'
                    }`} />
                    <span className={`text-sm flex-1 ${
                      value === option.value
                        ? 'font-semibold text-indigo-600 dark:text-indigo-400'
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
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${
      checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const inputClass =
  'w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all';

let deviceKeySeq = 0;
const newDevice = () => ({
  key: ++deviceKeySeq,
  user_name: '',
  password: '',
  ip_address: '',
  port: '',
  rtsp_path: '',
  purpose: '',
  remarks: '',
  trigger_enabled: true,
});

const triggerConfigLabel = (cfg) =>
  `${cfg.config_name || `${cfg.medium} / ${cfg.trigger_via || '-'}`} (shared by ${cfg.shared_by_count})`;

const ConnectedCameraSettings = () => {
  const { user, accessControl } = useAccessControl();
  const isCreator = user?.role === 'creator';
  const locations = accessControl?.locations || [];

  const [allCameras, setAllCameras] = useState([]);
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [camerasError, setCamerasError] = useState(null);

  const [locationId, setLocationId] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [cameraDetail, setCameraDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [connectedCameras, setConnectedCameras] = useState([]);
  const [loadingConnected, setLoadingConnected] = useState(false);
  const [connectedError, setConnectedError] = useState(null);

  const [allTriggerConfigs, setAllTriggerConfigs] = useState([]);

  // Add modal - create only, trigger config is always "map to existing" (never create new here)
  const [showAddModal, setShowAddModal] = useState(false);
  const [devices, setDevices] = useState([newDevice()]);
  const [reuseCfgId, setReuseCfgId] = useState('');
  const [addError, setAddError] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  // Edit modal - connection details + trigger_enabled + which existing config it maps to
  const [editingDevice, setEditingDevice] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useBodyScrollLock(showAddModal || !!editingDevice || !!deleteTarget);

  useEffect(() => {
    if (!isCreator) { setLoadingCameras(false); return; }
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
    loadTriggerConfigs();
  }, [isCreator]);

  const loadTriggerConfigs = async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/trigger-configs`);
      if (!res.ok) return;
      const data = await res.json();
      setAllTriggerConfigs(data.trigger_configs || []);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    setCameraId('');
    setCameraDetail(null);
    setConnectedCameras([]);
  }, [locationId]);

  useEffect(() => {
    if (!cameraId) { setCameraDetail(null); setConnectedCameras([]); return; }
    loadCameraDetail();
    loadConnectedCameras();
  }, [cameraId]);

  const loadCameraDetail = async () => {
    try {
      setLoadingDetail(true);
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cameras/${cameraId}`);
      if (!res.ok) { const e = new Error(); e.response = { status: res.status }; throw e; }
      setCameraDetail(await res.json());
    } catch (err) {
      showToast(handleApiError(err).error.message, 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadConnectedCameras = async () => {
    try {
      setLoadingConnected(true);
      setConnectedError(null);
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cameras/${cameraId}/connected-cameras`);
      if (!res.ok) { const e = new Error(); e.response = { status: res.status }; throw e; }
      const data = await res.json();
      setConnectedCameras(data.connected_cameras || []);
    } catch (err) {
      setConnectedError(handleApiError(err).error);
    } finally {
      setLoadingConnected(false);
    }
  };

  const camerasForLocation = allCameras.filter((c) => c.location_id === Number(locationId));

  // ── Add modal ────────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setDevices([newDevice()]);
    setReuseCfgId('');
    setAddError('');
    setShowAddModal(true);
  };

  const updateDevice = (key, field, value) => {
    setDevices((prev) => prev.map((d) => (d.key === key ? { ...d, [field]: value } : d)));
  };
  const addDeviceRow = () => setDevices((prev) => [...prev, newDevice()]);
  const removeDeviceRow = (key) => setDevices((prev) => (prev.length === 1 ? prev : prev.filter((d) => d.key !== key)));

  const deviceToPayload = (d) => ({
    user_name: d.user_name || null,
    password: d.password || null,
    ip_address: d.ip_address || null,
    port: d.port ? parseInt(d.port, 10) : null,
    rtsp_path: d.rtsp_path || null,
    extra_data: (d.purpose || d.remarks) ? { purpose: d.purpose, remarks: d.remarks } : null,
    trigger_enabled: d.trigger_enabled,
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');

    const anyTriggerEnabled = devices.some((d) => d.trigger_enabled);
    if (anyTriggerEnabled && !reuseCfgId) {
      setAddError('At least one device has "Trigger Active" on - select a Trigger Config to map, or turn it off for that device.');
      return;
    }

    setAddSaving(true);
    try {
      const triggerConfigId = reuseCfgId ? parseInt(reuseCfgId, 10) : null;

      if (devices.length === 1) {
        const payload = { ...deviceToPayload(devices[0]) };
        if (triggerConfigId) payload.trigger_config_id = triggerConfigId;
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cameras/${cameraId}/connected-cameras`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(formatApiError(errData, 'Failed to add device')); }
      } else {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cameras/${cameraId}/connected-cameras/bulk`, {
          method: 'POST',
          body: JSON.stringify({ trigger_config_id: triggerConfigId, devices: devices.map(deviceToPayload) }),
        });
        if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(formatApiError(errData, 'Failed to add devices')); }
      }

      showToast('Connected camera(s) added successfully!', 'success');
      setShowAddModal(false);
      await Promise.all([loadConnectedCameras(), loadTriggerConfigs()]);
    } catch (err) {
      setAddError(err.message || 'Failed to add connected camera(s)');
    } finally {
      setAddSaving(false);
    }
  };

  // ── Quick toggle ─────────────────────────────────────────────────────────────
  const quickToggle = async (cc) => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cameras/connected-cameras/${cc.id}`, {
        method: 'PUT',
        body: JSON.stringify({ trigger_enabled: !cc.trigger_enabled }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(formatApiError(errData, 'Failed to toggle trigger'));
      }
      await loadConnectedCameras();
    } catch (err) {
      showToast(err.message || 'Failed to toggle trigger', 'error');
    }
  };

  // ── Edit modal (device + trigger mapping, never trigger config content) ──────
  const openEditModal = (cc) => {
    setEditingDevice(cc);
    setEditForm({
      user_name: cc.user_name || '',
      password: '',
      ip_address: cc.ip_address || '',
      port: cc.port || '',
      rtsp_path: cc.rtsp_path || '',
      disabled: cc.disabled,
      trigger_enabled: cc.trigger_enabled,
      trigger_config_id: cc.trigger_config?.id ? String(cc.trigger_config.id) : '',
      purpose: cc.extra_data?.purpose || '',
      remarks: cc.extra_data?.remarks || '',
    });
    setEditError('');
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (editForm.trigger_enabled && !editForm.trigger_config_id) {
      setEditError('Trigger Active is on - select a Trigger Config to map, or turn it off.');
      return;
    }

    setEditSaving(true);
    try {
      const payload = {
        user_name: editForm.user_name || null,
        ip_address: editForm.ip_address || null,
        port: editForm.port ? parseInt(editForm.port, 10) : null,
        rtsp_path: editForm.rtsp_path || null,
        disabled: editForm.disabled,
        trigger_enabled: editForm.trigger_enabled,
        trigger_config_id: editForm.trigger_config_id ? parseInt(editForm.trigger_config_id, 10) : null,
        extra_data: (editForm.purpose || editForm.remarks) ? { purpose: editForm.purpose, remarks: editForm.remarks } : null,
      };
      if (editForm.password) payload.password = editForm.password;

      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cameras/connected-cameras/${editingDevice.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(formatApiError(errData, 'Failed to update device')); }

      showToast('Connected camera updated successfully!', 'success');
      setEditingDevice(null);
      await Promise.all([loadConnectedCameras(), loadTriggerConfigs()]);
    } catch (err) {
      setEditError(err.message || 'Failed to update device');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cameras/connected-cameras/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(formatApiError(errData, 'Failed to delete connected camera')); }
      showToast('Connected camera deleted successfully!', 'success');
      setDeleteTarget(null);
      await Promise.all([loadConnectedCameras(), loadTriggerConfigs()]);
    } catch (err) {
      showToast(err.message || 'Failed to delete connected camera', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Access gate ──────────────────────────────────────────────────────────────
  if (!isCreator) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Only Creator users can access Connected Cameras.</p>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* ── Selector Card ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CustomDropdown
              label="Location"
              name="locationId"
              value={locationId}
              onChange={(_, val) => setLocationId(val)}
              options={locations.map((loc) => ({ value: String(loc.location_id), label: loc.location_name }))}
              placeholder="Select Location"
              icon={
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
              }
            />
          </div>
          <div>
            <CustomDropdown
              label="Camera"
              name="cameraId"
              value={cameraId}
              onChange={(_, val) => setCameraId(val)}
              options={camerasForLocation.map((cam) => ({
                value: String(cam.camera_id),
                label: cam.camera_name ? `${cam.camera_name}${cam.checkpoint_name ? ` — ${cam.checkpoint_name}` : ''}` : cam.device_id,
              }))}
              placeholder={locationId ? 'Select Camera' : 'Select a location first'}
              disabled={!locationId}
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              }
            />
          </div>
        </div>
      </div>

      {cameraId && (
        <>
          {/* ── Camera Details ──────────────────────────────────────────────── */}
          {!loadingDetail && cameraDetail && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{cameraDetail.camera_name || cameraDetail.device_id}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cameraDetail.device_id} · {cameraDetail.location_name}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  cameraDetail.disabled ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}>
                  {cameraDetail.disabled ? 'Disabled' : 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ['Camera Type', cameraDetail.camera_type || '-'],
                  ['Model', cameraDetail.camera_model || '-'],
                  ['IP Address', cameraDetail.ip_address || '-'],
                  ['FPS', cameraDetail.fps ?? '-'],
                  ['RTSP Path', cameraDetail.rtsp_path || '-'],
                  ['Checkpoint', cameraDetail.checkpoint_name || '-'],
                  ['Deployment', cameraDetail.deployment_type || '-'],
                  ['Direction Tracking', cameraDetail.direction_enabled ? 'Enabled' : 'Disabled'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{k}</div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Connected Cameras Table ─────────────────────────────────────── */}
          {loadingConnected ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 flex justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading connected cameras…</span>
            </div>
          ) : connectedError ? (
            <ErrorState title={connectedError.title} message={connectedError.message} icon={connectedError.icon} statusCode={connectedError.statusCode} onRetry={loadConnectedCameras} />
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connected Cameras</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{connectedCameras.length} device(s)</p>
                </div>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Connected Camera(s)
                </button>
              </div>

              {connectedCameras.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No connected cameras yet for this camera.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Device</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trigger Config</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Config Enabled</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Active Here</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Shared By</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {connectedCameras.map((cc) => {
                        const cfg = cc.trigger_config;
                        return (
                          <tr key={cc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="py-4 px-6">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{cc.ip_address || '-'}{cc.port ? `:${cc.port}` : ''}</div>
                              <div className="text-xs text-gray-400">#{cc.id}{cc.user_name ? ` · ${cc.user_name}` : ''}</div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                              {cfg ? (cfg.config_name || `${cfg.medium} / ${cfg.trigger_via || '-'}`) : <span className="text-gray-400 italic">not mapped</span>}
                            </td>
                            <td className="py-4 px-6">
                              {cfg ? (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.enabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                                  {cfg.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cc.trigger_enabled ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                                {cc.trigger_enabled ? 'Active' : 'Off'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {cfg ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                                  {cfg.shared_by_count}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => quickToggle(cc)} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors">
                                  {cc.trigger_enabled ? 'Turn Off' : 'Turn On'}
                                </button>
                                <button onClick={() => openEditModal(cc)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded-lg transition-colors">
                                  Edit
                                </button>
                                <button onClick={() => setDeleteTarget(cc)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg transition-colors">
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Add Connected Camera(s) Modal ───────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full my-8">
            <form onSubmit={handleAddSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Connected Camera(s)</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                <div className="space-y-3">
                  {devices.map((d, idx) => (
                    <div key={d.key} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50 dark:bg-slate-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Device #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Trigger Active</span>
                          <Toggle checked={d.trigger_enabled} onChange={(val) => updateDevice(d.key, 'trigger_enabled', val)} />
                          {devices.length > 1 && (
                            <button type="button" onClick={() => removeDeviceRow(d.key)} className="text-xs text-red-600 dark:text-red-400 font-medium">Remove</button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input placeholder="Username" value={d.user_name} onChange={(e) => updateDevice(d.key, 'user_name', e.target.value)} className={inputClass} />
                        <input placeholder="Password" value={d.password} onChange={(e) => updateDevice(d.key, 'password', e.target.value)} className={inputClass} />
                        <input placeholder="IP Address" value={d.ip_address} onChange={(e) => updateDevice(d.key, 'ip_address', e.target.value)} className={inputClass} />
                        <input placeholder="Port" type="number" value={d.port} onChange={(e) => updateDevice(d.key, 'port', e.target.value)} className={inputClass} />
                        <input placeholder="RTSP Path" value={d.rtsp_path} onChange={(e) => updateDevice(d.key, 'rtsp_path', e.target.value)} className={inputClass} />
                        <input placeholder="Purpose (optional)" value={d.purpose} onChange={(e) => updateDevice(d.key, 'purpose', e.target.value)} className={inputClass} />
                        <input placeholder="Remarks (optional)" value={d.remarks} onChange={(e) => updateDevice(d.key, 'remarks', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addDeviceRow} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">+ Add another device</button>
                </div>

                {devices.some((d) => d.trigger_enabled) && (
                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <CustomDropdown
                      label="Trigger Config"
                      name="reuseCfgId"
                      value={reuseCfgId}
                      onChange={(_, val) => setReuseCfgId(val)}
                      options={allTriggerConfigs.map((cfg) => ({ value: String(cfg.id), label: triggerConfigLabel(cfg) }))}
                      placeholder="-- none --"
                    />
                    <p className="text-xs text-gray-400 font-normal mt-1.5">Map to an existing config from the library - required since at least one device above has Trigger Active on</p>
                    {allTriggerConfigs.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        No trigger configs exist yet - create one first in Trigger Config Settings.
                      </p>
                    )}
                  </div>
                )}

                {addError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-400">{addError}</div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={addSaving} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 font-medium">
                  {addSaving ? 'Saving…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editingDevice && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-xl w-full my-8">
            <form onSubmit={submitEdit}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Connected Camera #{editingDevice.id}</h3>
                <button type="button" onClick={() => setEditingDevice(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Username" value={editForm.user_name} onChange={(e) => setEditForm((p) => ({ ...p, user_name: e.target.value }))} className={inputClass} />
                  <input placeholder="Password (leave blank to keep)" value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} className={inputClass} />
                  <input placeholder="IP Address" value={editForm.ip_address} onChange={(e) => setEditForm((p) => ({ ...p, ip_address: e.target.value }))} className={inputClass} />
                  <input placeholder="Port" type="number" value={editForm.port} onChange={(e) => setEditForm((p) => ({ ...p, port: e.target.value }))} className={inputClass} />
                  <input placeholder="RTSP Path" value={editForm.rtsp_path} onChange={(e) => setEditForm((p) => ({ ...p, rtsp_path: e.target.value }))} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Purpose (optional)" value={editForm.purpose} onChange={(e) => setEditForm((p) => ({ ...p, purpose: e.target.value }))} className={inputClass} />
                  <input placeholder="Remarks (optional)" value={editForm.remarks} onChange={(e) => setEditForm((p) => ({ ...p, remarks: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Disabled</span>
                    <Toggle checked={editForm.disabled} onChange={(val) => setEditForm((p) => ({ ...p, disabled: val }))} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trigger Active</span>
                    <Toggle checked={editForm.trigger_enabled} onChange={(val) => setEditForm((p) => ({ ...p, trigger_enabled: val }))} />
                  </div>
                </div>
                {editForm.trigger_enabled && (
                  <div>
                    <CustomDropdown
                      label="Trigger Config"
                      name="editTriggerConfigId"
                      value={editForm.trigger_config_id}
                      onChange={(_, val) => setEditForm((p) => ({ ...p, trigger_config_id: val }))}
                      options={allTriggerConfigs.map((cfg) => ({ value: String(cfg.id), label: triggerConfigLabel(cfg) }))}
                      placeholder="-- none --"
                    />
                    <p className="text-xs text-gray-400 font-normal mt-1.5">Map to an existing config - required while Trigger Active is on</p>
                  </div>
                )}
                {editError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-400">{editError}</div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingDevice(null)} className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={editSaving} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg transition-all shadow-md disabled:opacity-50 font-medium">
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Connected Camera?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Delete device #{deleteTarget.id}? This cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectedCameraSettings;
