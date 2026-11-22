// ✦ Дом — ядро: настройки и данные чата, время истории, люди, хэды (общая полка с Life), хэд-машина,
// картинки (полароиды хэдов и комнаты), лор комнат.
//
// Хэды живут там же, где хедканоны Life (chat_metadata.life.pair.hc): что ты оставила на холодильнике, Life
// подмешивает модели по два-три к месту — как и написанные руками. Дом добавляет к записи картинку (img) и метку (src).

import * as D from './data.js';

export let A = null;
export function setApi(a) { A = a; }

const ctx = () => SillyTavern.getContext();
export const MODULE = 'dom';
export const VERSION = '0.4.0';

// ───────────── мелочи ─────────────

export const uid = () => Math.random().toString(36).slice(2, 8);
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const norm = (v) => String(v ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"“”„'`]/g, '').replace(/\s+/g, ' ').trim();
export const cut = (t, n) => { t = String(t ?? ''); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
export const str = (v) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
export const arr = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]);
export const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
export const d20 = () => 1 + Math.floor(Math.random() * 20);
const clone = (o) => JSON.parse(JSON.stringify(o ?? null));
const pad = (n) => String(n).padStart(2, '0');
export function plain(t) { return String(t || '').replace(/<[^>]+>/g, ' ').replace(/[*_~`#|]/g, '').replace(/\s+/g, ' ').trim(); }

/** Пока Дом открыт, тосты таверны прячутся под ним — показываю свои внутри окна. */
export function toast(kind, msg, title = '✦ Дом', opts = {}) {
    const app = document.getElementById('dm-dialog')?.open && document.getElementById('dm-app');
    if (app) {
        const el = document.createElement('div');
        el.className = `dm-toast ${kind}`;
        el.innerHTML = String(msg);
        app.append(el);
        requestAnimationFrame(() => el.classList.add('on'));
        setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 300); }, opts.timeOut || 3400);
        return;
    }
    try { window.toastr?.[kind]?.(msg, title, { timeOut: 4500, ...opts }); } catch { /* */ }
}

// ───────────── настройки и данные чата ─────────────

const DEF = {
    on: true,
    autoDraw: true,      // хэды и вещи рисуются сразу, как только появились
    model: 'deep',       // deep — умная модель Life (со сводом истории); chron — модель Летописца
    chron: true,         // Летописец замечает новое в доме, записки и счастливые моменты
    prompt: 'auto',      // auto — уютные детали модели, когда сцена дома; always; off
};
export function cfg() {
    const ext = ctx().extensionSettings;
    if (!ext[MODULE] || typeof ext[MODULE] !== 'object') ext[MODULE] = {};
    const s = ext[MODULE];
    for (const [k, v] of Object.entries(DEF)) if (s[k] === undefined) s[k] = clone(v);
    return s;
}
export const saveCfg = () => { try { ctx().saveSettingsDebounced(); } catch { /* */ } };

function blank() { return { v: 2, gen: [], rooms: {}, items: [], shots: [], sugg: [], shop: {}, nursery: {} }; }
export function M() {
    const md = ctx().chatMetadata;
    if (!md) return blank();
    if (!md.dom || typeof md.dom !== 'object') md.dom = blank();
    const m = md.dom;
    for (const k of ['gen', 'items', 'shots', 'sugg']) if (!Array.isArray(m[k])) m[k] = [];
    for (const k of ['rooms', 'shop', 'nursery', 'doll']) if (!m[k] || typeof m[k] !== 'object' || Array.isArray(m[k])) m[k] = {};
    return m;
}
export const hasChat = () => { try { return A?.hasChat ? A.hasChat() : !!ctx().chatMetadata; } catch { return false; } };
export function save() { try { ctx().saveMetadataDebounced?.(); } catch { /* */ } }
export function touch() { save(); }

// ───────────── время истории ─────────────

export function clock() {
    let st = {};
    try { st = A?.worldState?.() || {}; } catch { /* */ }
    const date = String(st.timestamp?.story_date || '');
    const time = String(st.timestamp?.story_time || '');
    let d = null;
    try { d = A?.parseDate?.(date) || null; } catch { /* */ }
    if (d && isNaN(d)) d = null;
    return { d, date, time, loc: String(st.scene?.location || ''), day: d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '' };
}
function timelineDay() {
    try {
        const cx = window.SacredTimeline?.context?.();
        if (!cx?.explicit) return null;
        const d = String(cx.date || cx.era?.from || '');
        if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
        if (/^\d{4}-\d{2}$/.test(d)) return `${d}-15`;
        if (/^\d{4}$/.test(d)) return `${d}-06-15`;
    } catch { /* */ }
    return null;
}
export const storyDay = () => timelineDay() || clock().day || '';
export function storyYear() { const d = storyDay(); return d ? Number(d.slice(0, 4)) : 2024; }
/** Картинки комнат — свои у каждой эпохи дома. */
export const eraKey = () => { const y = storyYear(); return y < 1950 ? '40s' : String(y); };
export function eraLine() {
    const k = clock();
    const y = storyYear();
    return `Дата истории: ${[k.date || storyDay(), k.time].filter(Boolean).join(', ') || `${y} год`}${k.loc ? `, место: ${k.loc}` : ''}. Эпоха: ${y < 1950 ? '1940-е (война, С.Н.Р.) — никаких современных вещей' : `${y} год`}.`;
}

// ───────────── люди ─────────────

export const canon = (n) => { try { return A?.canonName?.(n) || String(n || '').trim(); } catch { return String(n || '').trim(); } };
export const same = (a, b) => { if (!a || !b) return false; try { return A?.sameName ? A.sameName(a, b) : norm(a) === norm(b); } catch { return norm(a) === norm(b); } };
export const short = (n) => { try { return A?.shortName?.(canon(n)) || canon(n); } catch { return canon(n); } };
export const userName = () => canon(ctx().name1 || 'Хеди');
/** Свои: персона и участники группы. */
export function cast() {
    const out = [];
    const add = (n) => { n = canon(n); if (n && !out.some(x => same(x, n))) out.push(n); };
    add(ctx().name1);
    try { (A?.groupMembers?.() || []).forEach(add); } catch { /* */ }
    return out;
}
/** Пара по умолчанию: она и Баки (или первый из группы). */
export function defaultWho() {
    const c = cast();
    const me = userName();
    const him = c.find(n => !same(n, me) && /баки|bucky|барнс|barnes/i.test(n)) || c.find(n => !same(n, me));
    return [me, him].filter(Boolean);
}
export const avatarUrl = (n) => { try { return A?.avatarUrl?.(n, true) || ''; } catch { return ''; } };

// ───────────── хэды: общая полка с Life ─────────────

/** Хедканоны Life (chat_metadata.life.pair). Та же полка: Life подмешивает их модели. */
function lifePair() {
    const cm = A?.chatMeta?.();
    if (!cm || typeof cm !== 'object') return null;
    if (!cm.pair || typeof cm.pair !== 'object') cm.pair = {};
    const p = cm.pair;
    if (!p.pairs || typeof p.pairs !== 'object') p.pairs = {};
    if (!Array.isArray(p.hc)) p.hc = [];
    if (!Number.isFinite(p.seq)) p.seq = 0;
    return p;
}
const lifeSave = () => { try { A?.saveMeta?.(); } catch { /* */ } try { A?.updatePrompt?.(); } catch { /* */ } save(); };
export function hcList() { return lifePair()?.hc || []; }
export const hcById = (id) => hcList().find(h => h.id === id) || null;
/** Оставить хэд: на холодильник и в хедканоны Life. */
export function keep(card) {
    const p = lifePair();
    if (!p) throw new Error('Хедканоны живут в Life, а его нет');
    if (card.kept && p.hc.some(h => h.id === card.kept)) return hcById(card.kept);
    const h = { id: `h${++p.seq}`, who: arr(card.who).map(canon).filter(Boolean), t: cut(str(card.t), 300), img: str(card.img), src: 'dom', vibe: str(card.vibe), at: storyDay() || '' };
    if (!h.who.length) h.who = defaultWho();
    p.hc.push(h);
    card.kept = h.id;
    lifeSave();
    return h;
}
export function setHcImg(id, img) { const h = hcById(id); if (h) { h.img = img; lifeSave(); } }
export function toggleHc(id) { const h = hcById(id); if (h) { h.off = !h.off; lifeSave(); } return h; }
export function delHc(id) {
    const p = lifePair(); if (!p) return;
    p.hc = p.hc.filter(h => h.id !== id);
    for (const b of M().gen) for (const c of b.items) if (c.kept === id) c.kept = '';
    lifeSave();
}

// ───────────── заделы: что модели трогать нельзя ─────────────

/** «Не знает никто» из Узнавания Life, которое ещё не случилось, — её заделы на будущее. */
export function hiddenPlans() {
    try {
        const list = arr(A?.chatMeta?.()?.johari?.list);
        return list.filter(x => x && !x.off && x.kind === 'unknown' && num(x.step) < 1)
            .map(x => `${short(x.who)}: ${[str(x.when), str(x.t)].filter(Boolean).join(' — ')}`).slice(0, 12);
    } catch { return []; }
}
/** Записи книги, которые видно из этой эпохи (ядро «Священный таймлайн»: книги чужих эпох и будущее по дате — мимо). */
async function seen(book, data) {
    const list = Object.values(data?.entries || {});
    try { const v = window.SacredTimeline?.visible; return typeof v === 'function' ? await v(list, book) : list; } catch { return list; }
}
const eraTag = () => { try { const x = window.SacredTimeline?.context?.(); return `${x?.era?.id || ''}|${x?.date || ''}`; } catch { return ''; } };
let planMemo = { at: 0, era: '', v: { titles: [], re: null } };
/** Записи лорбуков «Задел: …» — их ключи (плейстейшн, приставк, видеоигр…) не пускают хэд на холодильник. */
export async function planKeys() {
    if (Date.now() - planMemo.at < 60000 && planMemo.era === eraTag()) return planMemo.v;
    const titles = [];
    const keys = [];
    try {
        const wi = await import('/scripts/world-info.js');
        for (const b of [...(wi.world_names || [])]) {
            let data = null;
            try { data = await (ctx().loadWorldInfo ? ctx().loadWorldInfo(b) : wi.loadWorldInfo(b)); } catch { continue; }
            for (const e of await seen(b, data)) {
                if (!e || e.disable || !/задел/i.test(String(e.comment || ''))) continue;
                titles.push(cut(str(e.comment), 80));
                for (const k of arr(e.key)) { const s = str(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); if (s.length >= 3) keys.push(s); }
            }
        }
    } catch { /* без лорбуков */ }
    planMemo = { at: Date.now(), era: eraTag(), v: { titles: titles.slice(0, 12), re: keys.length ? new RegExp(keys.join('|'), 'i') : null } };
    return planMemo.v;
}
export function _setPlanKeys(v) { planMemo = { at: Date.now(), era: eraTag(), v }; }

// ───────────── умная модель ─────────────

async function askJson(system, user, tokens, what, check, story = null) {
    const msgs = [{ role: 'system', content: system }, { role: 'user', content: user }];
    const o = { what: `Дом: ${what}`, check };
    if (story && A?.askFillJson && cfg().model === 'deep') return A.askFillJson(msgs, tokens, o, story);
    if (cfg().model === 'deep' && A?.askDeepJson) return A.askDeepJson(msgs, tokens, o);
    if (A?.askJson) return A.askJson(msgs, tokens, o);
    throw new Error('Нужен Life: Дом говорит через его модели (Мир → ⚙)');
}

/** Что о человеке знает Life: карточка, ядро характера, вкусы. */
function aboutText(who) {
    const out = [];
    for (const n of who.slice(0, 4)) {
        const bits = [];
        try { const t = A?.lore?.card?.(n, 1400); if (str(t)) bits.push(cut(plain(t), 1400)); } catch { /* */ }
        try { const t = A?.lore?.core?.(n); if (str(t)) bits.push(`Ядро: ${cut(plain(t), 500)}`); } catch { /* */ }
        try {
            const ts = arr(A?.tastes?.(n));
            const like = ts.filter(x => x.k !== 'dislike').map(x => x.t).slice(0, 10);
            const no = ts.filter(x => x.k === 'dislike').map(x => x.t).slice(0, 6);
            if (like.length || no.length) bits.push(`Любит: ${like.join(', ') || '—'}. Не любит: ${no.join(', ') || '—'}.`);
        } catch { /* */ }
        if (bits.length) out.push(`### ${n}\n${bits.join('\n')}`);
    }
    return out.join('\n\n');
}

const stems = (t) => new Set(norm(t).split(/[^a-zа-я0-9]+/i).filter(w => w.length >= 5).map(w => w.slice(0, 5)));
/** Похож ли хэд на уже записанный: больше половины значимых слов совпадают. */
export function isDup(t, pool) {
    const a = stems(t);
    if (a.size < 2) return pool.some(x => norm(x) === norm(t));
    return pool.some(x => { const b = stems(x); if (b.size < 2) return false; let k = 0; for (const w of a) if (b.has(w)) k++; return k / Math.min(a.size, b.size) > 0.55; });
}

export const SYS = `Ты — фанатка-соавтор ролевой истории God Complex (AU по MCU, по-русски) и придумываешь хэдканоны — «в моей голове это так»: маленькие правды о героях, которых нет в каноне, но в которые веришь сразу. Сейчас нужен позитив: автор отдыхает от драмы.
Правила:
— Каждый хэд — 1–2 предложения, конкретно: деталь, привычка, сценка, фраза. Не «он заботливый», а что именно он делает.
— Верны характерам, их истории и эпохе (дата ниже). Опирайся на карточки, лор и свод истории; не противоречь канону автора.
— Без драмы: никаких травм, смертей, ревности, ссор всерьёз и ангста. Психология — тёплая: что смягчилось, чему учатся, как любят.
— Новое: не повторяй записанные хэды и не пересказывай известное из лора.
— Заделы автора (список ниже) не трогать даже намёком — это её сюрпризы.
— К каждому — pic: один кадр для картинки по-английски (кто, что делает, где, свет, настроение; без текста на картинке).
Ответ — только JSON: {"items":[{"who":["имя"],"vibe":"cute|home|fun|pair|soul|odd|gold","t":"хэд по-русски","pic":"one-frame scene in English"}]}`;

/** Хэд-машина: настроения — по одному на хэд (кубик или выбранное), who — про кого. */
export async function genHc({ who = [], vibes = [], ask = '', rolls = [] } = {}) {
    who = arr(who).map(canon).filter(Boolean);
    if (!who.length) who = defaultWho();
    const n = D.BATCH;
    const vb = Array.from({ length: n }, (_, k) => (D.VIBES.some(v => v.id === vibes[k]) ? vibes[k] : vibes[0] && D.VIBES.some(v => v.id === vibes[0]) ? vibes[0] : 'cute'));
    const have = hcList().map(h => h.t);
    const offered = M().gen.slice(0, 3).flatMap(b => b.items.map(c => c.t));
    const plans = hiddenPlans();
    const pk = await planKeys();
    const usr = [
        eraLine(),
        `Про кого: ${who.join(', ')}${who.length > 1 ? ' — смешай: про каждого отдельно и про них вместе' : ''}.`,
        `Нужно ${n} хэда, по одному на настроение: ${vb.map((v, k) => `${k + 1}) ${D.vibeById(v).name} — ${D.vibeById(v).ask}`).join('; ')}.`,
        str(ask) ? `О чём (просьба автора): ${cut(str(ask), 200)}.` : '',
        have.length ? `Уже записаны (не повторяй и не перефразируй): ${have.slice(-40).map(t => cut(t, 120)).join(' | ')}` : '',
        offered.length ? `Уже предлагала недавно (тоже не повторяй): ${offered.slice(0, 16).map(t => cut(t, 90)).join(' | ')}` : '',
        [...plans, ...pk.titles].length ? `Заделы автора — НЕ трогать даже намёком: ${[...plans, ...pk.titles].join('; ')}` : '',
        `## О них\n${aboutText(who) || 'карточек не нашлось — опирайся на свод истории и канон'}`,
    ].filter(Boolean).join('\n');
    const j = await askJson(SYS, usr, 2600, 'хэды', (x) => Array.isArray(x?.items) && x.items.length, { who, pairs: true, world: false });
    const pool = [...have, ...offered];
    const items = [];
    arr(j.items).forEach((x, k) => {
        const t = cut(str(x?.t), 320);
        if (!t || isDup(t, [...pool, ...items.map(c => c.t)])) return;
        if (pk.re && (pk.re.test(t) || pk.re.test(str(x?.pic)))) return;
        const w = arr(x?.who).map(y => canon(str(y))).filter(y => y && [...cast(), ...who].some(p => same(p, y)));
        items.push({ id: uid(), who: w.length ? w : who.slice(0, 2), vibe: D.VIBES.some(v => v.id === x?.vibe) ? x.vibe : vb[k] || 'cute', t, pic: cut(str(x?.pic), 700), img: '', kept: '' });
    });
    if (!items.length) throw new Error('Модель повторилась или задела заделы — крутани ещё раз');
    const batch = { id: uid(), at: storyDay() || '', ts: Date.now(), who, rolls: arr(rolls).slice(0, n), vibes: vb, ask: cut(str(ask), 200), items: items.slice(0, n + 1) };
    const m = M();
    m.gen.unshift(batch);
    m.gen = m.gen.slice(0, 6);
    touch();
    return batch;
}
export const lastBatch = () => M().gen[0] || null;
export function cardById(id) { for (const b of M().gen) { const c = b.items.find(x => x.id === id); if (c) return { b, c }; } return null; }
export function dropCard(id) { for (const b of M().gen) b.items = b.items.filter(x => x.id !== id); M().gen = M().gen.filter(b => b.items.length); touch(); }

// ───────────── картинки ─────────────

function artStyle() {
    let s = '';
    try { s = str(A?.style?.()); } catch { /* */ }
    return s || 'semi-realistic coloured-pencil illustration with a soft watercolour wash';
}
/** Лицо для рефа: из Гардероба, иначе аватарка. */
export async function faceRef(n, max = 512) {
    const name = canon(n);
    const path = ctx().extensionSettings?.wardrobe?.faces?.[name] || avatarUrl(name);
    if (!path || !A?.refData) return null;
    try { return await A.refData(path, max); } catch { return null; }
}
export function hcPrompt(card, names) {
    const y = storyYear();
    const people = names.length ? `People in frame: ${names.map((n, i) => `${short(n)} — the person from reference image ${i + 1} (keep the face exactly)`).join('; ')}.` : '';
    return `${str(card.pic) || `Illustrate this little everyday truth about them (Russian): «${card.t}»`}
${people}
Setting: ${y < 1950 ? 'the 1940s, period-accurate clothes and interiors' : `present day, ${y}`}. A cosy, warm, candid moment; gentle light; tender, happy mood.
Style: ${artStyle()}. Square framing. No text, no letters, no captions.`;
}
/** Нарисовать хэд (карточку машины или запись с холодильника). */
export async function drawHc(card) {
    if (!A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    const who = arr(card.who).slice(0, 3);
    const refs = [];
    const names = [];
    for (const n of who) { const r = await faceRef(n); if (r) { refs.push(r); names.push(n); } }
    const img = await A.drawPicture(hcPrompt(card, names), { aspect: '1:1', max: 900, refs, prefix: 'dom_hc', who });
    card.img = img;
    if (card.kept) setHcImg(card.kept, img);
    touch();
    return img;
}

/** Лор комнаты: записи лорбуков квартиры (по имени книги) о ней. */
export async function roomLore(room) {
    try {
        const wi = await import('/scripts/world-info.js');
        const out = [];
        let len = 0;
        for (const b of [...(wi.world_names || [])]) {
            if (!/apartment|квартир|дом(?![а-яё])|house|home/i.test(b)) continue;
            let data = null;
            try { data = await (ctx().loadWorldInfo ? ctx().loadWorldInfo(b) : wi.loadWorldInfo(b)); } catch { continue; }
            // квартира 2024-го не рисуется в комнатах сороковых: книги чужих эпох ядро отрезает
            for (const e of await seen(b, data)) {
                if (!e || e.disable || !str(e.content)) continue;
                if (!room.re.test(`${e.comment || ''} ${arr(e.key).join(' ')}`)) continue;
                const t = cut(plain(e.content), 600);
                out.push(t); len += t.length;
                if (len > 900) break;
            }
            if (len > 900) break;
        }
        return cut(out.join(' '), 900);
    } catch { return ''; }
}
export const roomImg = (id) => M().rooms[`${id}:${eraKey()}`]?.img || '';
/** Нарисовать комнату. withItems — перерисовать её же, добавив расставленные вещи (их картинки — рефами). */
export async function drawRoom(room, { withItems = false, doll = '' } = {}) {
    if (!A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    const y = storyYear();
    const lore = await roomLore(room);
    const refs = [];
    const lines = [];
    let roomRef = false;
    if (withItems) {
        const cur = doll ? '' : roomImg(room.id);
        if (cur) { const r = await refData(cur, 1280); if (r) { refs.push(r); roomRef = true; } }
        const placed = placedIn(room.id);
        for (const it of placed.slice(0, 6)) {
            const r = refs.length < 4 && it.img ? await refData(it.img, 640) : null;
            const where = it.spot ? ` (${D.spotName(it.spot)})` : '';
            if (r) { refs.push(r); lines.push(`reference ${refs.length}: ${it.name}${where}`); }
            else lines.push(`${it.name}${it.desc ? ` — ${cut(it.desc, 80)}` : ''}${where}`);
        }
    }
    if (withItems && !lines.length && !doll) throw new Error('В комнате пока ничего не стоит — поставь вещи');
    const keep = withItems && roomRef;
    const base = keep
        ? `Keep this room exactly as in reference 1 (same layout, light and style) and add these things, each in its place (the spot is in Russian): ${lines.join('; ')}.`
        : `Interior: ${room.en} in the home of Hedy and Bucky (${y < 1950 ? 'the 1940s, period-accurate' : `present day, ${y}`}).${lore ? `\nDetails from the story (keep them): ${lore}` : ''}${doll ? `\nArrange the room exactly like this (the plan is in Russian; "left wall" and "right wall" are the two walls we see): ${doll}.` : ''}${lines.length ? `\nInclude these things, each in its place (the spot is in Russian): ${lines.join('; ')}.` : ''}`;
    const prompt = `${base}
Lived-in and cosy, warm light, small personal touches; no people, no text.
Style: ${artStyle()}. Wide composition.`;
    const img = await A.drawPicture(prompt, { aspect: '4:3', max: 1400, refs, prefix: 'dom_room' });
    M().rooms[`${room.id}:${eraKey()}`] = { img, at: storyDay() || '' };
    touch();
    return img;
}
export async function setRoomImg(id, img) { M().rooms[`${id}:${eraKey()}`] = { img, at: storyDay() || '' }; touch(); }
async function refData(path, max) { if (!path || !A?.refData) return null; try { return await A.refData(path, max); } catch { return null; } }

// ───────────── посты: что пришло из истории, живёт, пока пост в чате ─────────────

function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
export const keyOf = (m) => `${m?.swipe_id ?? 0}:${hash(String(m?.mes || ''))}`;
const chat = () => ctx().chat || [];
let liveMemo = { sig: '', set: new Set() };
export function liveKeys() {
    const c = chat();
    const sig = `${c.length}|${c.at(-1)?.mes?.length || 0}|${c.at(-1)?.swipe_id ?? 0}`;
    if (liveMemo.sig !== sig) liveMemo = { sig, set: new Set(c.map(keyOf)) };
    return liveMemo.set;
}
export const bump = () => { liveMemo.sig = ''; };
const isLive = (x) => !x.post || liveKeys().has(x.post);

// ───────────── вещи и полки ─────────────

const NUMS = ['page', 'ver', 'year', 'n', 'max', 'price', 'roll'];
export function normItem(kind, x, defaults = {}) {
    const K = D.kindOf(kind);
    const it = {
        id: uid(), kind: D.KINDS[kind] ? kind : 'decor', name: cut(str(x?.name), 160), desc: cut(str(x?.desc), 600), story: cut(str(x?.story), 400),
        who: cut(str(Array.isArray(x?.who) ? x.who.join(', ') : x?.who), 80), from: cut(str(x?.from), 80),
        room: D.roomById(str(x?.room)) ? str(x.room) : (defaults.room ?? K.room ?? ''), spot: D.SPOTS.some(s => s[0] === str(x?.spot)) ? str(x.spot) : (defaults.spot || ''),
        img: str(x?.img), pic: cut(str(x?.pic), 700), at: storyDay() || '', src: defaults.src || 'me', post: defaults.post || '',
    };
    if (it.room && !it.spot && K.place) it.spot = D.DEFAULT_SPOT[it.kind] || 'shelf';
    for (const k of ['author', 'rule', 'cat', 'take', 'when', 'cost', 'artist', 'unit', 'day', 'meaning', 'care', 'to']) { const v = cut(str(x?.[k]), 300); if (v) it[k] = v; }
    for (const k of NUMS) if (x?.[k] != null && Number.isFinite(Number(x[k]))) it[k] = Math.round(Number(x[k]));
    if (kind === 'note') { it.from = cut(str(x?.from) || defaults.from || '', 60); it.to = cut(str(x?.to) || defaults.to || '', 60); }
    if (kind === 'plant') it.planted = str(x?.planted) || storyDay() || '';
    if (kind === 'hobby') { it.max = Math.max(1, it.max || 100); it.n = Math.max(0, Math.min(it.max, it.n || 0)); }
    if (kind === 'name') it.votes = {};
    if (kind === 'recipe') it.ver = Math.max(1, it.ver || 1);
    if (!it.name) it.name = K.one;
    return it;
}
export function addItem(kind, x, defaults = {}) { const it = x?.id && x?.kind ? x : normItem(kind, x, defaults); M().items.unshift(it); touch(); return it; }
export const itemById = (id) => M().items.find(x => x.id === id) || null;
export function setItem(id, patch) { const it = itemById(id); if (it) { Object.assign(it, patch); touch(); } return it; }
export function delItem(id) { const m = M(); m.items = m.items.filter(x => x.id !== id); touch(); }
export const itemsOf = (kind) => M().items.filter(x => x.kind === kind && isLive(x));
export const placedIn = (room) => M().items.filter(x => isLive(x) && D.KINDS[x.kind]?.place && x.room === room);
export const unplaced = () => M().items.filter(x => isLive(x) && D.KINDS[x.kind]?.place && !x.room);
/** Растение: стадия по дням истории с посадки. */
export function plantStage(it) {
    const a = it.planted || it.at; const b = storyDay();
    if (!a || !b) return 0;
    const days = Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
    return days >= 60 ? 4 : days >= 30 ? 3 : days >= 12 ? 2 : days >= 4 ? 1 : 0;
}
export const PLANT_STAGE = ['посажено', 'росток', 'растёт', 'взрослое', 'урожай'];
export const pair = () => defaultWho();

/** Полка: придумать n штук (умная модель). opts.ask — пожелание; opts.roll — кубик (свидания); opts.from/to — записки. */
export async function genKind(kind, { n = 3, ask = '', roll = 0, from = '', to = '', story = false } = {}) {
    const K = D.kindOf(kind);
    const who = pair();
    const have = itemsOf(kind).map(x => x.name).slice(0, 40);
    const pk = await planKeys();
    const plans = [...hiddenPlans(), ...pk.titles];
    const sys = `Ты — соавтор ролевой истории God Complex (AU по MCU, по-русски) и наполняешь их дом уютом. Сейчас: «${K.name}» — ${K.gen}. Нужно: ${n}.
Правила: конкретно и по-ихнему, верно их характерам, истории и эпохе (дата ниже); без драмы; новое — не повторяй то, что уже есть; заделы автора не трогать даже намёком.${K.pic ? '\nК каждому — pic: один кадр для картинки по-английски (что на картинке; без текста на картинке).' : ''}
Ответ — только JSON: {"items":[{"name":"","desc":"1–2 предложения","story":"откуда или почему, 1 предложение","who":"чьё или про кого"${K.extra ? `,${K.extra}` : ''}${K.pic ? ',"pic":""' : ''}}]}`;
    const recent = kind === 'diary' || kind === 'note' ? lastPosts(4) : '';
    const usr = [
        eraLine(),
        `Они: ${who.join(' и ')}.`,
        roll ? `Кубик: ${roll} из 20 — ${D.dateTone(roll)}.` : '',
        from || to ? `Записка${from ? ` от ${from}` : ''}${to ? ` для ${to}` : ''}.` : '',
        str(ask) ? `Пожелание автора: ${cut(str(ask), 300)}.` : '',
        have.length ? `Уже есть (не повторяй): ${have.join(' | ')}` : '',
        plans.length ? `Заделы автора — НЕ трогать: ${plans.join('; ')}` : '',
        recent ? `## Последние события\n${recent}` : '',
        `## О них\n${aboutText(who) || 'по своду истории и канону'}`,
    ].filter(Boolean).join('\n');
    const useStory = story || ['joy', 'name', 'song', 'recipe', 'book'].includes(kind);
    const j = await askJson(sys, usr, 2400, K.name, (x) => Array.isArray(x?.items) && x.items.length, useStory ? { who, pairs: true, world: false } : null);
    const out = [];
    for (const x of arr(j.items).slice(0, Math.max(n, 1) + 1)) {
        if (!str(x?.name) && !str(x?.desc)) continue;
        if (pk.re && (pk.re.test(`${x.name} ${x.desc} ${x.story}`) || pk.re.test(str(x.pic)))) continue;
        if (isDup(`${x.name} ${x.desc}`, out.map(y => `${y.name} ${y.desc}`)) || [...have, ...out.map(y => y.name)].some(h => str(x.name) && norm(h) === norm(x.name))) continue;
        const it = normItem(kind, { ...x, roll: roll || x.roll }, { src: 'ai', from, to });
        if (kind === 'diary') it.day = it.day || storyDay();
        out.push(it);
    }
    if (!out.length) throw new Error('Модель повторилась — попробуй ещё раз');
    M().items.unshift(...out);
    touch();
    return out;
}
function lastPosts(k) {
    const c = chat(); const out = [];
    for (let i = c.length - 1; i >= 0 && out.length < k; i--) { const m = c[i]; if (!m || m.extra?.type === 'comment' || m.is_system) continue; out.unshift(`${m.name}: ${cut(plain(m.mes), 700)}`); }
    return out.join('\n\n');
}

// ───────────── особые действия полок ─────────────

/** Колода: тянуть карту (не тянутые — сначала). */
export function drawCard() {
    const all = itemsOf('card');
    if (!all.length) return null;
    let pool = all.filter(x => !x.drawn);
    if (!pool.length) { for (const x of all) x.drawn = false; pool = all; }
    const c = pool[Math.floor(Math.random() * pool.length)];
    c.drawn = true; c.drawnAt = storyDay() || '';
    touch();
    return c;
}
/** Баки: сказка на ночь из книги — его голосом. */
export async function bedtime(book) {
    const sys = 'Ты пишешь за Баки Барнса (God Complex, AU по MCU, по-русски): он пересказывает Хеди на ночь кусочек из своей книги — она просит, для неё это сложнее квантовой физики. 5–7 предложений, его голос: спокойно, тепло, немного по-старомодному, с его комментариями. Без цитат из книги — своими словами. Ответ — только JSON: {"tale":""}';
    const usr = `${eraLine()}\nКнига: «${book.name}»${book.author ? `, ${book.author}` : ''}. ${book.desc || ''}${book.page ? ` Закладка на странице ${book.page}.` : ''}`;
    const j = await askJson(sys, usr, 1200, 'сказка на ночь', (x) => str(x?.tale), null);
    book.tale = cut(str(j.tale), 1400);
    touch();
    return book.tale;
}
/** Догоняем век: что он думает (его голосом). */
export async function catchTake(it) {
    const sys = 'Ты — Баки Барнс (God Complex, AU по MCU, по-русски): человек из 40-х, догоняющий век. Скажи, что ты думаешь об этом — 1–3 предложения, твоим голосом: сдержанно, с сухим юмором, иногда трогательно. Ответ — только JSON: {"take":""}';
    const j = await askJson(sys, `${eraLine()}\nЧто это: ${it.name}${it.cat ? ` (${it.cat})` : ''}. ${it.desc || ''}`, 900, 'Догоняем век', (x) => str(x?.take), null);
    it.take = cut(str(j.take), 400); it.done = true;
    touch();
    return it.take;
}
/** Кроватка по инструкции: d20 и как прошла сборка. */
export function cribRoll() {
    const roll = d20();
    const text = D.cribOf(roll);
    M().nursery.crib = { roll, text, at: storyDay() || '' };
    touch();
    return { roll, text };
}
/** Голос за имя. */
export function vote(id, who, v) { const it = itemById(id); if (!it) return; it.votes = it.votes || {}; if (it.votes[who] === v) delete it.votes[who]; else it.votes[who] = v; touch(); }
export const votesOf = (it) => Object.values(it.votes || {}).reduce((a, v) => a + (v === 'love' ? 2 : v === 'ok' ? 1 : v === 'no' ? -2 : 0), 0);

// ───────────── картинки вещей ─────────────

export function itemPrompt(it, names = []) {
    const K = D.kindOf(it.kind);
    const y = storyYear();
    const era = y < 1950 ? 'the 1940s, period-accurate' : `present day, ${y}`;
    const base = str(it.pic) || `${it.name}. ${it.desc || ''}`;
    const people = names.length ? `\nPeople in frame: ${names.map((n, i) => `${short(n)} — the person from reference image ${i + 1} (keep the face exactly)`).join('; ')}.` : '';
    const st = artStyle();
    switch (K.pic) {
        case 'product': return `${base}\nA single object, centred, soft warm light on a plain cream background, cosy and detailed (${era}). Style: ${st}. No text, no letters, no logos, no real cover art.`;
        case 'dish': return `${base}\nA homemade dish on a wooden table in a brick-walled kitchen, warm evening light, steam, cosy (${era}). Style: ${st}. No text.`;
        case 'cat': return `${base}\nAlpine — a fluffy white cat — in a cosy apartment with red brick walls (${era}). Candid, funny, warm. Style: ${st}. No text.`;
        case 'photo': return `${base}${people}\nA candid photograph (${era}), natural light, a real moment, slight film grain. No text.`;
        default: return `${base}${people}\nSetting: ${era}. A cosy, warm, candid moment; gentle light. Style: ${st}. No text, no letters.`;
    }
}
const PEOPLE_PIC = ['scene', 'photo'];
export async function drawItem(it) {
    if (!A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    const K = D.kindOf(it.kind);
    const names = [];
    const refs = [];
    if (PEOPLE_PIC.includes(K.pic)) {
        const who = cast().filter(n => !it.who || norm(it.who).includes(norm(short(n))));
        for (const n of (who.length ? who : pair()).slice(0, 3)) { const r = await faceRef(n); if (r) { refs.push(r); names.push(n); } }
    }
    const img = await A.drawPicture(itemPrompt(it, names), { aspect: '1:1', max: 900, refs, prefix: `dom_${it.kind}`, who: names });
    it.img = img;
    touch();
    return img;
}

// ───────────── картинки из чата (для фото на стенах) ─────────────

export function chatImages(max = 40) {
    const out = [];
    const seen = new Set();
    const c = chat();
    for (let i = c.length - 1; i >= 0 && out.length < max; i--) {
        const m = c[i];
        if (!m) continue;
        const list = [m.extra?.image, ...arr(m.extra?.image_swipes), ...[...String(m.mes || '').matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(x => x[1])];
        for (const src of list) { const s = str(src); if (!s || seen.has(s) || /^data:image\/svg/.test(s)) continue; seen.add(s); out.push({ src: s, mes: i }); }
    }
    return out;
}

// ───────────── покупки: витрина от умной модели, оплата — счёт «за дом» в Life (LifeMoney, Life 0.71+) или банк Телефона ─────────────

const LM = () => { try { return globalThis.LifeMoney?.ready?.() ? globalThis.LifeMoney : null; } catch { return null; } };
let bankMod = null;
export async function bank() {
    if (bankMod !== null) return bankMod;
    try { const b = await import('/scripts/extensions/third-party/Phone-ST/bank.js'); bankMod = typeof b.getBank === 'function' ? b : false; } catch { bankMod = false; }
    return bankMod;
}
export function balance() { const lm = LM(); if (lm) { try { const b = lm.balance(lm.defaultPayer('dom')); if (b) return { v: b.v, text: `${b.text} · ${b.name}`, life: true }; } catch { /* */ } } if (!bankMod) return null; try { const bk = bankMod.getBank(); return { v: num(bk.balance), text: bankMod.fmtMoney(bk.balance) }; } catch { return null; } }
export function money(n) { try { const lm = LM(); if (lm) return lm.fmt(n); return bankMod?.fmtMoney ? bankMod.fmtMoney(n) : `$${Math.round(n).toLocaleString('ru-RU')}`; } catch { return `$${n}`; } }
export const priceNum = (p) => { const s = String(p ?? '').replace(/\s/g, '').replace(',', '.'); const m = s.match(/-?\d+(\.\d+)?/); return m ? Math.round(Number(m[0])) : 0; };
async function pay(amount, label) {
    const lm = LM();
    if (lm && amount > 0) { const r = await lm.pay({ acc: lm.defaultPayer('dom'), amount, label: cut(label, 80), category: 'дом', src: 'dom' }); return r.ok ? { ok: true, name: r.name } : { ok: false, why: r.why || 'не вышло' }; }
    const b = await bank();
    if (!b || !(amount > 0)) return { ok: false, why: b ? '' : 'банк Телефона не найден — без списания' };
    try {
        const bal = num(b.getBank().balance);
        if (bal < amount) return { ok: false, why: `на счету ${b.fmtMoney(bal)} — не хватает` };
        b.addTransaction({ amount: -amount, label: cut(label, 80), category: 'дом' });
        return { ok: true };
    } catch (e) { return { ok: false, why: String(e?.message || e) }; }
}
export async function shopGen(cat, ask = '', more = false) {
    const name = D.SHOP_CATS.find(c => c[0] === cat)?.[1] || cat;
    const have = M().shop[cat]?.list || [];
    const sys = `Ты — продавец в ролевой истории God Complex: подбираешь вещи для дома Хеди и Баки (довоенный кирпичный дом на Манхэттене, уют, немного винтажа, у Хеди — гиковские штуки, у Баки — 40-е). Раздел: ${name}. 8 позиций разной цены: что это, каково вживую, кому из них понравится и почему. Цены — в долларах эпохи. Без брендов-подделок.
Ответ — только JSON: {"items":[{"name":"","desc":"1–2 предложения","price":0,"from":"где продаётся","pic":"предмет для картинки по-английски","room":"kitchen|living|bedroom|nursery|roof|","spot":"shelf|wall|table|window|floor|bed|sofa|"}]}`;
    const usr = `${eraLine()}${ask ? `\nПросьба: ${cut(ask, 200)}` : ''}${more && have.length ? `\nУже на витрине (не повторяй): ${have.map(x => x.name).join(', ')}` : ''}\nУ них дома уже есть: ${M().items.filter(x => D.KINDS[x.kind]?.place).map(x => x.name).slice(0, 30).join(', ') || 'почти ничего'}.`;
    const j = await askJson(sys, usr, 2600, `покупки: ${name}`, (x) => Array.isArray(x?.items) && x.items.length, null);
    const list = arr(j.items).filter(x => str(x?.name)).slice(0, 10).map(x => ({ ...x, _id: uid(), cat }));
    M().shop[cat] = { at: Date.now(), list: more ? [...have, ...list] : list };
    touch();
    return M().shop[cat].list;
}
export const shopList = (cat) => M().shop[cat]?.list || [];
export async function buy(x) {
    const kind = D.SHOP_KIND[x.cat] || 'decor';
    const price = priceNum(x.price);
    let paid = '';
    if (price > 0) {
        const r = await pay(price, `Дом: ${x.name}`);
        if (!r.ok && r.why && !/не найден/.test(r.why)) throw new Error(r.why);
        paid = r.ok ? `−${money(price)}${r.name ? ` · ${r.name}` : ''}` : r.why;
    }
    const it = addItem(kind, { ...x, price }, { src: 'shop' });
    const list = shopList(x.cat); const k = list.indexOf(x); if (k >= 0) list.splice(k, 1);
    touch();
    return { it, paid };
}

// ───────────── Летописец: новое в доме, записки, счастливые моменты ─────────────

const CHRON_RULE = `dom — дом и уют по ЭТОМУ посту (только то, что в посте есть): {"new":[{"kind":"decor|plush|book|plant|photo|recipe|hobby|nursery","name":"что, 2–6 слов","who":"кто купил, подарил или сделал","room":"kitchen|living|bedroom|nursery|roof|"}],"read":"книга, которую Баки взялся читать, или пусто","note":{"from":"","to":"","t":"записка, если в посте её написали или оставили"},"joy":"счастливый тёплый момент поста, 4–12 слов, или пусто"}. Пустое не пиши; нечего — {}.`;
const HOME_RE = /(?<![а-яё])дом(?![а-яё])|дома\b|квартир|кухн|гостин|спальн|детск|ванн|манхэттен|лавк|марко|крыш|холодильник|полк|диван/i;
export function chronHook(i) {
    if (!cfg().on || !cfg().chron || !hasChat()) return null;
    const m = chat()[i];
    const t = plain(m?.mes || '');
    if (!HOME_RE.test(`${t} ${clock().loc}`) && !/купил|подарил|повесил|посадил|записк|книг|плюшев|игрушк|рецепт|счастлив|смеял|улыб/i.test(t)) return null;
    const books = itemsOf('book').slice(0, 8).map(b => b.name);
    return { key: '"dom": {}', rule: CHRON_RULE, input: `ДОМ: ${books.length ? `книги Баки: ${books.join(', ')}` : 'книг пока нет'}.`, tokens: 180 };
}
export function afterPost(i, j, msg) {
    const d = j?.dom;
    if (!d || typeof d !== 'object') return [];
    const post = keyOf(msg || chat()[i]);
    const out = [];
    const m = M();
    for (const x of arr(d.new).slice(0, 4)) {
        const name = cut(str(x?.name), 80);
        if (!name || m.items.some(y => norm(y.name) === norm(name)) || m.sugg.some(y => norm(y.name) === norm(name))) continue;
        m.sugg.unshift({ id: uid(), kind: D.KINDS[str(x?.kind)] ? str(x.kind) : 'decor', name, who: cut(str(x?.who), 60), room: D.roomById(str(x?.room)) ? str(x.room) : '', post, mes: i });
        out.push(`Новое в доме: ${name}`);
    }
    m.sugg = m.sugg.slice(0, 30);
    const nt = d.note;
    if (nt && str(nt.t) && !m.items.some(y => y.kind === 'note' && y.post === post)) { addItem('note', { name: cut(str(nt.t), 300), from: str(nt.from), to: str(nt.to) }, { src: 'post', post, from: str(nt.from), to: str(nt.to) }); out.push('Записка — на холодильнике'); }
    if (str(d.joy) && !m.items.some(y => y.kind === 'joy' && y.post === post)) {
        const img = chatImages(80).find(x => x.mes === i)?.src || '';
        addItem('joy', { name: cut(str(d.joy), 160), img, day: storyDay() }, { src: 'post', post });
        out.push('В банку хорошего — записка');
    }
    if (str(d.read)) {
        const b = itemsOf('book').find(x => norm(x.name).includes(norm(d.read)) || norm(d.read).includes(norm(x.name)));
        if (b) { for (const y of itemsOf('book')) y.reading = y === b; touch(); }
        else if (!m.sugg.some(y => norm(y.name) === norm(d.read))) m.sugg.unshift({ id: uid(), kind: 'book', name: cut(str(d.read), 80), who: 'Баки', room: 'living', post, mes: i, read: true });
    }
    touch();
    return out;
}
export const suggestions = () => M().sugg.filter(x => !x.post || liveKeys().has(x.post));
export function acceptSugg(id) {
    const m = M(); const x = m.sugg.find(y => y.id === id); if (!x) return null;
    m.sugg = m.sugg.filter(y => y.id !== id);
    const it = addItem(x.kind, { name: x.name, who: x.who, room: x.room }, { src: 'story' });
    if (x.read) { for (const y of itemsOf('book')) y.reading = y === it; }
    touch();
    return it;
}
export function dropSugg(id) { const m = M(); m.sugg = m.sugg.filter(y => y.id !== id); touch(); }
/** Из истории: что у них дома уже есть по свод/посты (вещи, подарки, покупки). */
export async function fromStory() {
    const sys = `Ты — архивист ролевой истории God Complex. Выпиши вещи, которые по истории есть у Хеди и Баки дома: покупки, подарки, декор, фото на стенах, книги, плюшевые, растения, вещи для малыша. Только то, что правда было; не выдумывай.
Ответ — только JSON: {"items":[{"kind":"decor|plush|book|plant|photo|recipe|hobby|nursery","name":"","desc":"","who":"чьё или кто подарил","room":"kitchen|living|bedroom|nursery|roof|","spot":"shelf|wall|table|window|floor|bed|sofa|fridge|"}]}. Не больше 20.`;
    const usr = `${eraLine()}\nУже есть (не повторяй): ${M().items.map(x => x.name).slice(0, 60).join(', ') || 'ничего'}.\n## Последние посты\n${lastPosts(10)}`;
    const j = await askJson(sys, usr, 3200, 'из истории', (x) => Array.isArray(x?.items), { who: pair(), pairs: false, world: true });
    return arr(j.items).filter(x => str(x?.name) && !M().items.some(y => norm(y.name) === norm(x.name)));
}

// ───────────── заметка модели и разовые сцены ─────────────

export function shot(key, text) {
    const m = M();
    m.shots = m.shots.filter(x => x.key !== key);
    m.shots.push({ id: uid(), key, text: cut(text, 900), at: chat().length - 1 });
    touch();
    try { A?.updatePrompt?.(); } catch { /* */ }
}
/** После ответа модели — разовые сцены отыграны. */
export function spendShots(i) { const m = M(); const n = m.shots.length; m.shots = m.shots.filter(x => x.at >= i); if (m.shots.length !== n) touch(); }
export const atHome = () => cfg().prompt === 'always' || HOME_RE.test(clock().loc);
export function promptNote(type) {
    if (!cfg().on || cfg().prompt === 'off' || !hasChat() || type === 'quiet' || type === 'impersonate') return '';
    const out = [];
    for (const s of M().shots) out.push(s.text);
    if (!atHome()) return out.join('\n');
    const lines = [];
    const rd = itemsOf('book').find(b => b.reading);
    if (rd) lines.push(`Баки сейчас читает «${rd.name}»${rd.author ? ` (${rd.author})` : ''}${rd.page ? `, закладка на ${rd.page}-й` : ''}`);
    const notes = itemsOf('note').slice(0, 2);
    if (notes.length) lines.push(`на холодильнике ${notes.map(n => `записка${n.from ? ` от ${short(n.from)}` : ''}: «${cut(n.name, 90)}»`).join('; ')}`);
    const hb = itemsOf('hobby').find(h => h.n > 0 && h.n < h.max);
    if (hb) lines.push(`${hb.name}: ${hb.n}/${hb.max}${hb.unit ? ` ${hb.unit}` : ''}`);
    const fresh = M().items.filter(x => isLive(x) && D.KINDS[x.kind]?.place && x.room && x.src !== 'ai').slice(0, 3);
    if (fresh.length) lines.push(`недавно в доме: ${fresh.map(x => `${x.name} (${D.roomById(x.room)?.name.toLowerCase()}${x.spot ? `, ${D.spotName(x.spot)}` : ''})`).join(', ')}`);
    const nm = itemsOf('name').filter(x => votesOf(x) > 0).sort((a, b) => votesOf(b) - votesOf(a)).slice(0, 3);
    if (nm.length) lines.push(`имена для дочки в шорт-листе: ${nm.map(x => `${x.name}${Object.entries(x.votes || {}).filter(([, v]) => v === 'love').map(([w]) => ` (${short(w)} за)`).join('')}`).join(', ')}`);
    const cb = M().nursery.crib;
    if (cb?.text && itemsOf('nursery').length) lines.push('в детской кроватка уже собрана');
    if (lines.length) out.push(`[Дом — уютные детали (вплетай к месту, деталью, без пересказа и не как сюжет): ${lines.join('; ')}.]`);
    return out.join('\n');
}
