const TOTAL_QUESTIONS = 5;

const gradeSelect = document.getElementById("grade-select");
const gradeDisplay = document.getElementById("grade-display");
const questionNumberDiv = document.getElementById("question-number");
const equationsDiv = document.getElementById("equations");
const answerX = document.getElementById("answer-x");
const answerY = document.getElementById("answer-y");
const answerZ = document.getElementById("answer-z");
const answerLabelZ = document.getElementById("answer-label-z");
const feedbackDiv = document.getElementById("feedback");
const scoreDiv = document.getElementById("score");
const hintBtn = document.getElementById("hint-btn");
const hintPanel = document.getElementById("hint-panel");
const hintSteps = document.getElementById("hint-steps");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");

let grade = 10;
let currentQuestion = 0;
let score = 0;
let currentProblem = null;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNonZero(min, max) {
    let value = 0;
    while (value === 0) {
        value = randomInt(min, max);
    }
    return value;
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

function formatTerm(coeff, variable, isFirst) {
    if (coeff === 0) {
        return "";
    }

    const abs = Math.abs(coeff);
    const sign = coeff < 0 ? "-" : isFirst ? "" : "+ ";
    const coeffText = abs === 1 ? "" : String(abs);
    return `${sign}${coeffText}${variable}`;
}

function formatLinearEquation(coeffs, constants, labels) {
    const terms = labels
        .map((label, index) => formatTerm(coeffs[index], label, index === 0 || coeffs.slice(0, index).every((value) => value === 0)))
        .filter(Boolean)
        .join(" ");

    if (!terms) {
        return `0 = ${constants}`;
    }

    return `${terms} = ${constants}`;
}

function generateValues(count, range) {
    const values = [];
    while (values.length < count) {
        const value = randomInt(-range, range);
        if (values.length === 0 && value === 0) {
            continue;
        }
        values.push(value);
    }
    return values;
}

function generateCoefficients(count, range) {
    const coeffs = [];
    while (coeffs.length < count) {
        coeffs.push(randomNonZero(-range, range));
    }
    return coeffs;
}

function dotProduct(coeffs, values) {
    return coeffs.reduce((sum, coeff, index) => sum + coeff * values[index], 0);
}

function determinant2(a, b, d, e) {
    return a * e - b * d;
}

function generate2x2Problem(coeffRange) {
    const solution = generateValues(2, coeffRange);
    let eq1Coeffs;
    let eq2Coeffs;

    do {
        eq1Coeffs = generateCoefficients(2, coeffRange);
        eq2Coeffs = generateCoefficients(2, coeffRange);
    } while (determinant2(eq1Coeffs[0], eq1Coeffs[1], eq2Coeffs[0], eq2Coeffs[1]) === 0);

    return {
        order: 2,
        labels: ["x", "y"],
        equations: [
            { coeffs: eq1Coeffs, constant: dotProduct(eq1Coeffs, solution) },
            { coeffs: eq2Coeffs, constant: dotProduct(eq2Coeffs, solution) }
        ],
        solution: { x: solution[0], y: solution[1] }
    };
}

function determinant3(matrix) {
    const [a, b, c] = matrix[0];
    const [d, e, f] = matrix[1];
    const [g, h, i] = matrix[2];
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function generate3x3Problem(coeffRange) {
    const solution = generateValues(3, coeffRange);
    let equations;

    do {
        equations = [];
        for (let i = 0; i < 3; i++) {
            const coeffs = generateCoefficients(3, coeffRange);
            equations.push({
                coeffs,
                constant: dotProduct(coeffs, solution)
            });
        }
    } while (determinant3(equations.map((equation) => equation.coeffs)) === 0);

    return {
        order: 3,
        labels: ["x", "y", "z"],
        equations,
        solution: { x: solution[0], y: solution[1], z: solution[2] }
    };
}

function generateProblem(selectedGrade) {
    if (selectedGrade === 11) {
        return generate3x3Problem(4);
    }
    if (selectedGrade === 10) {
        return generate2x2Problem(6);
    }
    return generate2x2Problem(4);
}

function build2x2HintSteps(problem) {
    const steps = [];
    const [eq1, eq2] = problem.equations;
    const [a, b] = eq1.coeffs;
    const c = eq1.constant;
    const [d, e] = eq2.coeffs;
    const f = eq2.constant;
    const { x, y } = problem.solution;

    steps.push(`Write the two equations:\n(1) ${formatLinearEquation([a, b], c, ["x", "y"])}\n(2) ${formatLinearEquation([d, e], f, ["x", "y"])}`);

    const eliminateY = Math.abs(b) <= Math.abs(e);
    if (eliminateY && b !== 0 && e !== 0) {
        const mult1 = lcm(b, e) / b;
        const mult2 = lcm(b, e) / e;
        const newA1 = a * mult1;
        const newB1 = b * mult1;
        const newC1 = c * mult1;
        const newA2 = d * mult2;
        const newB2 = e * mult2;
        const newC2 = f * mult2;

        steps.push(`Multiply to make the y-coefficients equal:\n(1) × ${mult1}: ${formatLinearEquation([newA1, newB1], newC1, ["x", "y"])}\n(2) × ${mult2}: ${formatLinearEquation([newA2, newB2], newC2, ["x", "y"])}`);

        const subtract = newB1 === newB2;
        const xCoeff = subtract ? newA1 - newA2 : newA1 + newA2;
        const constValue = subtract ? newC1 - newC2 : newC1 + newC2;
        steps.push(`${subtract ? "Subtract" : "Add"} the equations to eliminate y:\n${formatLinearEquation([xCoeff, 0], constValue, ["x", "y"])}`);
        steps.push(`Solve for x:\nx = ${constValue} / ${xCoeff} = ${x}`);
        steps.push(`Substitute x = ${x} into equation (1):\n${formatLinearEquation([a, b], c, ["x", "y"])}\n${a}(${x}) + ${formatTerm(b, "y", false).trim()} = ${c}`);
        steps.push(`Solve for y:\ny = ${y}`);
    } else if (!eliminateY && a !== 0 && d !== 0) {
        const mult1 = lcm(a, d) / a;
        const mult2 = lcm(a, d) / d;
        const newA1 = a * mult1;
        const newB1 = b * mult1;
        const newC1 = c * mult1;
        const newA2 = d * mult2;
        const newB2 = e * mult2;
        const newC2 = f * mult2;

        steps.push(`Multiply to make the x-coefficients equal:\n(1) × ${mult1}: ${formatLinearEquation([newA1, newB1], newC1, ["x", "y"])}\n(2) × ${mult2}: ${formatLinearEquation([newA2, newB2], newC2, ["x", "y"])}`);

        const subtract = newA1 === newA2;
        const yCoeff = subtract ? newB1 - newB2 : newB1 + newB2;
        const constValue = subtract ? newC1 - newC2 : newC1 + newC2;
        steps.push(`${subtract ? "Subtract" : "Add"} the equations to eliminate x:\n${formatLinearEquation([0, yCoeff], constValue, ["x", "y"])}`);
        steps.push(`Solve for y:\ny = ${constValue} / ${yCoeff} = ${y}`);
        steps.push(`Substitute y = ${y} into equation (1):\n${formatLinearEquation([a, b], c, ["x", "y"])}\n${formatTerm(a, "x", true)} + ${b}(${y}) = ${c}`);
        steps.push(`Solve for x:\nx = ${x}`);
    } else {
        steps.push(`Use substitution on equation (1):\n${formatLinearEquation([a, b], c, ["x", "y"])}`);
        steps.push(`Substitute into equation (2) and solve:\nx = ${x}, y = ${y}`);
    }

    steps.push(`Final answer: x = ${x}, y = ${y}`);
    return steps;
}

function scaleRow(coeffs, constant, multiplier) {
    return {
        coeffs: coeffs.map((value) => value * multiplier),
        constant: constant * multiplier
    };
}

function addRows(rowA, rowB) {
    return {
        coeffs: rowA.coeffs.map((value, index) => value + rowB.coeffs[index]),
        constant: rowA.constant + rowB.constant
    };
}

function subtractRows(rowA, rowB) {
    return {
        coeffs: rowA.coeffs.map((value, index) => value - rowB.coeffs[index]),
        constant: rowA.constant - rowB.constant
    };
}

function build3x3HintSteps(problem) {
    const steps = [];
    const [eq1, eq2, eq3] = problem.equations;
    const labels = problem.labels;
    const { x, y, z } = problem.solution;

    steps.push(
        "Write the three equations:\n" +
        problem.equations
            .map((equation, index) => `(${index + 1}) ${formatLinearEquation(equation.coeffs, equation.constant, labels)}`)
            .join("\n")
    );

    const zLcm = lcm(Math.abs(eq1.coeffs[2] || 1), Math.abs(eq2.coeffs[2] || 1));
    const m1 = eq1.coeffs[2] === 0 ? 1 : zLcm / eq1.coeffs[2];
    const m2 = eq2.coeffs[2] === 0 ? 1 : zLcm / eq2.coeffs[2];
    const scaledEq1 = scaleRow(eq1.coeffs, eq1.constant, m1);
    const scaledEq2 = scaleRow(eq2.coeffs, eq2.constant, m2);
    const eq4 = subtractRows(scaledEq2, scaledEq1);

    steps.push(
        `Eliminate z from equations (1) and (2):\n` +
        `(1) × ${m1}: ${formatLinearEquation(scaledEq1.coeffs, scaledEq1.constant, labels)}\n` +
        `(2) × ${m2}: ${formatLinearEquation(scaledEq2.coeffs, scaledEq2.constant, labels)}\n` +
        `(4) ${formatLinearEquation(eq4.coeffs, eq4.constant, labels)}`
    );

    const zLcm23 = lcm(Math.abs(eq1.coeffs[2] || 1), Math.abs(eq3.coeffs[2] || 1));
    const m3 = eq1.coeffs[2] === 0 ? 1 : zLcm23 / eq1.coeffs[2];
    const m4 = eq3.coeffs[2] === 0 ? 1 : zLcm23 / eq3.coeffs[2];
    const scaledEq1b = scaleRow(eq1.coeffs, eq1.constant, m3);
    const scaledEq3 = scaleRow(eq3.coeffs, eq3.constant, m4);
    const eq5 = subtractRows(scaledEq3, scaledEq1b);

    steps.push(
        `Eliminate z from equations (1) and (3):\n` +
        `(1) × ${m3}: ${formatLinearEquation(scaledEq1b.coeffs, scaledEq1b.constant, labels)}\n` +
        `(3) × ${m4}: ${formatLinearEquation(scaledEq3.coeffs, scaledEq3.constant, labels)}\n` +
        `(5) ${formatLinearEquation(eq5.coeffs, eq5.constant, labels)}`
    );

    const yLcm = lcm(Math.abs(eq4.coeffs[1] || 1), Math.abs(eq5.coeffs[1] || 1));
    const n1 = eq4.coeffs[1] === 0 ? 1 : yLcm / eq4.coeffs[1];
    const n2 = eq5.coeffs[1] === 0 ? 1 : yLcm / eq5.coeffs[1];
    const scaledEq4 = scaleRow(eq4.coeffs, eq4.constant, n1);
    const scaledEq5 = scaleRow(eq5.coeffs, eq5.constant, n2);
    const eq6 = subtractRows(scaledEq5, scaledEq4);

    steps.push(
        `Eliminate y from equations (4) and (5):\n` +
        `(4) × ${n1}: ${formatLinearEquation(scaledEq4.coeffs, scaledEq4.constant, labels)}\n` +
        `(5) × ${n2}: ${formatLinearEquation(scaledEq5.coeffs, scaledEq5.constant, labels)}\n` +
        `(6) ${formatLinearEquation(eq6.coeffs, eq6.constant, labels)}`
    );

    steps.push(`Solve equation (6) for x:\nx = ${x}`);
    steps.push(`Substitute x = ${x} into equation (4) to find y:\ny = ${y}`);
    steps.push(`Substitute x = ${x} and y = ${y} into equation (1) to find z:\nz = ${z}`);
    steps.push(`Final answer: x = ${x}, y = ${y}, z = ${z}`);
    return steps;
}

function buildHintSteps(problem) {
    if (problem.order === 3) {
        return build3x3HintSteps(problem);
    }
    return build2x2HintSteps(problem);
}

function updateGradeDisplay() {
    gradeDisplay.textContent = `O Level Class ${grade}`;
}

function toggleThirdVariable(show) {
    answerZ.classList.toggle("hidden", !show);
    answerLabelZ.classList.toggle("hidden", !show);
}

function resetHintPanel() {
    hintPanel.classList.add("hidden");
    hintSteps.innerHTML = "";
}

function showQuestion() {
    feedbackDiv.textContent = "";
    feedbackDiv.style.color = "#2d3436";
    answerX.value = "";
    answerY.value = "";
    answerZ.value = "";
    answerX.disabled = false;
    answerY.disabled = false;
    answerZ.disabled = false;
    submitBtn.disabled = false;
    hintBtn.disabled = false;
    nextBtn.classList.add("hidden");
    restartBtn.classList.add("hidden");
    resetHintPanel();

    currentProblem = generateProblem(grade);
    toggleThirdVariable(currentProblem.order === 3);

    updateGradeDisplay();
    questionNumberDiv.textContent = `Question ${currentQuestion + 1} of ${TOTAL_QUESTIONS}`;
    equationsDiv.innerHTML = currentProblem.equations
        .map((equation, index) => `<div>(${index + 1}) ${formatLinearEquation(equation.coeffs, equation.constant, currentProblem.labels)}</div>`)
        .join("");
    scoreDiv.textContent = `Score: ${score} / ${TOTAL_QUESTIONS}`;
    answerX.focus();
}

function showHint() {
    if (!currentProblem) {
        return;
    }

    const steps = buildHintSteps(currentProblem);
    hintSteps.innerHTML = steps.map((step) => `<li>${step.replace(/\n/g, "<br>")}</li>`).join("");
    hintPanel.classList.remove("hidden");
}

function parseAnswerInput(input) {
    if (input.value.trim() === "") {
        return null;
    }
    return Number(input.value);
}

function lockQuestion() {
    answerX.disabled = true;
    answerY.disabled = true;
    answerZ.disabled = true;
    submitBtn.disabled = true;
    hintBtn.disabled = false;

    if (currentQuestion < TOTAL_QUESTIONS - 1) {
        nextBtn.classList.remove("hidden");
    } else {
        restartBtn.classList.remove("hidden");
    }
}

function checkAnswer() {
    const userX = parseAnswerInput(answerX);
    const userY = parseAnswerInput(answerY);
    const userZ = currentProblem.order === 3 ? parseAnswerInput(answerZ) : 0;

    if (userX === null || userY === null || (currentProblem.order === 3 && userZ === null)) {
        feedbackDiv.textContent = "Please enter values for all variables.";
        feedbackDiv.style.color = "#e17055";
        return;
    }

    const correctX = currentProblem.solution.x;
    const correctY = currentProblem.solution.y;
    const correctZ = currentProblem.solution.z ?? 0;
    const isCorrect =
        userX === correctX &&
        userY === correctY &&
        (currentProblem.order === 2 || userZ === correctZ);

    if (isCorrect) {
        score++;
        feedbackDiv.textContent = "Correct!";
        feedbackDiv.style.color = "#00b894";
    } else if (currentProblem.order === 3) {
        feedbackDiv.textContent = `Not quite. The answer is x = ${correctX}, y = ${correctY}, z = ${correctZ}.`;
        feedbackDiv.style.color = "#d63031";
    } else {
        feedbackDiv.textContent = `Not quite. The answer is x = ${correctX}, y = ${correctY}.`;
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
hintBtn.onclick = showHint;

[nextBtn, restartBtn].forEach((button) => {
    button.onclick = () => {
        if (button === restartBtn) {
            startGame();
            return;
        }
        currentQuestion++;
        showQuestion();
    };
});

openSidebarBtn.onclick = () => {
    sidebar.classList.add("open");
    sidebar.classList.remove("closed");
};

closeSidebarBtn.onclick = () => {
    sidebar.classList.remove("open");
    sidebar.classList.add("closed");
};

gradeSelect.onchange = () => {
    grade = Number(gradeSelect.value);
    startGame();
};

startGame();
