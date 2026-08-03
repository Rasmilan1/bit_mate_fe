const LIVE_BACKEND = 'https://bit-mate-be.vercel.app/api';

// Uses VITE_API_BASE_URL env var if set, relative '/api' on localhost (proxied to http://localhost:5000), or live Vercel backend in production
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? '/api' : LIVE_BACKEND);

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function downloadPdfFile(fileUrl, fileName) {
  const cleanName = (fileName || 'study-material').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = cleanName;
    a.target = '_blank';
    a.click();
  }
}

export async function loginApi({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function fetchSemesters() {
  const res = await fetch(`${API_BASE}/semesters`);
  if (!res.ok) throw new Error('Failed to fetch semesters');
  return res.json();
}

export async function createSemester(semesterData) {
  const res = await fetch(`${API_BASE}/semesters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(semesterData)
  });
  if (!res.ok) throw new Error('Failed to create semester');
  return res.json();
}

export async function deleteSemester(id) {
  const res = await fetch(`${API_BASE}/semesters/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete semester');
  return res.json();
}

export async function toggleSemesterVisibility(id, is_visible) {
  const res = await fetch(`${API_BASE}/semesters/${id}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_visible })
  });
  if (!res.ok) throw new Error('Failed to update semester visibility');
  return res.json();
}

export async function fetchSubjects(semesterId = null) {
  const url = semesterId ? `${API_BASE}/subjects?semester_id=${semesterId}` : `${API_BASE}/subjects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function createSubject(subjectData) {
  const res = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subjectData)
  });
  if (!res.ok) throw new Error('Failed to create subject');
  return res.json();
}

export async function updateSubject(id, subjectData) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subjectData)
  });
  if (!res.ok) throw new Error('Failed to update subject');
  return res.json();
}

export async function deleteSubject(id) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subject');
  return res.json();
}

export async function fetchMaterials() {
  const res = await fetch(`${API_BASE}/materials`);
  if (!res.ok) throw new Error('Failed to fetch materials');
  return res.json();
}

export async function uploadMaterial(formData) {
  const res = await fetch(`${API_BASE}/materials/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to upload PDF material');
  }
  return res.json();
}

export async function updateMaterial(id, materialData) {
  const isFormData = materialData instanceof FormData;
  const res = await fetch(`${API_BASE}/materials/${id}`, {
    method: 'PUT',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? materialData : JSON.stringify(materialData)
  });
  if (!res.ok) throw new Error('Failed to update material details');
  return res.json();
}

export async function updateProgress(id, { current_page, total_pages, status }) {
  const res = await fetch(`${API_BASE}/materials/${id}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_page, total_pages, status })
  });
  if (!res.ok) throw new Error('Failed to update reading progress');
  return res.json();
}

export async function deleteMaterial(id) {
  const res = await fetch(`${API_BASE}/materials/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete material');
  return res.json();
}

export async function fetchNotes(materialId) {
  const res = await fetch(`${API_BASE}/notes/${materialId}`);
  if (!res.ok) throw new Error('Failed to fetch study notes');
  return res.json();
}

export async function saveNotes(materialId, content) {
  const res = await fetch(`${API_BASE}/notes/${materialId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to save study notes');
  return res.json();
}

export async function fetchTrackerStats() {
  const res = await fetch(`${API_BASE}/tracker/stats`);
  if (!res.ok) throw new Error('Failed to fetch analytics stats');
  return res.json();
}
