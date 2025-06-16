import './ParticipantInput.scss';

export const ParticipantInput = ({ value, onChange, onKeyUp, onAddParticipant, disabled }) => {
    return (
        <div className="participant-input-container">
            <input
                type="text"
                value={value}
                onChange={onChange}
                onKeyUp={onKeyUp}
                placeholder="Entrez le nom de l'équipe"
                className="participant-input"
            />
            <button
                className="add-participant-btn"
                onClick={onAddParticipant}
                disabled={disabled}
            >
                +
            </button>
        </div>
    );
};

export default ParticipantInput;
