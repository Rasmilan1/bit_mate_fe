import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Eye, EyeOff, ChevronDown, Edit2, BookOpen } from 'lucide-react';
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleSemesters = user
    ? semesters
    : semesters.filter(s => s.is_visible !== false);

  const activeSemesterObj = semesters.find(s => s.id === selectedSemester);

  return (
    <div className="glass-card" style={{
      padding: isMobile ? '12px 14px' : '8px 14px',
      marginBottom: '20px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '10px' : '12px',
      background: '#ffffff'
    }}>
      {/* Mobile Layout: Sleek Dropdowns */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {/* Semester Selector Dropdown (Mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Calendar size={15} style={{ position: 'absolute', left: '12px', color: 'var(--primary)', pointerEvents: 'none' }} />
              <select
                id="mobile-semester-select"
                value={selectedSemester || ''}
                onChange={(e) => onSelectSemester(e.target.value ? e.target.value : null)}
                style={{
                  width: '100%',
                  padding: '9px 32px 9px 34px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(79, 70, 229, 0.25)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
              >
                {user && <option value="">All Semesters</option>}
                {visibleSemesters.map(sem => (
                  <option key={sem.id} value={sem.id} style={{ color: 'var(--text-main)', background: '#ffffff' }}>
                    {sem.name} {user && sem.is_visible === false ? '(Hidden)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: '12px', color: 'var(--primary)', pointerEvents: 'none' }} />
            </div>
            {user && (
              <button
                onClick={onOpenCreateSemester}
                className="btn btn-secondary"
                style={{ padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', flexShrink: 0 }}
              >
                <Plus size={15} /> Semester
              </button>
            )}
          </div>

          {/* Subject Selector Dropdown (Mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <BookOpen size={15} style={{ position: 'absolute', left: '12px', color: 'var(--accent)', pointerEvents: 'none' }} />
              <select
                id="mobile-subject-select"
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
              <button
                onClick={onOpenCreateSubject}
                className="btn btn-secondary"
                style={{ padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', flexShrink: 0 }}
              >
                <Plus size={15} /> Subject
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Horizontal Bar Layout */
        <>
          {/* 1. Semester Selector Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {user ? (
              <div className="hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Calendar size={13} /> Semesters:
                </span>
                <button
                  onClick={() => onSelectSemester(null)}
                  className="btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    background: selectedSemester === null ? 'var(--primary)' : '#f8fafc',
                    color: selectedSemester === null ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid ' + (selectedSemester === null ? 'var(--primary)' : 'var(--glass-border)')
                  }}
                >
                  All
                </button>
                {visibleSemesters.map(sem => {
                  const isSelected = selectedSemester === sem.id;
                  const isVisibleToPublic = sem.is_visible !== false;
                  return (
                    <div key={sem.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <button
                        onClick={() => onSelectSemester(sem.id)}
                        className="btn"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          background: isSelected ? 'var(--primary)' : (!isVisibleToPublic ? '#f1f5f9' : '#f8fafc'),
                          color: isSelected ? '#ffffff' : (!isVisibleToPublic ? '#94a3b8' : 'var(--text-main)'),
                          border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--glass-border)'),
                          gap: '4px'
                        }}
                      >
                        {sem.name}
                        <span
                          onClick={(e) => { e.stopPropagation(); onToggleVisibility(sem.id, !sem.is_visible); }}
                          title={isVisibleToPublic ? 'Visible to public' : 'Hidden from public'}
                          style={{ cursor: 'pointer', opacity: 0.8, display: 'inline-flex' }}
                        >
                          {isVisibleToPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                        </span>
                        <span
                          onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${sem.name}"?`)) onDeleteSemester(sem.id); }}
                          title="Delete semester"
                          style={{ cursor: 'pointer', opacity: 0.8, display: 'inline-flex' }}
                        >
                          <X size={12} />
                        </span>
                      </button>
                    </div>
                  );
                })}
                <button onClick={onOpenCreateSemester} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: '6px' }}>
                  <Plus size={13} /> Add
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {visibleSemesters.length > 1 ? (
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <Calendar size={14} style={{ position: 'absolute', left: '10px', color: 'var(--primary)', pointerEvents: 'none' }} />
                    <select
                      id="filter-semester-select-desktop"
                      value={selectedSemester || ''}
                      onChange={(e) => onSelectSemester(e.target.value)}
                      style={{
                        padding: '5px 28px 5px 30px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(79, 70, 229, 0.25)',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      {visibleSemesters.map(sem => (
                        <option key={sem.id} value={sem.id} style={{ color: 'var(--text-main)', background: '#ffffff' }}>
                          {sem.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '9px', color: 'var(--primary)', pointerEvents: 'none' }} />
                  </div>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    border: '1px solid rgba(79, 70, 229, 0.2)',
                    whiteSpace: 'nowrap'
                  }}>
                    <Calendar size={14} />
                    {activeSemesterObj ? activeSemesterObj.name : 'Semester'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div style={{ width: '1px', height: '22px', background: 'var(--glass-border)', flexShrink: 0 }} />

          {/* 2. Subjects Selector Section */}
          <div className="hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
            {subjects.map(subject => {
              const isSelected = selectedSubject === subject.id;
              return (
                <div
                  key={subject.id}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <button
                    onClick={() => onSelectSubject(subject.id)}
                    className="btn"
                    style={{
                      padding: user ? '5px 8px 5px 10px' : '5px 12px',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--primary)' : '#f8fafc',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--glass-border)'),
                      fontWeight: isSelected ? 600 : 400,
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {subject.subject_number && (
                      <span style={{ fontWeight: 600, opacity: 0.9 }}>
                        {subject.subject_number} -
                      </span>
                    )}
                    {subject.name}
                    {user && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditSubject) onEditSubject(subject);
                          }}
                          title="Edit Subject"
                          style={{ display: 'inline-flex', opacity: 0.75, cursor: 'pointer', padding: '1px' }}
                        >
                          <Edit2 size={12} />
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${subject.name}"?`)) onDeleteSubject(subject.id);
                          }}
                          title="Delete Subject"
                          style={{ display: 'inline-flex', opacity: 0.75, cursor: 'pointer', padding: '1px' }}
                        >
                          <X size={13} />
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}

            {user && (
              <button onClick={onOpenCreateSubject} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                <Plus size={14} /> Add Subject
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
