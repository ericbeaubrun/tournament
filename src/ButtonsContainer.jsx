export const ButtonsContainer = ({participantNames, onClick, disabled, onClick1}) => {
    return (
        <div className="buttons-container">
            <div className="participants-count">
                <p>Nombre de participants : {participantNames.length}</p>
            </div>

            <button className="button" onClick={onClick} disabled={disabled}>
                Randomiser l'ordre des participants
            </button>

            <button className="button" onClick={onClick1} disabled={disabled}>
                Supprimer tous les participants
            </button>
        </div>
    );
};

export default ButtonsContainer;
