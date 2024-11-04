
import "./Global.scss";
import ColumnGenerator from "./ColumnGenerator.jsx";
import {useState, useEffect} from "react";
import {EXEMPT, EMPTY, PARTICIPANTS_ANIMATION_DURATION} from "./config.js";
import ParticipantItem from "./ParticipantItem.jsx";
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {motion, AnimatePresence} from 'framer-motion';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Tournament = () => {
    const [lineCount, setLineCount] = useState(0);
    const [heap, setHeap] = useState([]);
    const [heapHistory, setHeapHistory] = useState([]);
    const [currentParticipantName, setCurrentParticipantName] = useState("");
    const [participantNames, setparticipantNames] = useState([]);
    const [isTournamentStarted, setIsTournamentStarted] = useState(false);
    const [isTournamentOver, setIsTournamentOver] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [, setparticipants] = useState([]);

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const randomizeParticipants = () => {
        if (participantNames.length > 1) {

            // Timeout pour eviter les conflits de ressources solicitées par plusieurs boutons
            setIsAnimating(true);
            setTimeout(() => {
                setIsAnimating(false);
            }, PARTICIPANTS_ANIMATION_DURATION);

            setparticipantNames((prevNames) => {
                const shuffledNames = shuffleArray(prevNames);
                return shuffledNames;
            });

            toast.success("L'ordre des participants a été randomisé.");
        } else {
            toast.error("Ajoutez au moins deux participants pour randomiser l'ordre.");
        }
    };
    const increaseParticipantCount = () => {
        if (currentParticipantName !== "") {
            setLineCount((prevLineCount) => {
                const nextLineCount = prevLineCount + 1;
                const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(nextLineCount)));
                return nextLineCount <= nextPowerOf2 ? nextLineCount : prevLineCount;
            });

            setparticipantNames((prevNames) => [...prevNames, currentParticipantName]);
            toast.success(`Participant "${currentParticipantName}" ajouté avec succès.`);
            setCurrentParticipantName("");
        } else {
            toast.error("Le nom du participant ne peut pas être vide.");
        }
    };

    const deleteParticipant = (index) => {
        setparticipantNames((prevNames) => {
            const updatedNames = [...prevNames];
            const removedName = updatedNames.splice(index, 1)[0];
            toast.info(`Participant "${removedName}" supprimé.`);
            return updatedNames;
        });
        setLineCount((prevCount) => prevCount - 1);
    };

    const moveParticipant = (fromIndex, toIndex) => {
        setparticipantNames((prevNames) => {
            const updatedNames = [...prevNames];
            const [movedItem] = updatedNames.splice(fromIndex, 1);
            updatedNames.splice(toIndex, 0, movedItem);
            return updatedNames;
        });
    };


    const deleteAllParticipants = () => {
        setparticipantNames([]);
        setLineCount(0);
        toast.info("Tous les participants ont été supprimés.");
    };

    const sortParticipantList = () => {
        let tmpParticipants = Array.from({length: lineCount}, (_, i) => `${i + 1}`);

        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(lineCount)));
        const numberOfExempts = nextPowerOf2 - tmpParticipants.length;

        for (let i = 0; i < numberOfExempts; i++) {
            const insertIndex = 2 * i + 1;
            if (insertIndex >= tmpParticipants.length) {
                tmpParticipants.push(EXEMPT);
            } else {
                tmpParticipants.splice(insertIndex, 0, EXEMPT);
            }
        }

        setparticipants(tmpParticipants);
        return tmpParticipants;
    };

    const buildHeap = (list) => {
        const n = list.length;
        const tree = Array(2 * n - 1).fill(EMPTY);

        for (let i = 0; i < n; i++) {
            tree[n - 1 + i] = list[i];
        }

        for (let i = n - 2; i >= 0; i--) {
            const leftChild = tree[2 * i + 1];
            const rightChild = tree[2 * i + 2];

            if (leftChild !== EXEMPT && rightChild !== EXEMPT) {
                tree[i] = EMPTY;
            } else if (leftChild === EXEMPT) {
                tree[i] = rightChild;
            } else if (rightChild === EXEMPT) {
                tree[i] = leftChild;
            }
        }

        return tree;
    };


    const cancelTournament = () => {
        setIsTournamentStarted(false);
        toast.info("Le tournoi a été annulé.");
    };

    const resetTournament = () => {
        setIsTournamentStarted(false);
        setparticipants([]);
        setparticipantNames([]);
        setLineCount(0);
        setIsTournamentOver(false);
        toast.info("Le tournoi a été réinitialisé.");
    };

    const restartTournament = () => {
        setparticipants([]);
        setIsTournamentOver(false);
        startTournament()
    };


    const startTournament = () => {
        if (lineCount > 1) {
            let sortedParticipants = sortParticipantList();
            let initialHeap = buildHeap(sortedParticipants);
            setHeap(initialHeap);
            setIsTournamentStarted(true);
            setIsTournamentOver(false);

            setHeapHistory([initialHeap]);

            toast.success("Le tournoi a commencé !");
        } else {
            toast.error("Impossible de lancer avec moins de 2 participants.");
        }
    };

    const onWin = (heapIndex, adrPere) => {
        const newHeap = [...heap];
        newHeap[adrPere] = newHeap[heapIndex];

        setHeapHistory((prevHistory) => [...prevHistory, newHeap]);
        setHeap(newHeap);
    };

    const undoAction = () => {
        if (heapHistory.length > 1) {
            setHeapHistory((prevHistory) => {
                const newHistory = prevHistory.slice(0, -1);
                setHeap(newHistory[newHistory.length - 1]);
                return newHistory;
            });
        } else {
            toast.info("Aucune action à annuler.");
        }
    };

    useEffect(() => {
        if (heap.length > 0 && heap[0] !== EMPTY && heap[0] !== EXEMPT) {
            setIsTournamentOver(true);
        }
    }, [heap]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <h1>Tournament Bracket</h1>

                {!isTournamentStarted && (
                    <div>
                        <input
                            type="text"
                            value={currentParticipantName}
                            onChange={(e) => setCurrentParticipantName(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && increaseParticipantCount()}
                            placeholder="Entrez le nom de l'équipe"
                        />

                        <button onClick={increaseParticipantCount} disabled={isAnimating}>
                            Ajouter un participant
                        </button>

                        <button onClick={randomizeParticipants} disabled={isAnimating}>
                            Randomiser l&apos;ordre des participants
                        </button>

                        <button onClick={deleteAllParticipants} disabled={isAnimating}>
                            Supprimer tous les participants
                        </button>

                        <h2>Liste des participants</h2>
                        <AnimatePresence>
                            <motion.ul layout>
                                {participantNames.map((name, index) => (
                                    <ParticipantItem
                                        key={name}
                                        index={index}
                                        name={name}
                                        moveParticipant={moveParticipant}
                                        deleteParticipant={deleteParticipant}
                                    />
                                ))}
                            </motion.ul>
                        </AnimatePresence>

                        <button onClick={startTournament} disabled={isAnimating}>Démarrer le tournoi</button>
                    </div>
                )}

                {isTournamentStarted && (
                    <>
                        <div>
                            <ColumnGenerator
                                heap={heap}
                                participantNames={participantNames}
                                restartTournament={restartTournament}
                                resetTournament={resetTournament}
                                cancelTournament={cancelTournament}
                                onWin={onWin}
                            />
                        </div>

                        {isTournamentStarted && !isTournamentOver && (
                            <button onClick={undoAction}>Annuler la dernière action</button>
                        )}
                    </>
                )}

                <ToastContainer/>
            </div>
        </DndProvider>
    );
};

export default Tournament;
