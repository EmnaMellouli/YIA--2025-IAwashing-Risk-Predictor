import React, { useState } from "react";
import axios from "axios";
import logo from "./logo.png"; // Ensure the correct path to your logo
import "./SurveyForm.css"; // Ensure you use the updated CSS

const QUESTIONS = [
  { id: "q1", texte: "Votre organisation dispose-t-elle d’une stratégie IA validée et documentée ?", options: ["Oui", "Non", "En cours"] },
  { id: "q2", texte: "Existe-t-il un référent IA/éthique ou un comité de gouvernance ?", options: ["Oui", "Non"] },
  { id: "q3", texte: "Combien de cas d’usage IA sont effectivement en production ?", options: ["0", "1-2", "3+"] },
  { id: "q4", texte: "Les résultats IA sont-ils suivis par des indicateurs de performance (KPI) ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q5", texte: "Les utilisateurs ou clients sont-ils informés quand l’IA intervient ?", options: ["Oui", "Non", "Je ne sais pas"] },
  { id: "q6", texte: "Vos modèles IA sont-ils explicables ou audités ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q7", texte: "Des évaluations de biais ou de non-discrimination sont-elles menées ?", options: ["Oui", "Non"] },
  { id: "q8", texte: "Vos données et modèles IA sont-ils sécurisés (contrôle d’accès, logs) ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q9", texte: "Votre communication IA est-elle supérieure à vos usages réels ?", options: ["Oui", "Non"] },
  { id: "q10", texte: "Depuis combien de temps un projet IA « pilote » est-il en cours sans déploiement ?", options: ["<6 mois", ">6 mois", ">12 mois"] },
];

export default function SurveyFormFR() {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const handleChange = (qid, val) => setAnswers((prev) => ({ ...prev, [qid]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sessionId = "12345";
      const res = await axios.post(`${API_BASE}/survey/${sessionId}`, { answers });
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
    <div className="survey-container">
      <div className="logo-container">
        <img src={logo} alt="Yonnov'IA Logo" className="logo" />
      </div>
      <h1 className="survey-title">Sondage IAwashing</h1>
      <p className="survey-description">Répondez aux 10 questions ci-dessous pour évaluer la maturité IA de votre organisation.</p>

      {!result ? (
        <form onSubmit={handleSubmit}>
          <div className="question-container">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="question-card">
                <div className="question-text">{q.texte}</div>
                <div className="question-options">
                  {q.options.map((opt) => (
                    <div
                      key={opt}
                      className={`option-box ${answers[q.id] === opt ? "selected" : ""}`}
                      onClick={() => handleChange(q.id, opt)}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="submit-button-container">
            <button
              type="submit"
              disabled={!allAnswered || loading}
              className={`submit-button ${!allAnswered || loading ? "disabled" : ""}`}
            >
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      ) : (
        <div className="result-card">
          <div className="result-score">Score : {result.score}/100</div>
          <div className="result-level"><b>Niveau :</b> {result.level}</div>
          <p className="result-interpretation">{result.interpretation}</p>

          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="reset-button"
          >
            Refaire le questionnaire
          </button>
        </div>
      )}
    </div>
  );
}
