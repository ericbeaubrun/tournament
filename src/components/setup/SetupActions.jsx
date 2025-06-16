import './SetupActions.scss'
import deleteIcon from "../../assets/delete.svg";
import shuffleIcon from "../../assets/shuffle.svg";

    export const SetupActions = ({ onClearParticipants, disabled, onRemoveLastParticipant, participantNames, onAddQuickParticipant, onRandomizeParticipants }) => {
    return <div className="tournament-actions">
        <button
            className="clear-participants-btn"
            onClick={onClearParticipants}
            disabled={disabled}
            title="Supprimer tous les participants"
        >
            <img src={deleteIcon} alt="Supprimer les participants" className="icon"/>
        </button>
        <div className="participant-counter">
            <button
                className="decrement-btn"
                onClick={onRemoveLastParticipant}
            >
                -
            </button>
            <div className="participant-count">

            <span
                className="participant-count-number">{participantNames.length}
            </span> participant(s)

            </div>

            <button
                className="increment-btn"
                onClick={onAddQuickParticipant}
            >
                +
            </button>
        </div>
        <button
            className="shuffle-btn"
            onClick={onRandomizeParticipants}
            disabled={disabled}
            title="Mélanger les participants"
        >
            <img src={shuffleIcon} alt="Mélanger les participants" className="icon"/>
        </button>
    </div>;
};

export default SetupActions;
