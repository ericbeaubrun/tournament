import {AnimatePresence, motion} from "framer-motion";
import ParticipantItem from "./ParticipantItem.jsx";

export const ParticipantList = ({participantNames, moveParticipant, deleteParticipant, renameParticipant}) => {

   return (
       <AnimatePresence>
           <motion.ul layout>
               {participantNames.map((name, index) => (
                   <ParticipantItem
                       key={name}
                       name={name}
                       index={index}
                       moveParticipant={moveParticipant}
                       deleteParticipant={deleteParticipant}
                       renameParticipant={renameParticipant}

                   />
               ))}
           </motion.ul>
       </AnimatePresence>
   );
};

export default ParticipantList;
