import "./ColumnGenerator.scss";
import "./App.scss";
import {EMPTY, EXEMPT} from "./config.js";
import "./BracketTree.js";
import {
    collecterNoeudsAvecFrereEmpty,
    collecterNoeudsEmpty,
    findConfrontableAdresses
} from "./BracketTree.js";

const ColumnGenerator = ({heap, participantNames, restartTournament, resetTournament, cancelTournament, onWin}) => {
    const buttonsAddresses = findConfrontableAdresses(heap);
    const aloneAddresses = collecterNoeudsAvecFrereEmpty(heap);
    const emptyAddresses = collecterNoeudsEmpty(heap);

    const isTournamentOver = buttonsAddresses.length === 0;

    const generateColumns = () => {
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
    };

    const columns = generateColumns();


    return (
        <>
            <div className="columns-container">
                {(() => {
                    const columnElements = [];
                    let i = 0;
                    let j = 1;
                    let offsetCount = 0;

                    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                        const column = columns[columnIndex];
                        const itemHeight = 50 * Math.pow(2, columnIndex);
                        const itemElements = [];

                        let valMin = heap.length - (i) - 1;
                        let valMax = heap.length - (i) - column.length;

                        for (let itemIndex = 0; itemIndex < column.length; itemIndex++) {
                            const item = column[itemIndex];

                            let heapIndex = (valMax + valMin) - (heap.length - (i) - 1);
                            let adrPere = Math.floor((heapIndex - 1) / 2);
                            const groupIndex = Math.floor(itemIndex / 2);

                            let isRed = columnIndex % 2 === 0 ? groupIndex % 2 !== 0 : groupIndex % 2 === 0;

                            const cellClassName2 = `cell ${isRed ? 'red-cell' : 'blue-cell'}`;

                            let cellClassName1;

                            if (buttonsAddresses.includes(heapIndex)) { // Case confrontation possible
                                cellClassName1 = `cell ${'confrontable-cell'}`;
                            } else if (emptyAddresses.includes(heapIndex)) {
                                cellClassName1 = `cell ${'waiting-cell'}`; // Case vide disponible
                            } else if (aloneAddresses.includes(heapIndex)) {
                                cellClassName1 = `cell ${'terminated-cell'}`; // Case en attente d'une autre equipe pour confrontation
                            }

                            let displayText = item !== "" && item !== EXEMPT && item !== EMPTY
                                ? participantNames[item - 1] : item;

                            if (item === EXEMPT) displayText = "";


                            itemElements.push(
                                <li key={itemIndex}
                                    className={"item-container " + cellClassName1 + " " + cellClassName2}
                                    style={{
                                        height: `${itemHeight + offsetCount}px`,
                                        border: `1px solid black`,
                                        borderRight: `#121212 solid 1px`
                                    }}>
                                    <div className={cellClassName1}>
                                        {displayText}
                                        {buttonsAddresses.includes(heapIndex) && (
                                            <button
                                                className="next-button"
                                                onClick={() => {
                                                    if (adrPere >= 0) {
                                                        onWin(heapIndex, adrPere);
                                                    }
                                                }}
                                            >
                                                Win
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                            i++;

                        }
                        columnElements.push(
                            <ul key={columnIndex} className={`column column-${columnIndex + 1}`}>
                                {itemElements}
                            </ul>
                        );
                        j *= 2;
                        offsetCount += j;
                    }
                    return columnElements;
                })()}
            </div>
            <div>
                {isTournamentOver ? (
                    <>
                        <button onClick={cancelTournament}>Retour au choix des participants</button>
                        <button onClick={resetTournament}>Créer un nouveau tournoi</button>
                        <button onClick={restartTournament}>Relancer le tournoi</button>
                    </>
                ) : (
                    <button onClick={cancelTournament}>Annuler le tournoi</button>
                )}
            </div>
        </>
    );
};

export default ColumnGenerator;
