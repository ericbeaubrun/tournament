import {AnimatePresence, motion} from "framer-motion";
import Participant from "./Participant.jsx";
import './ParticipantList.scss';

export const ParticipantList = ({participantNames, moveParticipant, deleteParticipant, renameParticipant}) => {

    return (
        <div className="participants-list-container">

            <AnimatePresence>
                {participantNames.length === 0 ? (
                    <motion.p
                        className="participants-message"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        Aucun participant pour le moment.
                    </motion.p>
                ) : (
                    <motion.ul layout>
                        {participantNames.map((name, index) => (
                            <Participant
                                key={name}
                                name={name}
                                index={index}
                                moveParticipant={moveParticipant}
                                deleteParticipant={deleteParticipant}
                                renameParticipant={renameParticipant}
                            />
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ParticipantList;
