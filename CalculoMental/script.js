// Datos del juego
const gameData = {
    operation: '',
    options: [],
    currentStep: 0,
    score: 0,
    displayTime: 500
};

// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const validateBtn = document.getElementById('validateBtn');
const validationResult = document.getElementById('validationResult');
const gameOptions = document.getElementById('game-options');
const displayTime = document.getElementById('displayTime');
const startGameBtn = document.getElementById('startGameBtn');
const generatorScreen = document.getElementById('generator-screen');
const gameScreen = document.getElementById('game-screen');
const operationDisplay = document.getElementById('operation-display');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score-display');
const backBtn = document.getElementById('back-btn');

// Event listeners
validateBtn.addEventListener('click', validateFile);
startGameBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', backToGenerator);

function validateFile() {
    const file = fileInput.files[0];
    if (!file) {
        showValidationResult('❌ Selecciona un archivo primero', false);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line !== '');

        if (lines.length < 2) {
            showValidationResult('❌ El archivo debe tener al menos 2 líneas (operación y respuestas)', false);
            return;
        }

        // Validar operación
        const operation = lines[0];
        if (!/^(\d+)(,[+\-*/]\d+)*$/.test(operation)) {
            showValidationResult(`❌ Formato de operación inválido. Debe ser como: 5,+3,*2`, false);
            return;
        }

        // Validar opciones
        const options = lines.slice(1);
        let hasCorrect = false;
        const validOptions = options.map(option => {
            const isCorrect = option.endsWith('*');
            if (isCorrect) hasCorrect = true;
            return {
                text: option.replace('*', ''),
                isCorrect: isCorrect
            };
        });

        if (!hasCorrect) {
            showValidationResult('❌ Falta marcar la respuesta correcta con *', false);
            return;
        }

        if (validOptions.length < 2) {
            showValidationResult('❌ Debe haber al menos 2 opciones de respuesta', false);
            return;
        }

        gameData.operation = operation;
        gameData.options = validOptions;
        showValidationResult('✅ Archivo válido! Puedes comenzar el juego', true);
        document.getElementById('game-options').classList.remove('hidden');
    };
    reader.readAsText(file);
}

function showValidationResult(message, isValid) {
    validationResult.textContent = message;
    validationResult.style.color = isValid ? 'green' : 'red';
}

function startGame() {
    gameData.displayTime = parseInt(displayTime.value) || 500;
    gameData.score = 0;
    gameData.currentStep = 0;
    
    generatorScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    updateScore();
    displayOperation();
}

function backToGenerator() {
    gameScreen.classList.add('hidden');
    generatorScreen.classList.remove('hidden');
}

function displayOperation() {
    const operationParts = gameData.operation.split(',');
    let currentDisplay = '';
    let step = 0;
    
    operationDisplay.textContent = '';
    
    const interval = setInterval(() => {
        if (step < operationParts.length) {
            currentDisplay += (step > 0 ? ' ' : '') + operationParts[step];
            operationDisplay.textContent = currentDisplay;
            step++;
        } else {
            clearInterval(interval);
            setTimeout(showOptions, 1000);
        }
    }, gameData.displayTime);
}

function showOptions() {
    optionsContainer.innerHTML = '';
    
    // Mezclar las opciones para que no siempre estén en el mismo orden
    const shuffledOptions = [...gameData.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.addEventListener('click', () => checkAnswer(option.isCorrect, button));
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(isCorrect, button) {
    if (isCorrect) {
        button.classList.add('correct');
        gameData.score += 10;
        updateScore();
    } else {
        button.classList.add('incorrect');
        // Encontrar y marcar la respuesta correcta
        const correctOption = gameData.options.find(opt => opt.isCorrect);
        const buttons = optionsContainer.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.textContent === correctOption.text) {
                btn.classList.add('correct');
            }
        });
    }
    
    // Deshabilitar todos los botones después de responder
    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Pasar a la siguiente pregunta después de un retraso
    setTimeout(() => {
        gameData.currentStep++;
        if (gameData.currentStep < 5) { // Limitar a 5 preguntas por juego
            displayOperation();
        } else {
            operationDisplay.textContent = `¡Juego completado! Puntuación: ${gameData.score}`;
            optionsContainer.innerHTML = '';
        }
    }, 2000);
}

function updateScore() {
    scoreDisplay.textContent = `Puntuación: ${gameData.score}`;
}

// Crear archivo de ejemplo para descargar
document.addEventListener('DOMContentLoaded', () => {
    const exampleContent = `5,+3,*2,-1
10*
9
14
7`;
    
    const blob = new Blob([exampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const exampleLink = document.querySelector('.instructions a');
    exampleLink.href = url;
});