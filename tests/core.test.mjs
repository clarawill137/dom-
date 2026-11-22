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

// 9. полки: придумать — заделы и повторы не проходят, комната по полке
date = '21.11.2024';
api.askDeepJson = async (msgs, tokens, o) => { asked = { msgs, tokens, o, story: null }; return JSON.parse(JSON.stringify(reply)); };
reply = { items: [
    { name: 'Сэр Кракен', desc: 'Плюшевый осьминог с одним глазом', story: 'Баки выиграл в тире на Кони-Айленд', who: 'Хеди', pic: 'a one-eyed plush octopus' },
    { name: 'Геймпад-медведь', desc: 'медведь, обнимающий приставку', who: 'Хеди' },
    { name: 'Сэр Кракен', desc: 'тот же', who: 'Хеди' },
] };
const pl = await C.genKind('plush', { n: 3 });
assert.equal(pl.length, 1, 'задел (приставка) и повтор отсеяны');
assert.equal(pl[0].room, 'living'); assert.equal(pl[0].src, 'ai');
assert.match(asked.msgs[0].content, /Плюшевый зоопарк/);
assert.match(asked.msgs[1].content, /Заделы автора — НЕ трогать/);

// 10. картинки вещей: предмет — без лиц, свидание — с лицами
await C.drawItem(pl[0]);
let last = drawn[drawn.length - 1];
assert.match(last.prompt, /plain cream background/); assert.equal(last.o.refs.length, 0);
const dt = C.addItem('date', { name: 'Каток в Брайант-парке', desc: 'коньки и какао', who: 'Хеди, Баки' });
await C.drawItem(dt);
last = drawn[drawn.length - 1];
assert.ok(last.o.refs.length >= 1, 'свидание — с лицами'); assert.match(last.prompt, /reference image 1/);

// 11. колода: тянуть по кругу
for (const q of ['Что ты помнишь о нашем первом утре?', 'Какой звук для тебя — дом?']) C.addItem('card', { name: q });
const k1 = C.drawCard(), k2 = C.drawCard(), k3 = C.drawCard();
assert.notEqual(k1.id, k2.id, "сначала невытянутые");
assert.ok(k3, "колода перемешалась заново");

// 12. Летописец: новое в доме, записка, счастливый момент — и свайп их убирает
ctx.chat = [{ name: 'Хеди', mes: 'Утро.', is_user: true, swipe_id: 0 }];
const ws = api.worldState;
api.worldState = () => ({ timestamp: { story_date: date, story_time: '9:00' }, scene: { location: 'штаб А.И.М.' } });
assert.equal(C.chronHook(0), null, 'не дома и пост не про дом — Летописцу не надо');
api.worldState = ws;
assert.ok(C.chronHook(0), 'дома — смотрит каждый пост');
ctx.chat.push({ name: 'Баки', mes: 'Баки купил вазу и оставил записку на холодильнике. Она смеялась.', swipe_id: 0, extra: { image: 'user/images/vase.png' } });
C.bump();
const hk = C.chronHook(1);
assert.ok(hk && hk.key === '"dom": {}');
const tt = C.afterPost(1, { dom: { new: [{ kind: 'decor', name: 'синяя ваза', who: 'Баки', room: 'kitchen' }], note: { from: 'Баки', to: 'Хеди', t: 'Ушёл за хлебом. Люблю. Б.' }, joy: 'она смеялась над его вазой' } }, ctx.chat[1]);
assert.equal(tt.length, 3);
assert.equal(C.suggestions().length, 1);
assert.equal(C.itemsOf('note').length, 1); assert.equal(C.itemsOf('joy')[0].img, 'user/images/vase.png', 'картинка поста — в банку');
ctx.chat[1].mes = 'Другой вариант поста.'; ctx.chat[1].swipe_id = 1; C.bump();
assert.equal(C.itemsOf('note').length, 0, 'свайп — записка выпала');
assert.equal(C.suggestions().length, 0);
ctx.chat[1].mes = 'Баки купил вазу и оставил записку на холодильнике. Она смеялась.'; ctx.chat[1].swipe_id = 0; C.bump();
assert.equal(C.itemsOf('note').length, 1, 'свайп назад — вернулась');
const vase = C.acceptSugg(C.suggestions()[0].id);
assert.equal(vase.room, 'kitchen'); assert.equal(C.placedIn('kitchen').length, 1);

// 13. заметка модели: дома — уютные детали; разовая сцена — до ответа
const bk = C.addItem('book', { name: 'Ледяной плен', author: 'Э. Шеклтон', page: 142 });
bk.reading = true;
let pn = C.promptNote('normal');
assert.match(pn, /Баки сейчас читает «Ледяной плен»/); assert.match(pn, /записка от Баки/); assert.match(pn, /синяя ваза \(кухня/);
C.shot('card', '[Вечер вдвоём: вопрос — «тест».]');
assert.match(C.promptNote('normal'), /Вечер вдвоём/);
C.spendShots(5);
assert.doesNotMatch(C.promptNote('normal'), /Вечер вдвоём/, 'после ответа — отыграно');
assert.equal(C.promptNote('quiet'), '');

// 14. покупки: витрина → купить (без банка — без списания)
reply = { items: [{ name: 'Лампа с зелёным абажуром', desc: 'как в библиотеке 40-х', price: 120, from: 'барахолка в Бруклине', room: 'living', spot: 'table', pic: 'green banker lamp' }] };
const goods = await C.shopGen('light');
assert.equal(goods.length, 1);
const bought = await C.buy(goods[0]);
assert.equal(bought.it.room, 'living'); assert.equal(bought.it.price, 120); assert.match(bought.paid, /не найден/);
assert.equal(C.shopList('light').length, 0, 'с витрины ушло');

// 15. перерисовать комнату с вещами: комната и вещи — рефами
C.setItem(vase.id, { img: 'user/images/vase-pic.png' });
await C.drawRoom(D.roomById('kitchen'), { withItems: true });
last = drawn[drawn.length - 1];
assert.match(last.prompt, /Keep this room exactly as in reference 1/);
assert.match(last.prompt, /reference 2: синяя ваза \(на полке\)/);
assert.equal(last.o.refs.length, 2);

// 16. детская, имена, огород
const cr = C.cribRoll(); assert.ok(cr.text.length > 10 && cr.roll >= 1);
const nm = C.addItem('name', { name: 'Уинни', meaning: 'в честь бабушки' });
C.vote(nm.id, 'Хеди', 'love'); C.vote(nm.id, 'Баки', 'ok');
assert.equal(C.votesOf(nm), 3);
assert.match(C.promptNote('normal'), /имена для дочки в шорт-листе: Уинни \(Хеди за\)/);
const pt = C.addItem('plant', { name: 'Базилик' }); pt.planted = '2024-10-01';
assert.equal(C.plantStage(pt), 3, 'посажен в октябре — взрослый к 21 ноября');

// 17. кукольный домик: раскладка по лору, проекция туда-обратно, поворот, наклейки встают на мебель
{
    const Dl = await import('../doll.js');
    const Kd = await import('../dolldata.js');
    const s = Dl.roomState('living');
    assert.ok(s.furn.length >= 8 && s.wl === 'brick' && s.fl === 'herring', 'гостиная — по лору');
    const [sx, sy] = Dl.P(3.2, 4.1, 0);
    const [x, y] = Dl.unP(sx, sy, 0);
    assert.ok(Math.abs(x - 3.2) < 1e-6 && Math.abs(y - 4.1) < 1e-6, 'пол туда-обратно');
    const [ex, ez] = Dl.unWallR(...Dl.P(6, 0, 2.5));
    assert.ok(Math.abs(ex - 6) < 1e-6 && Math.abs(ez - 2.5) < 1e-6, 'правая стена туда-обратно');
    const [ey, ez2] = Dl.unWallL(...Dl.P(0, 7, 1.5));
    assert.ok(Math.abs(ey - 7) < 1e-6 && Math.abs(ez2 - 1.5) < 1e-6, 'левая стена туда-обратно');
    // поворот держит предмет в комнате и меняет след
    const sofa = s.furn.find(p => p.t === 'sofa');
    assert.deepEqual(Dl.footprint(sofa), [2, 4.5]);
    Dl.rotatePiece(s, sofa);
    assert.deepEqual(Dl.footprint(sofa), [4.5, 2]);
    assert.ok(sofa.x >= 0 && sofa.x + 4.5 <= 10 && sofa.y >= 0 && sofa.y + 2 <= 10);
    // спинка дивана после поворота на 1 — у левой стены (x=0 у коробки спинки)
    const b1 = Dl.boxesOf({ t: 'sofa', x: 0, y: 0, r: 1 })[0];
    assert.equal(b1[0], 0, 'r=1 — спинкой к левой стене');
    // порядок коробок: подушка — после сиденья
    const ord = Dl.orderBoxes(Kd.FURN.sofa.parts);
    assert.ok(ord.indexOf(Kd.FURN.sofa.parts[3]) < ord.indexOf(Kd.FURN.sofa.parts[4]));
    // книга «на полке» садится на настенную полку, фото — плоско на стену, растение на крыше — в грядку
    const book = C.addItem('book', { name: 'Полярники', room: 'living', spot: 'shelf' });
    const photo = C.addItem('photo', { name: 'Свадьба', room: 'living', spot: 'wall' });
    const taken = [];
    const pb = Dl.autoPlace(book, s, taken);
    const shelf = s.furn.find(p => p.t === 'wshelf');
    assert.equal(pb.on, shelf.id, 'книга на полке');
    assert.ok(Math.abs(pb.z - Dl.surfaceOf(shelf).z) < 1e-9);
    const pp = Dl.autoPlace(photo, s, taken);
    assert.ok(pp.flat && (pp.on === 'R' || pp.on === 'L'), 'фото — на стене');
    const roof = Dl.roomState('roof');
    const basil = C.addItem('plant', { name: 'Базилик', room: 'roof' });
    const pl = Dl.autoPlace(basil, roof, []);
    assert.equal(roof.furn.find(p => p.id === pl.on)?.t, 'planter', 'растение — в грядке');
    // вещь ставится на стол под пальцем, а мимо мебели — на пол
    const table = s.furn.find(p => p.t === 'ctable');
    const sf = Dl.surfaceOf(table);
    const cx = (sf.x0 + sf.x1) / 2, cy = (sf.y0 + sf.y1) / 2;
    const hit = Dl.hitUp(...Dl.P(cx, cy, sf.z), [sf]);
    assert.equal(hit.on, table.id);
    assert.ok(Math.abs(hit.x - cx) < 1e-6 && Math.abs(hit.z - sf.z) < 1e-9);
    assert.equal(Dl.hitUp(...Dl.P(9, 9, 0), [sf]).on, 'F');
    assert.equal(Dl.hitFlat(...Dl.P(5, 0, 3)).on, 'R');
    assert.equal(Dl.hitFlat(...Dl.P(0, 5, 3)).on, 'L');
    // двигаешь стол — вещь на нём едет вместе
    Dl._test.setCur({ id: 'living', s, items: [book], surf: [] });
    book.doll = { on: table.id, x: cx, y: cy, z: sf.z, s: 1 };
    Dl.commitFurn(table, { x: table.x + 1, y: table.y });
    assert.ok(Math.abs(book.doll.x - (cx + 1)) < 1e-6, 'вещь едет с мебелью');
    // обои на одну стену не трогают другую; «обе» — снова одинаковые
    Dl.applyWall(s, 'L', 'mint');
    assert.equal(s.wl, 'mint'); assert.equal(s.wr, 'brick');
    Dl.applyWall(s, 'both', 'rose');
    assert.equal(s.wl, 'rose'); assert.equal(s.wr, '');
    // детская: пока кроватку не собрали — коробки; собрали — кроватка
    delete C.M().nursery.crib; delete C.M().doll[Dl.dollKey('nursery')];
    const nur = Dl.roomState('nursery');
    assert.ok(nur.furn.some(p => p.t === 'boxes') && !nur.furn.some(p => p.t === 'crib'));
    C.cribRoll();
    assert.ok(Dl.roomState('nursery').furn.some(p => p.t === 'crib'), 'кроватку собрали');
    // вырезать фон: однотонный фон уходит, предмет остаётся и обрезается по краям
    const w = 20, h = 20, px = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) { const X = i % w, Y = (i / w) | 0; const obj = X >= 6 && X < 14 && Y >= 4 && Y < 18; px.set(obj ? [180, 40, 60, 255] : [240, 232, 220, 255], i * 4); }
    const cut = Dl.floodCut(px, w, h);
    assert.deepEqual(cut.bbox, [6, 4, 13, 17]);
    assert.equal(px[3], 0, 'угол прозрачный');
    assert.equal(px[(10 * w + 10) * 4 + 3], 255, 'середина предмета целая');
    assert.ok(cut.removed > 0.6 && cut.removed < 0.8);
    // свет по времени, погода
    assert.equal(Dl.phaseOf('23:40'), 'night'); assert.equal(Dl.phaseOf('18:10'), 'evening'); assert.equal(Dl.phaseOf('07:00'), 'dawn'); assert.equal(Dl.phaseOf(''), 'day');
    assert.equal(Dl.wxOf('за окном валит снег'), 'snow'); assert.equal(Dl.wxOf('ясно, без дождя'), '');
    // словами для «Картинкой»
    assert.match(Dl.describe('living'), /стены — Розовая полоска; пол — Ёлочка; мебель: .*диван/);
    // сброс — заново по лору
    Dl.resetRoom('living');
    assert.equal(Dl.roomState('living').wl, 'brick');
    // сцена собирается в HTML без падений, порядок отрисовки — сначала дальнее
    const html = Dl.sceneHtml(D.roomById('kitchen'));
    assert.match(html, /dl-scene ph-night|dl-scene ph-dusk/);
    assert.ok((html.match(/class="dl-fu/g) || []).length >= 10);
    for (const t of Object.keys(Kd.FURN)) assert.ok(Dl.thumbSvg(t).startsWith('<svg'), t);
}

console.log('дом · логика: все проверки прошли');
