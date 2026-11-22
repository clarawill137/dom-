// ✦ Дом — посылки. Хеди «хронически онлайн»: заказ едет по дням истории, кубик решает, как доедет; у двери посылку
// проверяют (по-своему), распаковка кладёт вещь в дом. Канал доставки — свой у эпохи: 1943 — ночной сброс и полевая
// почта, 2013 — до подъезда (могут украсть), 2014 — абонентский ящик на чужое имя, 2017 — почта в городке,
// 2018 и 2024 — курьер до двери. На «Скитальце» посылок нет.

import * as C from './core.js';
import * as D from './data.js';

const esc = (v) => C.esc(v);
const pad = (n) => String(n).padStart(2, '0');
export function addDays(day, n) { const d = new Date(`${String(day).slice(0, 10)}T12:00:00`); if (isNaN(d)) return ''; d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T12:00:00`) - Date.parse(`${a}T12:00:00`)) / 864e5);

export function list() { const m = C.M(); if (!Array.isArray(m.parcels)) m.parcels = []; return m.parcels; }
const live = (p) => (!p.post || C.liveKeys().has(p.post)) && (!p.home || p.home === D.home().id);
export const all = () => list().filter(live);
/** Посылки бывают там, где у эпохи есть доставка (на «Скитальце» — нет). */
export const can = () => !!D.home().post && D.site()?.id !== 'ship';
export const chan = () => D.home().post || { name: 'Посылки', via: 'курьер до двери', days: [1, 3], abroad: [6, 12] };

// ───────────── кубик доставки ─────────────

/** d20 → судьба посылки: 1 потерялась · 2 привезли не то · 3–5 опоздает на 2–3 дня · 6–7 на день · 8–16 вовремя · 17–19 раньше · 20 раньше и с подарком. */
export function fateOf(roll) { return roll <= 1 ? 'lost' : roll === 2 ? 'wrong' : roll <= 5 ? 'late2' : roll <= 7 ? 'late1' : roll <= 16 ? 'ok' : roll <= 19 ? 'early' : 'gift'; }
export const FATE_RU = { lost: 'потеряется', wrong: 'привезут не то', late2: 'опоздает на пару дней', late1: 'опоздает на день', ok: 'вовремя', early: 'раньше срока', gift: 'раньше — и с подарком' };
export const fateHint = '1 потеряется · 2 привезут не то · 3–7 опоздает · 8–16 вовремя · 17–19 раньше · 20 с подарком';

/** Заказать: x — вещь (name, desc, pic, kind, room, spot, price, from, abroad). */
export function order(x, { roll = C.d20(), src = 'me', post = '', paid = '' } = {}) {
    const c = chan();
    const day = C.storyDay() || '';
    const [a, b] = x.abroad ? c.abroad : c.days;
    const base = a + Math.floor(Math.random() * (b - a + 1));
    const fate = fateOf(roll);
    const shift = fate === 'late2' ? 2 + (roll % 2) : fate === 'late1' ? 1 : fate === 'early' || fate === 'gift' ? -1 : 0;
    const days = Math.max(0, base + shift);
    const kind = D.KINDS[x.kind] && D.KINDS[x.kind].place ? x.kind : 'decor';
    const p = {
        id: C.uid(), name: C.cut(C.str(x.name), 120) || 'посылка', desc: C.cut(C.str(x.desc), 400), pic: C.cut(C.str(x.pic), 600), kind,
        room: D.roomById(C.str(x.room)) ? C.str(x.room) : '', spot: C.str(x.spot), price: C.priceNum(x.price), from: C.cut(C.str(x.from), 80),
        abroad: !!x.abroad, who: C.cut(C.str(x.who), 60) || C.userName(), ordered: day, eta: day ? addDays(day, days) : '', days, base, roll, fate,
        st: 'way', src, post, paid, home: D.home().id,
    };
    list().unshift(p);
    if (list().length > 60) list().splice(60);
    C.touch();
    try { C.A?.updatePrompt?.(); } catch { /* */ }
    return p;
}
/** Купить с доставкой: оплата сразу (счёт «за дом» в Life или банк Телефона), посылка едет. */
export async function buyOrder(x) {
    const price = C.priceNum(x.price);
    let paid = '';
    if (price > 0) {
        const r = await C.pay(price, `Дом: ${x.name} (доставка)`);
        if (!r.ok && r.why && !/не найден/.test(r.why)) throw new Error(r.why);
        paid = r.ok ? `−${C.money(price)}${r.name ? ` · ${r.name}` : ''}` : r.why;
    }
    return order(x, { paid });
}

// ───────────── где посылка ─────────────

export function stOf(p, day = C.storyDay()) {
    if (p.st === 'open' || p.st === 'gone') return p.st;
    if (!p.eta || !day || day < p.eta) return 'way';
    return p.fate === 'lost' ? 'lost' : 'door';
}
export const atDoor = () => all().filter(p => stOf(p) === 'door');
export const onWay = () => all().filter(p => stOf(p) === 'way');
/** Трекинг словами. */
export function track(p, day = C.storyDay()) {
    const c = chan();
    const st = stOf(p, day);
    if (st === 'door') return c.pickup ? 'на почте в городке — до востребования' : c.pobox ? 'в абонентском ящике' : c.drop ? 'сброс принят — ящик в лагере' : c.stolen ? 'у подъезда — забери, пока не утащили' : 'у двери';
    if (st === 'lost') return lostText(p);
    if (st === 'open') return `распакована${p.opened ? ` ${C.dmy(p.opened)}` : ''}`;
    if (st === 'gone') return 'списана';
    const left = p.eta && day ? daysBetween(day, p.eta) : null;
    const stage = left == null ? 'в пути' : left >= 3 ? (c.drop ? 'ждёт лётной погоды' : 'на складе') : left === 2 ? (c.drop ? 'в Лондоне, на погрузке' : 'в пути') : (c.drop ? 'ночью будет сброс' : c.pickup ? 'едет в городок' : 'у курьера');
    return `${stage}${left != null ? ` · ещё ${left} ${left === 1 ? 'день' : left < 5 ? 'дня' : 'дней'}` : ''}`;
}
function lostText(p) {
    const c = chan();
    if (c.drop) return 'контейнер ушёл не на ту поляну — до немцев ближе, чем до своих';
    if (c.stolen) return 'посылку украли из подъезда. Здравствуй, Адская кухня';
    if (c.pobox) return 'ящик пустой: посылку вернули «за отсутствием адресата»';
    if (c.pickup) return 'на почте её нет: «потерялась где-то в Шайенне»';
    return 'потерялась на сортировке; деньги обещают вернуть — когда-нибудь';
}

// ───────────── кто встречает посылку ─────────────

const CHECK = {
    bucky: [[4, 'Баки разобрал посылку как бомбу: сорок минут, полная тишина, щипцы из ящика. Бомбы не было.'], [11, 'Баки потряс коробку, взвесил на ладони, понюхал, просветил — пустил в дом.'], [18, 'Баки занёс коробку без вопросов и поставил ей на стол.'], [20, 'Баки принёс коробку к кровати и ждал, пока она проснётся, — посмотреть, что там.']],
    sgt: [[5, 'Контейнер упал у края поляны — сержант и Дуган тащили его по снегу, ругаясь на трёх языках.'], [14, 'Сержант проверил ящик на растяжки и только потом позвал капитана.'], [20, 'Сержант сам принёс посылку в палатку и сделал вид, что просто шёл мимо.']],
    nat: [[6, 'Наташа проверила коробку на жучки — дважды. Чисто. Почти обиделась.'], [14, 'Наташа забрала у курьера, расписалась чужим именем, поставила на стол.'], [20, 'Наташа заглянула внутрь «на всякий случай» и молча положила сверху шоколадку.']],
    marika: [[8, 'Коробку чуть не утащили с лестницы — Марика отбила её у соседа сверху.'], [20, 'Марика забрала посылку и оставила у двери со стикером «ты опять что-то заказала».']],
    pobox: [[6, 'Баки сначала проверил, не следят ли за почтой, и только потом открыл ящик.'], [20, 'Баки забрал посылку из абонентского ящика по пути и принёс, спрятав под курткой.']],
    pickup: [[5, 'На почте продавщица смотрит слишком долго, а на стене всё тот же плакат «Разыскивается».'], [20, 'Почта в городке, сорок минут по лесной дороге; коробку отдали без вопросов.']],
};
const CHECKER = { '2024': 'bucky', '1943': 'sgt', '2018': 'nat', '2013': 'marika', '2014': 'pobox', '2017': 'pickup' };
function check(p) {
    const tab = CHECK[CHECKER[D.home().id] || 'bucky'];
    const roll = C.d20();
    let t = tab[0][1];
    for (const [k, v] of tab) { t = v; if (roll <= k) break; }
    return { roll, t };
}
/** Новые «у двери» — их встречают (один раз). */
export function tick() {
    let n = 0;
    for (const p of all()) if (stOf(p) === 'door' && !p.chk) { p.chk = check(p); n++; }
    if (n) C.touch();
    return n;
}

// ───────────── распаковать ─────────────

const WRONG = {
    '1943': ['ящик консервированной фасоли вместо батарей', 'коробка чулок с запиской «для капитана — от снабжения»', 'двенадцать банок «Спама»', 'учебник французского для офицеров'],
    '2017': ['ящик рыболовных блёсен', 'чужая посылка для шерифа', 'книга «Выживание в лесу» — иронично'],
    any: ['двести резиновых уточек', 'коврик для йоги с котиками', 'набор формочек для кексов в виде черепов', 'надувной фламинго', 'чужие носки сорок шестого размера'],
};
const GIFT = {
    '1943': ['плитка шоколада из пайка — от Говарда, с запиской', 'пачка открыток из Лондона'],
    any: ['маленький плюшевый зверь — подарок от магазина', 'пробник хорошего кофе', 'набор наклеек с котиками'],
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
export function unpack(id) {
    const p = list().find(x => x.id === id);
    if (!p || p.st === 'open') return null;
    const h = D.home().id;
    const wrong = p.fate === 'wrong';
    const name = wrong ? pick(WRONG[h] || WRONG.any) : p.name;
    const it = C.addItem(wrong ? 'decor' : p.kind, { name, desc: wrong ? `привезли вместо «${p.name}»` : p.desc, pic: wrong ? '' : p.pic, room: p.room, spot: p.spot, price: p.price, from: p.from, who: p.who }, { src: 'parcel' });
    let extra = null;
    if (p.fate === 'gift') extra = C.addItem('decor', { name: pick(GIFT[h] || GIFT.any), desc: `в посылке с «${p.name}» — сверху`, room: it.room, spot: it.spot || 'shelf' }, { src: 'parcel' });
    p.st = 'open'; p.opened = C.storyDay() || ''; p.itemId = it.id; p.wrongName = wrong ? name : '';
    C.touch();
    try { C.A?.updatePrompt?.(); } catch { /* */ }
    return { p, it, extra, wrong };
}
export function dismiss(id) { const p = list().find(x => x.id === id); if (p) { p.st = 'gone'; C.touch(); } }
export function drop(id) { const m = C.M(); m.parcels = list().filter(x => x.id !== id); C.touch(); }
export function reorder(id) { const p = list().find(x => x.id === id); if (!p) return null; return order({ ...p }, { paid: '' }); }

// ───────────── «что бы заказать» — умная модель ─────────────

export async function ideas(ask = '') {
    const c = chan();
    const pk = await C.planKeys();
    const plans = [...C.hiddenPlans(), ...pk.titles];
    const sys = `Ты — соавтор ролевой истории God Complex (AU по MCU, по-русски). Хеди «хронически онлайн»: в три часа ночи листает магазины и заказывает лишнее. Придумай 5 вещей, которые она могла бы заказать прямо сейчас — так, как в эту эпоху приходят посылки (${c.via}): смешно, мило, по её характеру (гений-инженер, гиковские штуки, нелепые плюшевые звери, всё для их быта), по эпохе и по тому, где они живут. Всё — строго своей эпохи. Заделы автора не трогать даже намёком.
Ответ — только JSON: {"items":[{"name":"что, 2–6 слов","desc":"1–2 предложения: что это и почему она это заказала в три ночи","price":0,"from":"где заказала","abroad":false,"kind":"decor|plush|book|plant|hobby${D.home().id === '2024' ? '|nursery' : ''}","room":"${C.roomEnum()}","pic":"предмет для картинки по-английски"}]}`;
    const usr = [C.eraLine(), C.homeLine(), ask ? `Пожелание: ${C.cut(ask, 200)}` : '', plans.length ? `Заделы автора — НЕ трогать: ${plans.join('; ')}` : '', `Уже едет: ${onWay().map(p => p.name).join(', ') || 'ничего'}.`].filter(Boolean).join('\n');
    const msgs = [{ role: 'system', content: sys }, { role: 'user', content: usr }];
    const o = { what: 'Дом: что заказать', check: (x) => Array.isArray(x?.items) && x.items.length };
    const j = C.cfg().model === 'deep' && C.A?.askDeepJson ? await C.A.askDeepJson(msgs, 2200, o) : await C.A.askJson(msgs, 2200, o);
    const out = [];
    for (const x of (Array.isArray(j?.items) ? j.items : []).slice(0, 7)) {
        if (!C.str(x?.name)) continue;
        if (pk.re && (pk.re.test(`${x.name} ${x.desc}`) || pk.re.test(C.str(x.pic)))) continue;
        out.push({ ...x, _id: C.uid() });
    }
    if (!out.length) throw new Error('Пусто или задело заделы — ещё раз');
    C.M().postIdeas = out;
    C.touch();
    return out;
}
export const lastIdeas = () => (Array.isArray(C.M().postIdeas) ? C.M().postIdeas : []);

// ───────────── модели и Летописцу ─────────────

export function notes() {
    if (!can()) return [];
    tick();
    const out = [];
    const door = atDoor();
    if (door.length) out.push(`${chan().pickup ? 'на почте в городке ждёт' : chan().pobox ? 'в абонентском ящике лежит' : chan().drop ? 'в лагерь пришёл сброс —' : 'у двери ждёт'} ${door.length === 1 ? 'посылка' : 'посылки'}: ${door.slice(0, 3).map(p => `«${p.name}»`).join(', ')}${door[0].chk?.t ? ` (${C.cut(door[0].chk.t, 120)})` : ''}`);
    const way = onWay();
    if (way.length) out.push(`едут посылки: ${way.slice(0, 3).map(p => p.name).join(', ')}`);
    return out;
}
export const CHRON = `"order":[{"name":"что заказали с доставкой, 2–6 слов","from":"где"}]`;
export function afterPost(d, post) {
    const out = [];
    for (const x of (Array.isArray(d?.order) ? d.order : []).slice(0, 3)) {
        const name = C.cut(C.str(x?.name), 80);
        if (!name || list().some(p => C.norm(p.name) === C.norm(name))) continue;
        order({ name, from: C.str(x?.from) }, { src: 'post', post });
        out.push(`Посылка «${name}» — в пути`);
    }
    return out;
}

// ───────────── экран ─────────────

export function homeCard({ btn, ic }) {
    if (!can()) return '';
    tick();
    const door = atDoor();
    if (!door.length) return '';
    return `<button class="dm-parcel-card" data-dm="post"><span class="dm-box-ico">${ic('box')}</span><span><b>${door.length === 1 ? 'Посылка' : `Посылки: ${door.length}`} — ${esc(track(door[0]))}</b><small>${esc(door.map(p => p.name).slice(0, 3).join(' · '))}</small></span></button>`;
}
function row(p, h) {
    const st = stOf(p);
    const { btn, ic, spin, busy } = h;
    const prog = st === 'way' && p.days ? Math.max(4, Math.min(96, Math.round(100 * (1 - Math.max(0, daysBetween(C.storyDay() || p.ordered, p.eta)) / Math.max(1, p.days))))) : st === 'way' ? 8 : 100;
    const acts = st === 'door'
        ? `${btn('postOpen', busy(`open:${p.id}`) ? spin : `${ic('box')} Распаковать`, `data-v="${p.id}"`, 'sm primary')}${btn('postScene', `${ic('send')} В сцене`, `data-v="${p.id}"`, 'sm')}`
        : st === 'lost' ? `${chan().drop ? btn('postFetch', `${ic('send')} Сходить за ним`, `data-v="${p.id}"`, 'sm') : ''}${btn('postGone', 'Ну и ладно', `data-v="${p.id}"`, 'sm ghost')}`
            : st === 'open' && p.wrongName ? btn('postAgain', `${ic('box')} Заказать заново`, `data-v="${p.id}"`, 'sm') : '';
    return `<div class="dm-parcel st-${st}${busy(`open:${p.id}`) ? ' opening' : ''}">
        <span class="dm-parcel-box">${ic('box')}</span>
        <div class="dm-parcel-t"><b>${esc(st === 'open' && p.wrongName ? p.wrongName : p.name)}</b>
            <small>${esc([p.from, p.price ? C.money(p.price) : '', p.paid && /^−/.test(p.paid) ? 'оплачено' : '', p.src === 'post' ? 'из поста' : ''].filter(Boolean).join(' · '))}</small>
            <em>${esc(track(p))}</em>
            ${st === 'way' ? `<i class="dm-prog"><b style="width:${prog}%"></b></i>` : ''}
            ${st === 'door' && p.chk?.t ? `<p class="dm-parcel-chk">${esc(p.chk.t)}</p>` : ''}
            ${st === 'open' && p.wrongName ? `<p class="dm-parcel-chk">Привезли не то — вместо «${esc(p.name)}».</p>` : ''}
            <span class="dm-parcel-die">d20: ${p.roll} — ${esc(FATE_RU[p.fate] || '')}</span>
        </div>
        <div class="dm-parcel-a">${acts}${st === 'open' || st === 'gone' ? btn('postDrop', ic('x'), `data-v="${p.id}" title="Убрать"`, 'ico sm ghost') : ''}</div>
    </div>`;
}
export function sheet(h) {
    const { head, btn, ic, spin, busy, ui, sec } = h;
    const c = chan();
    if (!can()) return `<div class="dm-sheet">${head(`${ic('box')} Посылки`)}<div class="dm-empty">На «Скитальце» посылок нет — разве что с базара чужого мира. Вернутся на Землю — будут.</div></div>`;
    tick();
    const ps = all();
    const door = ps.filter(p => stOf(p) === 'door'), way = ps.filter(p => stOf(p) === 'way'), lost = ps.filter(p => stOf(p) === 'lost'), done = ps.filter(p => ['open'].includes(stOf(p))).slice(0, 8);
    const idea = lastIdeas();
    return `<div class="dm-sheet">${head(`${ic('box')} ${esc(c.name)}`)}
        <div class="dm-hint">${esc(c.via)} · кубик доставки: ${esc(fateHint)}</div>
        ${door.length ? `${sec('Пришло', String(door.length))}${door.map(p => row(p, h)).join('')}` : ''}
        ${way.length ? `${sec('В пути', String(way.length))}${way.map(p => row(p, h)).join('')}` : ''}
        ${lost.length ? `${sec('Не доехало')}${lost.map(p => row(p, h)).join('')}` : ''}
        ${!door.length && !way.length && !lost.length ? '<div class="dm-empty">Ничего не едет. Хеди держится уже целых пять минут.</div>' : ''}
        ${sec('Заказать')}
        <div class="dm-ask"><input data-dmf="post:ask" value="${esc(ui.post?.ask || '')}" placeholder="что-нибудь для кухни / нелепое / для Баки">${btn('postIdeas', busy('post:ideas') ? spin : ic('sparkles'), 'title="Что бы заказать в три ночи"', 'ico primary')}${btn('postOwn', ic('plus'), 'title="Своё"', 'ico')}</div>
        ${idea.length ? `<div class="dm-goods">${idea.map((x, i) => `<div class="dm-good"><span class="dm-row-ph empty">${ic('box')}</span><div><b>${esc(x.name)}</b><small>${esc([x.from, x.abroad ? 'из-за границы' : ''].filter(Boolean).join(' · '))}</small><p>${esc(C.cut(x.desc, 140))}</p></div><div class="dm-good-r"><em>${C.priceNum(x.price) ? esc(C.money(C.priceNum(x.price))) : '—'}</em>${btn('postBuy', busy(`pbuy:${x._id}`) ? spin : ic('box'), `data-v="${i}" title="Заказать"`, 'ico sm primary')}</div></div>`).join('')}</div>` : ''}
        ${done.length ? `${sec('Распаковано')}${done.map(p => row(p, h)).join('')}` : ''}
    </div>`;
}
