import logo from "../assets/tournament.svg";
import deleteIcon from "../assets/delete.svg";
import ConfirmDialog from "./dialog/ConfirmDialog.jsx";
import "./Header.scss";
import shuffleIcon from "../assets/arrow.svg";


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
                <img src={logo} alt="Logo Tournament" className="logo"/>
                <h1 className="title">EASY Bracket Generator</h1>
            </div>

            <div className="header-actions">
                <div className="clear-all-history-common">
                    <button
                        className="reset-history-btn reset-all-common-btn"
                        onClick={onResetHistory}
                        title="Supprime tout l'historique, y compris les favoris"
                    >
                        <img src={deleteIcon} style={{height: "24px"}} alt="Logo Tournament" className="icon"/>
                    </button>
                    <ConfirmDialog
                        isOpen={isConfirmDialogOpen}
                        onConfirm={onConfirmReset}
                        onCancel={onCancelReset}
                    />
                </div>

                <button
                    className="import-button"
                    onClick={onImportTournament}
                    title="Importer un tournoi à partir d'un fichier JSON"
                >
                <span className="import-icon">
                    <img src={shuffleIcon} alt="Mélanger les participants" className="icon"/>
                </span>
                    Importer un tournoi
                </button>
            </div>
        </header>
    );
};

export default Header;
