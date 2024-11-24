import {useRef, useState} from 'react';
import {useDrag, useDrop} from 'react-dnd';
import {motion} from "framer-motion";
import draggableIcon from '/src/assets/draggable.svg';


const ParticipantItem = ({name, index, moveParticipant, deleteParticipant, renameParticipant}) => {
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
            className="item-container"
            style={{opacity: isDragging ? 0.5 : 1, cursor: 'move'}}
            layout
            initial={{opacity: 0, y: -15}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 15}}
            transition={{duration: 0.3}}
            onDoubleClick={() => setIsRenaming(true)}
        >
            <img
                src={draggableIcon}
                href="draggable"
                className="draggable-icon"
                style={{opacity: isDragging ? 0.5 : 1, cursor: 'move'}}
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
                <span className="participant-name">{name}</span>
            )}
            <div className="manage-participants-container">
                <button className="rename-button" onClick={handleRename}>✏️</button>
                <button className="delete-button" onClick={() => deleteParticipant(index)}>🗑️</button>
            </div>
        </motion.li>
    );
};

export default ParticipantItem;
