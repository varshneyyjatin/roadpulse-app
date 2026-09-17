import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import { handleApiError } from '../../utils/apiErrorHandler';
import { useAccessControl } from '../../contexts/AccessControl';
import { showToast } from '../../utils/toast';
import { FullPageLoader } from '../common/Loader';
import ErrorState from '../common/ErrorState';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

// Turns a FastAPI error body into a readable message. 422s come back as
// detail: [{ loc: ["body", "medium"], msg: "...", type: "..." }, ...]
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
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
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
                      ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {value === option.value && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-600 dark:bg-teal-400 rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      value === option.value ? 'bg-teal-600 dark:bg-teal-400' : 'bg-gray-300 dark:bg-slate-600'
                    }`} />
                    <span className={`text-sm flex-1 ${
                      value === option.value
                        ? 'font-semibold text-teal-600 dark:text-teal-400'
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
      checked ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'
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
  'w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all';

const TRIGGER_VIA_OPTIONS = [
  { value: 'api', label: 'api' },
  { value: 'mqtt', label: 'mqtt' },
  { value: 'other', label: 'other' },
];
const QOS_OPTIONS = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
];
const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2';
const textareaClass =
  'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm transition-all resize-none';

const EMPTY_FORM = {
  configName: '',
  medium: '',
  enabled: false,
  triggerVia: '',
  apiUrl: '',
  apiTimeout: '5',
  apiHeadersText: '{}',
  mqttTopic: '',
  mqttQos: '1',
  mqttHost: '',
  mqttPort: '1883',
  otherConfigText: '{}',
  conditionText: '',
};

const buildTriggerConfigFromForm = (form) => {
  if (form.triggerVia === 'api') {
    return {
      url: form.apiUrl || '',
      timeout: parseInt(form.apiTimeout || '5', 10),
      headers: JSON.parse(form.apiHeadersText || '{}'),
    };
  }
  if (form.triggerVia === 'mqtt') {
    return {
      topic: form.mqttTopic || '',
      qos: parseInt(form.mqttQos, 10),
      host: form.mqttHost || '',
      port: parseInt(form.mqttPort || '1883', 10),
    };
  }
  if (form.triggerVia === 'other') {
    return JSON.parse(form.otherConfigText || '{}');
  }
  return null;
};

const formFromConfig = (config) => {
  const via = config.trigger_via || '';
  const tc = config.trigger_config || {};
  return {
    configName: config.config_name || '',
    medium: config.medium || '',
    enabled: !!config.enabled,
    triggerVia: via,
    apiUrl: via === 'api' ? (tc.url || '') : '',
    apiTimeout: via === 'api' ? String(tc.timeout ?? 5) : '5',
    apiHeadersText: via === 'api' ? JSON.stringify(tc.headers || {}, null, 2) : '{}',
    mqttTopic: via === 'mqtt' ? (tc.topic || '') : '',
    mqttQos: via === 'mqtt' ? String(tc.qos ?? 1) : '1',
    mqttHost: via === 'mqtt' ? (tc.host || '') : '',
    mqttPort: via === 'mqtt' ? String(tc.port ?? 1883) : '1883',
    otherConfigText: via === 'other' ? JSON.stringify(tc, null, 2) : '{}',
    conditionText: config.condition ? JSON.stringify(config.condition, null, 2) : '',
  };
};

const TriggerConfigSettings = () => {
  const { user } = useAccessControl();
  const isCreator = user?.role === 'creator';

  const [configs, setConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useBodyScrollLock(showFormModal || !!deleteTarget);

  useEffect(() => {
    if (isCreator) fetchConfigs();
    else setLoading(false);
  }, [isCreator]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/trigger-configs`);
      if (!res.ok) { const e = new Error(); e.response = { status: res.status }; throw e; }
      const data = await res.json();
      setConfigs(data.trigger_configs || []);
    } catch (err) {
      setError(handleApiError(err).error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConfigs = configs.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.config_name || '').toLowerCase().includes(q) ||
      c.medium.toLowerCase().includes(q) ||
      (c.trigger_via || '').toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingConfig(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (config) => {
    setEditingConfig(config);
    setForm(formFromConfig(config));
    setFormError('');
    setShowFormModal(true);
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.medium.trim()) {
      setFormError('Medium is required.');
      return;
    }

    let triggerConfig = null;
    let condition = null;
    try {
      triggerConfig = buildTriggerConfigFromForm(form);
    } catch {
      setFormError('Trigger Config fields contain invalid JSON (check Headers / Other).');
      return;
    }
    try {
      condition = form.conditionText.trim() ? JSON.parse(form.conditionText) : null;
    } catch {
      setFormError('Condition field is not valid JSON.');
      return;
    }

    const payload = {
      config_name: form.configName || null,
      medium: form.medium.trim(),
      enabled: form.enabled,
      condition,
      trigger_via: form.triggerVia || null,
      trigger_config: triggerConfig,
    };

    setSaving(true);
    try {
      const url = editingConfig
        ? `${import.meta.env.VITE_API_BASE_URL}/trigger-configs/${editingConfig.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/trigger-configs`;
      const res = await fetchWithAuth(url, {
        method: editingConfig ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(formatApiError(errData, 'Failed to save trigger config'));
      }
      showToast(editingConfig ? 'Trigger config updated successfully!' : 'Trigger config created successfully!', 'success');
      setShowFormModal(false);
      await fetchConfigs();
    } catch (err) {
      showToast(err.message || 'Failed to save trigger config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/trigger-configs/${deleteTarget.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(formatApiError(errData, 'Failed to delete trigger config'));
      }
      showToast('Trigger config deleted successfully!', 'success');
      setDeleteTarget(null);
      await fetchConfigs();
    } catch (err) {
      showToast(err.message || 'Failed to delete trigger config', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Access gate ────────────────────────────────────────────────────────────
  if (!isCreator) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Only Creator users can access Trigger Config Settings.</p>
      </div>
    );
  }

  if (loading) return <FullPageLoader message="Loading Trigger Configs" />;

  if (error) {
    return (
      <ErrorState
        title={error.title}
        message={error.message}
        icon={error.icon}
        statusCode={error.statusCode}
        onRetry={fetchConfigs}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trigger Config Library</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {searchQuery ? (
                    <span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{filteredConfigs.length}</span> of {configs.length} configs
                    </span>
                  ) : (
                    <span><span className="font-semibold">{configs.length}</span> total configs</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex-1 relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, medium, trigger via..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white placeholder-gray-400 text-sm transition-all shadow-sm"
              />
            </div>

            <button
              onClick={openCreateModal}
              className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Trigger Config
            </button>
          </div>
        </div>

        {configs.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Trigger Configs Yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create one to reuse it when setting up connected cameras.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Medium</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trigger Via</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Enabled</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Shared By</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredConfigs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No trigger configs found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
                    </td>
                  </tr>
                ) : (
                  filteredConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-gray-900 dark:text-white block">
                          {config.config_name || <span className="italic text-gray-400 font-normal">(unnamed)</span>}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{config.id}</span>
                      </td>
                      <td className="py-4 px-6"><span className="text-sm text-gray-700 dark:text-gray-300">{config.medium}</span></td>
                      <td className="py-4 px-6"><span className="text-sm text-gray-700 dark:text-gray-300">{config.trigger_via || '-'}</span></td>
                      <td className="py-4 px-6">
                        {config.enabled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400">
                          {config.shared_by_count}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(config)}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(config)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full my-8">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingConfig ? 'Update Trigger Config' : 'New Trigger Config'}
                </h3>
                <button type="button" onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Config Name <span className="text-xs text-gray-400 font-normal">optional</span></label>
                    <input
                      type="text"
                      value={form.configName}
                      onChange={(e) => updateField('configName', e.target.value)}
                      placeholder="e.g. MQTT push - default"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Medium <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      list="triggerConfigMediumOptions"
                      value={form.medium}
                      onChange={(e) => updateField('medium', e.target.value)}
                      placeholder="camera / boom_barrier / other"
                      className={inputClass}
                    />
                    <datalist id="triggerConfigMediumOptions">
                      <option value="camera" />
                      <option value="boom_barrier" />
                      <option value="other" />
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <CustomDropdown
                      label="Trigger Via"
                      name="triggerVia"
                      value={form.triggerVia}
                      onChange={(_, val) => updateField('triggerVia', val)}
                      options={TRIGGER_VIA_OPTIONS}
                      placeholder="-- select --"
                      showSearch={false}
                    />
                  </div>
                  <div className="flex items-center gap-3 pb-2.5">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enabled</span>
                    <Toggle checked={form.enabled} onChange={(val) => updateField('enabled', val)} />
                  </div>
                </div>

                {form.triggerVia === 'api' && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>URL</label>
                        <input type="text" value={form.apiUrl} onChange={(e) => updateField('apiUrl', e.target.value)} placeholder="https://..." className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Timeout (sec)</label>
                        <input type="number" value={form.apiTimeout} onChange={(e) => updateField('apiTimeout', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Headers <span className="text-xs text-gray-400 font-normal">JSON</span></label>
                      <textarea rows={3} value={form.apiHeadersText} onChange={(e) => updateField('apiHeadersText', e.target.value)} className={`${textareaClass} border-gray-300 dark:border-slate-600`} />
                    </div>
                  </div>
                )}

                {form.triggerVia === 'mqtt' && (
                  <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Topic</label>
                        <input type="text" value={form.mqttTopic} onChange={(e) => updateField('mqttTopic', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <CustomDropdown
                          label="QoS"
                          name="mqttQos"
                          value={form.mqttQos}
                          onChange={(_, val) => updateField('mqttQos', val)}
                          options={QOS_OPTIONS}
                          showSearch={false}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Host</label>
                        <input type="text" value={form.mqttHost} onChange={(e) => updateField('mqttHost', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Port</label>
                        <input type="number" value={form.mqttPort} onChange={(e) => updateField('mqttPort', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>
                )}

                {form.triggerVia === 'other' && (
                  <div>
                    <label className={labelClass}>Trigger Config <span className="text-xs text-gray-400 font-normal">JSON</span></label>
                    <textarea rows={4} value={form.otherConfigText} onChange={(e) => updateField('otherConfigText', e.target.value)} className={`${textareaClass} border-gray-300 dark:border-slate-600`} />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Condition <span className="text-xs text-gray-400 font-normal">JSON, optional</span></label>
                  <textarea
                    rows={3}
                    value={form.conditionText}
                    onChange={(e) => updateField('conditionText', e.target.value)}
                    placeholder="{}"
                    className={`${textareaClass} border-gray-300 dark:border-slate-600`}
                  />
                </div>

                {formError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-red-700 dark:text-red-400">{formError}</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {saving ? 'Saving…' : editingConfig ? 'Save Changes' : 'Create Config'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Trigger Config?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Delete <span className="font-semibold">{deleteTarget.config_name || `#${deleteTarget.id}`}</span>? This cannot be undone.
              </p>
              {deleteTarget.shared_by_count > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
                  This is still linked to {deleteTarget.shared_by_count} connected camera(s) - deletion will be blocked until they're detached.
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriggerConfigSettings;
