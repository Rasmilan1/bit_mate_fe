# 🎓 BitMat - Study Material Manager (Frontend)

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-JS-3ECF8E?style=flat&logo=supabase)

BitMat is a modern, multi-device academic study material manager and interactive reading hub built for students and educators. The frontend client provides a clean, responsive interface to organize study PDFs, view documents in-browser, take notes side by side, and track learning progress.

---

## ✨ Features

- 📚 **Semester & Subject Hierarchy**: Organize course materials by semester, department, and custom tags.
- 📄 **Interactive PDF Reader**: View PDF study materials directly in the browser with zoom and page controls.
- 📝 **Split-Screen Markdown Notes Editor**: Take real-time Markdown notes alongside any study document.
- 📤 **Study Material Upload**: Upload PDFs with custom metadata (title, subject, semester, description, tags).
- 📊 **Study Tracker Dashboard**: Monitor study statistics, completion rates, and learning activity metrics.
- 🔐 **Authentication**: Secure user login, session management, and personalized study data.

---

## 🛠️ Tech Stack

- **UI Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Storage Client**: [@supabase/supabase-js](https://supabase.com/)
- **Styling**: Modular CSS Tokens & Responsive Design

---

## 📁 Folder Structure

```text
client/src/
├── features/
│   ├── auth/        # Login modal, auth state & session provider
│   ├── semesters/   # Semester navigation & selection
│   ├── subjects/    # Subject filter tabs & subject creation
│   ├── materials/   # PDF grid, file search, tag filtering, upload modal
│   ├── reader/      # Split-screen PDF viewer + Markdown notes editor
│   └── tracker/     # Study progress cards & analytics overview
├── components/      # Common UI components (Navbar, Modals, Buttons)
├── services/        # API service layer
└── styles/          # Design tokens and modular CSS stylesheet
```

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 Related Repositories

- **Backend API**: [bit_mate_be](https://github.com/Rasmilan1/-bit_mate_be.git)
