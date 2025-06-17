import "./ConfirmDialog.scss";

const ConfirmDialog = ({
    isOpen,
    message = "Êtes-vous sûr ? Cette action est irréversible.",
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
