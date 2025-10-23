import shap

# Créer un explainer SHAP
explainer = shap.TreeExplainer(model)

# Calculer les valeurs SHAP
shap_values = explainer.shap_values(X_test)

# Afficher le résumé des valeurs SHAP
shap.summary_plot(shap_values[1], X_test)  # Affiche les valeurs SHAP pour la classe "Élevé"
