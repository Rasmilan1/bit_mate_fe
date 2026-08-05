import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, X, Eye, EyeOff, ChevronDown, Edit2, BookOpen, Check } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

function CustomSubjectDropdown({ subjects, selectedSubject, onSelectSubject }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeSubject = subjects.find(s => s.id === selectedSubject) || subjects[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          fontSize: '0.86rem',
          fontWeight: 600,
          borderRadius: '10px',
          background: 'var(--accent-light)',
          color: 'var(--accent)',
          border: '1px solid rgba(13, 148, 136, 0.3)',
          cursor: 'pointer',
          outline: 'none',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
          <BookOpen size={15} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeSubject
              ? `${activeSubject.subject_number ? `${activeSubject.subject_number} - ` : ''}${activeSubject.name}`
              : 'Select Subject'}
          </span>
        </div>
        <ChevronDown size={15} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          className="hide-scrollbar"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.25)',
            zIndex: 99999,
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '6px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {subjects.map(subj => {
            const isSelected = selectedSubject === subj.id;
            const label = `${subj.subject_number ? `${subj.subject_number} - ` : ''}${subj.name}`;
            return (
              <div
                key={subj.id}
                onClick={() => {
                  onSelectSubject(subj.id);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 600 : 400,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isSelected ? 'var(--accent-light)' : 'transparent',
                  color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
                  {label}
                </span>
                {isSelected && <Check size={14} style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

  const activeSubjectObj = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="glass-card" style={{
      position: 'relative',
      zIndex: 100,
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
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
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
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
        {/* Mobile or Small Screen View: Custom Styled React Dropdown */}
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <CustomSubjectDropdown
              subjects={subjects}
              selectedSubject={selectedSubject}
              onSelectSubject={onSelectSubject}
            />

            {user && (
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
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
            {subjects.length === 0 ? (
              <span style={{ fontSize: '0.81rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '2px 6px' }}>
                No subjects created for this semester yet
              </span>
            ) : (
              subjects.map(subject => {
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
              })
            )}

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
