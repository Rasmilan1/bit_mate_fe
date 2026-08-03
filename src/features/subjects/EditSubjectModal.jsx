import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';

function formatWeekInfo(val) {
  if (!val) return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (/^week\b/i.test(trimmed)) {
    return trimmed.replace(/^week\s*/i, 'Week ');
  }
  return `Week ${trimmed}`;
}

export default function EditSubjectModal({ isOpen, onClose, onUpdate, subject = null, semesters = [] }) {
  const [name, setName] = useState('');
  const [subjectNumber, setSubjectNumber] = useState('');
  const [semesterId, setSemesterId] = useState('');

  useEffect(() => {
    if (subject) {
      setName(subject.name || '');
      setSubjectNumber(subject.subject_number || '');
      setSemesterId(subject.semester_id || (semesters[0]?.id || ''));
    }
  }, [subject, semesters]);

  if (!isOpen || !subject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdate(subject.id, {
      name: name.trim(),
      subject_number: subjectNumber.trim(),
      semester_id: semesterId || null
    });
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
          <Edit2 size={20} style={{ color: 'var(--primary)' }} />
          Edit Subject
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {semesters.length > 0 && (
            <div>
              <label htmlFor="edit-subject-semester-select" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Semester
              </label>
              <select
                id="edit-subject-semester-select"
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
            <label htmlFor="edit-subject-name" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Subject Name
            </label>
            <input
              id="edit-subject-name"
              name="subjectName"
              type="text"
              required
              className="input-field"
              placeholder="e.g., Quantum Mechanics"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="edit-subject-number" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Subject Code / No.
            </label>
            <input
              id="edit-subject-number"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
