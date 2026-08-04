/**
 * Utility for automatic Academic Semester Week calculation and styling.
 * Semester Week 1 started on Monday, July 20, 2026.
 */

export function getCurrentAcademicWeek() {
  const SEMESTER_START_DATE = new Date('2026-07-20T00:00:00');
  const now = new Date();
  const diffTime = Math.max(0, now - SEMESTER_START_DATE);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const calculatedWeek = Math.floor(diffDays / 7) + 1;
  return Math.max(1, calculatedWeek);
}

export function parseWeekNumber(weekInput) {
  if (!weekInput) return null;
  const match = String(weekInput).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function getWeekStatus(weekInput) {
  const weekNum = parseWeekNumber(weekInput);
  const currentWeek = getCurrentAcademicWeek();

  if (!weekNum) {
    return {
      status: 'normal',
      weekNum: null,
      currentWeek,
      badgeText: weekInput || '',
      style: {
        background: '#f1f5f9',
        color: '#64748b',
        borderColor: '#cbd5e1'
      }
    };
  }

  if (weekNum < currentWeek) {
    return {
      status: 'finished',
      weekNum,
      currentWeek,
      badgeText: `✓ Week ${weekNum} (Finished)`,
      style: {
        background: '#ecfdf5',
        color: '#047857',
        borderColor: '#a7f3d0'
      }
    };
  } else if (weekNum === currentWeek) {
    return {
      status: 'current',
      weekNum,
      currentWeek,
      badgeText: `⚡ Week ${weekNum} (Current Week)`,
      style: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        color: '#ffffff',
        borderColor: '#4338ca',
        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
        fontWeight: 700
      }
    };
  } else {
    return {
      status: 'upcoming',
      weekNum,
      currentWeek,
      badgeText: `Week ${weekNum}`,
      style: {
        background: '#f1f5f9',
        color: '#64748b',
        borderColor: '#cbd5e1'
      }
    };
  }
}
