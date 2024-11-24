export const StartButton = ({startTournament, isAnimating}) => {
    return (
        <div className="start-button-container">
            <button className="button sticky-btn"
                    onClick={startTournament}
                    disabled={isAnimating}
            >
                Démarrer le tournoi
            </button>
        </div>
    );
};
export default StartButton;
