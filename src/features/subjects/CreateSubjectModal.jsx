import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

const PRESET_COLORS = ['#4f46e5', '#0d9488', '#10b981', '#d97706', '#8b5cf6', '#06b6d4', '#ef4444'];

function formatWeekInfo(val) {
  if (!val) return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (/^week\b/i.test(trimmed)) {
    return trimmed.replace(/^week\s*/i, 'Week ');
  }
  return `Week ${trimmed}`;
}

export default function CreateSubjectModal({ isOpen, onClose, onCreate, semesters = [], defaultSemesterId = null }) {
  const [name, setName] = useState('');
  const [subjectNumber, setSubjectNumber] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [semesterId, setSemesterId] = useState(defaultSemesterId || (semesters[0]?.id || ''));

  React.useEffect(() => {
    if (defaultSemesterId) {
      setSemesterId(defaultSemesterId);
    } else if (semesters.length > 0) {
      setSemesterId(semesters[0].id);
    }
  }, [defaultSemesterId, semesters]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      subject_number: subjectNumber.trim(),
      color: selectedColor,
      semester_id: semesterId || null
    });
    setName('');
    setSubjectNumber('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '28px',
        position: 'relative',
        background: '#ffffff'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={20} style={{ color: 'var(--primary)' }} />
          Create New Subject
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {semesters.length > 0 && (
            <div>
              <label htmlFor="create-subject-semester-select" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Semester
              </label>
              <select
                id="create-subject-semester-select"
                name="semesterId"
                className="input-field"
                value={semesterId}
                onChange={e => setSemesterId(e.target.value)}
                style={{ width: '100%' }}
              >
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="create-subject-name" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Subject Name
            </label>
            <input
              id="create-subject-name"
              name="subjectName"
              type="text"
              required
              className="input-field"
              placeholder="e.g., Quantum Mechanics, Calculus III"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="create-subject-number" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Subject Code / No.
            </label>
            <input
              id="create-subject-number"
              name="subjectNumber"
              type="text"
              className="input-field"
              placeholder="e.g., CS101, 1"
              value={subjectNumber}
              onChange={e => setSubjectNumber(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
