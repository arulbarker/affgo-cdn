// Auto-generated runtime loader for thin Canvas shell.
// Fetches body.html + bundle-classic.js + bundle-module.js from jsDelivr,
// patches DOMContentLoaded semantics so dynamically-loaded scripts see the
// event fire even though it already passed during initial shell parse.
(function () {
  var CDN = "https://fastly.jsdelivr.net/gh/arulbarker/affgo-cdn@main";

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

  // Anti-stale: fetch dengan cache:'no-cache' → browser revalidate ETag ke CDN.
  // Setelah purge jsDelivr, user langsung dapat bundle baru tanpa hard-refresh.
  // Kalau tidak ada perubahan, server balas 304 (tidak re-download penuh).
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
      // 1. Fetch body HTML (the actual app structure: 86 tab panels, login, modals)
      //    cache:'no-cache' = revalidate ETag → anti-stale setelah purge
      var bodyRes = await fetch(CDN + '/body.html', { cache: 'no-cache' });
      if (!bodyRes.ok) throw new Error('Fetch body.html → HTTP ' + bodyRes.status);
      var bodyHtml = await bodyRes.text();

      // 2. Swap placeholder loader with real body
      var loader = document.getElementById('__loader');
      if (loader) loader.remove();
      document.body.insertAdjacentHTML('afterbegin', bodyHtml);

      // 2b. Refresh styles anti-stale — shell <link> bisa serve CSS lama dari
      //     browser cache; inject ulang versi fresh (no-cache) menimpa yang stale.
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
