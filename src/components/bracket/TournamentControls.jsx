import './TournamentControls.scss';
import exportIcon from "../../assets/export.svg";
import leaveIcon from "../../assets/leave.svg";
import React from "react";


    export const TournamentControls = ({ tournamentOver, onCancel, onReset, onRestart, onSave, onExport, onUndo }) => {
    return (
        <div className="tournament-controls">
            <button className="button back-button" onClick={onReset}>
                <img src={leaveIcon} style={{height: '20px'}} alt="Logo Tournament" className=""/>
                {/*BACK*/}
            </button>

            <div className="action-group">
                <button className="button undo-button" onClick={onUndo}>
                    UNDO
                </button>
                {/*<button className="button save-button" onClick={onSave}>*/}
                {/*    SAVE*/}
                {/*</button>*/}
                <button className="button export-button" onClick={onExport}>
                    <img src={exportIcon} style={{height: '20px'}} alt="Logo Tournament" className=""/>
                    {/*EXPORT*/}
                </button>
                {
                    tournamentOver ? (
                        <button className="button restart-button" onClick={onRestart}>
                            Relancer
                        </button>
                    ) : ''
                }

            </div>


        </div>
    );
};

export default TournamentControls;
