import React from 'react';
import MaterialCard from './MaterialCard';
import { BookOpen, Upload } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function MaterialGrid({ materials, subjects, onOpenReader, onEdit, onDelete, onOpenUpload }) {
  const { user } = useAuth();

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
