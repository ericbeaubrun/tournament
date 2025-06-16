import "../App.scss";
import "./Tournament.scss";
import "react-toastify/dist/ReactToastify.css";
import BracketGenerator from "./bracket/BracketGenerator.jsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {EMPTY, EXEMPT, PARTICIPANTS_ANIMATION_DURATION} from "../config/config.js";
import {toast} from "react-toastify";
import ParticipantList from "./setup/ParticipantList.jsx";
import {buildHeap, sortParticipantList} from "../utils/BracketUtils.js";
import useParticipants from "../hooks/useParticipants.js";
import useTournamentHistory from "../hooks/useTournamentHistory.js";
import StartTournament from "./setup/StartTournament.jsx";
import SetupActions from "./setup/SetupActions.jsx";
import ParticipantInput from "./setup/ParticipantInput.jsx";

const Tournament = ({
                        showSetup = false,
                        getArchivedTournaments = null,
                        getLoadTournamentFunction = null,
                        getClearHistoryFunction = null,
                        getSaveTournamentFunction = null,
                        tournamentToLoad = null
                    }) => {

    const [isTournamentStarted, setIsStarted] = useState(false);
    const [, setIsOver] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [heap, setHeap] = useState([]);
    const [heapHistory, setHeapHistory] = useState([]);

    const {
        participantNames,
        setParticipantNames,
        lineCount,
        setLineCount,
        currentParticipantName,
        setCurrentParticipantName,
        addParticipant,
        addQuickParticipant,
        removeLastParticipant,
        deleteParticipant,
        deleteAllParticipants,
        moveParticipant,
        renameParticipant,
        randomizeParticipants
    } = useParticipants({
        setIsAnimating,
        PARTICIPANTS_ANIMATION_DURATION,
        toast
    });

    const {
        archivedTournaments,
        addTournamentToHistory,
        updateLastTournament,
        loadOldTournament,
        clearTournamentHistory,
        saveTournament
    } = useTournamentHistory({
        setParticipantNames,
        setLineCount,
        setHeap,
        setHeapHistory,
        setIsTournamentStarted: setIsStarted,
        setIsTournamentOver: setIsOver,
        toast
    });

    const cancelTournament = useCallback(() => {
        setIsStarted(false);
        setIsOver(false);

        if (archivedTournaments.length === 0) localStorage.removeItem("tournamentHistory");

    }, [archivedTournaments.length, heap.length]);

    const reset = useCallback(() => {
        setIsStarted(false);
        setIsOver(false);
        deleteAllParticipants();
    }, [deleteAllParticipants]);

    const start = useCallback(() => {
        if (lineCount > 1) {
            let sortedParticipants = sortParticipantList(lineCount);
            let initialHeap = buildHeap(sortedParticipants);

            setHeap(initialHeap);
            setIsStarted(true);
            setIsOver(false);
            setHeapHistory([initialHeap]);

            addTournamentToHistory({
                date: new Date().toLocaleString(),
                participants: [...participantNames],
                heap: initialHeap,
                heapHistory: [initialHeap],
                lineCount,
            });

        }

    }, [lineCount, participantNames, addTournamentToHistory]);

    const restart = useCallback(() => {
        setIsOver(false);
        let sortedHeap = sortParticipantList(lineCount);
        let heap = buildHeap(sortedHeap);

        setHeap(heap);
        setIsStarted(true);
        setIsOver(false);
        setHeapHistory([heap]);

        updateLastTournament(heap, [heap], [...participantNames]);
    }, [lineCount, participantNames, updateLastTournament]);

    const onWin = useCallback((heapIndex, adrPere) => {
        const newHeap = [...heap];
        newHeap[adrPere] = newHeap[heapIndex];

        setHeapHistory((prevHistory) => {
            return [...prevHistory, newHeap];
        });

        setHeap(newHeap);

        updateLastTournament(newHeap, [...heapHistory, newHeap], [...participantNames]);
    }, [heap, heapHistory, updateLastTournament, participantNames]);

    const undo = useCallback(() => {
        if (heapHistory.length > 1) {
            setHeapHistory((prevHistory) => {
                const newHistory = prevHistory.slice(0, -1);
                const lastHeap = newHistory[newHistory.length - 1];

                setHeap(lastHeap);
                updateLastTournament(lastHeap, newHistory, [...participantNames]);

                return newHistory;
            });
        }
    }, [heapHistory, updateLastTournament, participantNames]);

    // TODO
    const saveTournamentToFavorites = useCallback(() => {
    }, [archivedTournaments, saveTournament]);

    useEffect(() => {
        if (heap.length > 0 && heap[0] !== EMPTY && heap[0] !== EXEMPT) {
            setIsOver(true);
        }
    }, [heap]);

    const hasClearFunctionBeenProvided = useRef(false);

    useEffect(() => {
        if (getArchivedTournaments) getArchivedTournaments(archivedTournaments);

        const handleHistoryResetRequest = (event) => {
            const isComplete = event.detail?.complete === true;
            clearTournamentHistory(true);
            loadedTournamentRef.current = null;

            if (isComplete) window.dispatchEvent(new CustomEvent('history-reset-complete'));
        };

        window.addEventListener('history-reset-requested', handleHistoryResetRequest);

        return () => {
            window.removeEventListener('history-reset-requested', handleHistoryResetRequest);
        };
    }, [archivedTournaments, getArchivedTournaments, clearTournamentHistory]);

    useEffect(() => {
        if (getLoadTournamentFunction) getLoadTournamentFunction(loadOldTournament);

        if (getClearHistoryFunction && !hasClearFunctionBeenProvided.current) {
            getClearHistoryFunction((isUserInitiated) => {
                if (isUserInitiated === true) clearTournamentHistory(true);
            });
            hasClearFunctionBeenProvided.current = true;
        }

        if (getSaveTournamentFunction) {
            getSaveTournamentFunction(() => {
            });
        }
    }, []);

    useEffect(() => {
        if (getArchivedTournaments) getArchivedTournaments(archivedTournaments);
    }, [archivedTournaments, getArchivedTournaments]);

    const loadedTournamentRef = useRef(null);

    useEffect(() => {
        if (tournamentToLoad !== null &&
            tournamentToLoad !== undefined &&
            Number.isInteger(Number(tournamentToLoad)) &&
            archivedTournaments.length > 0 &&
            loadedTournamentRef.current !== tournamentToLoad) {
            loadedTournamentRef.current = tournamentToLoad;
            loadOldTournament(tournamentToLoad);
        }
    }, [tournamentToLoad, archivedTournaments, loadOldTournament]);

    return (
        <>
            {
                !isTournamentStarted && showSetup && (
                    <div className="tournament-container">
                        <div className="tournament-controls-main">
                            <ParticipantInput
                                value={currentParticipantName}
                                onChange={(e) => setCurrentParticipantName(e.target.value)}
                                onKeyUp={(e) => {
                                    return e.key === "Enter" && addParticipant(currentParticipantName);
                                }}
                                onAddParticipant={() => addParticipant(currentParticipantName)}
                                disabled={isAnimating}
                            />

                            <SetupActions
                                onClearParticipants={deleteAllParticipants}
                                disabled={isAnimating}
                                onRemoveLastParticipant={removeLastParticipant}
                                participantNames={participantNames}
                                onAddQuickParticipant={addQuickParticipant}
                                onRandomizeParticipants={randomizeParticipants}
                            />

                            <StartTournament
                                onStartTournament={start}
                                disabled={isAnimating}
                            />

                        </div>
                        <ParticipantList
                            participantNames={participantNames}
                            moveParticipant={moveParticipant}
                            deleteParticipant={deleteParticipant}
                            renameParticipant={renameParticipant}
                        />
                    </div>
                )
            }

            {
                isTournamentStarted && (
                    <div className="active-tournament">
                        <BracketGenerator
                            heap={heap}
                            participantNames={participantNames}
                            restartTournament={restart}
                            resetTournament={reset}
                            cancelTournament={cancelTournament}
                            onWin={onWin}
                            renameParticipant={renameParticipant}
                            saveTournament={saveTournamentToFavorites}
                            undoAction={undo}
                            setHeapHistory={setHeapHistory}
                            updateLastTournament={updateLastTournament}
                        />

                    </div>
                )
            }
        </>
    );
};

export default Tournament;
