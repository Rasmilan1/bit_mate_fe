import React from 'react';
import { BookOpen, Trash2, FileText, Download, Edit2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { downloadPdfFile } from '../../services/api';

export default function MaterialCard({ material, subject, onOpenReader, onEdit, onDelete }) {
  const { user } = useAuth();
  const hasPdf = Boolean(material.file_url);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'PDF';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  const rawWeek = material.week_info || (subject ? subject.week_info : '');
  const weekLabel = rawWeek
    ? (/^week/i.test(String(rawWeek).trim()) ? String(rawWeek).trim() : `Week ${String(rawWeek).trim()}`)
    : '';

  const handleCardClick = () => {
    if (hasPdf && onOpenReader) {
      onOpenReader(material);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="glass-card animate-fade-in"
      style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        background: '#ffffff',
        cursor: hasPdf ? 'pointer' : 'default',
        borderRadius: '12px',
        opacity: hasPdf ? 1 : 0.82,
        transition: 'all 0.15s ease-in-out'
      }}
    >
      {/* Left PDF Icon Badge */}
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        backgroundColor: hasPdf ? 'var(--primary-light)' : '#f1f5f9',
        color: hasPdf ? 'var(--primary)' : '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <FileText size={22} />
      </div>

      {/* Center Title & Metadata */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: hasPdf ? 'var(--text-main)' : '#64748b',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginBottom: '3px'
        }}>
          {weekLabel && (
            <span style={{
              display: 'inline-block',
              fontSize: '0.76rem',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '5px',
              backgroundColor: hasPdf ? 'var(--primary-light)' : '#e2e8f0',
              color: hasPdf ? 'var(--primary)' : '#64748b',
              border: '1px solid ' + (hasPdf ? 'rgba(79, 70, 229, 0.2)' : '#cbd5e1'),
              marginRight: '8px',
              verticalAlign: 'middle',
              transform: 'translateY(-1px)'
            }}>
              {weekLabel}
            </span>
          )}
          {material.title}
        </h4>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{subject ? subject.name : 'General'}</span>
          <span>•</span>
          <span>{hasPdf ? formatFileSize(material.file_size) : 'No PDF attached'}</span>
        </div>
      </div>

      {/* Right Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {hasPdf && material.file_url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadPdfFile(material.file_url, material.title);
            }}
            className="btn btn-secondary"
            style={{ padding: '7px 11px', borderRadius: '8px', fontSize: '0.82rem', gap: '6px' }}
            title="Download PDF"
          >
            <Download size={15} />
            <span className="hide-mobile">Download</span>
          </button>
        )}
        {user && (
          <>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(material);
                }}
                className="btn btn-secondary"
                style={{ padding: '7px 10px', borderRadius: '8px' }}
                title="Edit Material"
              >
                <Edit2 size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(material.id);
              }}
              className="btn btn-danger"
              style={{ padding: '7px 10px', borderRadius: '8px' }}
              title="Delete Material"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
