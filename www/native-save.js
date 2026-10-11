(function () {
  function isNative() {
    return window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform();
  }
  function toBase64(blob) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onloadend = function () { res(String(r.result).split(',')[1]); };
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }
  async function nativeSave(href, name) {
    var blob = await (await fetch(href)).blob();
    var data = await toBase64(blob);
    var P = Capacitor.Plugins;
    var safe = name.replace(/[\\/:*?"<>|]+/g, '_');
    var f = await P.Filesystem.writeFile({ path: safe, data: data, directory: 'CACHE' });
    await P.Share.share({ title: safe, url: f.uri, dialogTitle: 'সেভ / শেয়ার' });
  }
  function run(a) {
    nativeSave(a.href, a.download || 'file').catch(function (e) {
      alert('সেভ হয়নি: ' + (e && e.message ? e.message : e));
    });
  }
  var origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (isNative() && this.hasAttribute('download') && this.href) { run(this); return; }
    return origClick.apply(this, arguments);
  };
  var origDispatch = HTMLAnchorElement.prototype.dispatchEvent;
  HTMLAnchorElement.prototype.dispatchEvent = function (ev) {
    if (isNative() && ev && ev.type === 'click' && this.hasAttribute('download') && this.href) {
      run(this);
      return true;
    }
    return origDispatch.apply(this, arguments);
  };
  document.addEventListener('click', function (e) {
    if (!isNative()) return;
    var a = e.target.closest && e.target.closest('a[download]');
    if (a && a.href) { e.preventDefault(); run(a); }
  }, true);
})();
