import { wordList } from './createwords';

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');

const ROWS = 6;
const COLS = 5;
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let usedWords = []; // Array to store used words
let solutionWord = getTodaysWord();

// Create game board
function createBoard() {
    for (let r = 0; r < ROWS; r++) {
        const row = document.createElement('div');
        row.className = 'game-row';
        for (let c = 0; c < COLS; c++) {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.id = `${r}-${c}`;
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
}

// Create keyboard
function createKeyboard() {
    const keys1 = 'QWERTYUIOP'.split('');
    const keys2 = 'ASDFGHJKL'.split('');
    const keys3 = ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'];

    createKeyboardRow(keys1);
    createKeyboardRow(keys2);
    createKeyboardRow(keys3);

    document.querySelector('.keyboard-key[data-key="Enter"]').classList.add('lightgreen');
    document.querySelector('.keyboard-key[data-key="Backspace"]').classList.add('lightred');
}

function createKeyboardRow(keys) {
    const keyboardRow = document.createElement('div');
    keyboardRow.className = 'keyboard-row';
    keys.forEach(key => {
        const keyElement = document.createElement('button');
        keyElement.textContent = key;
        keyElement.className = 'keyboard-key';
        keyElement.setAttribute('data-key', key);
        keyElement.addEventListener('click', handleKeyPress);
        keyboardRow.appendChild(keyElement);
    });
    keyboard.appendChild(keyboardRow);
}

function handleKeyPress(event) {
    if (gameOver) return;

    const key = event.target.dataset.key;

    if (key === 'Backspace') {
        deleteLetter();
    } else if (key === 'Enter') {
        if (currentCol === COLS) {
            checkGuess();
        }
    } else if (currentCol < COLS) {
        const tile = document.getElementById(`${currentRow}-${currentCol}`);
        tile.textContent = key;
        currentCol++;
    }
}

function deleteLetter() {
    if (currentCol > 0) {
        currentCol--;
        const tile = document.getElementById(`${currentRow}-${currentCol}`);
        tile.textContent = '';
    }
}

function checkGuess() {
    const guess = getCurrentGuess().toUpperCase(); // Ensure the guess is uppercase
    const solutionArray = solutionWord.split(''); // No need to convert again'');
    const guessArray = guess.split('');

    const checkArray = Array(COLS).fill('gray');

    // Check for green (correct letter and position)
    for (let i = 0; i < COLS; i++) {
        if (guessArray[i] === solutionArray[i]) {
            checkArray[i] = 'green';
            solutionArray[i] = null; // Mark the letter as used
        }
    }

    // Check for yellow (correct letter, wrong position)
    for (let i = 0; i < COLS; i++) {
        if (checkArray[i] === 'gray' && solutionArray.includes(guessArray[i])) {
            checkArray[i] = 'yellow';
            solutionArray[solutionArray.indexOf(guessArray[i])] = null; // Mark the letter as used
        }
    }

    updateTiles(checkArray);
    currentRow++;
    currentCol = 0;

    if (guess === solutionWord) {
        gameOver = true;
        showModal('You won!');
    } else if (currentRow === ROWS) {
        gameOver = true;
        showModal(`You lost! The word was ${solutionWord}`);
    }
}

function showModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <button id="modal-close">Close</button>
    </div>
  `;
    document.body.appendChild(modal);

    // Make the modal visible
    modal.style.display = 'block';
    modal.style.alignItems = 'center';

    const closeButton = document.getElementById('modal-close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function getCurrentGuess() {
    let word = '';
    for (let c = 0; c < COLS; c++) {
        const tile = document.getElementById(`${currentRow}-${c}`);
        word += tile.textContent;
    }
    return word;
}

function updateTiles(checkArray) {
    for (let c = 0; c < COLS; c++) {
        const tile = document.getElementById(`${currentRow}-${c}`);
        const letter = tile.textContent;
        const color = checkArray[c];

        tile.classList.add(color);

        // Update keyboard key color
        const keyElement = document.querySelector(`.keyboard-key[data-key="${letter.toUpperCase()}"]`);
        if (keyElement) {
            // Only update if the new color has higher priority OR if it's gray
            if (
                (color === 'green' && !keyElement.classList.contains('green')) ||
                (color === 'yellow' && !keyElement.classList.contains('green') && !keyElement.classList.contains('yellow')) ||
                color === 'gray'
            ) {
                keyElement.classList.remove('green', 'yellow', 'gray');
                keyElement.classList.add(color);
            }
        }
    }
}

const newGameButton = document.getElementById('new-game');
newGameButton.addEventListener('click', startNewGame);

function getTodaysWord() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    let word;
    do {
        word = wordList[dayOfYear % wordList.length]; // Use day of the year to select a word
    } while (usedWords.includes(word)); // Ensure the word hasn't been used before

    usedWords.push(word); // Add the word to the usedWords array
    localStorage.setItem('usedWords', JSON.stringify(usedWords)); // Store used words in localStorage

    return word.toUpperCase();
}


function startNewGame() {
    currentRow = 0;
    currentCol = 0;
    gameOver = false;

    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        solutionWord = getTodaysWord();
    }

    const tiles = document.querySelectorAll('.letter-tile');
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.classList.remove('green', 'yellow', 'gray');
    });

    const keys = document.querySelectorAll('.keyboard-key');
    keys.forEach(key => {
        key.classList.remove('green', 'yellow', 'gray');
    });
}

function loadUsedWords() {
    const storedWords = localStorage.getItem('usedWords');
    if (storedWords) {
        usedWords = JSON.parse(storedWords);
    }
}

createBoard();
createKeyboard();
loadUsedWords();
