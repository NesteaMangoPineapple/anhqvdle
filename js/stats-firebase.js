/* ================================================
   ANHQVdle — Firebase Stats Sync
   Saves game results to Firebase when user is logged in.
   Modes tracked in leaderboard: 'classic', 'quote'
   ================================================ */

window.StatsFirebase = (function () {

  // YYYY-MM-DD en hora local (igual que el reto diario), no en UTC
  function _localDate(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function saveGameResult(mode, attempts, won) {
    if (!window.AuthModule) return;
    AuthModule.onReady(function (user) {
      if (!user) return;
      var db = AuthModule.getDb();
      if (!db) return;
      _writeStats(db, user, mode, attempts, won);
    });
  }

  function _writeStats(db, user, mode, attempts, won) {
    var uid   = user.uid;
    var today = _localDate(0);
    var ref   = db.ref('users/' + uid + '/stats/' + mode);
    var counted = false; // la transacción puede repetirse: vale lo de la última pasada

    ref.transaction(function (cur) {
      var s = cur || {};
      if (!s.played) s.played = 0;
      if (!s.won)    s.won    = 0;

      // Avoid double counting same day (important for daily modes)
      counted = false;
      if (s.lastDate === today) return cur;
      counted = true;

      s.played++;
      s.lastDate = today;

      if (won) {
        s.won++;
        s.totalAttempts = (s.totalAttempts || 0) + attempts;
        var yesterday = _localDate(-1);
        s.streak    = (s.lastWonDate === yesterday) ? (s.streak || 0) + 1 : 1;
        s.maxStreak = Math.max(s.maxStreak || 0, s.streak);
        s.lastWonDate = today;
      } else {
        s.streak = 0;
      }
      return s;
    }).then(function (res) {
      if (res.committed && res.snapshot.val()) {
        // Push to leaderboard for all daily modes
        if (mode === 'classic' || mode === 'quote' || mode === 'impostor') {
          _updateLeaderboard(db, user, mode, res.snapshot.val());
        }
        if (counted && LEAGUE_MODES.indexOf(mode) !== -1) {
          _addLeaguePoints(db, user, leaguePoints(mode, attempts, won));
        }
      }
    }).catch(function () { /* fail silently */ });
  }

  /* ── Liga semanal ────────────────────────────────
     league/{lunes YYYY-MM-DD}/{uid} = {name, photo, points, games, updated}
     Se reinicia sola cada lunes porque cada semana es una rama nueva. */
  var LEAGUE_MODES = ['classic', 'quote', 'impostor', 'conexiones', 'pixelada'];

  // Ganar a la primera = 10 puntos, cada intento extra resta 1 (mínimo 5).
  // El Impostor no tiene intentos: ganar = 10. Jugar y perder = 1.
  function leaguePoints(mode, attempts, won) {
    if (!won) return 1;
    if (mode === 'impostor') return 10;
    return 5 + Math.max(0, 6 - attempts);
  }

  function _addLeaguePoints(db, user, pts) {
    var nm = user.displayName || (user.email || '').split('@')[0] || 'Vecino';
    db.ref('league/' + leagueWeekId(0) + '/' + user.uid).transaction(function (cur) {
      var s = cur || {};
      return {
        name:    nm,
        photo:   user.photoURL || '',
        points:  (s.points || 0) + pts,
        games:   (s.games  || 0) + 1,
        updated: Date.now()
      };
    }).catch(function () {});
  }

  function _updateLeaderboard(db, user, mode, stats) {
    var nm  = user.displayName || user.email.split('@')[0];
    var ph  = user.photoURL || '';
    db.ref('leaderboard/' + mode + '/' + user.uid).set({
      name:          nm,
      photo:         ph,
      played:        stats.played        || 0,
      won:           stats.won           || 0,
      streak:        stats.streak        || 0,
      maxStreak:     stats.maxStreak     || 0,
      totalAttempts: stats.totalAttempts || 0,
      updated:       Date.now()
    }).catch(function () {});
  }

  return { saveGameResult: saveGameResult, leaguePoints: leaguePoints };
})();
