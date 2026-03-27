/* ================================================
   ANHQVdle — Tutorial primera vez
   ================================================ */

function showTutorial() {
  document.getElementById('tutorial-modal').classList.add('active');
}

function hideTutorial() {
  const modal = document.getElementById('tutorial-modal');
  modal.classList.remove('active');
  localStorage.setItem(modal.dataset.key, '1');
}

function initTutorial(key) {
  if (!localStorage.getItem(key)) showTutorial();
}
