/* ============================================================
   PARTNER slots — sudhu ekhane link bosalei hobe, ar kichu
   touch kora lagbe na.

   HOW TO USE (Adsterra):
   1. Adsterra dashboard theke banner code copy koro (ora ekta
      <script> ... </script> block dey) — purota ekhane paste koro,
      quote er vitore. Example:
        top: '<script src="https://example.com/banner.js"></' + 'script>',
      (script tag venge likhte hoy, naile browser gulay fele.)
   2. Othoba sudhu link thakle (https://...) seta bosao — box er
      vitore auto load hoye jabe:
        top: 'https://www.example.com/my-banner-page',
   3. Khali ('') rakhle glass "Advertisement here" placeholder
      dekhabe — jotokkhon code na bosao.

    Slots: top (header niche), bottom (converter niche),
    mid (features card niche), railLeft / railRight (duipasher
    lomba), postNote (convert chaple j choto box othe seta).
   ============================================================ */
/* Demo ad for the 300x100 / 320x100 slot inside the download dialog.
   Replace this whole string with your real Adsterra / Network code later -
   anything containing a <script> tag is injected as live markup. */
var DEMO_AD_300x100 =
  '<a href="#" class="demo-ad" onclick="return false">' +
    '<span class="demo-ad__badge">Ad</span>' +
    '<span class="demo-ad__body">' +
      '<strong>LipiLab Pro</strong>' +
      '<em>Unlimited conversions, no signup</em>' +
    '</span>' +
    '<span class="demo-ad__cta">Try free</span>' +
  '</a>' +
  '<style>' +
    '.demo-ad{display:flex;align-items:center;gap:12px;width:100%;height:100px;' +
      'padding:0 14px;box-sizing:border-box;text-decoration:none;' +
      'background:linear-gradient(135deg,#064e3b,#0d9488);border-radius:8px;' +
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#fff;}' +
    '.demo-ad__badge{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;' +
      'background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);' +
      'padding:2px 7px;border-radius:999px;flex-shrink:0;}' +
    '.demo-ad__body{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;}' +
    '.demo-ad__body strong{font-size:15px;font-weight:800;line-height:1.2;}' +
    '.demo-ad__body em{font-size:11.5px;font-style:normal;opacity:.88;line-height:1.3;}' +
    '.demo-ad__cta{font-size:12px;font-weight:700;background:#fff;color:#065f46;' +
      'padding:7px 12px;border-radius:999px;flex-shrink:0;}' +
  '</style>';

var PARTNER = {
  top: '',
  bottom: '',
  mid: '',
  railLeft: '',
  railRight: '',
  postNote: '',
  // Empty string would leave the grey placeholder. The demo creative is only a
  // placeholder for the real ad code - swap it for the live one when ready.
  download: DEMO_AD_300x100
};

var PARTNER_SLOT_IDS = {
  top: 'spot-top',
  bottom: 'spot-bottom',
  mid: 'spot-mid',
  railLeft: 'rail-left',
  railRight: 'rail-right',
  postNote: 'post-note-body'
};

function renderPartnerSlot(box, code) {
  if (!box) return;
  code = (code || '').trim();
  if (!code) return; // empty — keep the glass placeholder already in HTML
  box.innerHTML = '';
  if (/<script[\s>]/i.test(code)) {
    // Full embed code: re-create each tag so scripts actually run
    // (scripts added via innerHTML never execute).
    var tmp = document.createElement('div');
    tmp.innerHTML = code;
    var nodes = Array.prototype.slice.call(tmp.childNodes);
    nodes.forEach(function (node) {
      if (node.tagName === 'SCRIPT') {
        var s = document.createElement('script');
        var attrs = Array.prototype.slice.call(node.attributes || []);
        attrs.forEach(function (a) {
          if (a.name === 'src') s.src = a.value;
          else if (a.name === 'async') s.async = true;
          else if (a.name === 'defer') s.defer = true;
          else s.setAttribute(a.name, a.value);
        });
        s.text = node.text || '';
        box.appendChild(s);
      } else {
        box.appendChild(node);
      }
    });
  } else if (/^https?:\/\//i.test(code)) {
    // Plain link: load it full-size inside the box.
    var f = document.createElement('iframe');
    f.className = 'partner-frame';
    f.setAttribute('src', code);
    f.setAttribute('scrolling', 'no');
    f.setAttribute('frameborder', '0');
    box.appendChild(f);
  } else {
    box.innerHTML = code;
  }
}

function initPartnerSlots() {
  Object.keys(PARTNER_SLOT_IDS).forEach(function (key) {
    renderPartnerSlot(document.getElementById(PARTNER_SLOT_IDS[key]), PARTNER[key]);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPartnerSlots);
} else {
  initPartnerSlots();
}
