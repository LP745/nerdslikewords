// List of possible words
const words = [
  "javascript", "puzzle", "scramble", "program", "developer",
  "browser", "function", "variable", "element", "random",
  "keyboard", "monitor", "laptop", "internet", "syntax"
];

let currentWord = "";
let scrambledWord = "";
let guessedCorrectly = false; // new flag
let wordSolved = false; // true if current word guessed correctly

// Streak system
let currentStreak = 0;
let bestStreak = localStorage.getItem("bestStreak") 
                 ? parseInt(localStorage.getItem("bestStreak")) 
                 : 0;

document.getElementById("bestStreak").textContent = bestStreak;

// Shuffle letters
function scramble(word) {
  return word.split("").sort(() => 0.5 - Math.random()).join("");
}

// Pick a new word
function newWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  scrambledWord = scramble(currentWord);

  while (scrambledWord === currentWord) {
    scrambledWord = scramble(currentWord);
  }

  document.getElementById("scrambled").textContent = scrambledWord;
  document.getElementById("result").textContent = "";
  document.getElementById("guessInput").value = "";
  
  guessedCorrectly = false; // reset
}

// Submit guess
function checkGuess() {
  const guess = document.getElementById("guessInput").value.toLowerCase();
  const result = document.getElementById("result");

  if (!guess) return;

  if (guess === currentWord) {
    if (!guessedCorrectly) { // only count once
      guessedCorrectly = true; // mark this word as guessed
      currentStreak++;
      document.getElementById("currentStreak").textContent = currentStreak;

      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        localStorage.setItem("bestStreak", bestStreak);
        document.getElementById("bestStreak").textContent = bestStreak;
      }
    }

    shootConfetti(); // confetti fountain
    result.textContent = "Correct! 🎉";
    result.style.color = "green";

    result.classList.remove("incorrect-anim");
    void result.offsetWidth;
    result.classList.add("correct-anim");

  } else {
    result.textContent = `Incorrect! The word was "${currentWord}". Streak reset.`;
    result.style.color = "red";

    result.classList.remove("correct-anim");
    void result.offsetWidth;
    result.classList.add("incorrect-anim");

    currentStreak = 0;
    document.getElementById("currentStreak").textContent = currentStreak;
  }
}

// Confetti fountain effect
function shootConfetti() {
  const container = document.getElementById("confetti-container");
  const colors = ["#f94144","#f3722c","#f9c74f","#90be6d","#43aa8b","#577590","#f72585"];

  const wordElement = document.getElementById("scrambled");
  const wordRect = wordElement.getBoundingClientRect();
  const wordX = wordRect.left + wordRect.width / 2;
  const wordY = wordRect.top + wordRect.height / 2 + window.scrollY;

  const gameContainer = document.querySelector(".game-container");
  const containerRect = gameContainer.getBoundingClientRect();

  for (let i = 0; i < 60; i++) { // more particles
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    const size = 5 + Math.random() * 5;
    confetti.style.width = confetti.style.height = size + "px";
    confetti.style.left = wordX + "px";
    confetti.style.top = wordY + "px";

    container.appendChild(confetti);

    // Random target point anywhere in the game container
    const targetX = containerRect.left + Math.random() * containerRect.width;
    const targetY = containerRect.top + Math.random() * containerRect.height + window.scrollY;

    // Calculate delta movement
    const dx = targetX - wordX;
    const dy = targetY - wordY;
    const rotate = Math.random() * 360;

    confetti.animate([
      { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`, opacity: 0 }
    ], {
      duration: 1200 + Math.random() * 400,
      easing: 'ease-out'
    });

    setTimeout(() => container.removeChild(confetti), 1500);
  }
}

// Button listeners
document.getElementById("submitBtn").addEventListener("click", checkGuess);
document.getElementById("newWordBtn").addEventListener("click", newWord);
document.getElementById("guessInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    checkGuess();
  }
});


// Start game immediately
newWord();
