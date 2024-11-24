import {EXEMPT, EMPTY} from "./config.js";

export function calculateHight(heap) {
    return Math.floor(Math.log2(heap.length));
}

export function calculateLeafSize(heap) {
    return Math.pow(2, calculateHight(heap));
}

export function calculateNextPower2(heap) {
    return Math.pow(2, Math.ceil(Math.log2(calculateLeafSize(heap))));
}

export function calculate_number_of_exempts(tree) {
    return calculateNextPower2() - tree.length;
}

export function findConfrontableAdresses(heap, index = 0) {
    if (index >= heap.length) return [];

    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;

    const result = [];

    if (heap[index] === EMPTY) {
        if (leftChildIndex < heap.length && heap[leftChildIndex] !== EXEMPT && heap[leftChildIndex] !== EMPTY
            && rightChildIndex < heap.length && heap[rightChildIndex] !== EXEMPT && heap[rightChildIndex] !== EMPTY) {
            result.push(leftChildIndex);
            result.push(rightChildIndex);
        }

    }

    const leftResult = findConfrontableAdresses(heap, leftChildIndex);
    const rightResult = findConfrontableAdresses(heap, rightChildIndex);

    return result.concat(leftResult, rightResult);
}


export function collectPredecessorsTmp(heap, index) {
    if (index >= heap.length) return [];

    const descendants = [];

    const left = 2 * index + 1;
    const right = 2 * index + 2;

    return descendants
        .concat(collectPredecessorsRec(heap, left))
        .concat(collectPredecessorsRec(heap, right));
}

export function collectPredecessorsRec(heap, index) {
    if (index >= heap.length) return [];

    const predecessors = [index];

    const left = 2 * index + 1;
    const right = 2 * index + 2;

    return predecessors
        .concat(collectPredecessorsRec(heap, left))
        .concat(collectPredecessorsRec(heap, right));
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
        const leftChild = heap[2 * i + 1];
        const rightChild = heap[2 * i + 2];

        if (leftChild !== EXEMPT && rightChild !== EXEMPT) {
            heap[i] = EMPTY;
        } else if (leftChild === EXEMPT) {
            heap[i] = rightChild;
        } else if (rightChild === EXEMPT) {
            heap[i] = leftChild;
        }
    }

    return heap;
};

export const sortParticipantList = (lineCount)  => {
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



