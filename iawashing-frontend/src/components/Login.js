import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importer useNavigate

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Utilisation de useNavigate pour rediriger

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Vérification du mot de passe "yonn"
    if (password === 'yonn') {  
      onLogin(true);  // Authentifie l'admin si le mot de passe est correct
      setError('');
      navigate('/admin');  // Redirige vers le tableau de bord admin
    } else {
      setError('Mot de passe incorrect');  // Message d'erreur si le mot de passe est incorrect
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Connexion Admin</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Entrez le mot de passe"
            value={password}
            onChange={handlePasswordChange}
            style={{ padding: '10px', fontSize: '16px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0c343d', color: '#fff' }}>
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default Login;
