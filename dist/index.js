"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let currentQuestionIndex = 0; // Håller reda på den aktuella frågan
let score = 0; // Håller reda på användarens poäng 
let questions = []; // Array som lagrar quizfrågorna
// Funktion för att avkoda HTML-entiteter
function decodeHtml(html) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = html;
    return textArea.value;
}
// Hämtar frågor från Open Trivia API
function fetchQuestions(category, difficulty) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=boolean`);
            if (!response.ok) {
                throw new Error(`Failed to fetch questions: ${response.status}`);
            }
            const data = yield response.json();
            return data.results;
        }
        catch (error) {
            console.error("Error fetching questions:", error);
            alert("Failed to load questions. TRY AGAIN!! :D.");
            return [];
        }
    });
}
// Startar quizet
function startQuiz() {
    return __awaiter(this, void 0, void 0, function* () {
        const categorySelect = document.querySelector('#category');
        const difficultySelect = document.querySelector('#difficulty');
        const selectedCategory = parseInt(categorySelect.value);
        const selectedDifficulty = difficultySelect.value;
        questions = yield fetchQuestions(selectedCategory, selectedDifficulty);
        if (questions.length === 0)
            return;
        currentQuestionIndex = 0;
        score = 0;
        document.querySelector('#setup').style.display = 'none';
        document.querySelector('#question-section').style.display = 'block';
        displayQuestion();
    });
}
// Visar den aktuella frågan
function displayQuestion() {
    const questionElement = document.querySelector('#question');
    const resultElement = document.querySelector('#result');
    const nextBtn = document.querySelector('#next-btn');
    const trueBtn = document.querySelector('#true-btn');
    const falseBtn = document.querySelector('#false-btn');
    questionElement.textContent = decodeHtml(questions[currentQuestionIndex].question);
    resultElement.textContent = '';
    nextBtn.style.display = 'none';
    trueBtn.style.display = 'inline-block';
    falseBtn.style.display = 'inline-block';
    trueBtn.disabled = false;
    falseBtn.disabled = false;
    trueBtn.onclick = () => checkAnswer('True');
    falseBtn.onclick = () => checkAnswer('False');
}
// Kontrollerar om användarens svar är korrekt
function checkAnswer(userAnswer) {
    const resultElement = document.querySelector('#result');
    const nextBtn = document.querySelector('#next-btn');
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    const trueBtn = document.querySelector('#true-btn');
    const falseBtn = document.querySelector('#false-btn');
    trueBtn.disabled = true;
    falseBtn.disabled = true;
    trueBtn.style.display = 'none';
    falseBtn.style.display = 'none';
    if (userAnswer === correctAnswer) {
        score++;
        resultElement.textContent = 'Correct!';
        resultElement.classList.add('correct');
        resultElement.classList.remove('incorrect');
    }
    else {
        resultElement.textContent = 'Incorrect!';
        resultElement.classList.add('incorrect');
        resultElement.classList.remove('correct');
    }
    nextBtn.style.display = 'block';
    nextBtn.onclick = () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        }
        else {
            endQuiz();
        }
    };
}
/**
 * Visar den senaste poängen från localStorage.
 */
function displayLatestScore() {
    const latestScoreDisplay = document.querySelector('#latest-score-display');
    const scoresJson = localStorage.getItem('quizScores');
    const scores = scoresJson ? JSON.parse(scoresJson) : []; // Kontrollera om scoresJson är null annars fuckar ALLT!
    if (scores.length > 0) {
        const latestScore = scores[scores.length - 1];
        latestScoreDisplay.textContent = `${latestScore.name}: ${latestScore.score}/${latestScore.totalQuestions}`; // Använd det totala antalet frågor
    }
    else {
        latestScoreDisplay.textContent = 'N/A';
    }
}
function endQuiz() {
    const finalScoreDisplay = document.querySelector('#final-score');
    const resultDisplay = document.querySelector('#result-display');
    const overlay = document.querySelector('#overlay'); // Hämta overlay-elementet
    finalScoreDisplay.textContent = `${score}/${questions.length}`;
    resultDisplay.style.display = 'block'; // Visa resultatet på sidan
    overlay.style.display = 'block'; // Visa overlay
    // Hantera sparande av poäng och namn
    const saveScoreBtn = document.querySelector('#save-score-btn');
    saveScoreBtn.onclick = () => {
        const playerNameInput = document.querySelector('#player-name');
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            // Spara poäng i localStorage
            const existingScoresJson = localStorage.getItem('quizScores');
            const existingScores = existingScoresJson ? JSON.parse(existingScoresJson) : [];
            // Här lägger vi till totalQuestions
            existingScores.push({
                name: playerName,
                score: score,
                totalQuestions: questions.length // Lägg till det totala antalet frågor
            });
            localStorage.setItem('quizScores', JSON.stringify(existingScores));
            // Visa senaste poäng
            displayLatestScore();
            overlay.style.display = 'none'; // Döljer overlay efter sparande
            resultDisplay.style.display = 'none'; // Döljer resultatdisplayen efter sparande
        }
        else {
            alert("Please enter a valid name.");
        }
    };
    // Dölja frågesektionen
    document.querySelector('#setup').style.display = 'block'; // Skickas tillbaka till start.
    document.querySelector('#question-section').style.display = 'none';
}
/**
 * Återställ quizet så att användaren kan börja om.
 */
function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questions = []; // Rensa frågor
    // Rensa UI-element
    const questionElement = document.querySelector('#question');
    const resultElement = document.querySelector('#result');
    const finalScoreDisplay = document.querySelector('#final-score');
    questionElement.textContent = '';
    resultElement.textContent = '';
    finalScoreDisplay.textContent = '';
    // Dölja resultatsektionen
    document.querySelector('#result-display').style.display = 'none';
}
// Lägg till event listener när DOM är redo
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('#start-btn');
    if (startButton) {
        startButton.addEventListener('click', startQuiz);
    }
    else {
        console.error("Start button not found in the DOM.");
    }
    displayLatestScore(); // Visa senaste poäng vid sidladdning
});
