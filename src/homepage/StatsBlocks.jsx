import React from "react";
import "./StatsBlocks.scss";

/**
 * Composant affichant les statistiques des tournois sous forme de blocs
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.archivedTournaments - Liste des tournois archivés
 * @returns {JSX.Element} Le composant StatsBlocks
 */
const StatsBlocks = ({ archivedTournaments }) => {
    // Calculer la moyenne des participants de manière sécurisée
    const calculateAverageParticipants = () => {
        if (!archivedTournaments || archivedTournaments.length === 0) return "0.0";
        
        const totalParticipants = archivedTournaments.reduce((acc, t) => {
            // Vérifier toutes les propriétés possibles pour les participants
            const participantList = t.participants || t.participantNames || [];
            return acc + (Array.isArray(participantList) ? participantList.length : 0);
        }, 0);
        
        return (totalParticipants / archivedTournaments.length).toFixed(1);
    };
    
    // Obtenir la date du dernier tournoi de manière sécurisée
    const getLastTournamentDate = () => {
        if (!archivedTournaments || archivedTournaments.length === 0) return "Aucun";
        
        const lastTournament = archivedTournaments[archivedTournaments.length - 1];
        return lastTournament.date || "Date inconnue";
    };
    
    return (
        <div className="stats-blocks-container">
            <div className="stats-block">
                <h3>Dernier tournoi</h3>
                <div className="stats-value">
                    {getLastTournamentDate()}
                </div>
            </div>
            <div className="stats-block">
                <h3>Tournois créé(s)</h3>
                <div className="stats-value">
                    {archivedTournaments ? archivedTournaments.length : 0}
                </div>
            </div>
            <div className="stats-block">
                <h3>Participants moyens</h3>
                <div className="stats-value">
                    {calculateAverageParticipants()}
                </div>
            </div>
        </div>
    );
};

export default StatsBlocks;
