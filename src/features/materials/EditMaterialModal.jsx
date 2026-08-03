import React, { useState, useEffect } from 'react';
import { X, Edit2, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { uploadPdfDirectToSupabase } from '../../supabaseClient';

function formatWeekInfo(val) {
  if (!val) return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (/^week\b/i.test(trimmed)) {
    return trimmed.replace(/^week\s*/i, 'Week ');
  }
  return `Week ${trimmed}`;
}

export default function EditMaterialModal({ isOpen, onClose, material, onUpdate }) {
  const [title, setTitle] = useState('');
  const [weekInfo, setWeekInfo] = useState('');
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (material) {
      setTitle(material.title || '');
      const rawWeek = material.week_info || '';
      const numOnly = rawWeek.replace(/^week\s*/i, '');
      setWeekInfo(numOnly);
      setFile(null);
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf')) {
        setFile(droppedFile);
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      let fileData = null;
      if (file) {
        try {
          fileData = await uploadPdfDirectToSupabase(file);
        } catch (directErr) {
          console.warn('Direct upload notice, attempting server upload fallback:', directErr.message);
        }
      }

      if (fileData && fileData.file_url) {
        await onUpdate(material.id, {
          title: title.trim(),
          week_info: formatWeekInfo(weekInfo),
          file_url: fileData.file_url,
          file_path: fileData.file_path,
          file_size: fileData.file_size
        });
      } else if (file) {
        const formData = new FormData();
        formData.append('pdfFile', file);
        formData.append('title', title.trim());
        formData.append('week_info', formatWeekInfo(weekInfo));
        await onUpdate(material.id, formData);
      } else {
        await onUpdate(material.id, {
          title: title.trim(),
          week_info: formatWeekInfo(weekInfo)
        });
      }
      setFile(null);
      onClose();
    } catch (err) {
      alert('Error updating details: ' + err.message);
    } finally {
      setIsSaving(false);
    }
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
          disabled={isSaving}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit2 size={20} style={{ color: 'var(--primary)' }} />
          Edit PDF / Entry Details
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* File Attachment Dropzone */}
          <div
            onClick={() => document.getElementById('edit-pdf-file-input').click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: '2px dashed ' + (isDragOver || file ? 'var(--primary)' : 'var(--glass-border)'),
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragOver || file ? 'var(--primary-light)' : '#f8fafc',
              transition: 'all 0.2s ease',
              transform: isDragOver ? 'scale(1.02)' : 'none'
            }}
          >
            <input
              id="edit-pdf-file-input"
              name="pdfFile"
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)' }}>
                <FileText size={22} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>New PDF: {file.name}</span>
              </div>
            ) : material.file_url ? (
              <div>
                <FileText size={24} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>PDF currently attached</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click or drop file to replace</span>
              </div>
            ) : (
              <div>
                <UploadCloud size={26} style={{ color: 'var(--text-muted)', marginBottom: '4px' }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>Attach PDF File <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Click or drop PDF here to activate</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="edit-title" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Document Title
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              className="input-field"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="edit-week-info" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Week / Order
            </label>
            <input
              id="edit-week-info"
              name="weekInfo"
              type="text"
              className="input-field"
              placeholder="e.g. 1 or 2"
              value={weekInfo}
              onChange={e => setWeekInfo(e.target.value.replace(/[^0-9,\-\s]/g, ''))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} disabled={isSaving} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim() || isSaving} className="btn btn-primary">
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
