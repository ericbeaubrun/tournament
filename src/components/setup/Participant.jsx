import {useRef, useState} from 'react';
import {useDrag, useDrop} from 'react-dnd';
import {motion} from "framer-motion";
import draggableIcon from '/src/assets/draggable.svg';
import './Participant.scss';
import editIcon from "../../assets/edit.svg";

const Participant = ({name, index, moveParticipant, deleteParticipant, renameParticipant}) => {
    const ref = useRef(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);

    const [, drop] = useDrop({
        accept: 'PARTICIPANT',
        hover(item, monitor) {
            if (ref.current) {
                const dragIndex = item.index;
                const hoverIndex = index;
                if (dragIndex !== hoverIndex) {
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
                }
            }
        },
    });

    const [{isDragging}, drag] = useDrag({
        type: 'PARTICIPANT',
        item: {index},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    const handleRename = () => {
        if (isRenaming && newName.trim() !== name) {
            renameParticipant(index, newName.trim());
        }
        setIsRenaming(!isRenaming);
    };

    return (
        <motion.li
            ref={ref}
            className={`item-container2 ${isDragging ? 'dragging' : ''}`}
            style={{cursor: isDragging ? 'grabbing' : 'grab'}}
            layout
            layoutId={`participant-${index}`}
            initial={{opacity: 0, y: -15}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 15}}
            transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                mass: 1,
                layoutTransition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                }
            }}
            onDoubleClick={() => setIsRenaming(true)}
            whileHover={!isDragging ? {scale: 1.01} : {}}
        >
            <img
                src={draggableIcon}
                alt="draggable"
                className="draggable-icon"
                style={{
                    opacity: isDragging ? 1 : 0.8,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    // filter: isDragging ? 'drop-shadow(0 0 3px rgba(255, 204, 0, 0.7))' : 'drop-shadow(1px 1px 0 #000)'
                }}
            />
            {isRenaming ? (
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename();
                        if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    className="rename-input"
                    autoFocus
                />
            ) : (
                <span className="participant-name2">{name}</span>
            )}
            <div className="manage-participants-container">
                <button className="rename-button" onClick={handleRename}>
                    <img src={editIcon}  style={{height:'20px'}} alt="Logo Tournament" className="icon"/>

                </button>
                <button className="delete-participant-button" onClick={() => deleteParticipant(index)}>
                    X
                </button>
            </div>
        </motion.li>
    );
};

export default Participant;
