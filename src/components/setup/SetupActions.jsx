import './SetupActions.scss'
import DeleteIcon from "../../assets/delete.svg?react";
import ShuffleIcon from '../../assets/shuffle.svg?react';

export const SetupActions = ({
                                 onClearParticipants,
                                 disabled,
                                 onRemoveLastParticipant,
                                 participantNames,
                                 onAddQuickParticipant,
                                 onRandomizeParticipants
                             }) => {
    return (
        <div className="tournament-actions">
            <button
                className="pixel-btn clear-participants-btn"
                onClick={onClearParticipants}
                disabled={disabled}
                title="Supprimer tous les participants"
            >
                <DeleteIcon width={24} height={24}/>
            </button>
            <div className="participant-counter">
                <button
                    className="pixel-btn decrement-btn"
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
                    className="pixel-btn increment-btn"
                    onClick={onAddQuickParticipant}
                >
                    +
                </button>
            </div>
            <button
                className="pixel-btn shuffle-btn"
                onClick={onRandomizeParticipants}
                disabled={disabled}
                title="Mélanger les participants"
            >
                <ShuffleIcon width={24} height={24}/>
            </button>
        </div>);
};

export default SetupActions;
