import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import DashboardKpis from './DashboardKpis';
import DashboardSummaryTable from './DashboardSummaryTable';
import ErrorState from '../common/ErrorState';
import { FullPageLoader } from '../common/Loader';
import { handleApiError } from '../../utils/apiErrorHandler';
import { fetchWithAuth } from '../../utils/fetchWrapper';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_ABBR = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MAX_DAYS = 30;

const QUICK_PRESETS = [
  { id: 'today',     label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d',        label: 'Last 7 days' },
  { id: '30d',       label: 'Last 30 days' },
  { id: 'thismonth', label: 'This month' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad = (v) => String(v).padStart(2, '0');

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 86_400_000);

const fmtDisplay = (s) => {
  if (!s) return '';
  const dateOnly = s.includes('T') ? s.split('T')[0] : s;
  const [y, m, d] = dateOnly.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const getPresetRange = (id) => {
  const now   = new Date();
  const today = todayStr();
  const sub   = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  if (id === 'today')     return { start: today,   end: today };
  if (id === 'yesterday') return { start: sub(1),  end: sub(1) };
  if (id === '7d')        return { start: sub(6),  end: today };
  if (id === '30d')       return { start: sub(29), end: today };
  if (id === 'thismonth') return { start: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, end: today };
  return { start: null, end: null };
};

const buildPayload = (dateStr, timeStr, isStart) => {
  if (!dateStr) return null;
  const def = isStart ? '00:00' : '23:59';
  if (!timeStr || timeStr === def) return dateStr;
  return `${dateStr}T${timeStr}:00`;
};

// ─── CalendarGrid ─────────────────────────────────────────────────────────────
const CalendarGrid = ({ year, month, startDate, endDate, onDayClick }) => {
  const today    = todayStr();
  const firstDow = new Date(year, month, 1).getDay();
  const dim      = new Date(year, month + 1, 0).getDate();

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_ABBR.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 py-1.5 tracking-wide select-none">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}

        {Array.from({ length: dim }).map((_, i) => {
          const day      = i + 1;
          const ds       = `${year}-${pad(month + 1)}-${pad(day)}`;
          const isFuture = ds > today;
          const isStart  = ds === startDate;
          const isEnd    = ds === endDate;
          const inRange  = !!(startDate && endDate && ds > startDate && ds < endDate);
          const isToday  = ds === today;
          const isSingle = isStart && isEnd;
          const dow      = new Date(year, month, day).getDay();
          const isFirstOfRow = dow === 0 || day === 1;
          const isLastOfRow  = dow === 6 || day === dim;

          // Cell background for range strip
          let cellStyle = {};
          if (!isSingle) {
            if (inRange) {
              cellStyle = { background: 'rgb(237 233 254 / 1)' };
            } else if (isStart && endDate) {
              cellStyle = { background: 'linear-gradient(to right, transparent 50%, rgb(237 233 254) 50%)' };
            } else if (isEnd && startDate) {
              cellStyle = { background: 'linear-gradient(to left, transparent 50%, rgb(237 233 254) 50%)' };
            }
          }
          const cellRound = inRange
            ? `${isFirstOfRow ? 'rounded-l-full' : ''} ${isLastOfRow ? 'rounded-r-full' : ''}`
            : '';

          let btnCls = 'relative z-10 w-8 h-8 flex items-center justify-center text-[13px] rounded-full select-none transition-all duration-100 ';
          if (isFuture)          btnCls += 'text-gray-300 dark:text-gray-600 cursor-not-allowed';
          else if (isStart || isEnd) btnCls += 'bg-violet-600 text-white font-semibold shadow-sm cursor-pointer';
          else if (inRange)      btnCls += 'text-violet-700 dark:text-violet-300 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/50';
          else                   btnCls += 'text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10';
          if (isToday && !isStart && !isEnd) btnCls += ' font-semibold';

          return (
            <div
              key={day}
              style={cellStyle}
              className={`flex items-center justify-center h-9 ${cellRound}`}
            >
              {/* Today indicator dot */}
              <div className="relative">
                {isToday && !isStart && !isEnd && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-violet-500 z-20" />
                )}
                <button
                  type="button"
                  disabled={isFuture}
                  onClick={() => onDayClick(ds)}
                  className={btnCls}
                >
                  {day}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── DateFilterPopover ────────────────────────────────────────────────────────
const DateFilterPopover = ({ appliedFilters, onApply, onClose }) => {
  const now    = new Date();
  const today  = todayStr();

  const initStart     = appliedFilters.start_date?.split('T')[0] || today;
  const initEnd       = appliedFilters.end_date?.split('T')[0]   || today;
  const initStartTime = appliedFilters.start_date?.includes('T') ? appliedFilters.start_date.split('T')[1].substring(0, 5) : '00:00';
  const initEndTime   = appliedFilters.end_date?.includes('T')   ? appliedFilters.end_date.split('T')[1].substring(0, 5)   : '23:59';

  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [startDate,    setStartDate]    = useState(initStart);
  const [endDate,      setEndDate]      = useState(initEnd);
  const [startTime,    setStartTime]    = useState(initStartTime);
  const [endTime,      setEndTime]      = useState(initEndTime);
  const [timeEnabled,  setTimeEnabled]  = useState(
    !!(appliedFilters.start_date?.includes('T') || appliedFilters.end_date?.includes('T'))
  );
  const [activePreset, setActivePreset] = useState(() => {
    if (!appliedFilters.start_date && !appliedFilters.end_date) return 'today';
    return 'custom';
  });
  const [error, setError] = useState('');

  const isSameDay = startDate && endDate && startDate === endDate;
  const rangeOk   = !!(startDate && endDate);
  const dayCount  = rangeOk ? diffDays(startDate, endDate) + 1 : 0;

  useEffect(() => {
    if (startDate && endDate && startDate !== endDate && timeEnabled) {
      setTimeEnabled(false);
      setStartTime('00:00');
      setEndTime('23:59');
    }
  }, [startDate, endDate]);

  const applyPreset = (id) => {
    const { start, end } = getPresetRange(id);
    setStartDate(start);
    setEndDate(end);
    setActivePreset(id);
    setTimeEnabled(false);
    setStartTime('00:00');
    setEndTime('23:59');
    setError('');
  };

  const handleDayClick = (ds) => {
    setActivePreset('custom');
    setError('');
    if (!startDate || (startDate && endDate)) {
      setStartDate(ds);
      setEndDate(null);
    } else {
      if (ds < startDate) {
        setEndDate(startDate);
        setStartDate(ds);
      } else {
        const diff = diffDays(startDate, ds);
        if (diff >= MAX_DAYS) {
          setError(`Max ${MAX_DAYS} days allowed. Please pick a shorter range.`);
          return;
        }
        setEndDate(ds);
      }
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const handleApply = () => {
    if (!startDate || !endDate) { setError('Please select both start and end date.'); return; }
    if (timeEnabled) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      if (sh * 60 + sm >= eh * 60 + em) { setError('Start time must be before end time.'); return; }
    }
    onApply({
      ...appliedFilters,
      start_date: buildPayload(startDate, timeEnabled ? startTime : null, true),
      end_date:   buildPayload(endDate,   timeEnabled ? endTime   : null, false),
    });
    onClose();
  };

  const handleReset = () => {
    onApply({ ...appliedFilters, start_date: null, end_date: null });
    onClose();
  };

  const PresetBtn = ({ id, label }) => (
    <button
      type="button"
      onClick={() => applyPreset(id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-100
        ${activePreset === id
          ? 'bg-violet-600 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
      style={{ width: '520px', maxWidth: 'calc(100vw - 1.5rem)' }}
    >

      {/* ── Quick Presets Row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-4 pt-4 pb-3 flex-wrap">
        {QUICK_PRESETS.map(({ id, label }) => <PresetBtn key={id} id={id} label={label} />)}
        <button
          type="button"
          onClick={() => { setStartDate(null); setEndDate(null); setActivePreset('custom'); setError(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-100
            ${activePreset === 'custom'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
          Custom range
        </button>
      </div>

      <div className="h-px bg-gray-100 dark:bg-slate-800" />

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex">

        {/* Calendar side */}
        <div className="flex-1 px-4 py-3">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 select-none">
              {MONTHS[calMonth]} {calYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <CalendarGrid
            year={calYear}
            month={calMonth}
            startDate={startDate}
            endDate={endDate}
            onDayClick={handleDayClick}
          />

          {/* Range pill */}
          {rangeOk && (
            <div className="mt-3 flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold
                ${dayCount >= MAX_DAYS - 3
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                  : 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {dayCount} day{dayCount !== 1 ? 's' : ''} selected
                {dayCount >= MAX_DAYS - 3 && ` · max ${MAX_DAYS}`}
              </span>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-[148px] border-l border-gray-100 dark:border-slate-800 flex flex-col gap-2 px-3 py-3">

          {/* From */}
          <div className={`rounded-xl p-2.5 border transition-all duration-150
            ${startDate
              ? 'border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-950/30'
              : 'border-dashed border-gray-200 dark:border-slate-700'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">From</p>
            {startDate
              ? <>
                  <p className="text-xl font-bold text-violet-700 dark:text-violet-300 leading-none tabular-nums">
                    {startDate.split('-')[2]}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                    {MONTHS_SHORT[parseInt(startDate.split('-')[1]) - 1]} {startDate.split('-')[0]}
                  </p>
                </>
              : <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Not set</p>
            }
          </div>

          {/* Arrow */}
          <div className="flex justify-center py-0.5">
            <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          {/* To */}
          <div className={`rounded-xl p-2.5 border transition-all duration-150
            ${endDate
              ? 'border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-950/30'
              : 'border-dashed border-gray-200 dark:border-slate-700'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">To</p>
            {endDate
              ? <>
                  <p className="text-xl font-bold text-violet-700 dark:text-violet-300 leading-none tabular-nums">
                    {endDate.split('-')[2]}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                    {MONTHS_SHORT[parseInt(endDate.split('-')[1]) - 1]} {endDate.split('-')[0]}
                  </p>
                </>
              : <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Not set</p>
            }
          </div>

          {/* ── Time Filter Section ───────────────────────────────────── */}
          <div className={`mt-auto pt-2 transition-opacity duration-150 ${isSameDay ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

            {/* Toggle */}
            <label className="flex items-center justify-between cursor-pointer mb-2.5">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Time filter
              </span>
              <div className="relative w-8 h-[18px] flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!!(timeEnabled && isSameDay)}
                  onChange={() => {
                    if (!isSameDay) return;
                    setTimeEnabled((prev) => {
                      if (prev) { setStartTime('00:00'); setEndTime('23:59'); }
                      return !prev;
                    });
                  }}
                />
                <div className={`absolute inset-0 rounded-full transition-colors duration-200
                  ${timeEnabled && isSameDay ? 'bg-violet-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                />
                <div className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-200
                  ${timeEnabled && isSameDay ? 'translate-x-[14px]' : 'translate-x-0'}`}
                />
              </div>
            </label>

            {/* Time inputs when enabled */}
            {timeEnabled && isSameDay
              ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 w-4 flex-shrink-0">FR</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="flex-1 min-w-0 text-xs font-mono bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-[5px] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 w-4 flex-shrink-0">TO</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="flex-1 min-w-0 text-xs font-mono bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-[5px] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400"
                    />
                  </div>
                </div>
              )
              : (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                  {isSameDay
                    ? 'Enable to filter by time of day'
                    : 'Pick same start & end date to enable time filter'}
                </p>
              )
            }
          </div>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
          <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-px" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <p className="text-xs font-medium text-red-600 dark:text-red-400 leading-snug">{error}</p>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Reset
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!rangeOk}
            className="px-4 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { getTabComponents, hasPermissionForComponent, user, accessControl } = useAccessControl();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [showFilter, setShowFilter]       = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    location_ids:   null,
    checkpoint_ids: null,
    start_date:     null,
    end_date:       null,
  });

  const filterRef  = useRef(null);
  const triggerRef = useRef(null);
  const components = getTabComponents('Dashboard');

  // Close popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        showFilter &&
        filterRef.current  && !filterRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilter]);

  const fetchDashboardData = useCallback(
    async (filters = appliedFilters, page = 1, pageSize = 50) => {
      try {
        if (!dashboardData) setLoading(true);
        setError(null);

        const body = {
          scope:          'dashboard',
          location_ids:   filters.location_ids,
          checkpoint_ids: filters.checkpoint_ids,
          start_date:     filters.start_date ?? undefined,
          end_date:       filters.end_date   ?? undefined,
          page,
          page_size: pageSize,
        };

        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard/vehicle-logs`,
          { method: 'POST', body: JSON.stringify(body) }
        );

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          const err = new Error(payload?.detail || 'API Error');
          err.response = { status: res.status, data: payload };
          throw err;
        }

        setDashboardData(await res.json());
      } catch (err) {
        setError(handleApiError(err).error);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appliedFilters]
  );

  useEffect(() => { fetchDashboardData(); }, []);

  const handleApply = (newFilters) => {
    setAppliedFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const getTriggerLabel = () => {
    const { start_date, end_date } = appliedFilters;
    if (!start_date && !end_date) {
      return `Today, ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    const fmt = (v) => {
      const d = fmtDisplay(v);
      const t = v?.includes('T') ? ' · ' + v.split('T')[1].substring(0, 5) : '';
      return d + t;
    };
    const s = fmt(start_date), e = fmt(end_date);
    return s === e ? s : `${s}  →  ${e}`;
  };

  const hasCustomFilter = !!(appliedFilters.start_date || appliedFilters.end_date);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  })();

  if (loading) return <FullPageLoader message="Loading Dashboard" />;
  if (error) {
    return (
      <div className="bg-white dark:bg-transparent min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ErrorState
            title={error.title}
            message={error.message}
            icon={error.icon}
            statusCode={error.statusCode}
            onRetry={fetchDashboardData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">

            {/* Greeting */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">
                <span className="font-normal">{greeting},</span>{' '}
                <span className="font-bold">{user?.name || 'User'}</span>
              </h1>
              {user?.company_name && (
                <div className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 truncate">
                    {user.company_name}
                  </span>
                </div>
              )}
            </div>

            {/* Date filter trigger */}
            {hasPermissionForComponent('Dashboard', 'comp003', 'can_view') && (
              <div className="w-full lg:w-auto relative flex-shrink-0">
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setShowFilter((p) => !p)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-150
                    ${showFilter
                      ? 'border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                      : hasCustomFilter
                      ? 'border-violet-300 dark:border-violet-700/60 bg-white dark:bg-slate-800'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${showFilter || hasCustomFilter ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>

                  <span className={`text-sm font-medium flex-1 truncate text-left transition-colors
                    ${showFilter || hasCustomFilter ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {getTriggerLabel()}
                  </span>

                  {hasCustomFilter && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 animate-pulse" />
                  )}

                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showFilter && (
                  <div ref={filterRef}>
                    <DateFilterPopover
                      appliedFilters={appliedFilters}
                      onApply={handleApply}
                      onClose={() => setShowFilter(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Components */}
        {components.map((component) => {
          if (!component.permissions.can_view) return null;

          if (component.component_code === 'comp001') {
            return (
              <DashboardKpis
                key={component.component_id}
                data={dashboardData}
                appliedFilters={appliedFilters}
                locations={accessControl?.locations || []}
              />
            );
          }

          if (component.component_code === 'comp002') {
            return (
              <DashboardSummaryTable
                key={component.component_id}
                data={dashboardData}
                appliedFilters={appliedFilters}
                canAddToWatchlist={hasPermissionForComponent('Dashboard', 'comp004', 'can_view')}
                canFixVehicleNumber={hasPermissionForComponent('Dashboard', 'comp005', 'can_view')}
                canDownloadImage={hasPermissionForComponent('Dashboard', 'comp006', 'can_view')}
                onDataRefresh={fetchDashboardData}
                onPageChange={(page, pageSize) => fetchDashboardData(appliedFilters, page, pageSize)}
              />
            );
          }

          return null;
        })}

      </div>
    </div>
  );
};

export default Dashboard;