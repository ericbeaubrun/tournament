import {useState, useEffect, useCallback, useRef} from 'react';
import {MAX_TOURNAMENT_HISTORY, STORAGE_KEY_TOURNAMENT_HISTORY} from '../config/config.js';

const useTournamentHistory = ({
                                  setParticipantNames,
                                  setLineCount,
                                  setHeap,
                                  setHeapHistory,
                                  setIsTournamentStarted,
                                  setIsTournamentOver
                              }) => {
    const [archivedTournaments, setArchivedTournaments] = useState([]);
    const hasLoadedFromLocalStorage = useRef(false);

    useEffect(() => {
        if (hasLoadedFromLocalStorage.current) return;
        hasLoadedFromLocalStorage.current = true;

        try {
            const stored = localStorage.getItem(STORAGE_KEY_TOURNAMENT_HISTORY);
            if (stored) {
                const parsedData = JSON.parse(stored);
                setArchivedTournaments(parsedData);
                window.dispatchEvent(new CustomEvent('setup-history-loaded', {
                    detail: {tournaments: parsedData}
                }));
            }
        } catch (e) {
            //TODO
            console.error(e);
        }
    }, []);

    const manualClearPerformed = useRef(false);

    useEffect(() => {
        if (!hasLoadedFromLocalStorage.current) return;

        try {
            if (archivedTournaments.length === 0) {
                if (manualClearPerformed.current) {
                    localStorage.removeItem(STORAGE_KEY_TOURNAMENT_HISTORY);

                    window.dispatchEvent(new CustomEvent('setup-history-cleared'));
                }
            } else {
                localStorage.setItem(STORAGE_KEY_TOURNAMENT_HISTORY, JSON.stringify(archivedTournaments));
            }
        } catch (e) {
            //TODO
            console.error(e);
        }
    }, [archivedTournaments]);

    // Écouter l'événement de réinitialisation complète
    useEffect(() => {
        const handleHistoryResetComplete = () => {
            manualClearPerformed.current = false;
        };

        window.addEventListener('history-reset-complete', handleHistoryResetComplete);

        return () => {
            window.removeEventListener('history-reset-complete', handleHistoryResetComplete);
        };
    }, []);

    const addTournamentToHistory = useCallback((tournamentData) => {
        // Réinitialiser le flag de suppression manuelle quand on ajoute un nouveau tournoi
        manualClearPerformed.current = false;

        setArchivedTournaments((prev) => {
            // console.log("TEST :")
            // console.log(prev)
            const updated = [...prev, tournamentData];
            return updated.slice(-MAX_TOURNAMENT_HISTORY);
        });
    }, []);

    const updateLastTournament = useCallback((newHeap, newHeapHistory, updatedParticipants) => {
        setArchivedTournaments((prev) => {
            if (!prev.length) return prev;

            const updated = [...prev];
            const lastIndex = updated.length - 1;

            updated[lastIndex] = {
                ...updated[lastIndex],
                heap: newHeap,
                heapHistory: newHeapHistory,
                lastUpdated: new Date().toISOString(),
                // Met à jour les noms des participants si fournis
                ...(updatedParticipants ? {participants: updatedParticipants} : {})
            };

            return updated;
        });
    }, []);

    const saveTournament = useCallback((index) => {
        setArchivedTournaments(prev => {
            if (index < 0 || index >= prev.length) return prev;

            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                isSaved: true,
                savedAt: new Date().toISOString()
            };

            return updated;
        });

        return true;
    }, []);

    const loadOldTournament = useCallback((index) => {
        if (index === null || index === undefined) return;

        const oldTournament = archivedTournaments[index];

        if (!oldTournament) return;

        try {
            setParticipantNames(oldTournament.participants);
            setLineCount(oldTournament.lineCount);

            if (oldTournament.heapHistory && oldTournament.heapHistory.length > 0) {
                setHeapHistory(oldTournament.heapHistory);
                setHeap(oldTournament.heapHistory[oldTournament.heapHistory.length - 1]);
            } else {
                setHeap(oldTournament.heap);
                setHeapHistory([oldTournament.heap]);
            }

            setIsTournamentStarted(true);
            setIsTournamentOver(false);

        } catch (e) {
            //TODO
            console.error(e);
        }
    }, [archivedTournaments, setParticipantNames, setLineCount, setHeap, setHeapHistory, setIsTournamentStarted, setIsTournamentOver]);

    const clearTournamentHistory = useCallback((isUserInitiated = false) => {
        try {
            if (!isUserInitiated) return;
            manualClearPerformed.current = true;
            hasLoadedFromLocalStorage.current = true;
            localStorage.removeItem(STORAGE_KEY_TOURNAMENT_HISTORY);
            setArchivedTournaments([]);
            window.dispatchEvent(new CustomEvent('setup-history-cleared'));
        } catch (e) {
            //TODO
            console.error(e);
        }
    }, []);

    return {
        archivedTournaments,
        addTournamentToHistory,
        updateLastTournament,
        loadOldTournament,
        clearTournamentHistory,
        saveTournament
    };
};

export default useTournamentHistory;
