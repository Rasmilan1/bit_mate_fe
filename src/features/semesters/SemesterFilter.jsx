import React from 'react';
import { Plus, Calendar, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function SemesterFilter({
  semesters,
  selectedSemester,
  onSelectSemester,
  onOpenCreateModal,
  onDeleteSemester,
  onToggleVisibility
}) {
  const { user, requireAuth } = useAuth();

  const handleDelete = (e, semesterId, semesterName) => {
    e.stopPropagation();
    if (!user) {
      requireAuth();
      return;
    }
    if (window.confirm(`⚠️ Delete "${semesterName}"?\n\nThis will permanently delete this semester and all subjects, PDFs, and study notes inside it.`)) {
      onDeleteSemester(semesterId);
    }
  };

  const handleToggle = (e, sem) => {
    e.stopPropagation();
    if (onToggleVisibility) {
      onToggleVisibility(sem.id, !sem.is_visible);
    }
  };

  // Unauthenticated visitors only see semesters marked as visible
  const visibleSemesters = user
    ? semesters
    : semesters.filter(s => s.is_visible !== false);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} />
          Semesters
        </h2>
      </div>

      <div className="hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
        {/* All Semesters Option (Signed-in admin only) */}
        {user && (
          <button
            onClick={() => onSelectSemester(null)}
            className="btn"
            style={{
              background: selectedSemester === null ? 'var(--primary)' : '#ffffff',
              color: selectedSemester === null ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid ' + (selectedSemester === null ? 'var(--primary)' : 'var(--glass-border)'),
              padding: '8px 16px',
              fontSize: '0.88rem',
              fontWeight: 500,
              borderRadius: '10px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            All Semesters
          </button>
        )}

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
                  background: isSelected ? 'var(--primary)' : (user && !isVisibleToPublic ? '#f1f5f9' : '#ffffff'),
                  color: isSelected ? '#ffffff' : (user && !isVisibleToPublic ? '#94a3b8' : 'var(--text-main)'),
                  border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--glass-border)'),
                  padding: user ? '8px 10px 8px 14px' : '8px 16px',
                  fontSize: '0.88rem',
                  fontWeight: isSelected ? 600 : 400,
                  borderRadius: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  gap: '6px',
                  opacity: user && !isVisibleToPublic ? 0.75 : 1
                }}
              >
                {sem.name}

                {/* Admin controls for public visibility & deletion */}
                {user && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                    {/* Visibility Toggle Icon */}
                    <span
                      onClick={(e) => handleToggle(e, sem)}
                      title={isVisibleToPublic ? 'Visible to public (Click to hide from visitors)' : 'Hidden from public (Click to make visible)'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px',
                        borderRadius: '50%',
                        opacity: 0.8,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {isVisibleToPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                    </span>

                    {/* Delete Icon */}
                    <span
                      onClick={(e) => handleDelete(e, sem.id, sem.name)}
                      title={`Delete ${sem.name} and all its subjects`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px',
                        borderRadius: '50%',
                        opacity: 0.8,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <X size={14} />
                    </span>
                  </div>
                )}
              </button>
            </div>
          );
        })}

        {/* Add Semester Button (Signed-in users only) */}
        {user && (
          <button
            onClick={onOpenCreateModal}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <Plus size={16} />
            Add Semester
          </button>
        )}
      </div>
    </div>
  );
}
