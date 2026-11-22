// ✦ Дом — Фотоплёнка Хеди и Снежный день.
// Плёнка: её телефон — селфи вдвоём, селфи, которые снимает Баки (лоб и полподбородка), Альпин, еда, вид из окна,
// своё; у каждого кадра подпись как в телефоне. «Распечатать» — фото в рамке встаёт в дом; «показать в сцене» —
// Хеди показывает кадр, модель знает, что на нём. Снежный день: по погоде истории (снег за окном) — карточка
// уютных сцен без сюжета: какао, плед, снежки; тап — подсказка в следующий ответ.

import * as C from './core.js';
import * as D from './data.js';

const esc = (v) => C.esc(v);
export const SHOTS = [
    ['selfie', '🤳 Селфи вдвоём', 'A phone selfie taken by Hedy at arm\'s length: Hedy and Bucky cheek to cheek, she grins, he gives the small rare smile; slightly tilted, casual'],
    ['bucky', '🙃 Баки снимает', 'A phone photo badly taken by Bucky trying to take a selfie: the frame shows only his forehead, one eyebrow and half of his chin from below, a ceiling lamp, Hedy laughing in the blurred background; comedic, accidental'],
    ['cat', '🐈 Альпин', 'A phone snapshot of Alpine, a fluffy white cat, doing something silly at home (stuck in a box, stealing a sock, sitting on a laptop); candid'],
    ['food', '🍳 Еда', 'A phone photo of homemade food on the table, taken from above, a bit messy and cosy, morning light'],
    ['view', '🌆 Вид из окна', 'A phone photo through their apartment window: the Manhattan street, brick buildings, the weather of the day'],
    // эпохи
    ['pair', '📷 «Лейка»: вдвоём', 'A 1940s photo taken with a captured Leica: the captain and the sergeant side by side in a snowy forest camp among army tents, he grins, she pretends not to smile'],
    ['dog', '🐕 Фриц-Секач', 'A 1940s snapshot of Fritz, a big German shepherd, the mascot of a commando unit, stealing a ration tin in a snowy forest camp'],
    ['back', '🕶 Баки со спины', 'A phone photo of a man in a cap and a hoodie seen only from behind on a Brooklyn fire escape at dusk, a cigarette, the courtyard below — he never lets anyone photograph his face'],
    ['self', '🤳 Селфи одна', 'A phone selfie of Hedy alone: tired grin, messy hair, calculations and coffee mugs behind her'],
    ['ship', '🚀 Корабль в сарае', 'A phone photo of a sleek half-built starship under tarpaulin in a barn at night, work lights, cables, snow at the open door'],
    ['nat', '🤳 Селфи с Наташей', 'A phone selfie on a small kitchen: Hedy grinning, Natasha Romanoff deadpan next to her, takeout boxes on the table'],
];
const VIEW = { '1943': 'A 1940s photograph of the view from a tent flap: a snowy forest camp, army tents, smoke from a stovepipe, pine trees', '2013': "A phone photo through a grimy window in Hell's Kitchen: fire escapes, grey walk-ups, the street below", '2014': 'A phone photo through a Brooklyn window onto a quiet courtyard: fire escapes, brick walls, the weather of the day', '2017': 'A phone photo of a snowy forest clearing in Wyoming from the door of an old trailer: pines, a barn under tarpaulin', '2018': 'A phone photo through the window of a rented city apartment: the street, the weather of the day' };
/** Кадры этой эпохи: свои у каждой (в 1943-м — «Лейка» и Фриц, в Бруклине Баки — только со спины). */
export const shotsHere = () => { const want = D.home().shots; return want ? SHOTS.filter(x => want.includes(x[0])) : SHOTS.slice(0, 5); };
const CAP = {
    selfie: ['мы', 'это лучшая фотка года, не спорь', 'он улыбается. зафиксировано.', 'утро, кофе, он'],
    bucky: ['он сказал «я разобрался с камерой»', 'лоб. прекрасный лоб.', 'это была попытка №7', 'архив позора, не удалять'],
    cat: ['она опять это сделала', 'преступница', 'Альпин против носков: 1:0', 'спит. не будить.'],
    food: ['он готовит по рецепту мамы', 'попытка №3 — уже съедобно', 'завтрак, который я не заслужила', 'это будет съедено за минуту'],
    view: ['наше окно', 'Нью-Йорк делает вид, что он красивый', 'сегодня так', 'вид, который я люблю'],
    pair: ['капитан и сержант, зима 43-го', 'он сказал «улыбнитесь, капитан»', 'Дуган снимал, пальцы в кадре'],
    dog: ['Фриц опять украл тушёнку', 'отрядный талисман при исполнении', 'Фриц-Секач, гроза пайков'],
    back: ['он не даёт снимать лицо', 'только со спины. как всегда', 'пожарная лестница, вечер'],
    self: ['день сорок какой-то', 'я и расчёты', 'не спала. зато двигатель'],
    ship: ['почти готов', 'мой корабль. МОЙ', 'брезент снят на минутку'],
    nat: ['Нат не улыбается. Нат улыбается', 'кухня, лапша, сестра', 'Наташа сказала «удали». не удалю'],
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function roll() { const m = C.M(); if (!Array.isArray(m.roll)) m.roll = []; return m.roll; }
const day = () => C.clock().date || C.storyDay() || '';

/** Снять кадр на её телефон. */
export async function snap(kind, ask = '') {
    if (!C.A?.drawPicture) throw new Error('Рисую через Life и Гардероб, а их нет');
    let s = SHOTS.find(x => x[0] === kind) || null;
    if (s && kind === 'view' && VIEW[D.home().id]) s = [s[0], s[1], VIEW[D.home().id]];
    const y = C.storyYear();
    const era = y < 1950 ? 'a 1940s photograph with a period camera, black-and-white or faded colour' : `a smartphone photo (${y}), vertical, natural phone-camera look`;
    const nat = C.cast().find(n => /наташ|natasha|романоф/i.test(n));
    const who = kind === 'selfie' || kind === 'bucky' || kind === 'pair' ? C.defaultWho() : kind === 'self' ? [C.userName()] : kind === 'nat' ? [C.userName(), nat].filter(Boolean) : [];
    const base = s ? s[2] : String(ask || '').trim();
    if (!base) throw new Error('Опиши, что на кадре');
    const people = who.length ? `\n${who.map((n, i) => `${C.short(n)} — the person from reference image ${i + 1} (keep the face exactly)`).join('; ')}.` : '';
    const prompt = `${base}${ask && s ? `. ${ask}` : ''}. It is ${era}; candid and real, not posed for a magazine.${people}\nNo text, no watermarks, no phone interface.`;
    const refs = [];
    for (const n of who) { try { const r = await C.faceRef(n, 512); if (r) refs.push(r); } catch { /* */ } }
    const img = await C.A.drawPicture(prompt, { aspect: '3:4', max: 1000, refs, prefix: 'dom_roll', who });
    const x = { id: C.uid(), kind: s ? kind : 'own', img, cap: s ? pick(CAP[kind] || ['кадр']) : C.cut(ask, 80), day: day(), ask: C.cut(ask, 200) };
    roll().unshift(x);
    C.touch();
    return x;
}
/** Картинки из чата — в плёнку. */
export function fromChat(max = 12) {
    const have = new Set(roll().map(x => x.img));
    let n = 0;
    for (const c of C.chatImages(40)) { if (n >= max || have.has(c.src)) continue; roll().push({ id: C.uid(), kind: 'chat', img: c.src, cap: `пост #${c.mes}`, day: '', mes: c.mes }); n++; }
    if (n) C.touch();
    return n;
}
/** Распечатать — фото в рамке в комнату. */
export function print(id, room = D.roomFor('book') || D.placeRooms()[0]?.id || '') {
    const x = roll().find(y => y.id === id);
    if (!x) return null;
    const it = C.addItem('photo', { name: x.cap || 'фото с телефона', desc: x.ask || x.cap || '', img: x.img, room, spot: 'wall' }, { src: 'roll', room });
    x.printed = it.id;
    C.touch();
    return it;
}
/** Показать в сцене: модель знает, что на кадре. */
export function show(id) {
    const x = roll().find(y => y.id === id);
    if (!x) return false;
    const what = { selfie: 'их селфи вдвоём', bucky: 'неудачное селфи Баки — лоб и полподбородка', cat: 'фото Альпин', food: 'фото еды', view: 'вид из их окна', pair: 'их фото вдвоём на «Лейку»', dog: 'снимок Фрица-Секача', back: 'фото Баки со спины', self: 'своё селфи', ship: 'фото корабля в сарае', nat: 'селфи с Наташей', chat: 'фото', own: x.ask || 'фото' }[x.kind] || 'фото';
    const how = C.storyYear() < 1950 ? 'показывает снимок' : 'показывает в телефоне';
    C.shot(`roll:${x.id}`, `[Фотоплёнка: ${C.short(C.userName())} ${how} ${what}${x.cap ? ` (подпись: «${x.cap}»)` : ''}. Пусть на кадр отреагируют — коротко, к месту.]`);
    return true;
}
export function drop(id) { const m = C.M(); m.roll = roll().filter(y => y.id !== id); C.touch(); }

// ───────────── снежный день ─────────────

export function snowy() {
    let atm = '';
    try { atm = String(C.A?.worldState?.()?.scene?.atmosphere || ''); } catch { /* */ }
    const t = atm.toLowerCase();
    return (/снег|снеж|метел|вьюг|снегопад/.test(t) && !/без снега|снег не/.test(t));
}
export const SNOW = [
    ['cocoa', '☕ Какао с зефиром', 'горячее какао с зефиром у окна, снег валит хлопьями, они молчат вдвоём'],
    ['blanket', '🛋 Плед и кино', 'плед на двоих, старое кино, Альпин между ними, за окном метель — никуда не надо'],
    ['snowball', '❄️ Снежки во дворе', 'внезапная война снежками во дворе за лавкой Марко — Баки поддаётся (или нет)'],
    ['roof', '⛄ Снеговик на крыше', 'снеговик на крыше среди грядок, с морковкой из холодильника и шарфом А.И.М.'],
    ['cat', '🐈 Альпин и снег', 'Альпин впервые трогает снег лапой на подоконнике — оскорблена до глубины души'],
    ['bake', '🥧 Испечь что-нибудь', 'запах выпечки, мука на щеке, по рецепту его мамы — снег за окном не кончается'],
];
const snowHere = () => D.home().snow || SNOW;
export function snowScene(id) {
    const s = snowHere().find(x => x[0] === id);
    if (!s) return false;
    C.shot('snow', `[Снежный день (Дом): за окном снег. Уютная сцена без сюжета, если ей есть место: ${s[2]}. Без драмы и поворотов — просто им хорошо.]`);
    return true;
}

// ───────────── экран ─────────────

export function snowCard() {
    if (!snowy() || D.site()?.id === 'ship') return '';
    return `<div class="dm-snow"><b>❄️ Снежный день</b><small>За окном снег — можно ничего не делать. Тап — подсказка уютной сцены в следующий ответ.</small>
        <div class="dm-snow-list">${snowHere().map(([id, l]) => `<button data-dm="snowScene" data-v="${id}">${esc(l)}</button>`).join('')}</div></div>`;
}
export function rollSheet({ head, btn, busy, spin, ic, ui }) {
    const list = roll();
    const f = ui.roll?.f || 'all';
    const shown = f === 'all' ? list : list.filter(x => x.kind === f);
    const sel = ui.roll?.sel ? list.find(x => x.id === ui.roll.sel) : null;
    return `<div class="dm-sheet">${head('📱 Фотоплёнка')}
        <div class="dm-chips">${[['all', 'Все'], ...shotsHere().map(s => [s[0], s[1]]), ['chat', 'Из чата']].map(([v, l]) => `<button class="dm-chip${f === v ? ' on' : ''}" data-dm="rollF" data-v="${v}">${esc(l)}</button>`).join('')}</div>
        ${sel ? `<div class="dm-roll-big"><img src="${esc(sel.img)}" alt=""><p>${esc(sel.cap || '')}</p><small>${esc(sel.day || '')}</small>
            <div class="dm-actions">${btn('rollShow', `${ic('send')} Показать в сцене`, `data-v="${sel.id}"`, 'primary')}${btn('rollPrint', sel.printed ? `${ic('check')} В доме` : `${ic('frame')} Распечатать в дом`, `data-v="${sel.id}"`, '')}${btn('rollDrop', ic('x'), `data-v="${sel.id}"`, 'ghost')}</div></div>` : ''}
        <div class="dm-roll">${shown.map(x => `<button class="dm-roll-i${sel?.id === x.id ? ' on' : ''}" data-dm="rollSel" data-v="${x.id}"><img src="${esc(x.img)}" alt="" loading="lazy"></button>`).join('') || '<div class="dm-empty">Плёнка пуста. Сними что-нибудь.</div>'}</div>
        <div class="dm-sec"><span>Снять</span></div>
        <div class="dm-chips">${shotsHere().map(([v, l]) => `<button class="dm-chip" data-dm="rollSnap" data-v="${v}">${busy(`roll:${v}`) ? spin : esc(l)}</button>`).join('')}</div>
        <label class="dm-field"><span>Или своё</span><input data-dmf="roll:ask" value="${esc(ui.roll?.ask || '')}" placeholder="Баки спит на диване с Альпин на груди"></label>
        <div class="dm-actions">${btn('rollSnap', busy('roll:own') ? spin : `${ic('sparkles')} Снять своё`, 'data-v="own"', 'primary')}${btn('rollChat', `${ic('image')} Из чата`, '', 'ghost')}</div>
    </div>`;
}
