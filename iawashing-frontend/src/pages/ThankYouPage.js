import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.png';
import './ThankYouPage.css';

export default function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="ty-container">
      <img src={logo} alt="Yonnov'IA" className="ty-logo" />
      <h1>Merci pour votre participation !</h1>
      <p>Vos réponses et votre avis ont bien été enregistrés.</p>
      <button className="ty-btn" onClick={() => navigate('/')}>
        Retour à l’accueil
      </button>
    </div>
  );
}
