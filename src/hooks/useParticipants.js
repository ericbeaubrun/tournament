import {useCallback, useState} from 'react';

const useParticipants = ({setIsAnimating, PARTICIPANTS_ANIMATION_DURATION}) => {
    const [participantNames, setParticipantNames] = useState([]);
    const [lineCount, setLineCount] = useState(0);
    const [currentParticipantName, setCurrentParticipantName] = useState("");

    const shuffleArray = useCallback((array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    const randomizeParticipants = useCallback(() => {
        if (participantNames.length > 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setIsAnimating(false);
            }, PARTICIPANTS_ANIMATION_DURATION);

            setParticipantNames((prevNames) => shuffleArray(prevNames));
        }
    }, [participantNames, setIsAnimating, shuffleArray, PARTICIPANTS_ANIMATION_DURATION]);

    const addParticipant = useCallback((name) => {
        if (name === "") return;
        if (participantNames.includes(name)) return;

        setLineCount((prev) => prev + 1);
        setParticipantNames((prev) => [...prev, name]);
        setCurrentParticipantName("");
    }, [participantNames]);

    const addQuickParticipant = useCallback(() => {
        const newParticipant = `team ${participantNames.length + 1}`;
        setParticipantNames((prev) => [...prev, newParticipant]);
        setLineCount((prev) => prev + 1);
    }, [participantNames]);

    const removeLastParticipant = useCallback(() => {
        if (participantNames.length > 0) {
            setParticipantNames((prev) => prev.slice(0, -1));
            setLineCount((prev) => prev - 1);
        }
    }, [participantNames]);

    const deleteParticipant = useCallback((index) => {
        if (participantNames.length > 0) {

            setParticipantNames((prev) => {
                const newNames = [...prev];
                newNames.splice(index, 1);
                return newNames;
            });

            // setParticipantNames((prev) => prev.slice(index, 1));

            setLineCount((prevCount) => prevCount - 1);
        }
    }, [participantNames]);


    const deleteAllParticipants = useCallback(() => {
        setParticipantNames([]);
        setLineCount(0);
    }, []);

    const renameParticipant = useCallback((index, newName) => {
        setParticipantNames((prev) => {
            const updatedNames = [...prev];
            const oldName = updatedNames[index];

            if (newName === oldName || prev.includes(newName)) return prev;

            updatedNames[index] = newName;
            return updatedNames;
        });
    }, []);

    const moveParticipant = useCallback((fromIndex, toIndex) => {
        setParticipantNames((prev) => {
            const updatedNames = [...prev];
            const [movedItem] = updatedNames.splice(fromIndex, 1);
            updatedNames.splice(toIndex, 0, movedItem);
            return updatedNames;
        });
    }, []);

    return {
        participantNames,
        setParticipantNames,
        lineCount,
        setLineCount,
        currentParticipantName,
        setCurrentParticipantName,
        addParticipant,
        addQuickParticipant,
        removeLastParticipant,
        deleteParticipant,
        deleteAllParticipants,
        moveParticipant,
        renameParticipant,
        randomizeParticipants
    };
};

export default useParticipants;
