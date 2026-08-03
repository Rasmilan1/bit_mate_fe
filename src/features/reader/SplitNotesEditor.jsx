import React, { useState, useEffect } from 'react';
import { fetchNotes, saveNotes } from '../../services/api';
import { Save, Check, FileEdit } from 'lucide-react';

export default function SplitNotesEditor({ materialId }) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (!materialId) return;
    fetchNotes(materialId)
      .then(data => {
        setNotes(data.content || '');
      })
      .catch(err => console.error('Error loading notes:', err));
  }, [materialId]);

  const handleNotesChange = (e) => {
    const text = e.target.value;
    setNotes(text);
  };

  const handleSave = async () => {
    if (!materialId) return;
    setIsSaving(true);
    try {
      await saveNotes(materialId, notes);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff',
      borderLeft: '1px solid var(--glass-border)'
    }}>
      {/* Editor Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileEdit size={18} style={{ color: 'var(--primary)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Study Notes & Summary</h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastSaved && (
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={13} /> Saved at {lastSaved}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="✍️ Write key takeaways, exam formulas, definitions, and questions here..."
          style={{
            flex: 1,
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            resize: 'none'
          }}
        />
      </div>
    </div>
  );
}
