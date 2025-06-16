import React from "react";
import {EMPTY} from "../../config/config.js";
import "./TournamentHistoryList.scss";
import favIcon from "../../assets/fav.svg";
import exportIcon from "../../assets/export.svg";
import loadIcon from "../../assets/load.svg";
import deleteIcon from "../../assets/delete.svg";

const TournamentHistoryList = ({
                                   tournaments,
                                   toggleFavorite,
                                   handleLoadTournament,
                                   handleSaveTournament,
                                   confirmDeleteTournament
                               }) => {

    return (
        <ul className="history-list">
            {tournaments.map((tournament, index) => {
                const participants = tournament.participants || tournament.participantNames || [];
                const participantsCount = Array.isArray(participants) ? participants.length : 0;
                const tournamentDate = tournament.date || "Date inconnue";
                const heap = Array.isArray(tournament.heap) ? tournament.heap : [];
                const heapValue = heap.length > 0 ? heap[0] : null;
                const isSaved = !!tournament.isSaved;

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
                            <div className="history-item-title-container">
                                <strong className="history-item-title">
                                    Tournoi du {tournamentDate}
                                </strong>
                                <button
                                    className="history-button load-button title-load-button"
                                    onClick={() => handleLoadTournament(index)}
                                    title="Charger ce tournoi"
                                >
                                    <img src={loadIcon} alt="Charger" className="button-icon"/>
                                </button>
                            </div>

                            <span className="history-item-participants">
                                {participantsCount} participants
                            </span>

                            {showWinnerText && (
                                <span className="history-item-winner">{winnerText}</span>
                            )}
                        </div>

                        <div className="history-item-actions">
                            <button
                                className="history-button
                                favorite-button"
                                onClick={() => toggleFavorite(index)}
                                title={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                                <img src={favIcon} alt="Favoris" className="button-icon"/>
                            </button>

                            <button
                                className="history-button export-button"
                                onClick={() => handleSaveTournament(index)}
                                title="Exporter le tournoi au format JSON"
                            >
                                <img src={exportIcon} alt="Exporter" className="button-icon"/>
                            </button>

                            <button
                                className="history-button delete-button"
                                onClick={() => confirmDeleteTournament(index)}
                                title="Supprimer ce tournoi de l'historique"
                            >
                                <img src={deleteIcon} alt="Supprimer" className="button-icon"/>
                            </button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default TournamentHistoryList;
