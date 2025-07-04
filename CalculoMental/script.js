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