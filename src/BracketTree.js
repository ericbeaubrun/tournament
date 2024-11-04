import {EXEMPT, EMPTY} from "./config.js";

export function calculate_height(tree) {
    return Math.floor(Math.log2(tree.length));
}

export function calculate_leaf_size(tree) {
    return Math.pow(2, calculate_height(tree));
}

export function calculate_next_power_of_2(tree) {
    return Math.pow(2, Math.ceil(Math.log2(calculate_leaf_size(tree))));
}

export function calculate_number_of_exempts(tree) {
    return calculate_next_power_of_2() - tree.length;
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


export function collecterDescendantsTmp(heap, index) {
    if (index >= heap.length) return [];

    const descendants = [];

    const filsGauche = 2 * index + 1;
    const filsDroit = 2 * index + 2;

    return descendants
        .concat(collecterDescendantsRec(heap, filsGauche))
        .concat(collecterDescendantsRec(heap, filsDroit));
}

export function collecterDescendantsRec(heap, index) {
    if (index >= heap.length) return [];

    const descendants = [index];

    const filsGauche = 2 * index + 1;
    const filsDroit = 2 * index + 2;

    return descendants
        .concat(collecterDescendantsRec(heap, filsGauche))
        .concat(collecterDescendantsRec(heap, filsDroit));
}

export function collecterTousLesDescendants(heap, adresses) {
    const resultats = {};
    adresses.forEach(index => {
        resultats[index] = collecterDescendantsTmp(heap, index);
    });
    return resultats;
}

export function collecterNoeudsEmpty(heap, index = 0) {
    if (index >= heap.length || heap[index] !== EMPTY) return [];

    const noeudsEmpty = [index];

    const filsGauche = 2 * index + 1;
    const filsDroit = 2 * index + 2;

    return noeudsEmpty
        .concat(collecterNoeudsEmpty(heap, filsGauche))
        .concat(collecterNoeudsEmpty(heap, filsDroit));
}

export function collecterNoeudsAvecFrereEmpty(heap) {
    const noeudsAvecFrereEmpty = [];

    for (let i = 0; i < heap.length; i++) {
        if (heap[i] !== EMPTY) {
            const parent = Math.floor((i - 1) / 2);
            const filsGauche = 2 * parent + 1;
            const filsDroit = 2 * parent + 2;

            if ((i === filsGauche && filsDroit < heap.length && heap[filsDroit] === EMPTY) ||
                (i === filsDroit && heap[filsGauche] === EMPTY)) {
                noeudsAvecFrereEmpty.push(i);
            }
        }
    }

    return noeudsAvecFrereEmpty;
}


