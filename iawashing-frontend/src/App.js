import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import SurveyFormFR from './SurveyForm';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ThankYouPage from './pages/ThankYouPage'; // ✅ ajout de la page de remerciement

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Formulaire (query) : /survey?sessionId=UUID */}
          <Route path="/survey" element={<SurveyFormFR />} />

          {/* Formulaire (path) : /session/:sessionId */}
          <Route path="/session/:sessionId" element={<SurveyFormFR />} />

          {/* ✅ Nouvelle page de remerciement */}
          <Route path="/thank-you" element={<ThankYouPage />} />

          {/* Login admin */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Admin protégé */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/survey" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
