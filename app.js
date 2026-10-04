/* ============================================================
   LipiLab — Bangla Unicode <-> Bijoy Converter (single-file)

   Section map:
     1. Conversion Engine  - byte-identical to the approved
        index.html reference (maps, ReArrange*, ConvertToASCII/
        ConvertToUnicode). Kept in its original terse style
        intentionally: this is proven, tested logic and the
        highest-risk place to introduce a silent bug by
        "cleaning up" variable names, so it is reproduced as-is
        rather than rewritten.
     2. Text Separator (tokenizer)
     3. DOM References
     4. Application State
     5. Utilities
     6. Theme
     7. Shortcuts Modal
     8. Plain-text Conversion
     9. DOCX - blank generation (no template)
    10. DOCX - template round-trip (new: load, patch, download)
    11. Event Wiring
    12. Keyboard Shortcuts
    13. Init
   ============================================================ */
(function () {
'use strict';

/* ------------------------------------------------------------
   1. CONVERSION ENGINE
------------------------------------------------------------ */
var uni2bijoy_string_conversion_map = {
    "।": "|", "৷": "|", "‘": "Ô", "’": "Õ", "“": "Ò", "”": "Ó", "্র্য": "ª¨", "র‌্য": "i¨", "ক্ক": "°", "ক্ট": "±", "ক্ত": "³", "ক্ব": "K¡", "স্ক্র": "¯Œ", "ক্র": "µ", "ক্ল": "K¬", "ক্ষ্ন": "¶è", "ক্ষ্ণ": "¶è", "হ্ম": "þ", "ক্ষ্ম": "²", "ঙ্ক্ষ": "•¶", "ক্ষ": "¶", "ক্স": "·", "ক্ম": "´", "ঙ্গু": "½y", "গু": "¸", "গ্ধ": "»", "গ্ন": "Mœ", "গ্ম": "M¥", "গ্লু": "Møæ", "গ্ল": "Mø", "গ্রু": "Mªæ", "ঘ্ন": "Nœ", "ঙ্ক": "¼", "ঙ্খ": "•L", "ঙ্গ": "½", "ঙ্ঘ": "•N", "চ্চ": "”P", "চ্ছ": "”Q", "চ্ছ্ব": "”Q¡", "চ্ঞ": "”T", "জ্জ্ব": "¾¡", "জ্জ": "¾", "জ্ঝ": "À", "জ্ঞ": "Á", "জ্ব": "R¡", "ঞ্চ": "Â", "ঞ্ছ": "Ã", "ঞ্জ": "Ä", "ঞ্ঝ": "Å", "ট্ট": "Æ", "ট্ব": "U¡", "ট্ম": "U¥", "ড্ড": "Ç", "ণ্ট": "È", "ণ্ঠ": "É", "ন্স": "Ý", "ণ্ড": "Ð", "ন্তু": "š‘", "ণ্ব": "Y^", "ত্ত্ব": "Ë¡", "ন্ত্ব": "šÍ¡", "ত্ত": "Ë", "ত্থ": "Ì", "ত্ন": "Zœ", "ত্ম": "Z¥", "ত্ব": "Z¡", "ত্রু": "Îæ", "ত্রূ": "Îƒ", "থ্ব": "_¡", "দ্গ": "˜M", "দ্ঘ": "˜N", "দ্দ": "Ï", "দ্ধ": "×", "ন্দ্ব": "›Ø", "দ্ব": "Ø", "দ্ভ্র": "™£", "দ্ভ": "™¢", "দ্ম": "Ù", "দ্রু": "`ªæ", "শ্রু": "kÖæ", "প্রু": "cÖæ", "প্লু": "cøæ", "ধ্ব": "aŸ", "ধ্ম": "a¥", "ন্ট": "›U", "ন্ঠ": "Ú", "ন্ড": "Û", "ন্ত্র": "š¿", "ন্ত": "šÍ", "স্ত্র": "¯¿", "ত্র": "Î", "ন্থ": "š’", "ন্দ": "›`", "ন্ধ": "Ü", "ণ্ণ": "Yœ", "ণ্ন": "Yœ", "ন্ন": "bœ", "ন্ব": "š^", "ন্ম": "b¥", "প্ট": "Þ", "প্ত": "ß", "প্ন": "cœ", "প্প": "à", "প্ল": "cø", "প্স": "á", "ফ্ল": "d¬", "ব্জ": "â", "ব্দ": "ã", "ব্ধ": "ä", "ব্ব": "eŸ", "ব্ল": "eø", "ভ্র": "å", "ম্ন": "gœ", "ম্প": "¤ú", "ম্ফ": "ç", "ম্ব": "¤^", "ম্ভ": "¤¢", "ম্ভ্র": "¤£", "ম্ম": "¤§", "ম্ল": "¤ø", "ড়ু": "o–", "ঢ়ু": "p–", "রু": "iæ", "রূ": "iƒ", "ল্ক": "é", "ল্গ": "ê", "ল্প": "í", "ল্ট": "ë", "ল্ড": "ì", "ল্ফ": "î", "ল্ব": "j¦", "ল্ম": "j¥", "ল্ল": "jø", "শু": "ï", "শ্চ": "ð", "শ্ছ": "ñ", "শ্ন": "kœ", "শ্ব": "k¦", "শ্ম": "k¥", "শ্ল": "kø", "ষ্ক": "®‹", "ষ্ক্র": "®Œ", "ষ্ট": "ó", "ষ্ঠ": "ô", "ষ্ণ": "ò", "ষ্প": "®ú", "ষ্ফ": "õ", "ষ্ম": "®§", "স্ক": "¯‹", "স্ট": "÷", "স্খ": "ö", "স্তু": "¯‘", "স্ত": "¯Í", "স্থ": "¯’", "স্ন": "mœ", "স্প": "¯ú", "স্ফ": "ù", "স্ব": "¯^", "স্ম": "¯§", "স্ল": "¯ø", "হ্ব": "nŸ", "হু": "û", "হ্ণ": "nè", "হ্ন": "ý", "হ্ল": "n¬", "হৃ": "ü", "র্": "©", "্র": "ª", "্য": "¨", "্": "&", "আ": "Av", "অ": "A", "ই": "B", "ঈ": "C", "উ": "D", "ঊ": "E", "ঋ": "F", "এ": "G", "ঐ": "H", "ও": "I", "ঔ": "J", "ক": "K", "খ": "L", "গ": "M", "ঘ": "N", "ঙ": "O", "চ": "P", "ছ": "Q", "জ": "R", "ঝ": "S", "ঞ": "T", "ট": "U", "ঠ": "V", "ড": "W", "ঢ": "X", "ণ": "Y", "ত": "Z", "থ": "_", "দ": "`", "ধ": "a", "ন": "b", "প": "c", "ফ": "d", "ব": "e", "ভ": "f", "ম": "g", "য": "h", "র": "i", "ল": "j", "শ": "k", "ষ": "l", "স": "m", "হ": "n", "ড়": "o", "ঢ়": "p", "য়": "q", "ৎ": "r", "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9", "া": "v", "ি": "w", "ী": "x", "ু": "y", "ূ": "~", "…": "...", "ৃ": "…", "ে": "‡", "ৈ": "‰", "ৗ": "Š", "ং": "s", "ঃ": "t", "ঁ": "u", "—": "Ñ", "॥": "\\"
};

var bijoyKarReplacements = {
    "¨y": "y¨", "¨~": "~¨", vu: "uv", "¨u": "u¨", Ky: "Kz", "K~": "K‚", Py: "Pz", "P~": "P‚", Qy: "Qz", "Q~": "Q‚", Sy: "Sz", "S~": "S‚", Uy: "Uz", "U~": "U‚", Vy: "Vz", "V~": "V‚", Wy: "Wz", "W~": "W‚", Xy: "Xz", "X~": "X‚", Zy: "Zz", "Z~": "Z‚", dy: "dz", "d~": "d‚", fy: "fz", "f~": "f‚", "¶y": "¶z", "¶~": "¶‚", "Áy": "Áz", "Á~": "Á‚", "þy": "þz", "þ~": "þ‚", "¾y": "¾z", "¾~": "¾‚", "°y": "°z", "°~": "°‚", "¼y": "¼z", "¼~": "¼‚", "Üy": "Üz", "Ü~": "Ü‚", "×y": "×z", "×~": "x‚", "äy": "äz", "ä~": "ä‚", "§…": "§„", "¥…": "¥„", "c…": "c„", "N…": "N„", "g…": "g„", "e…": "e„", "k…": "k„", "L…": "L„", "M…": "M„", "m…": "m„", "l…": "l„", "R…": "R„", "_…": "_„", "`…": "`„", "a…": "a„", "b…": "b„", "j…": "j„", "h…": "h„", "Y…": "Y„", "j&¸": "êy", "'‡": "'†", '"‡': '"†', "{‡": "{†", "-‡": "-†", "'‰": "'ˆ", '"‰': '"ˆ', "{‰": "{ˆ", "-‰": "-ˆ", "©y": "©z", "©~": "©‚", "‹y": "‹z", "‹~": "‹‚", "÷y": "÷z", "÷~": "÷‚", "ùy": "ùz", "ù~": "ù‚"
};

var bijoyRoFolaReplacements = {
    "&iæ": "ªæ", "&iƒ": "ªƒ", "Mª": "MÖ", "cª": "cÖ", "dª": "d«", "Nªæ": "Nªy", "Pªæ": "Pªy", "Qªæ": "Qªy", "Sªæ": "Sªy", "Uªæ": "Uªy", "Vªæ": "Vªy", "Wªæ": "Wªy", "Xªæ": "Xªy", "Yªæ": "Yªy", "bªæ": "bªy", "d«æ": "d«y", "hªæ": "hªy", "jªæ": "jªy", "lªæ": "lªy", "nªæ": "nªy", "åy": "åæ", "Nªƒ": "Nª~", "Pªƒ": "Pª~", "Qªƒ": "Qª~", "Sªƒ": "Sª~", "Uªƒ": "Uª~", "Vªƒ": "Vª~", "Wªƒ": "Wª~", "Xªƒ": "Xª~", "Yªƒ": "Yª~", "bªƒ": "bª~", "d«ƒ": "d«~", "hªƒ": "hª~", "jªƒ": "jª~", "lªƒ": "lª~", "nªƒ": "nª~", "å~": "åƒ", "”Q&e": "”Q¡", "kª": "kÖ", "mª": "mÖ", "g&å": "¤£"
};

function buildInverseMap(n) {
    var i = {};
    for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (i[n[t]] = t);
    return i;
}
var reverseBijoyKarReplacements = buildInverseMap(bijoyKarReplacements);
var reverseBijoyRoFolaReplacements = buildInverseMap(bijoyRoFolaReplacements);

var uni2bijoyPatterns = null;

var bijoy_string_conversion_map = {
    "i¨": "র‌্য", "ª¨": "্র্য", "°": "ক্ক", "±": "ক্ট", "³": "ক্ত", "K¡": "ক্ব", "¯Œ": "স্ক্র", "µ": "ক্র", "K¬": "ক্ল", "¶è": "ক্ষ্ণ", "þ": "হ্ম", "²": "ক্ষ্ম", "•¶": "ঙ্ক্ষ", "¶": "ক্ষ", "ÿz": "ক্ষু", "ÿ‚": "ক্ষূ", "ÿ": "ক্ষ", "·": "ক্স", "´": "ক্ম", "¸": "গু", "»": "গ্ধ", "Mœ": "গ্ন", "M¥": "গ্ম", "Mªƒ": "গ্রূ", "Møæ": "গ্লু", "Mø": "গ্ল", "Mªæ": "গ্রু", "Nœ": "ঘ্ন", "¼": "ঙ্ক", "•L": "ঙ্খ", "½": "ঙ্গ", "•N": "ঙ্ঘ", "”P": "চ্চ", "”Q": "চ্ছ", "R¡": "জ্ব", "¾": "জ্জ", "À": "জ্ঝ", "Á": "জ্ঞ", "Â": "ঞ্চ", "Ã": "ঞ্ছ", "Ä": "ঞ্জ", "Å": "ঞ্ঝ", "Æ": "ট্ট", "U¡": "ট্ব", "U¥": "ট্ম", "Ç": "ড্ড", "È": "ণ্ট", "É": "ণ্ঠ", "Ý": "ন্স", "Ð": "ণ্ড", "š‘": "ন্তু", "Y^": "ণ্ব", "Ë": "ত্ত", "Ì": "ত্থ", "Z¥": "ত্ম", "Z¡": "ত্ব", "Zœ": "ত্ন", "Îæ": "ত্রু", "Îƒ": "ত্রূ", "Î": "ত্র", "_¡": "থ্ব", "˜M": "দ্গ", "˜N": "দ্ঘ", "Ï": "দ্দ", "×": "দ্ধ", "˜¡": "দ্ব", "Ø": "দ্ব", "™£": "দ্ভ্র", "™¢": "দ্ভ", "Ù": "দ্ম", "`ªæ": "দ্রু", "`ªƒ": "দ্রূ", "aªƒ": "ধ্রূ", "aŸ": "ধ্ব", "a¥": "ধ্ম", "›U": "ন্ট", "Ú": "ন্ঠ", "Û": "ন্ড", "šÍ": "ন্ত", "š¿": "ন্ত্র", "š’": "ন্থ", "›`": "ন্দ", "Ü": "ন্ধ", "Yœ": "ণ্ণ", "bœ": "ন্ন", "š^": "ন্ব", "b¥": "ন্ম", "Þ": "প্ট", "ß": "প্ত", "cœ": "প্ন", "à": "প্প", "cøæ": "প্লু", "cø": "প্ল", "cªæ": "প্রু", "á": "প্স", "d¬z": "ফ্লু", "d¬‚": "ফ্লূ", "d¬": "ফ্ল", "â": "ব্জ", "ã": "ব্দ", "ä": "ব্ধ", "eŸ": "ব্ব", "eø": "ব্ল", "å": "ভ্র", "gœ": "ম্ন", "¤ú": "ম্প", "ç": "ম্ফ", "¤^": "ম্ব", "¤¢": "ম্ভ", "¤£": "ম্ভ্র", "¤§": "ম্ম", "¤ø": "ম্ল", "iæ": "রু", "iƒ": "রূ", "é": "ল্ক", "ê": "ল্গ", "ë": "ল্ট", "ì": "ল্ড", "í": "ল্প", "î": "ল্ফ", "jø": "ল্ল", "kªƒ": "শ্রূ", "kªæ": "শ্রু", "ï": "শু", "kø": "শ্ল", "ð": "শ্চ", "ñ": "শ্ছ", "kœ": "শ্ন", "k^": "শ্ব", "^": "্ব", "k¦": "শ্ব", "k¥": "শ্ম", "®‹": "ষ্ক", "®Œ": "ষ্ক্র", "ó": "ষ্ট", "ô": "ষ্ঠ", "ò": "ষ্ণ", "õ": "ষ্ফ", "®§": "ষ্ম", "¯‹": "স্ক", "÷": "স্ট", "ö": "স্খ", "¯Í": "স্ত", "¯‘": "স্তু", "¯¿": "স্ত্র", "¯’": "স্থ", "mœ": "স্ন", "¯ú": "স্প", "ù": "স্ফ", "¯^": "স্ব", "¯§": "স্ম", "¯ø": "স্ল", "¯": "স", "œ": "্ন", "û": "হু", "nŸ": "হ্ব", "nè": "হ্ণ", "ý": "হ্ন", "n¬": "হ্ল", "ü": "হৃ", "©": "র্", "Av": "আ", "A": "অ", "B": "ই", "C": "ঈ", "D": "উ", "E": "ঊ", "F": "ঋ", "G": "এ", "H": "ঐ", "I": "ও", "J": "ঔ", "K": "ক", "L": "খ", "M": "গ", "N": "ঘ", "O": "ঙ", "P": "চ", "Q": "ছ", "R": "জ", "S": "ঝ", "T": "ঞ", "U": "ট", "V": "ঠ", "W": "ড", "X": "ঢ", "Y": "ণ", "Z": "ত", "_": "থ", "`": "দ", "a": "ধ", "b": "ন", "c": "প", "d": "ফ", "e": "ব", "f": "ভ", "g": "ম", "h": "য", "i": "র", "j": "ল", "k": "শ", "l": "ষ", "m": "স", "n": "হ", "o": "ড়", "p": "ঢ়", "q": "য়", "r": "ৎ", "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯", "v": "া", "w": "ি", "x": "ী", "y": "ু", "~": "ূ", "‚": "ূ", "„": "ৃ", "‡": "ে", "†": "ে", "ˆ": "ৈ", "‰": "ৈ", "Š": "ৗ", "Ô": "‘", "Õ": "’", "|": "।", "Ò": "“", "Ó": "”", "s": "ং", "t": "ঃ", "u": "ঁ", "ª": "্র", "Ö": "্র", "«": "্র", "¨": "্য", "&": "্", "…": "ৃ", "Ñ": "—", "\\": "॥"
};

var correctBijoy = { "&ª": "ª" };
var correctUnicode = { "šত্ম": "ন্ত", "¯ত্ম": "স্ত" };
var bijoyPatterns = null;

function IsBanglaPreKar(n) { return n === "ি" || n === "ৈ" || n === "ে" ? !0 : !1 }
function IsBanglaBanjonborno(n) { return n === "ক" || n === "খ" || n === "গ" || n === "ঘ" || n === "ঙ" || n === "চ" || n === "ছ" || n === "জ" || n === "ঝ" || n === "ঞ" || n === "ট" || n === "ঠ" || n === "ড" || n === "ঢ" || n === "ণ" || n === "ত" || n === "থ" || n === "দ" || n === "ধ" || n === "ন" || n === "প" || n === "ফ" || n === "ব" || n === "ভ" || n === "ম" || n === "শ" || n === "ষ" || n === "স" || n === "হ" || n === "য" || n === "র" || n === "ল" || n === "য়" || n === "ং" || n === "ঃ" || n === "ঁ" || n === "ৎ" ? !0 : !1 }
function IsBanglaHalant(n) { return n === "্" ? !0 : !1 }
function IsSpace(n) { return n === " " || n === "\t" || n === "\n" || n === "\r" ? !0 : !1 }
function IsBanglaKar(n) { return IsBanglaPreKar(n) || (n === "া" || n === "ো" || n === "ৌ" || n === "ৗ" || n === "ু" || n === "ূ" || n === "ী" || n === "ৃ") ? !0 : !1 }
function IsBanglaPostKar(n) { return n === "া" || n === "ো" || n === "ৌ" || n === "ৗ" || n === "ু" || n === "ূ" || n === "ী" || n === "ৃ" ? !0 : !1 }
function IsBanglaNukta(n) { return n === "ং" || n === "ঃ" || n === "ঁ" ? !0 : !1 }

function buildConversionPatterns(n) {
    function r(n) {
        return n.split("").map(function(n) {
            switch (n) {
                case "\\": return "\\\\"; case ".": return "\\."; case "*": return "\\*"; case "+": return "\\+"; case "?": return "\\?"; case "^": return "\\^"; case "$": return "\\$"; case "{": return "\\{"; case "}": return "\\}"; case "(": return "\\("; case ")": return "\\)"; case "|": return "\\|"; case "[": return "\\["; case "]": return "\\]"; default: return n;
            }
        }).join("")
    }
    var i = [];
    for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && i.push({ regex: new RegExp(r(t), "g"), replacement: n[t] });
    return i
}

function ensureUni2BijoyPatterns() { uni2bijoyPatterns || (uni2bijoyPatterns = buildConversionPatterns(uni2bijoy_string_conversion_map)) }
function ensureBijoyPatterns() { bijoyPatterns || (bijoyPatterns = buildConversionPatterns(bijoy_string_conversion_map)) }

function ReArrangeUnicodeText(n) {
    for (var r, f, i, e, u, o = 0, t = 0; t < n.length; t++) {
        if (t < n.length && IsBanglaPreKar(n.charAt(t))) {
            for (r = 1; IsBanglaBanjonborno(n.charAt(t - r));) {
                if (t - r < 0) break; if (t - r <= o) break; if (IsBanglaHalant(n.charAt(t - r - 1))) r += 2; else break
            }
            f = n.substring(0, t - r); f += n.charAt(t); f += n.substring(t - r, t); f += n.substring(t + 1, n.length); n = f; o = t + 1; continue
        }
        if (t < n.length - 1 && IsBanglaHalant(n.charAt(t)) && n.charAt(t - 1) === "র") {
            for (i = 1, e = 0;;) if (IsBanglaBanjonborno(n.charAt(t + i)) && IsBanglaHalant(n.charAt(t + i + 1))) i += 2; else if (IsBanglaBanjonborno(n.charAt(t + i)) && IsBanglaPreKar(n.charAt(t + i + 1))) { e = 1; break } else break;
            u = n.substring(0, t - 1); u += n.substring(t + i + 1, t + i + e + 1); u += n.substring(t + 1, t + i + 1); u += n.charAt(t - 1); u += n.charAt(t); u += n.substring(t + i + e + 1, n.length); n = u; t += i + e; o = t + 1; continue
        }
    }
    return n
}

function ReArrangeUnicodeConvertedText(n) {
    for (var f, e, i, o, u, r, h, s, t = 0; t < n.length; t++) {
        if (t > 0 && n.charAt(t) === "্" && (IsBanglaKar(n.charAt(t - 1)) || IsBanglaNukta(n.charAt(t - 1))) && t < n.length - 1 && (f = n.substring(0, t - 1), f += n.charAt(t), f += n.charAt(t + 1), f += n.charAt(t - 1), f += n.substring(t + 2, n.length), n = f), t > 0 && t < n.length - 1 && n.charAt(t) === "্" && n.charAt(t - 1) === "র" && n.charAt(t - 2) !== "্" && IsBanglaKar(n.charAt(t + 1)) && (e = n.substring(0, t - 1), e += n.charAt(t + 1), e += n.charAt(t - 1), e += n.charAt(t), e += n.substring(t + 2, n.length), n = e), t < n.length - 1 && n.charAt(t) === "র" && IsBanglaHalant(n.charAt(t + 1)) && !IsBanglaHalant(n.charAt(t - 1))) {
            for (i = 1; ; ) { if (t - i < 0) break; if (IsBanglaBanjonborno(n.charAt(t - i)) && IsBanglaHalant(n.charAt(t - i - 1))) i += 2; else if (i === 1 && IsBanglaKar(n.charAt(t - i))) i++; else break }
            o = n.substring(0, t - i); o += n.charAt(t); o += n.charAt(t + 1); o += n.substring(t - i, t); o += n.substring(t + 2, n.length); n = o; t += 1; continue
        }
        if (t < n.length - 1 && IsBanglaPreKar(n.charAt(t)) && IsSpace(n.charAt(t + 1)) === !1) {
            for (u = n.substring(0, t), r = 1; IsBanglaBanjonborno(n.charAt(t + r)); ) if (IsBanglaHalant(n.charAt(t + r + 1))) r += 2; else break;
            u += n.substring(t + 1, t + r + 1); h = 0;
            n.charAt(t) === "ে" && n.charAt(t + r + 1) === "া" ? (u += "ো", h = 1) : n.charAt(t) === "ে" && n.charAt(t + r + 1) === "ৗ" ? (u += "ৌ", h = 1) : u += n.charAt(t);
            u += n.substring(t + r + h + 1, n.length); n = u; t += r
        }
        t < n.length - 1 && n.charAt(t) === "ঁ" && IsBanglaPostKar(n.charAt(t + 1)) && (s = n.substring(0, t), s += n.charAt(t + 1), s += n.charAt(t), s += n.substring(t + 2, n.length), n = s)
    }
    return n
}

function replaceFirstLetter(n, t, i) {
    for (var r, f = n.split("\n"), e = "", u = 0; u < f.length; u++) {
        var h = f[u], o = h.split(/(\s+)/), s = "";
        for (r = 0; r < o.length; r++) s += r % 2 == 0 ? o[r].replace(new RegExp("^" + t, "g"), i) : o[r];
        e += s.trim(); u < f.length - 1 && (e += "\n")
    } return e
}

function replaceLastLetter(n, t, i) {
    for (var r, f = n.split("\n"), e = "", u = 0; u < f.length; u++) {
        var h = f[u], o = h.split(/(\s+)/), s = "";
        for (r = 0; r < o.length; r++) s += r % 2 == 0 ? o[r].replace(new RegExp(t + "$", "g"), i) : o[r];
        e += s.trim(); u < f.length - 1 && (e += "\n")
    } return e
}

function replaceMultiple(n, t, i) {
    var u = n, r, f;
    for (r in t) Object.prototype.hasOwnProperty.call(t, r) && (f = i ? new RegExp(r, "g") : r, u = u.replace(f, t[r]));
    return u
}

function ConvertToASCII(n) {
    var t, i, r;
    for (t = new RegExp("ব়", "g"), n = n.replace(t, "র"), t = new RegExp("ড়", "g"), n = n.replace(t, "ড়"), t = new RegExp("ঢ়", "g"), n = n.replace(t, "ঢ়"), t = new RegExp("য়", "g"), n = n.replace(t, "য়"), t = new RegExp("ো", "g"), n = n.replace(t, "ো"), t = new RegExp("ৌ", "g"), n = n.replace(t, "ৌ"), t = new RegExp("্র্য", "g"), n = n.replace(t, "্র‍্য"), n = replaceLastLetter(n, "র্", "i&"), n = replaceLastLetter(n, "র্‌", "i&"), n = ReArrangeUnicodeText(n), ensureUni2BijoyPatterns(), i = 0; i < uni2bijoyPatterns.length; i++)
        r = uni2bijoyPatterns[i], n = n.replace(r.regex, r.replacement);
    return n = replaceFirstLetter(n, "‡", "†"), n = replaceFirstLetter(n, "‰", "ˆ"), n = n.replace("(‡", "(†"), n = n.replace("[‡", "[†"), n = n.replace("Ô‡", "Ô†"), n = n.replace("Ò‡", "Ò†"), n = n.replace("(‰", "(ˆ"), n = n.replace("[‰", "[ˆ"), n = n.replace("Ô‰", "Ôˆ"), n = n.replace("Ò‰", "Òˆ"), n = replaceMultiple(n, bijoyKarReplacements, !0), replaceMultiple(n, bijoyRoFolaReplacements, !0)
}

function fixPreVowelFolaOrder(n) {
    var banjonborno = "কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমশষসহযরলয়ংঃঁৎ";
    var cls = "[" + banjonborno + "]";
    var re = new RegExp("(্)([েৈ])(" + cls + ")", "g");
    return n.replace(re, "$1$3$2");
}

function ConvertToUnicode(n) {
    var t, i;
    for (n = replaceMultiple(n, reverseBijoyRoFolaReplacements, !0), n = replaceMultiple(n, reverseBijoyKarReplacements, !0), n = replaceMultiple(n, correctBijoy, !0), ensureBijoyPatterns(), t = 0; t < bijoyPatterns.length; t++)
        i = bijoyPatterns[t], n = n.replace(i.regex, i.replacement);
    return n = replaceMultiple(n, correctUnicode, !0), n = ReArrangeUnicodeConvertedText(n), n = fixPreVowelFolaOrder(n), n.replace(/অা/g, "আ")
}

/* ------------------------------------------------------------
   2. TEXT SEPARATOR (TOKENIZER)
   Same regex index.html uses inside handleConvert() to split a
   string into Bangla-script / Latin+digit / whitespace / other-
   symbol runs. index.html applies ConvertToASCII() to each
   Bangla-run token individually (never to the whole string at
   once) — this function generalises that exact split so both
   the plain-text path and the DOCX run-splitting path reuse it.
------------------------------------------------------------ */
function tokenizeMixedText(text) {
  var re = /([^\sa-zA-Z0-9\u0980-\u09FF\u0964\u0965]*[\u0980-\u09FF\u0964\u0965]+[^\sa-zA-Z0-9\u0980-\u09FF\u0964\u0965]*)|([^\sa-zA-Z0-9\u0980-\u09FF\u0964\u0965]*[a-zA-Z0-9]+[^\sa-zA-Z0-9\u0980-\u09FF\u0964\u0965]*)|(\s+)|([^\sa-zA-Z0-9\u0980-\u09FF\u0964\u0965]+)/g;
  var match, tokens = [], lastType = 'latin';
  while ((match = re.exec(text)) !== null) {
    var raw, type;
    if (match[1] !== undefined) { raw = match[1]; type = 'bangla'; }
    else if (match[2] !== undefined) { raw = match[2]; type = 'latin'; }
    else if (match[3] !== undefined) { raw = match[3]; type = 'space'; }
    else { raw = match[4]; type = 'other'; }
    var effectiveType = (type === 'space' || type === 'other') ? lastType : type;
    tokens.push({ raw: raw, type: type, effectiveType: effectiveType });
    if (raw.trim() !== '') lastType = effectiveType;
  }
  return tokens;
}
/* ------------------------------------------------------------
   2b. BIJOY vs ENGLISH SEPARATION (the bijoy2uni direction only)

   Bijoy-ANSI text is not Unicode text: its Bangla is stored as
   ordinary ASCII / Latin-1 bytes ('v', 'a', 'Z', '¯', '‡', '†')
   that only *look* like Bangla through the Bijoy font. The
   Unicode-range tokenizer above is correct for Unicode -> Bijoy,
   but running it on Bijoy bytes cut single words into fragments and
   gated each fragment on its own — which silently skipped most of a
   paragraph (Phase 5 regression).

   Here the separating test is the Bijoy character set itself: the
   key set of bijoy_string_conversion_map, i.e. the very table
   ConvertToUnicode() consumes, so no second source of truth is
   invented. Tokenizing is whitespace-only, because a word is either
   Bijoy or not — it never mixes Bijoy and English inside one
   contiguous word-like unit.
------------------------------------------------------------ */

var BIJOY_CHAR_SET = (function () {
  var set = {};
  for (var key in bijoy_string_conversion_map) {
    if (!Object.prototype.hasOwnProperty.call(bijoy_string_conversion_map, key)) continue;
    for (var i = 0; i < key.length; i++) set[key.charAt(i)] = true;
  }
  return set;
})();

/* Bangla orthography classes, used to sanity-check a decoded token.
   Written as explicit \uXXXX escapes on purpose: these characters have
   canonically-equivalent composed/decomposed spellings (ড় ঢ় য়) that are
   indistinguishable in a plain-text editor but compare unequal in code, and
   the decoder emits the composed forms. */
var BN_INDEPENDENT_VOWEL = '\u0985\u0986\u0987\u0988\u0989\u098A\u098B\u098F\u0990\u0993\u0994';
var BN_CONSONANT = '\u0995\u0996\u0997\u0998\u0999\u099A\u099B\u099C\u099D\u099E\u099F\u09A0\u09A1\u09A2\u09A3\u09A4\u09A5\u09A6\u09A7\u09A8\u09AA\u09AB\u09AC\u09AD\u09AE\u09AF\u09B0\u09B2\u09B6\u09B7\u09B8\u09B9\u09CE\u09DC\u09DD\u09DF';
var BN_DIGIT = '\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF';
var BN_KAR = '\u09BE\u09BF\u09C0\u09C1\u09C2\u09C3\u09C7\u09C8\u09CB\u09CC\u09D7';
var BN_SIGN = '\u0982\u0983\u0981';
var BN_ANTASHTA = '\u09DF\u09AF\u09B0\u09B2';   // য় য র ল — may follow a consonant directly (হয়, বয়স)
var BN_HASANT = '\u09CD';
var BN_NUKTA = '\u09BC';

function bnClassHas(cls, ch) { return !!ch && cls.indexOf(ch) > -1; }

function isBijoyRangeChar(ch) {
  // True when the Bijoy conversion table can consume this character.
  // Bytes 0x80-0xFF (‡, ©, ¯, ¡ ...) plus the cp1252 punctuation slots
  // (†, œ, “, ”, …) are the unmistakable markers of legacy Bijoy output;
  // ASCII letters/digits are table keys as well ('v' -> া, 'G' -> এ,
  // '0' -> ০), which is exactly what lets a pure-ASCII Bijoy word like
  // "Avgvi" convert at all.
  return BIJOY_CHAR_SET[ch] === true;
}

function hasAnyBijoyChar(raw) {
  for (var i = 0; i < raw.length; i++) if (BIJOY_CHAR_SET[raw.charAt(i)]) return true;
  return false;
}

function bijoyTokenHasStrongSignal(raw) {
  // A table character above ASCII is a Bijoy-only glyph — English text never
  // contains ‡ © ¯ ¡ ° ¨ † œ “ ” … — so one occurrence proves the token is
  // Bijoy-encoded and lets it bypass the orthography gate below.
  // (ASCII-only tokens stay ambiguous by nature: 'Ges' is "এবং" while
  // 'Google' is English.)
  for (var i = 0; i < raw.length; i++) {
    var code = raw.charCodeAt(i);
    if (code >= 0x80 && BIJOY_CHAR_SET[raw.charAt(i)]) return true;
  }
  return false;
}

function splitBijoyTokens(text) {
  // Whitespace-only split; separators come back as their own tokens so the
  // rebuild is byte-exact for everything that is left untouched.
  var parts = text.split(/(\s+)/);
  var tokens = [];
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '') continue;
    tokens.push({ raw: parts[i], isSpace: /^\s+$/.test(parts[i]) });
  }
  return tokens;
}

function bijoyTokenIsProtected(raw) {
  // User data that has to survive conversion. Emails, URLs and file paths
  // are plain ASCII, so decode-and-inspect can never tell them apart from
  // Bijoy bytes — match their shape explicitly instead.
  if (raw.indexOf('@') > -1) return true;
  if (raw.indexOf('/') > -1 || raw.indexOf('\\') > -1) return true;
  if (/^[A-Za-z0-9._%+-]+\.[A-Za-z]{2,}/.test(raw)) return true; // domain / file.ext
  return false;
}



function looksLikeConsonantSoup(decoded) {
  // Bangla words are vowel-bearing: a decode of 4+ characters built only from
  // consonants — no vowel sign, no ং/ঃ/ঁ, no hasant, no independent vowel — is
  // the signature of an English word pushed through the table ("Rahim" ->
  // জধযরস, "Kamal" -> কধসধষ, "Robin" -> জড়নরহ). Genuine Bangla words of that
  // shape are 1-2 letters (জজ, তত), which the length guard keeps working.
  if (decoded.length < 4) return false;
  for (var i = 0; i < decoded.length; i++) {
    var c = decoded.charAt(i);
    if (bnClassHas(BN_KAR, c) || bnClassHas(BN_SIGN, c) || bnClassHas(BN_INDEPENDENT_VOWEL, c) ||
        bnClassHas(BN_DIGIT, c) || c === BN_HASANT) return false;
  }
  return true;
}

function banglaWordShapeIsSane(decoded) {
  // Loose orthography gate, used for any token that carries a Bijoy-only glyph
  // or sits in a string that already proved it is Bijoy. It only rejects
  // decodes that cannot be Bangla at all, so genuine Bijoy words are never
  // left behind (that was the Phase 5 regression):
  //   - a word cannot start with ৎ / ঁ / ঃ / hasant / a vowel sign,
  //   - a nukta or hasant cannot stand alone,
  //   - Latin letters or digits left over mean the token was English,
  //   - two identical letters in a row are not Bangla ("Google" -> এড়ড়মষব,
  //     "Meet" -> গববঃ), except 2-letter words genuinely written that way
  //     (জজ, তত) and digits (১১),
  //   - a vowel-less run of 4+ letters is not a Bangla word ("Rahim").
  var n = decoded.length;
  if (!n) return false;
  if (looksLikeConsonantSoup(decoded)) return false;
  var first = decoded.charAt(0);
  if (first === '\u09CE' || bnClassHas(BN_KAR, first) || bnClassHas(BN_SIGN, first) ||
      first === BN_HASANT || first === BN_NUKTA) return false;
  var i = 0, sawBangla = false;
  while (i < n) {
    var c = decoded.charAt(i);
    if (bnClassHas(BN_DIGIT, c)) { sawBangla = true; i++; continue; }
    if (bnClassHas(BN_INDEPENDENT_VOWEL, c)) {
      sawBangla = true; i++;
      if (bnClassHas(BN_SIGN, decoded.charAt(i))) i++;
      continue;
    }
    if (bnClassHas(BN_CONSONANT, c)) {
      sawBangla = true;
      if (n > 2 && decoded.charAt(i + 1) === c) return false; // doubled letter
      i++;
      if (decoded.charAt(i) === BN_NUKTA) i++;                // decomposed ড়/ঢ়/য়
      while (decoded.charAt(i) === BN_HASANT) {               // cluster: ন্ত / ক্ষ
        i++;
        if (!bnClassHas(BN_CONSONANT, decoded.charAt(i))) return false;
        i++;
        if (decoded.charAt(i) === BN_NUKTA) i++;
      }
      if (bnClassHas(BN_KAR, decoded.charAt(i))) {
        i++;
        var extra = decoded.charAt(i);                        // decomposed ো / ৌ
        if (extra && (extra === '\u09BE' || extra === '\u09D7')) i++;
        if (bnClassHas(BN_KAR, decoded.charAt(i))) return false; // two vowel signs
      }
      if (bnClassHas(BN_SIGN, decoded.charAt(i))) i++;
      continue;
    }
    if (c === ' ' || c === '\u200C' || c === '\u200D') { i++; continue; }
    // Anything that is neither Bangla, Latin nor a digit is harmless residue
    // (':', '.', '-', '|', …); Latin/digits mean the decode was never Bangla.
    if (!/[A-Za-z0-9]/.test(c) && !(c >= '\u0980' && c <= '\u09FF')) { i++; continue; }
    return false;
  }
  return sawBangla;
}

function banglaWordShapeIsUnambiguous(decoded) {
  // Strict gate, used to *claim* that an all-ASCII token is Bijoy. On top of
  // the loose rules it forbids two consonants touching without a hasant,
  // unless the second one is an antastha semi-vowel (য় য র ল, as in হয়).
  // Without that, English words decode into legal-looking Bangla and get
  // converted ("of" -> ড়ভ, "world" -> ড়িৎষফ, "converter" -> পড়হাবৎঃবৎ).
  if (!banglaWordShapeIsSane(decoded)) return false;
  for (var i = 0; i < decoded.length - 1; i++) {
    var a = decoded.charAt(i), b = decoded.charAt(i + 1);
    if (!bnClassHas(BN_CONSONANT, a) || !bnClassHas(BN_CONSONANT, b)) continue;
    if (!bnClassHas(BN_ANTASHTA, b)) return false;
  }
  return true;
}

function bijoyDecodedLooksPlausible(decoded) {
  // Public name kept for the ambiguous all-ASCII case: the strict gate.
  return !!decoded && banglaWordShapeIsUnambiguous(decoded);
}

function bijoyTokenDecode(raw) {
  // Per-token verdict for the bijoy2uni direction:
  //   text   - the converted text, or null when the token must be passed
  //            through byte-identical,
  //   strong - the token carries a Bijoy-only glyph, so it is Bijoy for sure,
  //   strict - the decode is unambiguously Bangla, i.e. safe to use as
  //            *evidence* that an ASCII-only string is Bijoy at all.
  var none = { text: null, strong: false, strict: false };
  if (!raw || !hasAnyBijoyChar(raw)) return none;   // punctuation-only token
  if (bijoyTokenIsProtected(raw)) return none;      // email / URL / path
  var decoded = ConvertToUnicode(raw);
  if (decoded === raw) return none;                 // already Unicode, or nothing in the table matches
  if (bijoyTokenHasStrongSignal(raw)) return { text: decoded, strong: true, strict: true };
  // Ambiguous all-ASCII token: convert only if the decode cannot be Bangla at
  // all (loose), and treat it as *evidence* only if it is unambiguously Bangla.
  var sane = banglaWordShapeIsSane(decoded);
  return {
    text: sane ? decoded : null,
    strong: false,
    strict: sane && banglaWordShapeIsUnambiguous(decoded)
  };
}

function tokenShouldBijoyDecode(raw, strictOnly) {
  var d = bijoyTokenDecode(raw);
  return d.text !== null && (!strictOnly || d.strict);
}

function planBijoyTokenConversions(tokens) {
  // Single pass: per-token verdict plus the evidence counters that decide
  // whether the whole string is Bijoy at all. Kept in one pass so the DOCX
  // path (thousands of runs) never decodes a token twice.
  // ASCII-only tokens are measured with the strict gate, so an English word
  // can never be what makes a string look like Bijoy.
  var plan = { decoded: [], candidates: 0, asciiConvertible: 0, strong: false };
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    var d = t.isSpace ? null : bijoyTokenDecode(t.raw);
    plan.decoded.push(d);
    if (!d || d.text === null) continue;   // not convertible at all
    plan.candidates++;
    if (d.strong) plan.strong = true;
    else if (d.strict && t.raw.length >= 2) plan.asciiConvertible++;
  }
  return plan;
}

function textHasBijoyEvidence(tokens) {
  // Is this string Bijoy-encoded at all? One Bijoy-only glyph answers yes
  // (real Bijoy text always carries at least one of ে/র্/†/œ/©/¯ ...). With no
  // such glyph the string can still be Bijoy ("Avgvi"), so require a majority
  // of the word-like tokens to decode into unambiguously Bangla — that is what
  // keeps a plain English paragraph ("Hello world, this is a test of the
  // converter.") from being mangled.
  if (typeof tokens === 'string') tokens = splitBijoyTokens(tokens);
  var plan = planBijoyTokenConversions(tokens);
  if (plan.strong) return true;
  if (!plan.candidates) return false;
  return plan.asciiConvertible >= 1 && plan.asciiConvertible * 2 >= plan.candidates;
}


/* ------------------------------------------------------------
   3. DOM REFERENCES
------------------------------------------------------------ */
var els = {
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  shortcutsOpenBtn: document.getElementById('shortcuts-open-btn'),
  shortcutsCloseBtn: document.getElementById('shortcuts-close-btn'),
  shortcutsPanel: document.getElementById('shortcuts-panel'),
  shortcutsBackdrop: document.getElementById('shortcuts-backdrop'),
  directionSelector: document.getElementById('direction-selector'),
  liveModeBtn: document.getElementById('live-mode-btn'),
  convertBtn: document.getElementById('convert-btn'),
  convertBtnLabel: document.getElementById('convert-btn-label'),
  pasteBtn: document.getElementById('paste-btn'),
  fileUploadInput: document.getElementById('file-upload-input'),
  clearBtn: document.getElementById('clear-btn'),
  docxStrip: document.getElementById('docx-strip'),
  docxStripText: document.getElementById('docx-strip-text'),
  docxStripClear: document.getElementById('docx-strip-clear'),
  inputTextarea: document.getElementById('input-textarea'),
  sampleFillBtn: document.getElementById('sample-fill-btn'),
  inputCharCount: document.getElementById('input-char-count'),
  inputWordCount: document.getElementById('input-word-count'),
  swapBtn: document.getElementById('swap-btn'),
  outputPanel: document.querySelector('.panel--output'),
  copyBtn: document.getElementById('copy-btn'),
  downloadOpenBtn: document.getElementById('download-open-btn'),
  downloadModal: document.getElementById('download-modal'),
  downloadCloseBtn: document.getElementById('download-close-btn'),
  confirmModal: document.getElementById('confirm-modal'),
  confirmCloseBtn: document.getElementById('confirm-close-btn'),
  confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
  confirmOkBtn: document.getElementById('confirm-ok-btn'),
  undoBtn: document.getElementById('undo-btn'),
  redoBtn: document.getElementById('redo-btn'),
  infoBox: document.getElementById('info-box'),
  featuresOpenBtn: document.getElementById('features-open-btn'),
  converterView: document.getElementById('view-converter'),
  toolsNav: document.getElementById('tools-nav'),
  statusbar: document.getElementById('app-statusbar'),
  toolbar: document.getElementById('app-toolbar'),
  outputTextarea: document.getElementById('output-textarea'),
  outputCharCount: document.getElementById('output-char-count'),
  outputWordCount: document.getElementById('output-word-count'),
  encodingBadge: document.getElementById('encoding-badge'),
  encodingBadgeText: document.getElementById('encoding-badge-text'),
  processingIndicator: document.getElementById('processing-indicator'),
  banglaFontSelect: document.getElementById('bangla-font-select'),
  englishFontSelect: document.getElementById('english-font-select'),
  processingSpinner: document.getElementById('processing-spinner'),
  processingSuccessIcon: document.getElementById('processing-success-icon'),
  processingText: document.getElementById('processing-text'),
  processingProgress: document.getElementById('processing-progress'),
  processingProgressFill: document.getElementById('processing-progress-fill'),
  processingPercent: document.getElementById('processing-percent'),
  warningBadge: document.getElementById('warning-badge'),
  warningCount: document.getElementById('warning-count'),
  unmapModal: document.getElementById('unmap-modal'),
  unmapBackdrop: document.getElementById('unmap-backdrop'),
  unmapCloseBtn: document.getElementById('unmap-close-btn'),
  unmapPreview: document.getElementById('unmap-mail-preview'),
  unmapSendBtn: document.getElementById('unmap-send-btn'),
  unmapCopyBtn: document.getElementById('unmap-copy-btn'),
  offlineIndicator: document.getElementById('offline-indicator'),
  offlineIndicatorText: document.getElementById('offline-indicator-text'),
  toastContainer: document.getElementById('toast-container')
};

/* ------------------------------------------------------------
   4. APPLICATION STATE
------------------------------------------------------------ */
var appState = {
  liveMode: true,
  docxZip: null,
  docxFile: null,
  parsedData: [],
  patchedDocxXml: null,   // last converted word/document.xml (for table PDF)
  patchedDirection: null,
  outputEncoding: 'bijoy-to-unicode',
  banglaFont: null,      // resolved name from FONTS for the active encoding
  englishFont: null
};

var STORAGE_TEXT_KEY = 'lipilab:input-text';
var THEME_KEY = 'lipilab:theme';
var MODE_LABELS = {
  'unicode-to-bijoy': 'Unicode → Bijoy',
  'bijoy-to-unicode': 'Bijoy → Unicode'
};

/* ------------------------------------------------------------
   5. UTILITIES
------------------------------------------------------------ */
/* Notifications.
   Replaces the old bottom-centre toast: cards now drop in from the top-right,
   directly under the fixed app header, each with a 2s progress bar and a
   manual close (X). Hovering pauses the countdown so a message can be read.
   `kind` is one of success | error | info and only changes the icon/colour. */
var NOTIF_MS = 2000;
var NOTIF_MAX = 3;
var NOTIF_ICONS = {
  success: '<path d="M20 6L9 17l-5-5"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.5h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/>'
};

function dismissNotification(n) {
  if (!n || n.dataset.closing === '1') return;
  n.dataset.closing = '1';
  clearTimeout(n._timer);
  n.classList.add('notif--out');
  var done = function () { if (n.parentNode) n.parentNode.removeChild(n); };
  if (n.addEventListener) n.addEventListener('animationend', done, { once: true });
  setTimeout(done, 400); // fallback if the animation never fires
}

function showToast(message, kind) {
  var container = els.toastContainer;
  if (!container) return;
  var type = kind || (String(message).indexOf('Error') === 0 ? 'error' : 'success');
  if (!NOTIF_ICONS[type]) type = 'info';

  // Hard cap of NOTIF_MAX visible cards. The oldest is removed from the DOM
  // immediately (no exit animation) - animating it out would leave the stack
  // briefly over the limit, which is what the old toast did not do either.
  var live = container.querySelectorAll('.notif');
  while (live.length >= NOTIF_MAX) {
    var oldest = live[0];
    clearTimeout(oldest._timer);
    if (oldest.parentNode) oldest.parentNode.removeChild(oldest);
    live = container.querySelectorAll('.notif');
  }

  var n = document.createElement('div');
  n.className = 'notif notif--' + type;
  n.setAttribute('role', type === 'error' ? 'alert' : 'status');
  n.innerHTML =
    '<svg class="notif__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      NOTIF_ICONS[type] + '</svg>' +
    '<p class="notif__msg"></p>' +
    '<button type="button" class="notif__close" aria-label="Dismiss notification">' +
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.4" stroke-linecap="round" aria-hidden="true">' +
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>' +
    '<span class="notif__bar"></span>';
  n.querySelector('.notif__msg').textContent = message;
  n.querySelector('.notif__close').addEventListener('click', function () { dismissNotification(n); });
  container.appendChild(n);
  n._timer = setTimeout(function () { dismissNotification(n); }, NOTIF_MS);
}

function showProcessing(active, label, percent) {
  if (label) els.processingText.textContent = label;
  els.processingIndicator.hidden = !active;
  els.processingIndicator.classList.remove('processing-success', 'processing-idle');
  els.processingSpinner.hidden = false;
  els.processingSuccessIcon.hidden = true;
  if (typeof percent === 'number') {
    els.processingProgress.classList.add('processing-progress--show');
    els.processingProgressFill.style.width = Math.max(0, Math.min(100, percent)) + '%';
    els.processingPercent.textContent = Math.round(percent) + '%';
  } else {
    els.processingProgress.classList.remove('processing-progress--show');
    els.processingPercent.textContent = '';
  }
}

// Shared green-check finish row, used by conversions and by downloads.
function showStatusSuccess(label) {
  els.processingText.textContent = label;
  els.processingProgress.classList.remove('processing-progress--show');
  els.processingPercent.textContent = '';
  els.processingSpinner.hidden = true;
  els.processingSuccessIcon.hidden = false;
  els.processingIndicator.classList.remove('processing-idle');
  els.processingIndicator.classList.add('processing-success');
  els.processingIndicator.hidden = false;
}

function showConversionSuccess(mode) {
  showStatusSuccess(mode === 'unicode-to-bijoy' ? 'Successfully converted to Bijoy' : 'Successfully converted to Unicode');
}

/* ------------------------------------------------------------
   5b. DOWNLOAD FEEDBACK

   Every download button paints "Building <KIND> file…" the moment it is
   clicked and keeps that row up for the whole build; the green success row
   ("Download started successfully") appears only once the finished blob has
   really been handed to the browser. The build is deferred by one animation
   frame so the busy row is painted even when the blob is ready instantly
   (TXT) — and the hidden attribute on the indicator now really hides it
   (see the #processing-indicator[hidden] rule in styles.css).
------------------------------------------------------------ */
function triggerDownload(url, fileName) {
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function startDownload(kind, build, fileName) {
  showProcessing(true, 'Building ' + kind + ' file…');
  requestAnimationFrame(function () {
    Promise.resolve().then(build).then(function (blob) {
      var url = URL.createObjectURL(blob);
      triggerDownload(url, fileName);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      showStatusSuccess('Download started successfully');
    }).catch(function (err) {
      setStatusIdle();
      showToast('Error: ' + err.message);
    });
  });
}

function setStatusIdle() {
  els.processingText.textContent = 'Ready to convert';
  els.processingProgress.classList.remove('processing-progress--show');
  els.processingPercent.textContent = '';
  els.processingSpinner.hidden = true;
  els.processingSuccessIcon.hidden = true;
  els.processingIndicator.classList.remove('processing-success');
  els.processingIndicator.classList.add('processing-idle');
  els.processingIndicator.hidden = false;
}

/* Unicode -> Bijoy only: characters the SutonnyMJ map has no code point for
   survive in the output as Bengali characters. Returns how many were found and
   records each distinct one in `seen`, so the status badge can name them. */
function countUnmappable(outText, seen) {
  var leftover = outText.match(/[\u0980-\u09FF]/g);
  if (!leftover) return 0;
  for (var i = 0; i < leftover.length; i++) {
    if (seen && seen.indexOf(leftover[i]) === -1) seen.push(leftover[i]);
  }
  return leftover.length;
}

var lastUnmappableChars = [];

function setWarningBadge(count, chars) {
  els.warningCount.textContent = String(count);
  els.warningBadge.hidden = count === 0;
  lastUnmappableChars = count && chars ? chars : [];
  var noun = count === 1 ? '1 character has' : count + ' characters have';
  var msg = noun + ' no Bijoy (SutonnyMJ) equivalent — kept as Unicode: ';
  msg += lastUnmappableChars.length ? lastUnmappableChars.join(' ') : '—';
  msg += ' — click to report it';
  els.warningBadge.title = msg;
  els.warningBadge.setAttribute('aria-label', msg);
}

/* ------------------------------------------------------------
   5c. "MISSING CONVERTER CHARACTER" REPORT DIALOG

   The badge only says how many characters had no Bijoy code. Clicking it opens
   a dialog whose header carries the three actions (Send, Copy, Close) and whose
   body (1) explains in plain words that these characters are simply not in the
   converter list yet, (2) shows the exact report text — the missing characters
   only, never the user's own text — and (3) lets the user copy it or hand the
   mail app a ready-made mail: address, subject and body pre-filled, so the user
   only presses Send and the gap can be closed in a future update.
------------------------------------------------------------ */
var CONTACT_EMAIL_FALLBACK = 'unknownacone@gmail.com';
var unmapReportText = '';
var unmapLastFocused = null;

/* The address is read from the Contact / Support box in index.html, so editing
   the site's address keeps this button in sync — no second place to update. */
function contactEmail() {
  var link = document.querySelector('.support-mail');
  var mail = link ? String(link.getAttribute('href') || '') : '';
  mail = mail.replace(/^mailto:/i, '').split('?')[0].trim();
  if (!mail && link) mail = String(link.textContent || '').trim();
  return mail || CONTACT_EMAIL_FALLBACK;
}

function codePointHex(ch) {
  var hex = ch.charCodeAt(0).toString(16).toUpperCase();
  while (hex.length < 4) hex = '0' + hex;
  return 'U+' + hex;
}

/* The exact text behind Copy and Send — what the user sees is what is sent.
   It names the missing characters only: never the user's own text. */
function buildUnmapReport() {
  var chars = lastUnmappableChars || [];
  var report = [
    'Hi LipiLab team,',
    '',
    'I converted a text and ' + (chars.length === 1 ? 'this character is' : 'these characters are') +
      ' missing from the converter list,',
    'so they stayed as Unicode in the Bijoy output:',
    '',
    '   ' + chars.map(function (ch) { return ch + ' (' + codePointHex(ch) + ')'; }).join(', '),
    '',
    'Please add them to the SutonnyMJ (Bijoy) mapping in a future update.'
  ];
  return report.join('\n');
}

function openUnmapModal() {
  if (!lastUnmappableChars.length) {
    showToast('No unmappable characters in this conversion');
    return;
  }
  if (!els.unmapModal) { // markup missing (old cached HTML) — never dead-end
    showToast('No Bijoy code: ' + lastUnmappableChars.join(' ') + ' — left as Unicode');
    return;
  }
  unmapReportText = buildUnmapReport();
  if (els.unmapPreview) els.unmapPreview.textContent = unmapReportText;
  unmapLastFocused = document.activeElement || null;
  els.unmapModal.hidden = false;
  if (els.unmapSendBtn && els.unmapSendBtn.focus) els.unmapSendBtn.focus();
}

function closeUnmapModal() {
  if (!els.unmapModal || els.unmapModal.hidden) return;
  els.unmapModal.hidden = true;
  if (unmapLastFocused && typeof unmapLastFocused.focus === 'function') unmapLastFocused.focus();
}

/* ---- Generic dialog helpers (download picker, clear confirmation) ----
   Clicking the backdrop cancels, Escape closes, and focus returns to whatever
   opened the dialog. */
var dlgLastFocused = null;

function openDialog(dlg) {
  if (!dlg) return false;
  // Never stack two of our dialogs: close the other one first.
  if (els.downloadModal && els.downloadModal !== dlg && !els.downloadModal.hidden) closeDialog(els.downloadModal);
  if (els.confirmModal && els.confirmModal !== dlg && !els.confirmModal.hidden) closeDialog(els.confirmModal);
  dlgLastFocused = document.activeElement || null;
  dlg.hidden = false;
  // While a dialog is open, the fixed app header sits above the page but below the
  // dialog layer, so it must not be clickable or reachable by keyboard either.
  document.body.classList.add('dlg-open');
  // A blocking overlay must never sit on top of this dialog - hide the consent
  // ask while it is open (look it up directly: spotEls is filled in later).
  var ask = document.getElementById('ask-overlay');
  if (ask && ask.classList.contains('ask-overlay--show')) {
    ask.classList.remove('ask-overlay--show');
    dlg.askWasOpen = true;
  }
  var first = dlg.querySelector('.dlg__format, .dlg__btn--danger, .dlg__btn--ghost');
  if (first && first.focus) first.focus();
  return true;
}

function closeDialog(dlg) {
  if (!dlg || dlg.hidden) return;
  dlg.hidden = true;
  // Re-enable the header only once every dialog is closed.
  if (!document.querySelector('.dlg:not([hidden])')) document.body.classList.remove('dlg-open');
  if (dlgLastFocused && typeof dlgLastFocused.focus === 'function') dlgLastFocused.focus();
  dlgLastFocused = null;
}

/* Wire a dialog: close button and any [data-close] element.
   Pass { backdrop: false } to leave the backdrop click unbound - the download
   dialog does this, because a mis-click outside it should not throw away the
   choice the user was making. Close button and Escape still work. */
function wireDialog(dlg, closeBtn, opts) {
  if (!dlg) return;
  if (closeBtn) closeBtn.addEventListener('click', function () { closeDialog(dlg); });
  Array.prototype.forEach.call(dlg.querySelectorAll('[data-close]'), function (node) {
    if (opts && opts.backdrop === false) return;
    node.addEventListener('click', function () { closeDialog(dlg); });
  });
}

function openDownloadModal() {
  if (!openDialog(els.downloadModal)) { showToast('Download dialog unavailable'); return; }
  var adSlot = document.getElementById('spot-download');
  if (adSlot && !adSlot.dataset.filled && typeof renderPartnerSlot === 'function') {
    adSlot.dataset.filled = '1';
    renderPartnerSlot(adSlot, (typeof PARTNER !== 'undefined' && PARTNER.download) || '');
    if (!adSlot.innerHTML.trim()) adSlot.textContent = 'Advertisement';
  }
}

function copyUnmapReportFallback(text) {
  try {
    /* The page ships with user-select:none (styles.css body rule) and the
       preview no longer opts back in, so selection has to be re-enabled for a
       moment - otherwise addRange() has nothing execCommand('copy') can read. */
    var prevUserSelect = els.unmapPreview.style.userSelect;
    var prevWebkitUserSelect = els.unmapPreview.style.webkitUserSelect;
    els.unmapPreview.style.userSelect = 'text';
    els.unmapPreview.style.webkitUserSelect = 'text';
    var range = document.createRange();
    range.selectNodeContents(els.unmapPreview);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    var ok = document.execCommand('copy');
    sel.removeAllRanges();
    els.unmapPreview.style.userSelect = prevUserSelect;
    els.unmapPreview.style.webkitUserSelect = prevWebkitUserSelect;
    showToast(ok ? 'Report copied' : 'Copy failed — try again');
  } catch (e) {
    showToast('Copy failed — try again');
  }
}

function copyUnmapReport() {
  var text = unmapReportText || buildUnmapReport();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast('Report copied');
    }).catch(function () {
      copyUnmapReportFallback(text);
    });
  } else {
    copyUnmapReportFallback(text);
  }
}

/* Ready-made mail: to + subject + body already filled, the user just sends. */
function sendUnmapReport() {
  var body = unmapReportText || buildUnmapReport();
  var chars = (lastUnmappableChars || []).join(' ');
  var subject = 'LipiLab: characters missing from the converter list' + (chars ? ' — ' + chars : '');
  showToast('Opening your mail app…');
  window.location.href = 'mailto:' + contactEmail() +
    '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(body);
}

// Clicking the badge answers "what does unmappable mean?" inside the app.
function explainUnmappable() {
  openUnmapModal();
}

function countStats(text) {
  var chars = text.length;
  var words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  return { chars: chars, words: words };
}

function updateStats() {
  var inStats = countStats(els.inputTextarea.value);
  var outStats = countStats(els.outputTextarea.value);
  els.inputCharCount.textContent = inStats.chars;
  els.inputWordCount.textContent = inStats.words;
  els.outputCharCount.textContent = outStats.chars;
  els.outputWordCount.textContent = outStats.words;
  syncEmptyHint();
}

var SAMPLE_BN = 'বাংলা ভাষা আমাদের মাতৃভাষা। LipiLab দিয়ে ইউনিকোড থেকে বিজয় এবং বিজয় থেকে ইউনিকোডে সহজেই রূপান্তর করা যায়।';

function syncEmptyHint() {
  if (!els.inputTextarea) return;
  var body = els.inputTextarea.closest('.panel__body');
  if (!body) return;
  body.classList.toggle('has-text', els.inputTextarea.value.trim() !== '');
}

function fillSampleText() {
  if (!els.inputTextarea || els.inputTextarea.readOnly) return;
  els.inputTextarea.value = SAMPLE_BN;
  els.inputTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  els.inputTextarea.focus();
}

function resolveMode() {
  var checked = document.querySelector('input[name="conversion-direction"]:checked');
  var value = checked ? checked.value : 'unicode-to-bijoy';
  if (value === 'auto') {
    return /[\u0980-\u09FF]/.test(els.inputTextarea.value) ? 'unicode-to-bijoy' : 'bijoy-to-unicode';
  }
  return value;
}

function setEncodingBadge(resolvedMode) {
  var checked = document.querySelector('input[name="conversion-direction"]:checked');
  var rawValue = checked ? checked.value : 'unicode-to-bijoy';
  var label = rawValue === 'auto' ? ('Auto Detect → ' + MODE_LABELS[resolvedMode]) : MODE_LABELS[rawValue];
  els.encodingBadgeText.textContent = label;
  els.encodingBadge.setAttribute('data-encoding', rawValue);
  els.encodingBadge.setAttribute('aria-label', 'Mode: ' + label);
}

function applyEncodingFonts() {
  var mode = resolveMode();
  // Record the RESOLVED output encoding so the Bangla font list can follow the
  // output side (Auto still has to resolve before the list is meaningful).
  appState.outputEncoding = mode;
  appState.banglaFont = getSelectedBanglaFont();
  syncBanglaFontSelect();
  if (mode === 'unicode-to-bijoy') {
    els.inputTextarea.classList.remove('panel__textarea--bijoy');
    els.outputTextarea.classList.add('panel__textarea--bijoy');
    els.outputPanel.setAttribute('data-encoding-out', 'bijoy');
  } else {
    els.inputTextarea.classList.add('panel__textarea--bijoy');
    els.outputTextarea.classList.remove('panel__textarea--bijoy');
    els.outputPanel.setAttribute('data-encoding-out', 'unicode');
  }
  applyOutputPreviewFont();
}

function lockInputForDocx(locked) {
  els.inputTextarea.readOnly = locked;
  els.inputTextarea.classList.toggle('panel__textarea--locked', locked);
  if (locked) els.inputTextarea.setAttribute('aria-readonly', 'true');
  else els.inputTextarea.removeAttribute('aria-readonly');
}

var convertBtnBaseTitle = 'Convert (Ctrl+Enter)';

function setConvertButtonMode(docxLoaded) {
  // Convert button label stays fixed: always "Convert".
  els.convertBtnLabel.textContent = 'Convert';
  convertBtnBaseTitle = docxLoaded ? 'Convert the DOCX' : 'Convert (Ctrl+Enter)';
  updateConvertBtnState();
}

function updateConvertBtnState() {
  if (!els.convertBtn) return;
  // Live mode ON  -> Convert button disabled (conversion happens automatically).
  // Live mode OFF -> Convert button enabled.
  var liveOff = !appState.liveMode;
  var allow = liveOff;
  els.convertBtn.disabled = !allow;
  els.convertBtn.classList.toggle('is-disabled', !allow);
  els.convertBtn.setAttribute('aria-disabled', String(!allow));
  // A disabled button that still advertises "Ctrl+Enter" reads as a bug, so say
  // why it cannot be pressed (and stay silent, i.e. keep the mode/base title,
  // whenever it can).
  els.convertBtn.title = allow
    ? convertBtnBaseTitle
    : (appState.liveMode
        ? 'Live mode is ON — text converts as you type (Ctrl+L for manual convert)'
        : 'Free quota exceeded');
}

/* Single source of truth for the Live toggle: flips the flag, paints the
   switch + badge, and re-gates the Convert button. Called by the Live button
   and by every file upload, which forces Live OFF so the user converts by hand. */
function setLiveMode(on) {
  appState.liveMode = !!on;
  els.liveModeBtn.setAttribute('aria-checked', String(appState.liveMode));
  els.encodingBadge.classList.toggle('encoding-badge--live', appState.liveMode);
  updateConvertBtnState(); // live ON -> disabled, live OFF -> enabled
}

function updateDirectionPillPosition() {
  var checked = document.querySelector('input[name="conversion-direction"]:checked');
  if (!checked) return;
  var label = checked.nextElementSibling;
  var fieldRect = els.directionSelector.getBoundingClientRect();
  var labelRect = label.getBoundingClientRect();
  if (fieldRect.width === 0) return; // not laid out yet
  els.directionSelector.style.setProperty('--thumb-x', (labelRect.left - fieldRect.left - 4) + 'px');
  els.directionSelector.style.setProperty('--thumb-w', labelRect.width + 'px');
}

function updateOfflineIndicator() {
  var online = navigator.onLine;
  els.offlineIndicatorText.textContent = online ? 'Online' : 'Offline';
  els.offlineIndicator.setAttribute('aria-label', 'Network: ' + (online ? 'Online' : 'Offline'));
  els.offlineIndicator.classList.toggle('is-offline', !online);
}

function persistState() {
  try { localStorage.setItem(STORAGE_TEXT_KEY, els.inputTextarea.value); } catch (e) { /* storage unavailable — non-fatal */ }
  persistFontState();
}

function restoreState() {
  try {
    var saved = localStorage.getItem(STORAGE_TEXT_KEY);
    if (saved) { els.inputTextarea.value = saved; }
  } catch (e) { /* storage unavailable — non-fatal */ }
  if (typeof resolveMode === 'function') appState.outputEncoding = resolveMode();
  restoreFontState();
  syncBanglaFontSelect();
  syncEnglishFontSelect();
  applyOutputPreviewFont();
}

var liveConvertTimer = null;
function scheduleLiveConvert() {
  if (!appState.liveMode) return;
  clearTimeout(liveConvertTimer);
  var delay = els.inputTextarea.value.length > LARGE_TEXT_THRESHOLD ? 700 : 180;
  liveConvertTimer = setTimeout(convertPlainText, delay);
}

/* ------------------------------------------------------------
   6. THEME
------------------------------------------------------------ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  els.themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* non-fatal */ }
  syncThemeColorMeta(theme);
}

/* The browser chrome (address bar on mobile) is painted from the meta
   theme-color. Read the live --primary token so the one place that defines
   the brand colour stays the only place that does. */
function syncThemeColorMeta(theme) {
  if (!document.querySelector) return;
  try {
    var cs = window.getComputedStyle(document.documentElement);
    var primary = cs.getPropertyValue('--primary');
    if (!primary) return;
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var media = String(metas[i].getAttribute('media') || '');
      var wants = (theme === 'dark') ? /dark/.test(media) : !/dark/.test(media);
      if (wants) { metas[i].setAttribute('content', primary.trim()); return; }
    }
  } catch (e) { /* getComputedStyle unavailable - meta keeps its static value */ }
}

function initTheme() {
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable — non-fatal */ }
  applyTheme(saved || 'light');
}


function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ------------------------------------------------------------
   7. SHORTCUTS MODAL
------------------------------------------------------------ */
var lastFocusedEl = null;
function openShortcuts() {
  lastFocusedEl = document.activeElement;
  els.shortcutsPanel.hidden = false;
  els.shortcutsOpenBtn.setAttribute('aria-expanded', 'true');
  els.shortcutsCloseBtn.focus();
}
function closeShortcuts() {
  els.shortcutsPanel.hidden = true;
  els.shortcutsOpenBtn.setAttribute('aria-expanded', 'false');
  if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
}

/* ------------------------------------------------------------
   8. PLAIN-TEXT CONVERSION
   Unicode→Bijoy: tokenize, convert only Bangla-script tokens
   (identical granularity to index.html's handleConvert, which
   calls ConvertToASCII on each Bangla-run match individually).
   Bijoy→Unicode: whole string in one call — index.html never
   separates English from Bijoy here, because in Bijoy encoding
   Bangla glyphs and Latin ASCII share the same code points; the
   two are only distinguishable by font, not by character, so no
   separation is possible or attempted in this direction.
------------------------------------------------------------ */
var LARGE_TEXT_THRESHOLD = 20000; // characters — above this, convert in chunks with progress
var conversionRunId = 0;

// Shared guard: an empty box has nothing to convert or download.
function hasConvertibleText(text) {
  if (!text || !text.trim()) { showToast('Nothing to convert'); return false; }
  return true;
}

/* A manual Convert click gets the same statusbar feedback live mode shows while
   typing: the "Converting…" state (spinner + progress bar) is painted first,
   then the run starts on the next frame and reports its own progress and
   success exactly like the live path does. */
function startManualConvert(label, run) {
  showProcessing(true, label, 0);
  requestAnimationFrame(run);
}

function convertPlainText() {
  var text = els.inputTextarea.value;
  if (!text || !text.trim()) {
    conversionRunId++;
    els.outputTextarea.value = '';
    appState.parsedData = [];
    updateStats();
    setWarningBadge(0);
    setStatusIdle();
    persistState();
    return;
  }
  if (text.length > LARGE_TEXT_THRESHOLD) {
    convertPlainTextChunked(text);
  } else {
    convertPlainTextSync(text);
  }
}

function convertPlainTextSync(text) {
  conversionRunId++; // invalidate any in-flight chunked run
  var mode = resolveMode();
  setEncodingBadge(mode);
  appState.parsedData = [];
  var outputText = '';
  var unmappable = 0;
  var unmappableSeen = [];

  if (mode === 'unicode-to-bijoy') {
    var tokens = tokenizeMixedText(text);
    tokens.forEach(function (tok) {
      var item = { text: '', font: fontForPlainToken(tok, mode) };
      if (tok.type === 'bangla') {
        item.text = ConvertToASCII(tok.raw);
        unmappable += countUnmappable(item.text, unmappableSeen);
      } else if (tok.type === 'latin') {
        item.text = tok.raw;
      } else {
        item.text = tok.raw;
      }
      appState.parsedData.push(item);
      outputText += item.text;
    });
  } else {
    outputText = convertBijoyTextMixed(text);
    appState.parsedData.push({ text: outputText, font: getSelectedEnglishFont() });
  }

  els.outputTextarea.value = outputText;
  updateStats();
  applyEncodingFonts();
  setWarningBadge(mode === 'unicode-to-bijoy' ? unmappable : 0, unmappableSeen);
  showConversionSuccess(mode);
  maybeShowPostNote();
  persistState();
}

/* ------------------------------------------------------------
   8a. BIJOY -> UNICODE, MIXED CONTENT

   Phase 5 rework: this direction is delegated to the whitespace /
   Bijoy-table tokenizer in section 2b. tokenizeMixedText() (Unicode
   ranges) belongs to the Unicode -> Bijoy direction only — running it
   on Bijoy bytes split a single word into fragments that were then
   gated one by one, which is what made a whole Bijoy paragraph come
   out mostly unconverted.
------------------------------------------------------------ */
function convertBijoyTextMixed(text) {
  if (!text) return text;
  var tokens = splitBijoyTokens(text);
  var plan = planBijoyTokenConversions(tokens);
  var isBijoy = plan.strong ||
    (plan.candidates > 0 && plan.asciiConvertible >= 1 && plan.asciiConvertible * 2 >= plan.candidates);
  if (!isBijoy) return text; // no Bijoy evidence: leave the text byte-identical
  var out = '';
  for (var i = 0; i < tokens.length; i++) {
    var d = plan.decoded[i];
    // A Bijoy-only glyph anywhere in the string proves the whole string is
    // Bijoy, so every token that cannot be Bangla gets converted. Without that
    // proof the string is only *probably* Bijoy, so require the stricter
    // verdict per token before touching it.
    var use = d && d.text !== null && (plan.strong || d.strict);
    out += use ? d.text : tokens[i].raw;
  }
  return out;
}

// Splits a long string into chunks of roughly targetSize characters,
// only ever cutting at whitespace so a Bijoy/Bangla conjunct or word
// is never split across two chunks.
function splitIntoChunks(text, targetSize) {
  var chunks = [];
  var i = 0;
  while (i < text.length) {
    var end = Math.min(i + targetSize, text.length);
    if (end < text.length) {
      var nextSpace = text.indexOf(' ', end);
      var nextNewline = text.indexOf('\n', end);
      var boundary = -1;
      if (nextSpace === -1) boundary = nextNewline;
      else if (nextNewline === -1) boundary = nextSpace;
      else boundary = Math.min(nextSpace, nextNewline);
      end = boundary === -1 ? text.length : boundary + 1;
    }
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks;
}

function convertPlainTextChunked(text) {
  conversionRunId++;
  var runId = conversionRunId;
  var mode = resolveMode();
  setEncodingBadge(mode);
  appState.parsedData = [];
  var outputParts = [];
  var unmappable = 0;
  var unmappableSeen = [];
  showProcessing(true, 'Converting…', 0);

  if (mode === 'unicode-to-bijoy') {
    var tokens = tokenizeMixedText(text);
    var total = tokens.length;
    var idx = 0;
    var BATCH = 400;

    function step() {
      if (runId !== conversionRunId) return; // a newer run superseded this one
      var end = Math.min(idx + BATCH, total);
      for (; idx < end; idx++) {
        var tok = tokens[idx];
        var item = { text: '', font: fontForPlainToken(tok, mode) };
        if (tok.type === 'bangla') {
          item.text = ConvertToASCII(tok.raw);
          unmappable += countUnmappable(item.text, unmappableSeen);
        } else if (tok.type === 'latin') {
          item.text = tok.raw;
        } else {
          item.text = tok.raw;
        }
        appState.parsedData.push(item);
        outputParts.push(item.text);
      }
      showProcessing(true, 'Converting…', total ? (idx / total) * 100 : 100);
      if (idx < total) {
        requestAnimationFrame(step);
      } else {
        finish();
      }
    }

    function finish() {
      if (runId !== conversionRunId) return;
      els.outputTextarea.value = outputParts.join('');
      updateStats();
      applyEncodingFonts();
      setWarningBadge(unmappable, unmappableSeen);
      showConversionSuccess(mode);
      maybeShowPostNote();
      persistState();
    }

    requestAnimationFrame(step);
  } else {
    var chunks = splitIntoChunks(text, 4000);
    var totalChunks = chunks.length;
    var ci = 0;

    function stepRev() {
      if (runId !== conversionRunId) return;
      if (ci < totalChunks) {
        outputParts.push(convertBijoyTextMixed(chunks[ci]));
        ci++;
        showProcessing(true, 'Converting…', (ci / totalChunks) * 100);
        requestAnimationFrame(stepRev);
      } else {
        finishRev();
      }
    }

    function finishRev() {
      if (runId !== conversionRunId) return;
      var outputText = outputParts.join('');
      appState.parsedData.push({ text: outputText, font: getSelectedEnglishFont() });
      els.outputTextarea.value = outputText;
      updateStats();
      applyEncodingFonts();
      setWarningBadge(0);
      showConversionSuccess(mode);
      maybeShowPostNote();
      persistState();
    }

    requestAnimationFrame(stepRev);
  }
}

/* ------------------------------------------------------------
   SPOTS — choice prompt + post-convert small note
------------------------------------------------------------ */
var ASK_KEY = 'lipilab:ask-choice'; // 'yes' | 'no' | absent (not yet asked)
var ASK_AT_KEY = 'lipilab:ask-choice-at'; // timestamp (ms) of the last answer
var ASK_REASK_MS = 2 * 60 * 60 * 1000; // re-ask every 2 hours

var spotEls = {
  consentOverlay: document.getElementById('ask-overlay'),
  consentYes: document.getElementById('ask-yes'),
  consentNo: document.getElementById('ask-no'),
  postConvert: document.getElementById('post-note'),
  postConvertTimer: document.getElementById('post-note-timer')
};
var postNoteTimer = null;
var postNoteInterval = null;

function getAskChoice() {
  try { return localStorage.getItem(ASK_KEY); } catch (e) { return null; }
}
function getAskChoiceAt() {
  try {
    var v = parseInt(localStorage.getItem(ASK_AT_KEY), 10);
    return isNaN(v) ? 0 : v;
  } catch (e) { return 0; }
}
function setAskChoice(value) {
  try {
    localStorage.setItem(ASK_KEY, value);
    localStorage.setItem(ASK_AT_KEY, String(Date.now()));
  } catch (e) { /* non-fatal */ }
}

function initAskChoice() {
  // Ask on first visit, then re-ask every 2 hours so the choice stays fresh.
  if (getAskChoice() === null || (Date.now() - getAskChoiceAt() > ASK_REASK_MS)) {
    spotEls.consentOverlay.classList.add('ask-overlay--show');
  }
  spotEls.consentYes.addEventListener('click', function () {
    setAskChoice('yes');
    spotEls.consentOverlay.classList.remove('ask-overlay--show');
  });
  spotEls.consentNo.addEventListener('click', function () {
    setAskChoice('no');
    spotEls.consentOverlay.classList.remove('ask-overlay--show');
  });
}

// Shows the small post-convert note for ~10s, only if the person has
// opted in. Safe to call after every successful conversion — it
// no-ops silently when consent is 'no' or not yet given.
var POST_NOTE_COOLDOWN_MS = 1 * 60 * 1000; // 1 minute
var lastPostNoteShownAt = 0;

function maybeShowPostNote() {
  if (getAskChoice() !== 'yes') return;
  var now = Date.now();
  if (now - lastPostNoteShownAt < POST_NOTE_COOLDOWN_MS) return; // still on cooldown, don't re-trigger
  lastPostNoteShownAt = now;
  clearTimeout(postNoteTimer);
  clearInterval(postNoteInterval);
  var seconds = 10;
  spotEls.postConvertTimer.textContent = seconds + 's';
  spotEls.postConvert.setAttribute('aria-hidden', 'false');
  spotEls.postConvert.classList.add('post-note--show');
  postNoteInterval = setInterval(function () {
    seconds--;
    spotEls.postConvertTimer.textContent = Math.max(seconds, 0) + 's';
    if (seconds <= 0) clearInterval(postNoteInterval);
  }, 1000);
  postNoteTimer = setTimeout(function () {
    spotEls.postConvert.classList.remove('post-note--show');
    spotEls.postConvert.setAttribute('aria-hidden', 'true');
    clearInterval(postNoteInterval);
  }, 10000);
}

// Warns before an accidental refresh/tab-close while there is input
// text, so a slip doesn't wipe what was typed. Does nothing when the
// input box is empty (refresh/close stays instant).
function initRefreshGuard() {
  window.addEventListener('beforeunload', function (e) {
    var hasText = false;
    try {
      var ta = (typeof els !== 'undefined' && els.inputTextarea) || document.getElementById('input-textarea');
      hasText = !!(ta && ta.value && ta.value.trim() !== '');
    } catch (err) { hasText = false; }
    if (!hasText) return;
    e.preventDefault();
    e.returnValue = ''; // modern browsers show their own generic message
  });
}

// Blocker detection + gate. Uses a throwaway bait element whose name is
// assembled at runtime, so no filter-list keyword ever sits in this file.
function hasBlockerNow() {
  try {
    var bait = document.createElement('div');
    bait.setAttribute('class', ['a', 'ds', 'box'].join(''));
    bait.setAttribute('style', 'position:absolute!important;left:-9999px!important;top:-9999px!important;width:10px!important;height:10px!important;');
    document.body.appendChild(bait);
    var blocked = (bait.offsetParent === null) || (bait.offsetHeight === 0) || (bait.clientHeight === 0);
    try {
      var cs = window.getComputedStyle(bait);
      if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) blocked = true;
    } catch (e2) { /* ignore */ }
    bait.parentNode.removeChild(bait);
    return blocked;
  } catch (e) { return false; } // fail open — never lock out real users on error
}

function showGate() {
  var veil = document.getElementById('gate-veil');
  if (!veil || !veil.hidden) return;
  veil.hidden = false;
  try { document.body.style.overflow = 'hidden'; } catch (e) { /* ignore */ }
}
function hideGate() {
  var veil = document.getElementById('gate-veil');
  if (!veil || veil.hidden) return;
  veil.hidden = true;
  try { document.body.style.overflow = ''; } catch (e) { /* ignore */ }
}

function initGatekeep() {
  var btn = document.getElementById('gate-refresh-btn');
  if (btn) btn.addEventListener('click', function () { window.location.reload(); });
  // Let blockers apply first, then check. Re-check every 20s so turning
  // the blocker off (without refresh) unlocks the site by itself.
  setTimeout(function () { if (hasBlockerNow()) showGate(); }, 900);
  setInterval(function () {
    var veil = document.getElementById('gate-veil');
    if (veil && !veil.hidden && !hasBlockerNow()) hideGate();
  }, 20000);
}

/* ------------------------------------------------------------
   9. DOCX — BLANK GENERATION (no template uploaded)
   Adapted from index.html's downloadDoc(): identical minimal
   OOXML package, now built from a token array instead of being
   wired directly to the DOM.
------------------------------------------------------------ */
function buildBlankDocxBlob(tokens) {
  var xmlContent = '';
  tokens.forEach(function (item) {
    var safeText = item.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (safeText.indexOf('\n') > -1) {
      var parts = safeText.split('\n');
      parts.forEach(function (part, index) {
        if (part) {
          xmlContent += '<w:r><w:rPr><w:rFonts w:ascii="' + item.font + '" w:hAnsi="' + item.font + '" w:cs="' + item.font + '"/></w:rPr><w:t xml:space="preserve">' + part + '</w:t></w:r>';
        }
        if (index < parts.length - 1) xmlContent += '</w:p><w:p>';
      });
    } else {
      xmlContent += '<w:r><w:rPr><w:rFonts w:ascii="' + item.font + '" w:hAnsi="' + item.font + '" w:cs="' + item.font + '"/></w:rPr><w:t xml:space="preserve">' + safeText + '</w:t></w:r>';
    }
  });

  var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  var docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p>' + xmlContent + '</w:p></w:body></w:document>';

  var zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypes);
  zip.folder('_rels').file('.rels', rels);
  zip.folder('word').file('document.xml', docXml);
  zip.folder('word').folder('_rels').file('document.xml.rels', docRels);

  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

/* ------------------------------------------------------------
   10. DOCX — TEMPLATE ROUND-TRIP (load, patch, download)

   Design (new logic — this workflow did not exist in any
   reference file, so it is built fresh, but every decision
   below is anchored to an explicit requirement):

   Unicode → Bijoy: each <w:r> run's text is tokenized with the
   SAME tokenizer as the plain-text path. A run that mixes
   Bangla and non-Bangla is SPLIT into sibling runs — one per
   output side — each cloning the original <w:rPr> (so bold/
   italic/underline/size/color survive) and overriding only the
   font for the Bangla-converted piece.

   English font rule (this is what the two pickers promise, and
   what the plain-text path already did): non-Bangla pieces get
   the picked English font (Times New Roman by default) — but
   ONLY when the source run sat in a Bangla face. Keeping the
   source font unconditionally is what produced "the English came
   out in Kalpurush": a document whose every run is tagged Kalpurush
   (very common — the author picks one font for the whole file)
   otherwise rendered its English in a Bangla face. A run already
   in a real Latin face (Cambria, Times New Roman, Arial, Calibri)
   keeps the document author's own choice and is never touched.
   A run with no Bangla at all is font-only re-tagged; its text
   stays byte-identical.

   Bijoy → Unicode: there is no character-level way to tell
   Bijoy Bangla from English (same code points), exactly as in
   index.html. For DOCX the separation instead uses the run's
   *font name* — only runs tagged with a known Bijoy font are
   converted; everything else is left completely untouched (except
   the same English font rule above). This is the "appropriate
   Bijoy-font detection" the brief asks for. A converted run that
   carries embedded ASCII English is split the same way, so the
   English half does not inherit the Bangla face.

   Only <w:t> text and the <w:rFonts> font name are ever touched;
   <w:pPr> (alignment, list numbering, spacing) and the rest of
   <w:rPr> (bold/italic/underline/size/color) are never rewritten,
   only cloned, so paragraph/list/table formatting is preserved.
   <w:lastRenderedPageBreak/> is Word's cached pagination hint and
   is carried across a split rather than dropped.

   Known limitation (documented, not silently ignored): if a
   single Bangla word was already split across multiple <w:r>
   runs in the source document (this happens with spell-check or
   tracked-changes artifacts), each run is still tokenized on its
   own text. Cross-run word reconstruction is out of scope here.
------------------------------------------------------------ */
var BIJOY_FONT_NAMES = ['SutonnyMJ', 'SutonnyOMJ', 'Sutonny', 'SulekhaBangla', 'Ekushey', 'Bijoy', 'BijoyBangla'];
// Phase 2 fix: style-level fallback — a run with no direct rFonts inherits the
// paragraph style's font (w:pStyle -> styles.xml) and finally docDefaults.
// stylesDoc is optional (parsed styles.xml); null = run-level check only.
var UNICODE_TARGET_FONT = 'Nirmala UI'; // Phase 6 fix: Times New Roman has no Bangla glyphs — Nirmala UI ships with Windows and covers Bangla Unicode (matches the site's own demo files).

/* ------------------------------------------------------------
   OUTPUT FONT SELECTOR
   Single source of truth for font names. Adding a font later =
   append the name to the right list (and drop a file under /fonts/
   for the webfont); nothing else needs to change.

   `unicode` is ordered with Kalpurush first (the site's own brand face) and
   Nirmala UI last, where it still acts as a Unicode-safe fallback.
------------------------------------------------------------ */
var FONTS = {
  bijoy: ['SutonnyMJ', 'TonnyBanglaMJ'],
  unicode: ['Kalpurush', 'Nikosh', 'Shonar Bangla', 'Vrinda', 'SolaimanLipi', 'Nirmala UI'],
  english: ['Times New Roman', 'Cambria', 'Lucida Fax', 'Arial', 'Calibri']
};
var STORAGE_BANGLA_FONT_KEY = 'lipilab:bangla-font';
var STORAGE_ENGLISH_FONT_KEY = 'lipilab:english-font';

function currentOutputEncoding() {
  return appState.outputEncoding || 'bijoy-to-unicode';
}
function banglaListForEncoding(encoding) {
  return encoding === 'unicode-to-bijoy' ? FONTS.bijoy : FONTS.unicode;
}
function defaultBanglaFont(encoding) {
  return banglaListForEncoding(encoding)[0];
}
function defaultEnglishFont() {
  return FONTS.english[0];
}
/* A stored/incoming name that is not in the active list falls back to that
   list's default rather than crashing or leaving the select blank. */
function resolveFontName(name, list, fallback) {
  if (name && list.indexOf(name) !== -1) return name;
  return fallback;
}
function getSelectedBanglaFont() {
  var enc = currentOutputEncoding();
  return resolveFontName(appState.banglaFont, banglaListForEncoding(enc), defaultBanglaFont(enc));
}
function getSelectedEnglishFont() {
  return resolveFontName(appState.englishFont, FONTS.english, defaultEnglishFont());
}
/* Blank-DOCX generation (no template): a Bangla token renders in the Bangla
   pick, a Latin token in the English pick. */
function fontForPlainToken(tok, mode) {
  if (mode === 'unicode-to-bijoy') {
    if (tok.type === 'bangla') return getSelectedBanglaFont();
    if (tok.type === 'latin') return getSelectedEnglishFont();
    return tok.effectiveType === 'bangla' ? getSelectedBanglaFont() : getSelectedEnglishFont();
  }
  return getSelectedEnglishFont();
}
function persistFontState() {
  try {
    localStorage.setItem(STORAGE_BANGLA_FONT_KEY, getSelectedBanglaFont());
    localStorage.setItem(STORAGE_ENGLISH_FONT_KEY, getSelectedEnglishFont());
  } catch (e) { /* storage unavailable — non-fatal */ }
}
function restoreFontState() {
  var enc = currentOutputEncoding();
  var savedB = null, savedE = null;
  try {
    savedB = localStorage.getItem(STORAGE_BANGLA_FONT_KEY);
    savedE = localStorage.getItem(STORAGE_ENGLISH_FONT_KEY);
  } catch (e) { /* non-fatal */ }
  appState.banglaFont = resolveFontName(savedB, banglaListForEncoding(enc), defaultBanglaFont(enc));
  appState.englishFont = resolveFontName(savedE, FONTS.english, defaultEnglishFont());
}
/* Clear / new upload resets both picks to the defaults for the CURRENT output
   encoding, then persists them so a later reload agrees. */
function resetOutputFonts() {
  var enc = currentOutputEncoding();
  appState.banglaFont = defaultBanglaFont(enc);
  appState.englishFont = defaultEnglishFont();
  persistFontState();
  syncBanglaFontSelect();
  syncEnglishFontSelect();
}
function fillSelect(sel, names, selected) {
  if (!sel) return;
  sel.innerHTML = '';
  names.forEach(function (name) {
    var opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === selected) opt.selected = true;
    sel.appendChild(opt);
  });
}
function syncBanglaFontSelect() {
  fillSelect(els.banglaFontSelect, banglaListForEncoding(currentOutputEncoding()), getSelectedBanglaFont());
}
function syncEnglishFontSelect() {
  fillSelect(els.englishFontSelect, FONTS.english, getSelectedEnglishFont());
}
/* The preview textarea can only render one face, so it uses the Bangla pick.
   The pick must match the OUTPUT ENCODING, not just be "a Bangla font":
   Bijoy output is ANSI bytes that only a Bijoy face (SutonnyMJ /
   TonnyBanglaMJ) can shape, while Unicode output needs an Unicode face
   (Kalpurush / Nirmala UI / ...). Forcing the Unicode pick onto Bijoy
   output is what makes the previewed letters look torn apart, because the
   Unicode font lays the raw bytes out one by one instead of reordering
   them into conjuncts. --font-bijoy is the CSS fallback for exactly that
   reason; it only kicks in when the chosen Bijoy face is not installed.
   English is applied to the DOCX only. */
function applyOutputPreviewFont() {
  if (!els.outputTextarea) return;
  var isBijoyOutput = currentOutputEncoding() === 'unicode-to-bijoy';
  els.outputTextarea.style.fontFamily = isBijoyOutput
    ? '"' + getSelectedBanglaFont() + '", var(--font-bijoy)'
    : '"' + getSelectedBanglaFont() + '", var(--font-bangla)';
}
var WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
var XML_NS = 'http://www.w3.org/XML/1998/namespace';

function isBijoyFontName(name) {
  if (!name) return false;
  return BIJOY_FONT_NAMES.some(function (fn) { return name.toLowerCase() === fn.toLowerCase(); });
}

/* Windows/system Bangla faces that are not in either picker list but do turn up
   in real documents (the DOCX path reads the font off the file, not the picker). */
var EXTRA_BANGLA_FONT_NAMES = ['Mangal', 'Siyam Rupali', 'Aparajita'];

/* Is this a font that carries Bangla glyphs? Latin text tagged with one of
   these renders with a Bangla face — that is the "English came out in
   Kalpurush" report: a document whose every run (English included) is tagged
   Kalpurush keeps English in Kalpurush unless we re-tag it.
   Built from the SAME lists the two font pickers use (BIJOY_FONT_NAMES +
   FONTS.bijoy + FONTS.unicode) plus the few system faces above, so this stays
   a single source of truth — adding a font to a picker needs no second edit.
   A run already in a genuine Latin face (Cambria, Times New Roman, Arial,
   Calibri...) is deliberately NOT in this list, so a document's own English
   formatting always survives untouched. */
function isBanglaFontName(name) {
  if (!name) return false;
  var n = String(name).toLowerCase();
  return BIJOY_FONT_NAMES.concat(FONTS.bijoy, FONTS.unicode, EXTRA_BANGLA_FONT_NAMES)
    .some(function (fn) { return String(fn).toLowerCase() === n; });
}

function getRunFontName(rPrEl) {
  if (!rPrEl) return null;
  var rFonts = rPrEl.getElementsByTagName('w:rFonts')[0];
  if (!rFonts) return null;
  return rFonts.getAttribute('w:ascii') || rFonts.getAttribute('w:hAnsi') || rFonts.getAttribute('w:cs') || null;
}

function getStyleFontName(stylesDoc, styleId) {
  // Look up w:style[@w:styleId] -> w:rPr/w:rFonts in styles.xml.
  if (!stylesDoc || !styleId) return null;
  var styles = stylesDoc.getElementsByTagName('w:style');
  for (var i = 0; i < styles.length; i++) {
    if (styles[i].getAttribute('w:styleId') === styleId) {
      var rPr = styles[i].getElementsByTagName('w:rPr')[0];
      return getRunFontName(rPr || null);
    }
  }
  return null;
}

function getDocDefaultFontName(stylesDoc) {
  // word/styles.xml -> w:docDefaults/w:rPrDefault/w:rPr/w:rFonts.
  if (!stylesDoc) return null;
  var defs = stylesDoc.getElementsByTagName('w:docDefaults');
  if (!defs.length) return null;
  var rPr = defs[0].getElementsByTagName('w:rPr')[0];
  return getRunFontName(rPr || null);
}

function getParaStyleId(paraEl) {
  // w:p -> w:pPr/w:pStyle[@w:val].
  if (!paraEl) return null;
  var pPr = paraEl.getElementsByTagName('w:pPr')[0];
  if (!pPr) return null;
  var pStyle = pPr.getElementsByTagName('w:pStyle')[0];
  return pStyle ? (pStyle.getAttribute('w:val') || null) : null;
}

function getDefaultParagraphStyleId(stylesDoc) {
  // Discover the default paragraph style from styles.xml:
  // w:styles -> w:style[@w:type="paragraph" and @w:default="1"]/@w:styleId.
  // When no explicit default is declared, Word falls back to "Normal".
  if (!stylesDoc) return 'Normal';
  var styles = stylesDoc.getElementsByTagName('w:style');
  for (var i = 0; i < styles.length; i++) {
    var st = styles[i];
    var type = st.getAttribute('w:type');
    var isDef = st.getAttribute('w:default');
    if ((type === 'paragraph' || !type) && (isDef === '1' || isDef === 'true')) {
      return st.getAttribute('w:styleId') || 'Normal';
    }
  }
  return 'Normal';
}

function getEffectiveFontName(runEl, stylesDoc) {
  // Run-level first, then paragraph-style, then docDefaults. stylesDoc may
  // be null (e.g. minimal harness) — then this degrades to run-level only.
  var rPrEl = runEl.getElementsByTagName('w:rPr')[0] || null;
  var name = getRunFontName(rPrEl);
  if (name) return name;
  if (!stylesDoc) return null;
  var para = runEl.parentNode;
  while (para && (para.localName || (para.nodeName || '').split(':').pop()) !== 'p') para = para.parentNode;
  var styleId = getParaStyleId(para);
  name = getStyleFontName(stylesDoc, styleId || getDefaultParagraphStyleId(stylesDoc));
  if (name) return name;
  return getDocDefaultFontName(stylesDoc);
}

function ensureRunFonts(rPrEl, doc) {
  var rFonts = rPrEl.getElementsByTagName('w:rFonts')[0];
  if (rFonts) return rFonts;
  rFonts = doc.createElementNS(WORD_NS, 'w:rFonts');
  var rStyle = rPrEl.getElementsByTagName('w:rStyle')[0];
  if (rStyle) rPrEl.insertBefore(rFonts, rStyle.nextSibling);
  else rPrEl.insertBefore(rFonts, rPrEl.firstChild);
  return rFonts;
}

function setRunFont(rFontsEl, fontName) {
  rFontsEl.setAttribute('w:ascii', fontName);
  rFontsEl.setAttribute('w:hAnsi', fontName);
  rFontsEl.setAttribute('w:cs', fontName);
  rFontsEl.setAttribute('w:eastAsia', fontName);
  rFontsEl.removeAttribute('w:asciiTheme');
  rFontsEl.removeAttribute('w:hAnsiTheme');
  rFontsEl.removeAttribute('w:cstheme');
  rFontsEl.removeAttribute('w:eastAsiaTheme');
}

function setRunLang(rPrEl, doc) {
  // Phase 6 fix: tag converted runs as Bangla so Word/LibreOffice apply
  // correct line-breaking and spell-check language instead of English.
  var lang = rPrEl.getElementsByTagName('w:lang')[0];
  if (!lang) {
    lang = doc.createElementNS(WORD_NS, 'w:lang');
    rPrEl.appendChild(lang);
  }
  lang.setAttribute('w:val', 'bn-BD');
}

function runFontKey(runEl) {
  var rPrEl = runEl.getElementsByTagName('w:rPr')[0] || null;
  var name = getRunFontName(rPrEl);
  return (name || '').toLowerCase();
}

function runRPrSignature(runEl) {
  // Phase 1 fix: full-formatting merge key. Two runs merge only when their
  // entire <w:rPr> serializes identically (font AND bold/italic/underline/
  // size/color/...). Missing rPr normalizes to '' so two unformatted runs
  // still merge; any formatting difference blocks the merge instead of
  // silently dropping the second run's styling.
  var rPrEl = runEl.getElementsByTagName('w:rPr')[0] || null;
  if (!rPrEl) return '';
  try {
    // XMLSerializer preserves attribute/child order, so byte-identical
    // output means semantically identical formatting. Semantically-equal
    // but differently-ordered rPr just misses a merge (safe direction).
    return new XMLSerializer().serializeToString(rPrEl);
  } catch (e) {
    // Fallback for non-browser harnesses: font-only key (old behavior).
    return 'font:' + runFontKey(runEl);
  }
}

// True only for runs holding nothing but properties + text (no tab,
// break, drawing, bookmark, field, etc.).
// w:lastRenderedPageBreak is explicitly allowed: it is Word's cached
// pagination hint from the last repaint, carries no text and no formatting,
// and Word recomputes it on the next one. Treating it as "not plain text"
// made the whole run skip conversion, so its Bangla stayed Unicode while the
// rest of the paragraph converted — a real miss on real documents.
function runIsPlainText(runEl) {
  var kids = runEl.childNodes;
  var hasT = false;
  for (var i = 0; i < kids.length; i++) {
    var k = kids[i];
    if (!k || k.nodeType !== 1) continue;
    var n = k.localName || (k.nodeName && k.nodeName.split(':').pop()) || '';
    if (n === 'rPr') continue;
    if (n === 't') { hasT = true; continue; }
    if (n === 'lastRenderedPageBreak') continue;
    return false;
  }
  return hasT;
}

function runText(runEl) {
  var ts = runEl.getElementsByTagName('w:t');
  var s = '';
  for (var i = 0; i < ts.length; i++) s += ts[i].textContent;
  return s;
}

/* Cross-run merge (Task A fix + Phase 1 fix): Word splits words across
   runs (spellcheck artifacts like w:proofErr, formatting edits), and
   converting each fragment alone garbles words (e.g. "Dw" → "উি").
   This pre-pass joins consecutive plain-text runs inside each paragraph
   into the first run (which keeps its formatting); emptied runs keep
   their structure with blank text. Structural runs (tabs, breaks,
   drawings…) always break a group and are untouched.
   Phase 1: merge key is the FULL rPr signature (font+bold+italic+size+
   color+...), not font name alone — runs with different formatting never
   merge, so no styling is silently lost.
   Phase 4: the equality test lives in runsHaveSameRPr() — the single
   shared helper used by BOTH the pre-pass (mergeSameFontRuns, before the
   split) and the post-pass (mergeSameFontRuns again, after the split)
   plus the in-split grouping (mergeAdjacentRuns). No second copy. */
function runsHaveSameRPr(a, b) {
  return runRPrSignature(a) === runRPrSignature(b);
}
function mergeSameFontRuns(doc) {
  var paras = doc.getElementsByTagName('w:p');
  for (var pi = 0; pi < paras.length; pi++) {
    var kids = paras[pi].childNodes;
    var firstRun = null, firstT = null;
    var flush = function () { firstRun = null; firstT = null; };
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (!k || k.nodeType !== 1) continue;
      var n = k.localName || (k.nodeName && k.nodeName.split(':').pop()) || '';
      if (n === 'proofErr') continue; // spellcheck marker: no text, never breaks a word
      if (n !== 'r' || !runIsPlainText(k)) { flush(); continue; }
      var ts = k.getElementsByTagName('w:t');
      if (firstRun && runsHaveSameRPr(firstRun, k)) {
        var txt = runText(k);
        if (txt) {
          firstT.textContent = firstT.textContent + txt;
          firstT.setAttributeNS(XML_NS, 'xml:space', 'preserve');
        }
        for (var j = 0; j < ts.length; j++) {
          ts[j].textContent = '';
          ts[j].setAttributeNS(XML_NS, 'xml:space', 'preserve');
        }
      } else {
        firstRun = k;
        firstT = ts[0];
      }
    }
  }
}

/* Group a token list into maximal runs of ONE output side ('bangla' or
   'latin'), so a run of N tokens becomes far fewer runs on disk instead of one
   run per token. Whitespace and punctuation ('space'/'other') inherit the
   surrounding side — the same effectiveType rule tokenizeMixedText() already
   applies for plain text — so `word + space + word` stays ONE Bangla group
   rather than three. Leading whitespace (no side yet) looks ahead to the first
   content token; a space renders identically in either font and both
   ConvertToASCII() and ConvertToUnicode() pass ASCII whitespace through
   byte-identical, so attaching it to the first group is always safe. */
function groupTokensBySide(tokens) {
  function tokenSide(tok) {
    if (tok.type === 'bangla') return 'bangla';
    return tok.effectiveType === 'bangla' ? 'bangla' : 'latin';
  }
  var firstContentSide = 'latin';
  for (var fi = 0; fi < tokens.length; fi++) {
    if (tokens[fi].type !== 'space' && tokens[fi].type !== 'other') {
      firstContentSide = tokenSide(tokens[fi]);
      break;
    }
  }
  var groups = [];
  tokens.forEach(function (tok) {
    var isWS = (tok.type === 'space' || tok.type === 'other');
    var side = isWS && groups.length === 0 ? firstContentSide : tokenSide(tok);
    var last = groups[groups.length - 1];
    if (last && last.side === side) last.raws.push(tok.raw);
    else groups.push({ side: side, raws: [tok.raw] });
  });
  return groups;
}

/* The English font to stamp on Latin pieces of this run, or null to leave the
   run's own font alone. A run tagged with a Bangla face (the very common
   "every run in this document is Kalpurush / SutonnyMJ" case) has English
   that would render in that Bangla face, so it gets the picked English font
   instead. A run that already carries a genuine Latin face (Cambria, Times New
   Roman, Arial, Calibri...) is the document author's own English formatting
   and is left exactly as it is. */
function englishFontForRun(runEl, stylesDoc) {
  var src = getEffectiveFontName(runEl, stylesDoc || null);
  return isBanglaFontName(src) ? getSelectedEnglishFont() : null;
}

/* A run with no Bangla in it (English-only, or punctuation) still needs the
   same font treatment when it sits in a Bangla face. Two guards keep this
   from touching more than it must:
     - whitespace-only runs are skipped (applySpaceRunFonts() owns those), and
     - so are runs with no letter/digit at all: a pure "---" or "====" divider
       is decorative, the author chose its font on purpose, and re-tagging it
       buys nothing. Every run that actually carries English (letters or ASCII
       digits, e.g. "71 ভাগ") is re-tagged. */
function retagEnglishOnlyRun(runEl, doc, rPrEl, text, stylesDoc) {
  if (!/[A-Za-z0-9]/.test(text || '')) return false;
  var english = englishFontForRun(runEl, stylesDoc);
  if (!english) return false; // already a real Latin font — document's own, keep it
  if (!rPrEl) { rPrEl = doc.createElementNS(WORD_NS, 'w:rPr'); runEl.insertBefore(rPrEl, runEl.firstChild); }
  setRunFont(ensureRunFonts(rPrEl, doc), english);
  return true;
}

/* Replace `runEl` with one <w:r> per side-group (see groupTokensBySide). Every
   new run clones the original <w:rPr>, so bold/italic/underline/size/colour/
   spacing all survive; only the FONT is overridden:
     - Bangla side -> the picked Bangla font, after `convertBangla` when given
       (pass null when the text is already in its final encoding)
     - Latin side  -> `englishFontName`, or the original font when that is null
   `tagBanglaLang` adds w:lang="bn-BD" to the Bangla runs only, so English
   pieces keep the document's own language tag. */
function replaceRunWithSideGroups(runEl, doc, rPrEl, groups, convertBangla, englishFontName, tagBanglaLang) {
  var newRuns = groups.map(function (g) {
    var newRun = doc.createElementNS(WORD_NS, 'w:r');
    var newRPr = rPrEl ? rPrEl.cloneNode(true) : null;
    var text = g.raws.join('');
    if (g.side === 'bangla') {
      if (convertBangla) text = convertBangla(text);
      if (!newRPr) newRPr = doc.createElementNS(WORD_NS, 'w:rPr');
      setRunFont(ensureRunFonts(newRPr, doc), getSelectedBanglaFont());
      if (tagBanglaLang) setRunLang(newRPr, doc);
    } else if (englishFontName) {
      if (!newRPr) newRPr = doc.createElementNS(WORD_NS, 'w:rPr');
      setRunFont(ensureRunFonts(newRPr, doc), englishFontName);
    }
    if (newRPr) newRun.appendChild(newRPr);
    var newT = doc.createElementNS(WORD_NS, 'w:t');
    newT.setAttributeNS(XML_NS, 'xml:space', 'preserve');
    newT.textContent = text;
    newRun.appendChild(newT);
    return newRun;
  });
  // Merge adjacent new runs with identical rPr before inserting, so a mixed run
  // of N tokens does not become N runs on disk: Bangla pieces share the same
  // font-tagged rPr and consecutive spaces/punctuation share the original one,
  // so both collapse back and the run count stays near the original.
  newRuns = mergeAdjacentRuns(newRuns, doc);
  // Word's cached page-break hint is not part of rPr, so cloning rPr drops it.
  // Carry it onto the first new run (after its rPr) so splitting a run does not
  // silently discard it; Word recomputes it on the next repaint anyway.
  var pageBreak = null;
  for (var ci = 0; ci < runEl.childNodes.length; ci++) {
    var ck = runEl.childNodes[ci];
    if (!ck || ck.nodeType !== 1) continue;
    if ((ck.localName || (ck.nodeName || '').split(':').pop()) === 'lastRenderedPageBreak') { pageBreak = ck; break; }
  }
  if (pageBreak && newRuns.length) {
    var first = newRuns[0];
    var firstRPr = first.getElementsByTagName('w:rPr')[0];
    var clonedBreak = pageBreak.cloneNode(true);
    if (firstRPr && firstRPr.nextSibling) first.insertBefore(clonedBreak, firstRPr.nextSibling);
    else first.appendChild(clonedBreak);
  }
  var parent = runEl.parentNode;
  newRuns.forEach(function (r) { parent.insertBefore(r, runEl); });
  parent.removeChild(runEl);
  return newRuns;
}

function splitRunForConversion(runEl, doc, direction, stylesDoc, counter) {
  // Phase 3 fix: only plain-text runs are convertible. A wrapper run that
  // holds w:pict/w:drawing (VML/DrawingML textbox, image, shape...) is
  // skipped entirely — its descendant w:t nodes belong to the nested
  // txbxContent sub-document, not to this run. Runs *inside* txbxContent
  // are plain-text runs themselves, so they are still converted normally
  // when the global w:r loop reaches them; they are never merged with
  // outer-paragraph runs because mergeSameFontRuns groups per-w:p.
  if (!runIsPlainText(runEl)) return 0;
  var tEls = runEl.getElementsByTagName('w:t');
  if (!tEls.length) return; // w:tab, w:br, drawings, etc. — nothing to convert
  var originalText = '';
  for (var ti = 0; ti < tEls.length; ti++) originalText += tEls[ti].textContent;
  if (!originalText) return 0;

  var rPrEl = runEl.getElementsByTagName('w:rPr')[0] || null;

  // A run can hold several w:t nodes (Word splits text inside runs too).
  // Converted text always goes into the first one; the rest are emptied.
  // Phase 7 policy: w:delText (tracked-change deletions) is NEVER touched —
  // deleted content must stay byte-identical so accept/reject in Word keeps
  // working. Only live w:t nodes convert.
  function setRunText(converted) {
    tEls[0].textContent = converted;
    tEls[0].setAttributeNS(XML_NS, 'xml:space', 'preserve');
    for (var k = 1; k < tEls.length; k++) {
      tEls[k].textContent = '';
      tEls[k].setAttributeNS(XML_NS, 'xml:space', 'preserve');
    }
  }

  if (direction === 'bijoy2uni') {
    // Phase 2 fix: effective font — run-level, else paragraph style, else
    // docDefaults. Unknown/unsupported fonts are left untouched and counted
    // as 0 so patchDocumentXmlString can raise the zero-conversion warning.
    var currentFont = getEffectiveFontName(runEl, stylesDoc || null);
    if (!isBijoyFontName(currentFont)) return 0; // not Bijoy-tagged — leave untouched
    // Phase 5 fix (DOCX): same per-token Bijoy-range gate as plain text —
    // a Bijoy run with embedded ASCII ("Avgvi hello") keeps its English.
    var convertedText = convertBijoyTextMixed(originalText);

    // English font fix: this run was tagged with a Bijoy face, so ASCII
    // English carried inside it used to be stamped with that Bangla font and
    // rendered as Kalpurush/Nirmala. The output is Unicode by now, so the
    // shared tokenizer can split it by side: Bangla -> the picked Bangla
    // font, English -> the picked English font.
    var bGroups = groupTokensBySide(tokenizeMixedText(convertedText));
    var bHasEnglish = bGroups.some(function (g) {
      return g.side === 'latin' && /[A-Za-z0-9]/.test(g.raws.join(''));
    });

    if (bHasEnglish) {
      // Mixed output — convertBangla is null: the text is already Unicode.
      replaceRunWithSideGroups(runEl, doc, rPrEl, bGroups, null, getSelectedEnglishFont(), true);
      if (counter) counter.converted++;
      return 1;
    }

    setRunText(convertedText);
    if (!rPrEl) { rPrEl = doc.createElementNS(WORD_NS, 'w:rPr'); runEl.insertBefore(rPrEl, runEl.firstChild); }
    setRunFont(ensureRunFonts(rPrEl, doc), getSelectedBanglaFont());
    setRunLang(rPrEl, doc);
    if (counter) counter.converted++;
    return 1;
  }

  // direction === 'uni2bijoy'
  var tokens = tokenizeMixedText(originalText);
  var hasBangla = tokens.some(function (t) { return t.type === 'bangla'; });
  if (!hasBangla) {
    // Nothing to convert in this run — but the text can still be English
    // sitting in a Bangla face, which is how a document whose every run is
    // Kalpurush ends up rendering its English in Kalpurush. Re-tag the FONT
    // only; the text itself stays byte-identical.
    retagEnglishOnlyRun(runEl, doc, rPrEl, originalText, stylesDoc);
    return 0;
  }

  if (tokens.length === 1) {
    // whole run is a single Bangla token — convert in place, no split needed
    setRunText(ConvertToASCII(tokens[0].raw));
    if (!rPrEl) { rPrEl = doc.createElementNS(WORD_NS, 'w:rPr'); runEl.insertBefore(rPrEl, runEl.firstChild); }
    setRunFont(ensureRunFonts(rPrEl, doc), getSelectedBanglaFont());
    if (counter) counter.converted++;
    return 1;
  }

  // One <w:r> per maximal same-output-side group (Phase 4), each cloning the
  // original <w:rPr> so bold/italic/underline/size/colour survive untouched.
  // English font fix: Latin pieces get the picked English font when the source
  // run sat in a Bangla face; a run already in a real Latin face keeps its own.
  replaceRunWithSideGroups(
    runEl, doc, rPrEl,
    groupTokensBySide(tokens),
    convertBanglaGroupToBijoy,
    englishFontForRun(runEl, stylesDoc),
    false
  );
  if (counter) counter.converted++;
  return 1;
}

function convertBanglaGroupToBijoy(text) {
  // ConvertToASCII() ends in ReArrangeUnicodeText(), which .trim()s its input
  // (it is built for whole-paragraph conversion, where trimming is harmless).
  // The DOCX path, however, hands it a *group* of tokens that legitimately
  // starts and/or ends with whitespace — "সাইক্লিন " — and the trim silently
  // deleted that space, welding the converted word to the next run
  // ("…fvlv|A." instead of "…fvlv| A.").
  //
  // Fix: convert only the non-whitespace core and re-attach the surrounding
  // whitespace byte-identical. ConvertToASCII passes ASCII whitespace through
  // unchanged anyway, so this is lossless — it just stops the trim from
  // eating it. Whitespace-only groups are returned untouched.
  var lead = text.match(/^\s+/);
  var tail = text.match(/\s+$/);
  var leadStr = lead ? lead[0] : '';
  var tailStr = tail ? tail[0] : '';
  var core = text.slice(leadStr.length, text.length - tailStr.length);
  if (!core) return text;
  return leadStr + ConvertToASCII(core) + tailStr;
}

function mergeAdjacentRuns(runs, doc) {
  // Phase 4 in-split grouping: same shared equality rule (runsHaveSameRPr)
  // as the pre/post passes — only byte-identical rPr signatures merge.
  // Text concatenates into the first run's w:t.
  if (runs.length < 2) return runs;
  var out = [runs[0]];
  for (var i = 1; i < runs.length; i++) {
    var prev = out[out.length - 1];
    var cur = runs[i];
    if (runsHaveSameRPr(prev, cur)) {
      var pt = prev.getElementsByTagName('w:t')[0];
      var ct = cur.getElementsByTagName('w:t')[0];
      if (pt && ct) {
        pt.textContent = pt.textContent + ct.textContent;
        pt.setAttributeNS(XML_NS, 'xml:space', 'preserve');
      }
    } else {
      out.push(cur);
    }
  }
  return out;
}

function collectDocText(doc) {
  var ts = doc.getElementsByTagName('w:t');
  var text = '';
  for (var i = 0; i < ts.length; i++) text += ts[i].textContent || '';
  return text;
}

function spaceFontForDocText(text) {
  var bangla = 0;
  var english = 0;
  if (text) {
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c >= 0x0980 && c <= 0x09FF) bangla++;
      else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) english++;
    }
  }
  return bangla >= english ? getSelectedBanglaFont() : getSelectedEnglishFont();
}

function applySpaceRunFonts(doc, fontName) {
  if (!fontName) return;
  var runs = doc.getElementsByTagName('w:r');
  for (var i = 0; i < runs.length; i++) {
    var runEl = runs[i];
    if (!runIsPlainText(runEl)) continue;
    var text = runText(runEl);
    if (!text || text.trim()) continue;
    var rPrEl = runEl.getElementsByTagName('w:rPr')[0];
    if (!rPrEl) {
      rPrEl = doc.createElementNS(WORD_NS, 'w:rPr');
      runEl.insertBefore(rPrEl, runEl.firstChild);
    }
    setRunFont(ensureRunFonts(rPrEl, doc), fontName);
  }
}

function patchDocumentXmlString(xmlString, direction, stylesDoc, counter) {
  var doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Could not parse DOCX XML');
  mergeSameFontRuns(doc); // pre-pass: join split words first (see above)
  var spaceFont = direction === 'uni2bijoy' ? spaceFontForDocText(collectDocText(doc)) : null;
  var runs = Array.prototype.slice.call(doc.getElementsByTagName('w:r'));
  var local = counter || { converted: 0 };
  runs.forEach(function (r) { splitRunForConversion(r, doc, direction, stylesDoc || null, local); });
  // Phase 4 post-pass: same shared helper as the pre-pass. Re-consolidates
  // the runs splitRunForConversion just produced (plus the pre-pass's empty
  // placeholders) so adjacent same-formatting runs land merged on disk
  // instead of exploded. Bijoy→Unicode runs convert in place (no split),
  // so this pass is a no-op there by construction.
  mergeSameFontRuns(doc);
  if (direction === 'bijoy2uni') spaceFont = spaceFontForDocText(collectDocText(doc));
  applySpaceRunFonts(doc, spaceFont);
  var serialized = new XMLSerializer().serializeToString(doc);
  if (serialized.indexOf('<?xml') !== 0) {
    serialized = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + serialized;
  }
  // Backward-compatible: old call sites use the string directly; new call
  // sites pass a counter object to read local.converted (Phase 2 warning).
  if (!counter) return serialized;
  return { xml: serialized, converted: local.converted };
}


function extractPreviewText(xmlString) {
  // No truncation: the full document's text is shown, however long it is.
  var doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  var paragraphs = Array.prototype.slice.call(doc.getElementsByTagName('w:p'));
  var lines = paragraphs.map(function (p) {
    var ts = Array.prototype.slice.call(p.getElementsByTagName('w:t'));
    return ts.map(function (t) { return t.textContent; }).join('');
  });
  return lines.join('\n');
}

function findHeaderFooterParts(zip) {
  var relsFile = zip.file('word/_rels/document.xml.rels');
  if (!relsFile) return Promise.resolve([]);
  return relsFile.async('string').then(function (relsXml) {
    var doc = new DOMParser().parseFromString(relsXml, 'application/xml');
    var rels = Array.prototype.slice.call(doc.getElementsByTagName('Relationship'));
    var parts = [];
    rels.forEach(function (rel) {
      var type = rel.getAttribute('Type') || '';
      var target = rel.getAttribute('Target') || '';
      // Phase 7 fix: footnotes/endnotes/comments ride along with
      // headers/footers — same patchDocumentXmlString path, no new logic.
      if (type.indexOf('/header') > -1 || type.indexOf('/footer') > -1 ||
          type.indexOf('/footnotes') > -1 || type.indexOf('/endnotes') > -1 ||
          type.indexOf('/comments') > -1) {
        var path = target.charAt(0) === '/' ? target.slice(1) : ('word/' + target);
        if (zip.file(path)) parts.push(path);
      }
    });
    // Fallback: some writers omit rels entries — patch by well-known path.
    ['word/footnotes.xml', 'word/endnotes.xml', 'word/comments.xml'].forEach(function (p) {
      if (zip.file(p) && parts.indexOf(p) === -1) parts.push(p);
    });
    return parts;
  }).catch(function () { return []; });
}

function loadDocxFile(file) {
  showProcessing(true, 'Loading DOCX…');
  JSZip.loadAsync(file).then(function (zip) {
    var docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) throw new Error('word/document.xml not found — this is not a valid DOCX file');
    appState.docxFile = file;
    appState.docxZip = zip;
    return docXmlFile.async('string');
  }).then(function (xmlStr) {
    var preview = extractPreviewText(xmlStr);
    els.inputTextarea.value = preview;
    els.outputTextarea.value = ''; // nothing converted yet — the user presses Convert
    syncUndoBase();
    lockInputForDocx(true);
    els.docxStripText.textContent = file.name;
    els.docxStrip.dataset.kind = 'docx';
    els.docxStrip.classList.add('show');
    updateStats();
    applyEncodingFonts();
    resetOutputFonts(); // new template resets picks to the encoding defaults
    setConvertButtonMode(true);
    // A DOCX upload always leaves Live mode: Convert now waits for a click.
    setLiveMode(false);
    setStatusIdle();
    showToast('DOCX template loaded — click Convert');
  }).catch(function (err) {
    setStatusIdle();
    appState.docxFile = null; appState.docxZip = null;
    showToast('Failed to read DOCX: ' + err.message);
  });
}

function clearDocxTemplate() {
  appState.docxZip = null;
  appState.docxFile = null;
  appState.patchedDocxXml = null;
  appState.patchedDirection = null;
  var box = document.getElementById('print-doc');
  if (box) box.innerHTML = '';
  try { document.body.classList.remove('print-docx'); } catch (e) { /* non-fatal */ }
  els.docxStrip.classList.remove('show');
  lockInputForDocx(false);
  setConvertButtonMode(false);
}

/* Patches DOCX parts and resolves { zip, mainXml, direction } without
   downloading — shared by DOCX download and table-preserving PDF print. */
function patchDocxParts() {
  var mode = resolveMode();
  var direction = mode === 'unicode-to-bijoy' ? 'uni2bijoy' : 'bijoy2uni';
  setEncodingBadge(mode);
  return JSZip.loadAsync(appState.docxFile).then(function (freshZip) {
    return findHeaderFooterParts(freshZip).then(function (extraParts) {
      var partsToPatch = ['word/document.xml'].concat(extraParts);
      var state = { mainXml: null, extras: [] };
      var totalConverted = 0;
      var stylesDoc = null;
      var stylesFile = freshZip.file('word/styles.xml');
      var stylesReady = stylesFile ? stylesFile.async('string').then(function (sx) {
        try { stylesDoc = new DOMParser().parseFromString(sx, 'application/xml'); }
        catch (e) { stylesDoc = null; }
      }).catch(function () { stylesDoc = null; }) : Promise.resolve();
      return stylesReady.then(function () {
        var jobs = partsToPatch.map(function (path) {
          var partFile = freshZip.file(path);
          if (!partFile) return Promise.resolve();
          return partFile.async('string').then(function (xml) {
            // Phase 2: per-part counter; old string path unused here so we
            // take the { xml, converted } form explicitly.
            var out = patchDocumentXmlString(xml, direction, stylesDoc, { converted: 0 });
            totalConverted += out.converted;
            if (path === 'word/document.xml') state.mainXml = out.xml;
            else state.extras.push({ path: path, xml: out.xml });
            freshZip.file(path, out.xml);
          });
        });
        return Promise.all(jobs).then(function () {
          return { zip: freshZip, mainXml: state.mainXml, direction: direction, extras: state.extras, converted: totalConverted };
        });
      });
    });
  });
}

function rememberPatchedDocx(r) {
  appState.patchedDocxXml = r.mainXml;
  appState.patchedDirection = r.direction;
  if (r.mainXml) {
    els.outputTextarea.value = extractPreviewText(r.mainXml);
    updateStats();
  }
}

/* Convert the loaded DOCX template in memory: patch every part, remember the
   result and preview it in the output pane. It does NOT download — the user
   picks a format from the Download dialog when they are ready. */
function convertDocxTemplate() {
  if (!appState.docxZip || !appState.docxFile) { showToast('No DOCX template loaded.'); return; }
  showProcessing(true, 'Converting DOCX…');

  patchDocxParts().then(function (r) {
    rememberPatchedDocx(r);
    showConversionSuccess(r.direction === 'uni2bijoy' ? 'unicode-to-bijoy' : 'bijoy-to-unicode');
    // Never claim success when nothing converted — the font may be unsupported.
    if (!r.converted) {
      showToast('কোনো বাংলা টেক্সট শনাক্ত হয়নি — ফাইলের ফন্ট সমর্থিত কিনা যাচাই করুন');
    } else {
      showToast('DOCX converted — choose a format from Download');
    }
  }).catch(function (err) {
    setStatusIdle();
    showToast('Error: ' + err.message);
  });
}

/* Build the converted DOCX and hand it to the browser. Runs the same patch as
   the Convert button, so it works straight from the Download dialog even if the
   user never pressed Convert first. This is the ONLY place a DOCX downloads. */
function downloadDocxTemplate() {
  if (!appState.docxZip || !appState.docxFile) { showToast('No DOCX template loaded.'); return; }
  showProcessing(true, 'Building DOCX file…');

  patchDocxParts().then(function (r) {
    rememberPatchedDocx(r);
    return r.zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE', compressionOptions: { level: 6 } }).then(function (blob) {
      return { blob: blob, direction: r.direction, converted: r.converted || 0 };
    });
  }).then(function (out) {
    var url = URL.createObjectURL(out.blob);
    var suffix = out.direction === 'uni2bijoy' ? 'bijoy' : 'unicode';
    triggerDownload(url, appState.docxFile.name.replace(/\.docx$/i, '') + '_' + suffix + '.docx');
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    showStatusSuccess('Download started successfully');
    // Phase 2 fix: never claim success when nothing converted — tell the
    // user the font may be unsupported instead of a false success toast.
    if (!out.converted) {
      showToast('কোনো বাংলা টেক্সট শনাক্ত হয়নি — ফাইলের ফন্ট সমর্থিত কিনা যাচাই করুন');
    } else {
      showToast('DOCX downloaded!');
    }
  }).catch(function (err) {
    setStatusIdle();
    showToast('Error: ' + err.message);
  });
}

/* ------------------------------------------------------------
   11. EVENT WIRING
------------------------------------------------------------ */
function wireFontSizeButtons() {
  var FONT_SIZES = { small: '13px', medium: '16px', large: '20px' };
  document.querySelectorAll('.font-size-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.getAttribute('data-panel');
      var size = btn.getAttribute('data-size');
      var textarea = panel === 'input' ? els.inputTextarea : els.outputTextarea;
      document.querySelectorAll('.font-size-btn[data-panel="' + panel + '"]').forEach(function (b) {
        b.classList.remove('font-size-btn--active');
        b.removeAttribute('aria-pressed');
      });
      btn.classList.add('font-size-btn--active');
      btn.setAttribute('aria-pressed', 'true');
      textarea.style.setProperty('--ta-font-size', FONT_SIZES[size]);
    });
  });
}

/* ------------------------------------------------------------
   11b. EXTRA TOOLS (account excluded) — undo/redo, info box,
   split view, batch convert, PDF export, tool-view switching.
   Shell views (spell/mcq/history/wallet/admin) are UI-ready;
   their buttons show a "coming soon" toast for now.
------------------------------------------------------------ */
var undoStack = [];
var redoStack = [];
var undoLastKnown = null; // last committed input value (undo base)
var MAX_UNDO = 50;
var undoDebounceTimer = null;

function snapshotForUndo() {
  var val = els.inputTextarea.value;
  if (undoStack.length && undoStack[undoStack.length - 1] === val) return;
  undoStack.push(val);
  undoLastKnown = val;
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}
function syncUndoBase() {
  undoLastKnown = els.inputTextarea.value;
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(els.inputTextarea.value);
  els.inputTextarea.value = undoStack.pop();
  syncUndoBase();
  clearDocxTemplate();
  updateStats();
  scheduleLiveConvert();
  updateUndoButtons();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(els.inputTextarea.value);
  els.inputTextarea.value = redoStack.pop();
  syncUndoBase();
  clearDocxTemplate();
  updateStats();
  scheduleLiveConvert();
  updateUndoButtons();
}
function updateUndoButtons() {
  if (!els.undoBtn || !els.redoBtn) return;
  els.undoBtn.disabled = undoStack.length === 0;
  els.redoBtn.disabled = redoStack.length === 0;
  els.undoBtn.setAttribute('aria-disabled', String(els.undoBtn.disabled));
  els.redoBtn.setAttribute('aria-disabled', String(els.redoBtn.disabled));
}
// Typing bursts are coalesced: the committed value BEFORE the burst is
// snapshotted once, 400ms after the last keystroke.
function maybeSnapshotInput() {
  var current = els.inputTextarea.value;
  if (current === undoLastKnown) return;
  undoStack.push(undoLastKnown);
  undoLastKnown = current;
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function comingSoon() {
  showToast('Coming soon');
}

/* ------------------------------------------------------------
   Features card is always open. Header Features button scrolls
   to it, stopping just below the fixed header.
------------------------------------------------------------ */
function scrollToFeatures() {
  if (!els.infoBox) return;
  var header = document.querySelector('.app-header');
  var offset = 12;
  if (header) offset += header.getBoundingClientRect().height;
  var y = els.infoBox.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}
var TOOL_VIEW_IDS = {
  converter: 'view-converter',
  spellcheck: 'view-spell',
  mcq: 'view-mcq',
  history: 'view-history',
  wallet: 'view-wallet',
  admin: 'view-admin'
};
function switchToolView(view) {
  var id = TOOL_VIEW_IDS[view];
  if (!id) return;
  Object.keys(TOOL_VIEW_IDS).forEach(function (key) {
    var panel = document.getElementById(TOOL_VIEW_IDS[key]);
    if (panel) panel.hidden = (TOOL_VIEW_IDS[key] !== id);
  });
  if (els.toolsNav) {
    els.toolsNav.querySelectorAll('.tools-nav__btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-view') === view);
    });
  }
  // Conversion status + controls belong to the converter only.
  if (els.statusbar) els.statusbar.hidden = (view !== 'converter');
  if (els.toolbar) els.toolbar.hidden = (view !== 'converter');
}


var printTitleBackup = null;

function fitOutputForPrint() {
  // Textareas don't auto-expand on paper — grow it to full content height.
  try {
    var ta = els.outputTextarea;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  } catch (e) { /* non-fatal */ }
}

function restoreOutputAfterPrint() {
  try {
    els.outputTextarea.style.height = '';
    document.body.classList.remove('print-docx');
    if (printTitleBackup !== null) {
      document.title = printTitleBackup;
      printTitleBackup = null;
    }
  } catch (e) { /* non-fatal */ }
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeprint', fitOutputForPrint);
  window.addEventListener('afterprint', restoreOutputAfterPrint);
}


/* ------------------------------------------------------------
   12. KEYBOARD SHORTCUTS
   Matches frontend.html's own shortcuts panel exactly (that
   file was established as the UI/UX source of truth, so its
   documented bindings win over script.md's differing ones).
------------------------------------------------------------ */
/* ------------------------------------------------------------
   12. KEYBOARD SHORTCUTS
   Matches frontend.html's own shortcuts panel exactly (that
   file was established as the UI/UX source of truth, so its
   documented bindings win over script.md's differing ones).
   ------------------------------------------------------------ */
function wireKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    var key = e.key;
    var inOutput = document.activeElement === els.outputTextarea;
    var inField = document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT';

    if (e.ctrlKey && !e.shiftKey && !e.altKey && key === 'Enter') { e.preventDefault(); els.convertBtn.click(); return; }
    if (e.ctrlKey && !e.shiftKey && !e.altKey && (key === 'l' || key === 'L')) { e.preventDefault(); els.liveModeBtn.click(); return; }
    if (e.ctrlKey && e.shiftKey && !e.altKey && (key === 'c' || key === 'C')) { e.preventDefault(); els.clearBtn.click(); return; }
    if (e.ctrlKey && e.shiftKey && !e.altKey && (key === 's' || key === 'S')) { e.preventDefault(); els.swapBtn.click(); return; }
    if (e.ctrlKey && !e.shiftKey && !e.altKey && (key === 'c' || key === 'C') && inOutput) { e.preventDefault(); els.copyBtn.click(); return; }
    if (e.ctrlKey && !e.shiftKey && !e.altKey && (key === 's' || key === 'S')) { e.preventDefault(); if (els.downloadOpenBtn) els.downloadOpenBtn.click(); return; }
    if (e.ctrlKey && !e.shiftKey && !e.altKey && (key === 'd' || key === 'D')) { e.preventDefault(); els.themeToggleBtn.click(); return; }
    if (key === '?' && !inField && !e.ctrlKey && !e.altKey) { openShortcuts(); return; }
    if (key === 'Escape' && els.unmapModal && !els.unmapModal.hidden) { closeUnmapModal(); return; }
    if (key === 'Escape') {
      if (els.downloadModal && !els.downloadModal.hidden) { closeDialog(els.downloadModal); return; }
    }
    if (key === 'Escape' && !els.shortcutsPanel.hidden) { closeShortcuts(); return; }
  });
}

/* ------------------------------------------------------------
   13. INIT
------------------------------------------------------------ */
function safeInitStep(fn, label) {
  try {
    fn();
  } catch (err) {
    if (window.console && console.error) console.error('LipiLab init step failed (' + label + '):', err);
  }
}

function init() {
  // Each step is fault-isolated: a problem in one (e.g. theme detection on an
  // unusual browser) must never stop wireEvents() from running, or every
  // button on the page silently goes dead with no visible error.
  safeInitStep(initTheme, 'theme');
  safeInitStep(restoreState, 'restore-state');
  safeInitStep(updateStats, 'stats');
  safeInitStep(applyEncodingFonts, 'encoding-fonts');
  safeInitStep(function () { setEncodingBadge(resolveMode()); }, 'encoding-badge');
  safeInitStep(setStatusIdle, 'status-idle-init');
  safeInitStep(function () { els.encodingBadge.classList.toggle('encoding-badge--live', appState.liveMode); }, 'live-badge-init');
  safeInitStep(function () { setConvertButtonMode(false); }, 'convert-button-mode');
  safeInitStep(updateConvertBtnState, 'convert-btn-state');
  safeInitStep(wireEvents, 'wire-events');
  safeInitStep(wireKeyboardShortcuts, 'wire-keyboard-shortcuts');
  safeInitStep(updateOfflineIndicator, 'offline-indicator');
  safeInitStep(initAskChoice, 'choice-prompt');
  safeInitStep(initRefreshGuard, 'refresh-guard');
  safeInitStep(initGatekeep, 'gatekeep');
  safeInitStep(function () { syncUndoBase(); updateUndoButtons(); }, 'undo-init');
  requestAnimationFrame(function () { safeInitStep(updateDirectionPillPosition, 'direction-pill'); });
}
function wireEvents() {
  els.themeToggleBtn.addEventListener('click', toggleTheme);

  els.shortcutsOpenBtn.addEventListener('click', openShortcuts);
  els.shortcutsCloseBtn.addEventListener('click', closeShortcuts);
  els.shortcutsBackdrop.addEventListener('click', closeShortcuts);

  document.querySelectorAll('input[name="conversion-direction"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      updateDirectionPillPosition();
      applyEncodingFonts();
      setEncodingBadge(resolveMode());
      if (appState.liveMode) convertPlainText(); else setStatusIdle();
    });
  });

  els.liveModeBtn.addEventListener('click', function () {
    setLiveMode(!appState.liveMode);
    if (appState.liveMode) convertPlainText(); else setStatusIdle();
  });

  els.convertBtn.addEventListener('click', function () {
    var text = els.inputTextarea.value;
    if (!hasConvertibleText(text)) return;
    // Same gate the disabled state expresses: with live mode on the text
    // already converts as it is typed, so a click (or the Ctrl+Enter shortcut,
    // which calls .click()) must not start a second, manual run.
    if (appState.docxZip) { startManualConvert('Converting DOCX…', convertDocxTemplate); return; }
    startManualConvert('Converting…', convertPlainText);
  });

  els.pasteBtn.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (text) {
        snapshotForUndo();
        clearDocxTemplate();
        els.inputTextarea.value = text;
        syncUndoBase();
        updateStats();
        setStatusIdle();
        scheduleLiveConvert();
      }).catch(function () { els.inputTextarea.focus(); });
    } else {
      els.inputTextarea.focus();
    }
  });

  if (els.banglaFontSelect) {
    els.banglaFontSelect.addEventListener('change', function () {
      appState.banglaFont = els.banglaFontSelect.value;
      persistFontState();
      // Re-run so the preview textarea picks up the new face immediately
      // when live mode is off too — the pick is cheap to honour.
      applyOutputPreviewFont();
      if (appState.liveMode && els.inputTextarea.value) scheduleLiveConvert();
    });
  }
  if (els.englishFontSelect) {
    els.englishFontSelect.addEventListener('change', function () {
      appState.englishFont = els.englishFontSelect.value;
      persistFontState();
      if (appState.liveMode && els.inputTextarea.value) scheduleLiveConvert();
    });
  }

  els.fileUploadInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    // Phase 8: legacy .doc is binary OLE — not convertible client-side.
    // Fail loudly with guidance instead of silently misreading it as text.
    if (file.name.toLowerCase().endsWith('.doc') && !file.name.toLowerCase().endsWith('.docx')) {
      showToast('.doc সমর্থিত নয় — Word থেকে .docx হিসেবে Save করে আবার চেষ্টা করুন');
      e.target.value = '';
      return;
    }
    if (file.name.toLowerCase().endsWith('.docx')) {
      loadDocxFile(file);
    } else {
      var reader = new FileReader();
      reader.onload = function (ev) {
        snapshotForUndo();
        clearDocxTemplate();
        els.inputTextarea.value = ev.target.result;
        els.outputTextarea.value = ''; // nothing converted yet — the user presses Convert
        syncUndoBase();
        updateStats();
        resetOutputFonts(); // a new file resets font picks to the encoding defaults
        // A file upload always leaves Live mode: Convert now waits for a click.
        setLiveMode(false);
        setStatusIdle();
        // Text uploads get the same loaded-file strip a DOCX template does, so
        // the filename stays visible above the input and can be dropped in one
        // click. Never lockInputForDocx() here — a text file stays editable.
        els.docxStripText.textContent = file.name;
        els.docxStrip.dataset.kind = 'text';
        els.docxStrip.classList.add('show');
        showToast('File loaded — click Convert');
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  });

  function clearAllNow() {
    snapshotForUndo();
    els.inputTextarea.value = '';
    els.outputTextarea.value = '';
    resetOutputFonts();
    clearDocxTemplate();
    appState.parsedData = [];
    updateStats();
    setWarningBadge(0);
    setStatusIdle();
    try { localStorage.removeItem(STORAGE_TEXT_KEY); } catch (e) { /* non-fatal */ }
    showToast('Cleared');
  }

  // Clear runs immediately. No confirmation dialog: the app has Undo/Redo, and a
  // confirm step on a one-click action just gets in the way.
  els.clearBtn.addEventListener('click', function () {
    snapshotForUndo();
    clearAllNow();
  });

  els.docxStripClear.addEventListener('click', function () {
    snapshotForUndo();
    // The strip holds either a Word template ('docx') or an uploaded text file
    // ('text') — name the right one so the toast matches what the X removed.
    var kind = els.docxStrip.dataset.kind;
    clearDocxTemplate();
    els.inputTextarea.value = '';
    updateStats();
    setStatusIdle();
    showToast(kind === 'text' ? 'File removed' : 'Template removed');
  });

  els.swapBtn.addEventListener('click', function () {
    snapshotForUndo();
    var inputVal = els.inputTextarea.value;
    var outputVal = els.outputTextarea.value;
    clearDocxTemplate();
    els.inputTextarea.value = outputVal;
    els.outputTextarea.value = inputVal;
    appState.parsedData = [];
    updateStats();
    setStatusIdle();
    persistState();
  });

  els.copyBtn.addEventListener('click', function () {
    var text = els.outputTextarea.value;
    if (!text.trim()) { showToast('Nothing to copy'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast('Copied to clipboard!'); });
    } else {
      els.outputTextarea.select();
      document.execCommand('copy');
      showToast('Copied!');
    }
  });

  function downloadAsTxt() {
    var text = els.outputTextarea.value;
    if (!text || !text.trim()) { showToast('Nothing to download as txt file'); return; }
    startDownload('TXT', function () {
      return new Blob([text], { type: 'text/plain;charset=utf-8' });
    }, 'LipiLab_converted.txt');
  }

  function downloadAsDocx() {
    if (appState.docxZip) { downloadDocxTemplate(); return; }
    if (appState.parsedData.length === 0) {
      var inputText = els.inputTextarea.value;
      if (!inputText || !inputText.trim()) { showToast('Nothing to download as docx file'); return; }
      convertPlainText();
    }
    if (appState.parsedData.length === 0) { showToast('Nothing to download as docx file'); return; }
    startDownload('DOCX', function () {
      return buildBlankDocxBlob(appState.parsedData);
    }, 'Converted_Document.docx');
  }

  if (els.downloadOpenBtn) els.downloadOpenBtn.addEventListener('click', function () {
    openDownloadModal();
  });
  wireDialog(els.downloadModal, els.downloadCloseBtn, { backdrop: false });
  if (els.downloadModal) {
    els.downloadModal.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.dlg__format') : null;
      if (!btn) return;
      var fmt = btn.getAttribute('data-format');
      if (fmt === 'docx') downloadAsDocx();
      else if (fmt === 'txt') downloadAsTxt();
      else if (fmt === 'pdf') { showToast('PDF download feature coming soon'); return; }
      closeDialog(els.downloadModal);
    });
  }

  wireFontSizeButtons();

  // Extra tools wiring (account excluded).
  // The status badge is the entry point of the "missing converter character"
  // dialog (explanation + copy + ready-made mail).
  if (els.warningBadge) els.warningBadge.addEventListener('click', explainUnmappable);
  if (els.unmapSendBtn) els.unmapSendBtn.addEventListener('click', sendUnmapReport);
  if (els.unmapCopyBtn) els.unmapCopyBtn.addEventListener('click', copyUnmapReport);
  if (els.unmapCloseBtn) els.unmapCloseBtn.addEventListener('click', closeUnmapModal);
  if (els.undoBtn) els.undoBtn.addEventListener('click', undo);
  if (els.redoBtn) els.redoBtn.addEventListener('click', redo);
  if (els.featuresOpenBtn) els.featuresOpenBtn.addEventListener('click', scrollToFeatures);
  if (els.toolsNav) els.toolsNav.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.tools-nav__btn') : null;
    if (!btn || btn.hidden) return;
    var view = btn.getAttribute('data-view');
    // Spell Check + MCQ Serial are not ready — toast only, stay on current view.
    if (view === 'spellcheck' || view === 'mcq') { showToast('This feature is coming soon...'); return; }
    switchToolView(view);
  });
  document.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.seg__btn') : null;
      if (!btn) return;
      seg.querySelectorAll('.seg__btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
    });
  });
  ['spell-check-btn', 'mcq-generate-btn', 'admin-user-lookup'].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', comingSoon);
  });
  ['spell-clear-btn', 'mcq-clear-btn'].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function () {
      var input = b.closest('.panel').querySelector('textarea');
      var result = b.closest('.panel').querySelector('[aria-live]');
      if (input) input.value = '';
      if (result) result.innerHTML = '';
    });
  });

  if (els.sampleFillBtn) {
    els.sampleFillBtn.addEventListener('click', fillSampleText);
  }

  els.inputTextarea.addEventListener('input', function () {
    updateStats();
    persistState();
    // Live mode: preview the conversion while typing. Manual mode: wait for Convert.
    if (appState.liveMode) {
      setStatusIdle();
      scheduleLiveConvert();
    } else {
      setStatusIdle();
    }
    clearTimeout(undoDebounceTimer);
    undoDebounceTimer = setTimeout(maybeSnapshotInput, 400);
  });

  /* The fixed app header grows taller on narrow screens (the brand tagline wraps
   to a second line), so a hard-coded --app-header-h in CSS would leave the
   notification stack sitting ON the header. Measure it instead and publish the
   real height; ResizeObserver keeps it correct while the window changes. */
function syncHeaderHeight() {
  var hdr = document.querySelector('.app-header');
  if (!hdr) return;
  var h = Math.round(hdr.getBoundingClientRect().height);
  if (h > 0) document.documentElement.style.setProperty('--app-header-h', h + 'px');
}

window.addEventListener('resize', syncHeaderHeight);
if (typeof ResizeObserver === 'function' && document.querySelector('.app-header')) {
  new ResizeObserver(syncHeaderHeight).observe(document.querySelector('.app-header'));
}
syncHeaderHeight();

window.addEventListener('resize', updateDirectionPillPosition);
  window.addEventListener('online', updateOfflineIndicator);
  window.addEventListener('offline', updateOfflineIndicator);
}



if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
