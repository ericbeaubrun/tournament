import "./BracketGenerator.scss";
import "../App.scss";
import {useState, useCallback, useMemo} from "react";
import {DISPLAY_EMPTY, EMPTY, EXEMPT} from "../config/config.js";
import {
    collectNodesWithEmptyNear,
    collectEmptyNodes,
    findConfrontableAdresses
} from "./BracketUtils.js";
import Stats from "./Stats.jsx";

/**
 * Composant qui génère et affiche un arbre de tournoi (bracket)
 * Permet de visualiser et interagir avec l'état actuel du tournoi
 */
const BracketGenerator = ({
                              heap,
                              participantNames,
                              restartTournament,
                              resetTournament,
                              cancelTournament,
                              onWin,
                              renameParticipant,
                              saveTournament
                          }) => {
    // États pour l'édition des noms de participants
    const [editingCells, setEditingCells] = useState({});
    const [editValues, setEditValues] = useState({});

    // Calcul des adresses pour les différents états des cellules
    const buttonsAddresses = useMemo(() => findConfrontableAdresses(heap), [heap]);
    const aloneAddresses = useMemo(() => collectNodesWithEmptyNear(heap), [heap]);
    const emptyAddresses = useMemo(() => collectEmptyNodes(heap), [heap]);
    const isTournamentOver = heap[0] !== EMPTY;
    // const isTournamentOver = buttonsAddresses.length === 0; possible aussi

    // console.log("BracketGenerator :")
    // console.log(heap)


    // Génération des colonnes du bracket
    const generateColumns = useCallback(() => {
        const columns = [];
        let levelStartIndex = 0;
        let itemsInLevel = 1;

        while (levelStartIndex < heap.length) {
            const columnItems = heap.slice(levelStartIndex, levelStartIndex + itemsInLevel);
            columns.unshift(columnItems);
            levelStartIndex += itemsInLevel;
            itemsInLevel *= 2;
        }

        return columns;
    }, [heap]);

    // Mémorisation des colonnes pour éviter des re-calculs inutiles
    const columns = useMemo(() => generateColumns(), [generateColumns]);

    // Gérer le double-clic pour éditer un nom de participant
    const handleDoubleClick = useCallback((heapIndex, item) => {
        if (item !== EMPTY && item !== EXEMPT && item !== "") {
            setEditingCells(prev => ({...prev, [heapIndex]: true}));
            setEditValues(prev => ({
                ...prev,
                [heapIndex]: participantNames[item - 1]
            }));
        }
    }, [participantNames]);

    // Confirmer le changement de nom
    const handleConfirmEdit = useCallback((heapIndex, item) => {
        if (renameParticipant && editValues[heapIndex] !== undefined) {
            renameParticipant(item - 1, editValues[heapIndex]);
        }
        setEditingCells(prev => ({...prev, [heapIndex]: false}));
    }, [renameParticipant, editValues]);

    // Gérer les changements dans le champ d'édition
    const handleEditChange = useCallback((heapIndex, value) => {
        setEditValues(prev => ({
            ...prev,
            [heapIndex]: value
        }));
    }, []);

    // Gérer la touche "Entrée" lors de l'édition
    const handleKeyUp = useCallback((e, heapIndex, item) => {
        if (e.key === "Enter") {
            handleConfirmEdit(heapIndex, item);
        }
    }, [handleConfirmEdit]);

    // Fonction pour créer une cellule du bracket
    const renderCell = useCallback((item, itemIndex, columnIndex, heapIndex, adrPere, stateClass, colorPositionClass, itemHeight, offsetCount) => {
        // Déterminer le texte à afficher
        let displayText = "";
        if (item !== "" && item !== EXEMPT && item !== EMPTY) {
            displayText = participantNames[item - 1];
        } else if (item === EXEMPT) {
            displayText = DISPLAY_EMPTY;
        }

        return (
            <li
                key={itemIndex}
                className={`bracket-cell ${stateClass} ${colorPositionClass}`}
                style={{
                    height: `${itemHeight + offsetCount}px`,
                    border: "1px solid black",
                    borderRight: "#121212 solid 1px",
                }}
                onDoubleClick={() => handleDoubleClick(heapIndex, item)}
            >
                <div className="bracket-cell-content">
                    <div className={`bracket-cell-text`}>
                        {editingCells[heapIndex] ? (
                            <input
                                type="text"
                                value={editValues[heapIndex] || ""}
                                onChange={(e) => handleEditChange(heapIndex, e.target.value)}
                                onBlur={() => handleConfirmEdit(heapIndex, item)}
                                onKeyUp={(e) => handleKeyUp(e, heapIndex, item)}
                                autoFocus
                            />
                        ) : (
                            <span className="participant-name">{displayText}</span>
                        )}
                    </div>
                    <div className="bracket-cell-action">
                        {buttonsAddresses.includes(heapIndex) && (
                            <button
                                className="win-button"
                                onClick={(e) => {
                                    // Empêcher la propagation et l'action par défaut
                                    e.stopPropagation();
                                    e.preventDefault();
                                    // Ajout d'un délai minimal pour éviter des problèmes de timing
                                    setTimeout(() => {
                                        if (adrPere >= 0) {
                                            onWin(heapIndex, adrPere);
                                            // console.log(heap);
                                        }
                                    }, 10);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseUp={(e) => e.stopPropagation()}
                                title="Marquer comme gagnant"
                            >
                                ➤
                            </button>
                        )}
                    </div>
                </div>
            </li>
        );
    }, [buttonsAddresses, editingCells, editValues, handleConfirmEdit, handleDoubleClick, handleEditChange, handleKeyUp, onWin, participantNames]);

    // Rendu des colonnes du bracket
    const renderColumns = useCallback(() => {
        const columnElements = [];
        let i = 0;
        let j = 1;
        let offsetCount = 0;

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            const column = columns[columnIndex];
            const itemHeight = 50 * Math.pow(2, columnIndex);
            const itemElements = [];

            let valMin = heap.length - i - 1;
            let valMax = heap.length - i - column.length;

            for (let itemIndex = 0; itemIndex < column.length; itemIndex++) {
                const item = column[itemIndex];
                const heapIndex = (valMax + valMin) - (heap.length - i - 1);
                const adrPere = Math.floor((heapIndex - 1) / 2);
                const groupIndex = Math.floor(itemIndex / 2);
                const isRed = columnIndex % 2 === 0 ? groupIndex % 2 !== 0 : groupIndex % 2 === 0;

                // Classes CSS pour la position et la couleur des cellules
                let colorPositionClass = `color-${isRed ? 'red' : 'blue'}`;
                colorPositionClass += itemIndex % 2 ? " odd" : " even";
                if (columnIndex === columns.length - 1) colorPositionClass += " column-last";
                if (columnIndex === 0) colorPositionClass += " column-first";

                // Déterminer l'état de la cellule
                let stateClass = "";
                if (buttonsAddresses.includes(heapIndex)) {
                    stateClass = `state-confrontable`;
                } else if (emptyAddresses.includes(heapIndex)) {
                    stateClass = `state-waiting`;
                } else if (aloneAddresses.includes(heapIndex)) {
                    stateClass = `state-terminated`;
                }

                // Ajouter la cellule à la liste des éléments
                itemElements.push(
                    renderCell(item, itemIndex, columnIndex, heapIndex, adrPere,
                        stateClass, colorPositionClass, itemHeight, offsetCount)
                );

                i++;
            }

            // Ajouter la colonne au tableau des colonnes
            columnElements.push(
                <ul key={columnIndex} className={`bracket-column bracket-column-${columnIndex + 1}`}>
                    {itemElements}
                </ul>
            );

            j *= 2;
            offsetCount += j;
        }

        return columnElements;
    }, [columns, heap, buttonsAddresses, emptyAddresses, aloneAddresses, renderCell]);

    // Fonction pour exporter le tournoi actuel directement sans passer par saveTournament
    const exportTournamentData = useCallback(() => {
        try {
            const tournamentData = {
                heap,
                participants: participantNames,
                date: new Date().toISOString(),
                status: isTournamentOver ? "terminé" : "en cours"
            };

            const filename = `tournoi_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
            const tournamentBlob = new Blob([JSON.stringify(tournamentData, null, 2)], {type: "application/json"});
            const downloadLink = document.createElement("a");

            downloadLink.href = URL.createObjectURL(tournamentBlob);
            downloadLink.download = filename;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);

            // Notification de succès (si toast disponible)
            if (window.toast) {
                window.toast.success(`Tournoi exporté avec succès sous le nom : ${filename}`);
            } else {
                alert(`Tournoi exporté avec succès sous le nom : ${filename}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'exportation du tournoi:", error);
            if (window.toast) {
                window.toast.error(`Erreur lors de l'exportation: ${error.message}`);
            } else {
                alert(`Erreur lors de l'exportation: ${error.message}`);
            }
        }
    }, [heap, participantNames, isTournamentOver]);

    return (
        <>
            <div className="bracket-columns">
                {renderColumns()}
            </div>

            <div className="tournament-controls">
                {isTournamentOver ? (
                    <div className="tournament-over-buttons">
                        <button className="button cancel-button" onClick={cancelTournament}>Retour</button>
                        <button className="button reset-button" onClick={resetTournament}>Nouveau</button>
                        <button className="button restart-button" onClick={restartTournament}>Relancer</button>
                        <button className="button save-button" onClick={saveTournament}>
                            Sauvegarder ce tournoi
                        </button>
                        <button className="button export-button" onClick={exportTournamentData}>
                            Exporter en JSON
                        </button>
                    </div>
                ) : (
                    <div className="tournament-action-buttons">
                        <button className="button cancel-button" onClick={cancelTournament}>
                            Annuler le tournoi
                        </button>
                        <button className="button save-button" onClick={saveTournament}>
                            Sauvegarder ce tournoi
                        </button>
                        <button className="button export-button" onClick={exportTournamentData}>
                            Exporter en JSON
                        </button>
                    </div>
                )}
            </div>

            {/* Afficher les statistiques uniquement si le tournoi est en cours ou terminé */}
            {heap.some(item => item !== EMPTY && item !== EXEMPT && item !== "") && (
                <Stats
                    heap={heap}
                    participantNames={participantNames}
                />
            )}
        </>
    );
};

export default BracketGenerator;
