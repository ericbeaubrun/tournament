import './StartTournament.scss';

export const StartTournament = ({ onStartTournament, disabled }) => {
    return (
        <div className="start-tournament-container">
            <button
                className="start-tournament-btn"
                onClick={onStartTournament}
                disabled={disabled}
            >
                Generate
            </button>
        </div>
    );
};

export default StartTournament;
