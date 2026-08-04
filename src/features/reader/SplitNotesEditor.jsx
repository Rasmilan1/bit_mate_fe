import React, { useState, useEffect } from 'react';
import { fetchNotes, saveNotes } from '../../services/api';
import { Save, Check, FileEdit, Eye, Edit3, Bold, Heading, List, Quote, Code, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\texttt\{([^}]+)\}/g, '$1')
    .replace(/\$\$/g, '')
    .replace(/\\/g, '')
    .trim();
}

function parseInlineFormatting(str) {
  if (!str) return '';
  const cleaned = cleanText(str);
  
  // Split on **bold**, *italic*, and `code`
  const parts = cleaned.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} style={{ color: '#0f172a', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
      return <em key={i} style={{ fontStyle: 'italic', color: '#475569' }}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} style={{
          background: '#f1f5f9',
          color: '#0f766e',
          padding: '2px 7px',
          borderRadius: '5px',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '0.86em',
          fontWeight: 600,
          border: '1px solid #e2e8f0'
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// State-of-the-art Executive Study Guide Renderer
function renderFormattedContent(text, isAdmin = false) {
  if (!text || !text.trim()) {
    return (
      <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '30px 0', textAlign: 'center', fontSize: '0.92rem' }}>
        {isAdmin ? (
          <>📖 No study summary generated yet for this material. Click <strong>"Auto Generate (Gemini AI)"</strong> above!</>
        ) : (
          <>📖 No study summary available yet for this material.</>
        )}
      </div>
    );
  }

  const lines = text.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];
  let inCodeBlock = false;
  let codeBlockLines = [];
  let codeLang = '';

  const flushList = (key) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} style={{ paddingLeft: '20px', margin: '10px 0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ lineHeight: 1.65, color: '#334155', fontSize: '0.93rem' }}>
              {parseInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushCodeBlock = (key) => {
    if (inCodeBlock && codeBlockLines.length > 0) {
      const codeText = codeBlockLines.join('\n');
      elements.push(
        <div key={`code-${key}`} style={{
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '14px 18px',
          borderRadius: '10px',
          margin: '14px 0',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
          overflowX: 'auto'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.06em' }}>
            💻 {codeLang || 'SYNTAX BLUEPRINT'}
          </div>
          <pre style={{ margin: 0, fontFamily: 'Consolas, Monaco, "Andale Mono", monospace', fontSize: '0.88rem', lineHeight: 1.5, color: '#38bdf8' }}>
            {codeText}
          </pre>
        </div>
      );
      codeBlockLines = [];
      inCodeBlock = false;
      codeLang = '';
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code block start / end (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(idx);
      } else {
        flushList(idx);
        inCodeBlock = true;
        codeLang = trimmed.replace(/^```/, '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushList(idx);
      elements.push(
        <hr key={idx} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
      );
    }
    // Math Formula line ($$ ... $$ or \text)
    else if (trimmed.startsWith('$$') || trimmed.includes('\\text{') || trimmed.includes('\\texttt{')) {
      flushList(idx);
      elements.push(
        <div key={idx} style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #cbd5e1',
          borderLeft: '4px solid var(--primary)',
          padding: '12px 16px',
          borderRadius: '8px',
          margin: '12px 0',
          fontSize: '0.94rem',
          fontWeight: 600,
          color: '#0f172a',
          fontFamily: 'Consolas, Monaco, monospace'
        }}>
          📐 {cleanText(trimmed)}
        </div>
      );
    }
    // Headers (#, ##, ###)
    else if (trimmed.startsWith('#')) {
      flushList(idx);
      const titleText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '22px 0 10px 0',
          paddingBottom: '6px',
          borderBottom: '2px solid rgba(79, 70, 229, 0.1)'
        }}>
          <div style={{
            width: '6px',
            height: '18px',
            background: 'var(--primary)',
            borderRadius: '3px'
          }} />
          <h4 style={{
            fontSize: '1.02rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {parseInlineFormatting(titleText)}
          </h4>
        </div>
      );
    }
    // Callouts / Quotes (>)
    else if (trimmed.startsWith('>')) {
      flushList(idx);
      const quoteText = trimmed.replace(/^>\s*/, '').replace(/^#+\s*/, '');
      elements.push(
        <div key={idx} style={{
          background: '#f0fdf4',
          borderLeft: '4px solid #10b981',
          padding: '12px 16px',
          borderRadius: '0 10px 10px 0',
          margin: '12px 0',
          color: '#065f46',
          fontSize: '0.92rem',
          fontWeight: 500,
          lineHeight: 1.6,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          💡 <strong>Exam Insight:</strong> {parseInlineFormatting(quoteText)}
        </div>
      );
    }
    // Bullet points (* or -)
    else if (/^[*|-]\s+/.test(trimmed)) {
      inList = true;
      listItems.push(trimmed.replace(/^[*|-]\s+/, ''));
    }
    // Empty line
    else if (!trimmed) {
      flushList(idx);
      elements.push(<div key={idx} style={{ height: '6px' }} />);
    }
    // Regular Paragraph
    else {
      flushList(idx);
      elements.push(
        <p key={idx} style={{ margin: '6px 0', lineHeight: 1.68, color: '#334155', fontSize: '0.93rem' }}>
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);
  flushCodeBlock(lines.length);
  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
}

export default function SplitNotesEditor({ materialId, material }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState(user ? 'edit' : 'preview');

  const hasChanges = notes.trim() !== savedNotes.trim();

  useEffect(() => {
    if (!materialId) return;
    fetchNotes(materialId)
      .then(data => {
        const content = data.content || '';
        setNotes(content);
        setSavedNotes(content);
      })
      .catch(err => console.error('Error loading notes:', err));
  }, [materialId]);

  useEffect(() => {
    if (!user) {
      setActiveTab('preview');
    }
  }, [user]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('notes-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newNotes = notes.substring(0, start) + replacement + notes.substring(end);
    setNotes(newNotes);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleSave = async () => {
    if (!materialId || !user || !hasChanges) return;
    setIsSaving(true);
    try {
      await saveNotes(materialId, notes);
      setSavedNotes(notes);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoGenerateSummary = async () => {
    if (!materialId || !user || isGenerating) return;
    setIsGenerating(true);
    try {
      const matTitle = material?.title || 'Study Topic';
      const weekInfo = material?.week_info ? ` (${material.week_info})` : '';

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
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      const data = await res.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setNotes(generatedText);
        await saveNotes(materialId, generatedText);
        setSavedNotes(generatedText);
        setLastSaved(new Date().toLocaleTimeString());
        setActiveTab('preview');
      }
    } catch (err) {
      console.error('Error generating AI summary:', err);
      alert('Failed to generate AI summary with Gemini 1.5 Flash. Please try again.');
    } finally {
      setIsGenerating(false);
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
        padding: '12px 16px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f8fafc',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileEdit size={17} style={{ color: 'var(--primary)' }} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Summary & Notes
          </h4>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Admin Auto Generate AI Button */}
          {user && (
            <button
              type="button"
              onClick={handleAutoGenerateSummary}
              disabled={isGenerating}
              className="btn"
              style={{
                padding: '5px 11px',
                fontSize: '0.78rem',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)',
                gap: '5px',
                cursor: isGenerating ? 'wait' : 'pointer'
              }}
              title="Auto Generate Summary with Gemini 1.5 Flash"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {isGenerating ? 'Gemini Generating...' : 'Auto Generate (Gemini AI)'}
            </button>
          )}

          {/* Admin Tab Switcher */}
          {user ? (
            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '7px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                style={{
                  padding: '4px 9px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  borderRadius: '5px',
                  border: 'none',
                  background: activeTab === 'edit' ? '#ffffff' : 'transparent',
                  color: activeTab === 'edit' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit3 size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '4px 9px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  borderRadius: '5px',
                  border: 'none',
                  background: activeTab === 'preview' ? '#ffffff' : 'transparent',
                  color: activeTab === 'preview' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={12} /> View
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Read-Only View
            </span>
          )}

          {/* Admin Save Button */}
          {user && (
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="btn btn-primary"
              style={{
                padding: '5px 11px',
                fontSize: '0.78rem',
                borderRadius: '7px',
                opacity: hasChanges && !isSaving ? 1 : 0.55,
                cursor: hasChanges && !isSaving ? 'pointer' : 'not-allowed'
              }}
              title={hasChanges ? "Save changes to database" : "No unsaved changes"}
            >
              <Save size={13} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Formatting Toolbar (Admin Edit Mode Only) */}
      {user && activeTab === 'edit' && (
        <div style={{
          padding: '6px 12px',
          background: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="btn btn-secondary"
            style={{ padding: '3px 7px', fontSize: '0.75rem', borderRadius: '5px' }}
            title="Bold (**text**)"
          >
            <Bold size={13} /> Bold
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ')}
            className="btn btn-secondary"
            style={{ padding: '3px 7px', fontSize: '0.75rem', borderRadius: '5px' }}
            title="Heading (### Title)"
          >
            <Heading size={13} /> Heading
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('* ')}
            className="btn btn-secondary"
            style={{ padding: '3px 7px', fontSize: '0.75rem', borderRadius: '5px' }}
            title="Bullet List (* item)"
          >
            <List size={13} /> List
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            className="btn btn-secondary"
            style={{ padding: '3px 7px', fontSize: '0.75rem', borderRadius: '5px' }}
            title="Highlight Quote (> quote)"
          >
            <Quote size={13} /> Highlight
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            className="btn btn-secondary"
            style={{ padding: '3px 7px', fontSize: '0.75rem', borderRadius: '5px' }}
            title="Code (`code`)"
          >
            <Code size={13} /> Code
          </button>
          {lastSaved && (
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Check size={12} /> Saved {lastSaved}
            </span>
          )}
        </div>
      )}

      {/* Editor or Formatted Summary Preview Body */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {user && activeTab === 'edit' ? (
          <textarea
            id="notes-textarea"
            value={notes}
            onChange={handleNotesChange}
            placeholder="✍️ Paste AI notes, ChatGPT formatting, or type study summaries here...&#10;&#10;Or click 'Auto Generate (Gemini AI)' above!&#10;&#10;Supports:&#10;### Heading 3&#10;**Bold text**&#10;* Bullet point list&#10;> Key takeaway highlight"
            style={{
              flex: 1,
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.91rem',
              lineHeight: 1.6,
              resize: 'none'
            }}
          />
        ) : (
          <div style={{ flex: 1 }}>
            {renderFormattedContent(notes, Boolean(user))}
          </div>
        )}
      </div>
    </div>
  );
}
