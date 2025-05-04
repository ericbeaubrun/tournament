import { useState, useEffect, useCallback, useRef } from 'react';
import { MAX_TOURNAMENT_HISTORY, STORAGE_KEY_TOURNAMENT_HISTORY } from '../config/config.js';

/**
 * Hook personnalisé pour gérer l'historique des tournois
 * 
 * @param {Object} props - Les propriétés du hook
 * @param {Function} props.setParticipantNames - Fonction pour définir les noms des participants
 * @param {Function} props.setLineCount - Fonction pour définir le nombre de participants
 * @param {Function} props.setHeap - Fonction pour définir l'état du bracket
 * @param {Function} props.setHeapHistory - Fonction pour définir l'historique du bracket
 * @param {Function} props.setIsTournamentStarted - Fonction pour définir si le tournoi a commencé
 * @param {Function} props.setIsTournamentOver - Fonction pour définir si le tournoi est terminé
 * @param {Object} props.toast - Objet toast pour afficher des notifications
 */
const useTournamentHistory = ({
    setParticipantNames,
    setLineCount,
    setHeap,
    setHeapHistory,
    setIsTournamentStarted,
    setIsTournamentOver,
    toast
}) => {
    const [archivedTournaments, setArchivedTournaments] = useState([]);
    const hasLoadedFromLocalStorage = useRef(false);
    
    // Charger l'historique depuis le localStorage au démarrage - avec priorité
    useEffect(() => {
        if (hasLoadedFromLocalStorage.current) return;
        hasLoadedFromLocalStorage.current = true;
    
        try {
            const stored = localStorage.getItem(STORAGE_KEY_TOURNAMENT_HISTORY);
            if (stored) {
                const parsedData = JSON.parse(stored);
                console.log("Données chargées depuis localStorage :", parsedData);
                // Chargement synchrone pour garantir la disponibilité immédiate
                setArchivedTournaments(parsedData);
                
                // Dispatch un événement personnalisé pour indiquer que l'historique est prêt
                window.dispatchEvent(new CustomEvent('setup-history-loaded', {
                    detail: { tournaments: parsedData } 
                }));
            }
        } catch (e) {
            console.error("Erreur de chargement de l'historique des tournois :", e);
            toast.error("Impossible de charger l'historique des tournois");
        }
    }, [toast]);

    // Référence pour suivre si un effacement manuel a été effectué
    const manualClearPerformed = useRef(false);
    
    // Sauvegarder l'historique dans le localStorage à chaque modification
    useEffect(() => {
        // Si nous n'avons pas encore chargé du localStorage, ne rien faire
        if (!hasLoadedFromLocalStorage.current) {
            return;
        }
        
        try {
            // Si le tableau est vide, supprimer l'entrée du localStorage
            if (archivedTournaments.length === 0) {
                // Si c'est un effacement manuel ou si nous avons un tableau vide après le chargement,
                // nous devons supprimer l'entrée du localStorage
                if (manualClearPerformed.current) {
                    console.log("Effacement définitif de l'historique dans localStorage");
                    localStorage.removeItem(STORAGE_KEY_TOURNAMENT_HISTORY);
                    
                    // Après un effacement manuel, il faut déclencher un événement pour informer
                    // les autres composants que l'historique est vide
                    window.dispatchEvent(new CustomEvent('setup-history-cleared'));
                } 
                // Si ce n'est pas un effacement manuel et qu'il y a des données dans le localStorage, 
                // ne pas effacer les données existantes (ce qui se passe au chargement initial)
            } else {
                // Si nous avons des données à sauvegarder, les enregistrer
                localStorage.setItem(STORAGE_KEY_TOURNAMENT_HISTORY, JSON.stringify(archivedTournaments));
            }
        } catch (e) {
            console.error("Erreur de sauvegarde de l'historique des tournois :", e);
        }
    }, [archivedTournaments]);

    /**
     * Ajouter un nouveau tournoi à l'historique
     * Conserve seulement les N derniers tournois définis par MAX_TOURNAMENT_HISTORY
     */
    const addTournamentToHistory = useCallback((tournamentData) => {
        setArchivedTournaments((prev) => {
            const updated = [...prev, tournamentData];
            return updated.slice(-MAX_TOURNAMENT_HISTORY);
        });
    }, []);

    /**
     * Mettre à jour l'état du dernier tournoi dans l'historique
     * Utilisé pour sauvegarder la progression d'un tournoi en cours
     */
    const updateLastTournament = useCallback((newHeap, newHeapHistory) => {
        setArchivedTournaments((prev) => {
            if (!prev.length) return prev;
            
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            
            updated[lastIndex] = {
                ...updated[lastIndex],
                heap: newHeap,
                heapHistory: newHeapHistory,
                lastUpdated: new Date().toISOString()
            };
            
            return updated;
        });
    }, []);
    
    /**
     * Marquer un tournoi comme favori/sauvegardé
     * @param {number} index - L'index du tournoi à marquer comme favori/sauvegardé
     */
    const saveTournament = useCallback((index) => {
        setArchivedTournaments(prev => {
            if (index < 0 || index >= prev.length) {
                return prev;
            }
            
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

    /**
     * Charger un tournoi depuis l'historique
     * @param {number} index - L'index du tournoi à charger dans le tableau d'historique
     */
    const loadOldTournament = useCallback((index) => {
        // Si l'index est null ou undefined, ne rien faire silencieusement
        if (index === null || index === undefined) {
            return;
        }
        
        const oldTournament = archivedTournaments[index];
        if (!oldTournament) {
            toast.error("Tournoi introuvable dans l'historique");
            return;
        }

        try {
            // Restaurer les données du tournoi
            setParticipantNames(oldTournament.participants);
            setLineCount(oldTournament.lineCount);
            
            // Restaurer l'état du heap et son historique
            if (oldTournament.heapHistory && oldTournament.heapHistory.length > 0) {
                setHeapHistory(oldTournament.heapHistory);
                // Revenir à l'état final
                setHeap(oldTournament.heapHistory[oldTournament.heapHistory.length - 1]);
            } else {
                setHeap(oldTournament.heap);
                setHeapHistory([oldTournament.heap]);
            }

            // Activer le tournoi
            setIsTournamentStarted(true);
            setIsTournamentOver(false);
            
            toast.success(`Tournoi du ${oldTournament.date} rechargé avec succès.`);
        } catch (error) {
            console.error("Erreur lors du chargement du tournoi :", error);
            toast.error("Erreur lors du chargement du tournoi");
        }
    }, [archivedTournaments, setParticipantNames, setLineCount, setHeap, setHeapHistory, setIsTournamentStarted, setIsTournamentOver, toast]);

    /**
     * Fonction pour effacer l'historique des tournois
     * Ne devrait être appelée que depuis un bouton de l'interface avec confirmation
     */
    const clearTournamentHistory = useCallback((isUserInitiated = false) => {
        try {
            // Vérifier si c'est un effacement manuel initié par l'utilisateur
            if (!isUserInitiated) {
                console.log("Tentative d'effacement non-initié par l'utilisateur bloquée");
                return;
            }
            
            console.log("Effacement manuel de l'historique demandé");
            // Marquer l'effacement comme manuel
            manualClearPerformed.current = true;
            
            // Supprimer du localStorage
            localStorage.removeItem(STORAGE_KEY_TOURNAMENT_HISTORY);
            // Vider le state
            setArchivedTournaments([]);
            // Notification
            toast.info("L'historique des tournois a été effacé.");
        } catch (error) {
            console.error("Erreur lors de l'effacement de l'historique :", error);
            toast.error("Erreur lors de l'effacement de l'historique");
        }
    }, [toast]);
    
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
