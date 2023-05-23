const board = [
    ['m', 'y', 'r', 'i'],
    ['t', 'p', 'h', 'o'],
    ['a', 'b', 'e', 'a'],
    ['e', 'u', 'd', 'n']
];
const min_word_length = 5; 
const max_word_length = 7;
let letters = [];
let past_coords = {};
let combinations = 0;

function addBranch(x, y) {
    //push cur letter
    letters.push(board[y][x]);
    //if word long enough, check if valid word then console.log it
    if (letters.length >= min_word_length) {
        const word = letters.join('');
        // console.log(word)
        // console.log(letters)
        // if (words[word] === true) console.log(word);
        combinations++;
    }
    //if word is too long return now. and pop the cur letter
    if (letters.length >= max_word_length) return letters.pop();
    //add the x, y to the past coordinates
    past_coords[`${x}_${y}`] = true;
    //starting up
    //try
    //look for adjusted x and y not being undefined
    //check this new x adn y against past ones, if not inside add a new branch
    //X8
    try {
        if (board[y - 1][x] != undefined) {
            if (past_coords[`${x}_${y - 1}`] === undefined) addBranch(x, y - 1);
        }
    } catch {
        
    }
    try {
        if (board[y - 1][x + 1] != undefined) {
            if (past_coords[`${x + 1}_${y - 1}`] === undefined) addBranch(x + 1, y - 1);
        }
    } catch {

    }
    try {
        if (board[y][x + 1] != undefined) {
            if (past_coords[`${x + 1}_${y}`] === undefined) addBranch(x + 1, y);
        }
    } catch {

    }
    try {
        if (board[y + 1][x + 1] != undefined) {
            if (past_coords[`${x + 1}_${y + 1}`] === undefined) addBranch(x + 1, y + 1);
        }
    } catch {

    }
    try {
        if (board[y + 1][x] != undefined) {
            if (past_coords[`${x}_${y + 1}`] === undefined) addBranch(x, y + 1);
        }
    } catch {

    }
    try {
        if (board[y + 1][x - 1] != undefined) {
            if (past_coords[`${x - 1}_${y + 1}`] === undefined) addBranch(x - 1, y + 1);
        }
    } catch {

    }
    try {
        if (board[y][x - 1] != undefined) {
            if (past_coords[`${x - 1}_${y}`] === undefined) addBranch(x - 1, y);
        }
    } catch {

    }
    try {
        if (board[y - 1][x - 1] != undefined) {
            if (past_coords[`${x - 1}_${y - 1}`] === undefined) addBranch(x - 1, y - 1);
        }
    } catch {

    }
    //pop the letter
    letters.pop();
    //dekete the past coord
    delete past_coords[`${x}_${y}`];
}

for (let y = 0; y < board.length; y++) {
    row = board[y];
    for (let x = 0; x < row.length; x++) {
        addBranch(x, y);
    }
}

console.log('Done: ', combinations);