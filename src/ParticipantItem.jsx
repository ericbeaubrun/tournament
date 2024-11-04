import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {motion} from "framer-motion";

const ParticipantItem = ({ name, index, moveParticipant, deleteParticipant }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: 'PARTICIPANT',
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Ne rien faire si l'élément est au même endroit
            if (dragIndex === hoverIndex) {
                return;
            }

            // Déterminer la taille de l'élément
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            moveParticipant(dragIndex, hoverIndex);

            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'PARTICIPANT',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <motion.li
            ref={ref}
            className="item-container"
            style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
            layout
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
        >
            {name}
            <button className="delete-button" onClick={() => deleteParticipant(index)}>
                Delete
            </button>
        </motion.li>
    );
};

export default ParticipantItem;
