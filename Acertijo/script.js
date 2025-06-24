document.addEventListener('DOMContentLoaded', function() {
    // Contador de caracteres para la pregunta
    const questionTextarea = document.getElementById('question');
    const questionCounter = document.getElementById('question-counter');
    
    questionTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        questionCounter.textContent = currentLength;
        
        if (currentLength > 500) {
            this.value = this.value.substring(0, 500);
            questionCounter.textContent = 500;
        }
    });

    // Validar el formato de la pregunta mientras se escribe
    questionTextarea.addEventListener('input', function() {
        const value = this.value;
        // Expresión regular que permite letras, números, espacios, signos de puntuación básicos y acentos
        const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s¿?¡!.,;:]+$/;
        
        if (value && !regex.test(value)) {
            // Eliminar caracteres no permitidos
            this.value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s¿?¡!.,;:]/g, '');
            document.getElementById('error-message').textContent = 'Solo se permiten letras, números, espacios y signos de puntuación básicos.';
        } else {
            document.getElementById('error-message').textContent = '';
        }
    });

    // Configuración para los campos de respuesta (correcta e incorrectas)
    setupAnswerField('correct-answer-text', 'correct-answer-image', 'correct-answer-file-info');
    setupAnswerField('wrong-answer1-text', 'wrong-answer1-image', 'wrong-answer1-file-info');
    setupAnswerField('wrong-answer2-text', 'wrong-answer2-image', 'wrong-answer2-file-info');

    // Evento para generar el acertijo
    document.getElementById('generate').addEventListener('click', async function() {
        const question = document.getElementById('question').value;
        const correctAnswerText = document.getElementById('correct-answer-text').value;
        const correctAnswerImage = document.getElementById('correct-answer-image').files[0];
        const wrongAnswer1Text = document.getElementById('wrong-answer1-text').value;
        const wrongAnswer1Image = document.getElementById('wrong-answer1-image').files[0];
        const wrongAnswer2Text = document.getElementById('wrong-answer2-text').value;
        const wrongAnswer2Image = document.getElementById('wrong-answer2-image').files[0];
        
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = '';

        // Validaciones
        if (!question) {
            errorMessage.textContent = 'Por favor, ingresa una pregunta.';
            return;
        }

        // Validar formato de la pregunta
        const questionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s¿?¡!.,;:]+$/;
        if (!questionRegex.test(question)) {
            errorMessage.textContent = 'La pregunta contiene caracteres no permitidos. Solo se permiten letras, números, espacios y signos de puntuación básicos.';
            return;
        }

        if (!validateAnswer(correctAnswerText, correctAnswerImage, 'Respuesta Correcta')) return;
        if (!validateAnswer(wrongAnswer1Text, wrongAnswer1Image, 'Respuesta Incorrecta 1')) return;
        if (!validateAnswer(wrongAnswer2Text, wrongAnswer2Image, 'Respuesta Incorrecta 2')) return;

        // Crear un nuevo archivo ZIP
        const zip = new JSZip();

        // Generar el contenido del archivo HTML
        const htmlContent = generateHTMLContent(
            question,
            correctAnswerText, correctAnswerImage,
            wrongAnswer1Text, wrongAnswer1Image,
            wrongAnswer2Text, wrongAnswer2Image
        );
        zip.file("index.html", htmlContent);

        // Generar el contenido del archivo CSS
        const cssContent = `
body {
    font-family: Arial, sans-serif;
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
    max-width: 600px;
    width: 100%;
}

h1 {
    margin-bottom: 25px;
    color: #2c3e50;
    font-size: 28px;
    font-weight: bold;
}

#riddle-display {
    margin-top: 20px;
}

#answers {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.answer-option {
    flex: 1;
    padding: 15px;
    border: 1px solid #bdc3c7;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
    background-color: #f9f9f9;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.answer-option:hover {
    background-color: #e6f3ff;
    border-color: #3498db;
}

.answer-option img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
}

.answer-option p {
    margin: 0;
    font-size: 16px;
    color: #2c3e50;
}

#result-message {
    margin-top: 20px;
    font-weight: bold;
    color: #2c3e50;
}
        `;
        zip.file("style.css", cssContent);

        // Generar el contenido del archivo JS
        const jsContent = `
document.querySelectorAll('.answer-option').forEach(option => {
    option.addEventListener('click', function() {
        if (option.getAttribute('data-correct') === 'true') {
            document.getElementById('result-message').innerText = '¡Respuesta correcta!';
            option.style.backgroundColor = '#d4edda';
            option.style.borderColor = '#28a745';
        } else {
            document.getElementById('result-message').innerText = 'Intenta nuevamente';
            option.style.backgroundColor = '#f8d7da';
            option.style.borderColor = '#dc3545';
        }
    });
});
        `;
        zip.file("script.js", jsContent);

        // Agregar imágenes al ZIP si se subieron
        try {
            if (correctAnswerImage) {
                if (!validateImageType(correctAnswerImage)) {
                    errorMessage.textContent = 'La imagen de la respuesta correcta debe ser JPG o PNG.';
                    return;
                }
                const imgData = await readFileAsArrayBuffer(correctAnswerImage);
                zip.file("correct-answer-image.jpg", imgData);
            }
            if (wrongAnswer1Image) {
                if (!validateImageType(wrongAnswer1Image)) {
                    errorMessage.textContent = 'La imagen de la respuesta incorrecta 1 debe ser JPG o PNG.';
                    return;
                }
                const imgData = await readFileAsArrayBuffer(wrongAnswer1Image);
                zip.file("wrong-answer1-image.jpg", imgData);
            }
            if (wrongAnswer2Image) {
                if (!validateImageType(wrongAnswer2Image)) {
                    errorMessage.textContent = 'La imagen de la respuesta incorrecta 2 debe ser JPG o PNG.';
                    return;
                }
                const imgData = await readFileAsArrayBuffer(wrongAnswer2Image);
                zip.file("wrong-answer2-image.jpg", imgData);
            }

            // Generar y descargar el archivo ZIP
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = "acertijo.zip";
            a.click();
            URL.revokeObjectURL(url);

            // Mostrar mensaje de éxito
            errorMessage.textContent = '';
            alert('Archivo ZIP generado y descargado correctamente.');
        } catch (error) {
            errorMessage.textContent = 'Error al procesar las imágenes: ' + error.message;
            console.error('Error al generar el ZIP:', error);
        }
    });
});

// Función para configurar los campos de respuesta
function setupAnswerField(textId, imageId, fileInfoId) {
    const textInput = document.getElementById(textId);
    const imageInput = document.getElementById(imageId);
    const fileInfo = document.getElementById(fileInfoId);

    // Mostrar nombre del archivo seleccionado
    imageInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileInfo.textContent = this.files[0].name;
            // Si se selecciona una imagen, limpiar el campo de texto
            textInput.value = '';
        } else {
            fileInfo.textContent = 'No se ha seleccionado ninguna imagen';
        }
    });

    // Si se escribe texto, limpiar la selección de imagen
    textInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            imageInput.value = '';
            fileInfo.textContent = 'No se ha seleccionado ninguna imagen';
        }
    });
}

// Función para validar una respuesta (texto o imagen)
function validateAnswer(text, image, fieldName) {
    const errorMessage = document.getElementById('error-message');
    
    if (!text && !image) {
        errorMessage.textContent = `Por favor, ingresa ${fieldName} como texto o imagen.`;
        return false;
    }
    
    if (text && image) {
        errorMessage.textContent = `Por favor, elige solo una opción (texto O imagen) para ${fieldName}.`;
        return false;
    }
    
    if (image && !validateImageType(image)) {
        errorMessage.textContent = `La imagen para ${fieldName} debe ser JPG o PNG.`;
        return false;
    }
    
    return true;
}

// Función para validar el tipo de imagen
function validateImageType(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(file.type);
}

// Función para generar el contenido HTML
function generateHTMLContent(question, correctText, correctImage, wrong1Text, wrong1Image, wrong2Text, wrong2Image) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acertijo Generado</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Acertijo</h1>
        <div id="riddle-display">
            <h2>${question}</h2>
            <div id="answers">
                <div class="answer-option" data-correct="true">
                    ${correctImage ? '<img src="correct-answer-image.jpg" alt="Respuesta Correcta">' : `<p>${correctText}</p>`}
                </div>
                <div class="answer-option" data-correct="false">
                    ${wrong1Image ? '<img src="wrong-answer1-image.jpg" alt="Respuesta Incorrecta 1">' : `<p>${wrong1Text}</p>`}
                </div>
                <div class="answer-option" data-correct="false">
                    ${wrong2Image ? '<img src="wrong-answer2-image.jpg" alt="Respuesta Incorrecta 2">' : `<p>${wrong2Text}</p>`}
                </div>
            </div>
            <p id="result-message"></p>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
    `;
}

// Función para leer un archivo como ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}