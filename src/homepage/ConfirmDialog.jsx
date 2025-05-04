import React from "react";
import "./ConfirmDialog.scss";

/**
 * Composant de dialogue de confirmation réutilisable
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.isOpen - Indique si le dialogue est ouvert
 * @param {string} props.message - Message à afficher dans la boîte de dialogue
 * @param {string} props.confirmLabel - Texte du bouton de confirmation
 * @param {string} props.cancelLabel - Texte du bouton d'annulation
 * @param {Function} props.onConfirm - Fonction à appeler lors de la confirmation
 * @param {Function} props.onCancel - Fonction à appeler lors de l'annulation
 * @returns {JSX.Element|null} Le composant de dialogue ou null s'il n'est pas ouvert
 */
const ConfirmDialog = ({
    isOpen,
    message,
    confirmLabel = "Oui, confirmer",
    cancelLabel = "Annuler",
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;
    
    return (
        <div className="confirm-dialog-container">
            <div className="confirm-dialog-backdrop"></div>
            <div className="confirm-dialog">
                <p className="confirm-text">{message}</p>
                <div className="confirm-buttons">
                    <button
                        className="confirm-yes"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        className="confirm-no"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
