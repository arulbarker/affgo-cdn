// Auto-generated runtime loader for thin Canvas shell.
// Self-resolving: ambil commit sha terbaru via GitHub API → fetch artifact
// dari URL commit-pinned jsDelivr (immutable, kebal stale-cache @main).
// Fallback: @main (cdn → fastly) kalau GitHub API tidak bisa diakses.
(function () {
  var REPO = "arulbarker/affgo-cdn";
  var MAIN_BASES = ["https://cdn.jsdelivr.net/gh/arulbarker/affgo-cdn@main","https://fastly.jsdelivr.net/gh/arulbarker/affgo-cdn@main"];

  // Patch addEventListener once: when a script registers a DOMContentLoaded
  // handler AFTER the event has already fired (which is always the case here
  // since bundles load dynamically), invoke the handler on next microtask
  // instead of silently ignoring it.
  var _origAdd = document.addEventListener;
  document.addEventListener = function (type, listener, opts) {
    if (type === 'DOMContentLoaded' && document.readyState !== 'loading') {
      Promise.resolve().then(function () { try { listener(); } catch (e) { console.error(e); } });
      return;
    }
    return _origAdd.call(this, type, listener, opts);
  };

  // Kandidat base URL, urutan prioritas:
  // 1. Commit-pinned (immutable, selalu benar) — resolved via GitHub API
  // 2. @main cdn.jsdelivr.net  3. @main fastly.jsdelivr.net
  async function resolveBases() {
    var bases = [];
    try {
      var r = await fetch('https://api.github.com/repos/' + REPO + '/commits/main', { cache: 'no-store' });
      if (r.ok) {
        var j = await r.json();
        if (j && j.sha) bases.push('https://cdn.jsdelivr.net/gh/' + REPO + '@' + j.sha);
      }
    } catch (e) { console.warn('SHA resolve skipped:', e); }
    return bases.concat(MAIN_BASES);
  }

  // Coba tiap base sampai fetch sukses; base pemenang dipakai untuk semua file.
  async function fetchFirst(bases, path) {
    var lastErr;
    for (var i = 0; i < bases.length; i++) {
      try {
        var res = await fetch(bases[i] + path, { cache: 'no-cache' });
        if (res.ok) return { res: res, base: bases[i] };
        lastErr = new Error('HTTP ' + res.status + ' @ ' + bases[i] + path);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('All CDN bases failed for ' + path);
  }

  async function loadScript(url, isModule) {
    var res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Fetch ' + url + ' → HTTP ' + res.status);
    var code = await res.text();
    var blobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = blobUrl;
      if (isModule) s.type = 'module';
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to execute ' + url)); };
      document.body.appendChild(s);
    });
  }

  function showError(msg) {
    document.body.innerHTML =
      '<div style="padding:24px;color:#fff;background:#3a0a0a;font-family:system-ui;min-height:100vh;">'
      + '<h2 style="margin:0 0 12px">Boot error</h2>'
      + '<pre style="white-space:pre-wrap;word-break:break-word">' + (msg || 'Unknown error') + '</pre>'
      + '<p style="margin-top:16px;opacity:.7">Buka DevTools console untuk detail teknis.</p>'
      + '</div>';
  }

  (async function boot() {
    try {
      // 1. Resolve base terbaik + fetch body HTML (86+ tab panels, login, modals)
      var bases = await resolveBases();
      var first = await fetchFirst(bases, '/body.html');
      var CDN = first.base;
      console.log('[bootstrap] CDN base:', CDN);
      var bodyHtml = await first.res.text();

      // 2. Swap placeholder loader with real body
      var loader = document.getElementById('__loader');
      if (loader) loader.remove();
      document.body.insertAdjacentHTML('afterbegin', bodyHtml);

      // 2b. Inject styles dari base yang sama (menimpa CSS stale dari shell <link>).
      //     Non-fatal: gagal fetch = lanjut boot dengan CSS dari shell.
      try {
        var cssRes = await fetch(CDN + '/styles.css', { cache: 'no-cache' });
        if (cssRes.ok) {
          var st = document.createElement('style');
          st.textContent = await cssRes.text();
          document.head.appendChild(st);
        }
      } catch (cssErr) { console.warn('Style refresh skipped:', cssErr); }

      // 3. Load bundles in original document order: classic first (was inline blocking),
      //    then module (was deferred). Awaiting load preserves execution order.
      await loadScript(CDN + '/bundle-classic.js', false);
      await loadScript(CDN + '/bundle-module.js', true);
    } catch (err) {
      console.error('Bootstrap failed:', err);
      showError(err && err.message ? err.message : String(err));
    }
  })();
})();
