'use strict';

const SIGMA = 5.670374419e-8;
const WATER_EMISSIVITY = 0.96;

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
const themeIcon = document.querySelector('.theme-icon');
const progressFill = document.getElementById('reading-progress-fill');
const body = document.body;

// Menu com fechamento após navegação e suporte integral a teclado.
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

// Tema noturno é a identidade padrão. O botão oferece apenas uma variação de luz.
if (themeToggle) {
  themeToggle.setAttribute('aria-pressed', 'true');
  if (themeLabel) themeLabel.textContent = 'MODO NOTURNO ATIVO';
  if (themeIcon) themeIcon.textContent = '☾';
  themeToggle.addEventListener('click', () => {
    const enabled = body.classList.toggle('night-mode');
    themeToggle.setAttribute('aria-pressed', String(enabled));
    if (themeLabel) themeLabel.textContent = enabled ? 'MODO NOTURNO ATIVO' : 'MODO AZUL';
    if (themeIcon) themeIcon.textContent = enabled ? '☾' : '☼';
  });
}

// Barra de leitura.
function updateReadingProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}
window.addEventListener('scroll', updateReadingProgress, { passive: true });
updateReadingProgress();

// Animações de entrada sem bloquear a leitura quando IntersectionObserver não existe.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Ajustes de acessibilidade locais, sem armazenamento de preferências pessoais.
const accessibilityStatus = document.getElementById('accessibility-status');
const fontDecrease = document.getElementById('font-decrease');
const fontIncrease = document.getElementById('font-increase');
const readingFontToggle = document.getElementById('reading-font-toggle');
const contrastToggle = document.getElementById('contrast-toggle');
const motionToggle = document.getElementById('motion-toggle');
const vlibrasShortcut = document.getElementById('vlibras-shortcut');
let fontLevel = 0;
function announceAccessibility(message) {
  if (accessibilityStatus) accessibilityStatus.textContent = message;
}
function applyFontLevel() {
  body.classList.remove('font-large', 'font-xlarge');
  if (fontLevel === 1) body.classList.add('font-large');
  if (fontLevel === 2) body.classList.add('font-xlarge');
  announceAccessibility(fontLevel === 0 ? 'Tamanho de texto padrão.' : `Tamanho de texto ampliado: nível ${fontLevel + 1}.`);
}
if (fontDecrease) fontDecrease.addEventListener('click', () => { fontLevel = Math.max(0, fontLevel - 1); applyFontLevel(); });
if (fontIncrease) fontIncrease.addEventListener('click', () => { fontLevel = Math.min(2, fontLevel + 1); applyFontLevel(); });
if (readingFontToggle) readingFontToggle.addEventListener('click', () => {
  const enabled = body.classList.toggle('reading-font');
  readingFontToggle.setAttribute('aria-pressed', String(enabled));
  announceAccessibility(enabled ? 'Fonte alternativa Atkinson Hyperlegible ativada.' : 'Fonte original restaurada.');
});
if (contrastToggle) contrastToggle.addEventListener('click', () => {
  const enabled = body.classList.toggle('high-contrast');
  contrastToggle.setAttribute('aria-pressed', String(enabled));
  announceAccessibility(enabled ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
});
if (motionToggle) motionToggle.addEventListener('click', () => {
  const enabled = body.classList.toggle('motion-paused');
  motionToggle.setAttribute('aria-pressed', String(enabled));
  motionToggle.textContent = enabled ? 'Retomar animações' : 'Pausar animações';
  announceAccessibility(enabled ? 'Animações pausadas.' : 'Animações retomadas.');
});
if (vlibrasShortcut) vlibrasShortcut.addEventListener('click', () => {
  const widgetButton = document.querySelector('[vw-access-button]');
  if (widgetButton) { widgetButton.click(); announceAccessibility('Atalho do VLibras acionado.'); }
  else announceAccessibility('O VLibras ainda está carregando. Confira sua conexão ou use o link oficial na seção de acessibilidade.');
});

// O script oficial do VLibras é carregado no HTML e se inicializa automaticamente.
// O atalho desta página apenas aciona o botão do widget, sem criar uma segunda instância.

// Simulador de troca radiativa líquida pela lei de Stefan–Boltzmann.
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
const formatNumber = (value, digits = 2) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
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
  if (resultHours) resultHours.textContent = `${hours} h`;
  if (fluxOutput) fluxOutput.textContent = formatNumber(Math.abs(flux));
  if (powerOutput) powerOutput.textContent = `${formatNumber(Math.abs(powerW) / 1000)} kW`;
  if (energyOutput) energyOutput.textContent = `${formatNumber(Math.abs(energyKWh))} kWh`;
  if (isLoss) {
    resultDirection.textContent = 'PERDA LÍQUIDA POR RADIAÇÃO';
    resultExplanation.textContent = 'Neste cenário, a água está radiativamente mais quente que o entorno. A troca líquida favorece a saída de energia da superfície.';
  } else if (isGain) {
    resultDirection.textContent = 'GANHO LÍQUIDO POR RADIAÇÃO';
    resultExplanation.textContent = 'Neste cenário, o entorno está radiativamente mais quente que a água. A troca líquida favorece a entrada de energia na superfície.';
  } else {
    resultDirection.textContent = 'EQUILÍBRIO RADIATIVO APROXIMADO';
    resultExplanation.textContent = 'As temperaturas são praticamente iguais no modelo. A troca radiativa líquida fica próxima de zero, embora evaporação, convecção e condução continuem acontecendo.';
  }
}
[waterTemp, skyTemp, poolArea, hoursInput].forEach((control) => { if (control) control.addEventListener('input', updateSimulation); });
updateSimulation();

// Comparador didático de cobertura. O percentual é uma hipótese de redução
// da evaporação selecionada pelo visitante, não uma previsão de economia total.
const coverReduction = document.getElementById('cover-reduction');
const coverReductionValue = document.getElementById('cover-reduction-value');
const coverRemaining = document.getElementById('cover-remaining');
const coverCoveredBar = document.getElementById('cover-covered-bar');
const coverRemainingLabel = document.getElementById('cover-remaining-label');
function updateCoverComparison() {
  if (!coverReduction) return;
  const reduction = Number(coverReduction.value);
  const remaining = 100 - reduction;
  coverReductionValue.textContent = `${reduction}%`;
  coverRemaining.textContent = String(remaining);
  coverCoveredBar.style.width = `${remaining}%`;
  coverRemainingLabel.textContent = `${remaining}% do índice inicial permanece`;
}
if (coverReduction) coverReduction.addEventListener('input', updateCoverComparison);
updateCoverComparison();

// Seletor de tecnologia solar acessível por mouse ou teclado.
const technologyButtons = document.querySelectorAll('[data-tech-target]');
const technologyPanels = document.querySelectorAll('[data-tech-panel]');
technologyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.techTarget;
    technologyButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    technologyPanels.forEach((panel) => { panel.hidden = panel.dataset.techPanel !== target; });
  });
});

// Copiar fórmula.
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

// Quiz atualizado para incluir as novas conexões de Física e sustentabilidade.
const quizQuestions = [
  { question: 'Por que uma piscina aquecida emite radiação infravermelha?', options: ['A. Porque a água está fervendo', 'B. Porque matéria acima do zero absoluto emite radiação térmica', 'C. Porque o vento produz luz'], answer: 'b', explanation: 'Correto. A emissão térmica acontece em qualquer corpo acima do zero absoluto; na temperatura da piscina, predomina o infravermelho.' },
  { question: 'Como a temperatura afeta a emissão térmica?', options: ['A. A emissão total aumenta fortemente com a temperatura absoluta', 'B. A emissão sempre diminui', 'C. A temperatura não interfere'], answer: 'a', explanation: 'Isso! Para um emissor ideal, a potência emitida por área é proporcional a T⁴, e o pico espectral desloca-se para comprimentos de onda menores.' },
  { question: 'Por que a piscina ainda perde calor sem vento?', options: ['A. Só existe perda quando venta', 'B. A água deixa de evaporar', 'C. Radiação, evaporação e convecção natural continuam possíveis'], answer: 'c', explanation: 'Exatamente. O vento intensifica certas trocas, mas não é necessário para que haja radiação, evaporação ou convecção natural.' },
  { question: 'O que uma capa térmica reduz de forma especialmente importante?', options: ['A. Evaporação e parte das trocas radiativas', 'B. Toda forma de transferência de calor', 'C. A gravidade sobre a água'], answer: 'a', explanation: 'Certo. A capa dificulta a evaporação e pode diminuir a troca radiativa noturna, mas não elimina todas as perdas.' },
  { question: 'Qual é a diferença central entre coletor térmico e painel fotovoltaico?', options: ['A. Os dois só produzem vapor', 'B. O coletor entrega calor; o fotovoltaico entrega eletricidade', 'C. O fotovoltaico aquece a água diretamente'], answer: 'b', explanation: 'Perfeito. Coletor térmico converte radiação em calor. Células fotovoltaicas convertem energia luminosa em energia elétrica.' }
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
  if (!quizQuestion || !quizOptions || !quizNext) return;
  const question = quizQuestions[currentQuestion];
  answered = false;
  quizProgressText.textContent = `QUESTÃO ${String(currentQuestion + 1).padStart(2, '0')} / ${String(quizQuestions.length).padStart(2, '0')}`;
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
      quizQuestion.focus?.();
      return;
    }
    quizContent.hidden = true;
    quizFinal.hidden = false;
    quizScore.textContent = `${correctAnswers}/${quizQuestions.length}`;
    if (correctAnswers === quizQuestions.length) quizResultText.textContent = 'Excelente! Você conectou radiação, transferência de calor e tecnologias solares.';
    else if (correctAnswers >= 3) quizResultText.textContent = 'Muito bem! Revise as explicações das questões que errou e tente novamente.';
    else quizResultText.textContent = 'Vale revisar as seções de respostas, cobertura e aplicações solares. Depois, tente novamente!';
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
