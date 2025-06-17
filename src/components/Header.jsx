import ConfirmDialog from "./dialog/ConfirmDialog.jsx";
import "./Header.scss";

import Logo from "../assets/tournament.svg?react";
import DeleteIcon from "../assets/delete.svg?react";
import ImportIcon from '../assets/arrow.svg?react';


export const Header = ({
                           onNavigateHome,
                           onResetHistory,
                           isConfirmDialogOpen,
                           onConfirmReset,
                           onCancelReset,
                           onImportTournament
                       }) => {
    return (
        <header className="homepage-header">
            <div
                className="logo-container"
                onClick={onNavigateHome}
                title="Retour à l'accueil"
            >
                <Logo width="72" height="72"/>
                <h1 className="title">EASY Bracket Generator</h1>
            </div>

            <div className="header-actions">
                <div className="clear-all-history-common">
                    <button
                        className="pixel-btn reset-history-btn"
                        onClick={onResetHistory}
                        title="Supprime tout l'historique, y compris les favoris"
                    >
                        <DeleteIcon width="24" height="24"/>
                    </button>
                    <ConfirmDialog
                        isOpen={isConfirmDialogOpen}
                        onConfirm={onConfirmReset}
                        onCancel={onCancelReset}
                    />
                </div>

                <button
                    className="pixel-btn import-button"
                    onClick={onImportTournament}
                    title="Importer un tournoi à partir d'un fichier JSON"
                >
                <span className="import-icon">
                    <ImportIcon width="22" height="22"/>
                </span>
                    IMPORT TOURNAMENT
                </button>
            </div>
        </header>
    );
};

export default Header;
