import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import PageHeader from '../common/PageHeader';
import VehicleDetailsModal from './VehicleDetailsModal';
import Loader from '../common/Loader';
import { handleApiError } from '../../utils/apiErrorHandler';
import { fetchWithAuth } from '../../utils/fetchWrapper';
import CopyButton from '../common/CopyButton';

// ─── Helpers ────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' from a Date object, local timezone */
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'HH:MM' from hours + minutes */
const toTimeStr = (h, m) => `${pad(h)}:${pad(m)}`;

/** Build ISO-like string that the backend schema accepts */
const buildDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  if (!timeStr) return dateStr;                // plain date
  return `${dateStr}T${timeStr}:00`;           // full datetime
};

const FORMAT_DATE = (str) => {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[Number(m) - 1]} ${y}`;
};

// ─── TimePicker ─────────────────────────────────────────────────────────────

const TimePicker = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [h, m] = value ? value.split(':').map(Number) : [0, 0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const display = value ? value : '--:--';

  const hours   = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const hourRef   = useRef(null);
  const minuteRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        hourRef.current?.children[h]?.scrollIntoView({ block: 'center' });
        const mIdx = minutes.indexOf(Math.round(m / 5) * 5);
        minuteRef.current?.children[mIdx >= 0 ? mIdx : 0]?.scrollIntoView({ block: 'center' });
      }, 50);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-mono font-medium transition-all
          ${disabled
            ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer'
          } ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
      >
        <svg className={`w-3.5 h-3.5 ${disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={disabled ? 'text-gray-300 dark:text-gray-600' : value ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}>
          {display}
        </span>
      </button>

      {open && (
        <div className="absolute z-[200] top-full mt-1.5 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden w-36">
          <div className="flex">
            {/* Hours */}
            <div className="flex-1 border-r border-gray-100 dark:border-slate-700">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">HH</div>
              <div ref={hourRef} className="h-40 overflow-y-auto scrollbar-hide">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => { onChange(toTimeStr(hour, m)); }}
                    className={`w-full px-2 py-1.5 text-sm font-mono text-center transition-colors
                      ${h === hour
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                  >
                    {pad(hour)}
                  </button>
                ))}
              </div>
            </div>
            {/* Minutes */}
            <div className="flex-1">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">MM</div>
              <div ref={minuteRef} className="h-40 overflow-y-auto scrollbar-hide">
                {minutes.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => { onChange(toTimeStr(h, min)); setOpen(false); }}
                    className={`w-full px-2 py-1.5 text-sm font-mono text-center transition-colors
                      ${m === min
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                  >
                    {pad(min)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DateRangePicker (with time) ─────────────────────────────────────────────

const DateRangeTimePicker = ({ startDate, endDate, startTime, endTime, onStartDate, onEndDate, onStartTime, onEndTime, onClear }) => {
  const [open, setOpen]         = useState(false);
  const [hoverDate, setHover]   = useState(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = startDate ? new Date(startDate) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [error, setError]       = useState('');
  const ref   = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
        setError('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isSameDay = startDate && endDate && startDate === endDate;
  const timeEnabled = isSameDay;

  // Display label
  const label = useMemo(() => {
    if (!startDate && !endDate) return null;
    const s = FORMAT_DATE(startDate);
    const e = FORMAT_DATE(endDate);
    const st = startTime ? ` ${startTime}` : '';
    const et = endTime   ? ` ${endTime}`   : '';
    if (startDate && endDate) {
      if (isSameDay) return `${s}${st} → ${et || '23:59'}`;
      return `${s} → ${e}`;
    }
    return s ? `From ${s}` : '';
  }, [startDate, endDate, startTime, endTime, isSameDay]);

  const handleDayClick = (dateStr) => {
    setError('');
    if (!startDate || (startDate && endDate)) {
      onStartDate(dateStr);
      onEndDate(null);
      onStartTime('');
      onEndTime('');
    } else {
      if (dateStr < startDate) {
        onEndDate(startDate);
        onStartDate(dateStr);
      } else {
        const diffDays = (new Date(dateStr) - new Date(startDate)) / 86400000;
        if (diffDays >= 90) {
          setError('Range cannot exceed 90 days');
          return;
        }
        onEndDate(dateStr);
      }
    }
  };

  const changeMonth = (dir) => {
    setViewMonth(prev => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0)  { m = 11; y--; }
      return { year: y, month: m };
    });
  };

  const { year, month } = viewMonth;
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDow  = new Date(year, month, 1).getDay();
  const daysInMo  = new Date(year, month + 1, 0).getDate();
  const todayStr  = toDateStr(new Date());

  const getDayState = (dateStr) => {
    const isStart = dateStr === startDate;
    const isEnd   = dateStr === endDate;
    const inRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
    const isHover = hoverDate && startDate && !endDate && dateStr > startDate && dateStr <= hoverDate;
    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;
    return { isStart, isEnd, inRange, isHover, isFuture, isToday };
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all w-full
          bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600
          hover:border-gray-400 dark:hover:border-slate-500
          ${open ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20' : ''}
        `}
      >
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={`flex-1 text-left truncate ${label ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-400'}`}>
          {label || 'Select date range'}
        </span>
        {(startDate || endDate) && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onClear(); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onClear())}
            className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex-shrink-0"
          >
            <svg className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={ref}
          className="absolute z-[200] top-full mt-2 left-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          style={{ minWidth: 340 }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">{MONTH_NAMES[month]} {year}</span>
            <button type="button" onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMo }).map((_, i) => {
              const day     = i + 1;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const { isStart, isEnd, inRange, isHover, isFuture, isToday } = getDayState(dateStr);
              const isSelected = isStart || isEnd;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isFuture}
                  onClick={() => !isFuture && handleDayClick(dateStr)}
                  onMouseEnter={() => !isFuture && setHover(dateStr)}
                  onMouseLeave={() => setHover(null)}
                  className={`relative h-8 w-full flex items-center justify-center text-sm rounded-lg transition-all select-none
                    ${isFuture ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected ? 'bg-blue-600 text-white font-semibold z-10' : ''}
                    ${(inRange || isHover) && !isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-none' : ''}
                    ${isStart && endDate ? 'rounded-l-lg rounded-r-none' : ''}
                    ${isEnd && startDate !== endDate ? 'rounded-r-lg rounded-l-none' : ''}
                    ${!isSelected && !inRange && !isHover && !isFuture ? 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-inset ring-blue-400 dark:ring-blue-500' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* ── Time filter section (only when same day selected) ── */}
          <div className={`border-t border-gray-100 dark:border-slate-700 transition-all ${timeEnabled ? 'opacity-100' : 'opacity-40'}`}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Time Filter</span>
                {!timeEnabled && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">Select same start & end date</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">From</div>
                  <TimePicker value={startTime} onChange={onStartTime} disabled={!timeEnabled} />
                </div>
                <div className="mt-4 text-gray-300 dark:text-gray-600">→</div>
                <div className="flex-1">
                  <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">To</div>
                  <TimePicker value={endTime} onChange={onEndTime} disabled={!timeEnabled} />
                </div>
              </div>

              {timeEnabled && (startTime || endTime) && (
                <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    Filtering {FORMAT_DATE(startDate)} {startTime || '00:00'} – {endTime || '23:59'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
            <button
              type="button"
              onClick={() => { onClear(); setError(''); }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
            >
              Clear all
            </button>
            <button
              type="button"
              disabled={!startDate}
              onClick={() => {
                if (!endDate) {
                  setError('Please select an end date');
                  return;
                }
                setError('');
                setOpen(false);
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MultiSelectDropdown ─────────────────────────────────────────────────────

const MultiSelectDropdown = ({ label, value = [], onChange, options, placeholder, icon }) => {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const allSelected = value.length === options.length && options.length > 0;

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  };

  const displayLabel = value.length === 0
    ? placeholder
    : value.length === 1
      ? options.find(o => o.value === value[0])?.label
      : `${value.length} selected`;

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all
          bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600
          hover:border-gray-400 dark:hover:border-slate-500
          ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
        `}
      >
        {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
        <span className={`flex-1 text-left truncate ${value.length > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-400'}`}>
          {displayLabel}
        </span>
        {value.length > 0 && (
          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0">
            {value.length}
          </span>
        )}
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[100] top-full mt-1.5 left-0 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          {options.length > 4 && (
            <div className="p-2 border-b border-gray-100 dark:border-slate-700">
              <div className="relative">
                <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          )}
          {options.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(allSelected ? [] : options.map(o => o.value))}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-700"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-slate-500'}`}>
                {allSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Select All</span>
            </button>
          )}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">No results</div>
            ) : filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${value.includes(opt.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-slate-500'}`}>
                  {value.includes(opt.value) && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-gray-800 dark:text-gray-200">{opt.label}</span>
                  {opt.locationName && <span className="text-xs text-gray-400 ml-1.5">({opt.locationName})</span>}
                </div>
              </button>
            ))}
          </div>
          {value.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── CustomDropdown (entries) ────────────────────────────────────────────────

const CustomDropdown = ({ value, onChange, options, showSearch = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all
          bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600
          ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'hover:border-gray-400'}`}
      >
        <span className="text-gray-800 dark:text-gray-200 font-medium">{selected?.label}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 bottom-full mb-1 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden py-1 min-w-max">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-2 text-sm text-left transition-colors
                ${value === opt.value
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ActiveFilterPill ────────────────────────────────────────────────────────

const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
    {label}
    <button type="button" onClick={onRemove} className="hover:text-blue-900 dark:hover:text-blue-300 transition-colors">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

// ─── Reports Page ─────────────────────────────────────────────────────────────

const Reports = () => {
  const { hasPermissionForComponent, accessControl } = useAccessControl();

  const canViewTable    = hasPermissionForComponent('Reports', 'comp011', 'can_view');
  const canExportExcel  = hasPermissionForComponent('Reports', 'comp013', 'can_view');
  const canDownloadImage = hasPermissionForComponent('Reports', 'comp012', 'can_view');

  // Filter state
  const [selectedLocations,  setSelectedLocations]  = useState([]);
  const [selectedCheckpoints, setSelectedCheckpoints] = useState([]);
  const [plateNumber,  setPlateNumber]  = useState('');
  const [startDate,    setStartDate]    = useState(null);
  const [endDate,      setEndDate]      = useState(null);
  const [startTime,    setStartTime]    = useState('');
  const [endTime,      setEndTime]      = useState('');
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [direction, setDirection] = useState(null); // null | 'in' | 'out'

  // Data state
  const [reportData, setReportData]   = useState(null);
  const [loading,    setLoading]      = useState(false);
  const [error,      setError]        = useState(null);

  // Pagination
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [pageLoading,  setPageLoading]  = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVehicle,  setSelectedVehicle]  = useState(null);

  // Excel export
  const [exportingExcel,  setExportingExcel]  = useState(false);
  const [exportProgress, setExportProgress]  = useState(0);

  // ── Derived options ──────────────────────────────────────────────────────

  const locationOptions = (accessControl?.locations || []).map(loc => ({
    value: loc.location_id,
    label: loc.location_name,
  }));

  const checkpointOptions = useMemo(() => {
    const locs = accessControl?.locations || [];
    const source = selectedLocations.length === 0
      ? locs
      : locs.filter(l => selectedLocations.includes(l.location_id));
    return source.flatMap(loc =>
      (loc.checkpoints || []).map(cp => ({
        value: cp.checkpoint_id,
        label: cp.checkpoint_name,
        locationName: loc.location_name,
      }))
    );
  }, [selectedLocations, accessControl]);

  // Keep checkpoint selection valid when locations change
  useEffect(() => {
    const valid = selectedCheckpoints.filter(id => checkpointOptions.some(cp => cp.value === id));
    if (valid.length !== selectedCheckpoints.length) setSelectedCheckpoints(valid);
  }, [checkpointOptions]);

  const isSameDay = startDate && endDate && startDate === endDate;

  const handleClearDates = () => {
    setStartDate(null); setEndDate(null);
    setStartTime(''); setEndTime('');
  };

  // ── Build request body ───────────────────────────────────────────────────

  const buildRequestBody = useCallback((overrides = {}) => {
    const body = {
      scope: 'report',
      location_ids:   selectedLocations.length  > 0 ? selectedLocations  : null,
      checkpoint_ids: selectedCheckpoints.length > 0 ? selectedCheckpoints : null,
      plate_number:   plateNumber.trim() || null,
      start_date: buildDateTime(startDate, isSameDay ? startTime : null),
      end_date:   buildDateTime(endDate,   isSameDay ? endTime   : null),
      page:       currentPage,
      page_size:  itemsPerPage,
    };
    if (isBlacklisted) body.is_blacklisted = true;
    if (isWhitelisted) body.is_whitelisted = true;
    if (direction) body.direction = direction;
    return { ...body, ...overrides };
  }, [selectedLocations, selectedCheckpoints, plateNumber, startDate, endDate, startTime, endTime, isSameDay, currentPage, itemsPerPage, isBlacklisted, isWhitelisted, direction]);

  // ── Validation ───────────────────────────────────────────────────────────

  const validate = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError({ title: 'Validation Error', message: 'Please select both start and end dates.' });
      return false;
    }
    if (startDate && endDate) {
      const s = new Date(startDate), e = new Date(endDate);
      const today = new Date(); today.setHours(23,59,59,999);
      if (s > e)      { setError({ title: 'Validation Error', message: 'Start date must be before end date.' }); return false; }
      if (e > today)  { setError({ title: 'Validation Error', message: 'End date cannot be in the future.' }); return false; }
      if ((e - s) / 86400000 >= 90) { setError({ title: 'Validation Error', message: 'Date range cannot exceed 90 days.' }); return false; }
    }
    return true;
  };

  // ── API calls ────────────────────────────────────────────────────────────

  const fetchReport = async (body) => {
    const response = await fetchWithAuth(
      `${import.meta.env.VITE_API_BASE_URL}/dashboard/vehicle-logs`,
      { method: 'POST', body: JSON.stringify(body) }
    );
    if (!response.ok) { const e = new Error('API Error'); e.response = { status: response.status }; throw e; }
    return response.json();
  };

  const handleGenerateReport = async () => {
    if (!validate()) return;
    setLoading(true); setError(null); setCurrentPage(1);
    try {
      const data = await fetchReport(buildRequestBody({ page: 1 }));
      setReportData(data);
    } catch (err) {
      setError(handleApiError(err).error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on page / page-size change (not on first load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!reportData) return;
    (async () => {
      setPageLoading(true);
      try {
        const data = await fetchReport(buildRequestBody());
        setReportData(data);
      } catch {}
      finally { setPageLoading(false); }
    })();
  }, [currentPage, itemsPerPage]);

  // ── Excel export ─────────────────────────────────────────────────────────

  const handleExcelExport = async () => {
    setExportingExcel(true); setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(p => p < 85 ? p + (p < 20 ? 2 : p < 50 ? 1.5 : 0.7) : p);
    }, 120);
    try {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/dashboard/vehicle-logs`,
        { method: 'POST', body: JSON.stringify(buildRequestBody({ excel_report: true })) }
      );
      if (!response.ok) throw new Error('Export failed');
      clearInterval(interval); setExportProgress(95);
      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `vehicle-report-${startDate || 'all'}.xlsx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setExportProgress(100);
      setTimeout(() => { setExportingExcel(false); setExportProgress(0); }, 800);
    } catch (err) {
      clearInterval(interval);
      setError(handleApiError(err).error);
      setExportingExcel(false); setExportProgress(0);
    }
  };

  // ── Filtered logs ────────────────────────────────────────────────────────

  const filteredLogs = useMemo(() => {
    if (!reportData?.summary_data) return [];
    if (!searchQuery) return reportData.summary_data;
    return reportData.summary_data.filter(l =>
      l.plate_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reportData, searchQuery]);

  const pagination  = reportData?.pagination || {};
  const totalPages  = pagination.total_pages || 1;
  const hasDirectionData = ((reportData?.approaching_count || 0) + (reportData?.departing_count || 0)) > 0;

  // ── Image helpers ────────────────────────────────────────────────────────

  const getPlateImage   = (log) => log.latest_data_number_plate_image || log.number_plate_image || '/placeholder-plate.svg';
  const getVehicleImage = (log) => log.latest_data_vehicle_image || log.vehicle_image || '/placeholder-vehicle.svg';

  const openModal  = (v) => { setSelectedVehicle(v); setDetailsModalOpen(true); };
  const closeModal = ()  => { setDetailsModalOpen(false); setSelectedVehicle(null); };

  // ── Active filter pills ──────────────────────────────────────────────────

  const activeFilters = useMemo(() => {
    const pills = [];
    if (plateNumber.trim()) pills.push({ key: 'plate', label: `Plate: ${plateNumber.toUpperCase()}`, onRemove: () => setPlateNumber('') });
    if (startDate) pills.push({ key: 'date', label: isSameDay ? `${FORMAT_DATE(startDate)} ${startTime || '00:00'}–${endTime || '23:59'}` : `${FORMAT_DATE(startDate)} → ${FORMAT_DATE(endDate)}`, onRemove: handleClearDates });
    if (selectedLocations.length) pills.push({ key: 'loc', label: `${selectedLocations.length} Location${selectedLocations.length > 1 ? 's' : ''}`, onRemove: () => setSelectedLocations([]) });
    if (selectedCheckpoints.length) pills.push({ key: 'cp', label: `${selectedCheckpoints.length} Checkpoint${selectedCheckpoints.length > 1 ? 's' : ''}`, onRemove: () => setSelectedCheckpoints([]) });
    if (isBlacklisted) pills.push({ key: 'bl', label: 'Blacklisted', onRemove: () => setIsBlacklisted(false) });
    if (isWhitelisted) pills.push({ key: 'wl', label: 'Whitelisted', onRemove: () => setIsWhitelisted(false) });
    if (direction) pills.push({ key: 'dir', label: direction === 'in' ? 'Direction: IN' : 'Direction: OUT', onRemove: () => setDirection(null) });
    return pills;
  }, [plateNumber, startDate, endDate, startTime, endTime, selectedLocations, selectedCheckpoints, isBlacklisted, isWhitelisted, direction, isSameDay]);

  const handleClearAll = () => {
    setPlateNumber(''); handleClearDates();
    setSelectedLocations([]); setSelectedCheckpoints([]);
    setIsBlacklisted(false); setIsWhitelisted(false); setDirection(null);
    setReportData(null); setError(null); setSearchQuery('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">

      <PageHeader
        title="Reports & Analytics"
        description="Generate comprehensive reports and analyze vehicle detection data"
      />

      <div className="max-w-7xl mx-auto pb-8 px-4 sm:px-6">

        {/* ── Loading ── */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-16 mb-6 flex flex-col items-center gap-4">
            <Loader />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Generating report…</p>
          </div>
        )}

        {/* ── Filter Panel ── */}
        {!loading && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm mb-6 overflow-visible">

            {/* Panel header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">Filters</span>
              </div>
              {activeFilters.length > 0 && (
                <button onClick={handleClearAll} className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium">
                  Clear all
                </button>
              )}
            </div>

            {/* Filter grid */}
            <div className="px-6 pt-5 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Plate Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Plate Number</label>
                  <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. DL3CBR1119"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Date Range + Time */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Date & Time Range
                  </label>
                  <DateRangeTimePicker
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
                    onStartDate={setStartDate}
                    onEndDate={setEndDate}
                    onStartTime={setStartTime}
                    onEndTime={setEndTime}
                    onClear={handleClearDates}
                  />
                </div>

                {/* Locations */}
                <div>
                  <MultiSelectDropdown
                    label="Locations"
                    value={selectedLocations}
                    onChange={setSelectedLocations}
                    options={locationOptions}
                    placeholder="All Locations"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />
                </div>

                {/* Checkpoints */}
                <div>
                  <MultiSelectDropdown
                    label="Checkpoints"
                    value={selectedCheckpoints}
                    onChange={setSelectedCheckpoints}
                    options={checkpointOptions}
                    placeholder="All Checkpoints"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                  />
                </div>

                {/* Generate button */}
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateReport}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate
                  </button>
                </div>
              </div>

              {/* Watchlist toggles */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Show:</span>

                {/* Blacklisted toggle */}
                <button
                  type="button"
                  onClick={() => setIsBlacklisted(!isBlacklisted)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${isBlacklisted
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-700'
                    }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isBlacklisted ? 'bg-red-600 border-red-600' : 'border-gray-300 dark:border-slate-500'}`}>
                    {isBlacklisted && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  Blacklisted only
                </button>

                {/* Whitelisted toggle */}
                <button
                  type="button"
                  onClick={() => setIsWhitelisted(!isWhitelisted)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${isWhitelisted
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isWhitelisted ? 'bg-green-600 border-green-600' : 'border-gray-300 dark:border-slate-500'}`}>
                    {isWhitelisted && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  Whitelisted only
                </button>

                {/* Approaching toggle */}
                <button
                  type="button"
                  onClick={() => setDirection(d => d === 'in' ? null : 'in')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${direction === 'in'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  IN only
                </button>

                {/* Departing toggle */}
                <button
                  type="button"
                  onClick={() => setDirection(d => d === 'out' ? null : 'out')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${direction === 'out'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-orange-300 dark:hover:border-orange-700'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  OUT only
                </button>
              </div>

              {/* Active filter pills */}
              {activeFilters.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeFilters.map(f => <FilterPill key={f.key} label={f.label} onRemove={f.onRemove} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error.title || 'Error'}</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{error.message || String(error)}</p>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && reportData && reportData.summary_data?.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-12 mb-6">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                No vehicle logs found for selected filters
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Reports show data based on your selected filters. Try adjusting your date range, locations, or other filters to see results.
              </p>
              
              {/* Divider */}
              <div className="w-full border-t border-gray-200 dark:border-slate-700 my-4"></div>
              
              {/* Suggestions */}
              <div className="text-left w-full">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Suggestions:</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Try selecting a broader date range</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Check if the selected locations have data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Clear all filters to see all available data</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Results Table ── */}
        {!loading && canViewTable && reportData?.summary_data?.length > 0 && (
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">

            {/* Page-loading overlay */}
            {pageLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}

            {/* Table header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                  Results
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
                    {pagination.total_records?.toLocaleString() || filteredLogs.length}
                  </span>
                </h2>
                {isSameDay && startTime && (
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 font-medium">
                    ⏱ Time-filtered: {FORMAT_DATE(startDate)} · {startTime || '00:00'} – {endTime || '23:59'}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search plate…"
                    className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-44"
                  />
                </div>

                {/* Excel export */}
                {canExportExcel && (
                  <button
                    onClick={handleExcelExport}
                    disabled={exportingExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingExcel ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        {Math.round(exportProgress)}%
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Export Excel
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Export progress bar */}
            {exportingExcel && (
              <div className="h-0.5 bg-gray-100 dark:bg-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            )}

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/30 border-b border-gray-100 dark:border-slate-700">
                    {['Location', 'Checkpoint', 'Date & Time', 'Plate', ...(hasDirectionData ? ['Direction'] : []), 'Image'].map(h => (
                      <th key={h} className="text-left py-3 px-6 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                  {filteredLogs.map((log) => {
                    const ts   = new Date(log.timestamp);
                    const dStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const tStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                    return (
                      <tr
                        key={log.log_id}
                        className={`transition-colors ${log.is_blacklisted
                          ? 'bg-red-50/60 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'hover:bg-gray-50/80 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {log.is_blacklisted && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[140px]">{log.location_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px] block">{log.checkpoint_name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-800 dark:text-white font-medium">{dStr}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 block">{tStr}</span>
                        </td>
                        <td className="py-4 px-6">
                          <CopyButton text={log.plate_number} className="text-sm font-bold font-mono text-gray-800 dark:text-white" />
                          {log.is_blacklisted && (
                            <span className="mt-1 block text-[10px] font-semibold text-red-500 uppercase tracking-wider">Blacklisted</span>
                          )}
                        </td>
                        {hasDirectionData && (
                          <td className="py-4 px-6">
                            {log.direction === 'in' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                IN
                              </span>
                            ) : log.direction === 'out' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded-lg border border-orange-200 dark:border-orange-800 whitespace-nowrap">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                OUT
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <img
                            src={getPlateImage(log)}
                            alt="Plate"
                            onClick={() => openModal(log)}
                            onError={(e) => { e.target.src = '/placeholder-plate.svg'; }}
                            crossOrigin="anonymous"
                            className="h-10 w-28 object-contain rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-400 hover:border-blue-400 transition-all"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-3 space-y-2.5">
              {filteredLogs.map((log) => {
                const ts   = new Date(log.timestamp);
                const dStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const tStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                return (
                  <div
                    key={log.log_id}
                    className={`rounded-xl p-3.5 border ${log.is_blacklisted
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                      : 'bg-white dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <CopyButton text={log.plate_number} className="text-sm font-bold font-mono text-gray-800 dark:text-white" />
                        {log.is_blacklisted && <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider block mt-0.5">Blacklisted</span>}
                      </div>
                      <span className="text-xs text-gray-400">{dStr} · {tStr}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {log.location_name} · {log.checkpoint_name}
                      </div>
                      {hasDirectionData && log.direction === 'in' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-semibold rounded-md border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                          IN
                        </span>
                      )}
                      {hasDirectionData && log.direction === 'out' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-[10px] font-semibold rounded-md border border-orange-200 dark:border-orange-800 whitespace-nowrap">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                          OUT
                        </span>
                      )}
                    </div>
                    <img
                      src={getPlateImage(log)}
                      alt="Plate"
                      onClick={() => openModal(log)}
                      onError={(e) => { e.target.src = '/placeholder-plate.svg'; }}
                      crossOrigin="anonymous"
                      className="w-full h-16 object-contain rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {((pagination.page||1)-1) * (pagination.page_size||itemsPerPage) + 1}–{Math.min((pagination.page||1)*(pagination.page_size||itemsPerPage), pagination.total_records||0)} of {(pagination.total_records||0).toLocaleString()}
                </span>
                <CustomDropdown
                  value={itemsPerPage}
                  onChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
                  options={[{value:50,label:'50/page'},{value:75,label:'75/page'},{value:100,label:'100/page'}]}
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={!pagination.has_previous}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pg;
                  if (totalPages <= 5)       pg = i + 1;
                  else if (currentPage <= 3) pg = i + 1;
                  else if (currentPage >= totalPages - 2) pg = totalPages - 4 + i;
                  else pg = currentPage - 2 + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pg
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!pagination.has_next}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      <VehicleDetailsModal
        isOpen={detailsModalOpen}
        onClose={closeModal}
        vehicleData={selectedVehicle}
        getPlateImage={getPlateImage}
        getVehicleImage={getVehicleImage}
        canDownload={canDownloadImage}
      />
    </div>
  );
};

export default Reports;