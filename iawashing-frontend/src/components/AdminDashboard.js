import React, { useCallback, useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';

import './AdminDashboard.css';
import logo from '../logo.png';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const SITE = process.env.REACT_APP_SITE_URL || 'https://ai-washing.yonnovia-213.com';
const REFRESH_INTERVAL = 30000; // auto-refresh toutes les 30 secondes

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState('');
  const [subs, setSubs] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [autoRefreshActive, setAutoRefreshActive] = useState(true);

  // Charger la liste des sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/sessions`);
      const data = res.data || [];
      setSessions(data);
      // si aucune activeSession, prendre la première
      if (!activeSession && data.length) setActiveSession(data[0].id);
    } catch (err) {
      console.error('Erreur lors du chargement des sessions', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  // Charger les soumissions (page optionnelle)
  const loadSubmissions = useCallback(async (page = 1) => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/admin/submissions?sessionId=${activeSession}&page=${page}&pageSize=20`
      );
      // s'assurer d'avoir un objet cohérent
      setSubs({
        items: res.data.items || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        pageSize: res.data.pageSize || 20,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des soumissions', err);
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  // Export CSV Feedback unique
  const exportFeedbackCsv = useCallback(() => {
    if (!activeSession) return;
    window.open(`${API}/admin/sessions/${activeSession}/export-feedback`, '_blank');
  }, [activeSession]);

  // Radar data
  const { radarData, cntFaible, cntMoyen, cntEleve, totalCount } = useMemo(() => {
    const counts = { Faible: 0, Moyen: 0, Élevé: 0 };
    for (const it of subs.items) {
      const lvl = it.level || 'Faible';
      counts[lvl] = (counts[lvl] || 0) + 1;
    }

    const total = subs.total || 0;
    const denom = total > 0 ? total : 1;

    const data = [
      { metric: 'Faible', value: Math.round((counts.Faible / denom) * 100) },
      { metric: 'Moyen', value: Math.round((counts.Moyen / denom) * 100) },
      { metric: 'Élevé', value: Math.round((counts.Élevé / denom) * 100) },
    ];

    return {
      radarData: data,
      cntFaible: counts.Faible,
      cntMoyen: counts.Moyen,
      cntEleve: counts.Élevé,
      totalCount: total,
    };
  }, [subs.items, subs.total]);

  // Initialisation
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // WebSocket temps réel — écoute les mises à jour pour la session active
  useEffect(() => {
    if (!activeSession) return;

    // charger d'abord
    loadSubmissions(1);

    const socket = io(API, { query: { sessionId: activeSession } });

    const onUpdate = () => {
      console.log('🧠 Nouvelle mise à jour détectée via socket');
      loadSubmissions(1);
    };

    socket.on('connect', () => {
      console.log('Socket connecté', socket.id);
    });

    socket.on('session:update', onUpdate);
    socket.on('submission:created', onUpdate);
    socket.on('disconnect', (reason) => {
      console.log('Socket déconnecté', reason);
    });

    return () => {
      // nettoyage propre : enlever listeners puis déconnecter
      socket.off('session:update', onUpdate);
      socket.off('submission:created', onUpdate);
      try { socket.disconnect(); } catch (e) { /* ignore */ }
    };
  }, [activeSession, loadSubmissions]);

  // Auto-refresh toutes les 30s
  useEffect(() => {
    if (!autoRefreshActive || !activeSession) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh exécuté');
      loadSubmissions(1);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [activeSession, autoRefreshActive, loadSubmissions]);

  return (
    <div className="ad-root">
      {/* Header */}
      <header className="ad-header">
        <div className="ad-brand">
          <img src={logo} alt="Yonnov'IA" className="ad-logo" />
        </div>
        <div className="ad-title">Tableau de Bord Admin</div>
        <div className="ad-actions">
          {activeSession && (
            <a
              className="ad-btn ghost"
              href={`${SITE}/survey?sessionId=${activeSession}`}
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
          onChange={(e) => setActiveSession(e.target.value)}
        >
          <option value="">-- Choisir une session --</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>

        <button className="ad-btn" onClick={() => loadSubmissions(subs.page)}>Rafraîchir</button>
        <button className="ad-btn ghost" onClick={exportFeedbackCsv}>
          Exporter CSV Feedbacks
        </button>

        <button
          className="ad-btn ghost"
          onClick={() => setAutoRefreshActive((v) => !v)}
        >
          {autoRefreshActive ? '⏸️ Stop auto-refresh' : '▶️ Activer auto-refresh'}
        </button>
      </div>

      {/* Contenu principal */}
      <div className="ad-grid">
        {/* Tableau des soumissions */}
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
                  <th>Job</th>
                  <th>Interprétation</th>
                </tr>
              </thead>
              <tbody>
                {subs.items.map((it) => (
                  <tr key={it.id}>
                    <td>{new Date(it.createdAt).toLocaleString()}</td>
                    <td>{it.score}</td>
                    <td><span className={`badge badge-${(it.level || 'Faible').toLowerCase()}`}>{it.level || 'Faible'}</span></td>
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
              onClick={() => loadSubmissions(Math.max(1, subs.page - 1))}
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

        {/* Radar + résumé */}
        <aside className="ad-card">
          <h3>Répartition (Radar)</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Tooltip />
                <Radar
                  name="% de soumissions"
                  dataKey="value"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

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
