/* ================================================
   ANHQVdle — Firebase Stats Sync
   Saves game results to Firebase when user is logged in.
   Modes tracked in leaderboard: 'classic', 'quote'
   ================================================ */

window.StatsFirebase = (function () {

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
    var today = new Date().toISOString().slice(0, 10);
    var ref   = db.ref('users/' + uid + '/stats/' + mode);

    ref.transaction(function (cur) {
      var s = cur || {};
      if (!s.played) s.played = 0;
      if (!s.won)    s.won    = 0;

      // Avoid double counting same day (important for daily modes)
      if (s.lastDate === today) return cur;

      s.played++;
      s.lastDate = today;

      if (won) {
        s.won++;
        s.totalAttempts = (s.totalAttempts || 0) + attempts;
        var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        s.streak    = (s.lastWonDate === yesterday) ? (s.streak || 0) + 1 : 1;
        s.maxStreak = Math.max(s.maxStreak || 0, s.streak);
        s.lastWonDate = today;
      } else {
        s.streak = 0;
      }
      return s;
    }).then(function (res) {
      if (res.committed && res.snapshot.val()) {
        // Only push to leaderboard for daily modes
        if (mode === 'classic' || mode === 'quote') {
          _updateLeaderboard(db, user, mode, res.snapshot.val());
        }
      }
    }).catch(function () { /* fail silently */ });
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

  return { saveGameResult: saveGameResult };
})();
