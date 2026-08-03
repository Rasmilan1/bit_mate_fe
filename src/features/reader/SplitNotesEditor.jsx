import React, { useState, useEffect } from 'react';
import { fetchNotes, saveNotes } from '../../services/api';
import { Save, Check, FileEdit, Eye, Edit3, Bold, Heading, List, Quote, Code, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// Simple, robust formatted text renderer for AI pasted markdown/rich text
function renderFormattedContent(text) {
  if (!text || !text.trim()) {
    return (
      <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
        No study summary available yet for this material.
      </div>
    );
  }

  const lines = text.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = (key) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} style={{ paddingLeft: '20px', margin: '8px 0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ lineHeight: 1.5, color: '#334155' }}>
              {parseInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInlineFormatting = (str) => {
    // Replace **bold** with strong
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-main)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} style={{
            background: 'rgba(79, 70, 229, 0.08)',
            color: 'var(--primary)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85em'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers (#, ##, ###)
    if (trimmed.startsWith('#')) {
      flushList(idx);
      const level = trimmed.match(/^#+/)[0].length;
      const titleText = trimmed.replace(/^#+\s*/, '');
      const fontSize = level === 1 ? '1.15rem' : level === 2 ? '1.05rem' : '0.96rem';
      elements.push(
        <h4 key={idx} style={{
          fontSize,
          fontWeight: 700,
          color: 'var(--primary)',
          margin: '14px 0 6px',
          paddingBottom: '3px',
          borderBottom: level <= 2 ? '1px solid #f1f5f9' : 'none'
        }}>
          {parseInlineFormatting(titleText)}
        </h4>
      );
    }
    // Callouts / Quotes (>)
    else if (trimmed.startsWith('>')) {
      flushList(idx);
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div key={idx} style={{
          background: 'var(--accent-light)',
          borderLeft: '4px solid var(--accent)',
          padding: '8px 12px',
          borderRadius: '0 8px 8px 0',
          margin: '10px 0',
          color: '#0f766e',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {parseInlineFormatting(quoteText)}
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
        <p key={idx} style={{ margin: '4px 0', lineHeight: 1.6, color: '#334155', fontSize: '0.91rem' }}>
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);
  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
}

export default function SplitNotesEditor({ materialId }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState(user ? 'edit' : 'preview');

  useEffect(() => {
    if (!materialId) return;
    fetchNotes(materialId)
      .then(data => {
        setNotes(data.content || '');
      })
      .catch(err => console.error('Error loading notes:', err));
  }, [materialId]);

  useEffect(() => {
    // If visitor, lock to preview mode
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
    if (!materialId || !user) return;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '5px 11px', fontSize: '0.78rem', borderRadius: '7px' }}
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
            placeholder="✍️ Paste AI notes, ChatGPT formatting, or type study summaries here...&#10;&#10;Supports:&#10;### Heading 3&#10;**Bold text**&#10;* Bullet point list&#10;> Key takeaway highlight"
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
            {renderFormattedContent(notes)}
          </div>
        )}
      </div>
    </div>
  );
}
