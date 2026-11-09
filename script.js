document.addEventListener('DOMContentLoaded', () => {

  // 1. ASCII Background Generator
  const asciiContainer = document.getElementById('ascii-bg');
  const asciiChars = ['*', '+', '0', '1', 'X', '#', '.', ':', '⁕', '✦', '≈'];
  const rows = 45;
  const cols = 90;

  function generateASCIIField() {
    let output = '';
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.random() > 0.91) {
          const char = asciiChars[Math.floor(Math.random() * asciiChars.length)];
          output += char;
        } else {
          output += ' ';
        }
      }
      output += '\n';
    }
    asciiContainer.textContent = output;
  }
  generateASCIIField();
  setInterval(generateASCIIField, 450);

  // 2. Interactive Thermal Simulator
  const tempRange = document.getElementById('tempRange');
  const tempVal = document.getElementById('tempVal');
  const windRange = document.getElementById('windRange');
  const windVal = document.getElementById('windVal');
  const poolWater = document.getElementById('poolWater');
  const heatWaves = document.getElementById('heatWaves');
  const thermalReadout = document.getElementById('thermalReadout');
  const irFlux = document.getElementById('irFlux');
  const evapLoss = document.getElementById('evapLoss');
  const coverEff = document.getElementById('coverEff');

  function updateSimulation() {
    const temp = parseFloat(tempRange.value);
    const wind = parseFloat(windRange.value);

    tempVal.textContent = temp;
    windVal.textContent = wind;

    // Stefan-Boltzmann proportional calculation & Wind effect
    const baseIR = Math.round(Math.pow((temp + 273) / 300, 4) * 110);
    const evaporation = Math.round((temp * 8) + (wind * 6));
    const totalLoss = baseIR + evaporation;

    irFlux.textContent = `${baseIR} W/m²`;
    evapLoss.textContent = `${evaporation} W/m²`;
    coverEff.textContent = temp > 35 ? '65% (Alta Pressão)' : '80% (Bloqueio Total IR)';

    // Color shift for water
    const redChan = Math.floor(((temp - 10) / 35) * 140);
    const blueChan = Math.floor(190 - ((temp - 10) / 35) * 90);
    poolWater.style.background = `linear-gradient(180deg, rgb(${redChan + 20}, 119, 182) 0%, rgb(${redChan}, 4, ${blueChan}) 100%)`;

    heatWaves.style.opacity = 0.3 + (totalLoss / 800) * 0.7;
    heatWaves.style.animationDuration = `${Math.max(0.4, 1.8 - (wind / 25))}s`;

    if (totalLoss < 250) {
      thermalReadout.textContent = `PERDA TÉRMICA: BAIXA (${totalLoss} W/m²)`;
      thermalReadout.style.borderColor = '#00b4d8';
      thermalReadout.style.color = '#00b4d8';
    } else if (totalLoss < 450) {
      thermalReadout.textContent = `PERDA TÉRMICA: MODERADA (${totalLoss} W/m²)`;
      thermalReadout.style.borderColor = '#ff1e56';
      thermalReadout.style.color = '#ff1e56';
    } else {
      thermalReadout.textContent = `PERDA TÉRMICA: CRÍTICA (${totalLoss} W/m²)`;
      thermalReadout.style.borderColor = '#ff0000';
      thermalReadout.style.color = '#ff0000';
    }
  }

  tempRange.addEventListener('input', updateSimulation);
  windRange.addEventListener('input', updateSimulation);
  updateSimulation();

  // 3. Prism Click Curiosity
  const prismBox = document.getElementById('prismBox');
  prismBox.addEventListener('click', () => {
    alert('CURIOSIDADE CIENTÍFICA: William Herschel provou em 1800 que a luz solar não transporta apenas luminosidade, mas também energia invisível (calor). Este foi o marco inicial da espectroscopia no infravermelho!');
  });

  // 4. Interactive Quiz for 2nd Year High School
  const quizData = [
    {
      question: "Qual mecanismo é responsável pela maior porcentagem de perda de calor em uma piscina aberta?",
      options: [
        "A) Condução térmica direta com o solo",
        "B) Evaporação de massa de água na superfície",
        "C) Reflexão de raios ultravioleta",
        "D) Correntes de maré subterrâneas"
      ],
      correct: 1,
      explanation: "Correto! A evaporação responde por 50% a 70% das perdas térmicas devido ao calor latente de vaporização."
    },
    {
      question: "Na lei de Stefan-Boltzmann (E ∝ T^4), o que acontece com a emissão de radiação térmica se a temperatura absoluta duplicar?",
      options: [
        "A) Aumenta 2 vezes",
        "B) Aumenta 4 vezes",
        "C) Aumenta 16 vezes",
        "D) Permanece constante"
      ],
      correct: 2,
      explanation: "Exato! Como é proporcional à quarta potência (2^4 = 16), o aumento é de 16 vezes!"
    },
    {
      question: "Quem descobriu a radiação infravermelha no ano de 1800 usando um prisma e termômetros?",
      options: [
        "A) Isaac Newton",
        "B) Albert Einstein",
        "C) William Herschel",
        "D) James Clerk Maxwell"
      ],
      correct: 2,
      explanation: "Isso aí! William Herschel descobriu os raios caloríficos logo além da faixa vermelha do espectro visível."
    }
  ];

  let currentQuizIndex = 0;
  let score = 0;

  const quizQuestionEl = document.getElementById('quizQuestion');
  const quizOptionsEl = document.getElementById('quizOptions');
  const quizFeedbackEl = document.getElementById('quizFeedback');
  const nextQuizBtn = document.getElementById('nextQuizBtn');

  function loadQuizQuestion() {
    const q = quizData[currentQuizIndex];
    quizQuestionEl.textContent = `Questão ${currentQuizIndex + 1} de ${quizData.length}: ${q.question}`;
    quizOptionsEl.innerHTML = '';
    quizFeedbackEl.textContent = '';
    quizFeedbackEl.style.color = '#fff';
    nextQuizBtn.style.display = 'none';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectQuizOption(idx, q.correct, q.explanation));
      quizOptionsEl.appendChild(btn);
    });
  }

  function selectQuizOption(selectedIdx, correctIdx, explanation) {
    const optionButtons = quizOptionsEl.querySelectorAll('.quiz-option-btn');
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIdx) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('incorrect');
      }
    });

    if (selectedIdx === correctIdx) {
      quizFeedbackEl.textContent = "✔ Resposta Correta! " + explanation;
      quizFeedbackEl.style.color = "#10b981";
      score++;
    } else {
      quizFeedbackEl.textContent = "✘ Resposta Incorreta. " + explanation;
      quizFeedbackEl.style.color = "#ef4444";
    }

    nextQuizBtn.style.display = 'inline-block';
  }

  nextQuizBtn.addEventListener('click', () => {
    currentQuizIndex++;
    if (currentQuizIndex < quizData.length) {
      loadQuizQuestion();
    } else {
      quizQuestionEl.textContent = `Quiz Finalizado! Você acertou ${score} de ${quizData.length} questões.`;
      quizOptionsEl.innerHTML = '';
      quizFeedbackEl.textContent = "Parabéns por dominar a física térmica para a apresentação no Colégio Estadual do Paraná!";
      quizFeedbackEl.style.color = "#00b4d8";
      nextQuizBtn.style.display = 'none';
    }
  });

  loadQuizQuestion();
});
