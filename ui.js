// ✦ Дом — окно: комнаты, кухня с холодильником (хэды-полароиды), хэд-машина с кубиками.

import * as C from './core.js';
import * as D from './data.js';

const esc = C.esc;
const ui = {
    view: 'home', room: '', modal: null, busy: new Set(),
    gen: { who: null, vibe: 'dice', ask: '', rolling: false, flash: [], rolls: [], batch: '' },
};

// ───────────── значки ─────────────

const P = {
    x: '<path d="M6 6l12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12 5 5 9-10"/>',
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
    door: '<path d="M6 21V4h12v17M4 21h16M14 12h.01"/>', pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Z"/><circle cx="12" cy="10" r="2"/>',
};
export function ic(n, cls = '') { return `<svg class="dm-i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.home}</svg>`; }
const spin = '<span class="dm-spin"></span>';
const busy = (k) => ui.busy.has(k);
const btn = (g, label, extra = '', cls = '') => `<button class="dm-btn ${cls}" data-dm="${g}" ${extra}>${label}</button>`;
const attr = (o) => Object.entries(o).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
const tilt = (k) => { let h = 0; for (const ch of String(k)) h = (h * 31 + ch.charCodeAt(0)) | 0; return ((h >>> 0) % 7) - 3; };
const magnet = (k) => D.MAGNETS[Math.abs(tilt(`${k}m`) + 3) % D.MAGNETS.length];
function ava(name) {
    const src = C.avatarUrl(name);
    const l = esc(String(C.short(name) || '?').trim().charAt(0).toUpperCase());
    return `<span class="dm-ava">${src ? `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.remove()">` : ''}<i>${l}</i></span>`;
}
function dieHtml(n, rolling, cls = '') {
    return `<div class="dm-die${rolling ? ' rolling' : ''} ${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 92 28v44L50 96 8 72V28Z"/><path d="M50 4 30 40h40Z M8 28l22 12M92 28 70 40M30 40 8 72M70 40l22 32M30 40l20 34 20-34M50 74v22"/></svg><b>${n ?? '?'}</b></div>`;
}

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
    app.querySelector('.dm-top').innerHTML = `${room ? `<button class="dm-x" data-dm="home" aria-label="Назад">${ic('back')}</button>` : `<span class="dm-logo">${ic('home')}</span>`}
        <div class="dm-brand"><b>${room ? esc(room.name) : 'Дом'}</b><small>${esc(where || 'их дом')}</small></div>
        <button class="dm-x" data-dm="close" aria-label="Закрыть">${ic('x')}</button>`;
    const body = app.querySelector('.dm-body');
    const top = fresh ? 0 : body.scrollTop;
    let html = '';
    try { html = room ? roomHtml(room) : homeHtml(); } catch (err) { console.error('[Дом] экран', err); html = `<div class="dm-empty">Экран упал: ${esc(err?.message || err)}</div>`; }
    body.innerHTML = html;
    body.scrollTop = top;
}
function go(view, room = '') { ui.view = view; ui.room = room; render(true); }

// ───────────── дом: комнаты ─────────────

function homeHtml() {
    const hc = C.hcList();
    const tiles = D.ROOMS.map(r => {
        const img = C.roomImg(r.id);
        const ready = r.feats?.filter(f => f[3]) || [];
        const soon = r.feats?.filter(f => !f[3]) || [];
        const link = r.link ? ({ 'angar:lab': 'лаба Ангара', 'angar:gar': 'гараж Ангара' }[r.link]) : '';
        return `<button class="dm-room${img ? ' pic' : ''}" data-dm="room" data-v="${r.id}">
            <span class="dm-room-ph"${img ? ` style="background-image:url('${esc(img)}')"` : ''}>${img ? '' : ic(r.ico, 'xl')}</span>
            <span class="dm-room-t"><b>${esc(r.name)}</b><small>${esc(link ? `→ ${link}` : [...ready.map(f => f[1]), ...soon.map(f => f[1])].slice(0, 3).join(' · ') || 'просто комната')}</small></span>
            ${r.id === 'kitchen' && hc.length ? `<em class="dm-badge">${hc.length}</em>` : ''}
        </button>`;
    }).join('');
    return `<button class="dm-hero" data-dm="gen">
            <span class="dm-hero-dice">${dieHtml(20, false)}</span>
            <span><b>Хэд-машина</b><small>Рандомные хэды с картинками — милые, бытовые, смешные. Понравился — на холодильник, и модель будет его знать.</small></span>
        </button>
        <div class="dm-sec"><span>Комнаты</span><em>тап — зайти</em></div>
        <div class="dm-rooms">${tiles}</div>
        <div class="dm-hint">Уютное, без драмы: что у них дома. Картинки комнат — по лору квартиры, своя у каждой эпохи.</div>`;
}

function roomHtml(r) {
    const img = C.roomImg(r.id);
    const k = `room:${r.id}`;
    const pic = `<div class="dm-roompic${img ? '' : ' empty'}"${img ? ` style="background-image:url('${esc(img)}')" data-dm="zoom" data-v="${esc(img)}"` : ''}>
        ${img ? '' : `<div>${ic(r.ico, 'xl')}<p>Комнату ещё не рисовали</p></div>`}
        <div class="dm-roompic-tools">${btn('drawRoom', busy(k) ? spin : `${ic('brush')}${img ? '' : ' Нарисовать'}`, attr({ v: r.id, title: 'Нарисовать комнату' }), 'sm glass')}<label class="dm-btn sm glass" title="Своя картинка">${ic('upload')}<input type="file" accept="image/*" data-dmup="room" data-id="${r.id}" hidden></label></div>
    </div>`;
    if (r.link) {
        const [, hall] = r.link.split(':');
        return `${pic}<div class="dm-card"><p>${r.id === 'lab' ? 'Мастерская Хеди — это лаба Ангара: проекты, полигон, кубик инсайтов.' : 'Гараж — в Ангаре: машины, мотоциклы, бак и урон.'}</p>${btn('angar', `${ic(r.ico)} Открыть в Ангаре`, attr({ v: hall }), 'primary wide')}</div>`;
    }
    const soon = (r.feats || []).filter(f => !f[3]);
    return `${pic}
        ${r.id === 'kitchen' ? fridgeHtml() : ''}
        ${soon.length ? `<div class="dm-sec"><span>Скоро в этой комнате</span></div><div class="dm-soon">${soon.map(f => `<div><b>${esc(f[1])}</b><small>${esc(f[2])}</small></div>`).join('')}</div>` : ''}
        ${!soon.length && r.id !== 'kitchen' ? '<div class="dm-hint">Пока просто комната — тут будет то, что придумаем.</div>' : ''}`;
}

// ───────────── холодильник ─────────────

function fridgeHtml() {
    const list = [...C.hcList()].reverse();
    const pol = (h) => {
        const k = `drawhc:${h.id}`;
        return `<figure class="dm-pol mini${h.off ? ' off' : ''}" style="--tilt:${tilt(h.id) * 0.8}deg;--mag:${magnet(h.id)}" data-dm="hc" data-v="${esc(h.id)}">
            <i class="dm-mag"></i>
            <div class="dm-pol-ph${h.img ? '' : ' empty'}"${h.img ? ` style="background-image:url('${esc(h.img)}')"` : ''}>${busy(k) ? spin : h.img ? '' : ic('brush')}</div>
            <figcaption>${esc(C.cut(h.t, 90))}</figcaption>
        </figure>`;
    };
    return `<div class="dm-sec"><span>Холодильник</span><em>${list.length ? `хэдов: ${list.length}` : 'пусто'}</em></div>
        <div class="dm-fridge">
            <div class="dm-fridge-h"><i></i></div>
            ${list.length ? `<div class="dm-pols">${list.map(pol).join('')}</div>` : '<div class="dm-fridge-empty">Тут будут хэды на магнитах. Крутани хэд-машину — что понравится, вешай сюда.</div>'}
        </div>
        <div class="dm-actions">${btn('gen', `${ic('dice')} Хэд-машина`, '', 'primary wide')}</div>
        <div class="dm-hint">Хэды на холодильнике — те же, что в Life → Психика → Хедканоны: модель держит их за правду и вспоминает к месту. ⏸ — придержать, не выбрасывая.</div>`;
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
    try { html = { gen: genSheet, hc: hcSheet, zoom: zoomSheet }[ui.modal.kind]?.() || ''; } catch (err) { console.error('[Дом] лист', err); html = `<div class="dm-sheet">${sheetHead('Ой')}<div class="dm-empty">${esc(err?.message || err)}</div></div>`; }
    box.innerHTML = html;
    box.classList.add('on');
    const s = box.querySelector('.dm-sheet'); if (s) s.scrollTop = top;
}
const zoomSheet = () => `<div class="dm-sheet zoom">${sheetHead('')}<img src="${esc(ui.modal.src)}" alt=""></div>`;

/** Хэд-машина. */
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
            <figcaption>
                <span class="dm-vibe">${v.ico} ${esc(v.name)} · ${esc(c.who.map(C.short).join(' + '))}</span>
                <p>${esc(c.t)}</p>
            </figcaption>
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
        ${showDice ? `<div class="dm-dice">${(dice || []).map((d, i) => `<div>${dieHtml(d.r, g.rolling, g.rolling ? '' : `v-${d.v}`)}${g.rolling ? '' : `<small>${D.vibeById(d.v).ico} ${esc(D.vibeById(d.v).name)}</small>`}</div>`).join('')}</div>` : ''}
        ${batch ? `<div class="dm-cards">${batch.items.map(card).join('')}</div>` : (going ? '' : '<div class="dm-empty">Крутани — выпадет четыре хэда.</div>')}
        ${C.M().gen.length > 1 ? `<div class="dm-sec"><span>Прошлые броски</span></div><div class="dm-chips">${C.M().gen.map((b, i) => `<button class="dm-chip${b.id === g.batch ? ' on' : ''}" data-dm="genBatch" data-v="${b.id}">${i === 0 ? 'последний' : `#${i + 1}`} · ${b.items.length}</button>`).join('')}</div>` : ''}
    </div>`;
}

/** Хэд с холодильника. */
function hcSheet() {
    const h = C.hcById(ui.modal.id);
    if (!h) return `<div class="dm-sheet">${sheetHead('Хэд')}<div class="dm-empty">Его уже сняли.</div></div>`;
    const k = `drawhc:${h.id}`;
    const v = h.vibe ? D.vibeById(h.vibe) : null;
    return `<div class="dm-sheet">${sheetHead(`${ic('fridge')} С холодильника`)}
        <figure class="dm-pol big" style="--tilt:${tilt(h.id) * 0.4}deg;--mag:${magnet(h.id)}">
            <i class="dm-mag"></i>
            <div class="dm-pol-ph${h.img ? '' : ' empty'}"${h.img ? ` style="background-image:url('${esc(h.img)}')" data-dm="zoom" data-v="${esc(h.img)}"` : ''}>${busy(k) ? `<span class="dm-drawing">${spin}<small>рисую…</small></span>` : h.img ? '' : btn('drawHc', `${ic('brush')} Нарисовать`, attr({ v: h.id }), 'sm glass')}</div>
            <figcaption>
                <span class="dm-vibe">${v ? `${v.ico} ${esc(v.name)} · ` : ''}${esc(h.who.map(C.short).join(' + '))}${h.at ? ` · ${esc(h.at)}` : ''}${h.src === 'dom' ? '' : ' · записан руками'}</span>
                <p>${esc(h.t)}</p>
            </figcaption>
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
/** Картинки по очереди: одна за другой (сервис не любит пачки); первая ошибка — стоп. */
async function drawQueue(cards) {
    for (const c of cards) {
        if (c.img || ui.busy.has(`draw:${c.id}`)) continue;
        const key = `draw:${c.id}`;
        ui.busy.add(key); paintModal(); render();
        try { await C.drawHc(c); } catch (e) {
            console.warn('[Дом] картинка', e);
            ui.busy.delete(key); paintModal(); render();
            C.toast('warning', `Картинка не вышла: ${esc(String(e?.message || e))}`);
            return;
        }
        ui.busy.delete(key); paintModal(); render();
    }
}
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

const HANDLERS = {
    close: () => close(),
    home: () => go('home'),
    room: (el) => { const r = D.roomById(el.dataset.v); if (r) go('room', r.id); },
    angar: (el) => { if (!globalThis.Angar?.open) { C.toast('info', 'Ангар не найден — поставь его, и мастерская с гаражом откроются там'); return; } close(); setTimeout(() => globalThis.Angar.open(el.dataset.v), 220); },
    drawRoom: (el) => { const r = D.roomById(el.dataset.v); withBusy(`room:${r.id}`, async () => { await C.drawRoom(r); C.toast('success', `${r.name} — готово`); }); },
    zoom: (el) => modal('zoom', { src: el.dataset.v }),
    closeModal: () => closeModal(),
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
    if (f === 'gen:ask') ui.gen.ask = el.value;
    if (f === 'cfg:autoDraw') { C.cfg().autoDraw = !!el.checked; C.saveCfg(); }
}
export function onInput(e) { const el = e.target; if (el?.dataset?.dmf === 'gen:ask') ui.gen.ask = el.value; }
async function upload(el) {
    const file = el.files?.[0];
    if (!file) return;
    const kind = el.dataset.dmup;
    const id = el.dataset.id;
    await withBusy(`${kind === 'room' ? 'room' : 'drawhc'}:${id}`, async () => {
        if (!C.A?.uploadImage || !C.A?.fileToJpeg) throw new Error('Загрузка картинок — через Life, а его нет');
        const path = await C.A.uploadImage(await C.A.fileToJpeg(file, 1400), `dom_${kind}`);
        if (kind === 'room') await C.setRoomImg(id, path);
        else C.setHcImg(id, path);
    });
}

// для Life и соседей
export const openGenNow = () => { open(null, true); };
