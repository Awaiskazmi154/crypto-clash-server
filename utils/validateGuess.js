 function getValidationArray(guess , target) {
    const length = target.length;
    const output = Array.from({ length: length }, (v) => '-');

    for (let i = 0; i < length; i++) {
        if (guess[i] === target[i]) {
            // output[i] = 'X';
            output[i] = guess[i];
            target = target.replace(guess[i], '-');
        }

        if (target.includes(guess[i]) && output[i] === '-') {
            output[i] = '.';
            target = target.replace(guess[i], '-');
        }
    }
    return output;
}

export default getValidationArray;