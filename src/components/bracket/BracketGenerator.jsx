import "./BracketGenerator.scss";
import "../../App.scss";
import {useCallback, useMemo, useState} from "react";
import {DISPLAY_EMPTY, EMPTY, EXEMPT} from "../../config/config.js";
import {collectEmptyNodes, collectNodesWithEmptyNear, findConfrontableAdresses} from "../../utils/BracketUtils.js";
import Stats from "./Stats.jsx";
import {TournamentControls} from "./TournamentControls.jsx";
import {downloadJSON} from "../../utils/fileUtils.js";

const BracketGenerator = ({
                              heap,
                              participantNames,
                              restartTournament,
                              resetTournament,
                              cancelTournament,
                              onWin,
                              renameParticipant,
                              saveTournament,
                              undoAction,
                              setHeapHistory,
                              updateLastTournament,
                          }) => {

    const tab = {2: '-200px', 3: '-100px', 4: '-60px', 5: '-45px', 6: '-40px'}


    const [editingCells, setEditingCells] = useState({});
    const [editValues, setEditValues] = useState({});
    const buttonsAddresses = useMemo(() => findConfrontableAdresses(heap), [heap]);
    const aloneAddresses = useMemo(() => collectNodesWithEmptyNear(heap), [heap]);
    const emptyAddresses = useMemo(() => collectEmptyNodes(heap), [heap]);
    const isTournamentOver = heap[0] !== EMPTY;

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

    const columns = useMemo(() => generateColumns(), [generateColumns]);

    const handleDoubleClick = useCallback((heapIndex, item) => {
        if (item !== EMPTY && item !== EXEMPT && item !== "") {
            setEditingCells(prev => ({...prev, [heapIndex]: true}));
            setEditValues(prev => ({
                ...prev,
                [heapIndex]: participantNames[item - 1]
            }));
        }
    }, [participantNames]);

    const handleConfirmEdit = useCallback((heapIndex, item) => {
        if (renameParticipant && editValues[heapIndex] !== undefined) {
            const newName = editValues[heapIndex];
            renameParticipant(item - 1, newName);

            // Mettre à jour la liste des participants avec le nouveau nom
            const updatedParticipantNames = [...participantNames];
            updatedParticipantNames[item - 1] = newName;

            // Mise à jour du tournoi dans l'historique lors du renommage
            const newHeap = [...heap];
            setHeapHistory((prevHistory) => {
                const newHistory = [...prevHistory, newHeap];
                // Envoyer la liste mise à jour des participants à updateLastTournament
                updateLastTournament(newHeap, newHistory, updatedParticipantNames);
                return newHistory;
            });
        }
        setEditingCells(prev => ({...prev, [heapIndex]: false}));
    }, [renameParticipant, editValues, heap, setHeapHistory, updateLastTournament, participantNames]);

    const handleEditChange = useCallback((heapIndex, value) => {
        setEditValues(prev => ({
            ...prev,
            [heapIndex]: value
        }));
    }, []);

    const handleKeyUp = useCallback((e, heapIndex, item) => {
        if (e.key === "Enter") {
            handleConfirmEdit(heapIndex, item);
        }
    }, [handleConfirmEdit]);


    const renderCell = useCallback((item, itemIndex, columnIndex, heapIndex, adrPere, stateClass, colorPositionClass, itemHeight, offsetCount) => {
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
                    // border: "1px solid black",
                    // borderRight: "#121212 solid 1px",
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
                                style={{transform: `translate(${tab[columns.length > 6 ? 6 : columns.length]},7px)`,}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setTimeout(() => {
                                        if (adrPere >= 0) {
                                            onWin(heapIndex, adrPere);
                                        }
                                    }, 10);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseUp={(e) => e.stopPropagation()}
                                title="Marquer comme gagnant"
                            >
                                &#10140;
                            </button>
                        )}
                    </div>
                </div>
            </li>
        );
    }, [buttonsAddresses, editingCells, editValues, handleConfirmEdit, handleDoubleClick, handleEditChange, handleKeyUp, onWin, participantNames]);

    const renderColumns = useCallback(() => {
        const columnElements = [];
        let i = 0;
        let j = 1;
        let offset = 0;

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

                let colorPositionClass = `color-${isRed ? 'red' : 'blue'}`;
                colorPositionClass += itemIndex % 2 ? " odd" : " even";
                if (columnIndex === columns.length - 1) colorPositionClass += " column-last";
                if (columnIndex === 0) colorPositionClass += " column-first";

                let stateClass = "";
                if (buttonsAddresses.includes(heapIndex)) {
                    stateClass = `state-confrontable`;
                } else if (emptyAddresses.includes(heapIndex)) {
                    stateClass = `state-waiting`;
                } else if (aloneAddresses.includes(heapIndex)) {
                    stateClass = `state-terminated`;
                }

                itemElements.push(
                    renderCell(
                        item,
                        itemIndex,
                        columnIndex,
                        heapIndex,
                        adrPere,
                        stateClass,
                        colorPositionClass,
                        itemHeight,
                        0 //à rafiner
                    )
                );

                i++;
            }

            columnElements.push(
                <ul key={columnIndex} className={`bracket-column bracket-column-${columnIndex + 1}`}>
                    {itemElements}
                </ul>
            );

            j *= 2;
            offset += j;
        }

        return columnElements;
    }, [columns, heap, buttonsAddresses, emptyAddresses, aloneAddresses, renderCell]);

    const exportTournamentData = useCallback(() => {
        const tournamentData = {
            heap,
            participants: participantNames,
            date: new Date().toISOString(),
            status: isTournamentOver ? "terminé" : "en cours"
        };

        const filename = `tournoi_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        downloadJSON(tournamentData, filename);
    }, [heap, participantNames, isTournamentOver]);

    return (
        <>
            <TournamentControls
                tournamentOver={isTournamentOver}
                onCancel={cancelTournament}
                onReset={resetTournament}
                onRestart={restartTournament}
                onSave={saveTournament}
                onExport={exportTournamentData}
                onUndo={undoAction}
            />

            <div className="bracket-columns">
                {renderColumns()}
            </div>

            {heap.some(item => item !== EMPTY && item !== EXEMPT && item !== "") && (
                <Stats heap={heap} participantNames={participantNames}/>
            )}
        </>
    );
};

export default BracketGenerator;
