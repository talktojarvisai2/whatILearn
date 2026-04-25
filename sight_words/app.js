const questionNumberDiv = document.getElementById('question-number');
const sightWordDiv = document.getElementById('sight-word');
const feedbackDiv = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const difficultySelect = document.getElementById('difficulty-select');
const startBtn = document.getElementById('start-btn');
const soundBtn = document.getElementById('sound-btn');

let words = [];
let currentWord = 0;
let difficultyLevel = 1;

// Pre-K / Kindergarten sight words and early reader words by length
const wordLists = {
    1: [ // Level 1: 3-letter words
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
        'her', 'his', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him',
        'how', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'let',
        'put', 'say', 'she', 'too', 'run', 'sit', 'big', 'red', 'cat', 'dog',
        'sun', 'box', 'car', 'bed', 'mom', 'dad', 'fun', 'yes', 'go', 'up',
        'in', 'on', 'at', 'to', 'it', 'is', 'we', 'me', 'he', 'my', 'by', 'so', 'do', 'or', 'of', 'us', 'am', 'an'
    ],
    2: [ // Level 2: 4-letter words
        'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'been', 'were',
        'said', 'each', 'make', 'like', 'long', 'time', 'come', 'some', 'more', 'than',
        'them', 'when', 'look', 'into', 'could', 'other', 'word', 'many', 'very', 'after',
        'back', 'just', 'over', 'know', 'take', 'then', 'down', 'only', 'find', 'here',
        'help', 'need', 'play', 'same', 'good', 'work', 'read', 'keep', 'give', 'live',
        'walk', 'talk', 'once', 'open', 'kind', 'hand', 'high', 'came', 'name', 'game',
        'home', 'made', 'ride', 'side', 'line', 'five', 'love', 'blue', 'tree', 'book'
    ],
    3: [ // Level 3: 5-letter words
        'there', 'their', 'about', 'would', 'could', 'where', 'which', 'what', 'think', 'every',
        'right', 'found', 'still', 'while', 'might', 'first', 'place', 'again', 'after', 'never',
        'under', 'going', 'being', 'little', 'three', 'today', 'great', 'other', 'water', 'these',
        'those', 'write', 'sound', 'round', 'young', 'thank', 'thing', 'bring', 'black', 'brown',
        'white', 'green', 'happy', 'hello', 'house', 'mouse', 'night', 'light', 'sight', 'start',
        'story', 'watch', 'whose', 'woman', 'world', 'your'
    ]
};

openSidebarBtn.onclick = () => {
    sidebar.classList.add('open');
    sidebar.classList.remove('closed');
};

closeSidebarBtn.onclick = () => {
    sidebar.classList.remove('open');
    sidebar.classList.add('closed');
};

function generateWords() {
    words = [...wordLists[difficultyLevel]];
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
}

function playWordSound() {
    const word = words[currentWord];
    if (!word || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.8;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
}

function showWord() {
    feedbackDiv.textContent = '';
    questionNumberDiv.textContent = `Word ${currentWord + 1} of ${words.length}`;
    sightWordDiv.textContent = words[currentWord];
    sightWordDiv.style.display = 'block';
    if (soundBtn) soundBtn.style.display = 'inline-flex';

    const isLast = currentWord === words.length - 1;
    nextBtn.style.display = isLast ? 'none' : 'inline-block';
    restartBtn.style.display = isLast ? 'inline-block' : 'none';
}

function startPractice() {
    difficultyLevel = parseInt(difficultySelect.value, 10);
    currentWord = 0;
    generateWords();
    if (words.length === 0) {
        feedbackDiv.textContent = 'No words for this level.';
        sightWordDiv.textContent = '';
        if (soundBtn) soundBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        return;
    }
    showWord();
    sidebar.classList.remove('open');
    sidebar.classList.add('closed');
}

nextBtn.onclick = () => {
    currentWord++;
    showWord();
};

restartBtn.onclick = () => {
    startPractice();
};

startBtn.onclick = () => {
    startPractice();
};

if (soundBtn) {
    soundBtn.onclick = () => playWordSound();
    soundBtn.style.display = 'none';
}

difficultySelect.onchange = () => {
    difficultyLevel = parseInt(difficultySelect.value, 10);
};

// Initial message
feedbackDiv.textContent = 'Pick a level and press Start to practice sight words.';
sightWordDiv.style.display = 'none';
