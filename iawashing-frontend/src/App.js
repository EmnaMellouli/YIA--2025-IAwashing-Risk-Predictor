import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Importer Routes
import SurveyFormFR from './SurveyForm';  // Formulaire utilisateur
import AdminPanel from './components/AdminPanel';  // Tableau de bord admin
import Login from './components/Login';  // Composant Login pour l'authentification de l'admin

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Contrôle pour savoir si l'utilisateur est authentifié
  const [isAdmin, setIsAdmin] = useState(false); // Contrôle pour afficher admin ou utilisateur

  const handleLogin = (status) => {
    setIsAuthenticated(status);  // Si l'admin est authentifié, autoriser l'accès
    setIsAdmin(status); // Accès au tableau de bord admin
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route pour le formulaire de sondage utilisateur */}
          <Route path="/survey" element={<SurveyFormFR />} />

          {/* Route pour l'interface admin */}
          <Route path="/admin" element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />  // Affiche la page de login si l'admin n'est pas authentifié
            ) : isAdmin ? (
              <AdminPanel />  // Affiche l'interface admin si authentifié et admin
            ) : (
              <SurveyFormFR />  // Affiche le formulaire de l'utilisateur si non admin
            )
          } />
          
          {/* Route par défaut, redirige l'utilisateur vers le formulaire de sondage */}
          <Route path="/" element={<SurveyFormFR />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
