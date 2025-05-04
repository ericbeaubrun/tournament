import React from "react";
import {useState, useCallback, useEffect} from "react";
// Import useRef séparément pour s'assurer qu'il est bien chargé
import {useRef} from "react";
import "./HomePage.scss";
import Tournament from "../setup/Tournament.jsx";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {EMPTY} from "../config/config.js";
import StatsBlocks from "./StatsBlocks.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import SavedTournaments from "./SavedTournaments.jsx";
import TabNavigation from "./TabNavigation.jsx";
import TournamentHistoryList from "./TournamentHistoryList.jsx";
import EmptyHistory from "./EmptyHistory.jsx";
import ClearAllHistoryCommon from "../ClearAllHistoryCommon.jsx";

export default function HomePage() {

    // États du composant
    const [showSetup, setShowSetup] = useState(false);
    const [archivedTournaments, setArchivedTournaments] = useState([]);
    const [, setLoadTournamentFunction] = useState(null);
    const [, setClearHistoryFunction] = useState(null);
    const [, setHistorySynchronized] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [showConfirmSavedReset, setShowConfirmSavedReset] = useState(false);
    const [showConfirmUnsavedReset, setShowConfirmUnsavedReset] = useState(false);
    const [tournamentToDelete, setTournamentToDelete] = useState(null);

    const hasClearFunctionBeenSet = useRef(false);

    const handleGetArchivedTournaments = useCallback((tournaments) => {
        if (tournaments) {
            setArchivedTournaments(tournaments);
            setHistorySynchronized(true);
        }
    }, []);

    const hasArchivedTournaments = archivedTournaments.length > 0;

    useEffect(() => {
        const handleHistoryLoaded = (event) => {
            const {tournaments} = event.detail;
            if (tournaments && tournaments.length > 0) {
                setArchivedTournaments(tournaments);
                setHistorySynchronized(true);
            }
        };

        window.addEventListener('setup-history-loaded', handleHistoryLoaded);

        return () => {
            window.removeEventListener('setup-history-loaded', handleHistoryLoaded);
        };
    }, []);

    const handleGetLoadTournamentFunction = useCallback((loadFunction) => {
        setLoadTournamentFunction(loadFunction);
    }, []);

    const handleGetClearHistoryFunction = useCallback((clearFunction) => {
        if (!hasClearFunctionBeenSet.current) {
            setClearHistoryFunction(clearFunction);
            hasClearFunctionBeenSet.current = true;
        }
    }, []);

    useEffect(() => {
        const handleHistoryCleared = () => {
            setArchivedTournaments([]);
        };

        window.addEventListener('setup-history-cleared', handleHistoryCleared);

        return () => {
            window.removeEventListener('setup-history-cleared', handleHistoryCleared);
        };
    }, []);

    // Fonction pour effacer uniquement les tournois non sauvegardés
    const clearUnsavedTournaments = useCallback(() => {
        try {
            const savedTournaments = archivedTournaments.filter(t => t.isSaved);

            setArchivedTournaments(savedTournaments);
            localStorage.setItem("tournamentHistory", JSON.stringify(savedTournaments));
            toast.info("Les tournois non sauvegardés ont été effacés.");
        } catch (error) {
            console.error("Erreur lors de l'effacement des tournois non sauvegardés:", error);
        }
    }, [archivedTournaments]);

    const clearSavedTournaments = useCallback(() => {
        try {
            const updatedTournaments = archivedTournaments.map(tournament => ({
                ...tournament, isSaved: false
            }));

            setArchivedTournaments(updatedTournaments);
            localStorage.setItem("tournamentHistory", JSON.stringify(updatedTournaments));
            toast.success("Le statut de favori a été retiré de tous les tournois.");
        } catch (error) {
            console.error("Erreur lors du retrait du statut de favori:", error);
            toast.error("Une erreur est survenue lors du retrait du statut de favori.");
        }
    }, [archivedTournaments]);

    const effectiveClearHistory = useCallback(() => {
        try {
            const savedTournaments = archivedTournaments.filter(t => t.isSaved);
            setArchivedTournaments(savedTournaments);

            localStorage.setItem("tournamentHistory", JSON.stringify(savedTournaments));

            toast.info("L'historique des tournois a été effacé (les favoris ont été conservés).");
        } catch (error) {
            console.error("Erreur lors de l'effacement:", error);
        }
    }, [archivedTournaments]);

    const handleResetHistory = useCallback(() => {
        setShowConfirmReset(true);
        setShowConfirmSavedReset(false);
        setShowConfirmUnsavedReset(false);
    }, []);

    const handleResetSavedTournaments = useCallback(() => {
        setShowConfirmSavedReset(true);
        setShowConfirmReset(false);
        setShowConfirmUnsavedReset(false);
    }, []);

    const handleResetUnsavedTournaments = useCallback(() => {
        setShowConfirmUnsavedReset(true);
        setShowConfirmReset(false);
        setShowConfirmSavedReset(false);
    }, []);

    const handleCancelReset = useCallback(() => {
        setShowConfirmReset(false);
        setShowConfirmSavedReset(false);
        setShowConfirmUnsavedReset(false);
    }, []);

    const [saveTournamentFunction, setSaveTournamentFunction] = useState(null);

    const handleGetSaveTournamentFunction = useCallback((saveFunction) => {
        setSaveTournamentFunction(saveFunction);
    }, []);

    const confirmDeleteTournament = useCallback((index) => {
        setTournamentToDelete(index);
    }, []);

    const cancelDeleteTournament = useCallback(() => {
        setTournamentToDelete(null);
    }, []);

    const [tournamentToLoad, setTournamentToLoad] = useState(null);
    const [activeTab, setActiveTab] = useState('statistics'); // 'statistics' ou 'history'
    const lastLoadedTournamentRef = useRef(null);

    const handleSaveTournament = useCallback((index) => {
        try {
            if (archivedTournaments[index]) {
                const tournament = archivedTournaments[index];
                const filename = `tournoi_${tournament.date.replace(/[\/\s:]/g, "_")}.json`;
                const tournamentBlob = new Blob([JSON.stringify(tournament, null, 2)], {type: "application/json"});
                const downloadLink = document.createElement("a");
    
                downloadLink.href = URL.createObjectURL(tournamentBlob);
                downloadLink.download = filename;
    
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
    
                setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);
    
                toast.success(`Tournoi exporté avec succès sous le nom : ${filename}`);
            } else {
                console.error("Index de tournoi invalide:", index);
                toast.error("Impossible d'exporter le tournoi: index invalide");
            }
        } catch (error) {
            console.error("Erreur lors de l'exportation du tournoi:", error);
            toast.error(`Erreur lors de l'exportation: ${error.message}`);
        }
    }, [archivedTournaments]);

    const toggleFavorite = useCallback((index) => {
        if (index >= 0 && index < archivedTournaments.length) {
            try {
                const updatedTournaments = [...archivedTournaments];

                updatedTournaments[index] = {
                    ...updatedTournaments[index],
                    isSaved: !updatedTournaments[index].isSaved,
                    savedAt: updatedTournaments[index].isSaved ? null : new Date().toISOString()
                };

                setArchivedTournaments(updatedTournaments);
                localStorage.setItem("tournamentHistory", JSON.stringify(updatedTournaments));

                if (updatedTournaments[index].isSaved) {
                    toast.success("Tournoi ajouté aux favoris");
                } else {
                    toast.info("Tournoi retiré des favoris");
                }
            } catch (error) {
                console.error("Erreur lors de la modification de l'état de favori:", error);
                toast.error("Erreur lors de la modification de l'état de favori");
            }
        }
    }, [archivedTournaments]);


    // Fonction pour supprimer un tournoi spécifique
    const deleteTournament = useCallback(() => {
        if (tournamentToDelete !== null && tournamentToDelete >= 0 && tournamentToDelete < archivedTournaments.length) {
            try {
                const updatedTournaments = archivedTournaments.filter((_, i) => i !== tournamentToDelete);

                setArchivedTournaments(updatedTournaments);
                localStorage.setItem("tournamentHistory", JSON.stringify(updatedTournaments));
                toast.success("Tournoi supprimé avec succès");
                setTournamentToDelete(null);
            } catch (error) {
                console.error("Erreur lors de la suppression du tournoi:", error);
                toast.error("Erreur lors de la suppression du tournoi");
            }
        }
    }, [archivedTournaments, tournamentToDelete]);


    const handleLoadTournament = useCallback((index) => {
        if (lastLoadedTournamentRef.current === index) return;

        if (index !== undefined && Number.isInteger(Number(index))) {
            lastLoadedTournamentRef.current = index;
            setTournamentToLoad(index);
            setShowSetup(true);
        } else {
            console.warn("Tentative de chargement avec un index invalide:", index);
        }
    }, []);

    useEffect(() => {
        if (!showSetup) {
            lastLoadedTournamentRef.current = null;
            setTournamentToLoad(null);
        }
    }, [showSetup]);

    // Fonction pour importer un tournoi depuis un fichier JSON
    const importTournament = useCallback(() => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const tournamentData = JSON.parse(e.target.result);

                    const hasHeap = Array.isArray(tournamentData.heap);
                    const hasParticipants = Array.isArray(tournamentData.participants) || Array.isArray(tournamentData.participantNames);

                    if (!hasHeap || !hasParticipants) {
                        throw new Error("Format de fichier invalide: données manquantes");
                    }

                    const participants = tournamentData.participants || tournamentData.participantNames || [];
                    const parsedDate = tournamentData.date || new Date().toISOString();
                    
                    const newTournament = {
                        heap: tournamentData.heap,
                        participants: [...participants], // Tableau explicite pour éviter les problèmes de référence
                        participantNames: [...participants], // Dupliquer pour compatibilité avec tous les composants
                        winner: tournamentData.heap[0] !== EMPTY && tournamentData.heap[0] !== "" ? tournamentData.heap[0] : null,
                        date: parsedDate,
                        createdAt: parsedDate,
                        savedAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                        status: tournamentData.status || "importé",
                        isSaved: true,
                        isComplete: tournamentData.heap[0] !== EMPTY && tournamentData.heap[0] !== "",
                        displayName: file.name.replace(/\.json$/, ''),
                        lineCount: participants.length,
                        imported: true,
                        importDate: new Date().toISOString(),
                        fileName: file.name,
                        heapHistory: tournamentData.heapHistory || [tournamentData.heap],
                    };
                    
                    console.log("Tournoi importé:", newTournament); // Pour le débogage
                    
                    // Vérifier si ce tournoi est déjà dans l'historique (par date ou contenu)
                    const isAlreadyInHistory = archivedTournaments.some(
                        t => t.date === newTournament.date || 
                            (JSON.stringify(t.heap) === JSON.stringify(newTournament.heap) && 
                             Array.isArray(t.participants) && JSON.stringify(t.participants) === JSON.stringify(newTournament.participants))
                    );
                    
                    let updatedTournaments;
                    if (isAlreadyInHistory) {
                        // Si déjà présent, remplacer avec la version importée
                        updatedTournaments = archivedTournaments.map(t => 
                            (t.date === newTournament.date) ? newTournament : t
                        );
                        toast.info("Tournoi mis à jour (version déjà présente dans l'historique)");
                    } else {
                        // Sinon, ajouter au début de l'historique
                        updatedTournaments = [newTournament, ...archivedTournaments];
                        toast.success(`Tournoi "${file.name}" importé avec succès`);
                    }
                    
                    // Mettre à jour l'historique
                    setArchivedTournaments(updatedTournaments);
                    localStorage.setItem("tournamentHistory", JSON.stringify(updatedTournaments));
                    
                    // Charger ce tournoi immédiatement
                    lastLoadedTournamentRef.current = 0;
                    setTournamentToLoad(0);
                    setShowSetup(true);
                } catch (error) {
                    console.error("Erreur lors de l'importation:", error);
                    toast.error(`Erreur lors de l'importation: ${error.message}`);
                }
            };

            reader.readAsText(file);
        });

        fileInput.click();
    }, [archivedTournaments]);

    return (<div className="homepage-container">
        {/* Composant invisible pour charger l'historique */}
        <div style={{display: 'none'}}>
            <Tournament
                showSetup={false}
                getArchivedTournaments={handleGetArchivedTournaments}
                getLoadTournamentFunction={handleGetLoadTournamentFunction}
                getClearHistoryFunction={handleGetClearHistoryFunction}
                getSaveTournamentFunction={handleGetSaveTournamentFunction}
            />
        </div>

        <header className="homepage-header">
            <div 
                className="logo-container" 
                onClick={() => setShowSetup(false)} 
                title="Retour à l'accueil"
            >
                <img src="src/assets/icon.png" alt="Logo Tournament" className="logo-image" />
                {/*<h1 className="logo-text">Tournament</h1>*/}
            </div>
            <div className="header-actions">
                <button
                    className="import-button"
                    onClick={importTournament}
                    title="Importer un tournoi à partir d'un fichier JSON"
                >
                    <span className="import-icon">↑</span>
                    Importer un tournoi
                </button>
            </div>
        </header>

        {!showSetup ? (<>
            <section className="hero-section">
                <h2 className="hero-title">Tournament Bracket Generator</h2>
                <p className="hero-subtitle">
                    Create your own tournament bracket with our free easy-to-use generator.
                </p>
                <div className="hero-buttons">
                    <button
                        className="btn-primary"
                        onClick={() => setShowSetup(true)}
                    >
                        New Bracket
                    </button>
                </div>
            </section>

            <section className="tournament-history-container">
                {hasArchivedTournaments ? (
                    <>
                        <TabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            tabs={[{id: 'statistics', label: 'Tournois Sauvegardés'}, {
                                id: 'history',
                                label: 'Historique des Tournois'
                            }]}
                        />

                        {activeTab === 'statistics' && (<section className="tournament-stats-section">
                            <StatsBlocks archivedTournaments={archivedTournaments}/>

                            <div className="saved-tournaments">
                                <div className="saved-tournaments-header">
                                    <h3>Favoris</h3>
                                </div>
                                <SavedTournaments
                                    archivedTournaments={archivedTournaments}
                                    handleLoadTournament={handleLoadTournament}
                                    handleSaveTournament={handleSaveTournament}
                                />
                                <div className="history-buttons-container">
                                    <button
                                        className="delete-button"
                                        onClick={handleResetSavedTournaments}
                                        title="Retirer le statut de favori de tous les tournois"
                                    >
                                        Remove all favorites
                                    </button>

                                    <ConfirmDialog
                                        isOpen={showConfirmSavedReset}
                                        message="Retirer le statut de favori de tous les tournois ? (Les tournois resteront dans l'historique)"
                                        confirmLabel="Oui, retirer les favoris"
                                        cancelLabel="Annuler"
                                        onConfirm={() => {
                                            clearSavedTournaments();
                                            setShowConfirmSavedReset(false);
                                        }}
                                        onCancel={handleCancelReset}
                                    />
                                </div>
                            </div>

                            <div className="clear-all-history-common">
                                <button
                                    className="reset-history-btn reset-all-common-btn"
                                    onClick={handleResetHistory}
                                    title="Supprime tout l'historique, y compris les favoris"
                                >
                                    Delete all
                                </button>

                                <ConfirmDialog
                                    isOpen={showConfirmReset}
                                    message="Êtes-vous sûr ? Cette action est irréversible et supprimera tous les tournois, y compris les favoris."
                                    confirmLabel="Oui, tout effacer"
                                    cancelLabel="Annuler"
                                    onConfirm={() => {
                                        localStorage.removeItem("tournamentHistory");
                                        setArchivedTournaments([]);
                                        setShowConfirmReset(false);
                                        toast.info("Tout l'historique a été effacé, y compris les favoris.");
                                    }}
                                    onCancel={handleCancelReset}
                                />
                            </div>
                        </section>)}

                        {/* Vue Historique */}
                        {activeTab === 'history' && (<div className="homepage-tournament-history">
                            {/*<h2>Historique complet</h2>*/}
                            <TournamentHistoryList
                                tournaments={archivedTournaments}
                                toggleFavorite={toggleFavorite}
                                handleLoadTournament={handleLoadTournament}
                                handleSaveTournament={handleSaveTournament}
                                confirmDeleteTournament={confirmDeleteTournament}
                            />

                            <ConfirmDialog
                                isOpen={tournamentToDelete !== null}
                                message="Êtes-vous sûr de vouloir supprimer ce tournoi de l'historique ?"
                                confirmLabel="Oui, supprimer"
                                cancelLabel="Annuler"
                                onConfirm={deleteTournament}
                                onCancel={cancelDeleteTournament}
                            />

                            <div className="history-actions">
                                <div className="history-buttons-container">
                                    {!showConfirmReset && (<button
                                        className="delete-button"
                                        onClick={handleResetUnsavedTournaments}
                                        title="Conserve les tournois favoris"
                                    >
                                        Effacer l'historique (sauvegardés exclus)
                                    </button>)}
                                </div>

                                <ConfirmDialog
                                    isOpen={showConfirmUnsavedReset}
                                    message="Effacer tous les tournois non sauvegardés ?"
                                    confirmLabel="Oui, effacer"
                                    cancelLabel="Annuler"
                                    onConfirm={() => {
                                        clearUnsavedTournaments();
                                        setShowConfirmUnsavedReset(false);
                                    }}
                                    onCancel={handleCancelReset}
                                />

                                <ConfirmDialog
                                    isOpen={showConfirmReset && activeTab === 'history'}
                                    message="Êtes-vous sûr ? Cette action est irréversible et supprimera tous les tournois, y compris les favoris."
                                    confirmLabel="Oui, tout effacer"
                                    cancelLabel="Annuler"
                                    onConfirm={() => {
                                        effectiveClearHistory();
                                        setShowConfirmReset(false);
                                    }}
                                    onCancel={handleCancelReset}
                                />
                            </div>

                            {/*<div className="clear-all-history-common">*/}
                            {/*    <button*/}
                            {/*        className="reset-history-btn reset-all-common-btn"*/}
                            {/*        onClick={handleResetHistory}*/}
                            {/*        title="Supprime tout l'historique, y compris les favoris"*/}
                            {/*    >*/}
                            {/*        Delete all*/}
                            {/*    </button>*/}

                            {/*    <ConfirmDialog*/}
                            {/*        isOpen={showConfirmReset && activeTab === 'history'}*/}
                            {/*        message="Êtes-vous sûr ? Cette action est irréversible et supprimera tous les tournois, y compris les favoris."*/}
                            {/*        confirmLabel="Oui, tout effacer"*/}
                            {/*        cancelLabel="Annuler"*/}
                            {/*        onConfirm={() => {*/}
                            {/*            localStorage.removeItem("tournamentHistory");*/}
                            {/*            setArchivedTournaments([]);*/}
                            {/*            setShowConfirmReset(false);*/}
                            {/*            toast.info("Tout l'historique a été effacé, y compris les favoris.");*/}
                            {/*        }}*/}
                            {/*        onCancel={handleCancelReset}*/}
                            {/*    />*/}
                            {/*</div>*/}
                        </div>)}
                    </>) : (<EmptyHistory/>)}
            </section>
        </>) : (<div className="tournament-setup-wrapper">
            <div className="tournament-back-button-container">
                <button
                    className="btn-secondary back-button"
                    onClick={() => setShowSetup(false)}
                >
                    zzz
                </button>
            </div>
            <Tournament
                showSetup={true}
                getArchivedTournaments={handleGetArchivedTournaments}
                getLoadTournamentFunction={handleGetLoadTournamentFunction}
                getClearHistoryFunction={handleGetClearHistoryFunction}
                getSaveTournamentFunction={handleGetSaveTournamentFunction}
                tournamentToLoad={tournamentToLoad}
            />
        </div>)}

        <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />
    </div>);
}
