const questionNumberDiv = document.getElementById('question-number');
const questionDiv = document.getElementById('question');
const optionsDiv = document.getElementById('options');
const feedbackDiv = document.getElementById('feedback');
const scoreDiv = document.getElementById('score');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const baseNumberInput = document.getElementById('base-number-input');
const startBtn = document.getElementById('start-btn');
const hintBtn = document.getElementById('hint-btn');
const carsonTableWrapper = document.getElementById('carson-table-wrapper');

let questions = [];
let currentQuestion = 0;
let score = 0;
let baseNumber = null;
let carsonAnimationTimeouts = [];

openSidebarBtn.onclick = () => {
    sidebar.classList.add('open');
    sidebar.classList.remove('closed');
};

closeSidebarBtn.onclick = () => {
    sidebar.classList.remove('open');
    sidebar.classList.add('closed');
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
    const multiplier = getRandomInt(1, 12);
    const correct = baseNumber * multiplier;

    const options = new Set();
    options.add(correct);
    while (options.size < 3) {
        const delta = getRandomInt(-5, 5) || 1;
        const wrong = correct + delta * getRandomInt(1, 2);
        if (wrong > 0 && wrong !== correct) {
            options.add(wrong);
        }
    }

    const optionsArr = Array.from(options);
    for (let i = optionsArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArr[i], optionsArr[j]] = [optionsArr[j], optionsArr[i]];
    }

    return {
        multiplier,
        correct,
        options: optionsArr
    };
}

function generateQuestions() {
    questions = [];
    for (let i = 0; i < 20; i++) {
        questions.push(generateQuestion());
    }
}

function buildCarsonTable() {
    if (!carsonTableWrapper || carsonTableWrapper.firstChild) {
        return;
    }

    const table = document.createElement('table');
    table.className = 'carson-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');

    const cornerTh = document.createElement('th');
    cornerTh.className = 'corner';
    headRow.appendChild(cornerTh);

    for (let i = 1; i <= 12; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        th.dataset.colHeader = String(i);
        headRow.appendChild(th);
    }

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let row = 1; row <= 12; row++) {
        const tr = document.createElement('tr');

        const rowHeader = document.createElement('th');
        rowHeader.textContent = row;
        rowHeader.dataset.rowHeader = String(row);
        tr.appendChild(rowHeader);

        for (let col = 1; col <= 12; col++) {
            const td = document.createElement('td');
            td.textContent = row * col;
            td.dataset.row = String(row);
            td.dataset.col = String(col);
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    carsonTableWrapper.appendChild(table);
}

function clearCarsonHighlights() {
    if (!carsonTableWrapper) return;

    carsonAnimationTimeouts.forEach(id => clearTimeout(id));
    carsonAnimationTimeouts = [];

    carsonTableWrapper
        .querySelectorAll('.carson-highlight-horizontal, .carson-highlight-vertical, .carson-highlight-cell')
        .forEach(el => {
            el.classList.remove('carson-highlight-horizontal', 'carson-highlight-vertical', 'carson-highlight-cell');
        });

    carsonTableWrapper
        .querySelectorAll('.carson-star')
        .forEach(el => el.remove());
}

function highlightCarsonForCurrentQuestion() {
    if (!carsonTableWrapper || !questions.length || baseNumber == null) return;

    const q = questions[currentQuestion];
    if (!q) return;

    clearCarsonHighlights();

    const colFactor = baseNumber;
    const rowFactor = q.multiplier;
    const table = carsonTableWrapper.querySelector('.carson-table');
    if (!table) return;

    const verticalCells = [];
    const verticalHeader = carsonTableWrapper.querySelector(`th[data-col-header="${colFactor}"]`);
    if (verticalHeader) verticalCells.push(verticalHeader);
    for (let r = 1; r <= rowFactor; r++) {
        const cell = carsonTableWrapper.querySelector(
            `td[data-row="${r}"][data-col="${colFactor}"]`
        );
        if (cell) verticalCells.push(cell);
    }

    const horizontalCells = [];
    const rowHeader = carsonTableWrapper.querySelector(`th[data-row-header="${rowFactor}"]`);
    if (rowHeader) horizontalCells.push(rowHeader);
    for (let c = 1; c <= colFactor; c++) {
        const cell = carsonTableWrapper.querySelector(
            `td[data-row="${rowFactor}"][data-col="${c}"]`
        );
        if (cell) horizontalCells.push(cell);
    }

    const answerCell = carsonTableWrapper.querySelector(
        `td[data-row="${rowFactor}"][data-col="${colFactor}"]`
    );

    let delay = 0;
    const step = 140;

    verticalCells.forEach((el, index) => {
        const timeoutId = setTimeout(() => {
            el.classList.add('carson-highlight-vertical');
        }, delay + index * step);
        carsonAnimationTimeouts.push(timeoutId);
    });
    delay += verticalCells.length * step;

    horizontalCells.forEach((el, index) => {
        const timeoutId = setTimeout(() => {
            el.classList.add('carson-highlight-horizontal');
        }, delay + index * step);
        carsonAnimationTimeouts.push(timeoutId);
    });
    delay += horizontalCells.length * step;

    if (answerCell) {
        const timeoutId = setTimeout(() => {
            answerCell.classList.add('carson-highlight-cell');
        }, delay + step);
        carsonAnimationTimeouts.push(timeoutId);
    }
}

function showQuestion() {
    // Hide hint chart and clear highlights whenever a new question is shown
    if (carsonTableWrapper) {
        carsonTableWrapper.classList.add('hint-hidden');
    }
    clearCarsonHighlights();

    const total = questions.length;
    if (total === 0) {
        feedbackDiv.textContent = 'Choose a number in the sidebar and press "Start Practice" to begin.';
        scoreDiv.textContent = '';
        questionNumberDiv.textContent = '';
        questionDiv.textContent = '';
        optionsDiv.innerHTML = '';
        nextBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        return;
    }

    const q = questions[currentQuestion];
    feedbackDiv.textContent = '';
    questionNumberDiv.textContent = `Question ${currentQuestion + 1} of ${total}`;
    questionDiv.textContent = `${baseNumber} × ${q.multiplier} = ?`;
    scoreDiv.textContent = `Score: ${score} / ${total}`;

    optionsDiv.innerHTML = '';
    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => selectAnswer(option);
        optionsDiv.appendChild(btn);
    });

    nextBtn.style.display = 'none';
    restartBtn.style.display = (currentQuestion === total - 1) ? 'inline-block' : 'none';
}

function selectAnswer(selected) {
    const q = questions[currentQuestion];
    Array.from(document.getElementsByClassName('option-btn')).forEach(b => b.disabled = true);

    if (selected === q.correct) {
        feedbackDiv.textContent = '✅ Correct!';
        feedbackDiv.style.color = '#00b894';
        score++;
    } else {
        feedbackDiv.textContent = `❌ Wrong! The correct answer is ${q.correct}.`;
        feedbackDiv.style.color = '#d63031';
    }

    scoreDiv.textContent = `Score: ${score} / ${questions.length}`;

    if (currentQuestion < questions.length - 1) {
        nextBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
    }
}

nextBtn.onclick = () => {
    currentQuestion++;
    showQuestion();
};

restartBtn.onclick = () => {
    startPractice();
};

startBtn.onclick = () => {
    startPractice();
    sidebar.classList.remove('open');
    sidebar.classList.add('closed');
};

if (hintBtn && carsonTableWrapper) {
    hintBtn.onclick = () => {
        buildCarsonTable();
        const willShow = carsonTableWrapper.classList.contains('hint-hidden');
        carsonTableWrapper.classList.toggle('hint-hidden');
        if (willShow) {
            highlightCarsonForCurrentQuestion();
        } else {
            clearCarsonHighlights();
        }
    };
}

function startPractice() {
    const value = parseInt(baseNumberInput.value, 10);
    if (isNaN(value) || value < 1 || value > 12) {
        feedbackDiv.textContent = 'Please choose a number between 1 and 12.';
        feedbackDiv.style.color = '#d63031';
        return;
    }

    baseNumber = value;
    score = 0;
    currentQuestion = 0;
    generateQuestions();
    showQuestion();
}

// Initial message
feedbackDiv.textContent = 'Open the menu, choose a number (1–12), and press "Start Practice" to begin.';
feedbackDiv.style.color = '#2d3436';
