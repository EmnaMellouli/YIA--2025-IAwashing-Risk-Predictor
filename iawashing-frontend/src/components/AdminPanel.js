import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [surveyHistory, setSurveyHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/survey/history`);
      setSurveyHistory(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Tableau de Bord Admin</h1>
      <p>Bienvenue dans l'interface administrateur !</p>

      <button
        onClick={fetchStatistics}
        style={{ padding: '10px 20px', backgroundColor: '#0c343d', color: '#fff', cursor: 'pointer' }}
      >
        Voir les statistiques
      </button>

      {loading && <p>Chargement des statistiques...</p>}

      <div style={{ marginTop: '20px' }}>
        {surveyHistory.length > 0 ? (
          <div>
            <h3>Historique des Sondages :</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Niveau</th>
                  <th>Interprétation</th>
                </tr>
              </thead>
              <tbody>
                {surveyHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                    <td>{entry.score}</td>
                    <td>{entry.level}</td>
                    <td style={{ maxWidth: 520, textAlign: 'left' }}>{entry.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucune donnée disponible.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
