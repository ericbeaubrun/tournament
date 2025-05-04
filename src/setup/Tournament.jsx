import "../App.scss";
import "./Tournament.scss";
import "react-toastify/dist/ReactToastify.css";
import BracketGenerator from "../bracket/BracketGenerator.jsx";
import {useState, useEffect, useCallback, useRef} from "react";
import {EXEMPT, EMPTY, PARTICIPANTS_ANIMATION_DURATION} from "../config/config.js";
import {toast} from "react-toastify";
import ParticipantList from "./ParticipantList.jsx";
import {buildHeap, sortParticipantList} from "../bracket/BracketUtils.js";
import {Shuffle} from 'lucide-react';
import {CircleX} from 'lucide-react';
import useParticipants from "../hooks/useParticipants.js";
import useTournamentHistory from "../hooks/useTournamentHistory.js";

/**
 * Composant principal qui gère l'application de tournoi
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.showSetup - Indique si les éléments de configuration doivent être affichés
 * @param {Function} props.getArchivedTournaments - Fonction pour récupérer les tournois archivés
 * @param {Function} props.getLoadTournamentFunction - Fonction pour récupérer la fonction de chargement des tournois
 * @param {Function} props.getClearHistoryFunction - Fonction pour récupérer la fonction de suppression de l'historique
 * @param {Function} props.getSaveTournamentFunction - Fonction pour récupérer la fonction d'exportation des tournois
 * @param {number|null} props.tournamentToLoad - Index du tournoi à charger depuis l'historique
 */
const Tournament = ({
                        showSetup = false,
                        getArchivedTournaments = null,
                        getLoadTournamentFunction = null,
                        getClearHistoryFunction = null,
                        getSaveTournamentFunction = null,
                        tournamentToLoad = null
                    }) => {
    // État du tournoi
    const [isTournamentStarted, setIsTournamentStarted] = useState(false);
    const [isTournamentOver, setIsTournamentOver] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [heap, setHeap] = useState([]);
    const [heapHistory, setHeapHistory] = useState([]);

    // Hook personnalisé pour gérer les participants
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

    // Hook personnalisé pour l'historique des tournois
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
        setIsTournamentStarted,
        setIsTournamentOver,
        toast
    });

    // Actions du tournoi
    const cancelTournament = useCallback(() => {
        setIsTournamentStarted(false);
        setIsTournamentOver(false);
        toast.info("Le tournoi a été annulé.");
    }, []);

    const resetTournament = useCallback(() => {
        setIsTournamentStarted(false);
        setIsTournamentOver(false);
        deleteAllParticipants();
        toast.info("Le tournoi a été réinitialisé.");
    }, [deleteAllParticipants]);

    const startTournament = useCallback(() => {
        if (lineCount > 1) {
            let sortedParticipants = sortParticipantList(lineCount);
            let initialHeap = buildHeap(sortedParticipants);

            setHeap(initialHeap);
            setIsTournamentStarted(true);
            setIsTournamentOver(false);
            setHeapHistory([initialHeap]);

            addTournamentToHistory({
                date: new Date().toLocaleString(),
                participants: [...participantNames],
                heap: initialHeap,
                heapHistory: [initialHeap],
                lineCount,
            });

            toast.success("Le tournoi a commencé !");
        } else {
            toast.error("Impossible de lancer avec moins de 2 participants.");
        }
    }, [lineCount, participantNames, addTournamentToHistory]);

    const restartTournament = useCallback(() => {
        setIsTournamentOver(false);
        startTournament();
    }, [startTournament]);

    const onWin = useCallback((heapIndex, adrPere) => {
        const newHeap = [...heap];
        newHeap[adrPere] = newHeap[heapIndex];

        setHeapHistory((prevHistory) => {
            const newHistory = [...prevHistory, newHeap];
            return newHistory;
        });
        setHeap(newHeap);

        updateLastTournament(newHeap, [...heapHistory, newHeap]);
    }, [heap, heapHistory, updateLastTournament, participantNames]);

    const undoAction = useCallback(() => {
        if (heapHistory.length > 1) {
            setHeapHistory((prevHistory) => {
                const newHistory = prevHistory.slice(0, -1);
                const lastHeap = newHistory[newHistory.length - 1];

                setHeap(lastHeap);
                updateLastTournament(lastHeap, newHistory);

                return newHistory;
            });
        } else {
            toast.info("Aucune action à annuler.");
        }
    }, [heapHistory, updateLastTournament]);

    // Sauvegarder le tournoi courant
    const saveTournamentToFavorites = useCallback(() => {
        if (archivedTournaments.length > 0) {
            // Le dernier tournoi dans l'historique est le tournoi actuel
            const lastIndex = archivedTournaments.length - 1;

            if (saveTournament(lastIndex)) {
                toast.success("Tournoi ajouté à vos favoris !");
            } else {
                toast.error("Erreur lors de la sauvegarde du tournoi.");
            }
        }
    }, [archivedTournaments, saveTournament, toast]);

    // Vérification si le tournoi est terminé
    useEffect(() => {
        if (heap.length > 0 && heap[0] !== EMPTY && heap[0] !== EXEMPT) {
            setIsTournamentOver(true);
        }
    }, [heap]);

    // Référence pour suivre si les fonctions ont déjà été fournies
    const hasClearFunctionBeenProvided = useRef(false);

    // Exposer les données d'historique via les props - pour les mises à jour
    useEffect(() => {
        // Mettre à jour uniquement les données d'historique, pas les fonctions
        if (getArchivedTournaments) {
            getArchivedTournaments(archivedTournaments);
        }
    }, [archivedTournaments, getArchivedTournaments]);

    // Fournir les fonctions d'historique seulement lors du montage initial
    useEffect(() => {
        // Fournir loadTournamentFunction une seule fois au montage
        if (getLoadTournamentFunction) {
            getLoadTournamentFunction(loadOldTournament);
        }

        // Fournir clearHistoryFunction une seule fois au montage
        if (getClearHistoryFunction && !hasClearFunctionBeenProvided.current) {
            getClearHistoryFunction((isUserInitiated) => {
                // N'autoriser que les effacements explicitement initiés par l'utilisateur
                if (isUserInitiated === true) {
                    clearTournamentHistory(true);
                }
            });
            hasClearFunctionBeenProvided.current = true;
        }

        // Fournir saveTournamentFunction pour permettre l'exportation
        if (getSaveTournamentFunction) {
            getSaveTournamentFunction(() => {
            });
        }
    }, []); // dépendances vides = exécution uniquement au montage

    // Fournir les données d'historique chaque fois qu'elles changent
    useEffect(() => {
        if (getArchivedTournaments) {
            getArchivedTournaments(archivedTournaments);
        }
    }, [archivedTournaments, getArchivedTournaments]);

    // Référence pour suivre si un tournoi a déjà été chargé avec l'index actuel
    const loadedTournamentRef = useRef(null);

    // Charger un tournoi spécifique si tournamentToLoad est défini
    useEffect(() => {
        // Uniquement charger le tournoi si tournamentToLoad est un nombre valide
        // et si c'est un nouvel index (évite les rechargements en boucle)
        if (tournamentToLoad !== null &&
            tournamentToLoad !== undefined &&
            Number.isInteger(Number(tournamentToLoad)) &&
            archivedTournaments.length > 0 &&
            loadedTournamentRef.current !== tournamentToLoad) {
            // Marquer que ce tournoi a été chargé
            loadedTournamentRef.current = tournamentToLoad;
            loadOldTournament(tournamentToLoad);
        }
    }, [tournamentToLoad, archivedTournaments, loadOldTournament]);

    return (
        <>
            {!isTournamentStarted && showSetup && (
                <div className="tournament-container">
                    <div className="tournament-setup">
                        <div className="tournament-controls-main">
                            <div className="participant-input-container">
                                <input
                                    type="text"
                                    value={currentParticipantName}
                                    onChange={(e) => setCurrentParticipantName(e.target.value)}
                                    onKeyUp={(e) => {
                                        return e.key === "Enter" && addParticipant(currentParticipantName);
                                    }}
                                    placeholder="Entrez le nom de l'équipe"
                                    className="participant-input"
                                />
                                <button
                                    className="add-participant-btn"
                                    onClick={() => addParticipant(currentParticipantName)}
                                    disabled={isAnimating}
                                >
                                    +
                                </button>
                            </div>
                            <div className='tournament-actions'>
                                <button
                                    className="clear-participants-btn"
                                    onClick={deleteAllParticipants}
                                    disabled={isAnimating}
                                    title="Supprimer tous les participants"
                                >
                                    <CircleX color="white" size={32}/>
                                </button>
                                <div className="participant-counter">
                                    <button
                                        className="decrement-btn"
                                        onClick={removeLastParticipant}
                                    >
                                        -
                                    </button>
                                    <div className='participant-count'>
                                        <span
                                            className='participant-count-number'>{participantNames.length}</span> participant(s)
                                    </div>
                                    <button
                                        className="increment-btn"
                                        onClick={addQuickParticipant}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    className="shuffle-btn"
                                    onClick={randomizeParticipants}
                                    disabled={isAnimating}
                                    title="Mélanger les participants"
                                >
                                    <Shuffle color="white" size={32}/>
                                </button>
                            </div>
                            <div className="start-tournament-container">
                                <button
                                    className="start-tournament-btn sticky-btn"
                                    onClick={startTournament}
                                    disabled={isAnimating}
                                >
                                    Commencer
                                </button>
                            </div>
                        </div>
                        <div className="participants-list-container">
                            <ParticipantList
                                participantNames={participantNames}
                                moveParticipant={moveParticipant}
                                deleteParticipant={deleteParticipant}
                                renameParticipant={renameParticipant}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* La section d'historique a été déplacée vers HomePage */}

            {isTournamentStarted && (
                <div className="active-tournament">
                    <BracketGenerator
                        heap={heap}
                        participantNames={participantNames}
                        restartTournament={restartTournament}
                        resetTournament={resetTournament}
                        cancelTournament={cancelTournament}
                        onWin={onWin}
                        renameParticipant={renameParticipant}
                        saveTournament={saveTournamentToFavorites}
                    />
                    {!isTournamentOver && (
                        <div className="tournament-action-controls">
                            <button className="button undo-button" onClick={undoAction}>
                                ↶
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default Tournament;
