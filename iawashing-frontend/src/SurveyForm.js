import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigation
import axios from "axios";
import logo from "./logo.png";
import "./SurveyForm.css";

const QUESTIONS = [
  { id: "q1", texte: "Votre organisation dispose-t-elle d’une stratégie IA validée et documentée ?", options: ["Oui", "Non", "En cours"] },
  { id: "q2", texte: "Existe-t-il un référent IA/éthique ou un comité de gouvernance ?", options: ["Oui", "Non"] },
  { id: "q3", texte: "Combien de cas d’usage IA sont effectivement en production ?", options: ["0", "1-2", "3+"] },
  { id: "q4", texte: "Les résultats IA sont-ils suivis par des indicateurs de performance (KPI) ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q5", texte: "Les utilisateurs ou clients sont-ils informés quand l’IA intervient ?", options: ["Oui", "Non", "Je ne sais pas"] },
  { id: "q6", texte: "Vos modèles IA sont-ils explicables ou audités ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q7", texte: "L’audit interne évalue-t-il la présence de biais ou d’effets discriminatoires dans les traitements de données ?", options: ["Oui", "Non"] },
  { id: "q8", texte: "Vos données et modèles IA sont-ils sécurisés (contrôle d’accès, logs) ?", options: ["Oui", "Non", "Partiel"] },
  { id: "q9", texte: "Votre communication IA est-elle supérieure à vos usages réels ?", options: ["Oui", "Non"] },
  { id: "q10", texte: "Depuis combien de temps un projet IA « pilote » est-il en cours sans déploiement ?", options: ["<6 mois", ">6 mois", ">12 mois"] },
];

export default function SurveyFormFR() {
  const navigate = useNavigate(); // ✅ hook navigation

  const [answers, setAnswers] = useState({});
  const [job, setJob] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const sessionId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("sessionId") || "";
  }, []);

  const currentQuestion = QUESTIONS[currentIndex];

  const handleChange = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
    setErrorMsg("");
  };

  const allAnswered = useMemo(() => QUESTIONS.every((q) => answers[q.id]), [answers]);

  const handleNext = () => {
    const q = QUESTIONS[currentIndex];
    if (!answers[q.id]) {
      setErrorMsg("Merci de sélectionner une réponse avant de continuer.");
      return;
    }
    setErrorMsg("");
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    if (currentIndex > 0) setCurrentIndex((idx) => idx - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!sessionId) {
      setErrorMsg("Lien invalide : aucun sessionId dans l’URL.");
      return;
    }

    if (!allAnswered) {
      setErrorMsg("Merci de répondre à toutes les questions avant d’envoyer.");
      return;
    }

    setLoading(true);
    try {
      const payload = { answers, job };
      const res = await axios.post(`${API_BASE}/survey/${sessionId}`, payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’envoi du questionnaire.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Envoi du feedback puis redirection vers /thank-you
  const handleSendFeedback = async () => {
    if (!sessionId) {
      setFeedbackError("Impossible d'envoyer le feedback : sessionId manquant.");
      return;
    }

    setFeedbackError("");
    setFeedbackLoading(true);

    try {
      const payload = {
        score: result?.score ?? null,
        rating: feedbackRating,
        comment: feedbackComment,
        job,
        answers,
      };
      await axios.post(`${API_BASE}/survey/${sessionId}/feedback`, payload);

      // ✅ redirige vers la page de remerciement
      navigate("/thank-you");
    } catch (err) {
      console.error(err);
      setFeedbackError("Erreur lors de l'envoi du feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="survey-page">
      <div className="survey-container">
        <div className="logo-container">
          <img src={logo} alt="Yonnov'IA Logo" className="logo" />
        </div>

        <h1 className="survey-title">Sondage IAwashing</h1>
        <p className="survey-description">
          Répondez aux questions pour évaluer la maturité IA de votre organisation.
        </p>

        {!result ? (
          <form onSubmit={handleSubmit} className="survey-form">
            <div className="question-card job-card">
              <div className="question-text">Votre poste / fonction (optionnel)</div>
              <input
                type="text"
                placeholder="Ex. : Responsable SI, Data Analyst, RH, Direction…"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="text-input"
              />
            </div>

            <div className="progress-wrapper">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <div className="step-indicator">
                Question {currentIndex + 1} / {QUESTIONS.length}
              </div>
            </div>

            <div className="question-card">
              <div className="question-text">{currentQuestion.texte}</div>
              <div className="question-options">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      className={`option-box ${isSelected ? "selected" : ""}`}
                      onClick={() => handleChange(currentQuestion.id, opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && <p className="error-text">{errorMsg}</p>}

            <div className="nav-buttons">
              <button
                type="button"
                className="nav-btn nav-prev"
                onClick={handlePrev}
                disabled={currentIndex === 0 || loading}
              >
                ← Précédent
              </button>

              {currentIndex < QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  className="nav-btn nav-next"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="submit"
                  className="nav-btn nav-submit"
                  disabled={!allAnswered || !sessionId || loading}
                >
                  {loading ? "Envoi..." : "Envoyer"}
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="result-and-feedback">
            <div className="result-card">
              <div className="result-score">Score : {result.score}/100</div>
              <div className="result-level"><b>Niveau :</b> {result.level}</div>
              <p className="result-interpretation">{result.interpretation}</p>
            </div>

            {/* FEEDBACK FORM */}
            <div className="question-card feedback-card" style={{ marginTop: 18 }}>
              <div className="question-text">Donnez-nous votre avis</div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Notez votre expérience (1 = mauvais, 5 = excellent)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`option-box ${feedbackRating === n ? "selected" : ""}`}
                      onClick={() => setFeedbackRating(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Commentaire (optionnel)
                </label>
                <textarea
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Qu'est-ce qui vous a plu / que peut-on améliorer ?"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #cfe3e8",
                    fontSize: 14,
                    background: "#f7fafb",
                  }}
                />
              </div>

              {feedbackError && <p className="error-text">{feedbackError}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="nav-btn nav-submit"
                  onClick={handleSendFeedback}
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? "Envoi..." : "Envoyer mon avis"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
