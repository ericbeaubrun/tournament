import React from "react";
import { EMPTY } from "../config/config.js";
import "./TournamentHistoryList.scss";

/**
 * Composant affichant la liste des tournois avec leurs détails et actions
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.tournaments - La liste des tournois à afficher
 * @param {Function} props.toggleFavorite - Fonction pour basculer l'état favori d'un tournoi
 * @param {Function} props.handleLoadTournament - Fonction pour charger un tournoi
 * @param {Function} props.handleSaveTournament - Fonction pour exporter un tournoi
 * @param {Function} props.confirmDeleteTournament - Fonction pour confirmer la suppression d'un tournoi
 * @returns {JSX.Element} Le composant TournamentHistoryList
 */
const TournamentHistoryList = ({ 
  tournaments, 
  toggleFavorite, 
  handleLoadTournament, 
  handleSaveTournament, 
  confirmDeleteTournament 
}) => {
  // Vérifier si tournaments est bien un tableau
  if (!Array.isArray(tournaments)) {
    return <div>Aucun tournoi à afficher</div>;
  }
  
  return (
    <ul className="history-list">
      {tournaments.map((tournament, index) => {
        // Extraction sécurisée des données du tournoi
        const participants = tournament.participants || tournament.participantNames || [];
        const participantsCount = Array.isArray(participants) ? participants.length : 0;
        const tournamentDate = tournament.date || "Date inconnue";
        const heap = Array.isArray(tournament.heap) ? tournament.heap : [];
        const heapValue = heap.length > 0 ? heap[0] : null;
        const isSaved = !!tournament.isSaved;
        
        // Détermination du texte du vainqueur
        let showWinnerText = heapValue !== null && 
                            heapValue !== "EXEMPT" && 
                            heapValue !== "EMPTY" && 
                            heapValue !== "";
        
        let winnerText = 'En cours...';
        if (showWinnerText) {
          if (heapValue === EMPTY) {
            winnerText = 'En cours...';
          } else if (typeof heapValue === 'string' && !isNaN(heapValue.trim())) {
            winnerText = 'Winner: Team ' + heapValue.trim();
          } else if (heapValue) {
            winnerText = 'Winner: ' + heapValue;
          }
        }
        
        return (
          <li 
            key={index}
            className={`history-item ${isSaved ? 'saved-history-item' : ''}`}
          >
            <div className="history-item-content">
              <strong>
                Tournoi du {tournamentDate}
                {/*{isSaved && (*/}
                {/*  <span className="history-saved-badge">*/}
                {/*    <span className="history-saved-icon">★</span>*/}
                {/*    Saved*/}
                {/*  </span>*/}
                {/*)}*/}
              </strong>
              
              <span className="history-item-participants">
                {participantsCount} participants
              </span>
              
              {showWinnerText && (
                <span className="history-item-winner">{winnerText}</span>
              )}
            </div>
            
            <div className="history-item-actions">
              <button
                className={`favorite-toggle-btn ${isSaved ? 'favorite-active' : ''}`}
                onClick={() => toggleFavorite(index)}
                title={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <span className="favorite-icon">★</span>
              </button>
              
              <button
                className="reload-tournament-btn"
                onClick={() => handleLoadTournament(index)}
              >
                Recharger
              </button>
              
              <button
                className="save-tournament-btn"
                onClick={() => handleSaveTournament(index)}
                title="Exporter le tournoi au format JSON"
              >
                Exporter
              </button>
              
              <button
                className="delete-tournament-btn"
                onClick={() => confirmDeleteTournament(index)}
                title="Supprimer ce tournoi de l'historique"
              >
                <span className="delete-icon">🗑️</span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TournamentHistoryList;
