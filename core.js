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
export const VERSION = '0.1.0';

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
    autoDraw: true,      // хэды рисуются сразу, как только выпали
    model: 'deep',       // deep — умная модель Life (со сводом истории); chron — модель Летописца
};
export function cfg() {
    const ext = ctx().extensionSettings;
    if (!ext[MODULE] || typeof ext[MODULE] !== 'object') ext[MODULE] = {};
    const s = ext[MODULE];
    for (const [k, v] of Object.entries(DEF)) if (s[k] === undefined) s[k] = clone(v);
    return s;
}
export const saveCfg = () => { try { ctx().saveSettingsDebounced(); } catch { /* */ } };

function blank() { return { v: 1, gen: [], rooms: {} }; }
export function M() {
    const md = ctx().chatMetadata;
    if (!md) return blank();
    if (!md.dom || typeof md.dom !== 'object') md.dom = blank();
    const m = md.dom;
    if (!Array.isArray(m.gen)) m.gen = [];
    if (!m.rooms || typeof m.rooms !== 'object' || Array.isArray(m.rooms)) m.rooms = {};
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
let planMemo = { at: 0, v: { titles: [], re: null } };
/** Записи лорбуков «Задел: …» — их ключи (плейстейшн, приставк, видеоигр…) не пускают хэд на холодильник. */
export async function planKeys() {
    if (Date.now() - planMemo.at < 60000) return planMemo.v;
    const titles = [];
    const keys = [];
    try {
        const wi = await import('/scripts/world-info.js');
        for (const b of [...(wi.world_names || [])]) {
            let data = null;
            try { data = await (ctx().loadWorldInfo ? ctx().loadWorldInfo(b) : wi.loadWorldInfo(b)); } catch { continue; }
            for (const e of Object.values(data?.entries || {})) {
                if (!e || e.disable || !/задел/i.test(String(e.comment || ''))) continue;
                titles.push(cut(str(e.comment), 80));
                for (const k of arr(e.key)) { const s = str(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); if (s.length >= 3) keys.push(s); }
            }
        }
    } catch { /* без лорбуков */ }
    planMemo = { at: Date.now(), v: { titles: titles.slice(0, 12), re: keys.length ? new RegExp(keys.join('|'), 'i') : null } };
    return planMemo.v;
}
export function _setPlanKeys(v) { planMemo = { at: Date.now(), v }; }

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
            for (const e of Object.values(data?.entries || {})) {
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
export async function drawRoom(room) {
    if (!A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    const y = storyYear();
    const lore = await roomLore(room);
    const prompt = `Interior: ${room.en} in the home of Hedy and Bucky (${y < 1950 ? 'the 1940s, period-accurate' : `present day, ${y}`}).${lore ? `\nDetails from the story (keep them): ${lore}` : ''}
Lived-in and cosy, warm light, small personal touches; no people, no text.
Style: ${artStyle()}. Wide composition.`;
    const img = await A.drawPicture(prompt, { aspect: '4:3', max: 1400, prefix: 'dom_room' });
    M().rooms[`${room.id}:${eraKey()}`] = { img, at: storyDay() || '' };
    touch();
    return img;
}
export async function setRoomImg(id, img) { M().rooms[`${id}:${eraKey()}`] = { img, at: storyDay() || '' }; touch(); }
