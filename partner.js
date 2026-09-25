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
var PARTNER = {
  top: '',
  bottom: '',
  mid: '',
  railLeft: '',
  railRight: '',
  postNote: ''
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
