import React, {useMemo} from "react";
import "./Stats.scss";
import {EMPTY, EXEMPT} from "../../config/config.js";
import winnerIcon from "../../assets/winner.svg";

const Stats = ({heap, participantNames}) => {

    const playerExists = (val) => {
        return val !== EMPTY && val !== EXEMPT && val !== "";
    }

    const playerStats = useMemo(() => {
        const stats = {};
        participantNames.forEach((name, index) => {
            const playerIndex = index + 1;
            stats[playerIndex] = {
                name,
                wins: 0,
                losses: 0,
            };
        });

        console.log(heap)

        for (let i = 0; i < heap.length; i++) {
            const cur = heap[i];

            if (playerExists(cur)) { // cellule actuelle
                if (2 * i + 1 < heap.length && 2 * i + 2 < heap.length) {
                    const left = heap[2 * i + 1];
                    const right = heap[2 * i + 2];

                    if (playerExists(left) && playerExists(right)) {
                        if (left === cur) {
                            stats[left].wins++;
                            stats[right].losses++;
                        } else if (right === cur) {
                            stats[right].wins++;
                            stats[left].losses++;
                        }
                        // les deux joueurs s'affrontent (facultatif)
                        // stats[left].confrontations++;
                        // stats[right].confrontations++;

                        // l'un des deux joueurs gagne
                        // if (heap[left] === val || heap[right] === val) {
                        //     stats[val].wins++;
                        // }
                    }
                }
            }
        }

        return Object.values(stats).sort((a, b) => b.wins - a.wins);
    }, [heap, participantNames]);

    const winner = useMemo(() => {
        if (heap[0] !== EMPTY && heap[0] !== EXEMPT && heap[0] !== "") {
            return participantNames[heap[0] - 1];
        }
        return null;
    }, [heap, participantNames]);

    return (
        <div className="tournament-stats-container">
            {winner && (
                <div className="tournament-winner">
                    <div className="winner-trophy">
                        <img src={winnerIcon} style={{height: "96px"}} alt="Logo Tournament"/>
                    </div>
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
                                {/*{winner === player.name && <span className="winner-indicator">#1</span>}*/}
                                {player.name}
                            </td>
                            <td>{player.wins + player.losses}</td>
                            <td className="wins-column">{player.wins}</td>
                            <td className="losses-column">{player.losses}</td>
                            <td className="win-rate-column">{player.wins + player.losses === 0 ? 0 : parseInt(player.wins / (player.wins + player.losses) * 100)}%</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stats;
