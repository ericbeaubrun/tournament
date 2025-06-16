import {EXEMPT, EMPTY} from "../config/config.js";

export function calculateHight(heap) {
    return Math.floor(Math.log2(heap.length));
}

export function calculateLeafSize(heap) {
    return Math.pow(2, calculateHight(heap));
}

export function calculateNextPower2(heap) {
    return Math.pow(2, Math.ceil(Math.log2(calculateLeafSize(heap))));
}

//TODO
export function calculate_amount_of_exempts(tree) {
    return calculateNextPower2() - tree.length;
}

export function findConfrontableAdresses(heap, index = 0) {
    if (index >= heap.length) return [];

    const leftIndex = 2 * index + 1;
    const rightIndex = 2 * index + 2;

    const result = [];

    if (heap[index] === EMPTY) {
        if (leftIndex < heap.length && heap[leftIndex] !== EXEMPT && heap[leftIndex] !== EMPTY
            && rightIndex < heap.length && heap[rightIndex] !== EXEMPT && heap[rightIndex] !== EMPTY) {
            result.push(leftIndex);
            result.push(rightIndex);
        }

    }

    return result.concat(findConfrontableAdresses(heap, leftIndex), findConfrontableAdresses(heap, rightIndex));
}


export function collectPredecessorsTmp(heap, index) {
    if (index >= heap.length) return [];

    const descendants = [];

    const left = 2 * index + 1;
    const right = 2 * index + 2;

    return descendants.concat(collectPredecessorsRec(heap, left)).concat(collectPredecessorsRec(heap, right));
}

export function collectPredecessorsRec(heap, index) {
    if (index >= heap.length) return [];

    const predecessors = [index];

    const left = 2 * index + 1;
    const right = 2 * index + 2;

    return predecessors.concat(collectPredecessorsRec(heap, left)).concat(collectPredecessorsRec(heap, right));
}

export function collectAllPredecessors(heap, addresses) {
    const results = {};
    addresses.forEach(index => {
        results[index] = collectPredecessorsTmp(heap, index);
    });
    return results;
}

export function collectEmptyNodes(heap, index = 0) {
    if (index >= heap.length || heap[index] !== EMPTY) return [];

    const emptyNodes = [index];

    const left = 2 * index + 1;
    const right = 2 * index + 2;

    return emptyNodes
        .concat(collectEmptyNodes(heap, left))
        .concat(collectEmptyNodes(heap, right));
}

export function collectNodesWithEmptyNear(heap) {
    const results = [];

    for (let i = 0; i < heap.length; i++) {
        if (heap[i] !== EMPTY) {
            const parent = Math.floor((i - 1) / 2);
            const left = 2 * parent + 1;
            const right = 2 * parent + 2;

            if ((i === left && right < heap.length && heap[right] === EMPTY) ||
                (i === right && heap[left] === EMPTY)) {
                results.push(i);
            }
        }
    }

    return results;
}

export const buildHeap = (list) => {
    const length = list.length;
    const heap = Array(2 * length - 1).fill(EMPTY);

    for (let i = 0; i < length; i++) {
        heap[length - 1 + i] = list[i];
    }

    for (let i = length - 2; i >= 0; i--) {
        const left = heap[2 * i + 1];
        const right = heap[2 * i + 2];

        if (left !== EXEMPT && right !== EXEMPT) {
            heap[i] = EMPTY;
        } else if (left === EXEMPT) {
            heap[i] = right;
        } else if (right === EXEMPT) {
            heap[i] = left;
        }
    }

    return heap;
};

export const sortParticipantList = (lineCount) => {
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

    return tmpParticipants;
}



