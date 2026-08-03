import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function SearchBar({ searchQuery, setSearchQuery, onOpenUpload }) {
  const { user } = useAuth();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '28px',
      flexWrap: 'wrap'
    }}>
      <div style={{ position: 'relative', flex: '1 1 220px', width: '100%' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dim)' }} />
        <input
          id="search-materials-input"
          name="searchQuery"
          type="text"
          className="input-field"
          placeholder="Search materials by title or #tags..."
          style={{ paddingLeft: '42px', height: '44px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {user && (
        <button onClick={onOpenUpload} className="btn btn-primary" style={{ height: '44px', whiteSpace: 'nowrap' }}>
          <Plus size={18} />
          Upload PDF Material
        </button>
      )}
    </div>
  );
}
