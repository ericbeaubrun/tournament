import React, { useMemo } from "react";
import "./Stats.scss";
import { EMPTY, EXEMPT } from "../config/config.js";

/**
 * Composant qui analyse le heap d'un tournoi et affiche les statistiques des participants
 * @param {Array} heap - Le heap représentant l'arborescence du bracket du tournoi
 * @param {Array} participantNames - Les noms des participants
 */
const Stats = ({ heap, participantNames }) => {
    // Calcul des statistiques des joueurs
    const playerStats = useMemo(() => {
        // Initialiser les statistiques pour chaque joueur
        const stats = {};
        participantNames.forEach((name, index) => {
            // L'index du joueur dans le heap est index + 1
            const playerIndex = index + 1;
            stats[playerIndex] = {
                name,
                appearances: 0,
                wins: 0,
                losses: 0,
                winRate: 0
            };
        });

        // Analyse du heap pour calculer les statistiques
        for (let i = 0; i < heap.length; i++) {
            const value = heap[i];
            // Ignorer les emplacements vides ou exemptés
            if (value !== EMPTY && value !== EXEMPT && value !== "") {
                // Comptabiliser une apparition
                stats[value].appearances++;
                
                // Vérifier si ce joueur a gagné à cette position
                const parentIndex = Math.floor((i - 1) / 2);
                if (parentIndex >= 0 && heap[parentIndex] === value) {
                    stats[value].wins++;
                }
                
                // Vérifier si ce joueur a perdu à cette position
                const leftChildIndex = 2 * i + 1;
                const rightChildIndex = 2 * i + 2;
                
                // Si l'un des enfants existe et n'est pas vide/exempt
                if (leftChildIndex < heap.length && heap[leftChildIndex] !== EMPTY && heap[leftChildIndex] !== EXEMPT && heap[leftChildIndex] !== "" && heap[leftChildIndex] !== value) {
                    stats[value].losses++;
                }
                
                if (rightChildIndex < heap.length && heap[rightChildIndex] !== EMPTY && heap[rightChildIndex] !== EXEMPT && heap[rightChildIndex] !== "" && heap[rightChildIndex] !== value) {
                    stats[value].losses++;
                }
            }
        }

        // Calculer le taux de victoire pour chaque joueur
        Object.keys(stats).forEach(playerIndex => {
            const totalMatches = stats[playerIndex].wins + stats[playerIndex].losses;
            stats[playerIndex].winRate = totalMatches > 0 
                ? ((stats[playerIndex].wins / totalMatches) * 100).toFixed(1) 
                : "0.0";
        });

        // Convertir en tableau et trier par nombre de victoires
        return Object.values(stats).sort((a, b) => b.wins - a.wins);
    }, [heap, participantNames]);

    // Identification du vainqueur du tournoi
    const winner = useMemo(() => {
        if (heap[0] !== EMPTY && heap[0] !== EXEMPT && heap[0] !== "") {
            return participantNames[heap[0] - 1];
        }
        return null;
    }, [heap, participantNames]);

    return (
        <div className="tournament-stats-container">
            <h3 className="stats-title">Statistiques du tournoi</h3>
            
            {winner && (
                <div className="tournament-winner">
                    <div className="winner-trophy">🏆</div>
                    <div className="winner-name">{winner}</div>
                </div>
            )}
            
            <div className="stats-table-container">
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>Joueur</th>
                            <th>Matchs joués</th>
                            <th>Victoires</th>
                            <th>Défaites</th>
                            <th>Taux de victoire</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerStats.map((player, index) => (
                            <tr key={index} className={winner === player.name ? "winner-row" : ""}>
                                <td className="player-name">
                                    {winner === player.name && <span className="winner-indicator">👑</span>}
                                    {player.name}
                                </td>
                                <td>{player.appearances}</td>
                                <td className="wins-column">{player.wins}</td>
                                <td className="losses-column">{player.losses}</td>
                                <td className="win-rate-column">{player.winRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stats;
