(() => {
  const questions = window.ASSESSMENT_QUESTIONS;
  let current = 0;
  const answers = {};
  const visited = new Set([1]);
  const marked = new Set();
  const content = document.getElementById('question-content');
  const num = document.getElementById('question-num');
  const grid = document.getElementById('question-grid');
  const questionPalette = document.querySelector('.palette-questions');
  const questionCard = document.getElementById('question-card');
  const scrollTopButton = document.getElementById('scroll-top');
  const scrollBottomButton = document.getElementById('scroll-bottom');

  function updateScrollControls() {
    const canScroll = questionCard.scrollHeight > questionCard.clientHeight + 1;
    scrollTopButton.classList.toggle('visible', canScroll && questionCard.scrollTop > 1);
    scrollBottomButton.classList.toggle('visible', canScroll && questionCard.scrollTop < questionCard.scrollHeight - questionCard.clientHeight - 1);
  }

  function state(qid) {
    if (marked.has(qid) && answers[qid] !== undefined) return 'answered-marked-review';
    if (marked.has(qid)) return 'marked';
    if (answers[qid] !== undefined) return 'answered';
    if (visited.has(qid)) return 'not-answered';
    return 'not-visited';
  }
  function renderGrid() {
    grid.innerHTML = '';
    // Mirror the assessment palette behavior: selecting the first question in a new row
    // nudges the grid upward so the preceding row remains in view above the active question.
    grid.classList.toggle('row-shifted', current > 0 && current % 4 === 0);
    questions.forEach((q, i) => {
      const b = document.createElement('button'); b.textContent = q.id; b.className = state(q.id) + (i === current ? ' current' : '');
      b.onclick = () => { current = i; visited.add(q.id); render(); };
      grid.appendChild(b);
    });
  }
  function render() {
    const q = questions[current];
    num.textContent = q.id;
    questionCard.scrollTop = 0;
    content.innerHTML = `<div class="question-body"><p>${q.text}</p><div class="question-options">${q.options.map((o, i) => `<label><input type="radio" name="option" value="${i}" ${answers[q.id] === i ? 'checked' : ''}><span>${String.fromCharCode(65+i)}. ${o}</span></label>`).join('')}</div></div>`;
    content.querySelectorAll('input').forEach(el => el.onchange = () => { answers[q.id] = Number(el.value); renderGrid(); });
    renderGrid();
    requestAnimationFrame(() => {
      updateScrollControls();
      const activeQuestion = grid.querySelector('.current');
      if (!activeQuestion) return;

      // Each palette row holds four questions. Reposition the palette only
      // when the first item in a new row is selected (5, 9, 13, ...). Clicking
      // 6–8, 10–12, and other non-first items keeps the palette where it is.
      if (current === 0) {
        questionPalette.scrollTop = 0;
      } else if (current % 4 === 0) {
        questionPalette.scrollTop = Math.max(0, activeQuestion.offsetTop - (activeQuestion.offsetHeight / 2));
      }
    });
  }
  function next() { if (current < questions.length - 1) { current++; visited.add(questions[current].id); render(); } }
  document.getElementById('save-next').onclick = next;
  document.getElementById('review-next').onclick = () => { marked.add(questions[current].id); next(); };
  document.getElementById('previous').onclick = () => { if (current > 0) { current--; render(); } };
  document.getElementById('clear').onclick = () => { delete answers[questions[current].id]; marked.delete(questions[current].id); render(); };
  const assessmentPage = document.querySelector('.assessment-page');
  const paletteToggle = document.getElementById('palette-toggle');
  paletteToggle.onclick = () => {
    const collapsed = assessmentPage.classList.toggle('palette-collapsed');
    paletteToggle.setAttribute('aria-expanded', String(!collapsed));
    paletteToggle.setAttribute('aria-label', collapsed ? 'Show question palette' : 'Collapse question palette');
    requestAnimationFrame(updateScrollControls);
  };
  document.getElementById('scroll-top').onclick = () => questionCard.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('scroll-bottom').onclick = () => questionCard.scrollTo({ top: questionCard.scrollHeight, behavior: 'smooth' });
  questionCard.addEventListener('scroll', updateScrollControls);
  window.addEventListener('resize', updateScrollControls);
  document.getElementById('proceed').onclick = async () => {
    document.getElementById('start-overlay').classList.add('hidden');

    // Fullscreen can only be requested directly from a user action. Browsers
    // may reject it due to user settings or permissions, so the assessment
    // remains usable in its normal window if the request is unavailable.
    const root = document.documentElement;
    try {
      if (!document.fullscreenElement && root.requestFullscreen) {
        await root.requestFullscreen();
      }
    } catch (_) {
      // Continue in the current browser window when fullscreen is blocked.
    }
    assessmentStarted = true;
  };
  const fullscreenWarning = document.getElementById('fullscreen-warning');
  const fullscreenError = document.getElementById('fullscreen-error');
  const fullscreenCountdown = document.getElementById('fullscreen-countdown');
  let fullscreenTimer = null;
  let secondsRemaining = 10;
  let assessmentStarted = false;

  function clearFullscreenWarning() {
    if (fullscreenTimer) clearInterval(fullscreenTimer);
    fullscreenTimer = null;
    fullscreenWarning.classList.add('hidden');
  }

  function showFullscreenError() {
    clearFullscreenWarning();
    fullscreenError.classList.remove('hidden');
  }

  function showFullscreenWarning() {
    if (!assessmentStarted || fullscreenError.classList.contains('hidden') === false || fullscreenTimer) return;
    secondsRemaining = 10;
    fullscreenCountdown.textContent = secondsRemaining;
    fullscreenWarning.classList.remove('hidden');
    fullscreenTimer = setInterval(() => {
      secondsRemaining -= 1;
      fullscreenCountdown.textContent = secondsRemaining;
      if (secondsRemaining <= 0) showFullscreenError();
    }, 1000);
  }

  document.addEventListener('fullscreenchange', () => {
    if (!assessmentStarted) return;
    if (document.fullscreenElement) clearFullscreenWarning();
    else showFullscreenWarning();
  });

  document.getElementById('resume-fullscreen').onclick = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (_) {
      // Keep the warning visible and allow the countdown to continue.
    }
  };

  document.getElementById('paper-open').onclick = () => document.getElementById('paper-modal').classList.remove('hidden');
  document.getElementById('instruction-open').onclick = () => document.getElementById('instructions-modal').classList.remove('hidden');
  document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => b.closest('.modal-backdrop').classList.add('hidden'));
  document.getElementById('submit').onclick = async () => {
    const response = await fetch('/api/submit', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({answers})});
    const result = await response.json();
    alert(`${result.message}\nAnswered questions: ${result.answered}`);
  };
  render();
  requestAnimationFrame(updateScrollControls);
})();
