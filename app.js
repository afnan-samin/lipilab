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
  downloadTxtBtn: document.getElementById('download-txt-btn'),
  downloadDocxBtn: document.getElementById('download-docx-btn'),
  downloadPdfBtn: document.getElementById('download-pdf-btn'),
  pointsBalance: document.getElementById('points-balance'),
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
  unmapLead: document.getElementById('unmap-modal-lead'),
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
  patchedDirection: null
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
function showToast(message) {
  var MAX_TOASTS = 3;
  var container = els.toastContainer;
  var existing = container.querySelectorAll('.toast');
  // Limit: remove oldest if at capacity
  if (existing.length >= MAX_TOASTS) {
    existing[0].remove();
  }
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function () {
    toast.classList.add('toast--out');
    setTimeout(function () { toast.remove(); }, 200);
  }, 2200);
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
/* Verified: the embedded SutonnyMJ TTF plus six more Bangla ANSI fonts
   carry no glyph for these characters, so no ASCII code can show them -
   a look-alike map would print the wrong letter (e.g. ব for ৰ). They stay
   Unicode on purpose: browser font fallback draws them correctly. The
   dialog and the prepared mail explain this instead of promising a fix. */
var FONT_NO_GLYPH = { 'ৰ': 1, 'ৱ': 1 };

function isFontNoGlyph(ch) { return Object.prototype.hasOwnProperty.call(FONT_NO_GLYPH, ch); }
function splitReportChars(chars) {
  var limited = [], mappable = [], i;
  for (i = 0; i < chars.length; i++) { if (isFontNoGlyph(chars[i])) limited.push(chars[i]); else mappable.push(chars[i]); }
  return { limited: limited, mappable: mappable };
}
function listReportChars(chars) {
  return chars.map(function (ch) { return ch + ' (' + codePointHex(ch) + ')'; }).join(', ');
}

/* Copy/Send text: all font-limited -> an FYI naming the font limit;
   anything mappable -> the mapping request, noting any font-limited ones. */
function buildUnmapReport() {
  var chars = lastUnmappableChars || [];
  var parts = splitReportChars(chars), report;
  if (chars.length && !parts.mappable.length) {
    report = [
      'Hi LipiLab team,',
      '',
      'I converted a text and ' + (chars.length === 1 ? 'this character stayed' : 'these characters stayed') + ' as Unicode in the Bijoy output:',
      '',
      '   ' + listReportChars(chars),
      '',
      'The report dialog explained that the SutonnyMJ font itself carries no glyph for them (its glyph table was checked), so there is no Bijoy ASCII code that could render them - mapping would print a different letter.',
      'This mail is only to let you know such characters appear in real texts. Keeping them Unicode is correct: the browser draws them through font fallback. No converter update can change this until the font adds the glyph.'
    ];
  } else {
    report = [
      'Hi LipiLab team,',
      '',
      'I converted a text and ' + (chars.length === 1 ? 'this character is' : 'these characters are') + ' missing from the converter list,',
      'so they stayed as Unicode in the Bijoy output:',
      '',
      '   ' + listReportChars(chars),
      ''
    ];
    if (parts.limited.length) {
      report.push('Note: ' + listReportChars(parts.limited) + ' cannot be mapped at all - the SutonnyMJ font itself carries no glyph for them.');
      report.push('');
    }
    report.push('Please add them to the SutonnyMJ (Bijoy) mapping in a future update.');
  }
  return report.join('\n');
}

/* Font-limited Bangla lead; the markup paragraph (the site owner's own text)
   is snapshotted as the normal variant and restored for normal reports. */
var FONT_LIMITED_LEAD_HTML = 'এই ক্যারেক্টারগুলো <b>SutonnyMJ (Bijoy) ফন্টে নিজেই নেই</b> — আমরা এই সাইটের ব্যবহৃত ফন্টসহ ৭টা বাংলা ANSI ফন্টের গ্লিফ-টেবিল পরীক্ষা করে নিশ্চিত করেছি। ফন্টে গ্লিফ না থাকায় কোনো ASCII কোডেও এগুলো দেখানো সম্ভব নয় — জোর করে map করলে ভুল অক্ষর (যেমন ৰ-এর জায়গায় <b>ব</b>) দেখাবে। তাই কনভার্টার এগুলো <b>ইউনিকোড হিসেবেই রাখে</b> — ব্রাউজারের ফন্ট ফলব্যাকে সঠিকভাবে দেখানোর জন্য। এটাই সঠিক আচরণ; ফন্টে গ্লিফ যোগ না হলে পর্যন্ত কোনো ম্যাপিং-আপডেটেও এটা বদলাবে না। চাইলে <b>Send</b> চাপুন — এই তথ্য আমাদের কাছে পৌঁছে যাবে। রিপোর্টে শুধু এই মিসিং ক্যারেক্টারগুলো যায় — আপনার কোনো লেখা বা ব্যক্তিগত তথ্য যায় না।';
var unmapLeadNormalHTML = null;
function setUnmapLead() {
  if (!els.unmapLead) return;
  if (unmapLeadNormalHTML === null) unmapLeadNormalHTML = els.unmapLead.innerHTML;
  var allLimited = lastUnmappableChars.length > 0, i;
  for (i = 0; i < lastUnmappableChars.length; i++) { if (!isFontNoGlyph(lastUnmappableChars[i])) { allLimited = false; break; } }
  els.unmapLead.innerHTML = allLimited ? FONT_LIMITED_LEAD_HTML : unmapLeadNormalHTML;
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
  setUnmapLead();
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

function copyUnmapReportFallback(text) {
  try {
    var range = document.createRange();
    range.selectNodeContents(els.unmapPreview);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    var ok = document.execCommand('copy');
    sel.removeAllRanges();
    showToast(ok ? 'Report copied' : 'Copy failed — select the text and copy it');
  } catch (e) {
    showToast('Copy failed — select the text and copy it');
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
  if (mode === 'unicode-to-bijoy') {
    els.inputTextarea.classList.remove('panel__textarea--bijoy');
    els.outputTextarea.classList.add('panel__textarea--bijoy');
    els.outputPanel.setAttribute('data-encoding-out', 'bijoy');
  } else {
    els.inputTextarea.classList.add('panel__textarea--bijoy');
    els.outputTextarea.classList.remove('panel__textarea--bijoy');
    els.outputPanel.setAttribute('data-encoding-out', 'unicode');
  }
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
  convertBtnBaseTitle = docxLoaded ? 'Convert & download the DOCX' : 'Convert (Ctrl+Enter)';
  updateConvertBtnState();
}

function updateConvertBtnState() {
  if (!els.convertBtn) return;
  // Live mode ON  -> Convert button disabled (conversion happens automatically).
  // Live mode OFF -> Convert button enabled (unless quota-locked).
  var liveOff = !appState.liveMode;
  var allow = liveOff && !quotaLocked;
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
}

function restoreState() {
  try {
    var saved = localStorage.getItem(STORAGE_TEXT_KEY);
    if (saved) { els.inputTextarea.value = saved; }
  } catch (e) { /* storage unavailable — non-fatal */ }
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
}

function initTheme() {
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable — non-fatal */ }
  applyTheme(saved || 'dark');
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
      var item = { text: '', font: 'Times New Roman' };
      if (tok.type === 'bangla') {
        item.text = ConvertToASCII(tok.raw);
        item.font = 'SutonnyMJ';
        unmappable += countUnmappable(item.text, unmappableSeen);
      } else if (tok.type === 'latin') {
        item.text = tok.raw;
        item.font = 'Times New Roman';
      } else {
        item.text = tok.raw;
        item.font = tok.effectiveType === 'bangla' ? 'SutonnyMJ' : 'Times New Roman';
      }
      appState.parsedData.push(item);
      outputText += item.text;
    });
  } else {
    outputText = convertBijoyTextMixed(text);
    appState.parsedData.push({ text: outputText, font: 'Times New Roman' });
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
        var item = { text: '', font: 'Times New Roman' };
        if (tok.type === 'bangla') {
          item.text = ConvertToASCII(tok.raw);
          item.font = 'SutonnyMJ';
          unmappable += countUnmappable(item.text, unmappableSeen);
        } else if (tok.type === 'latin') {
          item.text = tok.raw;
          item.font = 'Times New Roman';
        } else {
          item.text = tok.raw;
          item.font = tok.effectiveType === 'bangla' ? 'SutonnyMJ' : 'Times New Roman';
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
      chargePointsDelta(els.inputTextarea.value);
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
      appState.parsedData.push({ text: outputText, font: 'Times New Roman' });
      els.outputTextarea.value = outputText;
      updateStats();
      applyEncodingFonts();
      setWarningBadge(0);
      showConversionSuccess(mode);
      maybeShowPostNote();
      chargePointsDelta(els.inputTextarea.value);
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
   token — each cloning the original <w:rPr> (so bold/italic/
   underline/size/color survive) and overriding only the font
   for the Bangla-converted piece. Non-Bangla pieces keep their
   original font untouched, which is what "preserve formatting/
   keep English text unchanged" requires for DOCX specifically
   (the plain-textbox path instead normalises English to Times
   New Roman, matching index.html's own downloadDoc()).

   Bijoy → Unicode: there is no character-level way to tell
   Bijoy Bangla from English (same code points), exactly as in
   index.html. For DOCX the separation instead uses the run's
   *font name* — only runs tagged with a known Bijoy font are
   converted; everything else is left completely untouched. This
   is the "appropriate Bijoy-font detection" the brief asks for.

   Only <w:t> text and the <w:rFonts> font name are ever touched;
   <w:pPr> (alignment, list numbering, spacing) and the rest of
   <w:rPr> (bold/italic/underline/size/color) are never rewritten,
   only cloned, so paragraph/list/table formatting is preserved.

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
var WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
var XML_NS = 'http://www.w3.org/XML/1998/namespace';

function isBijoyFontName(name) {
  if (!name) return false;
  return BIJOY_FONT_NAMES.some(function (fn) { return name.toLowerCase() === fn.toLowerCase(); });
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
function runIsPlainText(runEl) {
  var kids = runEl.childNodes;
  var hasT = false;
  for (var i = 0; i < kids.length; i++) {
    var k = kids[i];
    if (!k || k.nodeType !== 1) continue;
    var n = k.localName || (k.nodeName && k.nodeName.split(':').pop()) || '';
    if (n === 'rPr') continue;
    if (n === 't') { hasT = true; continue; }
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
    setRunText(convertBijoyTextMixed(originalText));
    if (!rPrEl) { rPrEl = doc.createElementNS(WORD_NS, 'w:rPr'); runEl.insertBefore(rPrEl, runEl.firstChild); }
    setRunFont(ensureRunFonts(rPrEl, doc), UNICODE_TARGET_FONT);
    setRunLang(rPrEl, doc);
    if (counter) counter.converted++;
    return 1;
  }

  // direction === 'uni2bijoy'
  var tokens = tokenizeMixedText(originalText);
  var hasBangla = tokens.some(function (t) { return t.type === 'bangla'; });
  if (!hasBangla) return 0; // nothing Bangla in this run — leave untouched

  if (tokens.length === 1) {
    // whole run is a single Bangla token — convert in place, no split needed
    setRunText(ConvertToASCII(tokens[0].raw));
    if (!rPrEl) { rPrEl = doc.createElementNS(WORD_NS, 'w:rPr'); runEl.insertBefore(rPrEl, runEl.firstChild); }
    setRunFont(ensureRunFonts(rPrEl, doc), 'SutonnyMJ');
    if (counter) counter.converted++;
    return 1;
  }

  // Phase 4 fix: build one w:r per maximal same-output-font group instead of
  // one w:r per token. A Bangla word + its trailing space both render in
  // SutonnyMJ after conversion, so they belong in the same run; likewise
  // consecutive non-Bangla tokens share the original rPr. Tokens are grouped
  // by their *effective* output side (bangla vs. non-bangla), with
  // whitespace ('space'/'other') inheriting the surrounding side — the same
  // effectiveType rule tokenizeMixedText() already applies for plain text —
  // so `word + space + word` stays ONE Bangla run instead of N runs.
  // Leading whitespace (no side yet) looks ahead to the first content
  // token; a space renders identically in either font and ConvertToASCII
  // passes ASCII whitespace through byte-identical, so attaching it to the
  // first group is always safe.
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

  var newRuns = groups.map(function (g) {
    var newRun = doc.createElementNS(WORD_NS, 'w:r');
    var newRPr = rPrEl ? rPrEl.cloneNode(true) : null;
    var text = g.raws.join('');
    if (g.side === 'bangla') {
      text = convertBanglaGroupToBijoy(text);
      if (!newRPr) newRPr = doc.createElementNS(WORD_NS, 'w:rPr');
      setRunFont(ensureRunFonts(newRPr, doc), 'SutonnyMJ');
    }
    if (newRPr) newRun.appendChild(newRPr);
    var newT = doc.createElementNS(WORD_NS, 'w:t');
    newT.setAttributeNS(XML_NS, 'xml:space', 'preserve');
    newT.textContent = text;
    newRun.appendChild(newT);
    return newRun;
  });

  // Phase 4 fix: merge adjacent new runs with identical rPr before inserting,
  // so a mixed run of N tokens does not become N runs on disk. Bangla pieces
  // share the same font-tagged rPr; consecutive spaces/punctuation share the
  // original rPr — both collapse back, keeping run count near the original.
  newRuns = mergeAdjacentRuns(newRuns, doc);

  var parent = runEl.parentNode;
  newRuns.forEach(function (r) { parent.insertBefore(r, runEl); });
  parent.removeChild(runEl);
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

function patchDocumentXmlString(xmlString, direction, stylesDoc, counter) {
  var doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Could not parse DOCX XML');
  mergeSameFontRuns(doc); // pre-pass: join split words first (see above)
  var runs = Array.prototype.slice.call(doc.getElementsByTagName('w:r'));
  var local = counter || { converted: 0 };
  runs.forEach(function (r) { splitRunForConversion(r, doc, direction, stylesDoc || null, local); });
  // Phase 4 post-pass: same shared helper as the pre-pass. Re-consolidates
  // the runs splitRunForConversion just produced (plus the pre-pass's empty
  // placeholders) so adjacent same-formatting runs land merged on disk
  // instead of exploded. Bijoy→Unicode runs convert in place (no split),
  // so this pass is a no-op there by construction.
  mergeSameFontRuns(doc);
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
    quotaWatermark = 0; // DOCX text — Convert click charges total words
    PointsBackend.save(pointsBalance, pointsLedger);
    syncUndoBase();
    lockInputForDocx(true);
    els.docxStripText.textContent = file.name;
    els.docxStrip.classList.add('show');
    updateStats();
    applyEncodingFonts();
    setConvertButtonMode(true);
    if (appState.liveMode) convertPlainText(); else setStatusIdle();
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

function convertDocxTemplate() {
  if (quotaLocked) { setStatusQuotaExhausted(); showQuotaExhaustedToast(0); return; }
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
      showToast('DOCX converted and downloaded!');
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
   11c. POINTS (device-local) — 10 hajar daily, 1 point per word.
   Balance resets every night 12 (BD time). Ledger saved locally.
   Live mode: each completed word is charged immediately on input.
   Manual/upload mode: Convert click charges all uncharged words.
   FUTURE ADMIN MOVE: only PointsBackend.load/save talk to storage.
   Point them at the server later — no other code changes needed.
------------------------------------------------------------ */
/* GitHub free version: converter + ads only. No points, no quota,
   no login, no history, no server calls. The quota/auth code below
   stays in the file (shared with the full version) but is fully
   bypassed while this flag is true. */
var FREE_MODE = true;

var DAILY_POINTS = 10000; // 10 hajar per device per day

/* Server-authoritative quota (Cloudflare Worker + D1).
   The browser only displays the balance and asks to spend — the worker
   holds the real ledger, so editing localStorage cannot create points.
   NOTE: QUOTA_CLIENT_KEY is visible in this file (browser code is always
   readable). It only stops blind bots; real security = server ledger +
   rate limits. The device hash is never shown in any UI. */
var QUOTA_API = 'https://lipilab-quota.myteletalk38.workers.dev';
var QUOTA_CLIENT_KEY = 'a9f3k7zq2m8x4p6w1n5b0c3d7e2f6g8h1j9k4m2n7p5q8r3s6t1u4v9w2x7y5z3a8b6c4d2e9f7g5h3j1k8m1v8w6x4y2z9a7b5c3d1e8f6g4h2j9';

/* No login in the free version: anonymous device quota only (bypassed
   while FREE_MODE is true). Kept declared so quotaPost stays safe. */
var authToken = null;
var POINTS_LEDGER_MAX = 2000; // keep newest N entries; balance is always fully deducted
var pointsBalance = DAILY_POINTS;
var pointsLedger = []; // newest last: { w: word, d: -1, b: balanceAfter, t: timestamp, g: batchId }
var quotaWatermark = 0; // words already paid for (persisted)
var quotaDate = ''; // BD date string the balance belongs to
var quotaLocked = false;
var quotaToastShownAt = 0;
var walletTickTimer = null;

function bdPad(n) { return (n < 10 ? '0' : '') + n; }
function bdToday() {
  var bd = new Date(Date.now() + 6 * 3600 * 1000);
  return bd.getUTCFullYear() + '-' + bdPad(bd.getUTCMonth() + 1) + '-' + bdPad(bd.getUTCDate());
}
function msUntilBdMidnight() {
  var now = Date.now();
  var bd = new Date(now + 6 * 3600 * 1000);
  var nextMidUtc = Date.UTC(bd.getUTCFullYear(), bd.getUTCMonth(), bd.getUTCDate() + 1, 0, 0, 0) - 6 * 3600 * 1000;
  return Math.max(0, nextMidUtc - now);
}
function formatCountdown(ms) {
  var s = Math.floor(ms / 1000);
  var h = Math.floor(s / 3600); s -= h * 3600;
  var m = Math.floor(s / 60); s -= m * 60;
  return h + 'h ' + m + 'm ' + s + 's';
}
function countWords(text) {
  var t = (text || '').trim();
  return t === '' ? 0 : t.split(/\s+/).length;
}
function splitWords(text) {
  var t = (text || '').trim();
  return t === '' ? [] : t.split(/\s+/);
}

// Tamper-evident signature for the wallet. Any hand edit of the stored
// balance/date/watermark (Application tab or Console) breaks the signature
// and the quota locks until the next refresh. NOTE: the pepper lives in
// this readable file, so this stops casual users — not someone reading
// the source. Real enforcement needs a server (see htdocs-ready/api/).
var QUOTA_PEPPER = 'lipilab-q1-v1::7f3a9c2e41bd';
function quotaHash(str) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (var i = 0; i < str.length; i++) {
    var ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}
function signQuota(balance, date, watermark) {
  return quotaHash('v1|' + balance + '|' + date + '|' + watermark + '|' + QUOTA_PEPPER);
}

/* ------------------------------------------------------------
   11c-2. SERVER QUOTA — device fingerprint + worker ledger.
   Formula identical to fingerprint-test.html (canvas+audio+screen+
   timezone+platform, no UA): fp-v1|h(canvas)|h(audio)|h(screen)|h(tz)|h(plat)
------------------------------------------------------------ */
var srvBalance = 0;    // last server-confirmed balance
var srvDate = '';      // BD date the srvBalance belongs to
var pendingSpend = 0;  // spent locally, not yet confirmed by server
var srvReady = false;  // true after first successful server sync
var flushTimer = null;
var flushInFlight = false;

function fpCanvasSig() {
  try {
    var c = document.createElement('canvas');
    c.width = 280; c.height = 60;
    var x = c.getContext('2d');
    if (!x) return 'no-canvas';
    x.textBaseline = 'top';
    x.font = "16px 'Arial'";
    x.fillStyle = '#f60';
    x.fillRect(10, 10, 80, 30);
    x.fillStyle = '#069';
    x.fillText('LipiLab gizmo 123', 100, 12);
    x.strokeStyle = '#000';
    x.beginPath(); x.arc(40, 40, 18, 0, Math.PI * 2); x.stroke();
    var g = x.createLinearGradient(0, 0, 280, 0);
    g.addColorStop(0, '#ff0000'); g.addColorStop(1, '#0000ff');
    x.fillStyle = g;
    x.fillRect(190, 35, 80, 15);
    return c.toDataURL();
  } catch (e) { return 'no-canvas'; }
}

function fpAudioSig() {
  return new Promise(function (resolve) {
    try {
      var AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AC) { resolve('no-audio'); return; }
      var ctx = new AC(1, 44100, 44100);
      var osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 10000;
      var comp = ctx.createDynamicsCompressor();
      osc.connect(comp); comp.connect(ctx.destination);
      osc.start(0);
      ctx.startRendering().then(function (buf) {
        var d = buf.getChannelData(0);
        var sum = 0;
        for (var i = 0; i < d.length; i += 97) sum += Math.abs(d[i]);
        // Quantized: raw float wobbles slightly per page load — rounding
        // keeps the signal stable so one device keeps one hash.
        resolve('audio:' + Math.round(sum));
      }).catch(function () { resolve('no-audio'); });
    } catch (e) { resolve('no-audio'); }
  });
}

function fpScreenStr() {
  try { return [window.screen.width, window.screen.height, window.screen.colorDepth].join('x'); }
  catch (e) { return 'no-screen'; }
}

function fpTzStr() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone + '|' + new Date().getTimezoneOffset(); }
  catch (e) { return 'no-tz'; }
}

function fpPlatStr() {
  try {
    return [navigator.platform, navigator.hardwareConcurrency,
      (navigator.deviceMemory || '?'), navigator.maxTouchPoints].join('|');
  } catch (e) { return 'no-plat'; }
}

var deviceHashPromise = null;
function getDeviceHash() {
  if (!deviceHashPromise) {
    deviceHashPromise = fpAudioSig().then(function (audio) {
      var parts = [quotaHash(fpCanvasSig()), quotaHash(audio), quotaHash(fpScreenStr()),
        quotaHash(fpTzStr()), quotaHash(fpPlatStr())];
      return quotaHash('fp-v1|' + parts.join('|'));
    });
  }
  return deviceHashPromise;
}

function quotaPost(path, body) {
  var headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
  return fetch(QUOTA_API + path, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  }).then(function (res) {
    return res.json().then(function (data) { return { status: res.status, data: data }; });
  });
}

async function quotaHmac(msg) {
  var key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(QUOTA_CLIENT_KEY),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  var sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return Array.prototype.map.call(new Uint8Array(sig), function (b) {
    return ('0' + b.toString(16)).slice(-2);
  }).join('');
}

async function serverQuota(hash) {
  var r = await quotaPost('/quota', { deviceHash: hash });
  if (r.status === 200 && r.data && r.data.ok) return r.data;
  throw { code: 'server', status: r.status };
}

async function serverSpend(hash, words) {
  var ts = Date.now();
  var nonce = Math.random().toString(36).slice(2) + ts.toString(36);
  var sig = await quotaHmac([hash, words, ts, nonce].join('|'));
  var r = await quotaPost('/spend',
    { deviceHash: hash, words: words, ts: ts, nonce: nonce, sig: sig });
  if (r.status === 200 && r.data && r.data.ok) return r.data;
  if (r.data && r.data.error === 'quota_exhausted') {
    throw { code: 'quota_exceeded', balance: r.data.balance };
  }
  throw { code: 'server', status: r.status };
}

// Displayed balance always derives from the server: srv - pending.
// Local edits can only lower it until the next sync corrects it.
function syncDisplay() {
  pointsBalance = Math.max(0, srvBalance - pendingSpend);
}

function saveSrv() {
  try {
    localStorage.setItem('lipilab:srv-balance', String(srvBalance));
    localStorage.setItem('lipilab:srv-date', srvDate || bdToday());
    localStorage.setItem('lipilab:pending-spend', String(pendingSpend));
  } catch (e) { /* non-fatal */ }
}

async function refreshQuota() {
  var hash = await getDeviceHash();
  var r = await serverQuota(hash);
  srvBalance = Math.max(0, r.balance | 0);
  srvDate = bdToday();
  quotaDate = srvDate;
  saveSrv();
  syncDisplay();
  srvReady = true;
  renderPoints();
  renderPointsHistory();
  updateQuotaLock();
  return r;
}

function scheduleFlush() {
  if (pendingSpend <= 0 || flushInFlight) return;
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flushNow, 800);
}

async function flushNow() {
  if (flushInFlight || pendingSpend <= 0) return;
  flushInFlight = true;
  try {
    var hash = await getDeviceHash();
    var sent = pendingSpend;
    var r = await serverSpend(hash, sent);
    srvBalance = Math.max(0, r.balance | 0);
    srvDate = bdToday();
    quotaDate = srvDate;
    pendingSpend = Math.max(0, pendingSpend - sent);
    saveSrv();
    syncDisplay();
    srvReady = true;
    renderPoints();
    updateQuotaLock();
  } catch (e) {
    if (e && e.code === 'quota_exceeded') {
      try { await refreshQuota(); } catch (e2) { /* stay locked */ }
    }
    // network/server errors: keep pending, retry on next schedule
  } finally {
    flushInFlight = false;
  }
}

function showConnectingToast() {
  var now = Date.now();
  if (now - quotaToastShownAt < 2500) return;
  quotaToastShownAt = now;
  showToast('Connecting to quota server…');
}

var PointsBackend = {
  load: function () {
    var today = bdToday();
    var data = { balance: DAILY_POINTS, ledger: [], watermark: 0, date: today, tampered: false };
    try {
      var rawDate = localStorage.getItem('lipilab:quota-date');
      var rawBal = localStorage.getItem('lipilab:points-balance');
      var rawLed = localStorage.getItem('lipilab:points-ledger');
      var rawCount = localStorage.getItem('lipilab:points-count');
      var rawSig = localStorage.getItem('lipilab:quota-sig');
      var allEmpty = rawDate === null && rawBal === null && rawLed === null && rawCount === null && rawSig === null;
      if (allEmpty) return data; // brand-new device — full points, nothing to verify
      var ledger = [];
      if (rawLed) { try { var arr = JSON.parse(rawLed); if (Array.isArray(arr)) ledger = arr; } catch (e2) { /* keep empty */ } }
      data.ledger = ledger;
      var date = (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) ? rawDate : today;
      // Stored day is in the future (date-key or clock tampering) → lock.
      if (date > today) { data.tampered = true; data.date = today; return data; }
      // Past day → legitimate daily refresh, history kept.
      if (date < today) { data.date = today; return data; }
      // Same day: accept values, but never more than a fresh day.
      var bal = (rawBal !== null && !isNaN(parseInt(rawBal, 10))) ? Math.max(0, parseInt(rawBal, 10)) : DAILY_POINTS;
      var wm = (rawCount !== null && !isNaN(parseInt(rawCount, 10))) ? Math.max(0, parseInt(rawCount, 10)) : 0;
      if (bal > DAILY_POINTS) bal = DAILY_POINTS;
      data.balance = bal; data.watermark = wm; data.date = today;
      // Signature present but wrong → value edited by hand (Application/Console).
      // Missing signature = pre-signature install → migrate once and re-sign.
      if (rawSig !== null && rawSig !== signQuota(bal, today, wm)) {
        data.tampered = true;
      }
    } catch (e) { /* corrupted storage → fresh wallet, never a lock */ }
    return data;
  },
  save: function (balance, ledger) {
    try {
      var day = quotaDate || bdToday();
      localStorage.setItem('lipilab:points-balance', String(balance));
      localStorage.setItem('lipilab:points-ledger', JSON.stringify(ledger));
      localStorage.setItem('lipilab:points-count', String(quotaWatermark));
      localStorage.setItem('lipilab:quota-date', day);
      localStorage.setItem('lipilab:quota-sig', signQuota(balance, day, quotaWatermark));
    } catch (e) { /* non-fatal */ }
  }
};

function formatPoints(n) {
  return Number(n).toLocaleString('en-US');
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function renderPoints() {
  if (els.pointsBalance) els.pointsBalance.textContent = formatPoints(pointsBalance);
  var walletBal = document.getElementById('wallet-balance');
  if (walletBal) walletBal.textContent = formatPoints(pointsBalance) + ' points';
  renderWalletRefresh();
}
function renderWalletRefresh() {
  var box = document.getElementById('wallet-refresh');
  if (!box) return;
  var left = formatCountdown(msUntilBdMidnight());
  box.innerHTML = 'Refreshes at 12 AM (BD time) &bull; <strong>' + left + '</strong> left &bull; <strong>' + formatPoints(DAILY_POINTS) + '</strong> points';
}
// Charged at every successful conversion (manual + live). Only a GROWING
// word count costs: typing one word slowly costs 1 point total, never more.
function setStatusQuotaExhausted() {
  els.processingText.textContent = 'Free quota exceeded';
  els.processingProgress.classList.remove('processing-progress--show');
  els.processingPercent.textContent = '';
  els.processingSpinner.hidden = true;
  els.processingSuccessIcon.hidden = true;
  els.processingIndicator.classList.remove('processing-success', 'processing-idle');
  els.processingIndicator.hidden = false;
}

function updateQuotaLock() {
  if (FREE_MODE) {
    // Free version: quota never locks. Keep inputs usable.
    quotaLocked = false;
    updateConvertBtnState(); // live mode still gates the button
    if (els.pasteBtn) {
      els.pasteBtn.disabled = false;
      els.pasteBtn.classList.remove('is-disabled');
    }
    var uploadLabel = document.querySelector('label[for="file-upload-input"]');
    if (uploadLabel) uploadLabel.classList.remove('is-disabled');
    if (els.fileUploadInput) els.fileUploadInput.disabled = false;
    return;
  }
  // Locked when out of points OR before the first server sync
  // (fail-closed: no verified balance, no conversion).
  var locked = pointsBalance <= 0 || !srvReady;
  quotaLocked = locked;
  updateConvertBtnState(); // combines quota lock with live-mode gate
  if (els.inputTextarea) {
    // DOCX template lock wins when quota is fine; quota lock wins always.
    var docxLock = !!(appState && appState.docxZip);
    els.inputTextarea.readOnly = locked || docxLock;
    els.inputTextarea.classList.toggle('panel__textarea--locked', locked || docxLock);
  }
  if (els.pasteBtn) {
    els.pasteBtn.disabled = locked;
    els.pasteBtn.classList.toggle('is-disabled', locked);
  }
  var uploadLabel = document.querySelector('label[for="file-upload-input"]');
  if (uploadLabel) uploadLabel.classList.toggle('is-disabled', locked);
  if (els.fileUploadInput) els.fileUploadInput.disabled = locked;
  if (locked) setStatusQuotaExhausted();
}

function pushHistory(words, batchId) {
  if (!words.length) return;
  // Optimistic local deduct; the server confirms via flush (source of truth).
  pendingSpend += words.length;
  saveSrv();
  syncDisplay();
  for (var i = 0; i < words.length; i++) {
    pointsLedger.push({ w: words[i].slice(0, 60), d: -1, b: pointsBalance, t: Date.now(), g: batchId });
  }
  if (pointsLedger.length > POINTS_LEDGER_MAX) {
    pointsLedger = pointsLedger.slice(pointsLedger.length - POINTS_LEDGER_MAX);
  }
  PointsBackend.save(pointsBalance, pointsLedger);
  historyPage = 1;
  renderPoints();
  renderPointsHistory();
  updateQuotaLock();
  scheduleFlush();
}

// Tries to charge only the NEW words since last charge.
// Returns charged count (>=0), or -1 when balance is insufficient
// (nothing deducted, caller must block the conversion).
function tryChargeDelta(text) {
  if (FREE_MODE) return 0; // free version: unlimited, nothing to charge
  var words = splitWords(text);
  var curr = words.length;
  if (curr < quotaWatermark) {
    quotaWatermark = curr; // shortened — no refund, lower watermark
    PointsBackend.save(pointsBalance, pointsLedger);
    return 0;
  }
  var addedCount = curr - quotaWatermark;
  if (addedCount <= 0) return 0;
  if (pointsBalance < addedCount) return -1;
  var added = words.slice(curr - addedCount);
  pushHistory(added, Date.now());
  quotaWatermark = curr;
  PointsBackend.save(pointsBalance, pointsLedger);
  return addedCount;
}

function showQuotaExhaustedToast(needed) {
  var now = Date.now();
  if (now - quotaToastShownAt < 2500) return;
  quotaToastShownAt = now;
  if (needed > 0) showToast('Free quota exceeded (need ' + needed + ' words, ' + formatPoints(pointsBalance) + ' left)');
  else showToast('Free quota exceeded');
}

// Live-mode gate: charge newly completed words immediately.
// Returns true when conversion may proceed, false when blocked.
function gateLiveCharge(text) {
  if (FREE_MODE) return true;
  if (!srvReady) { showConnectingToast(); return false; }
  var r = tryChargeDelta(text);
  if (r === -1) {
    setStatusQuotaExhausted();
    updateQuotaLock();
    showQuotaExhaustedToast(countWords(text) - quotaWatermark);
    return false;
  }
  return true;
}

// Back-compat wrappers (old call sites).
function chargePointsDelta(text) { gateLiveCharge(text); return 0; }
var historyPage = 1;
var historyPerPage = 25;
var expandedBatches = {}; // batchKey -> true (in-memory only)
function renderPointsHistory() {
  var list = document.getElementById('history-list');
  var info = document.getElementById('history-pageinfo');
  var prev = document.getElementById('history-prev');
  var next = document.getElementById('history-next');
  var total = pointsLedger.length;
  var pages = Math.max(1, Math.ceil(total / historyPerPage));
  if (historyPage > pages) historyPage = pages;
  if (historyPage < 1) historyPage = 1;
  if (!list) return;
  if (!total) {
    list.innerHTML = '<p class="muted">No conversions yet.</p>';
  } else {
    // Newest first; only the visible page slice is rendered (fast even at 1000 rows).
    // Entries are grouped by conversion batch into expandable rows.
    var end = total - (historyPage - 1) * historyPerPage;
    var start = Math.max(0, end - historyPerPage);
    var groups = [];
    var groupIndex = {};
    for (var i = end - 1; i >= start; i--) {
      var entry = pointsLedger[i];
      var key = (entry && entry.g) ? ('g' + entry.g) : 'earlier';
      if (!groupIndex[key]) {
        groupIndex[key] = { key: key, entries: [] };
        groups.push(groupIndex[key]);
      }
      groupIndex[key].entries.push(entry);
    }
    var html = '';
    groups.forEach(function (group) {
      var n = group.entries.length;
      var bal = group.entries[0].b;
      var title = group.key === 'earlier' ? 'Earlier entries' : (n + (n === 1 ? ' word' : ' words'));
      var open = !!expandedBatches[group.key];
      html += '<div class="ledger-group">'
        + '<button type="button" class="ledger-group__head" data-batch="' + group.key + '" aria-expanded="' + open + '">'
        + '<span class="ledger-group__top"><span class="ledger-group__title"><span class="ledger-group__chev" aria-hidden="true">'
        + (open ? '▾' : '▸')
        + '</span> ' + escapeHtml(title) + '</span>'
        + '<span class="ledger-group__delta">-' + n + '</span></span>'
        + '<span class="ledger-group__bal">' + formatPoints(bal) + '</span>'
        + '</button>'
        + '<div class="ledger-group__kids"' + (open ? '' : ' hidden') + '>';
      group.entries.forEach(function (e) {
        html += '<div class="ledger-point ledger-point--kid">'
          + '<div class="ledger-point__top"><span class="ledger-point__word">'
          + escapeHtml(e.w)
          + '</span><span class="ledger-point__delta">-1</span></div>'
          + '<div class="ledger-point__bal">' + formatPoints(e.b) + '</div>'
          + '</div>';
      });
      html += '</div></div>';
    });
    list.innerHTML = html;
  }
  if (info) info.textContent = total + ' entries · Page ' + historyPage + ' of ' + pages;
  if (prev) prev.disabled = (historyPage <= 1);
  if (next) next.disabled = (historyPage >= pages);
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
    appState.liveMode = !appState.liveMode;
    els.liveModeBtn.setAttribute('aria-checked', String(appState.liveMode));
    els.encodingBadge.classList.toggle('encoding-badge--live', appState.liveMode);
    updateConvertBtnState(); // live ON -> disabled, live OFF -> enabled
    if (appState.liveMode) convertPlainText(); else setStatusIdle();
  });

  els.convertBtn.addEventListener('click', function () {
    var text = els.inputTextarea.value;
    if (!hasConvertibleText(text)) return;
    // Same gate the disabled state expresses: with live mode on the text
    // already converts as it is typed, so a click (or the Ctrl+Enter shortcut,
    // which calls .click()) must not start a second, manual run.
    if (appState.liveMode || quotaLocked) return;
    if (appState.docxZip) { startManualConvert('Converting DOCX…', convertDocxTemplate); return; }
    startManualConvert('Converting…', convertPlainText);
  });

  els.pasteBtn.addEventListener('click', function () {
    if (quotaLocked) { showQuotaExhaustedToast(0); return; }
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (text) {
        snapshotForUndo();
        clearDocxTemplate();
        els.inputTextarea.value = text;
        quotaWatermark = 0; // bulk new text — next live tick / Convert click charges total
        PointsBackend.save(pointsBalance, pointsLedger);
        syncUndoBase();
        updateStats();
        setStatusIdle();
        scheduleLiveConvert();
      }).catch(function () { els.inputTextarea.focus(); });
    } else {
      els.inputTextarea.focus();
    }
  });

  els.fileUploadInput.addEventListener('change', function (e) {
    if (quotaLocked) { showQuotaExhaustedToast(0); e.target.value = ''; return; }
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
        quotaWatermark = 0; // uploaded file — Convert click charges total words
        PointsBackend.save(pointsBalance, pointsLedger);
        syncUndoBase();
        updateStats();
        setStatusIdle();
        scheduleLiveConvert();
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  });

  els.clearBtn.addEventListener('click', function () {
    snapshotForUndo();
    els.inputTextarea.value = '';
    els.outputTextarea.value = '';
    clearDocxTemplate();
    appState.parsedData = [];
    updateStats();
    setWarningBadge(0);
    setStatusIdle();
    try { localStorage.removeItem(STORAGE_TEXT_KEY); } catch (e) { /* non-fatal */ }
    showToast('Cleared');
  });

  els.docxStripClear.addEventListener('click', function () {
    snapshotForUndo();
    clearDocxTemplate();
    els.inputTextarea.value = '';
    updateStats();
    setStatusIdle();
    showToast('Template removed');
  });

  els.swapBtn.addEventListener('click', function () {
    snapshotForUndo();
    var inputVal = els.inputTextarea.value;
    var outputVal = els.outputTextarea.value;
    clearDocxTemplate();
    els.inputTextarea.value = outputVal;
    els.outputTextarea.value = inputVal;
    appState.parsedData = [];
    quotaWatermark = 0; // swapped text counts as new input — prevents free swap-convert loop
    PointsBackend.save(pointsBalance, pointsLedger);
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

  els.downloadTxtBtn.addEventListener('click', function () {
    var text = els.outputTextarea.value;
    if (!text || !text.trim()) { showToast('Nothing to download as txt file'); return; }
    startDownload('TXT', function () {
      return new Blob([text], { type: 'text/plain;charset=utf-8' });
    }, 'LipiLab_converted.txt');
  });

  els.downloadDocxBtn.addEventListener('click', function () {
    if (appState.docxZip) { convertDocxTemplate(); return; }
    if (appState.parsedData.length === 0) {
      var inputText = els.inputTextarea.value;
      if (!inputText || !inputText.trim()) { showToast('Nothing to download as docx file'); return; }
      convertPlainText();
    }
    if (appState.parsedData.length === 0) { showToast('Nothing to download as docx file'); return; }
    startDownload('DOCX', function () {
      return buildBlankDocxBlob(appState.parsedData);
    }, 'Converted_Document.docx');
  });

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
  if (els.downloadPdfBtn) els.downloadPdfBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showToast('PDF download feature coming soon');
  });
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

  window.addEventListener('resize', updateDirectionPillPosition);
  window.addEventListener('online', updateOfflineIndicator);
  window.addEventListener('offline', updateOfflineIndicator);
}

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
    if (e.ctrlKey && !e.shiftKey && !e.altKey && (key === 's' || key === 'S')) { e.preventDefault(); els.downloadTxtBtn.click(); return; }
    if (e.ctrlKey && !e.shiftKey && !e.altKey && (key === 'd' || key === 'D')) { e.preventDefault(); els.themeToggleBtn.click(); return; }
    if (key === '?' && !inField && !e.ctrlKey && !e.altKey) { openShortcuts(); return; }
    if (key === 'Escape' && els.unmapModal && !els.unmapModal.hidden) { closeUnmapModal(); return; }
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
