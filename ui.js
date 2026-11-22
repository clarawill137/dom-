// ✦ Дом — окно: дом в разрезе по этажам, комнаты с вещами (расставить, перерисовать с вещами), полки уюта,
// холодильник с хэдами и записками, хэд-машина, покупки, вещи дома, «появилось в постах».

import * as C from './core.js';
import * as D from './data.js';

const esc = C.esc;
const ui = {
    view: 'home', room: '', modal: null, busy: new Set(),
    gen: { who: null, vibe: 'dice', ask: '', rolling: false, flash: [], rolls: [], batch: '' },
    shop: { cat: 'decor', ask: '' }, inv: { f: 'all' }, shelf: { ask: '' },
};

// ───────────── значки ─────────────

const P = {
    x: '<path d="M6 6l12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="m5 12 5 5 9-10"/>',
    back: '<path d="M15 5 8 12l7 7"/>', heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    brush: '<path d="M14 4l6 6-8 8H6v-6Z"/><path d="M4 20c1-3 2-4 4-4"/>', upload: '<path d="M12 15V4M7 9l5-5 5 5M4 20h16"/>',
    pause: '<path d="M8 5v14M16 5v14"/>', play: '<path d="M7 5l12 7-12 7Z"/>', sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z"/>',
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8.5" cy="8.5" r="1.1"/><circle cx="15.5" cy="15.5" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="15.5" cy="8.5" r="1.1"/><circle cx="8.5" cy="15.5" r="1.1"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    cup: '<path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z"/><path d="M16 9h2a2.5 2.5 0 0 1 0 5h-2M8 3c0 1.5 1 1.5 1 3M11 3c0 1.5 1 1.5 1 3"/>',
    sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 11a2 2 0 0 1 2 2v2h14v-2a2 2 0 1 1 2 2v3H3v-3a2 2 0 0 1 0-4ZM6 18v2M18 18v2"/>',
    baby: '<circle cx="12" cy="9" r="5"/><path d="M10 9h.01M14 9h.01M10.5 11.5q1.5 1 3 0M7 20q5-5 10 0"/>',
    bed: '<path d="M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-8v1"/><circle cx="7" cy="10.5" r="1.8"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z"/><path d="M5 19 13 11"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
    car: '<path d="M5 16V11l2-4h10l2 4v5"/><path d="M3 16h18v2H3Z"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/>',
    fridge: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10h12M9 6v2M9 13v3"/>',
    dumbbell: '<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>', store: '<path d="M4 9h16l-1-4H5Z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
    note: '<path d="M5 4h14v12l-4 4H5Z"/><path d="M15 20v-4h4M8 9h8M8 13h5"/>', pan: '<circle cx="10" cy="13" r="6"/><path d="M16 13h5M7 9q3-3 6 0"/>',
    jar: '<path d="M8 3h8v3H8Z"/><path d="M7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><path d="M9 12l2 2 4-4"/>',
    book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
    bear: '<circle cx="7" cy="6" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="12" cy="13" r="7"/><path d="M10 12h.01M14 12h.01M10.5 15.5q1.5 1 3 0"/>',
    cards: '<rect x="4" y="6" width="11" height="15" rx="2"/><path d="M9 3h9a2 2 0 0 1 2 2v13"/><path d="M9.5 11l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2-.3Z"/>',
    tv: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 3l4 3 4-3M8 21h8"/>', disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
    puzzle: '<path d="M10 4h4v3a1.5 1.5 0 1 0 3 0V4h3v6h-3a1.5 1.5 0 1 0 0 3h3v7h-6v-3a1.5 1.5 0 1 0-3 0v3H4v-7h3a1.5 1.5 0 1 0 0-3H4V4h6"/>',
    cat: '<path d="M5 20V9l3-5 2 4h4l2-4 3 5v11Z"/><path d="M9.5 13h.01M14.5 13h.01M11 16h2"/>', crib: '<path d="M4 6v14M20 6v14M4 10h16M4 18h16M8 10v8M12 10v8M16 10v8"/>',
    lamp: '<path d="M8 3h8l3 8H5Z"/><path d="M12 11v8M8 21h8"/>', frame: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 16l5-5 4 4 3-3 4 4"/><circle cx="15" cy="9" r="1.5"/>',
    bag: '<path d="M5 8h14l-1 13H6Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4Z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4Z"/><path d="M10 20a2 2 0 0 0 4 0"/>', send: '<path d="M4 12 20 4l-6 16-3-7Z"/>',
    moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z"/>', calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>', wand: '<path d="M4 20 15 9M14 4v3M19 9h-3M17.5 5.5l-2 2"/>', pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Z"/><circle cx="12" cy="10" r="2"/>',
};
export function ic(n, cls = '') { return `<svg class="dm-i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.home}</svg>`; }
const spin = '<span class="dm-spin"></span>';
const busy = (k) => ui.busy.has(k);
const btn = (g, label, extra = '', cls = '') => `<button class="dm-btn ${cls}" data-dm="${g}" ${extra}>${label}</button>`;
const attr = (o) => Object.entries(o).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
const tilt = (k) => { let h = 0; for (const ch of String(k)) h = (h * 31 + ch.charCodeAt(0)) | 0; return ((h >>> 0) % 7) - 3; };
const magnet = (k) => D.MAGNETS[Math.abs(tilt(`${k}m`) + 3) % D.MAGNETS.length];
const sec = (t, right = '') => `<div class="dm-sec"><span>${t}</span>${right ? `<em>${right}</em>` : ''}</div>`;
function ava(name) {
    const src = C.avatarUrl(name);
    const l = esc(String(C.short(name) || '?').trim().charAt(0).toUpperCase());
    return `<span class="dm-ava">${src ? `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.remove()">` : ''}<i>${l}</i></span>`;
}
function dieHtml(n, rolling, cls = '') {
    return `<div class="dm-die${rolling ? ' rolling' : ''} ${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 92 28v44L50 96 8 72V28Z"/><path d="M50 4 30 40h40Z M8 28l22 12M92 28 70 40M30 40 8 72M70 40l22 32M30 40l20 34 20-34M50 74v22"/></svg><b>${n ?? '?'}</b></div>`;
}
const LINK_WORD = { 'angar:lab': 'Лаба Ангара', 'angar:spar': 'Спарринг-зал Ангара', 'angar:gar': 'Гараж Ангара' };

// ───────────── окно ─────────────

function host() {
    let dlg = document.getElementById('dm-dialog');
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.id = 'dm-dialog';
    dlg.innerHTML = '<div id="dm-app" class="dm"><header class="dm-top"></header><main class="dm-body"></main><div class="dm-modal"></div></div>';
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); if (ui.modal) closeModal(); else if (ui.view !== 'home') go('home'); else close(); });
    document.body.append(dlg);
    return dlg;
}
export const isOpen = () => !!document.getElementById('dm-dialog')?.open;
export function open(room = null, gen = false) {
    if (!C.hasChat()) { C.toast('info', 'Сначала открой чат'); return; }
    if (!C.A) { C.toast('warning', 'Дом живёт рядом с Life, а Life не найден'); return; }
    ui.modal = null;
    if (room && D.roomById(room)) { ui.view = 'room'; ui.room = room; } else if (!room) { ui.view = 'home'; }
    C.bank().then(() => { if (isOpen() && ui.modal?.kind === 'shop') paintModal(); });
    const dlg = host();
    render(true);
    if (!dlg.open) { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); }
    const el = dlg.querySelector('#dm-app');
    el.classList.remove('on');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
    if (gen) setTimeout(() => openGen(), 60);
}
export function close() {
    const dlg = document.getElementById('dm-dialog');
    if (!dlg) return;
    dlg.querySelector('#dm-app')?.classList.remove('on');
    setTimeout(() => { if (dlg.open) dlg.close(); }, 200);
}
let rt = 0;
export function renderSoon() { clearTimeout(rt); rt = setTimeout(() => { if (isOpen()) { render(); paintModal(); } }, 120); }

function render(fresh = false) {
    const app = document.getElementById('dm-app');
    if (!app) return;
    const k = C.clock();
    const where = [k.loc, k.date].filter(Boolean).join(' · ');
    const room = ui.view === 'room' ? D.roomById(ui.room) : null;
    const fl = room ? D.floorOf(room.id) : null;
    app.querySelector('.dm-top').innerHTML = `${room ? `<button class="dm-x" data-dm="home" aria-label="Назад">${ic('back')}</button>` : `<span class="dm-logo">${ic('home')}</span>`}
        <div class="dm-brand"><b>${room ? esc(room.name) : 'Дом'}</b><small>${esc(room && fl ? `${fl.n ? `${fl.n} этаж · ` : ''}${fl.name}` : where || 'их дом')}</small></div>
        <button class="dm-x" data-dm="close" aria-label="Закрыть">${ic('x')}</button>`;
    const body = app.querySelector('.dm-body');
    const top = fresh ? 0 : body.scrollTop;
    let html = '';
    try { html = room ? roomHtml(room) : homeHtml(); } catch (err) { console.error('[Дом] экран', err); html = `<div class="dm-empty">Экран упал: ${esc(err?.message || err)}</div>`; }
    body.innerHTML = html;
    body.scrollTop = top;
}
function go(view, room = '') { ui.view = view; ui.room = room; render(true); }

// ───────────── дом в разрезе ─────────────

function tile(r) {
    const img = C.roomImg(r.id);
    const n = r.link ? 0 : C.placedIn(r.id).length;
    const sub = r.link ? `→ ${LINK_WORD[r.link]}` : (r.shelves || []).map(k => D.KINDS[k]?.name).filter(Boolean).slice(0, 3).join(' · ') || 'тап — зайти';
    return `<button class="dm-room${img ? ' pic' : ''}${r.link ? ' link' : ''}" data-dm="room" data-v="${r.id}">
        <span class="dm-room-ph"${img ? ` style="background-image:url('${esc(img)}')"` : ''}>${img ? '' : ic(r.ico, 'xl')}</span>
        <span class="dm-room-t"><b>${esc(r.name)}</b><small>${esc(sub)}</small></span>
        ${r.id === 'kitchen' && C.hcList().length ? `<em class="dm-badge">${C.hcList().length}</em>` : n ? `<em class="dm-badge soft">${n}</em>` : ''}
    </button>`;
}
function homeHtml() {
    const sg = C.suggestions().length;
    const inv = C.M().items.filter(x => D.KINDS[x.kind]?.place).length;
    const floors = D.FLOORS.map(f => `<div class="dm-floor f-${f.id}">
        <div class="dm-plate">${f.n ? `<b>${f.n}</b>` : ic(f.id === 'roof' ? 'leaf' : 'car')}<span>${esc(f.short || f.name)}</span></div>
        <div class="dm-floor-rooms n${f.rooms.length}">${f.rooms.map(id => tile(D.roomById(id))).join('')}</div>
    </div>`).join('');
    return `<button class="dm-hero" data-dm="gen">
            <span class="dm-hero-dice">${dieHtml(20, false)}</span>
            <span><b>Хэд-машина</b><small>Рандомные хэды с картинками. Понравился — на холодильник, и модель будет его знать.</small></span>
        </button>
        <div class="dm-quick">
            <button data-dm="shop">${ic('bag')}<span>Покупки</span></button>
            <button data-dm="inv">${ic('box')}<span>Вещи${inv ? ` · ${inv}` : ''}</span></button>
            <button data-dm="sugg" class="${sg ? 'hot' : ''}">${ic('bell')}<span>Из постов${sg ? ` · ${sg}` : ''}</span></button>
        </div>
        <div class="dm-sec"><span>Дом</span><em>${D.ROOMS.some(r => !C.roomImg(r.id)) ? `<button class="dm-mini" data-dm="drawHouse">${busy('house') ? spin : `${ic('brush')} нарисовать весь дом`}</button>` : 'кирпич, довоенный, над лавкой Марко'}</em></div>
        <div class="dm-house"><i class="dm-roof"></i>${floors}</div>
        <div class="dm-hint">Тап по комнате — зайти: полки, вещи, картинки. Лаборатория, зал и гараж — мостики в Ангар.</div>`;
}

// ───────────── комната ─────────────

function roomHtml(r) {
    const img = C.roomImg(r.id);
    const k = `room:${r.id}`;
    const placed = r.link ? [] : C.placedIn(r.id);
    const pic = `<div class="dm-roompic${img ? '' : ' empty'}"${img ? ` style="background-image:url('${esc(img)}')" data-dm="zoom" data-v="${esc(img)}"` : ''}>
        ${img ? '' : `<div>${ic(r.ico, 'xl')}<p>Комнату ещё не рисовали</p></div>`}
        <div class="dm-roompic-tools">
            ${btn('drawRoom', busy(k) ? spin : `${ic('brush')}${img ? '' : ' Нарисовать'}`, attr({ v: r.id, title: 'Нарисовать комнату' }), 'sm glass')}
            ${placed.some(x => x.img) ? btn('drawRoomItems', busy(k) ? spin : `${ic('wand')} С вещами`, attr({ v: r.id, title: 'Перерисовать с расставленными вещами' }), 'sm glass') : ''}
            <label class="dm-btn sm glass" title="Своя картинка">${ic('upload')}<input type="file" accept="image/*" data-dmup="room" data-id="${r.id}" hidden></label>
        </div>
    </div>`;
    if (r.link) {
        const [, hall] = r.link.split(':');
        const txt = { lab: 'Лаборатория Хеди — это лаба Ангара: проекты, полигон, кубик инсайтов, кладбище прототипов.', spar: 'Тренировочный зал — спарринг в Ангаре: Баки учит Хеди, кубик, синяки, навыки растут и уходят в досье квартирмейстера.', gar: 'Гараж — в Ангаре: «Додж» баклажанового цвета, мотоцикл, бак, урон, номера.' }[hall];
        return `${pic}<div class="dm-card bridge"><p>${esc(txt)}</p>${btn('angar', `${ic(r.ico)} Открыть: ${esc(LINK_WORD[r.link])}`, attr({ v: hall }), 'primary wide')}</div>`;
    }
    const shelves = (r.shelves || []).filter(k2 => k2 !== 'hc');
    return `${pic}
        ${r.id === 'kitchen' ? fridgeHtml() : ''}
        ${sec('Что тут стоит', placed.length ? String(placed.length) : 'пусто')}
        ${placed.length ? `<div class="dm-things">${placed.map(thing).join('')}</div>` : '<div class="dm-hint">Купи, придумай или перенеси сюда вещь — появится тут. С картинками вещей комнату можно перерисовать «С вещами».</div>'}
        <div class="dm-actions">${btn('placeHere', `${ic('plus')} Поставить сюда`, attr({ v: r.id }), '')}${btn('shop', `${ic('bag')} Купить`, '', 'ghost')}</div>
        ${shelves.length ? `${sec('Полки')}<div class="dm-shelves">${shelves.map(shelfCard).join('')}</div>` : ''}`;
}
function thing(it) {
    const K = D.kindOf(it.kind);
    return `<button class="dm-thing${it.kind === 'photo' ? ' photo' : ''}" data-dm="item" data-v="${esc(it.id)}">
        <span class="dm-thing-ph${it.img ? '' : ' empty'}"${it.img ? ` style="background-image:url('${esc(it.img)}')"` : ''}>${busy(`item:${it.id}`) ? spin : it.img ? '' : ic(K.ico)}</span>
        <b>${esc(C.cut(it.name, 40))}</b><small>${esc(D.spotName(it.spot) || K.one)}</small></button>`;
}
function shelfCard(k) {
    const K = D.KINDS[k];
    const list = C.itemsOf(k);
    const thumbs = list.filter(x => x.img).slice(0, 3);
    return `<button class="dm-shelf" data-dm="shelf" data-v="${k}">
        <span class="dm-shelf-i">${ic(K.ico)}</span>
        <span class="dm-shelf-t"><b>${esc(K.name)}</b><small>${list.length ? `${list.length}` : 'пусто — тап'}</small></span>
        <span class="dm-shelf-th">${thumbs.map(x => `<i style="background-image:url('${esc(x.img)}')"></i>`).join('')}</span>
    </button>`;
}

// ───────────── холодильник: хэды и записки ─────────────

function fridgeHtml() {
    const list = [...C.hcList()].reverse();
    const notes = C.itemsOf('note').slice(0, 6);
    const pol = (h) => `<figure class="dm-pol mini${h.off ? ' off' : ''}" style="--tilt:${tilt(h.id) * 0.8}deg;--mag:${magnet(h.id)}" data-dm="hc" data-v="${esc(h.id)}">
            <i class="dm-mag"></i>
            <div class="dm-pol-ph${h.img ? '' : ' empty'}"${h.img ? ` style="background-image:url('${esc(h.img)}')"` : ''}>${busy(`drawhc:${h.id}`) ? spin : h.img ? '' : ic('brush')}</div>
            <figcaption>${esc(C.cut(h.t, 90))}</figcaption>
        </figure>`;
    const note = (n) => `<button class="dm-sticky" style="--tilt:${tilt(n.id) * 1.2}deg" data-dm="item" data-v="${esc(n.id)}"><i class="dm-mag" style="--mag:${magnet(n.id)}"></i><p>${esc(C.cut(n.name, 120))}</p>${n.from ? `<small>— ${esc(C.short(n.from))}</small>` : ''}</button>`;
    return `${sec('Холодильник', list.length ? `хэдов: ${list.length}` : 'пусто')}
        <div class="dm-fridge">
            <div class="dm-fridge-h"><i></i></div>
            ${list.length || notes.length ? `<div class="dm-pols">${notes.map(note).join('')}${list.map(pol).join('')}</div>` : '<div class="dm-fridge-empty">Тут будут хэды на магнитах и записки. Крутани хэд-машину — что понравится, вешай сюда.</div>'}
        </div>
        <div class="dm-actions">${btn('gen', `${ic('dice')} Хэд-машина`, '', 'primary wide')}${btn('shelf', `${ic('note')} Записки`, attr({ v: 'note' }), '')}</div>`;
}

// ───────────── листы ─────────────

function modal(kind, extra = {}) { ui.modal = { kind, ...extra }; paintModal(); }
function closeModal() { ui.modal = null; paintModal(); render(); }
const sheetHead = (title) => `<div class="dm-sheet-h"><b>${title}</b><button class="dm-x" data-dm="closeModal">${ic('x')}</button></div>`;
function paintModal() {
    const box = document.querySelector('#dm-app .dm-modal');
    if (!box) return;
    if (!ui.modal) { box.classList.remove('on'); box.innerHTML = ''; return; }
    const top = box.querySelector('.dm-sheet')?.scrollTop || 0;
    let html = '';
    try { html = { gen: genSheet, hc: hcSheet, zoom: zoomSheet, shelf: shelfSheet, item: itemSheet, shop: shopSheet, inv: invSheet, sugg: suggSheet, place: placeSheet, form: formSheet, pick: pickSheet }[ui.modal.kind]?.() || ''; } catch (err) { console.error('[Дом] лист', err); html = `<div class="dm-sheet">${sheetHead('Ой')}<div class="dm-empty">${esc(err?.message || err)}</div></div>`; }
    box.innerHTML = html;
    box.classList.add('on');
    const s = box.querySelector('.dm-sheet'); if (s) s.scrollTop = top;
}
const zoomSheet = () => `<div class="dm-sheet zoom">${sheetHead('')}<img src="${esc(ui.modal.src)}" alt=""></div>`;

// ───────────── полка ─────────────

const SHELF_ACT = {
    card: () => btn('drawCardDeck', `${ic('cards')} Тянуть карту`, '', 'primary wide'),
    date: () => btn('dateRoll', busy('date') ? `${spin} Кубик катится…` : `${ic('dice')} Кубик свиданий`, '', 'primary wide'),
    diary: () => btn('diaryToday', busy('gen:diary') ? `${spin} Альпин пишет…` : `${ic('cat')} Запись за сегодня`, '', 'primary wide'),
    joy: () => `${btn('joyRandom', `${ic('jar')} Достать наугад`, '', 'primary wide')}${btn('genShelf', busy('gen:joy') ? spin : `${ic('sparkles')} Из истории`, attr({ v: 'joy' }), '')}`,
    plush: () => btn('plushGift', busy('gen:plush') ? `${spin} Баки крадётся…` : `${ic('bear')} Баки подкладывает`, '', 'primary wide'),
    nursery: () => btn('crib', `${ic('crib')} Собрать кроватку · d20`, '', 'primary wide'),
    note: () => `${btn('noteWrite', `${ic('note')} Написать`, '', 'primary wide')}${btn('noteAi', busy('gen:note') ? spin : `${ic('sparkles')} Пусть напишет`, '', '')}`,
};
function shelfSheet() {
    const k = ui.modal.k;
    const K = D.kindOf(k);
    const list = C.itemsOf(k);
    const sorted = k === 'name' ? [...list].sort((a, b) => C.votesOf(b) - C.votesOf(a)) : list;
    const top = ui.modal.show ? showCard(ui.modal.show) : '';
    return `<div class="dm-sheet">${sheetHead(`${ic(K.ico)} ${esc(K.name)}`)}
        ${top}
        ${SHELF_ACT[k] ? `<div class="dm-actions">${SHELF_ACT[k]()}</div>` : ''}
        ${K.gen ? `<div class="dm-ask"><input data-dmf="shelf:ask" value="${esc(ui.shelf.ask)}" placeholder="пожелание (необязательно)">${btn('genShelf', busy(`gen:${k}`) ? spin : `${ic('sparkles')}`, attr({ v: k, title: 'Придумать' }), 'ico primary')}${btn('addOwn', ic('plus'), attr({ v: k, title: 'Своё' }), 'ico')}</div>` : ''}
        ${sorted.length ? `<div class="dm-list k-${k}">${sorted.map(x => row(x)).join('')}</div>` : `<div class="dm-empty">Пусто. ${K.gen ? '✨ — придумает умная модель, ＋ — своё.' : ''}</div>`}
    </div>`;
}
function showCard(sh) {
    if (sh.type === 'card') return `<div class="dm-bigcard"><small>карта</small><p>${esc(sh.t)}</p><div class="dm-actions">${btn('scene', `${ic('send')} В сцену`, attr({ v: `card|${sh.t}` }), 'primary')}${btn('drawCardDeck', `${ic('cards')} Ещё`, '', 'ghost')}</div></div>`;
    if (sh.type === 'crib') return `<div class="dm-bigcard crib">${dieHtml(sh.roll, false)}<p>${esc(sh.t)}</p><div class="dm-actions">${btn('scene', `${ic('send')} В сцену`, attr({ v: `crib|${sh.t}` }), 'primary')}</div></div>`;
    if (sh.type === 'joy') { const it = C.itemById(sh.id); return it ? `<div class="dm-bigcard joy">${it.img ? `<span class="dm-bigpic" style="background-image:url('${esc(it.img)}')"></span>` : ''}<p>${esc(it.name)}</p>${it.day ? `<small>${esc(it.day)}</small>` : ''}<div class="dm-actions">${btn('scene', `${ic('send')} Вспомнить в сцене`, attr({ v: `joy|${it.name}` }), 'primary')}${btn('joyRandom', `${ic('jar')} Ещё`, '', 'ghost')}</div></div>` : ''; }
    if (sh.type === 'date') { const it = C.itemById(sh.id); return it ? `<div class="dm-bigcard date">${dieHtml(it.roll || '?', false)}<p><b>${esc(it.name)}</b>${it.desc ? `<br>${esc(it.desc)}` : ''}</p><div class="dm-actions">${btn('toCal', `${ic('calendar')} В календарь`, attr({ v: it.id }), 'primary')}${btn('scene', `${ic('send')} В сцену`, attr({ v: `date|${it.name}. ${it.desc || ''}` }), '')}</div></div>` : ''; }
    return '';
}
/** Строка полки: по виду. */
function row(x) {
    const K = D.kindOf(x.kind);
    const k = `item:${x.id}`;
    const ph = K.pic ? `<span class="dm-row-ph${x.img ? '' : ' empty'}"${x.img ? ` style="background-image:url('${esc(x.img)}')"` : ''}>${busy(k) ? spin : x.img ? '' : ic(K.ico)}</span>` : '';
    let side = '';
    let sub = [x.author, x.artist, x.cat, x.when, x.meaning, x.from && x.kind !== 'note' ? x.from : '', x.room && K.place ? D.roomById(x.room)?.name : ''].filter(Boolean).join(' · ');
    if (x.kind === 'name') side = `<span class="dm-votes">${C.pair().map(w => { const v = x.votes?.[w]; return `<button class="dm-vote ${v || ''}" data-dm="vote" ${attr({ id: x.id, who: w })}>${esc(C.short(w).charAt(0))}${v === 'love' ? '♥' : v === 'ok' ? '✓' : v === 'no' ? '✕' : '·'}</button>`; }).join('')}</span>`;
    if (x.kind === 'hobby') { sub = `${x.n}/${x.max}${x.unit ? ` ${x.unit}` : ''}`; side = `<span class="dm-pm">${btn('hob', ic('minus'), attr({ id: x.id, d: -Math.max(1, Math.round(x.max / 20)) }), 'ico sm ghost')}${btn('hob', ic('plus'), attr({ id: x.id, d: Math.max(1, Math.round(x.max / 20)) }), 'ico sm')}</span>`; }
    if (x.kind === 'plant') { sub = `${C.PLANT_STAGE[C.plantStage(x)]}${x.watered ? ` · полито ${x.watered}` : ''}`; side = btn('water', ic('drop'), attr({ id: x.id, title: 'Полить' }), 'ico sm'); }
    if (x.kind === 'catch') side = btn('catchDone', x.done ? ic('check') : ic('play'), attr({ id: x.id, title: x.done ? 'Видел' : 'Посмотрели' }), `ico sm${x.done ? ' on' : ''}`);
    if (x.kind === 'book' && x.reading) sub = `читает сейчас${sub ? ` · ${sub}` : ''}`;
    if (x.kind === 'note') sub = [x.from && `от ${C.short(x.from)}`, x.to && `для ${C.short(x.to)}`].filter(Boolean).join(' ');
    if (x.kind === 'recipe') sub = `версия ${x.ver || 1}${x.rule ? ` · ${x.rule}` : ''}`;
    const prog = x.kind === 'hobby' ? `<i class="dm-prog"><b style="width:${Math.round(100 * x.n / x.max)}%"></b></i>` : '';
    return `<div class="dm-row${x.kind === 'note' ? ' note' : ''}${x.kind === 'card' && x.drawn ? ' drawn' : ''}">
        ${ph}<button class="dm-row-t" data-dm="item" data-v="${esc(x.id)}"><b>${esc(C.cut(x.name, 140))}</b>${sub ? `<small>${esc(C.cut(sub, 90))}</small>` : ''}${x.take ? `<em>«${esc(C.cut(x.take, 120))}»</em>` : x.desc && !['card', 'note'].includes(x.kind) ? `<p>${esc(C.cut(x.desc, 110))}</p>` : ''}${prog}</button>
        ${side}
    </div>`;
}

// ───────────── вещь ─────────────

const FIELDS = {
    book: [['author', 'Автор'], ['page', 'Закладка, стр.', 'number']], recipe: [['rule', 'Его правило'], ['ver', 'Версия', 'number']],
    catch: [['cat', 'Что это'], ['take', 'Что он думает']], date: [['when', 'Когда'], ['cost', 'Сколько']], song: [['artist', 'Исполнитель'], ['year', 'Год', 'number']],
    hobby: [['n', 'Сделано', 'number'], ['max', 'Всего', 'number'], ['unit', 'Чего']], name: [['meaning', 'Значение']], plant: [['care', 'Уход']],
    note: [['from', 'От кого'], ['to', 'Кому']], decor: [['price', 'Цена', 'number']],
};
function itemSheet() {
    const it = C.itemById(ui.modal.id);
    if (!it) return `<div class="dm-sheet">${sheetHead('Вещь')}<div class="dm-empty">Её уже нет.</div></div>`;
    const K = D.kindOf(it.kind);
    const k = `item:${it.id}`;
    const f = (key, label, type = 'text') => `<label class="dm-field"><span>${esc(label)}</span><input type="${type}" data-dmf="it:${key}" data-id="${esc(it.id)}" value="${esc(it[key] ?? '')}"></label>`;
    const a = (key, label, rows = 2) => `<label class="dm-field"><span>${esc(label)}</span><textarea rows="${rows}" data-dmf="it:${key}" data-id="${esc(it.id)}">${esc(it[key] ?? '')}</textarea></label>`;
    const pic = K.pic || K.place ? `<div class="dm-itempic${it.img ? '' : ' empty'}"${it.img ? ` style="background-image:url('${esc(it.img)}')" data-dm="zoom" data-v="${esc(it.img)}"` : ''}>
        ${busy(k) ? `<span class="dm-drawing">${spin}<small>рисую…</small></span>` : it.img ? '' : ic(K.ico, 'xl')}
        <div class="dm-roompic-tools">${btn('drawItem', busy(k) ? spin : `${ic('brush')}${it.img ? '' : ' Нарисовать'}`, attr({ v: it.id }), 'sm glass')}<label class="dm-btn sm glass">${ic('upload')}<input type="file" accept="image/*" data-dmup="item" data-id="${esc(it.id)}" hidden></label></div>
    </div>` : '';
    const acts = [];
    if (it.kind === 'book') { acts.push(btn('reading', `${ic('book')} ${it.reading ? 'Читает сейчас ✓' : 'Читает сейчас'}`, attr({ id: it.id }), it.reading ? 'primary' : '')); acts.push(btn('bedtime', busy(`tale:${it.id}`) ? spin : `${ic('moon')} Сказка на ночь`, attr({ id: it.id }), '')); }
    if (it.kind === 'recipe') { acts.push(btn('verUp', `${ic('plus')} Версия ${(it.ver || 1) + 1}`, attr({ id: it.id }), '')); acts.push(btn('scene', `${ic('send')} Баки готовит`, attr({ v: `recipe|${it.name}|${it.ver || 1}` }), 'primary')); }
    if (it.kind === 'catch') acts.push(btn('catchTake', busy(`take:${it.id}`) ? spin : `${ic('sparkles')} Что он думает`, attr({ id: it.id }), ''));
    if (it.kind === 'date') { acts.push(btn('toCal', `${ic('calendar')} В календарь`, attr({ v: it.id }), 'primary')); acts.push(btn('scene', `${ic('send')} В сцену`, attr({ v: `date|${it.name}. ${it.desc || ''}` }), '')); }
    if (it.kind === 'song') acts.push(btn('scene', `${ic('send')} Играет в сцене`, attr({ v: `song|${it.name}${it.artist ? ` — ${it.artist}` : ''}` }), 'primary'));
    if (it.kind === 'plush') acts.push(btn('scene', `${ic('send')} Хеди находит`, attr({ v: `plush|${it.name}` }), ''));
    if (it.kind === 'card') acts.push(btn('scene', `${ic('send')} В сцену`, attr({ v: `card|${it.name}` }), 'primary'));
    if (it.kind === 'joy') acts.push(btn('scene', `${ic('send')} Вспомнить в сцене`, attr({ v: `joy|${it.name}` }), 'primary'));
    if (it.kind === 'note') acts.push(btn('noteReply', busy(`reply:${it.id}`) ? spin : `${ic('note')} Ответить`, attr({ id: it.id }), 'primary'));
    if (it.kind === 'plant') acts.push(btn('water', `${ic('drop')} Полить`, attr({ id: it.id }), ''));
    return `<div class="dm-sheet">${sheetHead(`${ic(K.ico)} ${esc(K.one.charAt(0).toUpperCase() + K.one.slice(1))}`)}
        ${pic}
        ${it.tale ? `<div class="dm-tale"><small>Сказка на ночь — его голосом</small><p>${esc(it.tale)}</p>${btn('scene', `${ic('send')} Рассказывает в сцене`, attr({ v: `tale|${it.name}|${it.tale}` }), 'sm')}</div>` : ''}
        ${acts.length ? `<div class="dm-actions">${acts.join('')}</div>` : ''}
        ${it.kind === 'note' ? a('name', 'Записка', 3) : f('name', K.one === 'карта' ? 'Вопрос' : 'Что это')}
        ${['card', 'note', 'joy'].includes(it.kind) ? '' : a('desc', 'Описание')}
        ${(FIELDS[it.kind] || []).map(([key, label, type]) => f(key, label, type)).join('')}
        ${['card', 'joy', 'diary'].includes(it.kind) ? '' : f('who', 'Чьё / про кого')}
        ${K.place ? `<div class="dm-grid2"><label class="dm-field"><span>Комната</span><select data-dmf="it:room" data-id="${esc(it.id)}"><option value="">— не расставлено</option>${D.ROOMS.filter(r => !r.link).map(r => `<option value="${r.id}" ${it.room === r.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>
            <label class="dm-field"><span>Куда</span><select data-dmf="it:spot" data-id="${esc(it.id)}"><option value="">—</option>${D.SPOTS.map(([v, l]) => `<option value="${v}" ${it.spot === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label></div>` : ''}
        ${it.story ? `<div class="dm-hint">${esc(it.story)}</div>` : ''}
        <div class="dm-actions end">${btn('delItem', `${ic('x')} Убрать`, attr({ id: it.id }), 'ghost danger sm')}</div>
    </div>`;
}

// ───────────── вещи дома, покупки, из постов ─────────────

function invSheet() {
    const f = ui.inv.f;
    const all = C.M().items.filter(x => D.KINDS[x.kind]?.place && (!x.post || C.liveKeys().has(x.post)));
    const list = f === 'all' ? all : f === 'free' ? all.filter(x => !x.room) : all.filter(x => x.kind === f);
    const by = {};
    for (const x of list) (by[x.room || ''] ||= []).push(x);
    const groups = [...D.ROOMS.filter(r => by[r.id]).map(r => [r.name, by[r.id]]), ...(by[''] ? [['Не расставлено', by['']]] : [])];
    return `<div class="dm-sheet">${sheetHead(`${ic('box')} Вещи дома`)}
        <div class="dm-actions">${btn('newThing', `${ic('plus')} Вещь`, '', 'primary')}${btn('photoChat', `${ic('frame')} Фото из чата`, '', '')}${btn('photoShoot', `${ic('sparkles')} Снять фото`, '', '')}${btn('story', busy('story') ? spin : `${ic('book')} Из истории`, '', 'ghost')}</div>
        <div class="dm-chips">${[['all', 'Все'], ['free', 'Не расставлено'], ...D.PLACE_KINDS.map(k => [k, D.KINDS[k].name])].map(([v, l]) => `<button class="dm-chip${f === v ? ' on' : ''}" data-dm="invF" data-v="${v}">${esc(l)}</button>`).join('')}</div>
        ${groups.length ? groups.map(([t, l]) => `${sec(esc(t), String(l.length))}<div class="dm-things">${l.map(thing).join('')}</div>`).join('') : '<div class="dm-empty">Пусто. Купи, добавь своё или достань из истории.</div>'}
    </div>`;
}
function shopSheet() {
    const cat = ui.shop.cat;
    const list = C.shopList(cat);
    const bal = C.balance();
    const k = `shop:${cat}`;
    return `<div class="dm-sheet">${sheetHead(`${ic('bag')} Покупки`)}
        <div class="dm-hint">${bal ? `${ic('pin')} на счету ${esc(bal.text)} — ${bal.life ? 'платит тот, кто платит за дом (Life → Деньги)' : 'оплата с телефона'}` : 'банк Телефона не найден — покупки без списания'}</div>
        <div class="dm-chips">${D.SHOP_CATS.map(([v, l]) => `<button class="dm-chip${cat === v ? ' on' : ''}" data-dm="shopCat" data-v="${v}">${esc(l)}</button>`).join('')}</div>
        <div class="dm-ask"><input data-dmf="shop:ask" value="${esc(ui.shop.ask)}" placeholder="что ищем: «лампу с тёплым светом для его кресла»">${btn('shopGen', busy(k) ? spin : ic('sparkles'), attr({ title: 'Показать' }), 'ico primary')}</div>
        ${list.length ? `<div class="dm-goods">${list.map((x, i) => `<div class="dm-good">
            <span class="dm-row-ph${x.img ? '' : ' empty'}"${x.img ? ` style="background-image:url('${esc(x.img)}')"` : ''}>${busy(`good:${x._id}`) ? spin : x.img ? '' : ic(D.kindOf(D.SHOP_KIND[cat] || 'decor').ico)}</span>
            <div><b>${esc(x.name)}</b><small>${esc([x.from, D.roomById(x.room)?.name].filter(Boolean).join(' · '))}</small><p>${esc(C.cut(x.desc, 140))}</p></div>
            <div class="dm-good-r"><em>${C.priceNum(x.price) ? esc(C.money(C.priceNum(x.price))) : '—'}</em>${x.img ? '' : btn('goodPic', ic('brush'), attr({ v: i, title: 'Посмотреть' }), 'ico sm ghost')}${btn('buy', busy(`buy:${x._id}`) ? spin : ic('bag'), attr({ v: i, title: 'Купить' }), 'ico sm primary')}</div>
        </div>`).join('')}</div>${btn('shopMore', busy(`${k}:more`) ? spin : `${ic('plus')} Ещё`, '', 'ghost wide')}` : `<div class="dm-empty">${busy(k) ? 'Продавец раскладывает товар…' : 'Витрина пустая — ✨ покажет.'}</div>`}
    </div>`;
}
function suggSheet() {
    const list = C.suggestions();
    return `<div class="dm-sheet">${sheetHead(`${ic('bell')} Появилось в постах`)}
        <div class="dm-hint">Летописец заметил в постах новое в доме — покупки, подарки, книги. ✓ — в дом (с картинкой), ✕ — мимо.</div>
        ${list.length ? `<div class="dm-list">${list.map(x => `<div class="dm-row"><span class="dm-row-ph empty">${ic(D.kindOf(x.kind).ico)}</span><div class="dm-row-t"><b>${esc(x.name)}</b><small>${esc([D.kindOf(x.kind).one, x.who, D.roomById(x.room)?.name, `пост #${x.mes}`].filter(Boolean).join(' · '))}</small></div>${btn('suggOk', ic('check'), attr({ id: x.id }), 'ico sm primary')}${btn('suggNo', ic('x'), attr({ id: x.id }), 'ico sm ghost')}</div>`).join('')}</div>
        <div class="dm-actions">${btn('suggAll', `${ic('check')} Всё в дом`, '', 'primary wide')}</div>` : '<div class="dm-empty">Пока ничего. Как только в постах что-то купят, подарят или повесят — появится тут.</div>'}
    </div>`;
}
function placeSheet() {
    const r = D.roomById(ui.modal.room);
    const list = C.M().items.filter(x => D.KINDS[x.kind]?.place && x.room !== r.id && (!x.post || C.liveKeys().has(x.post)));
    return `<div class="dm-sheet">${sheetHead(`${ic('plus')} В ${esc(r.name.toLowerCase())}`)}
        ${list.length ? `<div class="dm-things">${list.map(it => `<button class="dm-thing" data-dm="putHere" ${attr({ id: it.id, room: r.id })}><span class="dm-thing-ph${it.img ? '' : ' empty'}"${it.img ? ` style="background-image:url('${esc(it.img)}')"` : ''}>${it.img ? '' : ic(D.kindOf(it.kind).ico)}</span><b>${esc(C.cut(it.name, 40))}</b><small>${esc(it.room ? `из: ${D.roomById(it.room)?.name}` : 'не расставлено')}</small></button>`).join('')}</div>` : '<div class="dm-empty">Все вещи уже тут. Купи или добавь новую.</div>'}
        <div class="dm-actions">${btn('newThing', `${ic('plus')} Новая вещь`, attr({ room: r.id }), 'primary')}${btn('shop', `${ic('bag')} Купить`, '', '')}</div>
    </div>`;
}
/** Простая форма: поля → onSave. */
function formSheet() {
    const f = ui.modal;
    return `<div class="dm-sheet">${sheetHead(esc(f.title))}
        ${f.fields.map(x => `<label class="dm-field"><span>${esc(x.label)}</span>${x.type === 'select' ? `<select data-ff="${x.k}">${x.list.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(x.v ?? '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>` : x.type === 'area' ? `<textarea rows="3" data-ff="${x.k}" placeholder="${esc(x.ph || '')}">${esc(x.v ?? '')}</textarea>` : `<input data-ff="${x.k}" value="${esc(x.v ?? '')}" placeholder="${esc(x.ph || '')}">`}</label>`).join('')}
        <div class="dm-actions">${btn('formSave', busy('form') ? spin : `${ic('check')} ${esc(f.ok || 'Готово')}`, '', 'primary wide')}</div></div>`;
}
const formVals = () => { const o = {}; document.querySelectorAll('#dm-app .dm-sheet [data-ff]').forEach(el => { o[el.dataset.ff] = el.value; }); return o; };
function form(title, fields, onSave, ok = '') { modal('form', { title, fields, onSave, ok }); }
/** Выбор из списка картинок (фото из чата, «из истории»). */
function pickSheet() {
    const p = ui.modal;
    return `<div class="dm-sheet">${sheetHead(esc(p.title))}
        ${p.list.length ? `<div class="${p.img ? 'dm-things' : 'dm-list'}">${p.list.map((x, i) => p.img
            ? `<button class="dm-thing photo${p.sel.has(i) ? ' sel' : ''}" data-dm="pickT" data-v="${i}"><span class="dm-thing-ph" style="background-image:url('${esc(x.src)}')"></span><small>пост #${x.mes}</small></button>`
            : `<button class="dm-row pick${p.sel.has(i) ? ' sel' : ''}" data-dm="pickT" data-v="${i}"><span class="dm-row-ph empty">${ic(D.kindOf(x.kind).ico)}</span><span class="dm-row-t"><b>${esc(x.name)}</b><small>${esc([D.kindOf(x.kind).one, x.who, D.roomById(x.room)?.name].filter(Boolean).join(' · '))}</small></span></button>`).join('')}</div>
            <div class="dm-actions">${btn('pickOk', `${ic('check')} ${esc(p.ok)} (${p.sel.size})`, '', 'primary wide')}</div>` : '<div class="dm-empty">Ничего не нашлось.</div>'}
    </div>`;
}

// ───────────── хэд-машина и хэды холодильника ─────────────

function openGen() {
    const g = ui.gen;
    if (!g.who || !g.who.length) g.who = C.defaultWho();
    const last = C.lastBatch();
    if (!g.batch && last) g.batch = last.id;
    modal('gen');
}
function genSheet() {
    const g = ui.gen;
    const people = C.cast();
    const batch = C.M().gen.find(b => b.id === g.batch) || null;
    const going = busy('gen');
    const dice = g.rolling ? g.flash : (batch?.rolls?.length ? batch.rolls : g.rolls);
    const showDice = g.vibe === 'dice' && (g.rolling || dice?.length);
    const card = (c) => {
        const k = `draw:${c.id}`;
        const v = D.vibeById(c.vibe);
        return `<figure class="dm-pol big${c.kept ? ' kept' : ''}" style="--tilt:${tilt(c.id) * 0.5}deg;--mag:${magnet(c.id)}">
            <div class="dm-pol-ph${c.img ? '' : ' empty'}"${c.img ? ` style="background-image:url('${esc(c.img)}')" data-dm="zoom" data-v="${esc(c.img)}"` : ''}>
                ${busy(k) ? `<span class="dm-drawing">${spin}<small>рисую…</small></span>` : c.img ? '' : btn('drawCard', `${ic('brush')} Нарисовать`, attr({ v: c.id }), 'sm glass')}
            </div>
            <figcaption><span class="dm-vibe">${v.ico} ${esc(v.name)} · ${esc(c.who.map(C.short).join(' + '))}</span><p>${esc(c.t)}</p></figcaption>
            <div class="dm-pol-act">
                ${c.kept ? `<span class="dm-kept">${ic('check')} на холодильнике</span>` : btn('keep', `${ic('heart')} На холодильник`, attr({ v: c.id }), 'primary')}
                ${c.img ? btn('drawCard', busy(k) ? spin : ic('brush'), attr({ v: c.id, title: 'Перерисовать' }), 'ico ghost') : ''}
                ${c.kept ? '' : btn('dropCard', ic('x'), attr({ v: c.id, title: 'Не то' }), 'ico ghost')}
            </div>
        </figure>`;
    };
    return `<div class="dm-sheet">${sheetHead(`${ic('dice')} Хэд-машина`)}
        <div class="dm-hint">Умная модель придумывает хэды по карточкам, лору и своду истории: от уютных бытовых до тёплой психологии. Без драмы. Понравился — на холодильник.</div>
        <div class="dm-lbl">Про кого</div>
        <div class="dm-people">${people.map(n => `<button class="${g.who.some(x => C.same(x, n)) ? 'on' : ''}" data-dm="genWho" data-v="${esc(n)}">${ava(n)}<span>${esc(C.short(n))}</span></button>`).join('')}</div>
        <div class="dm-lbl">Настроение</div>
        <div class="dm-chips"><button class="dm-chip${g.vibe === 'dice' ? ' on' : ''}" data-dm="genVibe" data-v="dice">🎲 Кубик</button>${D.VIBES.map(v => `<button class="dm-chip${g.vibe === v.id ? ' on' : ''}" data-dm="genVibe" data-v="${v.id}">${v.ico} ${esc(v.name)}</button>`).join('')}</div>
        ${g.vibe === 'dice' ? `<div class="dm-hint sm">d20 на каждый хэд: ${esc(D.DICE_HINT)}</div>` : ''}
        <label class="dm-field"><span>О чём (необязательно)</span><input data-dmf="gen:ask" value="${esc(g.ask)}" placeholder="про Альпин / про кухню / про малыша / про зиму"></label>
        <label class="dm-toggle"><input type="checkbox" data-dmf="cfg:autoDraw" ${C.cfg().autoDraw ? 'checked' : ''}><span>${ic('brush')} Рисовать сразу</span></label>
        <div class="dm-actions">${btn('roll', going || g.rolling ? `${spin} ${g.rolling ? 'Кубики катятся…' : 'Придумываю…'}` : `${ic('dice')} ${batch ? 'Ещё хэды' : 'Крутить'}`, '', 'primary wide')}</div>
        ${showDice ? `<div class="dm-dice">${(dice || []).map(d => `<div>${dieHtml(d.r, g.rolling, g.rolling ? '' : `v-${d.v}`)}${g.rolling ? '' : `<small>${D.vibeById(d.v).ico} ${esc(D.vibeById(d.v).name)}</small>`}</div>`).join('')}</div>` : ''}
        ${batch ? `<div class="dm-cards">${batch.items.map(card).join('')}</div>` : (going ? '' : '<div class="dm-empty">Крутани — выпадет четыре хэда.</div>')}
        ${C.M().gen.length > 1 ? `${sec('Прошлые броски')}<div class="dm-chips">${C.M().gen.map((b, i) => `<button class="dm-chip${b.id === g.batch ? ' on' : ''}" data-dm="genBatch" data-v="${b.id}">${i === 0 ? 'последний' : `#${i + 1}`} · ${b.items.length}</button>`).join('')}</div>` : ''}
    </div>`;
}
function hcSheet() {
    const h = C.hcById(ui.modal.id);
    if (!h) return `<div class="dm-sheet">${sheetHead('Хэд')}<div class="dm-empty">Его уже сняли.</div></div>`;
    const k = `drawhc:${h.id}`;
    const v = h.vibe ? D.vibeById(h.vibe) : null;
    return `<div class="dm-sheet">${sheetHead(`${ic('fridge')} С холодильника`)}
        <figure class="dm-pol big" style="--tilt:${tilt(h.id) * 0.4}deg;--mag:${magnet(h.id)}">
            <i class="dm-mag"></i>
            <div class="dm-pol-ph${h.img ? '' : ' empty'}"${h.img ? ` style="background-image:url('${esc(h.img)}')" data-dm="zoom" data-v="${esc(h.img)}"` : ''}>${busy(k) ? `<span class="dm-drawing">${spin}<small>рисую…</small></span>` : h.img ? '' : btn('drawHc', `${ic('brush')} Нарисовать`, attr({ v: h.id }), 'sm glass')}</div>
            <figcaption><span class="dm-vibe">${v ? `${v.ico} ${esc(v.name)} · ` : ''}${esc(h.who.map(C.short).join(' + '))}${h.at ? ` · ${esc(h.at)}` : ''}${h.src === 'dom' ? '' : ' · записан руками'}</span><p>${esc(h.t)}</p></figcaption>
        </figure>
        <div class="dm-actions">
            ${btn('drawHc', busy(k) ? spin : `${ic('brush')} ${h.img ? 'Перерисовать' : 'Нарисовать'}`, attr({ v: h.id }), '')}
            <label class="dm-btn" title="Своя картинка">${ic('upload')}<input type="file" accept="image/*" data-dmup="hc" data-id="${esc(h.id)}" hidden></label>
            ${btn('hcOff', `${ic(h.off ? 'play' : 'pause')} ${h.off ? 'Вернуть модели' : 'Придержать'}`, attr({ v: h.id }), 'ghost')}
            ${btn('hcDel', ic('x'), attr({ v: h.id, title: 'Снять с холодильника' }), 'ico ghost danger')}
        </div>
        <div class="dm-hint">${h.off ? 'Придержан: висит, но модели не уходит.' : 'Модель держит этот хэд за правду и вспоминает к месту, когда они в сцене.'}</div>
    </div>`;
}

// ───────────── действия ─────────────

async function withBusy(key, fn) {
    if (ui.busy.has(key)) return;
    ui.busy.add(key);
    render(); paintModal();
    try { await fn(); } catch (e) { console.warn('[Дом]', key, e); C.toast('error', esc(String(e?.message || e))); } finally { ui.busy.delete(key); render(); paintModal(); }
}
/** Картинки по очереди: одна за другой; первая ошибка — стоп. */
async function drawQueue(list, draw = C.drawHc, keyOf = (c) => `draw:${c.id}`) {
    for (const c of list) {
        if (!c || c.img || ui.busy.has(keyOf(c))) continue;
        const key = keyOf(c);
        ui.busy.add(key); paintModal(); render();
        try { await draw(c); } catch (e) {
            console.warn('[Дом] картинка', e);
            ui.busy.delete(key); paintModal(); render();
            C.toast('warning', `Картинка не вышла: ${esc(String(e?.message || e))}`);
            return;
        }
        ui.busy.delete(key); paintModal(); render();
    }
}
const drawItems = (list) => (C.cfg().autoDraw ? drawQueue(list.filter(x => D.kindOf(x.kind).pic), C.drawItem, (x) => `item:${x.id}`) : null);
function rollAnim(n, done) {
    const g = ui.gen;
    g.rolling = true;
    let k = 0;
    const tick = () => {
        g.flash = Array.from({ length: n }, () => { const r = C.d20(); return { r, v: D.vibeOfRoll(r) }; });
        paintModal();
        if (++k < 11) setTimeout(tick, 45 + k * 10);
        else { g.rolling = false; done(); }
    };
    tick();
}
function roll() {
    const g = ui.gen;
    if (g.rolling || busy('gen')) return;
    if (!g.who?.length) { C.toast('info', 'Выбери, про кого'); return; }
    const run = (rolls) => withBusy('gen', async () => {
        const vibes = rolls.length ? rolls.map(x => x.v) : [g.vibe];
        const b = await C.genHc({ who: g.who, vibes, ask: g.ask, rolls });
        g.batch = b.id;
        g.rolls = rolls;
        if (C.cfg().autoDraw) setTimeout(() => drawQueue(b.items), 30);
    });
    if (g.vibe === 'dice') rollAnim(D.BATCH, () => { const rolls = Array.from({ length: D.BATCH }, () => { const r = C.d20(); return { r, v: D.vibeOfRoll(r) }; }); g.rolls = rolls; run(rolls); });
    else { g.rolls = []; run([]); }
}
const DEFAULT_SPOT = D.DEFAULT_SPOT;
/** В сцену: разовая заметка модели до следующего ответа. */
function toScene(v) {
    const [type, a, b] = String(v).split('|');
    const T = {
        card: `[Вечер вдвоём: тянут карту из колоды, вопрос — «${a}». Пусть прозвучит в сцене и на него ответят по-своему, без спешки.]`,
        crib: `[Детская: Баки собирает кроватку по инструкции — вот как вышло: ${a} Покажи это в сцене.]`,
        joy: `[Хорошее: вспомнили — ${a}. Пусть к месту всплывёт тёплым воспоминанием, деталью.]`,
        date: `[Свидание: ${a} Если к месту — пусть кто-то это предложит или они туда идут.]`,
        song: `[Играет: ${a}. Звучит в сцене, герои её слышат; если к месту — их реакция.]`,
        plush: `[Хеди находит нового плюшевого зверя — ${a}. Баки подложил тайком и делает вид, что ни при чём.]`,
        recipe: `[Кухня: Баки готовит «${a}» строго по рецепту мамы, версия ${b || 1}. Покажи процесс его руками.]`,
        tale: `[Сказка на ночь: Баки пересказывает Хеди «${a}» — вот так, его голосом: ${b}]`,
    };
    C.shot(type, T[type] || `[${a}]`);
    C.toast('success', 'Уйдёт в следующий пост');
}

const HANDLERS = {
    close: () => close(),
    home: () => go('home'),
    room: (el) => { const r = D.roomById(el.dataset.v); if (r) go('room', r.id); },
    angar: (el) => { if (!globalThis.Angar?.open) { C.toast('info', 'Ангар не найден — поставь его, и этаж откроется там'); return; } close(); setTimeout(() => globalThis.Angar.open(el.dataset.v), 220); },
    drawRoom: (el) => { const r = D.roomById(el.dataset.v); withBusy(`room:${r.id}`, async () => { await C.drawRoom(r); C.toast('success', `${r.name} — готово`); }); },
    drawHouse: () => withBusy('house', async () => {
        const todo = D.ROOMS.filter(r => !C.roomImg(r.id));
        for (const r of todo) { ui.busy.add(`room:${r.id}`); render(); try { await C.drawRoom(r); } finally { ui.busy.delete(`room:${r.id}`); render(); } }
        C.toast('success', 'Дом нарисован');
    }),
    drawRoomItems: (el) => { const r = D.roomById(el.dataset.v); withBusy(`room:${r.id}`, async () => { await C.drawRoom(r, { withItems: true }); C.toast('success', `${r.name} — с вещами`); }); },
    zoom: (el) => modal('zoom', { src: el.dataset.v }),
    closeModal: () => closeModal(),
    // хэды
    gen: () => openGen(),
    genWho: (el) => { const g = ui.gen; const n = el.dataset.v; g.who = g.who.some(x => C.same(x, n)) ? g.who.filter(x => !C.same(x, n)) : [...g.who, n]; paintModal(); },
    genVibe: (el) => { ui.gen.vibe = el.dataset.v; paintModal(); },
    genBatch: (el) => { ui.gen.batch = el.dataset.v; const b = C.M().gen.find(x => x.id === el.dataset.v); ui.gen.rolls = b?.rolls || []; paintModal(); },
    roll: () => roll(),
    keep: (el) => {
        const f = C.cardById(el.dataset.v); if (!f) return;
        try { C.keep(f.c); } catch (e) { C.toast('error', esc(String(e?.message || e))); return; }
        C.toast('success', 'На холодильнике — модель будет это знать');
        paintModal(); render();
        if (!f.c.img && C.cfg().autoDraw) drawQueue([f.c]);
    },
    drawCard: (el) => { const f = C.cardById(el.dataset.v); if (!f) return; f.c.img = ''; drawQueue([f.c]); },
    dropCard: (el) => { C.dropCard(el.dataset.v); if (!C.M().gen.some(b => b.id === ui.gen.batch)) ui.gen.batch = C.lastBatch()?.id || ''; paintModal(); },
    hc: (el) => modal('hc', { id: el.dataset.v }),
    drawHc: (el) => { const h = C.hcById(el.dataset.v); if (!h) return; withBusy(`drawhc:${h.id}`, () => C.drawHc(h)); },
    hcOff: (el) => { C.toggleHc(el.dataset.v); paintModal(); render(); },
    hcDel: (el) => { if (!confirm('Снять хэд с холодильника? Модель его больше не увидит.')) return; C.delHc(el.dataset.v); closeModal(); },
    // полки
    shelf: (el) => { ui.shelf.ask = ''; modal('shelf', { k: el.dataset.v }); },
    genShelf: (el) => { const k = el.dataset.v; withBusy(`gen:${k}`, async () => { const l = await C.genKind(k, { n: k === 'card' ? 8 : k === 'joy' ? 5 : 3, ask: ui.shelf.ask }); drawItems(l); }); },
    addOwn: (el) => { const k = el.dataset.v; const K = D.kindOf(k); form(`Своё: ${K.one}`, [{ k: 'name', label: k === 'card' ? 'Вопрос' : 'Что это', ph: '' }, { k: 'desc', label: 'Пара слов (необязательно)', type: 'area' }], (v) => { if (!v.name.trim()) return false; const it = C.addItem(k, { name: v.name, desc: v.desc }, { src: 'me', room: K.place ? K.room : undefined }); drawItems([it]); modal('shelf', { k }); return 'keep'; }); },
    drawCardDeck: () => { const c = C.drawCard(); if (!c) { C.toast('info', 'Колода пустая — ✨ придумает вопросы'); return; } ui.modal.show = { type: 'card', t: c.name }; paintModal(); },
    dateRoll: () => withBusy('date', async () => { const r = C.d20(); const [it] = await C.genKind('date', { n: 1, roll: r, ask: ui.shelf.ask }); ui.modal.show = { type: 'date', id: it.id }; drawItems([it]); }),
    toCal: (el) => {
        const it = C.itemById(el.dataset.v); if (!it) return;
        const day = C.storyDay();
        form('В календарь', [{ k: 'd', label: 'Когда (ГГГГ-ММ-ДД)', v: day || '' }, { k: 'time', label: 'Во сколько (необязательно)', v: '19:00' }], (v) => {
            if (!C.A?.cal?.add) { C.toast('warning', 'Календарь — в Life, а он старый'); return true; }
            const id = C.A.cal.add({ t: it.name, d: v.d.trim(), time: v.time.trim(), who: C.pair(), kind: 'date' });
            if (!id) { C.toast('info', 'Дата — в виде 2024-12-21'); return false; }
            C.toast('success', 'В календаре Life');
            modal('shelf', { k: 'date' });
            return 'keep';
        }, 'В календарь');
    },
    diaryToday: () => withBusy('gen:diary', async () => { const l = await C.genKind('diary', { n: 1, ask: ui.shelf.ask }); drawItems(l); }),
    joyRandom: () => { const l = C.itemsOf('joy'); if (!l.length) { C.toast('info', 'Банка пустая — Летописец сам кладёт хорошее, или ✨ из истории'); return; } const it = l[Math.floor(Math.random() * l.length)]; ui.modal.show = { type: 'joy', id: it.id }; paintModal(); if (!it.img) drawItems([it]); },
    plushGift: () => withBusy('gen:plush', async () => { const l = await C.genKind('plush', { n: 1, ask: `Баки тайком купил и подложил ей нового зверя. ${ui.shelf.ask || ''}` }); for (const x of l) { x.from = x.from || 'Баки (тайком)'; x.room = 'living'; x.spot = 'sofa'; } C.touch(); drawItems(l); if (l[0]) toScene(`plush|${l[0].name}`); }),
    crib: () => { const r = C.cribRoll(); ui.modal.show = { type: 'crib', roll: r.roll, t: r.text }; paintModal(); },
    noteWrite: () => { const p = C.pair(); form('Записка на холодильник', [{ k: 'from', label: 'От кого', type: 'select', v: p[0], list: C.cast().map(n => [n, C.short(n)]) }, { k: 'to', label: 'Кому', type: 'select', v: p[1] || p[0], list: C.cast().map(n => [n, C.short(n)]) }, { k: 'name', label: 'Текст', type: 'area', ph: 'купи молоко. люблю. Б.' }], (v) => { if (!v.name.trim()) return false; C.addItem('note', { name: v.name, from: v.from, to: v.to }, { src: 'me', from: v.from, to: v.to }); modal('shelf', { k: 'note' }); return 'keep'; }, 'Повесить'); },
    noteAi: () => { const p = C.pair(); withBusy('gen:note', async () => { await C.genKind('note', { n: 1, from: p[1] || p[0], to: p[0], ask: ui.shelf.ask }); }); },
    noteReply: (el) => { const it = C.itemById(el.dataset.id); if (!it) return; withBusy(`reply:${it.id}`, async () => { await C.genKind('note', { n: 1, from: it.to || '', to: it.from || '', ask: `ответ на записку «${it.name}»` }); C.toast('success', 'Ответ — на холодильнике'); }); },
    vote: (el) => {
        const it = C.itemById(el.dataset.id); if (!it) return;
        it.votes = it.votes || {};
        const order = ['', 'love', 'ok', 'no'];
        const next = order[(order.indexOf(it.votes[el.dataset.who] || '') + 1) % order.length];
        if (next) it.votes[el.dataset.who] = next; else delete it.votes[el.dataset.who];
        C.touch(); paintModal();
        try { C.A?.updatePrompt?.(); } catch { /* */ }
    },
    hob: (el) => { const it = C.itemById(el.dataset.id); if (!it) return; it.n = Math.max(0, Math.min(it.max, it.n + Number(el.dataset.d))); C.touch(); paintModal(); },
    water: (el) => { C.setItem(el.dataset.id, { watered: C.storyDay() || 'сегодня' }); paintModal(); C.toast('success', 'Полито'); },
    catchDone: (el) => { const it = C.itemById(el.dataset.id); if (!it) return; it.done = !it.done; C.touch(); paintModal(); },
    catchTake: (el) => { const it = C.itemById(el.dataset.id); withBusy(`take:${it.id}`, () => C.catchTake(it)); },
    reading: (el) => { const it = C.itemById(el.dataset.id); const on = !it.reading; for (const b of C.itemsOf('book')) b.reading = false; it.reading = on; C.touch(); paintModal(); try { C.A?.updatePrompt?.(); } catch { /* */ } },
    bedtime: (el) => { const it = C.itemById(el.dataset.id); withBusy(`tale:${it.id}`, () => C.bedtime(it)); },
    verUp: (el) => { const it = C.itemById(el.dataset.id); it.ver = (it.ver || 1) + 1; C.touch(); paintModal(); },
    scene: (el) => toScene(el.dataset.v),
    item: (el) => modal('item', { id: el.dataset.v }),
    drawItem: (el) => { const it = C.itemById(el.dataset.v); if (!it) return; withBusy(`item:${it.id}`, () => C.drawItem(it)); },
    delItem: (el) => { if (!confirm('Убрать?')) return; C.delItem(el.dataset.id); closeModal(); },
    // вещи, покупки, из постов
    inv: () => modal('inv'),
    invF: (el) => { ui.inv.f = el.dataset.v; paintModal(); },
    placeHere: (el) => modal('place', { room: el.dataset.v }),
    putHere: (el) => { const it = C.itemById(el.dataset.id); if (!it) return; C.setItem(it.id, { room: el.dataset.room, spot: it.spot || DEFAULT_SPOT[it.kind] || 'shelf' }); C.toast('success', `${it.name} — в ${D.roomById(el.dataset.room)?.name.toLowerCase()}`); paintModal(); render(); },
    newThing: (el) => form('Новая вещь', [{ k: 'name', label: 'Что это', ph: 'винтажная лампа с зелёным абажуром' }, { k: 'kind', label: 'Какая полка', type: 'select', v: 'decor', list: D.PLACE_KINDS.map(k => [k, D.KINDS[k].name]) }, { k: 'room', label: 'Куда', type: 'select', v: el.dataset.room || '', list: [['', '— пока никуда'], ...D.ROOMS.filter(r => !r.link).map(r => [r.id, r.name])] }, { k: 'who', label: 'Чьё / кто подарил', ph: 'подарок Тони' }], (v) => { if (!v.name.trim()) return false; const it = C.addItem(v.kind, { name: v.name, who: v.who, room: v.room, spot: v.room ? DEFAULT_SPOT[v.kind] || 'shelf' : '' }, { src: 'me', room: v.room }); drawItems([it]); modal('item', { id: it.id }); return 'keep'; }, 'Добавить'),
    photoChat: () => { const list = C.chatImages(40); modal('pick', { title: 'Фото из чата', list, img: true, sel: new Set(), ok: 'Повесить', onOk: (sel) => { for (const x of sel) C.addItem('photo', { name: `Фото из поста #${x.mes}`, img: x.src, room: 'living', spot: 'wall' }, { src: 'chat', room: 'living', spot: 'wall' }); C.toast('success', `Повешено: ${sel.length}`); } }); },
    photoShoot: () => form('Снять фото на память', [{ k: 'name', label: 'Что на фото', ph: 'они вдвоём на крыше под снегом, она в его куртке' }, { k: 'room', label: 'Куда повесить', type: 'select', v: 'living', list: D.ROOMS.filter(r => !r.link).map(r => [r.id, r.name]) }], (v) => { if (!v.name.trim()) return false; const it = C.addItem('photo', { name: v.name, desc: v.name, room: v.room, spot: 'wall' }, { src: 'me' }); drawQueue([it], C.drawItem, (x) => `item:${x.id}`); modal('item', { id: it.id }); return 'keep'; }, 'Снять'),
    story: () => withBusy('story', async () => { const list = await C.fromStory(); modal('pick', { title: 'Из истории — что у них дома', list, img: false, sel: new Set(list.map((_, i) => i)), ok: 'В дом', onOk: (sel) => { const added = sel.map(x => C.addItem(D.KINDS[x.kind] ? x.kind : 'decor', x, { src: 'story' })); drawItems(added); C.toast('success', `В доме: ${added.length}`); } }); }),
    pickT: (el) => { const p = ui.modal; const i = Number(el.dataset.v); if (p.sel.has(i)) p.sel.delete(i); else p.sel.add(i); paintModal(); },
    pickOk: () => { const p = ui.modal; const sel = [...p.sel].map(i => p.list[i]).filter(Boolean); p.onOk(sel); closeModal(); },
    shop: () => modal('shop'),
    shopCat: (el) => { ui.shop.cat = el.dataset.v; paintModal(); },
    shopGen: () => { const cat = ui.shop.cat; withBusy(`shop:${cat}`, () => C.shopGen(cat, ui.shop.ask)); },
    shopMore: () => { const cat = ui.shop.cat; withBusy(`shop:${cat}:more`, () => C.shopGen(cat, ui.shop.ask, true)); },
    goodPic: (el) => { const x = C.shopList(ui.shop.cat)[Number(el.dataset.v)]; if (!x) return; withBusy(`good:${x._id}`, async () => { const tmp = C.normItem(D.SHOP_KIND[ui.shop.cat] || 'decor', x); x.img = await C.drawItem(tmp); C.touch(); }); },
    buy: (el) => { const x = C.shopList(ui.shop.cat)[Number(el.dataset.v)]; if (!x) return; withBusy(`buy:${x._id}`, async () => { const r = await C.buy(x); C.toast('success', `${esc(r.it.name)} — дома${r.paid ? ` · ${esc(r.paid)}` : ''}`); if (!r.it.img) drawItems([r.it]); }); },
    sugg: () => modal('sugg'),
    suggOk: (el) => { const it = C.acceptSugg(el.dataset.id); if (it) drawItems([it]); paintModal(); render(); },
    suggNo: (el) => { C.dropSugg(el.dataset.id); paintModal(); render(); },
    suggAll: () => { const l = C.suggestions().map(x => C.acceptSugg(x.id)).filter(Boolean); drawItems(l); C.toast('success', `В доме: ${l.length}`); paintModal(); render(); },
    formSave: async () => { const f = ui.modal; const r = await f.onSave(formVals()); if (r === false) { C.toast('info', 'Заполни главное'); return; } if (r !== 'keep' && ui.modal === f) closeModal(); else render(); },
};

export function onClick(e) {
    const el = e.target.closest?.('[data-dm]');
    if (!el || !el.closest('#dm-app')) return;
    e.preventDefault(); e.stopPropagation();
    const f = HANDLERS[el.dataset.dm];
    if (f) { try { f(el); } catch (err) { console.warn('[Дом]', el.dataset.dm, err); C.toast('error', esc(String(err?.message || err))); } }
}
export function onChange(e) {
    const el = e.target;
    if (!el?.closest?.('#dm-app')) return;
    if (el.dataset?.dmup) { upload(el); return; }
    const f = el.dataset?.dmf;
    if (!f) return;
    if (f === 'gen:ask') ui.gen.ask = el.value;
    else if (f === 'shop:ask') ui.shop.ask = el.value;
    else if (f === 'shelf:ask') ui.shelf.ask = el.value;
    else if (f === 'cfg:autoDraw') { C.cfg().autoDraw = !!el.checked; C.saveCfg(); }
    else if (f.startsWith('it:')) {
        const it = C.itemById(el.dataset.id); if (!it) return;
        const key = f.slice(3);
        const v = el.type === 'number' ? Math.round(Number(el.value) || 0) : el.value;
        it[key] = v;
        if (key === 'room' && !v) it.spot = '';
        if (key === 'room' && v && !it.spot) it.spot = DEFAULT_SPOT[it.kind] || 'shelf';
        C.touch();
        try { C.A?.updatePrompt?.(); } catch { /* */ }
        setTimeout(() => { paintModal(); render(); }, 200);
    }
}
export function onInput(e) {
    const f = e.target?.dataset?.dmf;
    if (f === 'gen:ask') ui.gen.ask = e.target.value;
    if (f === 'shop:ask') ui.shop.ask = e.target.value;
    if (f === 'shelf:ask') ui.shelf.ask = e.target.value;
}
async function upload(el) {
    const file = el.files?.[0];
    if (!file) return;
    const kind = el.dataset.dmup;
    const id = el.dataset.id;
    await withBusy(`${kind === 'room' ? 'room' : kind === 'item' ? 'item' : 'drawhc'}:${id}`, async () => {
        if (!C.A?.uploadImage || !C.A?.fileToJpeg) throw new Error('Загрузка картинок — через Life, а его нет');
        const path = await C.A.uploadImage(await C.A.fileToJpeg(file, 1400), `dom_${kind}`);
        if (kind === 'room') await C.setRoomImg(id, path);
        else if (kind === 'item') C.setItem(id, { img: path });
        else C.setHcImg(id, path);
    });
}
