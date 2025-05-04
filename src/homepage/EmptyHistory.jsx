import React from "react";
import "./EmptyHistory.scss";

/**
 * Composant affichant un message quand l'historique des tournois est vide
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Titre à afficher
 * @param {string} props.message - Message d'information à afficher
 * @param {string} props.icon - Emoji ou icône à afficher
 * @returns {JSX.Element} Le composant EmptyHistory
 */
const EmptyHistory = ({ title = "Aucun historique de tournoi...", message = "Cliquez sur \"New Bracket\" pour commencer votre premier tournoi.", icon = "🏆" }) => {
  return (
    <div className="empty-history-container">
      <div className="empty-history-message">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <div className="empty-history-icon">{icon}</div>
    </div>
  );
};

export default EmptyHistory;
