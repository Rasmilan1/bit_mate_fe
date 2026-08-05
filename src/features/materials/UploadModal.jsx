import React, { useState } from 'react';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';
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

export default function UploadModal({ isOpen, onClose, subjects, materials = [], onUpload, defaultSubjectId = '' }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || (subjects[0]?.id || ''));
  const [weekInfo, setWeekInfo] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const matchDefault = defaultSubjectId && subjects.some(s => String(s.id) === String(defaultSubjectId));
      if (matchDefault) {
        setSubjectId(defaultSubjectId);
      } else if (subjects.length > 0) {
        setSubjectId(subjects[0].id);
      } else {
        setSubjectId('');
      }
    }
  }, [isOpen, defaultSubjectId, subjects]);

  // Auto-suggest next week number based on existing PDF materials in selected subject
  React.useEffect(() => {
    if (isOpen) {
      const targetSubjId = subjectId || defaultSubjectId;
      const subjMaterials = materials.filter(m => !targetSubjId || String(m.subject_id) === String(targetSubjId));
      let maxWeek = 0;
      subjMaterials.forEach(m => {
        const matches = (m.week_info || '').match(/\d+/g);
        if (matches) {
          matches.forEach(str => {
            const num = parseInt(str, 10);
            if (!isNaN(num) && num > maxWeek) maxWeek = num;
          });
        }
      });
      const nextWeek = maxWeek > 0 ? maxWeek + 1 : 1;
      setWeekInfo(String(nextWeek));
    }
  }, [isOpen, subjectId, defaultSubjectId, materials]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
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
        if (!title) {
          setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);
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
        const payload = {
          title: title.trim(),
          subject_id: subjectId || null,
          week_info: formatWeekInfo(weekInfo),
          file_url: fileData.file_url,
          file_path: fileData.file_path,
          file_size: fileData.file_size,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
        };
        await onUpload(payload);
      } else {
        const formData = new FormData();
        if (file) {
          formData.append('pdfFile', file);
        }
        formData.append('title', title.trim());
        formData.append('subject_id', subjectId || '');
        formData.append('week_info', formatWeekInfo(weekInfo));
        if (tags) formData.append('tags', tags);

        await onUpload(formData);
      }
      
      setFile(null);
      setTitle('');
      setSubjectId('');
      setWeekInfo('');
      setTags('');
      onClose();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
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
          disabled={isUploading}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UploadCloud size={22} style={{ color: 'var(--primary)' }} />
          Add Study Material / Entry
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Warning block if active semester has 0 subjects */}
          {subjects.length === 0 && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#fffbebe6',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '0.84rem',
              lineHeight: 1.4
            }}>
              ⚠️ <strong>No subjects in this semester yet.</strong><br />
              Please create a subject for this semester first before uploading PDF materials.
            </div>
          )}

          {/* File Dropzone (Optional) */}
          <div
            onClick={() => document.getElementById('pdf-file-input').click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: '2px dashed ' + (isDragOver || file ? 'var(--primary)' : 'var(--glass-border)'),
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragOver || file ? 'var(--primary-light)' : '#f8fafc',
              transition: 'all 0.2s ease',
              transform: isDragOver ? 'scale(1.02)' : 'none'
            }}
          >
            <input
              id="pdf-file-input"
              name="pdfFile"
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--primary)' }}>
                <FileText size={24} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</span>
              </div>
            ) : (
              <div>
                <UploadCloud size={28} style={{ color: 'var(--text-muted)', marginBottom: '6px' }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>Attach PDF File <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Click or drop file here</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="upload-title" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Document Title / Topic
            </label>
            <input
              id="upload-title"
              name="title"
              type="text"
              required
              className="input-field"
              placeholder="e.g., Chapter 4: Data Structures & Algorithms"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="upload-week-info" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Week / Order
            </label>
            <input
              id="upload-week-info"
              name="weekInfo"
              type="text"
              className="input-field"
              placeholder="e.g., 1 or 2"
              value={weekInfo}
              onChange={e => setWeekInfo(e.target.value.replace(/[^0-9,\-\s]/g, ''))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} disabled={isUploading} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim() || isUploading || subjects.length === 0} className="btn btn-primary">
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
