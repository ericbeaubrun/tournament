import React from "react";
import { EMPTY } from "../config/config.js";
import "./SavedTournaments.scss";

/**
 * Composant affichant la grille des tournois sauvegardés
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.archivedTournaments - La liste des tournois archivés
 * @param {Function} props.handleLoadTournament - Fonction pour charger un tournoi
 * @param {Function} props.handleSaveTournament - Fonction pour exporter un tournoi
 * @returns {JSX.Element} Le composant SavedTournaments
 */
const SavedTournaments = ({ archivedTournaments, handleLoadTournament, handleSaveTournament }) => {
    // Filtrer les tournois sauvegardés de manière sécurisée
    const savedTournaments = Array.isArray(archivedTournaments) 
        ? archivedTournaments.filter(t => t && t.isSaved) 
        : [];
    
    return (
        <div className="tournaments-grid">
            {savedTournaments.length > 0 ? (
                savedTournaments.map((t, i) => {
                    // Extraction sécurisée des données du tournoi
                    const tournamentDate = t.date || "Date inconnue";
                    const participants = t.participants || t.participantNames || [];
                    const participantsCount = Array.isArray(participants) ? participants.length : 0;
                    const heapValue = Array.isArray(t.heap) && t.heap.length > 0 ? t.heap[0] : null;
                    
                    // Détermination du texte du vainqueur
                    let winnerText = 'En cours...';
                    if (heapValue !== null && heapValue !== EMPTY && heapValue !== "") {
                        if (typeof heapValue === 'string' && !isNaN(heapValue.trim())) {
                            winnerText = 'Winner: Team ' + heapValue.trim();
                        } else if (heapValue) {
                            winnerText = 'Winner: ' + heapValue;
                        }
                    }
                    
                    return (
                        <div key={i} className="tournament-card saved-card">
                            <div className="tournament-date">{tournamentDate}</div>
                            <div className="tournament-participants">
                                {participantsCount} participants
                            </div>
                            <div className="tournament-winner">
                                {winnerText}
                            </div>
                            <div className="saved-badge">
                                <span className="saved-icon">★</span>
                            </div>
                            <div className="tournament-card-actions">
                                <button
                                    className="load-tournament-btn"
                                    onClick={() => handleLoadTournament(archivedTournaments.indexOf(t))}
                                >
                                    Recharger
                                </button>
                                <button
                                    className="save-tournament-btn"
                                    onClick={() => handleSaveTournament(archivedTournaments.indexOf(t))}
                                    title="Exporter le tournoi au format JSON"
                                >
                                    Exporter
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="no-saved-tournaments">
                    <p>Vous n'avez pas encore sauvegardé de tournoi.</p>
                    <p>
                        Pour sauvegarder un tournoi, utilisez le bouton "Sauvegarder ce tournoi" pendant
                        le tournoi.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SavedTournaments;
