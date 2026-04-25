const questionNumberDiv = document.getElementById('question-number');
const scrambledWordDiv = document.getElementById('scrambled-word');
const triesLeftDiv = document.getElementById('tries-left');
const feedbackDiv = document.getElementById('feedback');
const scoreDiv = document.getElementById('score');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const fireworksOverlay = document.getElementById('fireworks-overlay');
const motivationalQuoteDiv = document.getElementById('motivational-quote');
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const difficultySelect = document.getElementById('difficulty-select');

let words = [];
let currentWord = 0;
let score = 0;
let difficultyLevel = 1;
let triesLeft = 5;
let incorrectAttempts = [];

// Word lists for each difficulty level
const wordLists = {
    1: ['cat', 'dog', 'hat', 'run', 'big', 'red', 'hot', 'sun', 'map', 'cup', 'box', 'key', 'pen', 'bag', 'top', 'man', 'boy', 'car', 'bus', 'bed'],
    2: ['calm', 'play', 'book', 'tree', 'blue', 'home', 'work', 'food', 'time', 'love', 'help', 'walk', 'talk', 'read', 'sing', 'dance', 'jump', 'swim', 'draw', 'paint'],
    3: ['house', 'happy', 'world', 'music', 'water', 'beach', 'smile', 'dream', 'peace', 'heart', 'light', 'night', 'morning', 'friend', 'family', 'school', 'teacher', 'student', 'picture', 'garden']
};

const motivationalQuotes = [
    "Great job Zojee! Keep going!",
    "You're a word wizard Zojee!",
    "Awesome work Zojee!",
    "You can do anything Zojee!",
    "Keep up the great effort Zojee!",
    "Brilliant Zojee!",
    "Word master in the making Zojee!",
    "You did it Zojee!",
    "Way to go Zojee!",
    "Keep shining Zojee!",
    "You're a word genius Zojee!",
    "You're on fire Zojee!",
    "You're unstoppable Zojee!",
    "You're a word whiz Zojee!",
    "You're a word wizard Zojee!"
];

const incorrectMotivationalQuotes = [
    "Don't give up, Zojee! Try again! Mama Baba are with you!",
    "Mistakes help us learn, Zojee! Mama Baba believes in you!",
    "Keep practicing, Zojee! You'll get it!",
    "Every mistake is a step to success, Zojee!",
    "Zojee! Keep going!",
    "Mama Baba Believe in you, Zojee!",
    "Its ok to make mistakes Zojee. Mama Baba loves you!"
];

function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function generateWords() {
    words = [...wordLists[difficultyLevel]];
    // Shuffle the word list
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
}

function showWord() {
    feedbackDiv.textContent = '';
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    submitBtn.disabled = false;
    answerInput.disabled = false;
    answerInput.value = '';
    answerInput.focus();
    
    scoreDiv.textContent = `Score: ${score} / ${words.length}`;
    const word = words[currentWord];
    questionNumberDiv.textContent = `Word ${currentWord + 1} of ${words.length}`;
    scrambledWordDiv.textContent = shuffleString(word);
    triesLeft = 5;
    triesLeftDiv.textContent = `Tries left: ${triesLeft}`;
    motivationalQuoteDiv.style.display = 'none';
    incorrectAttempts = [];
    updateIncorrectAttemptsDisplay();
}

function updateIncorrectAttemptsDisplay() {
    // Remove existing incorrect attempts display
    const existingDisplay = document.querySelector('.incorrect-attempts');
    if (existingDisplay) {
        existingDisplay.remove();
    }
    
    if (incorrectAttempts.length > 0) {
        const attemptsDiv = document.createElement('div');
        attemptsDiv.className = 'incorrect-attempts';
        attemptsDiv.style.cssText = `
            margin-top: 16px;
            padding: 12px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            text-align: center;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'Incorrect attempts:';
        title.style.cssText = `
            font-size: 1rem;
            color: #856404;
            margin-bottom: 8px;
            font-weight: 600;
        `;
        attemptsDiv.appendChild(title);
        
        const attemptsList = document.createElement('div');
        attemptsList.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
        `;
        
        incorrectAttempts.forEach(attempt => {
            const attemptSpan = document.createElement('span');
            attemptSpan.textContent = `${attempt} ❌`;
            attemptSpan.style.cssText = `
                background: #f8d7da;
                color: #721c24;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.9rem;
                font-weight: 600;
            `;
            attemptsList.appendChild(attemptSpan);
        });
        
        attemptsDiv.appendChild(attemptsList);
        
        // Insert after the tries-left div
        const triesLeftDiv = document.getElementById('tries-left');
        triesLeftDiv.parentNode.insertBefore(attemptsDiv, triesLeftDiv.nextSibling);
    }
}

function showFireworksAndQuote() {
    fireworksOverlay.style.display = 'flex';
    motivationalQuoteDiv.style.display = 'block';
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    motivationalQuoteDiv.textContent = quote;
    
    fireworksOverlay.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        const angle = (i / 12) * 2 * Math.PI;
        const distance = 120 + Math.random() * 40;
        particle.style.background = `hsl(${Math.floor(Math.random()*360)},90%,60%)`;
        particle.style.position = 'absolute';
        particle.style.width = '18px';
        particle.style.height = '18px';
        particle.style.borderRadius = '50%';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.transform = `translate(-50%, -50%)`;
        particle.style.opacity = '0.9';
        fireworksOverlay.appendChild(particle);
        setTimeout(() => {
            particle.style.transition = 'transform 0.8s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.8s';
            particle.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance}px) scale(0.7)`;
            particle.style.opacity = '0';
        }, 30);
    }
    
    setTimeout(() => {
        fireworksOverlay.style.display = 'none';
    }, 1200);
}

function checkAnswer() {
    const userAnswer = answerInput.value.toLowerCase().trim();
    const correctWord = words[currentWord];
    
    if (userAnswer === correctWord) {
        feedbackDiv.textContent = '✅ Correct!';
        feedbackDiv.style.color = '#00b894';
        score++;
        showFireworksAndQuote();
        submitBtn.disabled = true;
        answerInput.disabled = true;
        nextBtn.style.display = (currentWord < words.length - 1) ? 'inline-block' : 'none';
        restartBtn.style.display = (currentWord === words.length - 1) ? 'inline-block' : 'none';
    } else {
        triesLeft--;
        triesLeftDiv.textContent = `Tries left: ${triesLeft}`;
        
        // Add to incorrect attempts if not already there
        if (!incorrectAttempts.includes(userAnswer)) {
            incorrectAttempts.push(userAnswer);
        }
        updateIncorrectAttemptsDisplay();
        
        if (triesLeft === 0) {
            feedbackDiv.innerHTML = `❌ The correct answer was <b>${correctWord}</b>.<br><span style='color:#fdcb6e;'>${incorrectMotivationalQuotes[Math.floor(Math.random() * incorrectMotivationalQuotes.length)]}</span>`;
            feedbackDiv.style.color = '#d63031';
            submitBtn.disabled = true;
            answerInput.disabled = true;
            nextBtn.style.display = (currentWord < words.length - 1) ? 'inline-block' : 'none';
            restartBtn.style.display = (currentWord === words.length - 1) ? 'inline-block' : 'none';
        } else {
            feedbackDiv.textContent = '❌ Try again!';
            feedbackDiv.style.color = '#e17055';
            answerInput.value = '';
            answerInput.focus();
        }
    }
    
    scoreDiv.textContent = `Score: ${score} / ${words.length}`;
}

// Event listeners
submitBtn.onclick = checkAnswer;
answerInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
};

nextBtn.onclick = () => {
    currentWord++;
    showWord();
};

restartBtn.onclick = () => {
    startGame();
};

// Sidebar functionality
openSidebarBtn.onclick = () => {
    sidebar.classList.add('open');
    sidebar.classList.remove('closed');
};

closeSidebarBtn.onclick = () => {
    sidebar.classList.remove('open');
    sidebar.classList.add('closed');
};

difficultySelect.onchange = () => {
    const newDifficulty = parseInt(difficultySelect.value);
    if (newDifficulty !== difficultyLevel) {
        difficultyLevel = newDifficulty;
        startGame();
    }
};

function startGame() {
    generateWords();
    currentWord = 0;
    score = 0;
    showWord();
}

startGame(); 