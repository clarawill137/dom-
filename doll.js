// ✦ Дом — кукольный домик 2.5D: комната в изометрии, как в симс в разрезе. Обои и пол — на выбор или ИИ по описанию;
// мебель — коробочки, их двигают, крутят и красят; вещи дома — наклейки из их же картинок (фон вырезается сам),
// их таскают пальцем на пол, стены, полки, стол, подоконник. Свет — по времени истории, за окном — погода,
// в комнате — кто сейчас в сцене. «Картинкой» — ИИ рисует комнату такой, как её расставили.

import * as C from './core.js';
import * as D from './data.js';
import * as K from './dolldata.js';

const esc = C.esc;
const { W, D: DEP, H } = K.ROOM;
const COS = 0.8660254;
export const SW = 360;
const PAD = 6, TH = 0.35, FL = 0.55;
const KK = (SW - 2 * PAD) / ((W + DEP + 2 * TH) * COS);
const OX = PAD + (DEP + TH) * COS * KK;
const OY = PAD + (H + TH) * KK;
export const SH = Math.round(OY + (W + DEP) * 0.5 * KK + FL * KK + PAD);
const r2 = (v) => Math.round(v * 100) / 100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

/** Мир → экран сцены (px). */
export const P = (x, y, z = 0) => [OX + (x - y) * COS * KK, OY + (x + y) * 0.5 * KK - z * KK];
/** Экран → пол на высоте z: [x, y]. */
export function unP(sx, sy, z = 0) { const a = (sx - OX) / (COS * KK); const b = (sy - OY + z * KK) / (0.5 * KK); return [(a + b) / 2, (b - a) / 2]; }
/** Экран → правая стена (y = 0): [x, z]; левая (x = 0): [y, z]. */
export function unWallR(sx, sy) { const x = (sx - OX) / (COS * KK); return [x, (OY + x * 0.5 * KK - sy) / KK]; }
export function unWallL(sx, sy) { const y = -(sx - OX) / (COS * KK); return [y, (OY + y * 0.5 * KK - sy) / KK]; }

// ───────────── состояние ─────────────

const st = { sel: null, confirm: '', tex: { target: 'both', ask: '' }, mode: {} };
let host = null;
let cur = null;     // что нарисовано сейчас: { id, s, items, surf }
let needRender = false;
export function bind(h) { host = h; }
export const ui = st;

export const eraBucket = () => (C.eraKey() === '40s' ? '40s' : 'now');
export const dollKey = (id) => `${id}:${eraBucket()}`;

/** Состояние комнаты: обои, пол, мебель. Первый раз — раскладка по лору. */
export function roomState(id) {
    const m = C.M();
    if (!m.doll || typeof m.doll !== 'object' || Array.isArray(m.doll)) m.doll = {};
    const key = dollKey(id);
    let s = m.doll[key];
    if (!s || typeof s !== 'object') s = m.doll[key] = {};
    if (!Array.isArray(s.furn)) seed(id, s);
    if (id === 'nursery' && C.M().nursery?.crib) for (const p of s.furn) if (p.t === 'boxes') p.t = 'crib';
    return s;
}
function seed(id, s) {
    const L = K.LAYOUT[id] || { wall: 'cream', floor: 'planks', furn: [] };
    s.wl = s.wl || L.wall; s.wr = s.wr || ''; s.fl = s.fl || L.floor;
    s.furn = L.furn.map(f => mkPiece(f, id)).filter(Boolean);
}
function mkPiece(f, roomId) {
    let [t, a, b, c] = f;
    if (t === 'crib' && roomId === 'nursery' && !C.M().nursery?.crib) t = 'boxes';
    const T = K.FURN[t];
    if (!T) return null;
    if (T.wall) return { id: C.uid(), t, wall: a === 'L' ? 'L' : 'R', u: num(b), z: c ?? T.z };
    return { id: C.uid(), t, x: num(a), y: num(b), r: num(c) % 4 };
}
export function resetRoom(id) {
    const m = C.M();
    if (m.doll) delete m.doll[dollKey(id)];
    for (const it of C.placedIn(id)) delete it.doll;
    st.sel = null; st.confirm = '';
    C.touch();
}

// ───────────── геометрия ─────────────

export function footprint(p) { const T = K.FURN[p.t]; if (!T) return [1, 1]; return (num(p.r) % 2) ? [T.d, T.w] : [T.w, T.d]; }
const rotBox = ([x, y, z, w, d, h, c], w0) => [y, w0 - x - w, z, d, w, h, c];
/** Коробки предмета в мире комнаты. */
export function boxesOf(p) {
    const T = K.FURN[p.t];
    if (!T) return [];
    if (T.wall) {
        const z0 = num(p.z, T.z);
        return T.parts.map(([x, y, z, w, d, h, c]) => (p.wall === 'L' ? [y, p.u + x, z0 + z, d, w, h, c] : [p.u + x, y, z0 + z, w, d, h, c]));
    }
    let list = T.parts.map(q => [...q]);
    let w0 = T.w, d0 = T.d;
    for (let i = 0; i < num(p.r) % 4; i++) { list = list.map(q => rotBox(q, w0)); [w0, d0] = [d0, w0]; }
    return list.map(([x, y, z, w, d, h, c]) => [p.x + x, p.y + y, z, w, d, h, c]);
}
/** Точка предмета (свет лампы) — в мир комнаты. */
function pointOf(p, [lx, ly, lz]) {
    const T = K.FURN[p.t];
    if (T.wall) { const z0 = num(p.z, T.z); return p.wall === 'L' ? [ly, p.u + lx, z0 + lz] : [p.u + lx, ly, z0 + lz]; }
    let q = [lx, ly, lz, 0, 0, 0, ''];
    let w0 = T.w, d0 = T.d;
    for (let i = 0; i < num(p.r) % 4; i++) { q = rotBox(q, w0); [w0, d0] = [d0, w0]; }
    return [p.x + q[0], p.y + q[1], q[2]];
}
function aabb(boxes) {
    const a = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity };
    for (const [x, y, z, w, d, h] of boxes) {
        a.x0 = Math.min(a.x0, x); a.y0 = Math.min(a.y0, y); a.z0 = Math.min(a.z0, z);
        a.x1 = Math.max(a.x1, x + w); a.y1 = Math.max(a.y1, y + d); a.z1 = Math.max(a.z1, z + h);
    }
    return a;
}
/** Поверхность, на которую можно ставить вещи: { id, z, x0, x1, y0, y1 }. */
export function surfaceOf(p) {
    const T = K.FURN[p.t];
    if (!T || T.top == null) return null;
    if (T.wall) {
        const z0 = num(p.z, T.z);
        const [s0, s1, dp] = T.surf || [0, T.len, 0.5];
        return p.wall === 'L' ? { id: p.id, z: z0 + T.top, x0: 0, x1: dp, y0: p.u + s0, y1: p.u + s1 } : { id: p.id, z: z0 + T.top, x0: p.u + s0, x1: p.u + s1, y0: 0, y1: dp };
    }
    const [fw, fd] = footprint(p);
    return { id: p.id, z: T.top, x0: p.x, x1: p.x + fw, y0: p.y, y1: p.y + fd };
}
function pieceHeight(T) { let m = 0; for (const [, , z, , , h] of T.parts) m = Math.max(m, z + h); return m; }
function pieceBottom(T) { let m = 0; for (const [, , z] of T.parts) m = Math.min(m, z); return m; }

/** Порядок коробок внутри предмета: сначала то, что дальше и ниже. */
const before = (A, B) => A[0] + A[3] <= B[0] + 1e-6 || A[1] + A[4] <= B[1] + 1e-6 || A[2] + A[5] <= B[2] + 1e-6;
export function orderBoxes(list) {
    const out = [];
    const left = list.slice();
    while (left.length) {
        let pick = -1;
        for (let i = 0; i < left.length && pick < 0; i++) {
            let ok = true;
            for (let j = 0; j < left.length; j++) if (j !== i && before(left[j], left[i]) && !before(left[i], left[j])) { ok = false; break; }
            if (ok) pick = i;
        }
        out.push(left.splice(pick < 0 ? 0 : pick, 1)[0]);
    }
    return out;
}

// ───────────── цвет ─────────────

function rgba(c) {
    const s = String(c || '');
    if (s[0] === '#') { const h = s.length === 4 ? s.slice(1).split('').map(v => v + v).join('') : s.slice(1, 7); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]; }
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (m) { const v = m[1].split(',').map(t => parseFloat(t)); return [v[0], v[1], v[2], v[3] ?? 1]; }
    return [128, 128, 128, 1];
}
export function shade(c, f) {
    const [r, g, b, a] = rgba(c);
    const k = (v) => Math.round(clamp(f < 0 ? v * (1 + f) : v + (255 - v) * f, 0, 255));
    return a < 1 ? `rgba(${k(r)},${k(g)},${k(b)},${a})` : `rgb(${k(r)},${k(g)},${k(b)})`;
}
const alphaOf = (c) => rgba(c)[3];
function colOf(tok, p, T) {
    const m = p.col || T.col;
    if (tok === 'm') return m;
    if (tok === 'm2') return shade(m, -0.2);
    if (tok === 'm3') return shade(m, 0.16);
    if (tok === 'a') return p.acc || T.acc || shade(m, 0.3);
    return tok;
}

// ───────────── время и погода ─────────────

export function phaseOf(time) {
    const m = String(time || '').match(/(\d{1,2})[:.](\d{2})/);
    const h = m ? Number(m[1]) : null;
    if (h == null) return 'day';
    if (h >= 22 || h < 5) return 'night';
    if (h < 8) return 'dawn';
    if (h < 17) return 'day';
    if (h < 20) return 'evening';
    return 'dusk';
}
export function wxOf(atm) {
    const t = String(atm || '').toLowerCase();
    if (/метел|вьюг|буран/.test(t)) return 'snow';
    if (/снег|снеж|снегопад/.test(t) && !/без снега|снег не/.test(t)) return 'snow';
    if (/гроз|дожд|ливн|ливень|морос/.test(t) && !/без дождя/.test(t)) return 'rain';
    return '';
}
const phaseNow = () => phaseOf(C.clock().time);
function wxNow() { try { return wxOf(C.A?.worldState?.()?.scene?.atmosphere); } catch { return ''; } }
const PH_RU = { night: 'ночь', dawn: 'рассвет', day: 'день', evening: 'вечер', dusk: 'сумерки' };
const LIGHT = { dawn: 'rgba(255,186,160,.16)', day: 'rgba(0,0,0,0)', evening: 'rgba(255,160,90,.2)', dusk: 'rgba(110,80,160,.32)', night: 'rgba(28,36,88,.56)' };
const lit = (ph) => ph !== 'day';

// ───────────── отрисовка предметов ─────────────

const pts = (a) => a.map(([u, v]) => `${u.toFixed(1)},${v.toFixed(1)}`).join(' ');
function faces([x, y, z, w, d, h], proj) {
    return {
        rx: [proj(x + w, y, z), proj(x + w, y + d, z), proj(x + w, y + d, z + h), proj(x + w, y, z + h)],
        ry: [proj(x, y + d, z), proj(x + w, y + d, z), proj(x + w, y + d, z + h), proj(x, y + d, z + h)],
        top: [proj(x, y, z + h), proj(x + w, y, z + h), proj(x + w, y + d, z + h), proj(x, y + d, z + h)],
    };
}
const WXPAT = {
    snow: '<circle cx="2" cy="2" r=".9" fill="#fff"/><circle cx="5" cy="5.5" r=".6" fill="#fff"/>',
    rain: '<path d="M4 0 L2 6" stroke="rgba(220,235,255,.75)" stroke-width=".6"/>',
    stars: '<circle cx="2" cy="3" r=".5" fill="#fff"/><circle cx="8" cy="7" r=".35" fill="#fff"/>',
};
/** Полигоны коробок предмета → { svg-тело, рамка }. proj — проекция. */
function polysOf(p, proj, { ph = 'day', wx = '', uid = 'x' } = {}) {
    const T = K.FURN[p.t];
    const boxes = orderBoxes(boxesOf(p));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let defs = '', body = '';
    const grow = (list) => { for (const [u, v] of list) { if (u < minX) minX = u; if (v < minY) minY = v; if (u > maxX) maxX = u; if (v > maxY) maxY = v; } };
    for (const bx of boxes) {
        const f = faces(bx, proj);
        grow(f.rx); grow(f.ry); grow(f.top);
        const tok = bx[6];
        if (tok === 'sky') {
            const [top, low] = K.SKY[ph] || K.SKY.day;
            const gid = `sk${uid}`;
            if (!defs.includes(gid)) {
                defs += `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${low}"/></linearGradient>`;
                const pat = wx === 'snow' ? 'snow' : wx === 'rain' ? 'rain' : ph === 'night' ? 'stars' : '';
                if (pat) defs += `<pattern id="wx${uid}" width="${pat === 'stars' ? 11 : 7}" height="${pat === 'stars' ? 9 : 7}" patternUnits="userSpaceOnUse">${WXPAT[pat]}</pattern>`;
            }
            const front = p.wall === 'L' ? f.rx : f.ry;
            const side = p.wall === 'L' ? f.ry : f.rx;
            body += `<polygon points="${pts(side)}" fill="${low}"/><polygon points="${pts(front)}" fill="url(#${gid})"/>`;
            if (defs.includes(`wx${uid}`)) body += `<polygon points="${pts(front)}" fill="url(#wx${uid})"/>`;
            continue;
        }
        const col = colOf(tok, p, T);
        const a = alphaOf(col);
        const edge = a < 1 ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.2)';
        body += `<polygon points="${pts(f.ry)}" fill="${shade(col, -0.24)}" stroke="${edge}" stroke-width=".5"/>`
            + `<polygon points="${pts(f.rx)}" fill="${shade(col, -0.1)}" stroke="${edge}" stroke-width=".5"/>`
            + `<polygon points="${pts(f.top)}" fill="${col}" stroke="${edge}" stroke-width=".5"/>`;
    }
    return { defs, body, box: [minX, minY, maxX, maxY] };
}
const pieceCache = new Map();
function pieceSvg(p, ctx) {
    const sel = st.sel?.k === 'fu' && st.sel.id === p.id;
    const key = JSON.stringify([p.t, p.x, p.y, p.r, p.u, p.z, p.wall, p.col, p.acc, ctx.ph, ctx.wx]);
    let out = pieceCache.get(p.id + key);
    if (!out) {
        const { defs, body, box } = polysOf(p, P, { ph: ctx.ph, wx: ctx.wx, uid: p.id });
        const [x0, y0, x1, y1] = [Math.floor(box[0]) - 2, Math.floor(box[1]) - 2, Math.ceil(box[2]) + 2, Math.ceil(box[3]) + 2];
        out = { html: (cls) => `<svg class="dl-fu${cls}" data-dl="fu" data-id="${p.id}" style="left:${x0}px;top:${y0}px" width="${x1 - x0}" height="${y1 - y0}" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`, sbox: [x0, y0, x1, y1] };
        if (pieceCache.size > 400) pieceCache.clear();
        pieceCache.set(p.id + key, out);
    }
    return { html: out.html(sel ? ' sel' : ''), sbox: out.sbox };
}
/** Миниатюра для каталога. */
const thumbs = new Map();
export function thumbSvg(t) {
    if (thumbs.has(t)) return thumbs.get(t);
    const T = K.FURN[t];
    if (!T) return '';
    const p = T.wall ? { id: `th${t}`, t, wall: 'R', u: 0, z: 0 } : { id: `th${t}`, t, x: 0, y: 0, r: 0 };
    const s = 7;
    const proj = (x, y, z) => [(x - y) * COS * s, (x + y) * 0.5 * s - z * s];
    const { defs, body, box } = polysOf(p, proj, { uid: `th${t}` });
    const w = box[2] - box[0] + 4, h = box[3] - box[1] + 4;
    const html = `<svg viewBox="${box[0] - 2} ${box[1] - 2} ${w} ${h}" preserveAspectRatio="xMidYMid meet">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
    thumbs.set(t, html);
    return html;
}

// ───────────── вещи-наклейки ─────────────

const stickOf = (it) => K.STICK[it.kind] || [1.4, false];
export function cutSrc(it) { return it.cutImg && it.doll?.cut !== false ? it.cutImg : ''; }
/** Расставить вещь, у которой ещё нет места в домике: по её месту из 0.2 (на полке, на столе…). */
export function autoPlace(it, s, taken) {
    const [, flatDef] = stickOf(it);
    const spot = it.kind === 'plant' ? 'plant' : (it.spot || D.DEFAULT_SPOT?.[it.kind] || 'floor');
    if (flatDef || spot === 'wall') {
        for (const z of [3.9, 2.5]) for (const u of [1.6, 3.6, 5.6, 7.6, 8.8]) for (const w of ['R', 'L']) {
            if (!wallFree(s, w, u, z, taken)) continue;
            taken.push({ on: w, u, z });
            return { on: w, x: w === 'R' ? u : 0, y: w === 'L' ? u : 0, z, s: 1, flat: true };
        }
        return { on: 'R', x: 5, y: 0, z: 3.4, s: 1, flat: true };
    }
    for (const t of K.SPOT_FURN[spot] || []) {
        for (const p of s.furn.filter(q => q.t === t)) {
            const sf = surfaceOf(p);
            if (!sf) continue;
            const n = taken.filter(q => q.on === p.id).length;
            if (n >= 5) continue;
            const fr = [0.5, 0.25, 0.75, 0.38, 0.62][n];
            const long = sf.x1 - sf.x0 >= sf.y1 - sf.y0;
            const x = long ? sf.x0 + (sf.x1 - sf.x0) * fr : (sf.x0 + sf.x1) / 2;
            const y = long ? (sf.y0 + sf.y1) / 2 : sf.y0 + (sf.y1 - sf.y0) * fr;
            taken.push({ on: p.id });
            return { on: p.id, x: r2(x), y: r2(y), z: sf.z, s: 1, flat: false };
        }
    }
    const n = taken.filter(q => q.on === 'F').length;
    const spots = [[7.6, 7.6], [6.2, 8.6], [8.6, 6.2], [5.2, 7.2], [7.2, 5.2], [4.4, 8.6], [8.6, 4.4]];
    const [x, y] = spots[n % spots.length];
    taken.push({ on: 'F' });
    return { on: 'F', x, y, z: 0, s: 1, flat: false };
}
function wallFree(s, w, u, z, taken) {
    for (const p of s.furn) {
        const T = K.FURN[p.t];
        if (!T?.wall || p.wall !== w) continue;
        const z0 = num(p.z, T.z) + pieceBottom(T), z1 = num(p.z, T.z) + pieceHeight(T);
        if (u + 0.9 > p.u && u - 0.9 < p.u + T.len && z + 0.9 > z0 && z - 0.9 < z1) return false;
    }
    if (w === 'R' || w === 'L') {
        for (const p of s.furn) {
            const T = K.FURN[p.t];
            if (!T || T.wall) continue;
            const a = aabb(boxesOf(p));
            const near = w === 'R' ? a.y0 < 0.6 && u + 0.9 > a.x0 && u - 0.9 < a.x1 : a.x0 < 0.6 && u + 0.9 > a.y0 && u - 0.9 < a.y1;
            if (near && z - 0.9 < a.z1) return false;
        }
    }
    return !taken.some(q => q.on === w && Math.abs(q.u - u) < 1.6 && Math.abs(q.z - z) < 1.4);
}
function itemsHere(id, s) {
    const list = C.placedIn(id);
    const taken = [];
    for (const it of list) if (it.doll) taken.push(it.doll.flat ? { on: it.doll.on, u: it.doll.on === 'L' ? it.doll.y : it.doll.x, z: it.doll.z } : { on: it.doll.on });
    let changed = false;
    for (const it of list) {
        if (it.doll && it.doll.on && (it.doll.on.length <= 1 || s.furn.some(p => p.id === it.doll.on))) continue;
        it.doll = { ...autoPlace(it, s, taken), cut: it.doll?.cut };
        changed = true;
    }
    if (changed) C.touch();
    return list;
}
/** Плоская наклейка: матрица поверхности + сдвиг к центру. */
function planeM(on) {
    if (on === 'R') return [COS, 0.5, 0, 1, OX, OY - H * KK];
    if (on === 'L') return [COS, -0.5, 0, 1, OX - COS * DEP * KK, OY + 0.5 * DEP * KK - H * KK];
    return [COS, 0.5, -COS, 0.5, OX, OY];
}
function localOf(pos) {
    if (pos.on === 'R') return [pos.x * KK, (H - pos.z) * KK];
    if (pos.on === 'L') return [(DEP - pos.y) * KK, (H - pos.z) * KK];
    return [pos.x * KK, pos.y * KK];
}
function flatMatrix(pos, w, h) {
    const [a, b, c, d, e, f] = planeM(pos.on);
    const [u, v] = localOf(pos);
    const ox = u - w / 2, oy = v - h / 2;
    return `matrix(${a},${b},${c},${d},${(e + a * ox + c * oy).toFixed(1)},${(f + b * ox + d * oy).toFixed(1)})`;
}
const flatPlane = (pos) => (pos.on === 'R' || pos.on === 'L' ? pos.on : 'F');
function stickerHtml(it, sel) {
    const pos = it.doll;
    const [hu] = stickOf(it);
    const size = hu * KK * clamp(num(pos.s, 1), 0.3, 3.5);
    const src = cutSrc(it) || it.img || '';
    const cls = `${sel ? ' sel' : ''}${src && !cutSrc(it) ? ' card' : ''}${src ? '' : ' noimg'}`;
    const inner = src ? `<img src="${esc(src)}" alt="" draggable="false"${pos.flip ? ' style="transform:scaleX(-1)"' : ''}>` : `<span class="dl-ph">${dIc(D.kindOf(it.kind).ico)}</span>`;
    if (pos.flat) {
        const ar = num(it.cutAR || it.ar, 1) || 1;
        const w = size, h = size / ar;
        const pl = flatPlane(pos);
        return `<div class="dl-st flat${cls}${it.kind === 'photo' ? ' photo' : ''}" data-dl="st" data-id="${it.id}" data-pl="${pl}" style="width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:${flatMatrix({ ...pos, on: pl }, w, h)}">${inner}</div>`;
    }
    const [sx, sy] = P(pos.x, pos.y, pos.z);
    return `<div class="dl-st up${cls}" data-dl="st" data-id="${it.id}" style="left:${sx.toFixed(1)}px;top:${sy.toFixed(1)}px;height:${size.toFixed(1)}px">${inner}</div>`;
}

// ───────────── сцена ─────────────

function shellSvg() {
    const pl = (list, fill) => `<polygon points="${pts(list)}" fill="${fill}"/>`;
    const t = TH, f = FL;
    return `<svg class="dl-shell" width="${SW}" height="${SH}" viewBox="0 0 ${SW} ${SH}">`
        + pl([P(W, -t, 0), P(W, DEP, 0), P(W, DEP, -f), P(W, -t, -f)], '#5a3d2c')
        + pl([P(-t, DEP, 0), P(W, DEP, 0), P(W, DEP, -f), P(-t, DEP, -f)], '#4a3123')
        + pl([P(W, -t, -f * 0.55), P(W, DEP, -f * 0.55), P(W, DEP, -f), P(W, -t, -f)], 'rgba(0,0,0,.25)')
        + pl([P(-t, DEP, -f * 0.55), P(W, DEP, -f * 0.55), P(W, DEP, -f), P(-t, DEP, -f)], 'rgba(0,0,0,.3)')
        + pl([P(0, 0, H), P(W, 0, H), P(W, -t, H), P(-t, -t, H), P(-t, 0, H)], '#3b2a24')
        + pl([P(0, 0, H), P(0, DEP, H), P(-t, DEP, H), P(-t, -t, H), P(0, -t, H)], '#33241f')
        + pl([P(W, 0, 0), P(W, 0, H), P(W, -t, H), P(W, -t, 0)], '#6e4a3a')
        + pl([P(0, DEP, 0), P(0, DEP, H), P(-t, DEP, H), P(-t, DEP, 0)], '#5e3f31')
        + '</svg>';
}
function wallBg(s, side, ph) {
    const useR = side === 'R' && s.wr;
    const id = useR ? s.wr : s.wl;
    const img = useR ? s.wrImg : s.wlImg;
    if (id === 'ai' && img) return `url("${img}") 0 0/64px 64px`;
    return (K.wallById(id) || K.WALLS[0]).bg(ph);
}
function floorBg(s) {
    if (s.fl === 'ai' && s.flImg) return `url("${s.flImg}") 0 0/72px 72px`;
    return (K.floorById(s.fl) || K.FLOORS[0]).bg();
}
const mtx = (m) => `matrix(${m.map(v => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(4))).join(',')})`;
function planesHtml(s, ph) {
    return `<div class="dl-plane L" style="width:${(DEP * KK).toFixed(1)}px;height:${(H * KK).toFixed(1)}px;transform:${mtx(planeM('L'))};background:${esc(wallBg(s, 'L', ph))}"></div>`
        + `<div class="dl-plane R" style="width:${(W * KK).toFixed(1)}px;height:${(H * KK).toFixed(1)}px;transform:${mtx(planeM('R'))};background:${esc(wallBg(s, 'R', ph))}"></div>`
        + `<div class="dl-plane F" style="width:${(W * KK).toFixed(1)}px;height:${(DEP * KK).toFixed(1)}px;transform:${mtx(planeM('F'))};background:${esc(floorBg(s))}"></div>`;
}
/** Кто сейчас в этой комнате (если сцена здесь). */
function peopleHere(room) {
    const k = C.clock();
    if (!room.re?.test(k.loc || '')) return [];
    let list = [];
    try { list = C.A?.worldState?.()?.scene?.characters_present || []; } catch { /* */ }
    const out = [];
    const add = (n) => { n = C.canon(n); if (n && !out.some(x => C.same(x, n))) out.push(n); };
    add(C.userName());
    (Array.isArray(list) ? list : String(list).split(/[,;]/)).forEach(add);
    return out.slice(0, 5);
}
const PP = [[6.4, 6.6], [4.8, 7.8], [7.8, 4.8], [5.4, 5.4], [3.8, 6.6]];
/** Свободные места на полу — чтобы люди не стояли внутри дивана. */
function freeSpots(s, n) {
    const busy = s.furn.filter(p => !K.FURN[p.t]?.wall && !K.FURN[p.t]?.flat).map(p => aabb(boxesOf(p)));
    const free = (x, y) => !busy.some(a => x > a.x0 - 0.45 && x < a.x1 + 0.45 && y > a.y0 - 0.45 && y < a.y1 + 0.45);
    const out = [];
    const far = (x, y) => out.every(([u, v]) => Math.hypot(u - x, v - y) >= 1.3);
    const cands = [...PP];
    for (let x = 8.8; x >= 1.6; x -= 0.6) for (let y = 8.8; y >= 1.6; y -= 0.6) cands.push([r2(x), r2(y)]);
    for (const [x, y] of cands) { if (out.length >= n) break; if (free(x, y) && far(x, y)) out.push([x, y]); }
    return out;
}

/** Всё, что стоит в комнате, — в одном порядке отрисовки (дальше и ниже — раньше). */
function drawables(id, s, items) {
    const list = [];
    for (const p of s.furn) {
        const T = K.FURN[p.t];
        if (!T) continue;
        const a = aabb(boxesOf(p));
        list.push({ k: 'fu', p, a, flat: !!T.flat, key: (a.x0 + a.x1) / 2 + (a.y0 + a.y1) / 2 + (T.wall ? -40 : 0) });
    }
    for (const it of items) {
        const pos = it.doll;
        if (!pos || pos.flat) continue;
        const r = 0.25;
        list.push({ k: 'st', it, on: pos.on, a: { x0: pos.x - r, x1: pos.x + r, y0: pos.y - r, y1: pos.y + r, z0: pos.z, z1: pos.z + 1 }, key: pos.x + pos.y + 0.01 });
    }
    return list;
}
function screenBox(d) {
    if (d.k === 'fu') return pieceSvg(d.p, d.ctx).sbox;
    const [sx, sy] = P(d.it.doll.x, d.it.doll.y, d.it.doll.z);
    const hpx = stickOf(d.it)[0] * KK * num(d.it.doll.s, 1);
    return [sx - hpx * 0.6, sy - hpx, sx + hpx * 0.6, sy];
}
const overlap = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
function mustBefore(A, B) {
    if (B.on && A.p && B.on === A.p.id) return true;
    if (A.on && B.p && A.on === B.p.id) return false;
    const a = A.a, b = B.a, e = 1e-6;
    if (a.x1 <= b.x0 + e || a.y1 <= b.y0 + e) return true;
    if (a.z1 <= b.z0 + e && a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) return true;
    return false;
}
export function sortDrawables(list) {
    const n = list.length;
    const boxes = list.map(screenBox);
    const indeg = new Array(n).fill(0);
    const edges = list.map(() => []);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        if (!overlap(boxes[i], boxes[j])) continue;
        const ij = mustBefore(list[i], list[j]), ji = mustBefore(list[j], list[i]);
        if (ij && !ji) { edges[i].push(j); indeg[j]++; } else if (ji && !ij) { edges[j].push(i); indeg[i]++; }
    }
    const out = [];
    const done = new Array(n).fill(false);
    for (let step = 0; step < n; step++) {
        let pick = -1;
        for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (pick < 0 || list[i].key < list[pick].key)) pick = i;
        if (pick < 0) for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || list[i].key < list[pick].key)) pick = i;
        done[pick] = true;
        out.push(list[pick]);
        for (const j of edges[pick]) indeg[j]--;
    }
    return out;
}
function glowsHtml(s, ph) {
    let h = '';
    for (const p of s.furn) {
        const T = K.FURN[p.t];
        for (const g of T?.glow || []) {
            const always = g[5] === 'always';
            if (!always && !lit(ph)) continue;
            const w = pointOf(p, g);
            const [sx, sy] = P(w[0], w[1], w[2]);
            const small = g[4] < 1.5;
            const rad = g[4] * KK * (lit(ph) ? 1 : 0.6) * (small ? 0.8 : 1);
            const a = (lit(ph) ? (ph === 'night' ? 0.75 : 0.5) : 0.35) * (small ? 0.55 : 1);
            h += `<i class="dl-glow" style="left:${sx.toFixed(1)}px;top:${sy.toFixed(1)}px;width:${(rad * 2).toFixed(1)}px;height:${(rad * 2).toFixed(1)}px;background:radial-gradient(circle, ${g[3]} 0%, transparent 68%);opacity:${a}"></i>`;
        }
    }
    return h;
}

/** Сцена комнаты целиком (HTML). */
export function sceneHtml(room) {
    const s = roomState(room.id);
    const ph = phaseNow(), wx = wxNow();
    const items = itemsHere(room.id, s);
    const ctx = { ph, wx };
    cur = { id: room.id, s, items, surf: s.furn.map(surfaceOf).filter(Boolean) };
    if (st.sel && !(st.sel.k === 'fu' ? s.furn.some(p => p.id === st.sel.id) : items.some(it => it.id === st.sel.id))) st.sel = null;
    const flats = items.filter(it => it.doll?.flat).map(it => stickerHtml(it, st.sel?.k === 'st' && st.sel.id === it.id)).join('');
    const all = drawables(room.id, s, items).map(d => ({ ...d, ctx }));
    const rugs = all.filter(d => d.flat).map(d => pieceSvg(d.p, ctx).html).join('');
    const rest = sortDrawables(all.filter(d => !d.flat));
    const spots = freeSpots(s, 5);
    const people = peopleHere(room).map((n, i) => {
        const [x, y] = spots[i] || PP[i % PP.length];
        const [sx, sy] = P(x, y, 0);
        const av = C.avatarUrl(n);
        return { key: x + y, html: `<div class="dl-pp" style="left:${sx.toFixed(1)}px;top:${sy.toFixed(1)}px">${av ? `<img src="${esc(av)}" alt="">` : `<span>${esc(C.short(n).slice(0, 1))}</span>`}<i></i><b>${esc(C.short(n))}</b></div>` };
    });
    const parts = rest.map(d => ({ key: d.key, html: d.k === 'fu' ? pieceSvg(d.p, ctx).html : stickerHtml(d.it, st.sel?.k === 'st' && st.sel.id === d.it.id) }));
    for (const pp of people) { let i = parts.findIndex(q => q.key > pp.key); if (i < 0) i = parts.length; parts.splice(i, 0, pp); }
    const tag = [PH_RU[ph], wx === 'snow' ? 'снег' : wx === 'rain' ? 'дождь' : ''].filter(Boolean).join(' · ');
    return `<div class="dl-wrap" style="height:${SH}px">
        <div class="dl-scene ph-${ph}" style="width:${SW}px;height:${SH}px">
            ${shellSvg()}${planesHtml(s, ph)}${flats}${rugs}${parts.map(q => q.html).join('')}
            <div class="dl-light" style="background:${LIGHT[ph]}"></div>${glowsHtml(s, ph)}
        </div>
        <span class="dl-tag">${esc(tag)}${people.length ? ` · ${people.length} в комнате` : ''}</span>
    </div>`;
}

// ───────────── палец: таскать ─────────────

let drag = null;
export function mount(root) {
    const wrap = root?.querySelector?.('.dl-wrap');
    if (!wrap) return;
    const sc = wrap.querySelector('.dl-scene');
    const k = Math.min(1.7, (wrap.clientWidth || SW) / SW) || 1;
    sc.style.transform = `scale(${k})`;
    sc.dataset.k = String(k);
    wrap.style.height = `${Math.round(SH * k)}px`;
    sc.addEventListener('pointerdown', down);
    sc.addEventListener('touchmove', (e) => { if (drag) e.preventDefault(); }, { passive: false });
    sc.querySelectorAll('.dl-st.flat img').forEach(img => { if (img.complete) learnAr(img); else img.addEventListener('load', () => learnAr(img), { once: true }); });
    setTimeout(autoCut, 400);
}
function learnAr(img) {
    const it = C.itemById(img.closest('[data-id]')?.dataset.id);
    if (!it || cutSrc(it) || !img.naturalWidth) return;
    const ar = r2(img.naturalWidth / img.naturalHeight);
    if (Math.abs(num(it.ar, 1) - ar) > 0.04) { it.ar = ar; C.touch(); soon(); }
}
function soon() { if (drag) { needRender = true; return; } host?.render?.(); }
function down(e) {
    const sc = e.currentTarget;
    const el = e.target.closest?.('[data-dl]');
    if (!el || !sc.contains(el) || !cur) { if (st.sel) { st.sel = null; host?.render?.(); } return; }
    e.preventDefault();
    const k = num(sc.dataset.k, 1) || 1;
    const rect = sc.getBoundingClientRect();
    const at = (ev) => [(ev.clientX - rect.left) / k, (ev.clientY - rect.top) / k];
    const [px, py] = at(e);
    const d = { el, kind: el.dataset.dl, id: el.dataset.id, x0: e.clientX, y0: e.clientY, moved: false, at, sc };
    if (d.kind === 'fu') {
        d.p = cur.s.furn.find(q => q.id === d.id);
        if (!d.p) return;
        const T = K.FURN[d.p.t];
        if (T.wall) { const [u, z] = d.p.wall === 'L' ? unWallL(px, py) : unWallR(px, py); d.off = [u - d.p.u, z - num(d.p.z, T.z)]; }
        else { const [wx, wy] = unP(px, py, 0); d.off = [wx - d.p.x, wy - d.p.y]; }
        d.riders = [...sc.querySelectorAll('.dl-st')].filter(x => C.itemById(x.dataset.id)?.doll?.on === d.id);
    } else if (d.kind === 'st') {
        d.it = C.itemById(d.id);
        if (!d.it?.doll) return;
        const pos = d.it.doll;
        const [ax, ay] = pos.flat ? (pos.on === 'R' ? P(pos.x, 0, pos.z) : pos.on === 'L' ? P(0, pos.y, pos.z) : P(pos.x, pos.y, 0)) : P(pos.x, pos.y, pos.z);
        d.off = [px - ax, py - ay];
        d.w = el.offsetWidth; d.h = el.offsetHeight;
    } else return;
    drag = d;
    try { el.setPointerCapture(e.pointerId); } catch { /* */ }
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
}
function move(e) {
    const d = drag;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) return;
    d.moved = true;
    d.el.classList.add('drag');
    const [px, py] = d.at(e);
    if (d.kind === 'fu') moveFurn(d, px, py); else moveSticker(d, px, py);
}
function moveFurn(d, px, py) {
    const p = d.p, T = K.FURN[p.t];
    if (T.wall) {
        const w = px < OX ? 'L' : 'R';
        const [u, z] = w === 'L' ? unWallL(px, py) : unWallR(px, py);
        const nu = clamp(u - d.off[0], 0, (w === 'L' ? DEP : W) - T.len);
        const nz = clamp(z - d.off[1], -pieceBottom(T), H - pieceHeight(T));
        d.next = { wall: w, u: r2(nu), z: r2(nz) };
        if (w === p.wall) {
            const du = nu - p.u, dz = nz - num(p.z, T.z);
            const [dx, dy] = w === 'L' ? [-du * COS * KK, du * 0.5 * KK - dz * KK] : [du * COS * KK, du * 0.5 * KK - dz * KK];
            d.el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
            d.el.style.opacity = '';
            for (const r of d.riders) r.style.translate = d.el.style.translate;
        } else { d.el.style.opacity = '.4'; }
        return;
    }
    const [wx, wy] = unP(px, py, 0);
    const [fw, fd] = footprint(p);
    const nx = clamp(wx - d.off[0], 0, W - fw), ny = clamp(wy - d.off[1], 0, DEP - fd);
    d.next = { x: r2(nx), y: r2(ny) };
    const dx = nx - p.x, dy = ny - p.y;
    d.el.style.translate = `${((dx - dy) * COS * KK).toFixed(1)}px ${((dx + dy) * 0.5 * KK).toFixed(1)}px`;
    for (const r of d.riders) r.style.translate = d.el.style.translate;
}
/** Куда встанет вещь «стоя» под точкой экрана: на мебель, на пол или к стене. */
export function hitUp(ax, ay, surfaces = cur?.surf || []) {
    let best = null;
    for (const sf of surfaces) {
        const [x, y] = unP(ax, ay, sf.z);
        if (x < sf.x0 - 0.05 || x > sf.x1 + 0.05 || y < sf.y0 - 0.05 || y > sf.y1 + 0.05) continue;
        const key = sf.z + 0.001 * (sf.x1 + sf.y1);
        if (!best || key > best.key) best = { on: sf.id, x: clamp(x, sf.x0, sf.x1), y: clamp(y, sf.y0, sf.y1), z: sf.z, key };
    }
    if (best) { delete best.key; return best; }
    const [x, y] = unP(ax, ay, 0);
    if (x >= 0 && x <= W && y >= 0 && y <= DEP) return { on: 'F', x, y, z: 0 };
    if (ax >= OX) { const [wx, wz] = unWallR(ax, ay); if (wx >= 0 && wx <= W && wz >= 0 && wz <= H) return { on: 'R', x: wx, y: 0.05, z: wz }; }
    else { const [wy, wz] = unWallL(ax, ay); if (wy >= 0 && wy <= DEP && wz >= 0 && wz <= H) return { on: 'L', x: 0.05, y: wy, z: wz }; }
    return { on: 'F', x: clamp(x, 0, W), y: clamp(y, 0, DEP), z: 0 };
}
/** Куда ляжет плоская вещь (фото, постер): на стену или на пол. */
export function hitFlat(ax, ay) {
    const [x, y] = unP(ax, ay, 0);
    if (x >= 0 && x <= W && y >= 0 && y <= DEP) return { on: 'F', x, y, z: 0 };
    if (ax >= OX) { const [wx, wz] = unWallR(ax, ay); return { on: 'R', x: clamp(wx, 0.4, W - 0.4), y: 0, z: clamp(wz, 0.4, H - 0.4) }; }
    const [wy, wz] = unWallL(ax, ay);
    return { on: 'L', x: 0, y: clamp(wy, 0.4, DEP - 0.4), z: clamp(wz, 0.4, H - 0.4) };
}
function moveSticker(d, px, py) {
    const pos = d.it.doll;
    const ax = px - d.off[0], ay = py - d.off[1];
    const hit = pos.flat ? hitFlat(ax, ay) : hitUp(ax, ay);
    d.next = hit;
    if (pos.flat) d.el.style.transform = flatMatrix(hit, d.w, d.h);
    else { const [sx, sy] = P(hit.x, hit.y, hit.z); d.el.style.left = `${sx.toFixed(1)}px`; d.el.style.top = `${sy.toFixed(1)}px`; }
}
function up() {
    const d = drag;
    drag = null;
    if (!d) return;
    d.el.removeEventListener('pointermove', move);
    d.el.removeEventListener('pointerup', up);
    d.el.removeEventListener('pointercancel', up);
    if (!d.moved) {
        if (st.sel && st.sel.k === d.kind && st.sel.id === d.id && d.kind === 'st') { host?.modal?.('item', { id: d.id }); return; }
        st.sel = { k: d.kind, id: d.id };
        st.confirm = '';
        host?.render?.();
        return;
    }
    if (d.kind === 'fu' && d.next) commitFurn(d.p, d.next);
    if (d.kind === 'st' && d.next) commitSticker(d.it, d.next);
    st.sel = { k: d.kind, id: d.id };
    needRender = false;
    C.touch();
    host?.render?.();
}
const riders = (id) => (cur?.items || []).filter(it => it.doll?.on === id);
function reseat(it, p) {
    const sf = surfaceOf(p);
    if (!sf) { it.doll = { ...it.doll, on: 'F', z: 0 }; return; }
    it.doll = { ...it.doll, on: p.id, x: r2((sf.x0 + sf.x1) / 2), y: r2((sf.y0 + sf.y1) / 2), z: sf.z };
}
export function commitFurn(p, nx) {
    const T = K.FURN[p.t];
    if (T.wall) {
        const same = nx.wall === p.wall;
        const du = nx.u - p.u, dz = nx.z - num(p.z, T.z);
        Object.assign(p, nx);
        for (const it of riders(p.id)) {
            if (!same) { reseat(it, p); continue; }
            if (p.wall === 'L') it.doll.y = r2(it.doll.y + du); else it.doll.x = r2(it.doll.x + du);
            it.doll.z = r2(it.doll.z + dz);
        }
        return;
    }
    const dx = nx.x - p.x, dy = nx.y - p.y;
    p.x = nx.x; p.y = nx.y;
    for (const it of riders(p.id)) { it.doll.x = r2(it.doll.x + dx); it.doll.y = r2(it.doll.y + dy); }
}
function commitSticker(it, hit) {
    it.doll = { ...it.doll, on: hit.on, x: r2(hit.x), y: r2(hit.y), z: r2(hit.z) };
}

// ───────────── вырезать фон ─────────────

/** Заливка фона от краёв (чистая функция над RGBA): прозрачным становится однотонный фон, края мягче. */
export function floodCut(px, w, h, tol = 34) {
    const N = w * h;
    const border = [];
    for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
    for (let y = 1; y < h - 1; y++) border.push(y * w, y * w + w - 1);
    const med = (ch) => { const v = border.map(i => px[i * 4 + ch]).sort((a, b) => a - b); return v[v.length >> 1]; };
    const R0 = med(0), G0 = med(1), B0 = med(2);
    const dist = (i, r, g, b) => Math.abs(px[i * 4] - r) + Math.abs(px[i * 4 + 1] - g) + Math.abs(px[i * 4 + 2] - b);
    const seen = new Uint8Array(N);
    const q = new Int32Array(N);
    let qh = 0, qt = 0;
    for (const i of border) if (!seen[i] && dist(i, R0, G0, B0) <= tol * 3) { seen[i] = 1; q[qt++] = i; }
    while (qh < qt) {
        const i = q[qh++];
        const x = i % w, y = (i / w) | 0;
        const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
        const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
        for (const n of nb) {
            if (n < 0 || seen[n]) continue;
            const dr = dist(n, R0, G0, B0);
            if (dr <= tol * 3 || (dist(n, r, g, b) <= 18 && dr <= tol * 6)) { seen[n] = 1; q[qt++] = n; }
        }
    }
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let i = 0; i < N; i++) {
        const x = i % w, y = (i / w) | 0;
        if (seen[i]) { px[i * 4 + 3] = 0; continue; }
        if ((x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || (y > 0 && seen[i - w]) || (y < h - 1 && seen[i + w])) px[i * 4 + 3] = Math.min(px[i * 4 + 3], 170);
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return { removed: qt / N, bbox: x1 < 0 ? null : [x0, y0, x1, y1] };
}
function loadImg(src) {
    return new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => rej(new Error('картинка не загрузилась')); im.src = src; });
}
async function cutBg(src) {
    const img = await loadImg(src);
    const sc = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(8, Math.round(img.naturalWidth * sc)), h = Math.max(8, Math.round(img.naturalHeight * sc));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, w, h);
    const data = g.getImageData(0, 0, w, h);
    const res = floodCut(data.data, w, h);
    if (!res.bbox || res.removed < 0.06 || res.removed > 0.97) return null;
    g.putImageData(data, 0, 0);
    const [x0, y0, x1, y1] = res.bbox;
    const cw = x1 - x0 + 3, ch = y1 - y0 + 3;
    const out = document.createElement('canvas');
    out.width = cw; out.height = ch;
    out.getContext('2d').drawImage(cv, x0 - 1, y0 - 1, cw, ch, 0, 0, cw, ch);
    return { url: out.toDataURL('image/png'), ar: r2(cw / ch) };
}
async function uploadPng(dataUrl, prefix) {
    const cx = globalThis.SillyTavern.getContext();
    const r = await fetch('/api/images/upload', { method: 'POST', headers: cx.getRequestHeaders(), body: JSON.stringify({ image: dataUrl.split(',')[1], format: 'png', ch_name: 'life', filename: `${prefix}_${Date.now()}` }) });
    if (!r.ok) throw new Error(`таверна не сохранила картинку (${r.status})`);
    const p = String((await r.json()).path || '');
    return p.startsWith('/') ? p : `/${p}`;
}
export async function cutItem(it, quiet = false) {
    if (!it?.img) return false;
    const out = await cutBg(it.img);
    if (!out) { it.cutFail = 1; C.touch(); if (!quiet) C.toast('info', 'Фон не однотонный — вырезать не вышло, вещь останется наклейкой в рамке'); return false; }
    it.cutImg = await uploadPng(out.url, `dom_cut_${it.kind}`);
    it.cutAR = out.ar;
    it.cutFail = 0;
    if (it.doll) it.doll.cut = true;
    C.touch();
    return true;
}
let cutting = false;
async function autoCut() {
    if (cutting || C.cfg().autoCut === false || !cur) return;
    const list = cur.items.filter(it => it.img && !it.cutImg && !it.cutFail && D.kindOf(it.kind).pic === 'product' && !it.doll?.flat);
    if (!list.length) return;
    cutting = true;
    try { for (const it of list) { try { await cutItem(it, true); } catch (e) { it.cutFail = 1; console.warn('[Дом] вырезать фон', e); } } }
    finally { cutting = false; C.touch(); soon(); }
}

// ───────────── обои и пол ─────────────

async function drawTexture(kind, ask) {
    if (!C.A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    const era = C.storyYear() < 1950 ? ' Period: the 1940s.' : '';
    const prompt = kind === 'floor'
        ? `Seamless tileable floor texture: ${ask}.${era} Top-down orthographic view, flat 2D, edge to edge, evenly repeating, no perspective, no furniture, no shadows, no text.`
        : `Seamless tileable wallpaper pattern: ${ask}.${era} Flat 2D texture seen straight on, edge to edge, evenly repeating motif, no perspective, no room, no furniture, no shadows, no frame, no text, no letters.`;
    return C.A.drawPicture(prompt, { aspect: '1:1', max: 640, prefix: kind === 'floor' ? 'dom_floor' : 'dom_wall' });
}
/** Обои на стену(ы): id пресета или 'ai' + картинка. */
export function applyWall(s, target, id, img = '', ask = '') {
    if (target === 'L' && !s.wr) { s.wr = s.wl; s.wrImg = s.wlImg || ''; s.wrAsk = s.wlAsk || ''; }
    if (target === 'R') { s.wr = id; s.wrImg = img; s.wrAsk = ask; }
    else { s.wl = id; s.wlImg = img; s.wlAsk = ask; if (target === 'both') { s.wr = ''; s.wrImg = ''; s.wrAsk = ''; } }
    if (s.wr && s.wr === s.wl && (s.wrImg || '') === (s.wlImg || '')) { s.wr = ''; s.wrImg = ''; }
    C.touch();
}
export function applyFloor(s, id, img = '', ask = '') { s.fl = id; s.flImg = img; s.flAsk = ask; C.touch(); }
export async function uploadTex(el) {
    const file = el.files?.[0];
    if (!file || !cur) return;
    const kind = el.dataset.v === 'floor' ? 'floor' : 'wall';
    await host.withBusy('dltex', async () => {
        if (!C.A?.uploadImage || !C.A?.fileToJpeg) throw new Error('Загрузка картинок — через Life, а его нет');
        const path = await C.A.uploadImage(await C.A.fileToJpeg(file, 900), `dom_${kind}`);
        const s = roomState(cur.id);
        if (kind === 'floor') applyFloor(s, 'ai', path, 'своя картинка'); else applyWall(s, st.tex.target, 'ai', path, 'своя картинка');
    });
}

// ───────────── мебель: добавить, крутить ─────────────

function freeFloor(s, fw, fd, skip = '') {
    const busy = s.furn.filter(p => p.id !== skip && !K.FURN[p.t]?.wall && !K.FURN[p.t]?.flat).map(p => aabb(boxesOf(p)));
    const cands = [];
    for (let y = 0; y <= DEP - fd; y += 0.5) for (let x = 0; x <= W - fw; x += 0.5) cands.push([x, y, Math.hypot(x + fw / 2 - 5.5, y + fd / 2 - 5.5)]);
    cands.sort((a, b) => a[2] - b[2]);
    for (const [x, y] of cands) if (!busy.some(a => x < a.x1 && a.x0 < x + fw && y < a.y1 && a.y0 < y + fd)) return [x, y];
    return [clamp(5 - fw / 2, 0, W - fw), clamp(5 - fd / 2, 0, DEP - fd)];
}
function freeWall(s, T) {
    const zA = T.z + pieceBottom(T), zB = T.z + pieceHeight(T);
    for (const w of ['R', 'L']) for (let u = 0.3; u <= (w === 'R' ? W : DEP) - T.len; u += 0.5) {
        const clash = s.furn.some(p => { const Q = K.FURN[p.t]; if (!Q?.wall || p.wall !== w) return false; const z0 = num(p.z, Q.z) + pieceBottom(Q), z1 = num(p.z, Q.z) + pieceHeight(Q); return u < p.u + Q.len && p.u < u + T.len && zA < z1 && z0 < zB; });
        if (!clash) return [w, u];
    }
    return ['R', 0.3];
}
export function addPiece(s, t) {
    const T = K.FURN[t];
    if (!T) return null;
    let p;
    if (T.wall) { const [w, u] = freeWall(s, T); p = { id: C.uid(), t, wall: w, u: r2(u), z: T.z }; }
    else { const [x, y] = freeFloor(s, T.w, T.d); p = { id: C.uid(), t, x: r2(x), y: r2(y), r: 0 }; }
    s.furn.push(p);
    C.touch();
    return p;
}
export function rotatePiece(s, p) {
    const T = K.FURN[p.t];
    if (!T || T.wall) return;
    const [fw, fd] = footprint(p);
    const cx = p.x + fw / 2, cy = p.y + fd / 2;
    p.r = (num(p.r) + 1) % 4;
    const [nw, nd] = footprint(p);
    p.x = r2(clamp(cx - nw / 2, 0, W - nw));
    p.y = r2(clamp(cy - nd / 2, 0, DEP - nd));
    for (const it of riders(p.id)) reseat(it, p);
    C.touch();
}
export function dropPiece(s, p) {
    for (const it of riders(p.id)) { const a = aabb(boxesOf(p)); it.doll = { ...it.doll, on: 'F', x: r2(clamp((a.x0 + a.x1) / 2, 0, W)), y: r2(clamp(a.y1 + 0.3, 0, DEP)), z: 0 }; }
    s.furn = s.furn.filter(q => q.id !== p.id);
    if (st.sel?.id === p.id) st.sel = null;
    C.touch();
}

/** Словами — для «Картинкой»: как расставлено (обои, пол, мебель и где). */
export function describe(id) {
    const s = roomState(id);
    const wl = s.wl === 'ai' ? (s.wlAsk || 'свои обои') : K.wallById(s.wl)?.name || '';
    const wr = s.wr ? (s.wr === 'ai' ? (s.wrAsk || 'свои обои') : K.wallById(s.wr)?.name || '') : '';
    const fl = s.fl === 'ai' ? (s.flAsk || 'свой пол') : K.floorById(s.fl)?.name || '';
    const where = (p) => {
        const T = K.FURN[p.t];
        if (T.wall) return p.wall === 'L' ? 'на левой стене' : 'на правой стене';
        const a = aabb(boxesOf(p));
        const near = [];
        if (a.x0 < 0.8) near.push('у левой стены');
        if (a.y0 < 0.8) near.push('у правой стены');
        return near.length ? near.join(', ') : (a.x0 + a.x1) / 2 > 6 && (a.y0 + a.y1) / 2 > 6 ? 'ближе к зрителю' : 'посередине';
    };
    const furn = s.furn.map(p => `${K.FURN[p.t]?.name.toLowerCase()} (${where(p)})`).join('; ');
    return `стены — ${wl}${wr ? `, правая стена — ${wr}` : ''}; пол — ${fl}; мебель: ${furn || 'почти пусто'}`;
}

// ───────────── нижняя панель ─────────────

const DP = {
    minus: '<path d="M5 12h14"/>', plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12 5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    flip: '<path d="M12 3v18M8 7 3 12l5 5V7ZM16 7l5 5-5 5V7Z"/>', scissors: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.5 8.5 20 18M8.5 15.5 20 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', out: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
    rotate: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', brick: '<path d="M3 5h18v14H3zM3 10h18M3 15h18M9 5v5M15 10v5M9 15v4"/>',
    floor: '<path d="M12 4 3 9l9 5 9-5-9-5ZM3 9v6l9 5 9-5V9"/>', sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 11h4v4h12v-4h4v6H2zM5 17v2M19 17v2"/>',
    bear: '<circle cx="12" cy="13" r="6"/><circle cx="6.5" cy="7" r="2.3"/><circle cx="17.5" cy="7" r="2.3"/><path d="M10 15c1 .8 3 .8 4 0"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/>',
    stand: '<path d="M12 3v14M7 21h10M9 17h6"/>', flat: '<path d="M3 8h18v10H3zM8 8V5h8v3"/>', brush: '<path d="M14 4l6 6-8 8H6v-6Z"/><path d="M4 20c1-3 2-4 4-4"/>',
    wand: '<path d="M4 20 16 8M14 4l1.5 2.5L18 8l-2.5 1.5L14 12l-1.5-2.5L10 8l2.5-1.5Z"/>', reset: '<path d="M4 4v6h6M4.6 15A8 8 0 1 0 6 6.3L4 10"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>', leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19l7-7"/>',
    frame: '<rect x="4" y="4" width="16" height="16" rx="1"/><rect x="8" y="8" width="8" height="8"/>', lamp: '<path d="M8 3h8l3 8H5ZM12 11v8M8 21h8"/>', crib: '<path d="M4 6v14M20 6v14M4 12h16M4 18h16M8 12v6M12 12v6M16 12v6"/>',
    puzzle: '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4Z"/>',
    sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/>', upload: '<path d="M12 15V4M7 9l5-5 5 5M4 20h16"/>', palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
};
const dIc = (n) => `<svg class="dm-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${DP[n] || DP.bear}</svg>`;
const tb = (g, icon, title, extra = '') => `<button class="dl-tb" data-dm="${g}" title="${esc(title)}" aria-label="${esc(title)}" ${extra}>${dIc(icon)}</button>`;
const btn = (g, label, extra = '', cls = '') => `<button class="dm-btn ${cls}" data-dm="${g}" ${extra}>${label}</button>`;
const spin = '<span class="dm-spin"></span>';

export function barHtml(room) {
    const sel = st.sel;
    const busy = (k) => !!host?.busy?.(k);
    if (sel?.k === 'st') {
        const it = C.itemById(sel.id);
        if (it?.doll) {
            const cutBtn = it.img ? (cutSrc(it) ? tb('dlUncut', 'image', 'Вернуть фон') : tb('dlCut', 'scissors', 'Вырезать фон')) : tb('dlDraw', 'brush', 'Нарисовать');
            return `<div class="dl-bar sel"><div class="dl-bar-h"><b>${esc(C.cut(it.name, 40))}</b><small>${esc(D.kindOf(it.kind).one || '')}${busy(`item:${it.id}`) || busy('dlcut') ? ' · рисую…' : ''}</small></div>
                <div class="dl-tools">${tb('dlSmall', 'minus', 'Меньше')}${tb('dlBig', 'plus', 'Больше')}${tb('dlFlip', 'flip', 'Отразить')}${tb('dlFlat', it.doll.flat ? 'stand' : 'flat', it.doll.flat ? 'Поставить стоя' : 'Повесить на стену / положить')}${cutBtn}${tb('dlInfo', 'info', 'Карточка вещи')}${tb('dlOut', 'out', 'Убрать из комнаты')}${tb('dlSel', 'check', 'Готово')}</div></div>`;
        }
    }
    if (sel?.k === 'fu') {
        const p = cur?.s.furn.find(q => q.id === sel.id);
        const T = p && K.FURN[p.t];
        if (T) {
            const pal = (g, v) => K.PALETTE.map(c => `<button class="dl-dot${v === c ? ' on' : ''}" data-dm="${g}" data-v="${c}" style="background:${c}" aria-label="цвет"></button>`).join('');
            return `<div class="dl-bar sel"><div class="dl-bar-h"><b>${esc(T.name)}</b><small>${T.wall ? 'тащи вдоль стены — или на другую' : 'тащи по полу'}</small></div>
                <div class="dl-tools">${T.wall ? '' : tb('dlRot', 'rotate', 'Повернуть')}${tb('dlDup', 'copy', 'Ещё такой же')}${tb('dlDel', 'trash', 'Убрать')}${tb('dlSel', 'check', 'Готово')}</div>
                <div class="dl-pal">${pal('dlCol', p.col || T.col)}</div>${T.acc ? `<div class="dl-pal acc"><small>второй цвет</small>${pal('dlAcc', p.acc || T.acc)}</div>` : ''}</div>`;
        }
    }
    if (st.confirm === 'reset') {
        return `<div class="dl-bar"><div class="dl-bar-h"><b>Вернуть комнату как была по лору?</b><small>Обои, пол и мебель — заново; вещи встанут на свои места.</small></div>
            <div class="dm-actions">${btn('dlResetOk', `${dIc('reset')} Да, сбросить`, '', 'primary')}${btn('dlResetNo', 'Нет', '', 'ghost')}</div></div>`;
    }
    return `<div class="dl-bar"><div class="dl-tools room">
            ${btn('dlWallSheet', `${dIc('brick')} Обои`, '', 'sm')}${btn('dlFloorSheet', `${dIc('floor')} Пол`, '', 'sm')}${btn('dlFurnSheet', `${dIc('sofa')} Мебель`, '', 'sm')}${btn('placeHere', `${dIc('bear')} Вещь`, `data-v="${room.id}"`, 'sm')}
            ${btn('dlBeauty', busy(`room:${room.id}`) ? spin : `${dIc('wand')} Картинкой`, `data-v="${room.id}"`, 'sm')}${btn('dlReset', `${dIc('reset')}`, 'title="Сбросить комнату" aria-label="Сбросить комнату"', 'sm ghost')}
        </div><small class="dl-help">Тащи пальцем мебель и вещи — на пол, стены, полки, стол, подоконник. Тап — выбрать, ещё тап по вещи — её карточка.</small></div>`;
}

// ───────────── листы ─────────────

const ROOM_CATS = { kitchen: ['kitchen', 'table', 'seat', 'wall', 'light', 'decor'], living: ['seat', 'table', 'store', 'decor', 'light', 'wall', 'garden'], bedroom: ['sleep', 'store', 'seat', 'light', 'decor', 'wall'], nursery: ['kids', 'seat', 'store', 'light', 'decor', 'wall'], roof: ['garden', 'seat', 'table', 'light', 'decor'], gym: ['gym', 'seat', 'wall', 'light'], lab: ['lab', 'table', 'store', 'wall', 'light'], garage: ['garage', 'lab', 'wall', 'light'], shop: ['shop', 'table', 'store', 'wall', 'decor'] };
export function wallSheet(head) {
    const s = roomState(cur?.id || 'kitchen');
    const ph = phaseNow();
    const t = st.tex.target;
    const now = t === 'R' ? (s.wr || s.wl) : s.wl;
    const busy = !!host?.busy?.('dltex');
    return `<div class="dm-sheet">${head(`${dIc('brick')} Обои`)}
        <div class="dm-chips">${[['both', 'Обе стены'], ['L', 'Левая'], ['R', 'Правая']].map(([v, l]) => `<button class="dm-chip${t === v ? ' on' : ''}" data-dm="dlTarget" data-v="${v}">${l}</button>`).join('')}</div>
        <div class="dl-swatches">${K.WALLS.map(w => `<button class="dl-sw${now === w.id ? ' on' : ''}" data-dm="dlWall" data-v="${w.id}"><i style="background:${esc(w.bg(ph))}"></i><small>${esc(w.name)}</small></button>`).join('')}</div>
        <div class="dm-sec"><span>✦ Свои обои</span><em>ИИ нарисует узор</em></div>
        <label class="dm-field"><span>Какие — словами</span><input data-dmf="dl:ask" value="${esc(st.tex.ask)}" placeholder="мятные с вишенками, как в 50-х"></label>
        <div class="dm-actions">${btn('dlTexAI', busy ? spin : `${dIc('sparkles')} Нарисовать обои`, 'data-v="wall"', 'primary')}<label class="dm-btn">${dIc('upload')} Своя картинка<input type="file" accept="image/*" data-dmup="dltex" data-v="wall" hidden></label></div></div>`;
}
export function floorSheet(head) {
    const s = roomState(cur?.id || 'kitchen');
    const busy = !!host?.busy?.('dltex');
    return `<div class="dm-sheet">${head(`${dIc('floor')} Пол`)}
        <div class="dl-swatches">${K.FLOORS.map(f => `<button class="dl-sw${s.fl === f.id ? ' on' : ''}" data-dm="dlFloor" data-v="${f.id}"><i style="background:${esc(f.bg())}"></i><small>${esc(f.name)}</small></button>`).join('')}</div>
        <div class="dm-sec"><span>✦ Свой пол</span><em>ИИ нарисует</em></div>
        <label class="dm-field"><span>Какой — словами</span><input data-dmf="dl:ask" value="${esc(st.tex.ask)}" placeholder="старый дубовый паркет с царапинами от когтей Альпин"></label>
        <div class="dm-actions">${btn('dlTexAI', busy ? spin : `${dIc('sparkles')} Нарисовать пол`, 'data-v="floor"', 'primary')}<label class="dm-btn">${dIc('upload')} Своя картинка<input type="file" accept="image/*" data-dmup="dltex" data-v="floor" hidden></label></div></div>`;
}
export function furnSheet(head) {
    const id = cur?.id || 'living';
    const first = ROOM_CATS[id] || [];
    const cats = [...first, ...K.FURN_CATS.map(c => c[0]).filter(c => !first.includes(c))];
    const catName = Object.fromEntries(K.FURN_CATS);
    return `<div class="dm-sheet">${head(`${dIc('sofa')} Мебель`)}
        ${cats.map(c => { const list = Object.entries(K.FURN).filter(([, T]) => T.cat === c); return list.length ? `<div class="dm-sec"><span>${esc(catName[c] || c)}</span></div><div class="dl-cat">${list.map(([t, T]) => `<button class="dl-fcard" data-dm="dlAdd" data-v="${t}">${thumbSvg(t)}<small>${esc(T.name)}</small></button>`).join('')}</div>` : ''; }).join('')}
    </div>`;
}

// ───────────── кнопки ─────────────

export function handlers(H) {
    const s = () => roomState(cur?.id || '');
    const selIt = () => (st.sel?.k === 'st' ? C.itemById(st.sel.id) : null);
    const selP = () => (st.sel?.k === 'fu' ? s().furn.find(p => p.id === st.sel.id) : null);
    const redraw = () => { C.touch(); H.render(); };
    return {
        dlMode: (el) => { st.mode[el.dataset.room] = el.dataset.v; st.sel = null; H.render(); },
        dlSel: () => { st.sel = null; H.render(); },
        dlBig: () => { const it = selIt(); if (it?.doll) { it.doll.s = r2(clamp(num(it.doll.s, 1) * 1.2, 0.3, 3.5)); redraw(); } },
        dlSmall: () => { const it = selIt(); if (it?.doll) { it.doll.s = r2(clamp(num(it.doll.s, 1) / 1.2, 0.3, 3.5)); redraw(); } },
        dlFlip: () => { const it = selIt(); if (it?.doll) { it.doll.flip = !it.doll.flip; redraw(); } },
        dlFlat: () => {
            const it = selIt();
            if (!it?.doll) return;
            const pos = it.doll;
            if (pos.flat) { const hit = pos.on === 'F' ? { on: 'F', x: pos.x, y: pos.y, z: 0 } : { on: 'F', x: pos.on === 'R' ? pos.x : 1, y: pos.on === 'L' ? pos.y : 1, z: 0 }; it.doll = { ...pos, ...hit, flat: false }; }
            else if (pos.y <= pos.x) it.doll = { ...pos, on: 'R', x: r2(clamp(pos.x, 0.5, W - 0.5)), y: 0, z: r2(clamp(pos.z + 2.6, 1, H - 0.8)), flat: true };
            else it.doll = { ...pos, on: 'L', x: 0, y: r2(clamp(pos.y, 0.5, DEP - 0.5)), z: r2(clamp(pos.z + 2.6, 1, H - 0.8)), flat: true };
            redraw();
        },
        dlCut: () => { const it = selIt(); if (!it) return; if (it.cutImg) { it.doll.cut = true; redraw(); return; } H.withBusy('dlcut', async () => { if (await cutItem(it)) C.toast('success', 'Фон вырезан'); }); },
        dlUncut: () => { const it = selIt(); if (it?.doll) { it.doll.cut = false; redraw(); } },
        dlDraw: () => { const it = selIt(); if (it) H.withBusy(`item:${it.id}`, async () => { await C.drawItem(it); }); },
        dlInfo: () => { const it = selIt(); if (it) H.modal('item', { id: it.id }); },
        dlOut: () => { const it = selIt(); if (!it) return; C.setItem(it.id, { room: '', spot: '' }); delete it.doll; st.sel = null; C.toast('info', `${it.name} — убрано, лежит в «Вещах»`); H.render(); },
        dlRot: () => { const p = selP(); if (p) { rotatePiece(s(), p); H.render(); } },
        dlDup: () => { const p = selP(); if (!p) return; const n = addPiece(s(), p.t); if (n) { n.col = p.col; n.acc = p.acc; if (!K.FURN[p.t].wall) n.r = p.r; st.sel = { k: 'fu', id: n.id }; redraw(); } },
        dlDel: () => { const p = selP(); if (p) { dropPiece(s(), p); H.render(); } },
        dlCol: (el) => { const p = selP(); if (p) { p.col = el.dataset.v; redraw(); } },
        dlAcc: (el) => { const p = selP(); if (p) { p.acc = el.dataset.v; redraw(); } },
        dlWallSheet: () => H.modal('dlWall'),
        dlFloorSheet: () => H.modal('dlFloor'),
        dlFurnSheet: () => H.modal('dlFurn'),
        dlAdd: (el) => { const p = addPiece(s(), el.dataset.v); if (p) { st.sel = { k: 'fu', id: p.id }; C.toast('success', `${K.FURN[p.t].name} — в комнате, тащи куда надо`); H.closeModal(); } },
        dlTarget: (el) => { st.tex.target = el.dataset.v; H.paintModal(); },
        dlWall: (el) => { applyWall(s(), st.tex.target, el.dataset.v); H.paintModal(); H.render(); },
        dlFloor: (el) => { applyFloor(s(), el.dataset.v); H.paintModal(); H.render(); },
        dlTexAI: (el) => {
            const kind = el.dataset.v === 'floor' ? 'floor' : 'wall';
            const ask = st.tex.ask.trim();
            if (!ask) { C.toast('info', kind === 'floor' ? 'Опиши словами, какой пол' : 'Опиши словами, какие обои'); return; }
            H.withBusy('dltex', async () => {
                const path = await drawTexture(kind, ask);
                if (kind === 'floor') applyFloor(s(), 'ai', path, ask); else applyWall(s(), st.tex.target, 'ai', path, ask);
                C.toast('success', kind === 'floor' ? 'Пол готов' : 'Обои готовы');
            });
        },
        dlReset: () => { st.confirm = 'reset'; st.sel = null; H.render(); },
        dlResetNo: () => { st.confirm = ''; H.render(); },
        dlResetOk: () => { if (cur) resetRoom(cur.id); C.toast('success', 'Комната — как по лору'); H.render(); },
        dlBeauty: (el) => {
            const r = D.roomById(el.dataset.v);
            if (!r) return;
            H.withBusy(`room:${r.id}`, async () => { await C.drawRoom(r, { withItems: C.placedIn(r.id).some(x => x.img), doll: describe(r.id) }); st.mode[r.id] = 'pic'; C.toast('success', `${r.name} — нарисована, как расставили`); });
        },
    };
}
export function onField(f, v) { if (f === 'dl:ask') st.tex.ask = v; }
export function mode(id) { return st.mode[id] || 'doll'; }
export const _test = { st, setCur: (c) => { cur = c; }, KK, OX, OY };
