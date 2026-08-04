import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, FileText, Download, Edit2, Sparkles, Loader2, Check } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { downloadPdfFile, fetchNotes, saveNotes } from '../../services/api';

export default function MaterialCard({ material, subject, onOpenReader, onEdit, onDelete }) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [hasNotes, setHasNotes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!material.id) return;
    fetchNotes(material.id)
      .then(data => {
        if (data && data.content && data.content.trim()) {
          setHasNotes(true);
        } else {
          setHasNotes(false);
        }
      })
      .catch(() => setHasNotes(false));
  }, [material.id]);

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

  const handleAutoGenerateCard = async (e) => {
    e.stopPropagation();
    if (!material.id || !user || isGenerating) return;
    setIsGenerating(true);
    try {
      const matTitle = material.title || 'Study Topic';
      const weekInfo = rawWeek ? ` (${rawWeek})` : '';

      const prompt = `You are a top university professor creating easy-to-read, crystal-clear study notes for students.
Create a structured, readable study summary and exam takeaways for:
- Material Title: ${matTitle}${weekInfo}

IMPORTANT FORMATTING RULES:
1. Do NOT use LaTeX math tags like \\text{} or \\texttt{}. Write equations simply like:
   Class = State (Instance Variables) + Behavior (Methods)
2. Use clean Markdown headings:
   ### 📌 Overview & Core Concepts
   ### 🔑 Key Definitions & Takeaways
   ### 📐 Key Formulas & Equations
   ### 💡 Exam Tips & Gotchas
3. Use bolding (**term**) for key definitions.
4. Keep bullet points concise and easy to read.`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || atob('QVEuQWI4Uk42SVpUVkxqXzNOaV9RZzFQQ0xsTXlFRUJlcHBoWlVlVUdKclNCeVZpY1NlR1E=');
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      const data = await res.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        await saveNotes(material.id, generatedText);
        setHasNotes(true);
      }
    } catch (err) {
      console.error('Card auto-generate error:', err);
      alert('Failed to generate summary with Gemini 1.5 Flash. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="glass-card animate-fade-in"
      style={{
        padding: isMobile ? '12px 14px' : '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        background: '#ffffff',
        cursor: hasPdf ? 'pointer' : 'default',
        borderRadius: '12px',
        opacity: hasPdf ? 1 : 0.85,
        transition: 'all 0.15s ease-in-out'
      }}
    >
      {/* Left PDF Icon Badge */}
      <div style={{
        width: isMobile ? '38px' : '44px',
        height: isMobile ? '38px' : '44px',
        borderRadius: '10px',
        backgroundColor: hasPdf ? 'var(--primary-light)' : '#f1f5f9',
        color: hasPdf ? 'var(--primary)' : '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <FileText size={isMobile ? 20 : 22} />
      </div>

      {/* Center Title & Metadata */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <h4 style={{
          fontSize: isMobile ? '0.88rem' : '0.95rem',
          fontWeight: 600,
          color: hasPdf ? 'var(--text-main)' : '#64748b',
          lineHeight: 1.3,
          wordBreak: 'break-word',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {weekLabel && (
            <span style={{
              display: 'inline-block',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '5px',
              backgroundColor: hasPdf ? 'var(--primary-light)' : '#e2e8f0',
              color: hasPdf ? 'var(--primary)' : '#64748b',
              border: '1px solid ' + (hasPdf ? 'rgba(79, 70, 229, 0.2)' : '#cbd5e1'),
              marginRight: '6px',
              verticalAlign: 'middle'
            }}>
              {weekLabel}
            </span>
          )}
          {material.title}
        </h4>

        {/* Metadata info row */}
        <div style={{
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '5px 8px',
          lineHeight: 1.2
        }}>
          <span style={{ fontWeight: 500, color: '#475569' }}>
            {subject ? subject.name : 'General'}
          </span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span style={{ fontWeight: 600, color: hasPdf ? 'var(--primary)' : '#94a3b8' }}>
            {hasPdf ? formatFileSize(material.file_size) : 'No PDF attached'}
          </span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Admin Auto-Generate Summary Button / Ready Badge */}
        {user && hasPdf && (
          !hasNotes ? (
            <button
              type="button"
              onClick={handleAutoGenerateCard}
              disabled={isGenerating}
              className="btn"
              style={{
                padding: isMobile ? '5px 8px' : '6px 11px',
                fontSize: '0.76rem',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                gap: '4px',
                cursor: isGenerating ? 'wait' : 'pointer'
              }}
              title="Auto Generate Summary with Gemini 1.5 Flash"
            >
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              <span>{isGenerating ? 'Generating...' : 'Auto Summary'}</span>
            </button>
          ) : (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Summary Available"
            >
              <Check size={12} /> {!isMobile && 'Summary Ready'}
            </span>
          )
        )}

        {hasPdf && material.file_url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadPdfFile(material.file_url, material.title);
            }}
            className="btn btn-secondary"
            style={{
              padding: isMobile ? '6px 9px' : '7px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              gap: '4px'
            }}
            title="Download PDF"
          >
            <Download size={15} />
            {!isMobile && <span>Download</span>}
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
                style={{ padding: isMobile ? '6px 8px' : '7px 10px', borderRadius: '8px' }}
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
              style={{ padding: isMobile ? '6px 8px' : '7px 10px', borderRadius: '8px' }}
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
