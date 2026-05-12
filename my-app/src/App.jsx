/**
 * =============================================================================
 * Mindspace — React Router tree
 * =============================================================================
 *
 * Structure:
 *   <AuthProvider>     — Supabase session (see context/AuthContext.jsx)
 *     <Routes>
 *       /login, /signup — public auth pages (Tailwind, dark UI)
 *       <ProtectedRoute> — requires session; else redirect → /login + state.from
 *         <AppShell>   — shared nav + theme + outlet (Journal + Dashboard)
 *
 * Dashboard and Journal remain unchanged behind authentication.
 *
 * Wildcard `*` sends unknown paths to `/`; guests are then bounced to /login
 * by ProtectedRoute. Authenticated users land on Journal home.
 * =============================================================================
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import JournalInput from "./components/journal/JournalInput";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* —— Public: Supabase email/password auth —— */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* —— Private: journal + analysis (existing features) —— */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<JournalInput />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
