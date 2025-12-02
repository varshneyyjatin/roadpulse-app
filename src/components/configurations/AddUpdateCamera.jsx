import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import { handleApiError } from '../../utils/apiErrorHandler';
import { useAccessControl } from '../../contexts/AccessControl';
import { showToast } from '../../utils/toast';

// Custom Dropdown Component
const CustomDropdown = ({ label, value, onChange, options, placeholder, icon, showSearch = true, required = false, disabled = false, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)) {
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
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        )}
        <span className={`text-sm flex-1 text-left ${value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="absolute z-50 left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700">
          {/* Search Box */}
          {showSearch && options.length > 5 && (
            <div className="p-3 border-b border-gray-200 dark:border-slate-700">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Options List */}
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
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 dark:bg-purple-400 rounded-r-full"></div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      value === option.value
                        ? 'bg-purple-600 dark:bg-purple-400'
                        : 'bg-gray-300 dark:bg-slate-600'
                    }`}></div>

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

const AddUpdateCamera = ({ camera, onBack, onSuccess }) => {
  const { accessControl } = useAccessControl();
  const isEditMode = !!camera;
  
  // Solution type state
  const [solutionType, setSolutionType] = useState('camera'); // 'camera' or 'box'
  
  // Camera brands list
  const cameraBrands = [
    'Hikvision',
    'Dahua',
    'CP Plus',
    'Honeywell',
    'Other'
  ];

  // Camera types
  const cameraTypes = [
    { value: 'ANPR', label: 'ANPR' },
    { value: 'IP', label: 'IP Camera' },
    { value: 'Analog', label: 'Analog Camera' }
  ];
  
  // Form state
  const [formData, setFormData] = useState({
    checkpoint_id: '',
    location_id: '',
    box_id: '',
    device_id: '',
    camera_name: '',
    camera_type: 'ANPR',
    camera_model: '',
    fps: 25,
    ip_address: '',
    username: '',
    password: '',
    roi: '',
    loi: '',
    disabled: false,
    remarks: ''
  });

  // Dropdown data
  const [checkpoints, setCheckpoints] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get locations from access control
  const locations = accessControl?.locations || [];

  useEffect(() => {
    if (camera) {
      setFormData({
        checkpoint_id: camera.checkpoint_id ? camera.checkpoint_id.toString() : '',
        location_id: camera.location_id ? camera.location_id.toString() : '',
        box_id: camera.box_id ? camera.box_id.toString() : '',
        device_id: camera.device_id || '',
        camera_name: camera.camera_name || '',
        camera_type: camera.camera_type || 'ANPR',
        camera_model: camera.camera_model || '',
        fps: camera.fps || 25,
        ip_address: camera.ip_address || '',
        username: camera.username || '',
        password: '',
        roi: camera.roi ? JSON.stringify(camera.roi) : '',
        loi: camera.loi ? JSON.stringify(camera.loi) : '',
        disabled: camera.disabled || false,
        remarks: camera.remarks || ''
      });
      setSolutionType(camera.box_id ? 'box' : 'camera');
    }
  }, [camera]);

  useEffect(() => {
    if (formData.location_id) {
      // Get checkpoints and boxes from selected location in access control
      const selectedLocation = locations.find(loc => loc.location_id === parseInt(formData.location_id));
      setCheckpoints(selectedLocation?.checkpoints || []);
      setBoxes(selectedLocation?.compute_boxes || []);
    } else {
      setCheckpoints([]);
      setBoxes([]);
    }
  }, [formData.location_id, locations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBoxSelect = (name, boxId) => {
    const selectedBox = boxes.find(box => box.box_id === parseInt(boxId));
    if (selectedBox) {
      setFormData(prev => ({
        ...prev,
        box_id: boxId,
        device_id: selectedBox.box_device_id || selectedBox.device_id || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare payload based on API requirements
      const payload = {
        location_id: parseInt(formData.location_id),
        camera_name: formData.camera_name || null,
        camera_type: formData.camera_type,
        camera_model: formData.camera_model || null, // This is actually camera brand
        fps: formData.fps,
        disabled: formData.disabled,
        remarks: formData.remarks || null
      };

      // Add checkpoint_id if provided
      if (formData.checkpoint_id) {
        payload.checkpoint_id = parseInt(formData.checkpoint_id);
      }

      // Add either device_id or box_id based on solution type
      if (solutionType === 'box' && formData.box_id) {
        payload.box_id = parseInt(formData.box_id);
      } else {
        payload.device_id = formData.device_id;
      }

      // Add network credentials (required for both solutions)
      payload.ip_address = formData.ip_address;
      payload.username = formData.username;
      if (formData.password) {
        payload.password = formData.password;
      }

      // Parse JSON fields if provided
      if (formData.roi) {
        try {
          payload.roi = JSON.parse(formData.roi);
        } catch (e) {
          setError('Invalid ROI JSON format');
          setLoading(false);
          return;
        }
      }

      if (formData.loi) {
        try {
          payload.loi = JSON.parse(formData.loi);
        } catch (e) {
          setError('Invalid LOI JSON format');
          setLoading(false);
          return;
        }
      }

      // Add camera_id for update
      if (isEditMode && camera.camera_id) {
        payload.camera_id = camera.camera_id;
      }

      const url = `${import.meta.env.VITE_API_BASE_URL}/configuration/camera`;

      const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to ${isEditMode ? 'update' : 'add'} camera`);
      }

      // Success toast
      showToast(
        isEditMode ? 'Camera updated successfully!' : 'Camera added successfully!',
        'success'
      );

      onSuccess();
      onBack();
    } catch (err) {
      const errorInfo = handleApiError(err);
      const errorMessage = errorInfo.error.message;
      setError(errorMessage);
      
      // Error toast
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Solution Type Selection */}
        {!isEditMode && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Solution Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 px-4 py-4 border-2 rounded-lg cursor-pointer transition-all ${
                  solutionType === 'camera'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-slate-600 hover:border-purple-300'
                }`}>
                <input
                  type="radio"
                  name="solutionType"
                  value="camera"
                  checked={solutionType === 'camera'}
                  onChange={(e) => setSolutionType(e.target.value)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Camera Solution</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Direct camera connection</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 px-4 py-4 border-2 rounded-lg cursor-pointer transition-all ${
                  solutionType === 'box'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-slate-600 hover:border-purple-300'
                }`}>
                <input
                  type="radio"
                  name="solutionType"
                  value="box"
                  checked={solutionType === 'box'}
                  onChange={(e) => setSolutionType(e.target.value)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Box Solution</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Via compute box</p>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Location */}
            <CustomDropdown
              name="location_id"
              label="Location"
              value={formData.location_id}
              onChange={handleDropdownChange}
              options={locations.map(loc => ({
                value: loc.location_id.toString(),
                label: loc.location_name
              }))}
              placeholder="Select Location"
              required={true}
              icon={<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>}
            />

            {/* Checkpoint */}
            <CustomDropdown
              name="checkpoint_id"
              label="Checkpoint"
              value={formData.checkpoint_id}
              onChange={handleDropdownChange}
              options={checkpoints.map(cp => ({
                value: cp.checkpoint_id.toString(),
                label: cp.checkpoint_name
              }))}
              placeholder="Select Checkpoint"
              required={true}
              disabled={!formData.location_id}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />}
            />

            {/* Box Selection (only for box solution) */}
            {solutionType === 'box' && (
              <CustomDropdown
                name="box_id"
                label="Compute Box"
                value={formData.box_id}
                onChange={handleBoxSelect}
                options={boxes.map(box => ({
                  value: box.box_id.toString(),
                  label: `${box.box_name} (${box.ip_address})`
                }))}
                placeholder="Select Compute Box"
                required={true}
                disabled={!formData.location_id}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />}
              />
            )}

            {/* Device ID (only for camera solution) */}
            {solutionType === 'camera' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Device ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="device_id"
                  value={formData.device_id}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., CAM-001"
                  className="w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Camera Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Camera Name
              </label>
              <input
                type="text"
                name="camera_name"
                value={formData.camera_name}
                onChange={handleInputChange}
                placeholder="e.g., Main Entrance Camera"
                className="w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Camera Type */}
            <CustomDropdown
              name="camera_type"
              label="Camera Type"
              value={formData.camera_type}
              onChange={handleDropdownChange}
              options={cameraTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
              placeholder="Select Type"
              required={true}
              showSearch={false}
              icon={<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></>}
            />

            {/* Camera Model (Brand) */}
            <CustomDropdown
              name="camera_model"
              label="Camera Model"
              value={formData.camera_model}
              onChange={handleDropdownChange}
              options={cameraBrands.map(brand => ({
                value: brand,
                label: brand
              }))}
              placeholder="Select Model"
              icon={<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></>}
            />
        </div>

        {/* Network fields - For both Camera and Box Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* IP Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              IP Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ip_address"
              value={formData.ip_address}
              onChange={handleInputChange}
              required
              placeholder="e.g., 192.168.1.100"
              className="w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="e.g., admin"
              className="w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
              {isEditMode && <span className="text-xs text-gray-500 ml-2">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!isEditMode}
              placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
              className="w-full px-4 h-[42px] border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* ROI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ROI (Region of Interest) <span className="text-xs text-gray-500">JSON format</span>
              </label>
              <textarea
                name="roi"
                value={formData.roi}
                onChange={handleInputChange}
                placeholder='e.g., {"x": 0, "y": 0, "width": 100, "height": 100}'
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            {/* LOI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                LOI (Line of Interest) <span className="text-xs text-gray-500">JSON format</span>
              </label>
              <textarea
                name="loi"
                value={formData.loi}
                onChange={handleInputChange}
                placeholder='e.g., {"points": [[0,0], [100,100]]}'
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isEditMode ? 'Update Camera' : 'Add Camera'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUpdateCamera;
