import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import api from '../../utils/api.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['Mon','','Wed','','Fri','','Sun'];

const getColor = (rate, isFuture) => {
  if (isFuture) return 'transparent';
  if (rate === 0)    return 'var(--bg-secondary)';
  if (rate < 0.34)   return '#fca5a5';   // light red  — <33%
  if (rate < 0.67)   return '#fbbf24';   // yellow     — <66%
  if (rate < 1)      return '#4ade80';   // light green — <100%
  return '#16a34a';                       // dark green  — 100%
};

const CalendarGrid = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear]       = useState(currentYear);
  const [calData, setCalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchYear(); }, [year]);

  const fetchYear = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/logs/calendar?year=${year}`);
      setCalData(data.calendarData);
    } catch {
      setCalData([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Build week columns ───────────────────────────────────────────────────────
  // GitHub-style: columns = weeks (Sun→Sat or Mon→Sun), rows = days of week.
  // We use Mon=0 … Sun=6 rows.

  const buildGrid = () => {
    if (!calData.length) return { weeks: [], monthLabels: [] };

    // Find which weekday the year starts on (0=Mon … 6=Sun)
    const jan1 = new Date(`${year}-01-01`);
    const jan1Dow = (jan1.getDay() + 6) % 7; // convert Sun=0 → Mon=0

    // Pad the start with empty slots
    const slots = Array(jan1Dow).fill(null);
    calData.forEach(d => slots.push(d));

    // Pad the end so length is multiple of 7
    while (slots.length % 7 !== 0) slots.push(null);

    // Split into weeks (each week = 7 consecutive days Mon→Sun)
    const weeks = [];
    for (let i = 0; i < slots.length; i += 7) {
      weeks.push(slots.slice(i, i + 7));
    }

    // Month label positions — find which week column each month starts in
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstReal = week.find(d => d !== null);
      if (firstReal) {
        const m = parseInt(firstReal.date.split('-')[1]) - 1;
        if (m !== lastMonth) {
          monthLabels.push({ month: m, col: wi });
          lastMonth = m;
        }
      }
    });

    return { weeks, monthLabels };
  };

  const { weeks, monthLabels } = buildGrid();
  const CELL = 13;   // px — cell size
  const GAP  = 3;    // px — gap between cells

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
          <CalendarDays size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent-primary)' }} />
          Habit Calendar
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setYear(y => y - 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1 }}
          >‹</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', minWidth: 44, textAlign: 'center' }}>
            {year}
          </span>
          <button
            onClick={() => setYear(y => Math.min(y + 1, currentYear))}
            disabled={year >= currentYear}
            style={{
              background: 'none', border: 'none',
              cursor: year >= currentYear ? 'default' : 'pointer',
              fontSize: 18,
              color: year >= currentYear ? 'var(--border-color)' : 'var(--text-muted)',
              lineHeight: 1,
            }}
          >›</button>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 0, minWidth: 'max-content' }}>

            {/* Month labels row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `28px repeat(${weeks.length}, ${CELL + GAP}px)`,
              marginBottom: 4,
            }}>
              <div /> {/* spacer for day-label column */}
              {weeks.map((_, wi) => {
                const label = monthLabels.find(ml => ml.col === wi);
                return (
                  <div key={wi} style={{
                    fontSize: 10, fontWeight: 700,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}>
                    {label ? MONTHS[label.month] : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid: day-label column + week columns */}
            <div style={{ display: 'flex', gap: 0 }}>
              {/* Day labels */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: GAP, marginRight: GAP,
                paddingTop: 0,
              }}>
                {DAY_LABELS.map((label, i) => (
                  <div key={i} style={{
                    height: CELL,
                    fontSize: 9, fontWeight: 700,
                    color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                    width: 24, justifyContent: 'flex-end',
                    paddingRight: 4,
                  }}>
                    {label}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              <div style={{ display: 'flex', gap: GAP }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                    {week.map((day, di) => {
                      if (!day) {
                        return <div key={di} style={{ width: CELL, height: CELL }} />;
                      }
                      const isFuture = day.date > todayStr;
                      const isToday  = day.date === todayStr;
                      const color    = getColor(day.rate, isFuture);

                      return (
                        <motion.div
                          key={day.date}
                          whileHover={{ scale: 1.4, zIndex: 10 }}
                          title={
                            isFuture
                              ? day.date
                              : `${day.date} — ${day.completed}/${day.total} habits (${Math.round(day.rate * 100)}%)`
                          }
                          style={{
                            width: CELL, height: CELL,
                            borderRadius: 3,
                            background: color,
                            border: isToday
                              ? '1.5px solid var(--accent-primary)'
                              : isFuture
                                ? '1px dashed var(--border-color)'
                                : '1px solid transparent',
                            cursor: isFuture ? 'default' : 'pointer',
                            transition: 'transform 0.1s',
                            position: 'relative',
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 10, marginTop: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Less</span>
        {[
          { color: 'var(--bg-secondary)', label: 'No logs' },
          { color: '#fca5a5',             label: '<33%'    },
          { color: '#fbbf24',             label: '<66%'    },
          { color: '#4ade80',             label: '<100%'   },
          { color: '#16a34a',             label: '100%'    },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: color,
              border: '1px solid rgba(0,0,0,0.08)',
            }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>More</span>

        {/* Total logged this year */}
        {calData.length > 0 && (
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 700,
            color: 'var(--text-secondary)',
          }}>
            {calData.filter(d => d.completed > 0).length} active days in {year}
          </span>
        )}
      </div>
    </div>
  );
};

export default CalendarGrid;
