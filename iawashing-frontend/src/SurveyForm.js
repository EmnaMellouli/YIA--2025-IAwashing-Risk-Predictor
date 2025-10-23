import React, { useState } from "react";
import axios from "axios";

/**
 * UI minimale : on n’affiche PAS le barème côté front.
 * On collecte juste les réponses et on envoie { answers } au backend.
 */
const QUESTIONS = [
  { id: "q1",  texte: "Votre organisation dispose-t-elle d’une stratégie IA validée et documentée ?", options: ["Oui", "Non", "En cours"] },
  { id: "q2",  texte: "Existe-t-il un référent IA/éthique ou un comité de gouvernance ?", options: ["Oui", "Non"] },
  { id: "q3",  texte: "Combien de cas d’usage IA sont effectivement en production ?", options: ["0", "1-2", "3+"] },
  { id: "q4",  texte: "Les résultats IA sont-ils suivis par des indicateurs de performance (KPI) ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q5",  texte: "Les utilisateurs ou clients sont-ils informés quand l’IA intervient ?", options: ["Oui", "Non", "Je ne sais pas"] },
  { id: "q6",  texte: "Vos modèles IA sont-ils explicables ou audités ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q7",  texte: "Des évaluations de biais ou de non-discrimination sont-elles menées ?", options: ["Oui", "Non"] },
  { id: "q8",  texte: "Vos données et modèles IA sont-ils sécurisés (contrôle d’accès, logs) ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q9",  texte: "Votre communication IA est-elle supérieure à vos usages réels ?", options: ["Oui", "Non"] },
  { id: "q10", texte: "Depuis combien de temps un projet IA « pilote » est-il en cours sans déploiement ?", options: ["<6 mois", ">6 mois", ">12 mois"] },
];

export default function SurveyFormFR() {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:3000"; // adapte si ton back tourne ailleurs

  const handleChange = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sessionId = "12345"; // à remplacer si besoin
      const res = await axios.post(`${API_BASE}/survey/${sessionId}`, { answers });
      // On s’attend à { id, score, level, interpretation }
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’envoi du sondage.");
    } finally {
      setLoading(false);
    }
  };

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  return (
    <div style={{ padding: 20, maxWidth: 820, margin: "0 auto", fontFamily: "Inter, Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Sondage IAwashing</h1>
      <p style={{ color: "#555", marginTop: 0 }}>Répondez aux 10 questions ci-dessous.</p>

      {!result ? (
        <form onSubmit={handleSubmit}>
          {QUESTIONS.map((q) => (
            <div key={q.id} style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.texte}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {q.options.map((opt) => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleChange(q.id, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={!allAnswered || loading}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "#111",
              color: "#fff",
              border: 0,
              opacity: !allAnswered || loading ? 0.5 : 1,
            }}
          >
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      ) : (
        <div style={{ background: "#f6f6f6", padding: 16, borderRadius: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Score : {result.score}/100</div>
          <div style={{ marginTop: 4 }}>
            <b>Niveau :</b> {result.level}
          </div>
          <p style={{ marginTop: 8 }}>{result.interpretation}</p>

          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            style={{ marginTop: 10, padding: "8px 14px", borderRadius: 10 }}
          >
            Refaire le questionnaire
          </button>
        </div>
      )}
    </div>
  );
}
