// List of possible words
const words = [
  "javascript", "puzzle", "scramble", "program", "developer",
  "browser", "function", "variable", "element", "random",
  "keyboard", "monitor", "laptop", "internet", "syntax",
  "algorithm", "database", "network", "protocol", "compiler",
  "recursion", "iteration", "debugging", "testing", "framework"
];

let currentWord = "";
let scrambledWord = "";
let guessedCorrectly = false; // new flag

// Streak system
let currentStreak = 0;
let bestStreak = localStorage.getItem("bestStreak") 
                 ? parseInt(localStorage.getItem("bestStreak")) 
                 : 0;

document.getElementById("bestStreak").textContent = bestStreak;

// Timer mode variables
let gameMode = "classic"; // "classic" or "timer"
let timerInterval = null;
let timeRemaining = 120; // 2 minutes
let wordsSolved = 0;
let gameActive = false;

// Shuffle letters using Fisher-Yates algorithm
function scramble(word) {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join("");
}

// Pick a new word
function newWord(resetStreak = false) {
  if (resetStreak) {
    currentStreak = 0;
    document.getElementById("currentStreak").textContent = currentStreak;
  }
  
  currentWord = words[Math.floor(Math.random() * words.length)];
  scrambledWord = scramble(currentWord);

  while (scrambledWord === currentWord) {
    scrambledWord = scramble(currentWord);
  }

  document.getElementById("scrambled").textContent = scrambledWord;
  document.getElementById("result").textContent = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("guessInput").focus();
  
  guessedCorrectly = false; // reset
}

// Start timer mode
function startTimerMode() {
  gameMode = "timer";
  gameActive = true;
  timeRemaining = 120;
  wordsSolved = 0;
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("timerDisplay").classList.remove("hidden");
  document.getElementById("timer").textContent = "2:00";
  document.getElementById("wordCount").textContent = "0";
  document.getElementById("guessInput").disabled = false;
  document.getElementById("submitBtn").disabled = false;
  document.getElementById("newWordBtn").disabled = false;
  
  newWord();
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById("timer").textContent = 
      `${minutes}:${seconds.toString().padStart(2, "0")}`;
    
    if (timeRemaining <= 0) {
      endTimerMode();
    }
  }, 1000);
}

// End timer mode
function endTimerMode() {
  if (gameMode !== "timer") return; // Don't end if we're no longer in timer mode
  
  gameActive = false;
  clearInterval(timerInterval);
  document.getElementById("guessInput").disabled = true;
  document.getElementById("submitBtn").disabled = true;
  document.getElementById("newWordBtn").disabled = true;
  document.getElementById("timerDisplay").classList.add("hidden");
  
  document.getElementById("finalScore").textContent = wordsSolved;
  document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Resume classic mode
function resumeClassicMode() {
  gameMode = "classic";
  gameActive = false;
  clearInterval(timerInterval);
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("timerDisplay").classList.add("hidden");
  document.getElementById("guessInput").disabled = false;
  document.getElementById("submitBtn").disabled = false;
  document.getElementById("newWordBtn").disabled = false;
  
  newWord();
}

// Submit guess
function checkGuess() {
  const guess = document.getElementById("guessInput").value.toLowerCase();
  const result = document.getElementById("result");

  if (!guess) return;

  if (guess === currentWord) {
    if (!guessedCorrectly) { // only count once
      guessedCorrectly = true; // mark this word as guessed
      
      if (gameMode === "timer") {
        wordsSolved++;
        document.getElementById("wordCount").textContent = wordsSolved;
      } else {
        currentStreak++;
        document.getElementById("currentStreak").textContent = currentStreak;

        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
          localStorage.setItem("bestStreak", bestStreak);
          document.getElementById("bestStreak").textContent = bestStreak;
        }
      }
    }

    shootConfetti(); // confetti fountain
    result.textContent = "Correct! 🎉";
    result.style.color = "green";

    result.classList.remove("incorrect-anim");
    void result.offsetWidth;
    result.classList.add("correct-anim");
    
    // Auto-load new word after 1.5 seconds
    setTimeout(() => {
      if (gameMode === "timer" && !gameActive) return; // Don't auto-advance if timer ended
      newWord();
    }, 1500);

  } else {
    result.textContent = `Incorrect! The word was "${currentWord}".`;
    result.style.color = "red";

    result.classList.remove("correct-anim");
    void result.offsetWidth;
    result.classList.add("incorrect-anim");

    if (gameMode === "classic") {
      result.textContent += " Streak reset.";
      currentStreak = 0;
      document.getElementById("currentStreak").textContent = currentStreak;
    }
    
    // Auto-load new word after 1.5 seconds
    setTimeout(() => {
      if (gameMode === "timer" && !gameActive) return; // Don't auto-advance if timer ended
      newWord();
    }, 1500);
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
document.getElementById("newWordBtn").addEventListener("click", () => newWord(true));
document.getElementById("guessInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    checkGuess();
  }
});

// Mode selector buttons
document.getElementById("classicModeBtn").addEventListener("click", () => {
  gameMode = "classic";
  document.getElementById("classicModeBtn").classList.add("active");
  document.getElementById("timerModeBtn").classList.remove("active");
  resumeClassicMode();
});

document.getElementById("timerModeBtn").addEventListener("click", () => {
  document.getElementById("classicModeBtn").classList.remove("active");
  document.getElementById("timerModeBtn").classList.add("active");
  startTimerMode();
});

document.getElementById("playAgainBtn").addEventListener("click", () => {
  startTimerMode();
});

// Start game immediately
newWord();
