import "./App.scss";
import './Tournament.scss';
import 'react-toastify/dist/ReactToastify.css';
import ColumnGenerator from "./ColumnGenerator.jsx";
import {useState, useEffect} from "react";
import {EXEMPT, EMPTY, PARTICIPANTS_ANIMATION_DURATION} from "./config.js";
import {ToastContainer, toast} from 'react-toastify';
import ButtonsContainer from "./ButtonsContainer.jsx";
import StartButton from "./StartButton.jsx";
import ParticipantList from "./ParticipantList.jsx";
import {buildHeap, sortParticipantList} from './BracketUtils.js';

const Tournament = () => {
    const [lineCount, setLineCount] = useState(0); // Puissance de 2
    const [heap, setHeap] = useState([]);
    const [heapHistory, setHeapHistory] = useState([]);
    const [currentParticipantName, setCurrentParticipantName] = useState("");
    const [participantNames, setParticipantNames] = useState([]);
    const [isTournamentStarted, setIsTournamentStarted] = useState(false);
    const [isTournamentOver, setIsTournamentOver] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [, setParticipants] = useState([]);

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
            setIsAnimating(true);
            setTimeout(() => {
                setIsAnimating(false);
            }, PARTICIPANTS_ANIMATION_DURATION);

            setParticipantNames((prevNames) => {
                const shuffledNames = shuffleArray(prevNames);
                return shuffledNames;
            });

            toast.success("L'ordre des participants a été randomisé.");
        } else {
            toast.error("Ajoutez au moins deux participants pour randomiser l'ordre.");
        }
    };

    const increaseParticipantCount = () => {
        if (currentParticipantName === "") {
            toast.error("Le nom du participant ne peut pas être vide.");
        } else if (participantNames.includes(currentParticipantName)) {
            toast.error("Ce participant existe déjà dans le tournoi.");
        } else {
            setLineCount((prevLineCount) => {
                const nextLineCount = prevLineCount + 1;
                const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(nextLineCount)));
                return nextLineCount <= nextPowerOf2 ? nextLineCount : prevLineCount;
            });

            setParticipantNames((prevNames) => [...prevNames, currentParticipantName]);
            toast.success(`Participant "${currentParticipantName}" ajouté avec succès.`);
            setCurrentParticipantName("");
        }
    };

    const deleteParticipant = (index) => {
        setParticipantNames((prevNames) => {
            const updatedNames = [...prevNames];
            const removedName = updatedNames.splice(index, 1)[0];
            toast.info(`Participant "${removedName}" supprimé.`);
            return updatedNames;
        });
        setLineCount((prevCount) => prevCount - 1);
    };

    const renameParticipant = (index, newName) => {
        setParticipantNames((prevNames) => {
            if (prevNames.includes(newName)) {
                toast.error(`Le nom "${newName}" existe déjà.`);
                return prevNames;
            }

            const updatedNames = [...prevNames];
            const oldName = updatedNames[index];
            updatedNames[index] = newName;

            toast.success(`Participant "${oldName}" a été renommé en "${newName}".`);
            return updatedNames;
        });
    };


    const moveParticipant = (fromIndex, toIndex) => {
        setParticipantNames((prevNames) => {
            const updatedNames = [...prevNames];
            const [movedItem] = updatedNames.splice(fromIndex, 1);
            updatedNames.splice(toIndex, 0, movedItem);
            return updatedNames;
        });
    };

    const deleteAllParticipants = () => {
        setParticipantNames([]);
        setLineCount(0);
        toast.info("Tous les participants ont été supprimés.");
    };

    const cancelTournament = () => {
        setIsTournamentStarted(false);
        setIsTournamentOver(false)
        toast.info("Le tournoi a été annulé.");
    };

    const resetTournament = () => {
        setIsTournamentStarted(false);
        setParticipants([]);
        setParticipantNames([]);
        setLineCount(0);
        setIsTournamentOver(false);
        toast.info("Le tournoi a été réinitialisé.");
    };

    const restartTournament = () => {
        setParticipants([]);
        setIsTournamentOver(false);
        startTournament();
    };

    const startTournament = () => {
        if (lineCount > 1) {
            let sortedParticipants = sortParticipantList(lineCount);
            setParticipants(sortedParticipants);

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
        <>
            {!isTournamentStarted && (
                <div className="tournament-container">
                    <div className="init-tournament-container">
                        <ButtonsContainer
                            participantNames={participantNames}
                            onClick={randomizeParticipants}
                            disabled={isAnimating}
                            onClick1={deleteAllParticipants}
                        />

                        <div className="participants-container">

                            <ParticipantList
                                participantNames={participantNames}
                                moveParticipant={moveParticipant}
                                deleteParticipant={deleteParticipant}
                                renameParticipant={renameParticipant}
                            />

                            <div className="add-participant-container">
                                <input
                                    type="text"
                                    value={currentParticipantName}
                                    onChange={(e) => setCurrentParticipantName(e.target.value)}
                                    onKeyUp={(e) => {
                                        return e.key === 'Enter' && increaseParticipantCount();
                                    }}
                                    placeholder="Entrez le nom de l'équipe"
                                />
                                <button className="add-participant-btn" onClick={increaseParticipantCount}
                                        disabled={isAnimating}> +
                                </button>
                            </div>
                        </div>
                    </div>

                    <StartButton startTournament={startTournament} isAnimating={isAnimating}/>
                </div>
            )}

            {isTournamentStarted && (
                <div>
                    <ColumnGenerator
                        heap={heap}
                        participantNames={participantNames}
                        restartTournament={restartTournament}
                        resetTournament={resetTournament}
                        cancelTournament={cancelTournament}
                        onWin={onWin}
                    />

                    {!isTournamentOver && (
                        <button className="button" onClick={undoAction}>
                            Annuler la dernière action
                        </button>
                    )}
                </div>
            )}

            <ToastContainer
                position="bottom-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </>
    );
};

export default Tournament;
