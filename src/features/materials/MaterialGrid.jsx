import React from 'react';
import MaterialCard from './MaterialCard';
import { BookOpen, Upload, Calendar } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getCurrentAcademicWeek } from '../../utils/weekHelper';

export default function MaterialGrid({ materials, subjects, onOpenReader, onEdit, onDelete, onOpenUpload }) {
  const { user } = useAuth();
  const currentWeek = getCurrentAcademicWeek();

  if (!materials || materials.length === 0) {
    return (
      <div className="glass-card" style={{
        padding: '60px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BookOpen size={32} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>No Study Materials Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>
            No PDF study materials uploaded for this selection yet.
          </p>
        </div>
        {user && (
          <button onClick={onOpenUpload} className="btn btn-primary" style={{ marginTop: '8px' }}>
            <Upload size={18} />
            Upload First PDF Material
          </button>
        )}
      </div>
    );
  }

  const subjectMap = (subjects || []).reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Dynamic Semester Progress Tracker Header */}
      <div style={{
        padding: '10px 14px',
        borderRadius: '10px',
        background: '#ffffff',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '0.8rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        marginBottom: '2px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}>
          <Calendar size={15} style={{ color: 'var(--primary)' }} />
          <span>Semester Timeline</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ padding: '2px 8px', borderRadius: '5px', background: '#ecfdf5', color: '#047857', fontSize: '0.74rem', fontWeight: 600, border: '1px solid #a7f3d0' }}>
            ✓ Finished (Weeks 1–{Math.max(1, currentWeek - 1)})
          </span>
          <span style={{ padding: '2px 8px', borderRadius: '5px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: '#ffffff', fontSize: '0.74rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(79,70,229,0.3)' }}>
            ⚡ Current: Week {currentWeek}
          </span>
          <span style={{ padding: '2px 8px', borderRadius: '5px', background: '#f1f5f9', color: '#64748b', fontSize: '0.74rem', fontWeight: 500, border: '1px solid #cbd5e1' }}>
            Upcoming (Week {currentWeek + 1}+)
          </span>
        </div>
      </div>

      {materials.map(material => (
        <MaterialCard
          key={material.id}
          material={material}
          subject={subjectMap[material.subject_id]}
          onOpenReader={onOpenReader}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
