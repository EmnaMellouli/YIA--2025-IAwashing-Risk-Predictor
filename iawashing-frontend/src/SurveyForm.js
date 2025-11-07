import React, { useMemo, useState } from "react";
import axios from "axios";
import logo from "./logo.png";
import "./SurveyForm.css";

const QUESTIONS = [
  {
    id: "q1",
    texte:
      "Votre organisation dispose-t-elle d’une stratégie IA validée et documentée ?",
    options: ["Oui", "Non", "En cours"],
  },
  {
    id: "q2",
    texte:
      "Existe-t-il un référent IA/éthique ou un comité de gouvernance ?",
    options: ["Oui", "Non"],
  },
  {
    id: "q3",
    texte:
      "Combien de cas d’usage IA sont effectivement en production ?",
    options: ["0", "1-2", "3+"],
  },
  {
    id: "q4",
    texte:
      "Les résultats IA sont-ils suivis par des indicateurs de performance (KPI) ?",
    options: ["Oui", "Non", "Partiel"],
  },
  {
    id: "q5",
    texte:
      "Les utilisateurs ou clients sont-ils informés quand l’IA intervient ?",
    options: ["Oui", "Non", "Je ne sais pas"],
  },
  {
    id: "q6",
    texte: "Vos modèles IA sont-ils explicables ou audités ?",
    options: ["Oui", "Non", "Partiel"],
  },
  {
    id: "q7",
    texte:
      "Des évaluations de biais ou de non-discrimination sont-elles menées ?",
    options: ["Oui", "Non"],
  },
  {
    id: "q8",
    texte:
      "Vos données et modèles IA sont-ils sécurisés (contrôle d’accès, logs) ?",
    options: ["Oui", "Non", "Partiel"],
  },
  {
    id: "q9",
    texte:
      "Votre communication IA est-elle supérieure à vos usages réels ?",
    options: ["Oui", "Non"],
  },
  {
    id: "q10",
    texte:
      "Depuis combien de temps un projet IA « pilote » est-il en cours sans déploiement ?",
    options: ["<6 mois", ">6 mois", ">12 mois"],
  },
];

export default function SurveyFormFR() {
  const [answers, setAnswers] = useState({});
  const [job, setJob] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

  // Récupération du sessionId dans l’URL
  const sessionId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("sessionId") || "";
  }, []);

  const currentQuestion = QUESTIONS[currentIndex];

  const handleChange = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
    setErrorMsg("");
  };

  const allAnswered = useMemo(
    () => QUESTIONS.every((q) => answers[q.id]),
    [answers]
  );

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
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!sessionId) {
      setErrorMsg(
        "Lien invalide : aucun sessionId dans l’URL. Merci d’utiliser le lien fourni."
      );
      return;
    }

    if (!allAnswered) {
      setErrorMsg(
        "Merci de répondre à toutes les questions avant d’envoyer le questionnaire."
      );
      return;
    }

    setLoading(true);
    try {
      const payload = { answers, job };
      const res = await axios.post(
        `${API_BASE}/survey/${sessionId}`,
        payload
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l’envoi du sondage.";
      setErrorMsg(apiMsg);
      alert(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setJob("");
    setCurrentIndex(0);
    setResult(null);
    setErrorMsg("");
  };

  return (
    <div className="survey-page">
      <div className="survey-container">
        <div className="logo-container">
          <img src={logo} alt="Yonnov'IA Logo" className="logo" />
        </div>

        <h1 className="survey-title">Sondage IAwashing</h1>
        <p className="survey-description">
          Répondez aux questions pour évaluer la maturité IA de votre
          organisation.
        </p>

        {!result ? (
          <form onSubmit={handleSubmit} className="survey-form">
            {/* Champ poste / fonction (optionnel) */}
            <div className="question-card job-card">
              <div className="question-text">
                Votre poste / fonction (optionnel)
              </div>
              <input
                type="text"
                placeholder="Ex. : Responsable SI, Data Analyst, RH, Direction…"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="text-input"
              />
            </div>

            {/* Barre de progression + étape */}
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      ((currentIndex + 1) / QUESTIONS.length) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="step-indicator">
                Question {currentIndex + 1} / {QUESTIONS.length}
              </div>
            </div>

            {/* Carte de la question courante */}
            <div className="question-card">
              <div className="question-text">{currentQuestion.texte}</div>
              <div className="question-options">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      className={`option-box ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleChange(currentQuestion.id, opt)
                      }
                      aria-pressed={isSelected}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <p className="error-text" role="alert">
                {errorMsg}
              </p>
            )}

            {/* Boutons navigation avec même charte */}
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
          <div className="result-card">
            <div className="result-score">
              Score : {result.score}/100
            </div>
            <div className="result-level">
              <b>Niveau :</b> {result.level}
            </div>
            <p className="result-interpretation">
              {result.interpretation}
            </p>

            <button
              onClick={handleRestart}
              className="reset-button"
            >
              Refaire le questionnaire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
