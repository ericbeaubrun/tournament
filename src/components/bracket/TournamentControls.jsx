import './TournamentControls.scss';
import ExportIcon from "../../assets/export.svg?react";
import LeaveIcon from "../../assets/leave.svg?react";


export const TournamentControls = ({tournamentOver, onCancel, onReset, onRestart, onSave, onExport, onUndo}) => {
    return (
        <div className="tournament-controls">
            <button className="pixel-btn back-btn" onClick={onReset}>
                <LeaveIcon width="24" height="24"/>
                {/*BACK*/}
            </button>

            <div className="action-group">
                <button className="pixel-btn undo-btn" onClick={onUndo}>
                    UNDO
                </button>
                {/*<button className="button save-button" onClick={onSave}>*/}
                {/*    SAVE*/}
                {/*</button>*/}
                <button className="pixel-btn export-btn" onClick={onExport}>
                    <ExportIcon width="22" height="22"/> {/*EXPORT*/}
                </button>
                {
                    tournamentOver ? (
                        <button className="pixel-btn restart-btn" onClick={onRestart}>
                            RELANCER
                        </button>
                    ) : ''
                }
            </div>
        </div>
    );
};

export default TournamentControls;
