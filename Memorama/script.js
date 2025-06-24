document.addEventListener('DOMContentLoaded', function() {
    const gridSizeInput = document.getElementById('num-cards');
    const imageZipInput = document.getElementById('image-zip');
    const imageCountHint = document.getElementById('image-count-hint');
    
    // Actualizar el mensaje de cantidad de imágenes necesarias
    gridSizeInput.addEventListener('input', function() {
        const size = parseInt(this.value) || 4;
        if (size % 2 === 0) {
            const requiredImages = (size * size) / 2;
            imageCountHint.textContent = `Necesitarás ${requiredImages} imágenes diferentes (${requiredImages} pares)`;
            imageCountHint.style.display = 'block';
        } else {
            imageCountHint.style.display = 'none';
        }
    });
});

document.getElementById('memorama-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const gridSizeInput = document.getElementById('num-cards');
    const timeLimitInput = document.getElementById('time-limit');
    const imageZipInput = document.getElementById('image-zip');
    const fileError = document.getElementById('file-error');

    // Validación adicional de los campos numéricos
    const gridSize = Math.max(2, Math.min(16, parseInt(gridSizeInput.value) || 4));
    const timeLimit = Math.max(20, Math.min(999, parseInt(timeLimitInput.value) || 60));
    
    // Validar que el tamaño del grid sea par
    if (gridSize % 2 !== 0) {
        alert("El tamaño del grid debe ser un número par (ej. 2, 4, 6, etc.).");
        return;
    }

    // Validar el archivo ZIP
    const imageZip = imageZipInput.files[0];
    if (!imageZip || !imageZip.name.toLowerCase().endsWith('.zip')) {
        fileError.style.display = 'block';
        return;
    }
    fileError.style.display = 'none';

    // Descomprimir el archivo .zip
    const images = await unzipImages(imageZip);

    if (!images || images.length === 0) {
        alert("No se encontraron imágenes válidas en el archivo ZIP.");
        return;
    }

    // Calcular el número de imágenes necesarias
    const requiredPairs = (gridSize * gridSize) / 2;
    
    // Verificar si hay suficientes imágenes únicas
    if (images.length < requiredPairs) {
        alert(`Necesitas al menos ${requiredPairs} imágenes diferentes para un memorama de ${gridSize}x${gridSize}. Solo encontraste ${images.length} imágenes en el ZIP.`);
        return;
    }

    // Seleccionar las primeras N imágenes necesarias
    const selectedImages = images.slice(0, requiredPairs);
    
    // Generar el contenido del memorama
    const memoramaContent = generateMemoramaContent(gridSize, selectedImages, timeLimit);

    // Descargar el memorama como un archivo .zip
    downloadMemoramaZip(memoramaContent);
});

async function unzipImages(zipFile) {
    const images = [];
    const jsZip = new JSZip();

    try {
        const zipData = await jsZip.loadAsync(zipFile);

        // Recorrer los archivos en el .zip
        for (const [relativePath, file] of Object.entries(zipData.files)) {
            if (!file.dir && file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                // Convertir la imagen a una URL
                const blob = await file.async('blob');
                images.push({ name: file.name, blob });
            }
        }

        return images;
    } catch (error) {
        console.error("Error al descomprimir el archivo .zip:", error);
        return null;
    }
}

function generateMemoramaContent(gridSize, images, timeLimit) {
    const totalCards = gridSize * gridSize;

    // HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memorama</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        #memorama-grid {
            display: grid;
            gap: 10px;
            grid-template-columns: repeat(${gridSize}, 100px);
            margin: 20px auto;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Memorama</h1>
        <div id="instructions-display">
            Encuentra todos los pares de imágenes antes de que se acabe el tiempo!
        </div>
        <div id="memorama-grid"></div>
        <div id="timer">Tiempo restante: <span id="time-left">${timeLimit}</span> segundos</div>
        <button id="restart-button">Reiniciar Juego</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

    // CSS (usamos el mismo que ya tienes en styles.css)
    const cssContent = document.querySelector('link[href="styles.css"]') ? '' : `body {
    font-family: 'Arial', sans-serif;
    background-color: #e6f0ff;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.container {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 800px;
    width: 100%;
}

h1 {
    margin-bottom: 25px;
    color: #2c3e50;
    font-size: 28px;
    font-weight: bold;
}

#instructions-display {
    margin-bottom: 25px;
    font-style: italic;
    color: #7f8c8d;
    font-size: 14px;
    line-height: 1.5;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 5px;
    border: 1px solid #ecf0f1;
}

#memorama-grid {
    display: grid;
    gap: 15px;
    margin: 20px auto;
    justify-content: center;
}

.memorama-card {
    width: 100px;
    height: 100px;
    perspective: 1000px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.memorama-card:hover {
    transform: scale(1.05);
}

.memorama-card .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.5s;
}

.memorama-card.flipped .card-inner {
    transform: rotateY(180deg);
}

.memorama-card .card-front,
.memorama-card .card-back {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.memorama-card .card-front {
    background-color: #3498db;
    color: white;
    font-weight: bold;
}

.memorama-card .card-back {
    background-color: #ffffff;
    transform: rotateY(180deg);
    border: 2px solid #3498db;
}

.memorama-card img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px;
}

#timer {
    font-size: 1.2em;
    margin-top: 20px;
    color: #2c3e50;
    font-weight: bold;
}

#restart-button {
    margin-top: 20px;
    padding: 12px 25px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

#restart-button:hover {
    background-color: #2980b9;
}

.memorama-card.matched {
    opacity: 0.6;
    cursor: default;
}`;

    // JavaScript
    const jsContent = `
const images = ${JSON.stringify(images.map(img => img.name))};
const gridSize = ${gridSize};
const timeLimit = ${timeLimit};

const memoramaGrid = document.getElementById('memorama-grid');
const timerElement = document.getElementById('time-left');
const restartButton = document.getElementById('restart-button');

let flippedCards = [];
let matchedCards = [];
let timeLeft = timeLimit;
let timer;
let gameActive = true;

function createMemoramaGrid() {
    memoramaGrid.innerHTML = '';
    const cardPairs = [];
    
    for (let i = 0; i < images.length; i++) {
        cardPairs.push(images[i]);
        cardPairs.push(images[i]);
    }
    
    cardPairs.sort(() => Math.random() - 0.5);
    
    cardPairs.forEach((image, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memorama-card');
        cardElement.dataset.card = image;

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        const img = document.createElement('img');
        img.src = "images/" + image;
        img.alt = "Imagen del memorama";
        cardBack.appendChild(img);

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardElement.appendChild(cardInner);

        cardElement.addEventListener('click', flipCard);
        memoramaGrid.appendChild(cardElement);
    });
}

function flipCard() {
    if (!gameActive || flippedCards.length >= 2 || 
        flippedCards.includes(this) || 
        matchedCards.includes(this)) {
        return;
    }

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.card === card2.dataset.card) {
        matchedCards.push(card1, card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = [];

        if (matchedCards.length === gridSize * gridSize) {
            endGame(true);
        }
    } else {
        gameActive = false;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            gameActive = true;
        }, 1000);
    }
}

function endGame(win) {
    clearInterval(timer);
    gameActive = false;
    if (win) {
        alert("¡Felicidades! Has encontrado todos los pares.");
    } else {
        alert("¡Se acabó el tiempo! Inténtalo de nuevo.");
    }
    restartButton.style.display = 'inline-block';
}

function startTimer() {
    timerElement.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function restartGame() {
    timeLeft = timeLimit;
    flippedCards = [];
    matchedCards = [];
    gameActive = true;
    timerElement.textContent = timeLeft;
    restartButton.style.display = 'none';
    clearInterval(timer);
    createMemoramaGrid();
    startTimer();
}

createMemoramaGrid();
startTimer();

restartButton.addEventListener('click', restartGame);
`;

    return {
        html: htmlContent,
        css: cssContent,
        js: jsContent,
        images: images,
    };
}

async function downloadMemoramaZip(memoramaContent) {
    const zip = new JSZip();

    // Agregar archivos al .zip
    zip.file("index.html", memoramaContent.html);
    zip.file("styles.css", memoramaContent.css);
    zip.file("script.js", memoramaContent.js);

    const imagesFolder = zip.folder("images");
    memoramaContent.images.forEach((img) => {
        imagesFolder.file(img.name, img.blob);
    });

    // Generar el archivo .zip
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "memorama.zip");
}