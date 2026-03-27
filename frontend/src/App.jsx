import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import './App.css';

// Prevent logged-in users from seeing the login screen
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) {
    return <Navigate to={user.profileComplete ? "/dashboard" : "/onboarding"} replace />;
  }
  
  return children;
};

// A simple protected route wrapper
const ProtectedRoute = ({ children, requireProfile = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireProfile && !user.profileComplete) return <Navigate to="/onboarding" replace />;
  
  return children;
};

// Protect the onboarding route
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Allow users with complete profiles to return to the onboarding flow to edit their preferences.
  
  return children;
};

function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route 
          path="/onboarding" 
          element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireProfile={true}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireProfile={true}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
