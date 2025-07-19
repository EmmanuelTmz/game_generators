// Inicialización de Blockly
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  trashcan: true,
  grid: {
    spacing: 20,
    length: 3,
    colour: '#ccc',
    snap: true
  }
});

// Generador de problemas aleatorios
const problemGenerator = {
  currentProblem: null,
  difficulty: 'medium',
  
  problems: {
    easy: [
      {
        title: "Suma de dos números",
        description: "Crea una función que reciba dos números y devuelva su suma.",
        solution: function(a, b) { return a + b; },
        generateTestCase: () => {
          const a = Math.floor(Math.random() * 10);
          const b = Math.floor(Math.random() * 10);
          return { input: [a, b], expected: a + b };
        },
        testCases: 3
      },
      {
        title: "Número par o impar",
        description: "Crea una función que determine si un número es par. Devuelve true si es par, false si es impar.",
        solution: function(num) { return num % 2 === 0; },
        generateTestCase: () => {
          const num = Math.floor(Math.random() * 20);
          return { input: [num], expected: num % 2 === 0 };
        },
        testCases: 3
      },
      {
        title: "Concatenar texto",
        description: "Crea una función que reciba dos textos y los una (concatene) en uno solo.",
        solution: function(text1, text2) { return text1 + text2; },
        generateTestCase: () => {
          const texts = ["Hola ", "Mundo", "Blockly ", "es ", "genial"];
          const index1 = Math.floor(Math.random() * (texts.length - 1));
          const index2 = Math.floor(Math.random() * (texts.length - 1)) + 1;
          return { input: [texts[index1], texts[index2]], expected: texts[index1] + texts[index2] };
        },
        testCases: 3
      }
    ],
    medium: [
      {
        title: "Factorial de un número",
        description: "Crea una función que calcule el factorial de un número entero positivo.",
        solution: function(n) {
          let result = 1;
          for (let i = 2; i <= n; i++) result *= i;
          return result;
        },
        generateTestCase: () => {
          const n = Math.floor(Math.random() * 6) + 1; // 1-6
          let expected = 1;
          for (let i = 2; i <= n; i++) expected *= i;
          return { input: [n], expected };
        },
        testCases: 3
      },
      {
        title: "Fibonacci",
        description: "Crea una función que devuelva el n-ésimo número en la secuencia de Fibonacci.",
        solution: function(n) {
          let a = 0, b = 1;
          for (let i = 2; i <= n; i++) {
            const temp = a + b;
            a = b;
            b = temp;
          }
          return n === 0 ? a : b;
        },
        generateTestCase: () => {
          const n = Math.floor(Math.random() * 8); // 0-7
          let expected, a = 0, b = 1;
          for (let i = 2; i <= n; i++) {
            const temp = a + b;
            a = b;
            b = temp;
          }
          expected = n === 0 ? a : b;
          return { input: [n], expected };
        },
        testCases: 3
      },
      {
        title: "Longitud de texto",
        description: "Crea una función que reciba un texto y devuelva su longitud.",
        solution: function(text) { return text.length; },
        generateTestCase: () => {
          const texts = ["Hola", "Blockly", "JavaScript", "Programación", "Web"];
          const text = texts[Math.floor(Math.random() * texts.length)];
          return { input: [text], expected: text.length };
        },
        testCases: 3
      }
    ],
    hard: [
      {
        title: "Palíndromo",
        description: "Crea una función que determine si una palabra es un palíndromo (se lee igual al derecho y al revés).",
        solution: function(word) {
          const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
          return cleaned === cleaned.split('').reverse().join('');
        },
        generateTestCase: () => {
          const palindromes = ["anilina", "reconocer", "oso"];
          const nonPalindromes = ["casa", "programacion", "computadora"];
          
          if (Math.random() > 0.5) {
            const word = palindromes[Math.floor(Math.random() * palindromes.length)];
            return { input: [word], expected: true };
          } else {
            const word = nonPalindromes[Math.floor(Math.random() * nonPalindromes.length)];
            return { input: [word], expected: false };
          }
        },
        testCases: 4
      },
      {
        title: "Ordenamiento",
        description: "Crea una función que ordene un array de números de menor a mayor.",
        solution: function(arr) {
          return arr.slice().sort((a, b) => a - b);
        },
        generateTestCase: () => {
          const length = Math.floor(Math.random() * 5) + 3; // 3-7
          const arr = Array.from({length}, () => Math.floor(Math.random() * 100));
          const expected = arr.slice().sort((a, b) => a - b);
          return { input: [arr], expected };
        },
        testCases: 3
      },
      {
        title: "Suma de lista",
        description: "Crea una función que reciba una lista de números y devuelva la suma de todos sus elementos.",
        solution: function(arr) {
          return arr.reduce((sum, num) => sum + num, 0);
        },
        generateTestCase: () => {
          const length = Math.floor(Math.random() * 5) + 3; // 3-7
          const arr = Array.from({length}, () => Math.floor(Math.random() * 10));
          const expected = arr.reduce((sum, num) => sum + num, 0);
          return { input: [arr], expected };
        },
        testCases: 3
      }
    ]
  },
  
  generateNewProblem: function() {
    this.difficulty = document.getElementById('difficulty').value;
    const problems = this.problems[this.difficulty];
    this.currentProblem = problems[Math.floor(Math.random() * problems.length)];
    
    this.displayProblem();
  },
  
  displayProblem: function() {
    const problemDesc = document.getElementById('problemDescription');
    const testCasesDiv = document.getElementById('testCases');
    
    problemDesc.innerHTML = `
      <h3>${this.currentProblem.title}</h3>
      <p>${this.currentProblem.description}</p>
    `;
    
    testCasesDiv.innerHTML = '<h4>Casos de prueba:</h4>';
    for (let i = 0; i < this.currentProblem.testCases; i++) {
      const testCase = this.currentProblem.generateTestCase();
      const testCaseDiv = document.createElement('div');
      testCaseDiv.className = 'test-case';
      testCaseDiv.innerHTML = `
        <p><strong>Entrada:</strong> ${JSON.stringify(testCase.input)}</p>
        <p><strong>Salida esperada:</strong> ${JSON.stringify(testCase.expected)}</p>
      `;
      testCasesDiv.appendChild(testCaseDiv);
    }
  }
};

// Función para descargar el proyecto
function downloadProject() {
  const workspaceXml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToPrettyText(workspaceXml);
  
  const blob = new Blob([xmlText], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'blockly_proyecto.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Manejadores de eventos
document.getElementById('newChallenge').addEventListener('click', () => {
  problemGenerator.generateNewProblem();
});

document.getElementById('runCode').addEventListener('click', () => {
  if (!problemGenerator.currentProblem) {
    alert('Primero genera un problema');
    return;
  }
  
  try {
    const userCode = Blockly.JavaScript.workspaceToCode(workspace);
    const resultDiv = document.getElementById('executionResult');
    resultDiv.innerHTML = '';
    
    // Crear función del usuario
    const userFunction = new Function(userCode + `\nreturn solve;`)();
    
    // Probar con los casos de prueba
    let allTestsPassed = true;
    for (let i = 0; i < problemGenerator.currentProblem.testCases; i++) {
      const testCase = problemGenerator.currentProblem.generateTestCase();
      const testResult = userFunction(...testCase.input);
      
      const isEqual = JSON.stringify(testResult) === JSON.stringify(testCase.expected);
      
      const testResultDiv = document.createElement('div');
      testResultDiv.innerHTML = `
        <p><strong>Prueba ${i + 1}:</strong></p>
        <p>Entrada: ${JSON.stringify(testCase.input)}</p>
        <p>Esperado: ${JSON.stringify(testCase.expected)}</p>
        <p>Obtenido: ${JSON.stringify(testResult)}</p>
        <p class="${isEqual ? 'success' : 'error'}">
          ${isEqual ? '✓ Correcto' : '✗ Incorrecto'}
        </p>
      `;
      resultDiv.appendChild(testResultDiv);
      
      if (!isEqual) allTestsPassed = false;
    }
    
    if (allTestsPassed) {
      const successDiv = document.createElement('div');
      successDiv.className = 'success';
      successDiv.innerHTML = '<h3>¡Todos los tests pasaron correctamente!</h3>';
      resultDiv.prepend(successDiv);
    }
  } catch (error) {
    document.getElementById('executionResult').innerHTML = `
      <div class="error">
        <h3>Error en la ejecución:</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
});

document.getElementById('downloadProject').addEventListener('click', downloadProject);

// Generar primer problema al cargar
window.addEventListener('load', () => {
  problemGenerator.generateNewProblem();
});