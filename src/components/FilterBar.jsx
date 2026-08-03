import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Eye, EyeOff, ChevronDown, Edit2, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export default function FilterBar({
  semesters,
  selectedSemester,
  onSelectSemester,
  onOpenCreateSemester,
  onDeleteSemester,
  onToggleVisibility,
  subjects,
  selectedSubject,
  onSelectSubject,
  onOpenCreateSubject,
  onEditSubject,
  onDeleteSubject
}) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState('pills'); // 'pills' or 'dropdown'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleSemesters = user
    ? semesters
    : semesters.filter(s => s.is_visible !== false);

  const activeSemesterObj = semesters.find(s => s.id === selectedSemester);
  const activeSubjectObj = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="glass-card" style={{
      padding: isMobile ? '12px 14px' : '14px 18px',
      marginBottom: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: '#ffffff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      {/* ROW 1: Semesters Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {/* Left: Semester Title / Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginRight: '4px'
          }}>
            <Calendar size={14} /> Semesters:
          </span>

          {/* Individual Semester Pills */}
          {visibleSemesters.map(sem => {
            const isSelected = selectedSemester === sem.id;
            const isVisibleToPublic = sem.is_visible !== false;
            return (
              <div key={sem.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <button
                  onClick={() => onSelectSemester(sem.id)}
                  className="btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.81rem',
                    borderRadius: '7px',
                    fontWeight: isSelected ? 600 : 500,
                    background: isSelected ? 'var(--primary)' : (!isVisibleToPublic ? '#f1f5f9' : '#f8fafc'),
                    color: isSelected ? '#ffffff' : (!isVisibleToPublic ? '#94a3b8' : 'var(--text-main)'),
                    border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--glass-border)'),
                    gap: '6px'
                  }}
                >
                  {sem.name}
                  {user && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '2px' }}>
                      <span
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(sem.id, !sem.is_visible); }}
                        title={isVisibleToPublic ? 'Visible to public' : 'Hidden from public'}
                        style={{ cursor: 'pointer', opacity: 0.85, display: 'inline-flex' }}
                      >
                        {isVisibleToPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${sem.name}"?`)) onDeleteSemester(sem.id); }}
                        title="Delete semester"
                        style={{ cursor: 'pointer', opacity: 0.85, display: 'inline-flex' }}
                      >
                        <X size={12} />
                      </span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: Admin Add Semester Action */}
        {user && (
          <button
            onClick={onOpenCreateSemester}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '7px', flexShrink: 0 }}
          >
            <Plus size={13} /> Add Semester
          </button>
        )}
      </div>

      {/* ROW 2: Subjects Filter & Management Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: '10px'
      }}>
        {/* Mobile or Dropdown View Mode Selector */}
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <BookOpen size={15} style={{ position: 'absolute', left: '12px', color: 'var(--accent)', pointerEvents: 'none' }} />
              <select
                id="mobile-subject-select-main"
                value={selectedSubject || ''}
                onChange={(e) => onSelectSubject(e.target.value ? e.target.value : null)}
                style={{
                  width: '100%',
                  padding: '9px 32px 9px 34px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
              >
                <option value="">All Subjects ({subjects.length})</option>
                {subjects.map(subj => (
                  <option key={subj.id} value={subj.id} style={{ color: 'var(--text-main)', background: '#ffffff' }}>
                    {subj.subject_number ? `${subj.subject_number} - ` : ''}{subj.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: '12px', color: 'var(--accent)', pointerEvents: 'none' }} />
            </div>

            {user && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {activeSubjectObj && (
                  <button
                    onClick={() => onEditSubject(activeSubjectObj)}
                    className="btn btn-secondary"
                    style={{ padding: '9px', borderRadius: '10px' }}
                    title="Edit Selected Subject"
                  >
                    <Edit2 size={15} />
                  </button>
                )}
                <button
                  onClick={onOpenCreateSubject}
                  className="btn btn-secondary"
                  style={{ padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px' }}
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Desktop / Laptop Responsive Wrap Layout for Subjects */
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginRight: '4px'
            }}>
              <BookOpen size={14} /> Subjects:
            </span>

            {/* Individual Subject Chips */}
            {subjects.map(subject => {
              const isSelected = selectedSubject === subject.id;
              return (
                <div key={subject.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <button
                    onClick={() => onSelectSubject(subject.id)}
                    className="btn"
                    style={{
                      padding: user ? '4px 8px 4px 10px' : '4px 11px',
                      fontSize: '0.81rem',
                      borderRadius: '7px',
                      background: isSelected ? 'var(--accent)' : '#f8fafc',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: '1px solid ' + (isSelected ? 'var(--accent)' : 'var(--glass-border)'),
                      fontWeight: isSelected ? 600 : 400,
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {subject.subject_number && (
                      <span style={{ fontWeight: 600, opacity: 0.9 }}>
                        {subject.subject_number} -
                      </span>
                    )}
                    {subject.name}
                    {user && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditSubject) onEditSubject(subject);
                          }}
                          title="Edit Subject"
                          style={{ display: 'inline-flex', opacity: 0.8, cursor: 'pointer', padding: '1px' }}
                        >
                          <Edit2 size={11} />
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${subject.name}"?`)) onDeleteSubject(subject.id);
                          }}
                          title="Delete Subject"
                          style={{ display: 'inline-flex', opacity: 0.8, cursor: 'pointer', padding: '1px' }}
                        >
                          <X size={12} />
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}

            {user && (
              <button
                onClick={onOpenCreateSubject}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '7px', marginLeft: 'auto' }}
              >
                <Plus size={13} /> Add Subject
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
