// ✦ Дом — список дел по дому: повесить полки, починить кран, смазать петли. Берётся — кубик d20 + то, что умеет
// тот, кто взялся (у Баки суперсила и руки снайпера, но техника века — беда; у Хеди техника — +5, а полку она
// повесит криво). Как прошло — пишет модель коротко и тепло; удалось — вещь встаёт в кукольный домик (полка, лампа,
// зеркало), вышло боком — новое дело в список. Модель знает, что в списке, — и сам Баки может взяться к месту.

import * as C from './core.js';
import * as D from './data.js';

const esc = (v) => C.esc(v);
export function list() { const m = C.M(); if (!Array.isArray(m.chores)) m.chores = []; return m.chores; }
const live = (x) => (!x.post || C.liveKeys().has(x.post)) && (!x.home || x.home === D.home().id);
export const all = () => list().filter(live);
export const open = () => all().filter(x => x.st !== 'done');
export const cfgOf = () => D.home().chores || { title: 'Дела по дому', who: '', place: 'по дому' };

/** Что за дело — по словам. */
export const CATS = [
    ['tech', 'техника', /розетк|проводк|электрич|wi-?fi|вай-?фай|роутер|умн[аоы]|приложени|телевиз|пульт|ноутбук|компьютер|сигнализац|датчик|генератор|рация|радио|антенн|принтер|зарядк/i],
    ['heavy', 'тяжёлое', /шкаф|диван|холодильник|передвин|поднят|занест|затащ|мебел|собрат|кроват|стеллаж|ванн|дров|колот|копат|окоп|матрас|ящик/i],
    ['fine', 'тонкое', /кран|смесител|петл|замок|ручк|механизм|часы|скрип|смазат|протечк|труб|слив|засор|унитаз|душ|молни/i],
    ['wood', 'столярное', /полк|рам[ау]|доск|карниз|табурет|стол(?![а-яё]*ов)|забор|гвозд|молоток|дерев|стул|ступен/i],
    ['neat', 'ровно', /повесит|картин|ровно|штор|гирлянд|фото|зеркал|рамк/i],
    ['clean', 'уборка', /убрат|уборк|помыт|постират|пылесос|хлам|мусор|полит|разобрат|протерет/i],
];
export function catOf(t) { for (const [id, , re] of CATS) if (re.test(String(t || ''))) return id; return 'other'; }
/** Кто что умеет: модификаторы к d20 по виду дела. */
export const SKILL = {
    'Баки': { tech: -4, heavy: 3, fine: 2, wood: 1, neat: 2, clean: 1, why: { tech: 'технику века он догоняет', heavy: 'суперсолдат', fine: 'руки снайпера', neat: 'глаз снайпера — всё ровно' } },
    'Хеди': { tech: 5, heavy: 1, fine: 2, wood: -1, neat: -2, clean: -3, why: { tech: 'гений', neat: '«и так сойдёт»', clean: 'бардак — это система' } },
    'Наташа': { tech: 1, fine: 2, wood: 1, neat: 3, clean: 2, why: { neat: 'Наташа всё делает идеально' } },
    'Стив': { tech: -2, heavy: 3, fine: 1, wood: 3, neat: 1, clean: 1, why: { wood: 'руки художника и бруклинского парня', tech: 'технику века он догоняет' } },
    'Локи': { tech: 2, heavy: 2, fine: 2, wood: 2, neat: 2, clean: 2, why: { other: 'магия — если не подведёт' } },
};
const skillOf = (who) => { for (const [n, s] of Object.entries(SKILL)) if (C.same(who, n) || new RegExp(n, 'i').test(String(who || ''))) return s; return null; };
/** Рука Баки снята или повреждена (трекер руки Life) — тяжёлое и тонкое хуже. */
function armPenalty(who) {
    try {
        const ev = (C.A?.chatMeta?.()?.arm?.hand || []).filter(h => C.same(h.who, who)).sort((a, b) => a.mes - b.mes).pop();
        if (ev && ['off', 'broken', 'service', 'glitch'].includes(ev.st)) return ev.st === 'glitch' ? -1 : -3;
    } catch { /* */ }
    return 0;
}
export function modOf(task, who, help = '') {
    const cat = task.cat || catOf(task.t);
    const s = skillOf(who) || {};
    let mod = s[cat] || 0;
    const why = [];
    if (s[cat]) why.push(`${s[cat] > 0 ? '+' : ''}${s[cat]} ${s.why?.[cat] || CATS.find(c => c[0] === cat)?.[1] || ''}`.trim());
    if (/баки|bucky/i.test(who) && ['heavy', 'fine', 'wood'].includes(cat)) { const a = armPenalty(who); if (a) { mod += a; why.push(`${a} без руки`); } }
    if (help) {
        const h = skillOf(help) || {};
        const plus = (h[cat] || 0) >= 2 ? 2 : (h[cat] || 0) < 0 ? -1 : 1;
        mod += plus;
        why.push(`${plus > 0 ? '+' : ''}${plus} помогает ${C.short(help)}${plus < 0 ? ' (больше отвлекает)' : ''}`);
    }
    return { mod: Math.max(-6, Math.min(8, mod)), why, cat };
}
/** Исход: 1 — катастрофа, ≤6 — не вышло, ≤12 — криво, но сделано, ≤18 — хорошо, 20 или ≥22 — идеально. */
export function tierOf(roll, total, who = '') {
    if (roll === 1 || (/локи|loki/i.test(who) && roll <= 3)) return 'disaster';
    if (roll === 20 || total >= 22) return 'perfect';
    if (total <= 6) return 'fail';
    if (total <= 12) return 'meh';
    return 'good';
}
export const TIER_RU = { disaster: 'катастрофа', fail: 'не вышло', meh: 'сделано, но криво', good: 'хорошо', perfect: 'идеально' };
/** Она или он — для слов «взялся / взялась». */
export const fem = (who) => /хеди|наташ|марик|пеппер|елен|ванд|морган|мэй|hedy|natasha/i.test(String(who || ''));
const g = (who, m, f) => (fem(who) ? f : m);
const FALLBACK = {
    disaster: (w, t) => `${w} ${g(w, 'взялся', 'взялась')} за «${t}» — и теперь в доме на одно дело больше. Никто не пострадал, кроме гордости.`,
    fail: (w, t) => `«${t}» не далось: ${w} ${g(w, 'сделал', 'сделала')} вид, что так и задумано, и ${g(w, 'пообещал', 'пообещала')} вернуться к этому завтра.`,
    meh: (w, t) => `«${t}» — сделано. Немного криво, зато своими руками, и ${w} очень ${g(w, 'доволен', 'довольна')}.`,
    good: (w, t) => `${w} ${g(w, 'сделал', 'сделала')} «${t}» быстро и аккуратно — как будто всю жизнь только этим и ${g(w, 'занимался', 'занималась')}.`,
    perfect: (w, t) => `«${t}» — идеально, и ${w} заодно ${g(w, 'сделал', 'сделала')} ещё что-то, о чём не просили.`,
};
/** Удалось — что встанет в домик. */
const FURN_NAME = { wshelf: 'полка на стене', bookcase: 'стеллаж', mirror: 'зеркало', lamp: 'торшер', clock: 'часы', garland: 'гирлянда' };
const FURN_OF = [[/полк/i, 'wshelf'], [/стеллаж/i, 'bookcase'], [/зеркал/i, 'mirror'], [/лампу|торшер|светильник/i, 'lamp'], [/часы/i, 'clock'], [/гирлянд/i, 'garland']];

export function add(t, { room = '', src = 'me', post = '', why = '' } = {}) {
    t = C.cut(C.str(t), 120);
    if (!t || all().some(x => x.st !== 'done' && C.norm(x.t) === C.norm(t))) return null;
    const x = { id: C.uid(), t, room: D.roomById(room) ? room : '', why: C.cut(C.str(why), 200), cat: catOf(t), at: C.storyDay() || '', st: 'todo', src, post, tries: 0, home: D.home().id };
    list().unshift(x);
    if (list().length > 60) list().splice(60);
    C.touch();
    try { C.A?.updatePrompt?.(); } catch { /* */ }
    return x;
}
export function del(id) { const m = C.M(); m.chores = list().filter(x => x.id !== id); C.touch(); }
export const byId = (id) => list().find(x => x.id === id) || null;
/** Кто по умолчанию берётся: из настроек эпохи (Баки, Наташа…), если он в группе; иначе первый свой, кроме неё. */
export function doerDefault() {
    const want = cfgOf().who;
    const cast = C.cast();
    const hit = want && cast.find(n => C.same(n, want) || new RegExp(want, 'i').test(n));
    return hit || (want === 'Хеди' ? C.userName() : cast.find(n => !C.same(n, C.userName())) || C.userName());
}

/** Взяться: кубик, исход, слова модели; удалось — вещь в домик; катастрофа — новое дело. */
export async function attempt(id, { who = doerDefault(), help = '', roll = C.d20(), addPiece = null } = {}) {
    const x = byId(id);
    if (!x) throw new Error('Дела уже нет');
    const m = modOf(x, who, help);
    const total = roll + m.mod;
    const tier = tierOf(roll, total, who);
    x.tries = (x.tries || 0) + 1;
    Object.assign(x, { who, help, roll, mod: m.mod, why: m.why.join(', '), total, tier, day: C.storyDay() || '' });
    let res = '';
    try {
        const sys = `Ты — соавтор ролевой истории God Complex (AU по MCU, по-русски) и пишешь, как прошло домашнее дело. 1–2 предложения, конкретно и тепло, с юмором, по характеру того, кто взялся, и по эпохе. Исход уже решён кубиком — не меняй его. Без драмы, без травм.
Ответ — только JSON: {"res":"как прошло"}`;
        const usr = `${C.eraLine()}\n${C.homeLine()}\nДело: «${x.t}»${x.room ? ` (${D.roomById(x.room)?.name.toLowerCase()})` : ''}. ${g(who, 'Взялся', 'Взялась')}: ${C.short(who)}${help ? `, помогает ${C.short(help)}` : ''}.\nКубик: ${roll} ${m.mod >= 0 ? '+' : '−'} ${Math.abs(m.mod)} = ${total} → ${TIER_RU[tier]}${m.why.length ? ` (${m.why.join('; ')})` : ''}.`;
        const msgs = [{ role: 'system', content: sys }, { role: 'user', content: usr }];
        const o = { what: 'Дом: дела по дому', check: (j) => C.str(j?.res) };
        const j = C.A?.askJson ? await C.A.askJson(msgs, 700, o) : null;
        res = C.cut(C.str(j?.res), 400);
    } catch (e) { console.warn('[Дом] дела: модель', e); }
    x.res = res || FALLBACK[tier](C.short(who), x.t);
    let made = '';
    if (['meh', 'good', 'perfect'].includes(tier)) {
        x.st = 'done'; x.done = C.storyDay() || '';
        const t = FURN_OF.find(([re]) => re.test(x.t))?.[1];
        if (t && x.room && addPiece) { try { const p = addPiece(x.room, t); if (p) made = `${FURN_NAME[t] || 'вещь'} (${D.roomById(x.room)?.name.toLowerCase() || ''})`; } catch { /* */ } }
    } else if (tier === 'disaster') {
        x.st = 'done'; x.done = C.storyDay() || '';
        add(`разгрести последствия: ${x.t}`, { room: x.room, src: 'me', why: 'после катастрофы' });
    } else x.st = 'todo';
    x.made = made;
    C.touch();
    try { C.A?.updatePrompt?.(); } catch { /* */ }
    return x;
}
/** В сцену: разовая заметка модели. */
export function toScene(id) {
    const x = byId(id);
    if (!x?.res) return false;
    C.shot(`chore:${x.id}`, `[Дела ${cfgOf().place}: ${C.short(x.who)} ${g(x.who, 'взялся', 'взялась')} — «${x.t}»${x.help ? `, ${C.short(x.help)} помогает` : ''}. Кубик ${x.roll}${x.mod ? ` ${x.mod > 0 ? '+' : '−'} ${Math.abs(x.mod)}` : ''} — ${TIER_RU[x.tier]}: ${x.res} Покажи это в сцене — к месту, без спешки.]`);
    return true;
}

/** Что в доме просится — умная модель по дому, истории и последним постам. */
export async function ideas(ask = '') {
    const sys = `Ты — соавтор ролевой истории God Complex (AU по MCU, по-русски). Придумай 4 домашних дела ${cfgOf().place}, которые сейчас просятся: что сломалось, скрипит, капает, не повешено, не собрано — по тому, где они живут в этой эпохе (ниже), по истории и по быту. Конкретно и смешно-уютно, без драмы.
Ответ — только JSON: {"items":[{"t":"дело, 2–6 слов","room":"${C.roomEnum()}","why":"почему именно сейчас, одной фразой"}]}`;
    const usr = [C.eraLine(), C.homeLine(), ask ? `Пожелание: ${C.cut(ask, 200)}` : '', `Уже в списке: ${open().map(x => x.t).join(', ') || 'ничего'}.`].filter(Boolean).join('\n');
    const msgs = [{ role: 'system', content: sys }, { role: 'user', content: usr }];
    const o = { what: 'Дом: что починить', check: (x) => Array.isArray(x?.items) && x.items.length };
    const j = C.cfg().model === 'deep' && C.A?.askDeepJson ? await C.A.askDeepJson(msgs, 1600, o) : await C.A.askJson(msgs, 1600, o);
    return (Array.isArray(j?.items) ? j.items : []).map(y => add(y?.t, { room: C.str(y?.room), src: 'ai', why: C.str(y?.why) })).filter(Boolean);
}

// ───────────── модели и Летописцу ─────────────

export function notes() {
    const l = open().slice(0, 3);
    if (!l.length) return [];
    const w = doerDefault();
    return [`в списке дел ${cfgOf().place}: ${l.map(x => `«${x.t}»${x.room ? ` (${D.roomById(x.room)?.name.toLowerCase()})` : ''}`).join(', ')} — ${C.short(w)} может ${g(w, 'взяться сам', 'взяться сама')}, к месту`];
}
export const CHRON = `"fix":"что в доме сломалось или что надо сделать по дому (кран капает, повесить полку), 2–6 слов, или пусто"`;
export function afterPost(d, post) {
    const t = C.str(d?.fix);
    if (!t) return [];
    const x = add(t, { src: 'post', post });
    return x ? [`В список дел: ${x.t}`] : [];
}

// ───────────── экран ─────────────

function rowHtml(x, h) {
    const { btn, ic, spin, busy, dieHtml } = h;
    const k = `chore:${x.id}`;
    const room = D.roomById(x.room);
    return `<div class="dm-chore st-${x.st}${x.tier ? ` t-${x.tier}` : ''}">
        ${x.roll ? dieHtml(x.roll, busy(k), 'sm') : `<span class="dm-chore-dot">${ic(x.st === 'done' ? 'check' : 'wand')}</span>`}
        <div class="dm-chore-t"><b>${esc(x.t)}</b>
            <small>${esc([room?.name, x.src === 'post' ? 'из поста' : x.src === 'ai' ? 'подсказка' : '', x.tries > 1 ? `попыток: ${x.tries}` : ''].filter(Boolean).join(' · '))}</small>
            ${x.why && !x.res ? `<em>${esc(x.why)}</em>` : ''}
            ${x.res ? `<p>${esc(x.res)}</p><span class="dm-chore-roll">${esc(C.short(x.who))}: ${x.roll}${x.mod ? ` ${x.mod > 0 ? '+' : '−'} ${Math.abs(x.mod)}` : ''} = ${x.total} — ${esc(TIER_RU[x.tier])}${x.made ? ` · в домике: ${esc(x.made)}` : ''}</span>` : ''}
        </div>
        <div class="dm-chore-a">${x.st !== 'done' ? btn('choreGo', busy(k) ? spin : ic('dice'), `data-v="${x.id}" title="Взяться"`, 'ico sm primary') : ''}${x.res ? btn('choreScene', ic('send'), `data-v="${x.id}" title="В сцену"`, 'ico sm') : ''}${btn('choreDel', ic('x'), `data-v="${x.id}" title="Убрать"`, 'ico sm ghost')}</div>
    </div>`;
}
export function sheet(h) {
    const { head, btn, ic, spin, busy, ui, sec } = h;
    const c = cfgOf();
    const cast = C.cast();
    const who = ui.chore?.who || doerDefault();
    const help = ui.chore?.help || '';
    const l = all();
    const todo = l.filter(x => x.st !== 'done'), done = l.filter(x => x.st === 'done').slice(0, 10);
    const chip = (n, sel, g) => `<button class="dm-chip${sel ? ' on' : ''}" data-dm="${g}" data-v="${esc(n)}">${esc(C.short(n) || 'никто')}</button>`;
    return `<div class="dm-sheet">${head(`${ic('wand')} ${esc(c.title)}`)}
        <div class="dm-hint">Тап по кубику — взяться. d20 + что умеет тот, кто взялся: 1 — катастрофа, до 6 — не вышло, до 12 — криво, но сделано, дальше — хорошо, 20 — идеально.</div>
        <div class="dm-lbl">Кто берётся</div><div class="dm-chips">${cast.map(n => chip(n, C.same(n, who), 'choreWho')).join('')}</div>
        <div class="dm-lbl">Кто помогает</div><div class="dm-chips">${chip('', !help, 'choreHelp')}${cast.filter(n => !C.same(n, who)).map(n => chip(n, C.same(n, help), 'choreHelp')).join('')}</div>
        ${sec('Надо сделать', todo.length ? String(todo.length) : 'пусто')}
        ${todo.length ? todo.map(x => rowHtml(x, h)).join('') : '<div class="dm-empty">Всё сделано. Подозрительно.</div>'}
        <div class="dm-ask"><input data-dmf="chore:ask" value="${esc(ui.chore?.ask || '')}" placeholder="повесить полку в детской">${btn('choreAdd', ic('plus'), 'title="В список"', 'ico')}${btn('choreIdeas', busy('chore:ideas') ? spin : ic('sparkles'), 'title="Что просится"', 'ico primary')}</div>
        ${done.length ? `${sec('Сделано')}${done.map(x => rowHtml(x, h)).join('')}` : ''}
    </div>`;
}
/** В комнате: её дела. */
export function roomHtml(r, { btn, ic, sec }) {
    const l = open().filter(x => x.room === r.id);
    if (!l.length) return '';
    return `${sec('Дела тут', String(l.length))}<div class="dm-chips">${l.map(x => `<button class="dm-chip" data-dm="chores">${ic('wand')} ${esc(x.t)}</button>`).join('')}</div>`;
}
