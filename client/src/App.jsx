import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import TopicPage from './pages/TopicPage';
import AssessmentPage from './pages/AssessmentPage';
import SlidesPage from './pages/SlidesPage';
import Leaderboard from './pages/Leaderboard';
import ProfilePage from './pages/ProfilePage';
import ChapterTrailerPage from './pages/ChapterTrailerPage';
import AdaptivePathResultPage from './pages/AdaptivePathResultPage';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeSelectModal from './components/ThemeSelectModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" />;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/** First-time setup modal wired to ThemeContext — only rendered when user is authenticated */
const ThemeSetupGate = () => {
  const { needsSetup, experience, subTheme, savePreference, dismissSetup, isChanging } = useTheme();

  const handleSave = async (exp, sub) => {
    await savePreference(exp, sub);
  };

  return (
    <ThemeSelectModal
      isOpen={needsSetup}
      mode="setup"
      initialExp={experience}
      initialSub={subTheme}
      onSave={handleSave}
      onDismiss={dismissSetup}
      isSaving={isChanging}
    />
  );
};

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      {/* ThemeProvider wraps everything but only acts when user is present */}
      <ThemeProvider>
        <Navbar />
        {/* First-time theme setup modal (authenticated users only) */}
        {user && <ThemeSetupGate />}
        <div style={{ minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
            <Route path="/topic/:id" element={<ProtectedRoute><TopicPage /></ProtectedRoute>} />
            <Route path="/chapter/:chapterId/trailer" element={<ProtectedRoute><ChapterTrailerPage /></ProtectedRoute>} />
            <Route path="/chapter/:chapterId/initial-assessment" element={<ProtectedRoute><AssessmentPage type="INITIAL" /></ProtectedRoute>} />
            <Route path="/chapter/:chapterId/learning-path" element={<ProtectedRoute><AdaptivePathResultPage /></ProtectedRoute>} />
            <Route path="/chapter/:chapterId/final-assessment" element={<ProtectedRoute><AssessmentPage type="FINAL" /></ProtectedRoute>} />
            <Route path="/assessment/:topicId" element={<ProtectedRoute><AssessmentPage type="TOPIC" /></ProtectedRoute>} />
            <Route path="/slides/:subject/:chapter/:topic" element={<ProtectedRoute><SlidesPage /></ProtectedRoute>} />
            <Route path="/slides/:chapterId/main" element={<ProtectedRoute><SlidesPage type="MAIN" /></ProtectedRoute>} />
          </Routes>
        </div>
        {!user && <Footer />}
      </ThemeProvider>
    </Router>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
