// ✦ Дом — сезонный декор и свет по времени на картинках комнат.
// Декор: по дате истории (праздники — из Life, те же даты, что видит модель) дом сам украшается в кукольном домике —
// ёлка, гирлянды, тыквы, сердечки, флажки; кончился праздник — убирается. Убранное руками в этот сезон не вернётся.
// Картинки комнат: у каждой — варианты «как сейчас» (вечер, ночь, праздник), дорисованные по ней же; пока варианта нет —
// картинку подкрашивает свет времени суток.

import * as C from './core.js';
import * as D from './data.js';

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** Праздники и сезоны. decor: роль комнаты → мебель (t или t:вариант цвета). */
export const SEASONS = {
    xmas: { name: 'Рождество и Новый год', ico: '🎄', decor: { main: ['xtree', 'gifts', 'garland'], kitchen: ['wreath'], bed: ['garland'] },
        pic: 'decorated for Christmas and New Year: a small decorated tree with lights, string lights, a wreath, wrapped gifts',
        pic40: 'decorated for Christmas the way soldiers do at the front: a small fir tree hung with spent cartridge casings, ration-tin lids and foil, a few candles',
        line: 'дом украшен к Рождеству и Новому году: ёлка в огоньках, гирлянды, венок, подарки', line40: 'палатка украшена к Рождеству по-фронтовому: пихта с гильзами и фольгой от пайков, свечи' },
    halloween: { name: 'Хэллоуин', ico: '🎃', decor: { main: ['pumpkins'], kitchen: ['pumpkins'] },
        pic: "decorated for Halloween: carved jack-o'-lanterns with candles inside, autumn leaves", line: 'к Хэллоуину: тыквы с вырезанными рожицами, свечи внутри' },
    thanks: { name: 'День благодарения', ico: '🦃', decor: { kitchen: ['pumpkins', 'wreath:autumn'], main: ['vase:autumn'] },
        pic: 'Thanksgiving: pumpkins, an autumn wreath, a pie cooling on the table, autumn leaves', line: 'День благодарения: тыквы, осенний венок, пахнет пирогом' },
    valentine: { name: 'День святого Валентина', ico: '💘', decor: { main: ['hearts', 'vase:rose'], bed: ['hearts'] },
        pic: "a garland of paper hearts and red roses in a vase for Valentine's Day", line: 'ко Дню святого Валентина: гирлянда из сердечек, розы в вазе' },
    july4: { name: 'День независимости', ico: '🎆', decor: { main: ['bunting'] },
        pic: 'red-white-blue bunting and small flags for the Fourth of July', line: '4 июля: флажки и гирлянда в цветах флага' },
    easter: { name: 'Пасха', ico: '🐣', decor: { main: ['vase:spring'], kitchen: ['vase:spring'] },
        pic: 'Easter: painted eggs in a bowl and spring flowers', line: 'Пасха: крашеные яйца, весенние цветы' },
    bday: { name: 'День рождения', ico: '🎈', decor: { main: ['balloons', 'gifts'] },
        pic: 'a birthday: balloons, a cake and wrapped gifts', line: 'день рождения: шарики, подарки, торт' },
    spring: { name: 'Весна', ico: '🌷', decor: { main: ['vase:spring'] }, pic: 'fresh spring flowers in a vase', line: 'весна: свежие цветы в вазе' },
    autumn: { name: 'Осень', ico: '🍂', decor: { main: ['vase:autumn'] }, pic: 'autumn branches with yellow and red leaves in a vase', line: 'осень: ветки с жёлтыми листьями в вазе' },
};
/** Цвета вариантов: ваза осенью, розы, весенние цветы, осенний венок. */
const TINT = { autumn: { acc: '#c8702e' }, rose: { acc: '#b8323a' }, spring: { acc: '#f3b6c8' } };
const TINT_BY = { wreath: { autumn: { col: '#b5652e', acc: '#e9c46a' } } };

/** Какие комнаты эпохи — «главная», «кухня», «спальня» для декора. */
const ROLES = {
    '2024': { main: ['living'], kitchen: ['kitchen'], bed: ['bedroom'] },
    '1943': { main: ['tent'] },
    '2013': { main: ['hk_room'] },
    '2014': { main: ['bk_room'], kitchen: ['bk_kitchen'] },
    '2017': { main: ['trailer', 'cabin'], kitchen: ['galley'] },
    '2018': { main: ['n_living', 'cabin'], kitchen: ['n_kitchen', 'galley'], bed: ['n_hedy'] },
};

/** Даты праздников года: из Life (те же, что у модели), без Life — свои. */
function holidayDates(y) {
    try { const h = C.A?.season?.holidays?.(y); if (Array.isArray(h) && h.length) return Object.fromEntries(h.map(([id, , date]) => [id, date])); } catch { /* */ }
    const nth = (m, wd, n) => { const d = new Date(y, m, 1); return new Date(y, m, 1 + ((wd - d.getDay() + 7) % 7) + (n - 1) * 7); };
    return { valentine: new Date(y, 1, 14), july4: new Date(y, 6, 4), halloween: new Date(y, 9, 31), thanks: nth(10, 4, 4), xmas: new Date(y, 11, 25) };
}
function bdayToday(day) {
    try { const e = (C.A?.cal?.between?.(day, day) || []).find(x => x?.kind === 'birthday'); if (e) return e; } catch { /* */ }
    return null;
}

/** Сезон дома на дату: { id, key, name, ico, decor, pic, line } или null. */
export function seasonNow(day = C.storyDay()) {
    const d0 = /^\d{4}-\d{2}-\d{2}/.test(String(day || '')) ? new Date(`${day.slice(0, 10)}T12:00:00`) : null;
    if (!d0 || isNaN(d0)) return null;
    const y = d0.getFullYear();
    const md = day.slice(5, 10);
    const mk = (id, key, extra = {}) => ({ id, key: `${id}:${key}`, ...SEASONS[id], ...extra });
    const bd = bdayToday(day.slice(0, 10));
    if (bd) return mk('bday', day.slice(0, 10), { who: Array.isArray(bd.who) ? bd.who.join(', ') : String(bd.who || ''), line: `${SEASONS.bday.line}${bd.t ? ` — ${bd.t}` : ''}` });
    if (md >= '12-01' || md <= '01-07') return mk('xmas', md >= '12-01' ? y : y - 1);
    const H = holidayDates(y);
    const near = (id, before, after) => { const h = H[id]; if (!h) return false; const a = ymd(addDays(h, -before)), b = ymd(addDays(h, after)); const t = day.slice(0, 10); return t >= a && t <= b; };
    if (near('thanks', 4, 2)) return mk('thanks', y);
    if (near('halloween', 16, 0)) return mk('halloween', y);
    if (near('valentine', 6, 0)) return mk('valentine', y);
    if (near('july4', 4, 1)) return mk('july4', y);
    if (near('easter', 3, 1)) return mk('easter', y);
    if (md >= '03-15' && md <= '05-31') return mk('spring', y);
    if (md >= '09-15' && md <= '11-30') return mk('autumn', y);
    return null;
}
/** Праздник — то, что видно (не просто «осень»). */
export const isFest = (sn) => !!sn && !['spring', 'autumn'].includes(sn.id);
const is40 = () => C.storyYear() < 1950;
export const seasonLine = (sn) => (is40() && sn.line40) || sn.line;
export const seasonPic = (sn) => (is40() && sn.pic40) || sn.pic;
export const decorOn = () => C.cfg().season !== 'off';

/** Мебель сезона для комнаты: ['xtree', 'vase:autumn', …]. */
export function piecesFor(roomId, sn) {
    if (!sn?.decor) return [];
    const roles = ROLES[D.home().id] || {};
    const out = [];
    for (const [role, list] of Object.entries(sn.decor)) if ((roles[role] || []).includes(roomId)) out.push(...list);
    return out;
}
/** Украсить комнату кукольного домика под сезон (зовёт doll.roomState). add — его addPiece. */
export function applyDecor(roomId, s, add) {
    const sn = decorOn() ? seasonNow() : null;
    const key = sn?.key || '';
    if ((s.sz || '') === key && (key || !(s.furn || []).some(p => p.sz))) return false;
    s.furn = (s.furn || []).filter(p => !p.sz);
    s.sz = key;
    for (const spec of piecesFor(roomId, sn)) {
        const [t, v] = spec.split(':');
        const p = add(s, t);
        if (!p) continue;
        p.sz = key;
        const tint = (v && (TINT_BY[t]?.[v] || TINT[v])) || null;
        if (tint) Object.assign(p, tint);
    }
    C.touch();
    return true;
}
/** Что сейчас украшено (для модели и карточки на главной). */
export function decorLine() {
    const sn = seasonNow();
    if (!sn || !decorOn() || !isFest(sn)) return '';
    return seasonLine(sn);
}

// ───────────── свет и праздник на картинках комнат ─────────────

export function lightOf(time) {
    const m = String(time || '').match(/(\d{1,2})[:.](\d{2})/);
    const h = m ? Number(m[1]) : 12;
    if (h >= 22 || h < 5) return 'night';
    if (h >= 17) return 'evening';
    return 'day';
}
export const lightNow = () => lightOf(C.clock().time);
export const LIGHT_RU = { day: 'день', evening: 'вечер', night: 'ночь' };
const rec = (id) => C.M().rooms[`${id}:${C.eraKey()}`] || null;
/** Ключ варианта «как сейчас»: праздник|свет. */
export function nowKey() { const sn = seasonNow(); return `${isFest(sn) ? sn.id : ''}|${lightNow()}`; }
/** Картинка комнаты для показа: лучший вариант под сейчас + чем подкрасить, если точного нет. */
export function roomPic(id) {
    const r = rec(id);
    if (!r?.img) return { img: '', tint: '', exact: false, key: nowKey() };
    const v = r.v || {};
    const key = nowKey();
    const [s, l] = key.split('|');
    const pick = v[key] ? key : (s && v[`${s}|day`]) ? `${s}|day` : v[`|${l}`] ? `|${l}` : '';
    const got = pick ? pick.split('|')[1] : 'day';
    return { img: pick ? v[pick] : r.img, tint: got === l || l === 'day' ? '' : l, exact: pick === key || (key === '|day'), key, has: Object.keys(v) };
}
const SHIP = new Set(['cabin', 'galley', 'sbridge', 'hold', 'slab']);
function lightText(room, l) {
    if (l === 'day') return 'soft natural daylight';
    if (SHIP.has(room.id)) return l === 'night' ? 'the night cycle on board: main lights dimmed, only screen glow and small lamps, deep blue shadows' : 'the evening cycle on board: warmer, dimmer lights';
    if (room.id === 'tent' || room.id === 'workshop40' || room.id === 'depot40') return l === 'night' ? 'night: darkness outside the canvas, only the kerosene lamp and the glow of the stove' : 'evening: the kerosene lamp is lit, warm glow on the canvas, blue dusk at the tent flap';
    return l === 'night' ? 'late night: dark windows, only lamps and string lights on, cosy pools of warm light, deep blue shadows' : 'warm golden evening light, lamps switched on, long soft shadows';
}
/** Дорисовать вариант «как сейчас» по картинке комнаты: свет, праздник — всё остальное как есть. */
export async function drawNow(room) {
    const r = rec(room.id);
    if (!r?.img) throw new Error('Сначала нарисуй комнату');
    if (!C.A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    const key = nowKey();
    const [s, l] = key.split('|');
    const ref = await C.ref(r.img, 1280);
    if (!ref) throw new Error('Не вышло взять картинку комнаты за образец');
    const sn = s ? seasonNow() : null;
    const change = [lightText(room, l), sn ? seasonPic(sn) : ''].filter(Boolean).join('; ');
    const prompt = `Keep this exact room from reference 1: the same layout, furniture, objects, camera angle, proportions and art style. Change only this: ${change}. No people, no text.
Style: ${C.artStyle()}. Wide composition.`;
    const img = await C.A.drawPicture(prompt, { aspect: '4:3', max: 1400, refs: [ref], prefix: 'dom_room_now' });
    r.v = { ...(r.v || {}), [key]: img };
    C.touch();
    return img;
}
/** Подпись «как сейчас» для картинки: «вечер · 🎄». */
export function nowTag() { const sn = seasonNow(); return [LIGHT_RU[lightNow()], isFest(sn) ? sn.ico : ''].filter(Boolean).join(' · '); }
