import React from 'react';
import { Plus, Layers, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function SubjectFilter({ subjects, selectedSubject, onSelectSubject, onOpenCreateModal, onDeleteSubject }) {
  const { user, requireAuth } = useAuth();

  const handleDelete = (e, subjectId, subjectName) => {
    e.stopPropagation();
    if (!user) {
      requireAuth();
      return;
    }
    if (window.confirm(`⚠️ Are you sure you want to delete "${subjectName}"?\n\nDeleting this subject will automatically delete all PDFs and study notes assigned to it.`)) {
      onDeleteSubject(subjectId);
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} />
          Subjects
        </h2>
      </div>

      <div className="hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => onSelectSubject(null)}
          className="btn"
          style={{
            background: selectedSubject === null ? 'var(--primary)' : '#ffffff',
            color: selectedSubject === null ? '#ffffff' : 'var(--text-muted)',
            border: '1px solid ' + (selectedSubject === null ? 'var(--primary)' : 'var(--glass-border)'),
            padding: '8px 16px',
            fontSize: '0.88rem',
            borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          All Subjects
        </button>

      {subjects.map(subject => {
        const isSelected = selectedSubject === subject.id;
        return (
          <div key={subject.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <button
              onClick={() => onSelectSubject(subject.id)}
              className="btn"
              style={{
                background: isSelected ? subject.color : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                border: '1px solid ' + (isSelected ? subject.color : 'var(--glass-border)'),
                padding: user ? '8px 12px 8px 14px' : '8px 14px',
                fontSize: '0.88rem',
                borderRadius: '10px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                gap: '8px'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isSelected ? '#ffffff' : subject.color,
                display: 'inline-block'
              }} />
              {subject.name}

              {user && (
                <span
                  onClick={(e) => handleDelete(e, subject.id, subject.name)}
                  title={`Delete ${subject.name} and all its PDFs`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    borderRadius: '50%',
                    opacity: 0.6,
                    cursor: 'pointer',
                    marginLeft: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={14} />
                </span>
              )}
            </button>
          </div>
        );
      })}

        {user && (
          <button
            onClick={onOpenCreateModal}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <Plus size={16} />
            Add Subject
          </button>
        )}
      </div>
    </div>
  );
}
