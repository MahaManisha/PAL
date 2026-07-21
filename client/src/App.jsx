import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import TopicPage from './pages/TopicPage';
import AssessmentPage from './pages/AssessmentPage';
import SlidesPage from './pages/SlidesPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Handle Google OAuth redirect callback
const GoogleRedirectHandler = () => {
  const { handleGoogleRedirect } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/auth/google' && handleGoogleRedirect()) {
      // Successfully logged in via Google - navigate to dashboard
      window.location.href = '/dashboard';
    }
  }, [location, handleGoogleRedirect]);

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Signing in with Google...</div>;
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/google" element={<GoogleRedirectHandler />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
            <Route path="/topic/:id" element={<ProtectedRoute><TopicPage /></ProtectedRoute>} />
            <Route path="/assessment/:topicId" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
            <Route path="/slides/:subject/:chapter/:topic" element={<ProtectedRoute><SlidesPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
