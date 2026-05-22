/* ================================================
   ANHQVdle — Racha diaria
   ================================================ */

function updateStreak() {
  const pad = n => String(n).padStart(2, '0');
  const now  = new Date();
  const today = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;

  const prev = JSON.parse(localStorage.getItem('anhqvdle_streak') || '{"count":0,"lastDate":""}');
  if (prev.lastDate === today) return prev.count;

  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yesterStr = `${yest.getFullYear()}${pad(yest.getMonth()+1)}${pad(yest.getDate())}`;

  const newCount = prev.lastDate === yesterStr ? prev.count + 1 : 1;
  localStorage.setItem('anhqvdle_streak', JSON.stringify({ count: newCount, lastDate: today }));
  return newCount;
}

function getStreakData() {
  return JSON.parse(localStorage.getItem('anhqvdle_streak') || '{"count":0,"lastDate":""}');
}

function initStreakHeader() {
  const el = document.getElementById('streak-header-badge');
  if (!el) return;
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const today = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const yest  = new Date(now); yest.setDate(yest.getDate() - 1);
  const yesterStr = `${yest.getFullYear()}${pad(yest.getMonth()+1)}${pad(yest.getDate())}`;
  const data  = getStreakData();
  if (data.count >= 1 && (data.lastDate === today || data.lastDate === yesterStr)) {
    el.textContent = `🔥 ${data.count}`;
    el.style.display = 'flex';
    if (data.lastDate === yesterStr) el.classList.add('pending');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStreakHeader);
} else {
  initStreakHeader();
}
