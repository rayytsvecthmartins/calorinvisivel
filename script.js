'use strict';

const SIGMA = 5.670374419e-8;
const WATER_EMISSIVITY = 0.96;

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
const themeIcon = document.querySelector('.theme-icon');
const progressFill = document.getElementById('reading-progress-fill');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    mainNav.classList.toggle('is-open', !isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('night-mode');
    themeToggle.setAttribute('aria-pressed', String(enabled));
    themeLabel.textContent = enabled ? 'MODO NOTURNO ATIVO' : 'MODO NOTURNO';
    themeIcon.textContent = enabled ? '☼' : '☾';
  });
}

function updateReadingProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });
updateReadingProgress();

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const waterTemp = document.getElementById('water-temp');
const skyTemp = document.getElementById('sky-temp');
const poolArea = document.getElementById('pool-area');
const hoursInput = document.getElementById('hours');
const waterTempValue = document.getElementById('water-temp-value');
const skyTempValue = document.getElementById('sky-temp-value');
const poolAreaValue = document.getElementById('pool-area-value');
const hoursValue = document.getElementById('hours-value');
const fluxOutput = document.getElementById('radiative-flux');
const powerOutput = document.getElementById('radiative-power');
const energyOutput = document.getElementById('radiative-energy');
const resultDirection = document.getElementById('result-direction');
const resultExplanation = document.getElementById('result-explanation');
const resultHours = document.getElementById('result-hours');

const formatNumber = (value, digits = 2) => value.toLocaleString('pt-BR', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
});

function updateSimulation() {
  if (!waterTemp || !skyTemp || !poolArea || !hoursInput) return;

  const waterC = Number(waterTemp.value);
  const surroundingsC = Number(skyTemp.value);
  const area = Number(poolArea.value);
  const hours = Number(hoursInput.value);
  const waterK = waterC + 273.15;
  const surroundingsK = surroundingsC + 273.15;

  const flux = WATER_EMISSIVITY * SIGMA * (waterK ** 4 - surroundingsK ** 4);
  const powerW = flux * area;
  const energyKWh = powerW * hours / 1000;
  const isLoss = flux > 0.05;
  const isGain = flux < -0.05;

  waterTempValue.textContent = `${waterC} °C`;
  skyTempValue.textContent = `${surroundingsC} °C`;
  poolAreaValue.textContent = `${area} m²`;
  hoursValue.textContent = `${hours} h`;
  resultHours.textContent = `${hours} h`;

  fluxOutput.textContent = formatNumber(Math.abs(flux));
  powerOutput.textContent = `${formatNumber(Math.abs(powerW) / 1000)} kW`;
  energyOutput.textContent = `${formatNumber(Math.abs(energyKWh))} kWh`;

  if (isLoss) {
    resultDirection.textContent = 'PERDA LÍQUIDA POR RADIAÇÃO';
    resultExplanation.textContent = 'Neste cenário, a água está radiativamente mais quente que o entorno. A troca líquida favorece a saída de energia da superfície.';
  } else if (isGain) {
    resultDirection.textContent = 'GANHO LÍQUIDO POR RADIAÇÃO';
    resultExplanation.textContent = 'Neste cenário, o entorno está radiativamente mais quente que a água. A troca líquida favorece a entrada de energia na superfície.';
  } else {
    resultDirection.textContent = 'EQUILÍBRIO RADIATIVO APROXIMADO';
    resultExplanation.textContent = 'As temperaturas são praticamente iguais no modelo. A troca radiativa líquida fica próxima de zero, embora os outros mecanismos continuem acontecendo.';
  }
}

[waterTemp, skyTemp, poolArea, hoursInput].forEach((control) => {
  if (control) control.addEventListener('input', updateSimulation);
});
updateSimulation();

const copyFormula = document.getElementById('copy-formula');
const copyStatus = document.getElementById('copy-status');
if (copyFormula && copyStatus) {
  copyFormula.addEventListener('click', async () => {
    const formulaText = 'q = ε · σ · (T_água⁴ − T_entorno⁴)';
    try {
      await navigator.clipboard.writeText(formulaText);
      copyStatus.textContent = 'Fórmula copiada!';
    } catch (error) {
      copyStatus.textContent = 'Selecione e copie a fórmula manualmente.';
    }
  });
}

const quizQuestions = [
  {
    question: 'Qual mecanismo costuma representar a maior parcela da perda de calor de uma piscina?',
    options: ['A. Condução pelo fundo', 'B. Evaporação da água', 'C. Radiação visível'],
    answer: 'b',
    explanation: 'Isso! A ASHRAE indica que a evaporação responde por cerca de 50% a 60% da perda de calor em muitos casos.'
  },
  {
    question: 'O que uma câmera térmica detecta ao observar a superfície de uma piscina?',
    options: ['A. Radiação infravermelha da superfície', 'B. A temperatura de toda a água até o fundo', 'C. Apenas a luz visível refletida'],
    answer: 'a',
    explanation: 'Correto. A câmera recebe radiação infravermelha da superfície e converte o sinal em uma imagem térmica.'
  },
  {
    question: 'Por que uma cobertura pode ajudar a conservar a energia da piscina?',
    options: ['A. Porque cria energia do nada', 'B. Porque impede toda troca de calor', 'C. Porque reduz evaporação e parte das trocas térmicas'],
    answer: 'c',
    explanation: 'Perfeito. A cobertura não elimina todas as perdas, mas reduz bastante a evaporação e pode diminuir a perda radiativa noturna.'
  }
];

const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');
const quizNext = document.getElementById('quiz-next');
const quizProgressText = document.getElementById('quiz-progress-text');
const quizProgressBar = document.getElementById('quiz-progress-bar');
const quizContent = document.getElementById('quiz-content');
const quizFinal = document.getElementById('quiz-final');
const quizScore = document.getElementById('quiz-score');
const quizResultText = document.getElementById('quiz-result-text');
const quizRestart = document.getElementById('quiz-restart');
let currentQuestion = 0;
let correctAnswers = 0;
let answered = false;

function renderQuestion() {
  if (!quizQuestion || !quizOptions) return;
  const question = quizQuestions[currentQuestion];
  answered = false;
  quizProgressText.textContent = `QUESTÃO 0${currentQuestion + 1} / 03`;
  quizProgressBar.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
  quizQuestion.textContent = question.question;
  quizFeedback.textContent = '';
  quizNext.disabled = true;
  quizNext.textContent = currentQuestion === quizQuestions.length - 1 ? 'VER RESULTADO' : 'PRÓXIMA QUESTÃO →';

  quizOptions.querySelectorAll('.quiz-option').forEach((button, index) => {
    button.textContent = question.options[index];
    button.dataset.answer = ['a', 'b', 'c'][index];
    button.disabled = false;
    button.classList.remove('correct', 'incorrect');
  });
}

if (quizOptions && quizNext) {
  quizOptions.addEventListener('click', (event) => {
    const selected = event.target.closest('.quiz-option');
    if (!selected || answered) return;

    const question = quizQuestions[currentQuestion];
    const isCorrect = selected.dataset.answer === question.answer;
    answered = true;
    if (isCorrect) correctAnswers += 1;

    quizOptions.querySelectorAll('.quiz-option').forEach((button) => {
      button.disabled = true;
      if (button.dataset.answer === question.answer) button.classList.add('correct');
    });
    if (!isCorrect) selected.classList.add('incorrect');
    quizFeedback.textContent = question.explanation;
    quizNext.disabled = false;
  });

  quizNext.addEventListener('click', () => {
    if (!answered) return;
    if (currentQuestion < quizQuestions.length - 1) {
      currentQuestion += 1;
      renderQuestion();
      return;
    }
    quizContent.hidden = true;
    quizFinal.hidden = false;
    quizScore.textContent = `${correctAnswers}/3`;
    if (correctAnswers === 3) {
      quizResultText.textContent = 'Excelente! Você entendeu os principais caminhos da energia térmica.';
    } else if (correctAnswers === 2) {
      quizResultText.textContent = 'Mandou bem! Revise os detalhes e você fecha o assunto.';
    } else {
      quizResultText.textContent = 'Vale revisar as seções sobre perda de calor e câmeras térmicas. Aí tente de novo!';
    }
  });
}

if (quizRestart) {
  quizRestart.addEventListener('click', () => {
    currentQuestion = 0;
    correctAnswers = 0;
    quizFinal.hidden = true;
    quizContent.hidden = false;
    renderQuestion();
  });
}

renderQuestion();

const printPage = document.getElementById('print-page');
if (printPage) printPage.addEventListener('click', () => window.print());
