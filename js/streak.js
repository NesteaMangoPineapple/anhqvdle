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
    el.addEventListener('click', () => showStreakPopup(data, today));
  }
}

function showStreakPopup(data, today) {
  if (document.getElementById('streak-popup-overlay')) return;

  const pad = n => String(n).padStart(2, '0');
  const playedToday = data.lastDate === today;
  const count = data.count;

  const overlay = document.createElement('div');
  overlay.id = 'streak-popup-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.7);
    backdrop-filter:blur(4px);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:16px;
    animation:fadeIn 0.2s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background:#111;border:1px solid rgba(255,90,0,0.4);
      border-radius:16px;padding:28px 24px;max-width:340px;width:100%;
      position:relative;animation:slideUp 0.25s ease;
      box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 30px rgba(255,90,0,0.1);
      text-align:center;font-family:'Barlow',sans-serif;
    ">
      <button onclick="document.getElementById('streak-popup-overlay').remove()" style="
        position:absolute;top:12px;right:14px;background:none;border:none;
        color:rgba(255,255,255,0.4);font-size:1.1rem;cursor:pointer;padding:4px 8px;
        border-radius:6px;line-height:1;
      ">✕</button>

      <div style="font-size:3rem;margin-bottom:8px;filter:drop-shadow(0 0 12px rgba(255,100,0,0.6))">🔥</div>
      <div style="font-family:'Bebas Neue',cursive;font-size:3rem;color:#ff6400;letter-spacing:2px;line-height:1">
        ${count}
      </div>
      <div style="font-family:'Bebas Neue',cursive;font-size:1.1rem;color:rgba(255,100,0,0.7);letter-spacing:3px;margin-bottom:16px">
        DÍA${count !== 1 ? 'S' : ''} SEGUIDO${count !== 1 ? 'S' : ''}
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;margin-bottom:16px">
        <p style="color:rgba(255,255,255,0.75);font-size:0.9rem;line-height:1.6;margin:0">
          ${playedToday
            ? `✅ <strong>Ya jugaste hoy.</strong> ¡Tu racha está a salvo!`
            : `⚠️ <strong>Todavía no has jugado hoy.</strong><br>¡Juega antes de medianoche para no perder tu racha!`
          }
        </p>
      </div>

      <p style="color:rgba(255,255,255,0.4);font-size:0.78rem;line-height:1.6;margin:0">
        Completa el modo <strong style="color:rgba(255,255,255,0.6)">Clásico</strong> o
        <strong style="color:rgba(255,255,255,0.6)">Frases</strong> cada día para mantener tu racha.
        Si te saltas un día, vuelve a empezar desde 1.
      </p>
    </div>
  `;

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
  });
  document.body.appendChild(overlay);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStreakHeader);
} else {
  initStreakHeader();
}
