// ✦ Дом — магниты из поездок на холодильнике (в 1943-м — открытки и трофеи над койкой, на «Скитальце» — нашивки
// с планет на переборке камбуза). Каждый — с картинкой (ИИ рисует сувенир, фон вырезается) и памятью: где, когда,
// что там было. Расставляются пальцем по дверце. «Из истории» — модель находит места, где они правда были.

import * as C from './core.js';
import * as D from './data.js';
import * as Doll from './doll.js';

const esc = (v) => C.esc(v);
export function list() { const m = C.M(); if (!Array.isArray(m.mags)) m.mags = []; return m.mags; }
const live = (x) => !x.post || C.liveKeys().has(x.post);
export const on = (room) => list().filter(x => live(x) && (!x.room || x.room === room));
/** Где у эпохи доска с сувенирами и как они называются. */
export const boardRoom = () => D.roomsHere().find(r => r.board) || D.rooms().find(r => r.board) || null;
export function styleOf(room) {
    const b = D.boardOf(room || boardRoom());
    const w = b?.[1] || 'магниты';
    return { word: w, title: b?.[2] || 'Магниты', kind: w === 'открытки' ? 'card' : w === 'нашивки' ? 'patch' : 'magnet', one: w === 'открытки' ? 'открытка' : w === 'нашивки' ? 'нашивка' : 'магнит' };
}
const seedPos = (k) => { let h = 0; for (const ch of String(k)) h = (h * 33 + ch.charCodeAt(0)) | 0; h >>>= 0; return { x: 14 + (h % 72), y: 22 + ((h >> 7) % 56), r: ((h >> 13) % 17) - 8 }; };

export function add({ place, when = '', line = '', who = '', room = '', src = 'me', post = '' } = {}) {
    place = C.cut(C.str(place), 60);
    if (!place) return null;
    if (list().some(x => live(x) && C.norm(x.place) === C.norm(place))) return null;
    const r = D.roomById(room) ? room : boardRoom()?.id || '';
    const st = styleOf(D.roomById(r));
    const x = { id: C.uid(), kind: 'magnet', style: st.kind, place, when: C.cut(C.str(when), 60), line: C.cut(C.str(line), 300), who: C.cut(C.str(who), 60), room: r, src, post, img: '', ...seedPos(place) };
    list().push(x);
    C.touch();
    try { C.A?.updatePrompt?.(); } catch { /* */ }
    return x;
}
export const byId = (id) => list().find(x => x.id === id) || null;
export function del(id) { const m = C.M(); m.mags = list().filter(x => x.id !== id); C.touch(); }
export function move(id, x, y) { const m = byId(id); if (!m) return; m.x = Math.round(Math.max(6, Math.min(94, x))); m.y = Math.round(Math.max(10, Math.min(90, y))); C.touch(); }

function prompt(m) {
    const hint = m.line ? ` (memory: ${C.cut(m.line, 160)})` : '';
    if (m.style === 'card') return `A vintage 1940s picture postcard of ${m.place}${hint}: faded colours, a white border, a landmark view, slightly worn corners; photographed flat, straight on. No text, no letters.`;
    if (m.style === 'patch') return `An embroidered travel patch from ${m.place}${hint} — a world or a space port far from Earth: colourful thread, a merrowed edge, a stylised emblem; centred on a plain pure white background. Product photo. No text, no letters.`;
    return `A kitschy tourist fridge magnet souvenir from ${m.place}${hint}: a small glossy painted resin magnet shaped like a local landmark or symbol of that place, photographed straight on, centred, on a plain pure white background. Product photo. No text, no letters.`;
}
export async function draw(m) {
    if (!C.A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    m.img = await C.A.drawPicture(prompt(m), { aspect: m.style === 'card' ? '4:3' : '1:1', max: 640, prefix: 'dom_mag' });
    m.cutImg = ''; m.cutFail = 0;
    C.touch();
    if (m.style !== 'card') { try { await Doll.cutItem(m, true); } catch (e) { console.warn('[Дом] магнит: фон', e); } }
    return m.img;
}
/** «Из истории»: места, где они правда были (свод истории Life). */
export async function fromStory() {
    const st = styleOf();
    const sys = `Ты — архивист ролевой истории God Complex. Выпиши места, где Хеди (и те, с кем она живёт) правда побывали по истории — города, страны, базы, планеты, — откуда можно было бы привезти ${st.one === 'открытка' ? 'открытку' : st.one === 'нашивка' ? 'нашивку' : 'магнит на холодильник'}. Только то, что было; не выдумывай. Для каждого — что там было, одной тёплой фразой, без драмы.
Ответ — только JSON: {"items":[{"place":"","when":"когда, коротко","line":"что там было","who":"кто там был с ней"}]}. Не больше 10.`;
    const usr = `${C.eraLine()}\n${C.homeLine()}\nУже есть: ${list().map(x => x.place).join(', ') || 'ничего'}.`;
    const msgs = [{ role: 'system', content: sys }, { role: 'user', content: usr }];
    const o = { what: 'Дом: места из истории', check: (x) => Array.isArray(x?.items) };
    const j = C.A?.askFillJson && C.cfg().model === 'deep' ? await C.A.askFillJson(msgs, 2400, o, { who: C.pair(), pairs: false, world: true }) : await C.A.askJson(msgs, 2400, o);
    return (Array.isArray(j?.items) ? j.items : []).filter(x => C.str(x?.place) && !list().some(y => C.norm(y.place) === C.norm(x.place)));
}
export function toScene(id) {
    const m = byId(id);
    if (!m) return false;
    const st = styleOf(D.roomById(m.room));
    C.shot(`mag:${m.id}`, `[${st.title}: взгляд цепляется за ${st.one} «${m.place}»${m.when ? ` (${m.when})` : ''}${m.line ? ` — вспоминается: ${m.line}` : ''}. Пусть всплывёт тёплым воспоминанием, к месту.]`);
    return true;
}

// ───────────── модели и Летописцу ─────────────

export function notes() {
    const r = boardRoom();
    const l = r ? on(r.id) : [];
    if (!l.length) return [];
    const st = styleOf(r);
    return [`${st.word === 'открытки' ? 'над койкой — открытки' : st.word === 'нашивки' ? 'на переборке камбуза — нашивки' : 'на холодильнике — магниты'} из мест, где были: ${l.slice(0, 6).map(x => x.place).join(', ')}`];
}
export const CHRON = `"trip":"место, откуда вернулись или где были в ЭТОМ посте (город, страна, планета), или пусто"`;
export function afterPost(d, post) {
    const t = C.str(d?.trip);
    if (!t) return [];
    const m = add({ place: t, src: 'post', post, when: C.storyDay() || '' });
    return m ? [`Новый ${styleOf().one}: ${m.place}`] : [];
}

// ───────────── экран ─────────────

export function layerHtml(r, { ic }) {
    const st = styleOf(r);
    const l = on(r.id);
    const one = (m) => `<div class="dm-magnet s-${m.style}" data-mag="${m.id}" style="left:${m.x}%;top:${m.y}%;--r:${m.r || 0}deg">${m.cutImg || m.img ? `<img src="${esc(m.cutImg || m.img)}" alt="" draggable="false">` : `<span class="dm-magnet-ph">${esc(C.cut(m.place, 14))}</span>`}</div>`;
    return `<div class="dm-mags s-${st.kind}" data-room="${r.id}">${l.map(one).join('')}<button class="dm-mags-add" data-dm="magAdd" data-room="${r.id}" title="Добавить">${ic('plus')}</button>${l.length ? '' : `<span class="dm-mags-hint">${esc(st.title)}: ＋</span>`}</div>`;
}
let H = null;
export function bind(h) { H = h; }
let drag = null;
/** Таскать пальцем по дверце; тап — карточка. */
export function mount(root) {
    for (const box of root.querySelectorAll('.dm-mags')) {
        box.addEventListener('pointerdown', (e) => {
            const el = e.target.closest('.dm-magnet');
            if (!el) return;
            e.preventDefault();
            const r = box.getBoundingClientRect();
            drag = { el, id: el.dataset.mag, box: r, x0: e.clientX, y0: e.clientY, moved: false };
            try { el.setPointerCapture(e.pointerId); } catch { /* */ }
        });
        box.addEventListener('pointermove', (e) => {
            if (!drag) return;
            const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
            if (!drag.moved && Math.hypot(dx, dy) < 6) return;
            drag.moved = true;
            drag.el.classList.add('drag');
            drag.el.style.left = `${((e.clientX - drag.box.left) / drag.box.width) * 100}%`;
            drag.el.style.top = `${((e.clientY - drag.box.top) / drag.box.height) * 100}%`;
        });
        const end = (e) => {
            if (!drag) return;
            const d = drag; drag = null;
            d.el.classList.remove('drag');
            if (!d.moved) { H?.modal?.('mag', { id: d.id }); return; }
            move(d.id, ((e.clientX - d.box.left) / d.box.width) * 100, ((e.clientY - d.box.top) / d.box.height) * 100);
        };
        box.addEventListener('pointerup', end);
        box.addEventListener('pointercancel', () => { if (drag) { drag.el.classList.remove('drag'); drag = null; H?.render?.(); } });
        box.addEventListener('touchmove', (e) => { if (drag?.moved) e.preventDefault(); }, { passive: false });
    }
}
export function sheet(h, id) {
    const { head, btn, ic, spin, busy } = h;
    const m = byId(id);
    if (!m) return `<div class="dm-sheet">${head('Сувенир')}<div class="dm-empty">Его уже сняли.</div></div>`;
    const st = styleOf(D.roomById(m.room));
    const k = `mag:${m.id}`;
    const f = (key, label, ph = '') => `<label class="dm-field"><span>${esc(label)}</span><input data-dmf="mag:${key}" data-id="${m.id}" value="${esc(m[key] || '')}" placeholder="${esc(ph)}"></label>`;
    return `<div class="dm-sheet">${head(`${ic('pin')} ${esc(st.one.charAt(0).toUpperCase() + st.one.slice(1))}: ${esc(m.place)}`)}
        <div class="dm-magbig s-${m.style}">${m.cutImg || m.img ? `<img src="${esc(m.cutImg || m.img)}" alt="">` : `<span>${busy(k) ? spin : ic('image')}</span>`}</div>
        <div class="dm-actions">${btn('magDraw', busy(k) ? spin : `${ic('brush')} ${m.img ? 'Перерисовать' : 'Нарисовать'}`, `data-v="${m.id}"`, m.img ? '' : 'primary')}${btn('magScene', `${ic('send')} Вспомнить в сцене`, `data-v="${m.id}"`, m.img ? 'primary' : '')}</div>
        ${f('place', 'Откуда', 'Бухарест')}${f('when', 'Когда', 'весна 2016-го')}${f('line', 'Что там было', 'он купил ей сливы на рынке')}${f('who', 'С кем', '')}
        <div class="dm-actions end">${btn('magDel', `${ic('x')} Снять`, `data-v="${m.id}"`, 'ghost danger sm')}</div>
    </div>`;
}
