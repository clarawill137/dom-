// ✦ Дом — стена роста: отметки карандашом на дверном косяке кухни. Сначала Морган (единокровная сестра Хеди:
// по лору около шести в конце 2024-го, зовёт Баки «динозавром»), потом малышка из Зёрнышка — её рост Дом берёт
// из Зёрнышка (ВОЗ, по её генам). Рост по возрасту подсказывается медианой ВОЗ — правится руками.
// Подписи — почерком того, кто отмечал (почерк из Life).

import * as C from './core.js';
import * as D from './data.js';

const esc = (v) => C.esc(v);
export const can = () => !!D.home().growth;
export function G() {
    const m = C.M();
    if (!m.growth || typeof m.growth !== 'object') m.growth = {};
    const g = m.growth;
    if (!Array.isArray(g.marks)) g.marks = [];
    if (!Array.isArray(g.kids)) g.kids = [{ id: 'morgan', name: 'Морган', born: '2018-06', sex: 'F' }];
    return g;
}

// ───────────── рост по возрасту (медианы ВОЗ, см) ─────────────

const WHO_H = {
    F: [[1, 74.0], [1.5, 80.7], [2, 85.7], [3, 95.1], [4, 102.7], [5, 109.4], [6, 115.1], [7, 120.8], [8, 126.6], [9, 132.5], [10, 138.6], [11, 144.9], [12, 151.2], [13, 156.4], [14, 159.8], [15, 161.7], [16, 162.5], [18, 163.1]],
    M: [[1, 75.7], [1.5, 82.3], [2, 87.1], [3, 96.1], [4, 103.3], [5, 110.0], [6, 116.0], [7, 121.7], [8, 127.3], [9, 132.6], [10, 137.8], [11, 143.1], [12, 149.1], [13, 156.0], [14, 163.2], [15, 169.0], [16, 172.9], [18, 176.1]],
};
export function medianAt(sex, years) {
    const t = WHO_H[sex === 'M' ? 'M' : 'F'];
    if (!(years > 0)) return 0;
    if (years <= t[0][0]) return Math.round(t[0][1] * (0.66 + 0.34 * years / t[0][0]));
    for (let i = 1; i < t.length; i++) if (years <= t[i][0]) { const [a, va] = t[i - 1], [b, vb] = t[i]; return Math.round(va + (vb - va) * (years - a) / (b - a)); }
    return Math.round(t[t.length - 1][1]);
}
export function yearsOf(born, day = C.storyDay()) {
    if (!/^\d{4}-\d{2}/.test(String(born || '')) || !day) return 0;
    const b = Date.parse(`${String(born).length === 7 ? `${born}-15` : String(born).slice(0, 10)}T12:00:00`);
    const d = Date.parse(`${String(day).slice(0, 10)}T12:00:00`);
    return Math.max(0, (d - b) / (365.25 * 864e5));
}

// ───────────── малыши из Зёрнышка ─────────────

let zr = null;
let zrLoad = null;
/** Тот же экземпляр модулей, что у самого Зёрнышка (как у Клиники): kids, kidName, age, growthNow. */
export function loadZr() {
    if (zr || zrLoad) return zrLoad || Promise.resolve(zr);
    zrLoad = import(new URL('../zernyshko/engine.js', import.meta.url).href).then(m => { zr = typeof m.kids === 'function' ? m : null; return zr; }).catch(() => { zr = null; return null; });
    return zrLoad;
}
export function _setZr(m) { zr = m; zrLoad = Promise.resolve(m); }
/** Рождённые дети Зёрнышка: [{ id, name, months, cm, sex }]. */
export function zrKids() {
    if (!zr) return [];
    try {
        return zr.kids().filter(k => k?.birth?.at && k.stage !== 'preg').map(k => {
            const ag = zr.age?.(k);
            const gr = zr.growthNow?.(k);
            return { id: `zr:${k.id}`, name: zr.kidName?.(k) || k.name || 'малышка', months: ag?.months || 0, cm: gr?.l ? Math.round(gr.l * 10) / 10 : 0, sex: k.genes?.sex?.v || 'F', zr: true };
        });
    } catch (e) { console.warn('[Дом] рост из Зёрнышка', e); return []; }
}
/** Кого меряем: Морган и свои + дети из Зёрнышка. */
export function people() {
    const own = G().kids.map(k => ({ ...k, years: yearsOf(k.born) }));
    return [...own, ...zrKids()];
}
export const personById = (id) => people().find(p => p.id === id) || null;
/** Подсказка роста: из Зёрнышка — как есть, иначе медиана ВОЗ по возрасту. */
export function suggest(p) {
    if (!p) return 0;
    if (p.zr) return p.cm || 0;
    return medianAt(p.sex, yearsOf(p.born));
}

// ───────────── отметки ─────────────

export function mark({ kid, cm, day = C.storyDay() || '', by = '', note = '', src = 'me' } = {}) {
    const p = personById(kid);
    const v = Math.round(Number(cm) * 10) / 10;
    if (!p || !(v > 30 && v < 230)) return null;
    const x = { id: C.uid(), kid: p.id, who: p.name, cm: v, day: C.str(day).slice(0, 10), by: C.canon(by) || '', note: C.cut(C.str(note), 140), src, lying: !!(p.zr && p.months < 12) };
    G().marks.push(x);
    G().marks.sort((a, b) => String(a.day).localeCompare(String(b.day)));
    C.touch();
    try { C.A?.updatePrompt?.(); } catch { /* */ }
    return x;
}
export function delMark(id) { const g = G(); g.marks = g.marks.filter(x => x.id !== id); C.touch(); }
export function addKid({ name, born, sex = 'F' }) {
    name = C.cut(C.str(name), 40);
    if (!name) return null;
    const k = { id: C.uid(), name, born: /^\d{4}-\d{2}/.test(C.str(born)) ? C.str(born).slice(0, 10) : '', sex: sex === 'M' ? 'M' : 'F' };
    G().kids.push(k);
    C.touch();
    return k;
}
const marksOf = (kid) => G().marks.filter(x => x.kid === kid);
/** Сколько прибавил с прошлой отметки: «+3 см за 4 мес». */
export function delta(x) {
    const list = marksOf(x.kid);
    const i = list.findIndex(y => y.id === x.id);
    const prev = i > 0 ? list[i - 1] : null;
    if (!prev) return '';
    const cm = Math.round((x.cm - prev.cm) * 10) / 10;
    const mo = x.day && prev.day ? Math.max(0, Math.round((Date.parse(x.day) - Date.parse(prev.day)) / (30.4 * 864e5))) : 0;
    return `${cm >= 0 ? '+' : ''}${cm} см${mo ? ` за ${mo} мес` : ''}`;
}
export function toScene(id) {
    const x = G().marks.find(y => y.id === id);
    if (!x) return false;
    const d = delta(x);
    const dino = /морган/i.test(x.who) && /баки|bucky/i.test(x.by) ? ' Морган, конечно, требовала, чтобы мерил «динозавр».' : '';
    C.shot(`grow:${x.id}`, `[Стена роста: на дверном косяке кухни новая карандашная отметка — ${x.who}, ${x.cm} см${d ? ` (${d})` : ''}${x.by ? `, отметил${/хеди|наташ|пеппер/i.test(x.by) ? 'а' : ''} ${C.short(x.by)}` : ''}.${dino} Пусть к месту — мелочью, тепло.]`);
    return true;
}

// ───────────── модели ─────────────

export function notes() {
    if (!can()) return [];
    const last = new Map();
    for (const x of G().marks) last.set(x.kid, x);
    const l = [...last.values()].slice(-2);
    return l.length ? [`на дверном косяке кухни — отметки роста: ${l.map(x => `${x.who} — ${x.cm} см${x.day ? ` (${C.dmy(x.day)})` : ''}`).join(', ')}`] : [];
}

// ───────────── экран ─────────────

function yearsWord(n) { const x = Math.abs(n) % 100, y = x % 10; return `${n} ${x > 10 && x < 20 ? 'лет' : y === 1 ? 'год' : y > 1 && y < 5 ? 'года' : 'лет'}`; }
const COLORS = ['#e0506a', '#3f7fbf', '#c9a227', '#5a9a5a', '#9b6bb0', '#d9783a'];
const handCls = (who) => { try { const h = C.A?.hand?.(who); return h ? `lf-hand lf-hand-${h[2]}` : ''; } catch { return ''; } };
/** Косяк с отметками: шкала по росту отметок. */
export function frameHtml({ compact = false } = {}) {
    const marks = G().marks;
    const ids = [...new Set([...G().kids.map(k => k.id), ...marks.map(x => x.kid)])];
    const col = (kid) => COLORS[Math.max(0, ids.indexOf(kid)) % COLORS.length];
    const vals = marks.map(x => x.cm);
    const lo = Math.max(30, Math.floor(((vals.length ? Math.min(...vals) : 90) - 12) / 10) * 10);
    const hi = Math.max(lo + 60, Math.ceil(((vals.length ? Math.max(...vals) : 120) + 14) / 10) * 10);
    const pct = (cm) => Math.max(0, Math.min(100, (cm - lo) / (hi - lo) * 100));
    const ticks = [];
    for (let v = lo; v <= hi; v += 10) ticks.push(`<i class="dm-tick" style="bottom:${pct(v)}%"><span>${v}</span></i>`);
    const shown = compact ? marks.slice(-6) : marks;
    const tag = compact ? 'span' : 'button';
    const ms = shown.map((x, i) => `<${tag} class="dm-mark ${handCls(x.by)}"${compact ? '' : ` data-dm="growMark" data-v="${x.id}"`} style="bottom:${pct(x.cm)}%;--mc:${col(x.kid)};--off:${(i % 2) * 8}px"><i></i><b>${esc(x.who)}</b> <span>${x.cm}${x.lying ? ' (лёжа)' : ''}</span><small>${esc(x.day ? C.dmy(x.day, true) : '')}</small></${tag}>`).join('');
    return `<div class="dm-door${compact ? ' compact' : ''}"><div class="dm-door-jamb">${ticks.join('')}${ms}</div>${marks.length ? '' : '<div class="dm-door-empty">Пока ни одной отметки. Морган точно потребует первую.</div>'}</div>`;
}
export function sheet(h) {
    const { head, btn, ic, ui, sec } = h;
    const ps = people();
    const sel = ui.grow?.kid && personById(ui.grow.kid) ? personById(ui.grow.kid) : ps[0];
    const sug = suggest(sel);
    const cast = C.cast();
    const by = ui.grow?.by || cast.find(n => /баки|bucky/i.test(n)) || C.userName();
    const cm = ui.grow?.cm ?? '';
    const last = sel ? marksOf(sel.id).slice(-1)[0] : null;
    return `<div class="dm-sheet">${head(`${ic('ruler')} Стена роста`)}
        <div class="dm-hint">Карандашные отметки на дверном косяке кухни. Подпись — почерком того, кто отметил.</div>
        ${frameHtml()}
        ${sec('Новая отметка')}
        <div class="dm-lbl">Кого</div><div class="dm-chips">${ps.map(p => `<button class="dm-chip${sel?.id === p.id ? ' on' : ''}" data-dm="growKid" data-v="${esc(p.id)}">${esc(p.name)}${p.zr ? ' · Зёрнышко' : ''}</button>`).join('')}${btn('growNewKid', ic('plus'), 'title="Ещё кого-то"', 'ico sm ghost')}</div>
        ${sel ? `<div class="dm-hint sm">${sel.zr ? `Из Зёрнышка: ${sel.cm ? `${sel.cm} см` : 'рост пока не известен'}${sel.months < 12 ? ' — пока меряют лёжа, на руках' : ''}.` : `${yearsWord(Math.floor(yearsOf(sel.born)))} · по возрасту (ВОЗ) ≈ ${sug} см`}${last ? ` · прошлая отметка: ${last.cm} см${last.day ? `, ${C.dmy(last.day)}` : ''}` : ''}</div>` : ''}
        <div class="dm-grid2"><label class="dm-field"><span>Рост, см</span><input type="number" step="0.5" inputmode="decimal" data-dmf="grow:cm" value="${esc(cm)}" placeholder="${sug || ''}"></label>
            <label class="dm-field"><span>Кто отмечает</span><select data-dmf="grow:by">${cast.map(n => `<option value="${esc(n)}" ${C.same(n, by) ? 'selected' : ''}>${esc(C.short(n))}</option>`).join('')}</select></label></div>
        <label class="dm-field"><span>Пометка (необязательно)</span><input data-dmf="grow:note" value="${esc(ui.grow?.note || '')}" placeholder="встала на цыпочки — не считается"></label>
        <div class="dm-actions">${btn('growAdd', `${ic('check')} Отметить`, '', 'primary wide')}</div>
    </div>`;
}
export function markSheet(h, id) {
    const { head, btn, ic } = h;
    const x = G().marks.find(y => y.id === id);
    if (!x) return `<div class="dm-sheet">${head('Отметка')}<div class="dm-empty">Её стёрли.</div></div>`;
    return `<div class="dm-sheet">${head(`${ic('ruler')} ${esc(x.who)} — ${x.cm} см`)}
        <div class="dm-bigcard"><p class="${handCls(x.by)}">${esc(x.who)} · ${x.cm} см${x.day ? ` · ${esc(C.dmy(x.day))}` : ''}</p>${delta(x) ? `<small>${esc(delta(x))}</small>` : ''}${x.note ? `<p class="dm-hint">${esc(x.note)}</p>` : ''}${x.by ? `<small>отметил${/хеди|наташ|пеппер/i.test(x.by) ? 'а' : ''}: ${esc(C.short(x.by))}</small>` : ''}</div>
        <div class="dm-actions">${btn('growScene', `${ic('send')} В сцену`, `data-v="${x.id}"`, 'primary')}${btn('growDel', `${ic('x')} Стереть`, `data-v="${x.id}"`, 'ghost danger')}</div>
    </div>`;
}
