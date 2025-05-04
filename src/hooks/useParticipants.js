import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer la liste des participants du tournoi
 */
const useParticipants = ({ setIsAnimating, PARTICIPANTS_ANIMATION_DURATION, toast }) => {
    const [participantNames, setParticipantNames] = useState([]);
    const [lineCount, setLineCount] = useState(0);
    const [currentParticipantName, setCurrentParticipantName] = useState("");

    // Fonction utilitaire pour mélanger un tableau
    const shuffleArray = useCallback((array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    // Randomiser l'ordre des participants
    const randomizeParticipants = useCallback(() => {
        if (participantNames.length > 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setIsAnimating(false);
            }, PARTICIPANTS_ANIMATION_DURATION);
            
            setParticipantNames((prevNames) => shuffleArray(prevNames));
            toast.success("L'ordre des participants a été randomisé.");
        } else {
            toast.error("Ajoutez au moins deux participants pour randomiser l'ordre.");
        }
    }, [participantNames, setIsAnimating, shuffleArray, toast, PARTICIPANTS_ANIMATION_DURATION]);

    // Ajouter un participant avec un nom spécifique
    const addParticipant = useCallback((name) => {
        if (name === "") {
            toast.error("Le nom du participant ne peut pas être vide.");
            return;
        } 
        
        if (participantNames.includes(name)) {
            toast.error("Ce participant existe déjà dans le tournoi.");
            return;
        }
        
        setLineCount((prev) => prev + 1);
        setParticipantNames((prev) => [...prev, name]);
        setCurrentParticipantName("");
        toast.success(`Participant "${name}" ajouté avec succès.`);
    }, [participantNames, toast]);

    // Ajouter rapidement un participant avec un nom générique
    const addQuickParticipant = useCallback(() => {
        const newParticipant = `team ${participantNames.length + 1}`;
        setParticipantNames((prev) => [...prev, newParticipant]);
        setLineCount((prev) => prev + 1);
        toast.success(`Participant "${newParticipant}" ajouté avec succès.`);
    }, [participantNames, toast]);

    // Supprimer le dernier participant
    const removeLastParticipant = useCallback(() => {
        if (participantNames.length > 0) {
            setParticipantNames((prev) => prev.slice(0, -1));
            setLineCount((prev) => prev - 1);
            toast.info("Dernier participant supprimé.");
        }
    }, [participantNames, toast]);

    // Supprimer un participant spécifique
    const deleteParticipant = useCallback((index) => {
        setParticipantNames((prevNames) => {
            const updatedNames = [...prevNames];
            const removedName = updatedNames.splice(index, 1)[0];
            toast.info(`Participant "${removedName}" supprimé.`);
            return updatedNames;
        });
        setLineCount((prevCount) => prevCount - 1);
    }, [toast]);

    // Supprimer tous les participants
    const deleteAllParticipants = useCallback(() => {
        setParticipantNames([]);
        setLineCount(0);
        toast.info("Tous les participants ont été supprimés.");
    }, [toast]);

    // Renommer un participant
    const renameParticipant = useCallback((index, newName) => {
        setParticipantNames((prevNames) => {
            const updatedNames = [...prevNames];
            const oldName = updatedNames[index];
            
            if (newName === oldName) {
                toast.info(`"${newName}" n'a pas été renommé.`);
                return prevNames;
            } 
            
            if (prevNames.includes(newName)) {
                toast.error(`Le nom "${newName}" existe déjà.`);
                return prevNames;
            }
            
            updatedNames[index] = newName;
            toast.success(`Participant "${oldName}" a été renommé en "${newName}".`);
            return updatedNames;
        });
    }, [toast]);

    // Déplacer un participant
    const moveParticipant = useCallback((fromIndex, toIndex) => {
        setParticipantNames((prevNames) => {
            const updatedNames = [...prevNames];
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

// Nous n'avons plus besoin d'exposer les setters de cette façon car ils sont déjà retournés 
// directement par le hook

export default useParticipants;
