import { words } from "./words.js";
import {
    selectWord,
    initBoard,
    insertLetter,
    backspaceLetter,
    successResponse,
    failureResponse,
} from "./Utils.js";

const wordLength = 5;
const numberOfGuesses = 6;
const resizeboard = "zoom"; // "zoom": zoom to almost full width (keep layout); "full": expand to full width;
const resizeKeyboard = "zoom"; // "zoom": zoom to almost full width (keep layout); "full": expand to full width;

const userFeedbackText = document.getElementById("userFeedbackText");
const board = document.getElementById("board");
const keyboard = document.querySelector(".keyboard");

let guessesRemaining = numberOfGuesses;
let currentGuess = [];
let nextLetter = 0;
let wordToBeGuessed = selectWord(words);
let correctlyGuessed = false;
initBoard(wordLength, numberOfGuesses);
switch(resizeboard){
    case "zoom":
        board.classList.add("autoResize");
        break;
    case "full":
        board.classList.add("fullwidth");
        break;
}
switch(resizeKeyboard){
    case "zoom":
        keyboard.classList.add("autoResize");
        break;
    case "full":
        keyboard.classList.add("fullwidth");
        break;
}
onResize();

console.log(wordToBeGuessed);

document.addEventListener("keyup", (e) => {
    if (guessesRemaining == 0 || correctlyGuessed == true) {
        return;
    }
    let pressedKey = String(e.key);
    if (pressedKey == "Enter") {
        checkGuess(wordToBeGuessed);
        return;
    } else if (pressedKey == "Backspace" && nextLetter != 0) {
        backspaceLetter(guessesRemaining, nextLetter, currentGuess, numberOfGuesses);
        minusNextLetter(); //this enables backspaceLetter to be pure for testing purposes
    } else if (pressedKey.match(/[a-z]/gi) && pressedKey.length == 1) {
        insertLetter(pressedKey, guessesRemaining, currentGuess, nextLetter, numberOfGuesses, wordLength);
        addNextLetter(); //this enables insertLetter to be pure, for testing purposes.
    } else {
        return;
    }
});

document.addEventListener("click", (e) => {
    let te = e.target;
    if(! te.matches(".keyboard button.keyboard__key"))
        return;
    let key = te.dataset.key || te.textContent;
    let ev = new KeyboardEvent("keyup", {
        key
    });
    document.dispatchEvent(ev);
});

function addNextLetter() {
    if (nextLetter >= wordLength) {
        return;
    } else {
        nextLetter += 1;
    }
}

function minusNextLetter() {
    nextLetter -= 1;
}

function checkGuess(wordToBeGuessed) {
    let row =
        document.getElementsByClassName("board__letter-row")[
            numberOfGuesses - guessesRemaining
        ];
    let guessString = currentGuess.join("");

    let arrayCorrectWord = Array.from(wordToBeGuessed);

    if (guessString.length != wordLength) {
        return;
    }
    for (let i = 0; i < wordLength; i++) {
        let addClass = "";
        let box = row.children[i];
        let letterPosition = arrayCorrectWord.indexOf(currentGuess[i]);
        if (letterPosition === -1) {
            addClass = "incorrect";
        } else if (currentGuess[i] === arrayCorrectWord[i]) {
            addClass = "correct";
        } else {
            addClass = "exists";
        }
        box.classList.add(addClass);
    }

    if (guessString == wordToBeGuessed) {
        const successText = document.createTextNode(
            successResponse(
                wordToBeGuessed,
                numberOfGuesses - guessesRemaining + 1
            )
        );
        userFeedbackText.appendChild(successText);
        correctlyGuessed = true;
    }
    guessesRemaining = guessesRemaining - 1;
    nextLetter = 0;
    currentGuess = [];
    if (guessesRemaining == 0) {
        const failureText = document.createTextNode(
            failureResponse(wordToBeGuessed)
        );
        userFeedbackText.appendChild(failureText);
    }
}

let resizeTimer;
window.addEventListener("resize", ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
        onResize();
    }, 100);
});

async function onResize(){
    const fw = document.body.clientWidth;
    let fact = 1;
    const bw = board.offsetWidth;
    // board.style.zoom = 1;
    // keyboard.style.zoom = 1;
    // await waitForAniFrame(); // may be more robust if we reset and wait for draw?
    if(board.matches(".autoResize") || bw > fw){
        fact = fw / bw - 0.01;
        board.style.zoom = fact;
    }
    
    if(!keyboard.matches(".autoResize"))
        return;
    const kw = keyboard.offsetWidth;
    fact = fw / kw - 0.1;
    console.log(fw, kw, fact);
    keyboard.style.zoom = fact;
}

function waitForAniFrame(){
    return new Promise((resolve)=>{
        requestAnimationFrame(resolve);
    });
}