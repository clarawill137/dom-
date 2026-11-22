// Логика Дома без таверны: хэд-машина (настроения, заделы, повторы), общая полка с Life, картинки, комнаты.
import assert from 'node:assert/strict';

const ctx = { chat: [], chatMetadata: {}, extensionSettings: { wardrobe: { faces: { 'Баки': 'faces/bucky.png' } } }, name1: 'Хеди', saveMetadataDebounced() {}, saveSettingsDebounced() {} };
globalThis.SillyTavern = { getContext: () => ctx };
let date = '21.11.2024';
const norm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е').trim();
const life = () => (ctx.chatMetadata.life ||= {});
let asked = null, drawn = [], prompts = 0;
let reply = null;
const api = {
    worldState: () => ({ timestamp: { story_date: date, story_time: '21:10' }, scene: { location: 'квартира на Манхэттене' } }),
    parseDate: (s) => { const m = String(s).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; },
    canonName: (n) => String(n || '').trim(), sameName: (a, b) => norm(a) === norm(b), shortName: (n) => String(n).split(' ')[0],
    groupMembers: () => ['Баки', 'Тони Старк'], chatMeta: () => life(), saveMeta() {}, updatePrompt() { prompts++; }, hasChat: () => true,
    lore: { card: (n) => (n === 'Баки' ? 'Баки Барнс: читает про полярников, готовит строго по рецепту.' : 'Хеди: гений, любит плюшевых зверей.'), core: () => 'если устал — молчит рядом' },
    tastes: (n) => (n === 'Хеди' ? [{ t: 'клубника', k: 'like' }, { t: 'кинза', k: 'dislike' }] : []),
    askFillJson: async (msgs, tokens, o, story) => { asked = { msgs, tokens, o, story }; return JSON.parse(JSON.stringify(reply)); },
    refData: async (p) => `data:ref:${p}`, avatarUrl: (n) => `avatars/${n}.png`,
    drawPicture: async (prompt, o) => { drawn.push({ prompt, o }); return `user/images/${o.prefix}_${drawn.length}.jpg`; },
    style: () => 'цветные карандаши',
};
const C = await import('../core.js');
const D = await import('../data.js');
C.setApi(api);

// 1. пара по умолчанию и кубик
assert.deepEqual(C.defaultWho(), ['Хеди', 'Баки']);
assert.equal(D.vibeOfRoll(20), 'gold'); assert.equal(D.vibeOfRoll(1), 'odd'); assert.equal(D.vibeOfRoll(9), 'cute'); assert.equal(D.vibeOfRoll(17), 'pair');

// 2. хэд-машина: настроения по кубику, заделы и повторы не проходят
life().pair = { pairs: {}, hc: [{ id: 'h1', who: ['Баки'], t: 'Баки всегда садится лицом к двери, даже дома' }], seq: 1 };
life().johari = { list: [{ kind: 'unknown', step: 0, who: 'Баки', when: 'впервые Хеди покупает приставку', t: 'оказывается, ему нравятся видеоигры' }, { kind: 'unknown', step: 2, who: 'Хеди', t: 'уже случилось' }] };
C._setPlanKeys({ titles: ['Задел: плейстейшн (ещё не случилось)'], re: /плейстейшн|приставк|видеоигр/i });
reply = { items: [
    { who: ['Баки'], vibe: 'home', t: 'Баки подписывает контейнеры с едой датами и её любимыми смайликами', pic: 'Bucky labeling food containers in a cozy kitchen' },
    { who: ['Баки'], vibe: 'fun', t: 'Баки залипает в видеоигры до утра', pic: 'Bucky with a gamepad' },
    { who: ['Баки'], vibe: 'cute', t: 'Баки дома всегда садится лицом к двери', pic: 'x' },
    { who: ['Хеди', 'Баки', 'Альпин'], vibe: 'weird', t: 'Хеди греет холодные ноги о Баки, а он делает вид, что это его обязанность по уставу', pic: 'Hedy and Bucky under a blanket' },
] };
const b = await C.genHc({ who: ['Хеди', 'Баки'], vibes: ['home', 'fun', 'cute', 'pair'], rolls: [{ r: 3, v: 'home' }, { r: 12, v: 'fun' }, { r: 8, v: 'cute' }, { r: 17, v: 'pair' }] });
assert.equal(b.items.length, 2, 'видеоигры (задел) и повтор «лицом к двери» отсеяны');
assert.ok(b.items.every(c => !/видеоигр|двери/.test(c.t)));
assert.deepEqual(b.items[1].who, ['Хеди', 'Баки'], 'кошка — не человек из группы, отброшена');
assert.equal(b.items[1].vibe, 'pair', 'чужое настроение → по кубику');
const sys = asked.msgs[0].content, usr = asked.msgs[1].content;
assert.match(sys, /Без драмы/);
assert.match(usr, /1\) Быт.*2\) Смешно.*3\) Мило.*4\) Про них/s, 'настроения по порядку');
assert.match(usr, /впервые Хеди покупает приставку/, 'задел из Узнавания — в «не трогать»');
assert.match(usr, /Задел: плейстейшн/, 'задел из лорбука — тоже');
assert.doesNotMatch(usr, /уже случилось/, 'случившееся — уже не задел');
assert.match(usr, /лицом к двери/, 'записанные хэды — в «не повторяй»');
assert.match(usr, /Любит: клубника.*Не любит: кинза/s, 'вкусы из Life');
assert.deepEqual(asked.story, { who: ['Хеди', 'Баки'], pairs: true, world: false });
assert.equal(C.lastBatch().id, b.id);

// 3. на холодильник: общая полка с Life
const c1 = b.items[0];
const h = C.keep(c1);
assert.equal(life().pair.hc.length, 2);
assert.equal(h.id, 'h2'); assert.equal(h.src, 'dom'); assert.equal(c1.kept, 'h2');
assert.ok(prompts > 0, 'Life обновил заметку модели');
assert.equal(C.keep(c1).id, 'h2', 'второй раз не дублирует');

// 4. картинка: лица рефами, в Life — тоже
await C.drawHc(c1);
assert.equal(drawn.length, 1);
assert.equal(drawn[0].o.refs.length, 1, 'один реф — Баки');
assert.ok(drawn[0].o.refs.includes('data:ref:faces/bucky.png'), 'лицо Баки — из Гардероба');
assert.match(drawn[0].prompt, /labeling food containers/);
assert.match(drawn[0].prompt, /цветные карандаши/, 'стиль картинок Life');
assert.match(drawn[0].prompt, /No text/);
assert.equal(C.hcById('h2').img, c1.img, 'картинка ушла и в хедканон Life');
await C.drawHc(C.hcById('h1'));
assert.match(drawn[1].prompt, /лицом к двери/, 'записанный руками — рисуется по тексту');
assert.ok(C.hcById('h1').img);

// 5. придержать и снять
C.toggleHc('h2'); assert.equal(C.hcById('h2').off, true);
C.delHc('h2'); assert.equal(C.hcById('h2'), null); assert.equal(c1.kept, '', 'карточка машины снова свободна');

// 6. всё отсеялось — честная ошибка
reply = { items: [{ who: ['Баки'], t: 'Баки и приставка — любовь с первого взгляда', pic: '' }] };
await assert.rejects(C.genHc({ who: ['Баки'], vibes: ['fun'] }), /крутани ещё раз/);

// 7. комнаты: картинка у каждой эпохи своя
await C.drawRoom(D.roomById('kitchen'));
assert.ok(C.roomImg('kitchen'));
assert.match(drawn[drawn.length - 1].prompt, /present day, 2024/);
date = '10.03.1944';
assert.equal(C.eraKey(), '40s');
assert.equal(C.roomImg('kitchen'), '', 'в 1944 кухня другая — не нарисована');
await C.drawRoom(D.roomById('kitchen'));
assert.match(drawn[drawn.length - 1].prompt, /1940s/);
assert.match(C.eraLine(), /1940-е/);

// 8. похожесть
assert.ok(C.isDup('Баки всегда садится лицом к двери, даже дома', ['Баки дома всегда садится лицом к двери']));
assert.ok(!C.isDup('Хеди прячет конфеты в ящике с отвёртками', ['Баки всегда садится лицом к двери']));

console.log('дом · логика: все проверки прошли');
