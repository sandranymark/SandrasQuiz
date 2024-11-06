interface QuizQuestion {
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

interface QuizAPIResponse {
    results: QuizQuestion[];
    // en array av QuizQuestion, vilket innebär att den innehåller
    // flera objekt som alla måste följa strukturen som beskrivs i QuizQuestion
}

let currentQuestionIndex = 0;
let score = 0;
let questions: QuizQuestion[] = [];


//DENNA FICK JAG HJÄLP MED AV MIN KÄRA VÄN CHAT-GPT
// Detta behövs för att kunna använda specialtecken
//Och inte få massa siffror och skit i frågorna.
function decodeHtml(html: string): string {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = html;
    return textArea.value;
}




async function fetchQuestions(category: number, difficulty: string): Promise<QuizQuestion[]> {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=boolean`);
        if (!response.ok) throw new Error(`Failed to fetch questions: ${response.status}`);
        const data: QuizAPIResponse = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to load questions. TRY AGAIN!! :D.");
        return [];
    }
}



async function startQuiz() {
    const categorySelect = document.querySelector('#category') as HTMLSelectElement;
    const difficultySelect = document.querySelector('#difficulty') as HTMLSelectElement;

// kör igenom quizet genom att hämta frågor och ställa in den första frågan
// Döljer inställningssektionen och visar frågesektionen.
    questions = await fetchQuestions(parseInt(categorySelect.value), difficultySelect.value);
    if (questions.length === 0) return;

    currentQuestionIndex = 0;
    score = 0;

    toggleVisibility('#setup', false);
    toggleVisibility('#question-section', true);

    displayQuestion();
}




function displayQuestion() {
    const questionElement = document.querySelector('#question') as HTMLElement;
    const resultElement = document.querySelector('#result') as HTMLElement;
    const nextBtn = document.querySelector('#next-btn') as HTMLButtonElement;
    const trueBtn = document.querySelector('#true-btn') as HTMLButtonElement;
    const falseBtn = document.querySelector('#false-btn') as HTMLButtonElement;

    questionElement.textContent = decodeHtml(questions[currentQuestionIndex].question);
    resultElement.textContent = '';
    toggleVisibility(nextBtn, false);
    toggleVisibility(trueBtn, true);
    toggleVisibility(falseBtn, true);

    trueBtn.disabled = false;
    falseBtn.disabled = false;

    trueBtn.onclick = () => checkAnswer('True');
    falseBtn.onclick = () => checkAnswer('False');
}




function checkAnswer(userAnswer: string) {
    const resultElement = document.querySelector('#result') as HTMLElement;
    const nextBtn = document.querySelector('#next-btn') as HTMLButtonElement;
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    const trueBtn = document.querySelector('#true-btn') as HTMLButtonElement;
    const falseBtn = document.querySelector('#false-btn') as HTMLButtonElement;

    trueBtn.disabled = true;
    falseBtn.disabled = true;
    toggleVisibility(trueBtn, false);
    toggleVisibility(falseBtn, false);

    if (userAnswer === correctAnswer) {
        score++;
        resultElement.textContent = 'Correct!';
        resultElement.classList.add('correct');
        resultElement.classList.remove('incorrect');
    } else {
        resultElement.textContent = 'Incorrect!';
        resultElement.classList.add('incorrect');
        resultElement.classList.remove('correct');
    }

    toggleVisibility(nextBtn, true);
    nextBtn.onclick = () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    };
}




function displayLatestScore() {
    const latestScoreDisplay = document.querySelector('#latest-score-display') as HTMLElement;
    const scoresJson = localStorage.getItem('quizScores');
    const scores = scoresJson ? JSON.parse(scoresJson) : [];

    latestScoreDisplay.textContent = scores.length > 0 ? `${scores[scores.length - 1].name}: ${scores[scores.length - 1].score}/${scores[scores.length - 1].totalQuestions}` : 'N/A';
}



function endQuiz() {
    const finalScoreDisplay = document.querySelector('#final-score') as HTMLElement;
    const resultDisplay = document.querySelector('#result-display') as HTMLElement;
    const overlay = document.querySelector('#overlay') as HTMLElement;

    finalScoreDisplay.textContent = `${score}/${questions.length}`;
    toggleVisibility(resultDisplay, true);
    toggleVisibility(overlay, true);

    const saveScoreBtn = document.querySelector('#save-score-btn') as HTMLButtonElement;
    saveScoreBtn.onclick = () => {
        const playerNameInput = document.querySelector('#player-name') as HTMLInputElement;
        const playerName = playerNameInput.value.trim();

        if (playerName) {
            //Hämtar och uppdaterar poäng i localStorage:
            const existingScoresJson = localStorage.getItem('quizScores');
            const existingScores = existingScoresJson ? JSON.parse(existingScoresJson) : [];
            existingScores.push({ name: playerName, score: score, totalQuestions: questions.length });
            localStorage.setItem('quizScores', JSON.stringify(existingScores));
            // (om existingScoresJson  inte är null), 
            //konverteras JSON-strängen till en JavaScript-array med JSON.parse
            //Om det inte finns något resultat sparat så skapas en tom array.
            displayLatestScore();
            toggleVisibility(overlay, false);
            toggleVisibility(resultDisplay, false);
        } else {
            alert("Please enter a fucking name :))).");
        }
    };

    toggleVisibility('#setup', true);
    toggleVisibility('#question-section', false);
}



function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questions = [];

    const questionElement = document.querySelector('#question') as HTMLElement;
    const resultElement = document.querySelector('#result') as HTMLElement;
    const finalScoreDisplay = document.querySelector('#final-score') as HTMLElement;

    questionElement.textContent = '';
    resultElement.textContent = '';
    finalScoreDisplay.textContent = '';

    toggleVisibility('#result-display', false);
}


//Selector kan vara Css-selektor-string eller ett direkt HTML-element
function toggleVisibility(selector: string | HTMLElement, show: boolean) {
    const element = typeof selector === 'string' ? document.querySelector(selector) as HTMLElement : selector;
    element.style.display = show ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('#start-btn') as HTMLButtonElement;
    if (startButton) {
        startButton.addEventListener('click', startQuiz);
    } else {
        console.error("Start button not found in the DOM.");
    }
    displayLatestScore();
});
