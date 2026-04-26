const questionNumberDiv = document.getElementById("question-number");
const sequenceDiv = document.getElementById("sequence");
const feedbackDiv = document.getElementById("feedback");
const scoreDiv = document.getElementById("score");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const skipCountSelect = document.getElementById("skip-count-select");

const TOTAL_QUESTIONS = 15;
let selectedSkipCount = 3;
let currentQuestion = 0;
let score = 0;
let currentAnswer = null;
let currentSequence = [];
let missingIndex = 0;

function setupSkipCountOptions() {
    for (let count = 1; count <= 12; count++) {
        const option = document.createElement("option");
        option.value = String(count);
        option.textContent = `Count by ${count}`;
        skipCountSelect.appendChild(option);
    }
    skipCountSelect.value = String(selectedSkipCount);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
    const startMultiplier = randomInt(1, 20);
    const start = startMultiplier * selectedSkipCount;
    currentSequence = [];

    for (let i = 0; i < 5; i++) {
        currentSequence.push(start + i * selectedSkipCount);
    }

    missingIndex = randomInt(1, 3);
    currentAnswer = currentSequence[missingIndex];
}

function sequenceText() {
    return currentSequence
        .map((value, index) => (index === missingIndex ? "_" : String(value)))
        .join(", ");
}

function showQuestion() {
    feedbackDiv.textContent = "";
    feedbackDiv.style.color = "#2d3436";
    answerInput.value = "";
    answerInput.disabled = false;
    submitBtn.disabled = false;
    nextBtn.style.display = "none";
    restartBtn.style.display = "none";

    generateQuestion();
    questionNumberDiv.textContent = `Question ${currentQuestion + 1} of ${TOTAL_QUESTIONS}`;
    sequenceDiv.textContent = sequenceText();
    scoreDiv.textContent = `Score: ${score} / ${TOTAL_QUESTIONS}`;
    answerInput.focus();
}

function lockQuestion() {
    answerInput.disabled = true;
    submitBtn.disabled = true;
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
        nextBtn.style.display = "inline-block";
    } else {
        restartBtn.style.display = "inline-block";
    }
}

function checkAnswer() {
    const userAnswer = Number(answerInput.value);
    if (!Number.isFinite(userAnswer) || answerInput.value.trim() === "") {
        feedbackDiv.textContent = "Please enter a number.";
        feedbackDiv.style.color = "#e17055";
        return;
    }

    if (userAnswer === currentAnswer) {
        score++;
        feedbackDiv.textContent = "✅ Correct!";
        feedbackDiv.style.color = "#00b894";
    } else {
        feedbackDiv.textContent = `❌ Not quite. The answer is ${currentAnswer}.`;
        feedbackDiv.style.color = "#d63031";
    }

    scoreDiv.textContent = `Score: ${score} / ${TOTAL_QUESTIONS}`;
    lockQuestion();
}

function startGame() {
    currentQuestion = 0;
    score = 0;
    showQuestion();
}

submitBtn.onclick = checkAnswer;
answerInput.onkeypress = (event) => {
    if (event.key === "Enter") {
        checkAnswer();
    }
};

nextBtn.onclick = () => {
    currentQuestion++;
    showQuestion();
};

restartBtn.onclick = startGame;

openSidebarBtn.onclick = () => {
    sidebar.classList.add("open");
    sidebar.classList.remove("closed");
};

closeSidebarBtn.onclick = () => {
    sidebar.classList.remove("open");
    sidebar.classList.add("closed");
};

skipCountSelect.onchange = () => {
    selectedSkipCount = Number(skipCountSelect.value);
    startGame();
};

setupSkipCountOptions();
startGame();
