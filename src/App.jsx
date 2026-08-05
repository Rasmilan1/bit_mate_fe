import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import AuthModal from './features/auth/AuthModal';
import CreateSemesterModal from './features/semesters/CreateSemesterModal';
import CreateSubjectModal from './features/subjects/CreateSubjectModal';
import EditSubjectModal from './features/subjects/EditSubjectModal';
import SearchBar from './features/materials/SearchBar';
import MaterialGrid from './features/materials/MaterialGrid';
import UploadModal from './features/materials/UploadModal';
import EditMaterialModal from './features/materials/EditMaterialModal';
import ReaderModal from './features/reader/ReaderModal';

import {
  fetchHealth,
  fetchSemesters,
  createSemester,
  deleteSemester,
  toggleSemesterVisibility,
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchMaterials,
  uploadMaterial,
  updateMaterial,
  deleteMaterial
} from './services/api';

function MainAppContent() {
  const { user } = useAuth();
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active filters with localStorage persistence across page refreshes
  const [selectedSemester, setSelectedSemester] = useState(() => {
    return localStorage.getItem('bitmate_selected_semester') || null;
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return localStorage.getItem('bitmate_selected_subject') || null;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectSemester = (semId) => {
    setSelectedSemester(semId);
    if (semId) {
      localStorage.setItem('bitmate_selected_semester', semId);
    } else {
      localStorage.removeItem('bitmate_selected_semester');
    }
  };

  const handleSelectSubject = (subjId) => {
    setSelectedSubject(subjId);
    if (subjId) {
      localStorage.setItem('bitmate_selected_subject', subjId);
    } else {
      localStorage.removeItem('bitmate_selected_subject');
    }
  };

  // Active Modals
  const [isCreateSemesterOpen, setIsCreateSemesterOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [activeMaterial, setActiveMaterial] = useState(null);

  const loadData = async () => {
    try {
      const [healthData, semestersData, subjectsData, materialsData] = await Promise.all([
        fetchHealth().catch(() => ({ supabaseConnected: false })),
        fetchSemesters().catch(() => []),
        fetchSubjects().catch(() => []),
        fetchMaterials().catch(() => [])
      ]);

      setIsSupabaseConnected(Boolean(healthData.supabaseConnected));
      setSemesters(semestersData);
      setSubjects(subjectsData);
      setMaterials(materialsData);
    } catch (err) {
      console.error('Error loading study data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Deduplicate semesters by name and merge visibility correctly
  const uniqueSemesters = React.useMemo(() => {
    const map = new Map();
    (semesters || []).forEach(s => {
      if (!s || !s.name) return;
      const key = s.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, { ...s });
      } else {
        const existing = map.get(key);
        // If ANY instance is hidden (is_visible === false or 'false'), mark the merged semester hidden!
        if (s.is_visible === false || String(s.is_visible) === 'false' || existing.is_visible === false) {
          existing.is_visible = false;
        }
      }
    });
    return Array.from(map.values());
  }, [semesters]);

  // Public visible semesters for non-admin visitors
  const publicSemesters = React.useMemo(() => {
    if (user) return uniqueSemesters;
    return uniqueSemesters.filter(s => s.is_visible !== false && String(s.is_visible) !== 'false');
  }, [uniqueSemesters, user]);

  // Auto-switch away from hidden semesters for normal non-admin visitors
  useEffect(() => {
    if (!user && uniqueSemesters.length > 0) {
      if (publicSemesters.length > 0) {
        const isCurrentPublic = selectedSemester && publicSemesters.some(s => String(s.id) === String(selectedSemester));
        if (!isCurrentPublic) {
          handleSelectSemester(publicSemesters[0].id);
        }
      } else {
        setSelectedSemester(null);
      }
    }
  }, [user, uniqueSemesters, publicSemesters, selectedSemester]);

  // Filter subjects strictly based on public visibility and selected semester
  const visibleSubjects = React.useMemo(() => {
    if (user) return subjects; // Admin sees all subjects
    const validPublicSemIds = new Set(publicSemesters.map(s => String(s.id)));
    return subjects.filter(s => {
      if (!s.semester_id) return true;
      return validPublicSemIds.has(String(s.semester_id));
    });
  }, [subjects, publicSemesters, user]);

  const filteredSubjects = React.useMemo(() => {
    if (!selectedSemester) return visibleSubjects;
    // If selected semester is hidden for non-admin, return 0 subjects
    if (!user && !publicSemesters.some(s => String(s.id) === String(selectedSemester))) {
      return [];
    }
    return visibleSubjects.filter(s => String(s.semester_id) === String(selectedSemester));
  }, [visibleSubjects, publicSemesters, selectedSemester, user]);

  // Persist and restore selected subject across refreshes
  useEffect(() => {
    if (filteredSubjects.length > 0) {
      const storedSubject = localStorage.getItem('bitmate_selected_subject');
      const matchesStored = storedSubject && filteredSubjects.some(s => String(s.id) === String(storedSubject));
      const matchesSelected = selectedSubject && filteredSubjects.some(s => String(s.id) === String(selectedSubject));

      if (matchesStored) {
        if (selectedSubject !== storedSubject) {
          setSelectedSubject(storedSubject);
        }
      } else if (!matchesSelected) {
        const defaultSubj = filteredSubjects[0].id;
        handleSelectSubject(defaultSubj);
      }
    } else {
      setSelectedSubject(null);
    }
  }, [filteredSubjects]);

  // Filter materials based on search query, selected semester, & selected subject
  const filteredMaterials = materials.filter(m => {
    // Non-admin visitors cannot see materials of hidden subjects/semesters
    if (!user) {
      const validSubjectIds = new Set(visibleSubjects.map(s => String(s.id)));
      if (m.subject_id && !validSubjectIds.has(String(m.subject_id))) {
        return false;
      }
    }

    // If a subject tab is selected
    if (selectedSubject) {
      if (m.subject_id && String(m.subject_id) !== String(selectedSubject)) {
        return false;
      }
    } else if (selectedSemester) {
      // If a semester tab is selected, match materials in this semester
      const subjectIdsInSemester = new Set(filteredSubjects.map(s => String(s.id)));
      if (m.subject_id && !subjectIdsInSemester.has(String(m.subject_id))) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (m.title || '').toLowerCase().includes(q);
      const matchTags = (m.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTags) return false;
    }

    return true;
  });

  const handleCreateSemester = async (semesterData) => {
    try {
      const created = await createSemester(semesterData);
      setSemesters([...semesters, created]);
      setSelectedSemester(created.id);
      loadData();
    } catch (err) {
      alert('Error creating semester: ' + err.message);
    }
  };

  const handleDeleteSemester = async (semesterId) => {
    try {
      await deleteSemester(semesterId);
      if (selectedSemester === semesterId) {
        setSelectedSemester(null);
      }
      loadData();
    } catch (err) {
      alert('Error deleting semester: ' + err.message);
    }
  };

  const handleCreateSubject = async (subjectData) => {
    try {
      const created = await createSubject(subjectData);
      setSubjects([...subjects, created]);
      loadData();
    } catch (err) {
      alert('Error creating subject: ' + err.message);
    }
  };

  const handleUpdateSubject = async (subjectId, subjectData) => {
    try {
      const updated = await updateSubject(subjectId, subjectData);
      setSubjects(subjects.map(s => s.id === subjectId ? updated : s));
      loadData();
    } catch (err) {
      alert('Error updating subject: ' + err.message);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      await deleteSubject(subjectId);
      if (selectedSubject === subjectId) {
        setSelectedSubject(null);
      }
      setSubjects(subjects.filter(s => s.id !== subjectId));
      loadData();
    } catch (err) {
      alert('Error deleting subject: ' + err.message);
    }
  };

  const handleUploadMaterial = async (formData) => {
    try {
      const newMat = await uploadMaterial(formData);
      setMaterials(prev => [newMat, ...prev.filter(m => String(m.id) !== String(newMat.id))]);
      setTimeout(() => loadData(), 500);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleUpdateMaterialDetails = async (id, updatedData) => {
    try {
      const updated = await updateMaterial(id, updatedData);
      setMaterials(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updated } : m));
      await loadData();
    } catch (err) {
      alert('Error updating material: ' + err.message);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await deleteMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
      loadData();
    } catch (err) {
      alert('Error deleting material: ' + err.message);
    }
  };

  const handleToggleSemesterVisibility = async (semesterId, is_visible) => {
    try {
      await toggleSemesterVisibility(semesterId, is_visible);
      const targetSem = semesters.find(s => String(s.id) === String(semesterId));
      const targetName = targetSem?.name?.trim().toLowerCase();

      setSemesters(prev => prev.map(s => {
        const matchesId = String(s.id) === String(semesterId);
        const matchesName = targetName && s.name && s.name.trim().toLowerCase() === targetName;
        if (matchesId || matchesName) {
          return { ...s, is_visible };
        }
        return s;
      }));
    } catch (err) {
      alert('Error updating semester visibility: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header isSupabaseConnected={isSupabaseConnected} />

      <main style={{ flex: 1, padding: 'clamp(14px, 3vw, 28px)', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Unified Compact Filter Bar (Semesters + Subjects on a single sleek line) */}
        <FilterBar
          semesters={uniqueSemesters}
          selectedSemester={selectedSemester}
          onSelectSemester={(semId) => {
            handleSelectSemester(semId);
            handleSelectSubject(null);
          }}
          onOpenCreateSemester={() => setIsCreateSemesterOpen(true)}
          onDeleteSemester={handleDeleteSemester}
          onToggleVisibility={handleToggleSemesterVisibility}
          subjects={filteredSubjects}
          selectedSubject={selectedSubject}
          onSelectSubject={handleSelectSubject}
          onOpenCreateSubject={() => setIsCreateSubjectOpen(true)}
          onEditSubject={(subj) => setEditingSubject(subj)}
          onDeleteSubject={handleDeleteSubject}
        />

        {/* Search Bar & Upload Button */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* Study Material PDF Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading study materials...
          </div>
        ) : (
          <MaterialGrid
            materials={filteredMaterials}
            subjects={subjects}
            onOpenReader={setActiveMaterial}
            onEdit={(mat) => setEditingMaterial(mat)}
            onDelete={handleDeleteMaterial}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}
      </main>

      {/* Feature Modals */}
      <AuthModal />
      <CreateSemesterModal
        isOpen={isCreateSemesterOpen}
        onClose={() => setIsCreateSemesterOpen(false)}
        onCreate={handleCreateSemester}
      />
      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        onClose={() => setIsCreateSubjectOpen(false)}
        onCreate={handleCreateSubject}
        semesters={semesters}
        defaultSemesterId={selectedSemester}
        subjects={subjects}
      />
      <EditSubjectModal
        isOpen={Boolean(editingSubject)}
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onUpdate={handleUpdateSubject}
        semesters={semesters}
      />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        subjects={selectedSemester ? filteredSubjects : subjects}
        materials={materials}
        defaultSubjectId={selectedSubject}
        onUpload={handleUploadMaterial}
      />
      <EditMaterialModal
        isOpen={Boolean(editingMaterial)}
        material={editingMaterial}
        onClose={() => setEditingMaterial(null)}
        onUpdate={handleUpdateMaterialDetails}
      />
      <ReaderModal
        material={activeMaterial}
        onClose={() => setActiveMaterial(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
