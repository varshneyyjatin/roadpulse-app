import { useState, useEffect, useRef } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WDAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_ABBR = ['SU','MO','TU','WE','TH','FR','SA'];

const MAX_DAYS = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad = (v) => String(v).padStart(2, '0');

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const daysBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86_400_000);

/**
 * Build the value to send to the API.
 * - With time  →  "YYYY-MM-DDTHH:MM:00"
 * - Without    →  "YYYY-MM-DD"
 */
const buildPayloadDate = (dateStr, timeStr, hasTime) => {
  if (!dateStr) return null;
  if (!hasTime) return dateStr;
  return `${dateStr}T${timeStr}:00`;
};

const parseExisting = (value, defaultTime) => {
  if (!value) return { date: '', time: defaultTime };
  if (value.includes('T')) {
    const [d, t] = value.split('T');
    return { date: d, time: t.substring(0, 5) };
  }
  return { date: value, time: defaultTime };
};

// ─── Drum-roll Time Selector ──────────────────────────────────────────────────
const TimeDropdown = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [hh, mm] = (value || '00:00').split(':').map(Number);
  const ampm = hh < 12 ? 'AM' : 'PM';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const setH = (h) => onChange(`${pad(h)}:${pad(mm)}`);
  const setM = (m) => onChange(`${pad(hh)}:${pad(m)}`);

  // Scroll selected item into view when dropdown opens
  const hourListRef = useRef(null);
  const minListRef  = useRef(null);
  useEffect(() => {
    if (!open) return;
    if (hourListRef.current) {
      const el = hourListRef.current.querySelector('[data-selected="true"]');
      el?.scrollIntoView({ block: 'center' });
    }
    if (minListRef.current) {
      const el = minListRef.current.querySelector('[data-selected="true"]');
      el?.scrollIntoView({ block: 'center' });
    }
  }, [open]);

  if (disabled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700/40 opacity-35 select-none cursor-not-allowed">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
          <path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="text-sm font-mono font-bold text-gray-400 tabular-nums">{pad(hh)}:{pad(mm)}</span>
        <span className="text-[10px] font-semibold text-gray-400">{ampm}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg border transition-all
          ${open
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md'
            : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:border-violet-400 dark:hover:border-violet-600'
          }`}
      >
        <svg className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
          <path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="flex-1 text-sm font-mono font-bold text-gray-800 dark:text-gray-200 tabular-nums text-left">
          {pad(hh)}:{pad(mm)}
        </span>
        <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400">{ampm}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ml-auto ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-[200] flex rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden"
          style={{ width: '140px' }}
        >
          {/* Hours */}
          <div className="flex flex-col flex-1 border-r border-gray-100 dark:border-slate-700">
            <div className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1.5 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 sticky top-0">
              HR
            </div>
            <div ref={hourListRef} className="overflow-y-auto" style={{ maxHeight: '200px' }}>
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <button
                  key={h}
                  type="button"
                  data-selected={h === hh}
                  onClick={() => { setH(h); setOpen(false); }}
                  className={`w-full py-1.5 text-center text-sm font-mono font-semibold transition-colors
                    ${h === hh
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/25 hover:text-violet-700 dark:hover:text-violet-300'
                    }`}
                >
                  {pad(h)}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes — show every 5 min for usability */}
          <div className="flex flex-col flex-1">
            <div className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1.5 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 sticky top-0">
              MIN
            </div>
            <div ref={minListRef} className="overflow-y-auto" style={{ maxHeight: '200px' }}>
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                const selected = Math.round(mm / 5) * 5 === m;
                return (
                  <button
                    key={m}
                    type="button"
                    data-selected={selected}
                    onClick={() => { setM(m); setOpen(false); }}
                    className={`w-full py-1.5 text-center text-sm font-mono font-semibold transition-colors
                      ${selected
                        ? 'bg-violet-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/25 hover:text-violet-700 dark:hover:text-violet-300'
                      }`}
                  >
                    :{pad(m)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Calendar Range Picker ─────────────────────────────────────────────────────
const CalendarRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => {
  const [cur, setCur] = useState(() => {
    const d = startDate ? new Date(startDate + 'T00:00:00') : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();

  const years = Array.from(
    { length: new Date().getFullYear() - 2015 + 1 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleDayClick = (day) => {
    const clicked = `${year}-${pad(month + 1)}-${pad(day)}`;
    if (clicked > today) return;

    if (!startDate || (startDate && endDate)) {
      onStartChange(clicked);
      onEndChange('');
    } else if (clicked < startDate) {
      onEndChange(startDate);
      onStartChange(clicked);
    } else {
      onEndChange(clicked);
    }
  };

  const getDayState = (day) => {
    const ds = `${year}-${pad(month + 1)}-${pad(day)}`;
    return {
      ds,
      isStart:  ds === startDate,
      isEnd:    ds === endDate,
      inRange:  !!(startDate && endDate && ds > startDate && ds < endDate),
      isFuture: ds > today,
      isToday:  ds === today,
      dow: new Date(year, month, day).getDay(),
    };
  };

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCur(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setCur(new Date(year, parseInt(e.target.value), 1))}
            className="text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none cursor-pointer appearance-none pr-4 bg-no-repeat"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundPosition: 'right center' }}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setCur(new Date(parseInt(e.target.value), month, 1))}
            className="text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none cursor-pointer appearance-none pr-4 bg-no-repeat"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundPosition: 'right center' }}
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setCur(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_ABBR.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 py-1 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`}/>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { isStart, isEnd, inRange, isFuture, isToday, dow } = getDayState(day);
          const isFirstOfRow = dow === 0 || day === 1;
          const isLastOfRow  = dow === 6 || day === daysInMonth;

          return (
            <div
              key={day}
              className={`flex items-center justify-center aspect-square
                ${inRange ? `bg-violet-100 dark:bg-violet-900/25 ${isFirstOfRow ? 'rounded-l-full' : ''} ${isLastOfRow ? 'rounded-r-full' : ''}` : ''}
              `}
            >
              <button
                type="button"
                disabled={isFuture}
                onClick={() => handleDayClick(day)}
                className={`flex items-center justify-center w-8 h-8 text-sm rounded-full transition-all
                  ${isFuture
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : isStart || isEnd
                    ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-200 dark:shadow-violet-900/40 scale-105'
                    : isToday
                    ? 'ring-2 ring-violet-400 dark:ring-violet-600 text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-medium'
                  }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Date Summary Block ────────────────────────────────────────────────────────
const SummaryBlock = ({ label, dateStr, time, onTimeChange, timeEnabled }) => {
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : null;
  const colorClass = label === 'From'
    ? 'border-violet-200 dark:border-violet-800 from-violet-50/60 to-indigo-50/40 dark:from-violet-900/15 dark:to-indigo-900/10'
    : 'border-indigo-200 dark:border-indigo-800 from-indigo-50/60 to-violet-50/40 dark:from-indigo-900/15 dark:to-violet-900/10';

  return (
    <div className={`flex-1 rounded-xl border-2 bg-gradient-to-br p-3 transition-all ${d ? colorClass : 'border-dashed border-gray-200 dark:border-slate-600'}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
        {label}
      </p>
      {d ? (
        <>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-light text-violet-600 dark:text-violet-400 leading-none tabular-nums">
              {pad(d.getDate())}
            </span>
            <div className="pb-0.5">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                {MONTHS[d.getMonth()].substring(0, 3)} {d.getFullYear()}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {WDAYS[d.getDay()].substring(0, 3)}
              </p>
            </div>
          </div>
          <TimeDropdown
            value={time}
            onChange={onTimeChange}
            disabled={!timeEnabled}
          />
        </>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">—</p>
      )}
    </div>
  );
};

// ─── Main Modal ────────────────────────────────────────────────────────────────
const DashboardFilterModal = ({ isOpen, onClose, onApply, currentFilters }) => {
  const startParsed = parseExisting(currentFilters?.start_date, '00:00');
  const endParsed   = parseExisting(currentFilters?.end_date,   '23:55');

  const [startDate,   setStartDate]   = useState(startParsed.date);
  const [endDate,     setEndDate]     = useState(endParsed.date);
  const [startTime,   setStartTime]   = useState(startParsed.time);
  const [endTime,     setEndTime]     = useState(endParsed.time);
  const [includeTime, setIncludeTime] = useState(
    !!(currentFilters?.start_date?.includes('T') || currentFilters?.end_date?.includes('T'))
  );
  const [errors, setErrors] = useState({});

  // Sync when currentFilters changes from outside
  useEffect(() => {
    const s = parseExisting(currentFilters?.start_date, '00:00');
    const e = parseExisting(currentFilters?.end_date,   '23:55');
    setStartDate(s.date);
    setEndDate(e.date);
    setStartTime(s.time);
    setEndTime(e.time);
    setIncludeTime(
      !!(currentFilters?.start_date?.includes('T') || currentFilters?.end_date?.includes('T'))
    );
  }, [currentFilters]);

  // Auto-disable time when range spans multiple days
  useEffect(() => {
    if (startDate && endDate && startDate !== endDate && includeTime) {
      setIncludeTime(false);
    }
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const isSameDay = startDate && endDate && startDate === endDate;
  const rangeOk   = !!(startDate && endDate);
  const diffDays  = rangeOk ? daysBetween(startDate, endDate) : 0;

  const validate = () => {
    const errs = {};

    if (!startDate) errs.start = 'Start date is required.';
    if (!endDate)   errs.end   = 'End date is required.';

    if (startDate && endDate) {
      if (endDate < startDate) errs.range = 'Start date must be before or equal to end date.';
      else if (diffDays >= MAX_DAYS) errs.range = `Maximum range is ${MAX_DAYS} days.`;
    }

    if (includeTime && startDate && endDate) {
      if (!isSameDay) {
        errs.time = 'Time filtering only works when both dates are the same day.';
      } else {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        if (sh * 60 + sm >= eh * 60 + em) {
          errs.time = 'Start time must be before end time.';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApply = () => {
    if (!validate()) return;
    onApply({
      location_ids:   currentFilters?.location_ids  ?? null,
      checkpoint_ids: currentFilters?.checkpoint_ids ?? null,
      start_date: buildPayloadDate(startDate, startTime, includeTime && isSameDay),
      end_date:   buildPayloadDate(endDate,   endTime,   includeTime && isSameDay),
    });
    onClose();
    setErrors({});
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setStartTime('00:00');
    setEndTime('23:55');
    setIncludeTime(false);
    setErrors({});
    onApply({
      location_ids:   null,
      checkpoint_ids: null,
      start_date:     null,
      end_date:       null,
    });
    onClose();
  };

  const firstError = errors.range || errors.start || errors.end || errors.time;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700/60">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Filter Dashboard</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Select date range (max {MAX_DAYS} days)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-all"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'18px',height:'18px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Calendar */}
        <div className="px-5 pt-4">
          <CalendarRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={(d) => { setStartDate(d); setErrors({}); }}
            onEndChange={(d)   => { setEndDate(d);   setErrors({}); }}
          />
        </div>

        {/* Range chip */}
        {rangeOk && (
          <div className="px-5 pt-2 flex justify-center">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
              ${diffDays >= MAX_DAYS - 1
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
              }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {diffDays + 1} day{diffDays > 0 ? 's' : ''} selected
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="mx-5 mt-3 border-t border-gray-100 dark:border-slate-700/60"/>

        {/* Summary + Time */}
        <div className="px-5 pt-3 flex gap-3">
          <SummaryBlock
            label="From"
            dateStr={startDate}
            time={startTime}
            onTimeChange={setStartTime}
            timeEnabled={includeTime && isSameDay}
          />
          <SummaryBlock
            label="To"
            dateStr={endDate}
            time={endTime}
            onTimeChange={setEndTime}
            timeEnabled={includeTime && isSameDay}
          />
        </div>

        {/* Time toggle */}
        <div className="px-5 pt-3">
          <label className={`flex items-center gap-3 cursor-pointer group ${!isSameDay && rangeOk ? 'opacity-50' : ''}`}>
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={includeTime && (!rangeOk || isSameDay)}
                onChange={(e) => {
                  if (rangeOk && !isSameDay) return;
                  setIncludeTime(e.target.checked);
                  if (!e.target.checked) {
                    setStartTime('00:00');
                    setEndTime('23:55');
                  }
                }}
                className="sr-only"
              />
              <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${includeTime && (!rangeOk || isSameDay) ? 'bg-violet-500' : 'bg-gray-200 dark:bg-slate-600'}`}/>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${includeTime && (!rangeOk || isSameDay) ? 'translate-x-4' : ''}`}/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by time</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {rangeOk && !isSameDay
                  ? 'Only available for single-day selection'
                  : 'Set a specific time window'}
              </p>
            </div>
          </label>
        </div>

        {/* Error */}
        {firstError && (
          <div className="mx-5 mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <svg className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-px" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{firstError}</p>
          </div>
        )}

        {/* Reset strip */}
        {(startDate || endDate) && (
          <div className="mx-5 mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400">Clears to today's data</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 mt-2 border-t border-gray-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-violet-200 dark:shadow-violet-900/40 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilterModal;