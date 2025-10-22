import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SurveyForm = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null); // Stocke le score et le niveau
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Charger les questions du backend
  useEffect(() => {
    // Simuler la récupération des questions (tu peux adapter pour récupérer via l'API)
    const fetchQuestions = async () => {
      const fetchedQuestions = [
        { id: 'question1', text: 'Your organization has an AI strategy?', options: ['Yes', 'No'] },
        { id: 'question2', text: 'Is there an AI/ethics officer?', options: ['Yes', 'No'] },
        { id: 'question3', text: 'How many AI use cases are in production?', options: ['0', '1-2', '3+'] },
        { id: 'question4', text: 'Is your AI use case documented?', options: ['Yes', 'No'] },
        { id: 'question5', text: 'Do you have AI ethics guidelines?', options: ['Yes', 'No'] },
        { id: 'question6', text: 'Do you have AI ethics reviews?', options: ['Yes', 'No'] },
        { id: 'question7', text: 'Is AI used responsibly in your organization?', options: ['Yes', 'No'] },
        { id: 'question8', text: 'Do you track AI outcomes?', options: ['Yes', 'No'] },
        { id: 'question9', text: 'Is your organization transparent about AI decisions?', options: ['Yes', 'No'] },
        { id: 'question10', text: 'How long have you been using AI?', options: ['Less than 1 year', '1-3 years', 'More than 3 years'] }
      ];
      setQuestions(fetchedQuestions);
    };
    fetchQuestions();
  }, []);

  // Gérer le changement des réponses
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Créer un objet pour envoyer au backend
    const data = {
      sessionId: '12345', // ID de session statique (tu peux le rendre dynamique si nécessaire)
      answers
    };

    try {
      const response = await axios.post('http://localhost:3000/survey/12345', data);
      setResult(response.data); // Récupérer le résultat (score et niveau)
      setIsSubmitted(true); // Marquer comme soumis
    } catch (error) {
      console.error('Erreur lors de la soumission des réponses:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Sondage IAwashing</h1>

      {isSubmitted ? (
        <div>
          <h2>✅ Merci pour vos réponses !</h2>
          <h3>Score: {result?.score}</h3>
          <h4>Niveau: {result?.level}</h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} style={{ marginBottom: '15px' }}>
                <h3>{question.text}</h3>
                {question.options.map((option) => (
                  <label key={option} style={{ display: 'block', marginLeft: '10px' }}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      checked={answers[question.id] === option}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))
          ) : (
            <p>Chargement des questions...</p>
          )}

          <button type="submit" style={{ padding: '10px 20px', marginTop: '20px' }}>
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
};

export default SurveyForm;
