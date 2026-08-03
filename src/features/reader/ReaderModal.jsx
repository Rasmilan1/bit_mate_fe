import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, SidebarClose, SidebarOpen, Download, FileText, MoveHorizontal } from 'lucide-react';
import SplitNotesEditor from './SplitNotesEditor';
import { downloadPdfFile } from '../../services/api';

export default function ReaderModal({ material, onClose }) {
  if (!material) return null;
  return <ReaderModalContent key={material.id} material={material} onClose={onClose} />;
}

function ReaderModalContent({ material, onClose }) {
  const [showPdf, setShowPdf] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [splitRatio, setSplitRatio] = useState(55); // PDF width percentage
  const [isDragging, setIsDragging] = useState(false);

  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'notes' on small screens
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [blobUrl, setBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(Boolean(material.file_url));
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let createdUrl = null;

    if (!material.file_url) {
      setLoadingPdf(false);
      return;
    }

    setLoadingPdf(true);

    fetch(material.file_url)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.blob();
      })
      .then(blob => {
        if (isMounted) {
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
          setLoadingPdf(false);
        }
      })
      .catch(err => {
        console.warn('PDF Blob load fallback to direct URL:', err);
        if (isMounted) {
          setBlobUrl(material.file_url);
          setLoadingPdf(false);
        }
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [material.file_url]);

  // Draggable Splitter Handler
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.min(Math.max(newRatio, 20), 80));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      userSelect: isDragging ? 'none' : 'auto'
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
            <div style={{ display: 'flex', gap: '6px' }}>
              {/* Hide / Show PDF Toggle */}
              <button
                onClick={() => setShowPdf(!showPdf)}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem' }}
                title={showPdf ? "Hide PDF Panel" : "Show PDF Panel"}
              >
                <FileText size={15} />
                {showPdf ? 'Hide PDF' : 'Show PDF'}
              </button>

              {/* Hide / Show Notes Toggle */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem' }}
                title={showNotes ? "Hide Notes Panel" : "Show Notes Panel"}
              >
                {showNotes ? <SidebarClose size={15} /> : <SidebarOpen size={15} />}
                {showNotes ? 'Hide Notes' : 'Show Notes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reader Content Body */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          flexDirection: isMobile ? 'column' : 'row',
          position: 'relative'
        }}
      >
        {/* PDF Viewer Container */}
        {showPdf && (!isMobile || activeTab === 'pdf') && (
          <div style={{
            flex: isMobile ? '1 1 100%' : (showNotes ? `0 0 ${splitRatio}%` : '1 1 100%'),
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e2e8f0',
            position: 'relative',
            pointerEvents: isDragging ? 'none' : 'auto'
          }}>
            {material.file_url ? (
              loadingPdf ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading document viewer...</p>
                </div>
              ) : (
                <iframe
                  src={blobUrl || material.file_url}
                  title={material.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                <BookOpen size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>Viewing mode for: <strong>{material.title}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Draggable Split Resizer Bar (Desktop only, when both are visible) */}
        {!isMobile && showPdf && showNotes && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              width: '8px',
              height: '100%',
              cursor: 'col-resize',
              background: isDragging ? 'var(--primary)' : '#e2e8f0',
              transition: isDragging ? 'none' : 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              userSelect: 'none',
              flexShrink: 0
            }}
            title="Drag left or right to adjust size"
          >
            <div style={{ width: '2px', height: '24px', background: isDragging ? '#ffffff' : '#94a3b8', borderRadius: '1px' }} />
          </div>
        )}

        {/* Notes Editor Container */}
        {showNotes && (!isMobile ? true : activeTab === 'notes') && (
          <div style={{
            flex: isMobile ? '1 1 100%' : (showPdf ? '1 1 0%' : '1 1 100%'),
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            background: '#ffffff'
          }}>
            <div style={{ width: '100%', maxWidth: !showPdf ? '920px' : '100%', height: '100%' }}>
              <SplitNotesEditor materialId={material.id} material={material} />
            </div>
          </div>
        )}

        {/* Fallback if both panels are hidden */}
        {!showPdf && !showNotes && !isMobile && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Both panels are hidden.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowPdf(true)} className="btn btn-primary">
                Show PDF
              </button>
              <button onClick={() => setShowNotes(true)} className="btn btn-secondary">
                Show Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
