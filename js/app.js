/* ================================================
   ANHQVdle — Controlador principal
   ================================================ */

function showPanel(name) {
  document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('panel-' + name).classList.add('active');

  const navOrder = ['home', 'classic', 'quote'];
  const idx = navOrder.indexOf(name);
  if (idx >= 0) document.querySelectorAll('.nav-btn:not(.nav-soon)')[idx].classList.add('active');

  document.querySelectorAll('.autocomplete').forEach(a => a.style.display = 'none');

  if (name === 'classic' && !classicTarget) initClassic();
  if (name === 'quote'   && !quoteTarget)   initQuote();
}

function restartMode(mode) {
  if (mode === 'classic') initClassic();
  if (mode === 'quote')   initQuote();
}
