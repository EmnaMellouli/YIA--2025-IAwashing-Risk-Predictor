import React, { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';

import './AdminDashboard.css';
import logo from '../logo.png'; // adapte le chemin si besoin

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState('');
  const [subs, setSubs] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);

  // Charger les sessions
  const loadSessions = async () => {
    const res = await axios.get(`${API}/admin/sessions`);
    setSessions(res.data || []);
    if (!activeSession && res.data?.length) setActiveSession(res.data[0].id);
  };

  // Charger les soumissions (paginées) + total
  const loadSubmissions = async (page = 1) => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/admin/submissions?sessionId=${activeSession}&page=${page}&pageSize=20`,
      );
      setSubs(res.data);
    } finally { setLoading(false); }
  };

  // Export CSV (scores)
  const exportCsv = () => {
    if (!activeSession) return;
    window.open(`${API}/admin/sessions/${activeSession}/export`, '_blank');
  };

  // Export CSV (réponses détaillées)
  const exportAnswersCsv = () => {
    if (!activeSession) return;
    window.open(`${API}/admin/sessions/${activeSession}/export-answers`, '_blank');
  };

  // Comptages et radar % (sur le total global de la session)
  const { radarData, cntFaible, cntMoyen, cntEleve, totalCount } = useMemo(() => {
    const counts = { Faible: 0, Moyen: 0, Élevé: 0 };
    for (const it of subs.items) counts[it.level] = (counts[it.level] || 0) + 1;

    const total = subs.total || 0;
    const denom = total > 0 ? total : 1;

    const data = [
      { metric: 'Faible', value: Math.round((counts.Faible / denom) * 100) },
      { metric: 'Moyen',  value: Math.round((counts.Moyen  / denom) * 100) },
      { metric: 'Élevé',  value: Math.round((counts.Élevé  / denom) * 100) },
    ];
    return {
      radarData: data,
      cntFaible: counts.Faible,
      cntMoyen: counts.Moyen,
      cntEleve: counts.Élevé,
      totalCount: total,
    };
  }, [subs.items, subs.total]);

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => {
    loadSubmissions(1);
    if (!activeSession) return;
    const socket = io(API, { query: { sessionId: activeSession } });
    socket.on('session:update', () => loadSubmissions(1));
    return () => socket.disconnect();
  }, [activeSession]);

  return (
    <div className="ad-root">
      {/* Header clair avec logo */}
      <header className="ad-header">
        <div className="ad-brand">
          <img src={logo} alt="Yonnov'IA" className="ad-logo" />
        </div>
        <div className="ad-title">Tableau de Bord Admin</div>
        <div className="ad-actions">
          {activeSession && (
            <a
              className="ad-btn ghost"
              href={`http://localhost:3001/survey?sessionId=${activeSession}`}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir le questionnaire
            </a>
          )}
        </div>
      </header>

      {/* Barre d’actions */}
      <div className="ad-toolbar">
        <select
          className="ad-select"
          value={activeSession}
          onChange={e => setActiveSession(e.target.value)}
        >
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>

        <button className="ad-btn" onClick={() => loadSubmissions(subs.page)}>Rafraîchir</button>
        <button className="ad-btn ghost" onClick={exportCsv}>Exporter CSV (scores)</button>
        <button className="ad-btn ghost" onClick={exportAnswersCsv}>Exporter Réponses CSV</button>
      </div>

      {/* Contenu principal */}
      <div className="ad-grid">
        {/* Soumissions */}
        <section className="ad-card">
          <h3>Soumissions</h3>
          {loading ? (
            <div className="ad-empty">Chargement…</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Niveau</th>
                  <th>Job</th> {/* ✅ nouvelle colonne */}
                  <th>Interprétation</th>
                </tr>
              </thead>
              <tbody>
                {subs.items.map(it => (
                  <tr key={it.id}>
                    <td>{new Date(it.createdAt).toLocaleString()}</td>
                    <td>{it.score}</td>
                    <td><span className={`badge badge-${it.level}`}>{it.level}</span></td>
                    <td>{it.respondentJob || '-'}</td>
                    <td style={{ maxWidth: 460 }}>{it.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="ad-pagination">
            <button
              className="ad-btn ghost"
              disabled={subs.page <= 1}
              onClick={() => loadSubmissions(subs.page - 1)}
            >
              Précédent
            </button>
            <span>Page {subs.page}</span>
            <button
              className="ad-btn ghost"
              disabled={(subs.page * subs.pageSize) >= subs.total}
              onClick={() => loadSubmissions(subs.page + 1)}
            >
              Suivant
            </button>
          </div>
        </section>

        {/* Radar + résumé avec TOTAL */}
        <aside className="ad-card">
          <h3>Répartition (Radar)</h3>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <PolarGrid stroke="#cfe3e8" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#134f5c', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#134f5c', fontSize: 10 }} />
                <Tooltip />
                <Radar
                  name="% de soumissions"
                  dataKey="value"
                  stroke="#134f5c"
                  fill="#76a5af"
                  fillOpacity={0.55}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Résumé à droite du radar */}
          <div className="ad-radar">
            <div className="radar-row radar-total">
              <span>Total réponses</span>
              <strong>{totalCount}</strong>
            </div>
            <div className="radar-row">
              <span>Faible</span>
              <strong>
                {cntFaible}
                {totalCount > 0 ? ` (${Math.round((cntFaible / totalCount) * 100)}%)` : ''}
              </strong>
            </div>
            <div className="radar-row">
              <span>Moyen</span>
              <strong>
                {cntMoyen}
                {totalCount > 0 ? ` (${Math.round((cntMoyen / totalCount) * 100)}%)` : ''}
              </strong>
            </div>
            <div className="radar-row">
              <span>Élevé</span>
              <strong>
                {cntEleve}
                {totalCount > 0 ? ` (${Math.round((cntEleve / totalCount) * 100)}%)` : ''}
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
