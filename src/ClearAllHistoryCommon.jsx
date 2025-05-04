import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";

const ClearAllHistoryCommon = ({ archivedTournaments, setArchivedTournaments }) => {
    const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);

    // Fonction pour effacer tout l'historique
    const clearAllTournaments = useCallback(() => {
        try {
            setArchivedTournaments([]);
            localStorage.setItem("tournamentHistory", JSON.stringify([]));
            toast.info("L'intégralité de l'historique des tournois a été effacée.");
        } catch (error) {
            console.error("Erreur lors de l'effacement total:", error);
            toast.error("Une erreur est survenue lors de l'effacement total.");
        }
    }, [setArchivedTournaments]);

    // Fonction pour annuler la confirmation
    const cancelClearAll = useCallback(() => {
        setShowConfirmClearAll(false);
    }, []);

    return (
        <>
            {showConfirmClearAll && (
                <div className="confirm-dialog">
                    <h3>Confirmation</h3>
                    <p>Etes-vous sûr de vouloir effacer l'ensemble de l'historique des tournois ? Cette action est irréversible.</p>
                    <button onClick={clearAllTournaments} className="btn-confirm">Oui, Effacer Tout</button>
                    <button onClick={cancelClearAll} className="btn-cancel">Annuler</button>
                </div>
            )}
        </>
    );
};

export default ClearAllHistoryCommon;
