import React, { useState } from 'react';
import { X, BookOpen, SidebarClose, SidebarOpen, Download } from 'lucide-react';
import SplitNotesEditor from './SplitNotesEditor';
import { downloadPdfFile } from '../../services/api';

export default function ReaderModal({ material, onClose }) {
  if (!material) return null;
  return <ReaderModalContent key={material.id} material={material} onClose={onClose} />;
}

function ReaderModalContent({ material, onClose }) {
  const [showNotes, setShowNotes] = useState(true);
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'notes' on small screens
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pdfViewerSrc = material.file_url && /^https?:\/\//i.test(material.file_url)
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(material.file_url)}&embedded=true`
    : material.file_url;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Reader Navbar */}
      <div style={{
        height: '60px',
        padding: '0 clamp(12px, 3vw, 24px)',
        background: '#ffffff',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 10px', flexShrink: 0 }}>
            <X size={18} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {material.title}
            </h3>
          </div>
        </div>

        {/* Reader Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {material.file_url && (
            <button
              onClick={() => downloadPdfFile(material.file_url, material.title)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              title="Download PDF to Device"
            >
              <Download size={15} />
              <span className="hide-on-mobile">Download PDF</span>
            </button>
          )}

          {isMobile ? (
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
              <button
                onClick={() => setActiveTab('pdf')}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'pdf' ? '#ffffff' : 'transparent',
                  color: activeTab === 'pdf' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                PDF View
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'notes' ? '#ffffff' : 'transparent',
                  color: activeTab === 'notes' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Notes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              {showNotes ? <SidebarClose size={16} /> : <SidebarOpen size={16} />}
              {showNotes ? 'Hide Notes' : 'Open Notes'}
            </button>
          )}
        </div>
      </div>

      {/* Reader Content Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* PDF Viewer Container */}
        {(!isMobile || activeTab === 'pdf') && (
          <div style={{
            flex: isMobile ? '1 1 100%' : (showNotes ? '1 1 60%' : '1 1 100%'),
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e2e8f0',
            position: 'relative'
          }}>
            {material.file_url ? (
              <iframe
                src={pdfViewerSrc}
                title={material.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                <BookOpen size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>Viewing mode for: <strong>{material.title}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Notes Editor */}
        {(!isMobile ? showNotes : activeTab === 'notes') && (
          <div style={{
            flex: isMobile ? '1 1 100%' : '1 1 40%',
            maxWidth: isMobile ? '100%' : '540px',
            minWidth: isMobile ? '100%' : '320px',
            height: '100%'
          }}>
            <SplitNotesEditor materialId={material.id} />
          </div>
        )}
      </div>
    </div>
  );
}
