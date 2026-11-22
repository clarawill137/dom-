// Дом 0.5: дома по эпохам (ядро «Священный таймлайн» и дата), сезонный декор и картинки «как сейчас», посылки,
// дела по дому, стена роста, магниты из поездок — без таверны.
import assert from 'node:assert/strict';

const ctx = { chat: [{ name: 'Хеди', mes: 'Дома.', is_user: true, swipe_id: 0 }, { name: 'Баки', mes: 'Он поставил чайник.', swipe_id: 0 }], chatMetadata: {}, extensionSettings: { wardrobe: { faces: {} } }, name1: 'Хеди', saveMetadataDebounced() {}, saveSettingsDebounced() {} };
globalThis.SillyTavern = { getContext: () => ctx };
globalThis.window = globalThis;
let date = '21.11.2024', time = '21:10', loc = 'квартира на Манхэттене, кухня';
let era = null;
globalThis.SacredTimeline = { context: () => (era ? { era: { id: era, lore: [] }, explicit: false } : null) };
const norm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е').trim();
const life = () => (ctx.chatMetadata.life ||= {});
let drawn = [], asked = [], replies = {};
const api = {
    worldState: () => ({ timestamp: { story_date: date, story_time: time }, scene: { location: loc } }),
    parseDate: (s) => { const m = String(s).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; },
    canonName: (n) => String(n || '').trim(), sameName: (a, b) => norm(a) === norm(b), shortName: (n) => String(n).split(' ')[0],
    groupMembers: () => ['Баки', 'Наташа'], chatMeta: () => life(), saveMeta() {}, updatePrompt() {}, hasChat: () => true,
    lore: { card: () => '', core: () => '' }, tastes: () => [],
    askJson: async (msgs, tokens, o) => { asked.push({ msgs, o }); const r = Object.entries(replies).find(([k]) => String(o?.what || '').includes(k)); return JSON.parse(JSON.stringify(r ? r[1] : {})); },
    refData: async (p) => `data:ref:${p}`, avatarUrl: () => '',
    drawPicture: async (prompt, o) => { drawn.push({ prompt, o }); return `user/images/${o.prefix}_${drawn.length}.png`; },
    style: () => 'карандаш',
    cal: { between: (a) => (a === '2025-03-10' ? [{ t: 'день рождения Баки', d: a, kind: 'birthday', who: ['Баки'] }] : []) },
    season: { holidays: (y) => [['valentine', 'День святого Валентина', new Date(y, 1, 14)], ['july4', 'День независимости', new Date(y, 6, 4)], ['halloween', 'Хэллоуин', new Date(y, 9, 31)], ['thanks', 'День благодарения', new Date(y, 10, y === 2024 ? 28 : 27)], ['xmas', 'Рождество', new Date(y, 11, 25)]] },
};
const C = await import('../core.js');
const D = await import('../data.js');
const Dl = await import('../doll.js');
const Se = await import('../season.js');
const Po = await import('../post.js');
const Ch = await import('../chores.js');
const Gr = await import('../growth.js');
const Bo = await import('../board.js');
await import('../wave.js');
C.setApi(api);
C._setPlanKeys({ titles: ['Задел: плейстейшн'], re: /плейстейшн|приставк|видеоигр/i });

// 1. эпоха: ядро главнее даты, без ядра — по дате
assert.equal(C.homeId(), '2024');
era = '2013'; assert.equal(C.homeId(), '2013', 'ядро говорит 2013 — квартира в Адской кухне');
assert.ok(D.roomById('hk_room') && !D.roomById('kitchen'));
assert.match(C.homeLine(), /Адской кухне.*Марика/s);
era = 'chronicle-x'; assert.equal(C.homeId(), '2024', 'чужая эпоха без дома — по дате');
era = null;
for (const [d, h] of [['10.12.1943', '1943'], ['05.11.2013', '2013'], ['20.06.2015', '2014'], ['10.01.2017', '2017'], ['01.03.2020', '2018'], ['21.11.2024', '2024']]) { date = d; assert.equal(C.homeId(), h, d); }

// 2. 1943 — палатка: полки по эпохе, дневник ведёт Фриц-Секач, мостики в Ангар
date = '10.12.1943';
assert.equal(D.home().name, 'Палатка капитана');
assert.equal(D.kindOf('diary').name, 'Дневник Фрица-Секача');
assert.equal(D.kindOf('diary').pic, 'dog');
assert.equal(D.kindOf('book').name, 'Книжки сержанта');
assert.deepEqual(D.roomsHere().map(r => r.id), ['tent', 'workshop40', 'depot40']);
assert.equal(D.roomById('depot40').link, 'angar:arm');
assert.equal(D.roomFor('diary'), 'tent');
const note43 = C.addItem('note', { name: 'Кофе в жестянке. Не трогать. — Т.' }, {});
assert.equal(note43.room, 'tent', 'вещь без комнаты — в комнату эпохи, где её полка');
await C.drawRoom(D.roomById('tent'));
assert.match(drawn.at(-1).prompt, /wall tent.*Captain Theodora.*1940s/s);
const tent = Dl.roomState('tent');
assert.equal(tent.wl, 'canvas'); assert.equal(tent.fl, 'dirt');
assert.ok(tent.furn.some(p => p.t === 'cot') && tent.furn.some(p => p.t === 'stove40'));
loc = 'палатка капитана';
assert.match(C.chronHook(1)?.rule || 'нет', /"order".*"fix".*"trip"/s, 'Летописцу — заказы, дела и поездки');

// 3. 2017 — два места: трейлер до весны, потом «Скиталец»; руками — главнее
date = '10.01.2017'; loc = 'трейлер';
assert.equal(C.siteId(), 'trailer');
assert.deepEqual(D.floors().map(f => f.id), ['tr', 'tr2']);
date = '20.04.2017';
assert.equal(C.siteId(), 'ship');
assert.deepEqual(D.roomsHere().map(r => r.id), ['cabin', 'galley', 'sbridge', 'hold', 'slab']);
assert.equal(D.roomById('sbridge').link, 'artur:bridge');
C.setSite('trailer'); assert.equal(C.siteId(), 'trailer'); assert.ok(C.siteManual());
C.setSite(''); assert.equal(C.siteId(), 'ship');
assert.equal(Po.can(), false, 'на «Скитальце» посылок нет');
assert.equal(Bo.styleOf(D.roomById('galley')).kind, 'patch', 'на переборке камбуза — нашивки');
const cab = Dl.roomState('cabin');
assert.ok(cab.furn.some(p => p.t === 'porthole'), 'иллюминатор');
assert.match(Dl.sceneHtml(D.roomById('cabin')), /#03050d/, 'за иллюминатором космос');

// 4. сезоны: даты праздников из Life, окна декора, сороковые — по-фронтовому
const sn = (d) => Se.seasonNow(d)?.id || '';
assert.equal(sn('2024-12-10'), 'xmas'); assert.equal(sn('2025-01-05'), 'xmas'); assert.equal(Se.seasonNow('2025-01-05').key, 'xmas:2024');
assert.equal(sn('2024-10-25'), 'halloween'); assert.equal(sn('2024-11-27'), 'thanks'); assert.equal(sn('2024-11-20'), 'autumn');
assert.equal(sn('2025-02-12'), 'valentine'); assert.equal(sn('2025-07-03'), 'july4'); assert.equal(sn('2025-08-10'), '');
assert.equal(sn('2025-03-10'), 'bday', 'день рождения из календаря Life');
assert.ok(!Se.isFest(Se.seasonNow('2024-11-20')) && Se.isFest(Se.seasonNow('2024-12-10')));
date = '20.12.1943';
assert.match(Se.decorLine(), /по-фронтовому.*гильзами/);
const t43 = Dl.roomState('tent');
assert.ok(t43.furn.some(p => p.t === 'xtree' && p.sz === 'xmas:1943'), 'в палатке — ёлка');
date = '10.01.1944';
assert.ok(!Dl.roomState('tent').furn.some(p => p.sz), 'праздник кончился — ёлку убрали');
// 2024: гостиная к Рождеству, убранное руками не возвращается в тот же сезон
era = null; date = '10.12.2024'; loc = 'квартира, гостиная';
const liv = Dl.roomState('living');
assert.ok(['xtree', 'gifts', 'garland'].every(t => liv.furn.some(p => p.t === t && p.sz)), 'ёлка, подарки, гирлянда');
assert.ok(Dl.roomState('kitchen').furn.some(p => p.t === 'wreath' && p.sz), 'на кухне венок');
liv.furn = liv.furn.filter(p => p.t !== 'xtree');
assert.ok(!Dl.roomState('living').furn.some(p => p.t === 'xtree'), 'выкинутая ёлка не вернулась');
C.cfg().season = 'off'; delete liv.sz;
assert.ok(!Dl.roomState('living').furn.some(p => p.sz), 'декор выключен — пусто');
C.cfg().season = 'auto';

// 5. картинки «как сейчас»: вариант по свету и празднику, пока нет — подкраска
date = '10.12.2024'; time = '23:30';
await C.drawRoom(D.roomById('kitchen'));
let pv = Se.roomPic('kitchen');
assert.equal(pv.tint, 'night'); assert.equal(pv.exact, false);
assert.equal(Se.nowKey(), 'xmas|night');
await Se.drawNow(D.roomById('kitchen'));
assert.match(drawn.at(-1).prompt, /Keep this exact room.*late night.*Christmas/s);
assert.deepEqual(drawn.at(-1).o.refs, [`data:ref:${C.roomImg('kitchen')}`]);
pv = Se.roomPic('kitchen');
assert.equal(pv.exact, true); assert.equal(pv.tint, ''); assert.notEqual(pv.img, C.roomImg('kitchen'));
time = '12:00';
assert.equal(Se.roomPic('kitchen').key, 'xmas|day');
assert.equal(Se.roomPic('kitchen').tint, '', 'днём без подкраски');

// 6. посылки: кубик доставки, трекинг по дням, у двери встречают, распаковка — в дом
date = '21.11.2024'; time = '21:10'; loc = 'квартира, кухня';
assert.deepEqual([1, 2, 4, 7, 12, 18, 20].map(Po.fateOf), ['lost', 'wrong', 'late2', 'late1', 'ok', 'early', 'gift']);
const p1 = Po.order({ name: 'плюшевая акула', from: 'маркетплейс', kind: 'plush', room: 'living' }, { roll: 12 });
assert.equal(p1.ordered, '2024-11-21');
assert.ok(p1.days >= 1 && p1.days <= 3 && p1.eta === Po.addDays('2024-11-21', p1.days));
assert.equal(Po.stOf(p1), 'way');
assert.match(Po.track(p1), /ещё \d/);
const p2 = Po.order({ name: 'лампа-гриб' }, { roll: 1 });
const p3 = Po.order({ name: 'кофемолка' }, { roll: 2 });
const p4 = Po.order({ name: 'кружка с котом' }, { roll: 20 });
date = '05.12.2024';
assert.equal(Po.stOf(p1), 'door'); assert.equal(Po.stOf(p2), 'lost'); assert.match(Po.track(p2), /потерялась/);
assert.equal(Po.tick(), 3, 'у двери встречают — один раз');
assert.match(p1.chk.t, /Баки/);
assert.match(C.promptNote("normal"), /у двери ждёт посылки: .*«плюшевая акула»/);
const u1 = Po.unpack(p1.id);
assert.equal(u1.it.kind, 'plush'); assert.equal(u1.it.room, 'living'); assert.equal(u1.it.src, 'parcel');
assert.equal(Po.stOf(p1), 'open');
const u3 = Po.unpack(p3.id);
assert.ok(u3.wrong && u3.it.desc.includes('кофемолка'), 'привезли не то');
const u4 = Po.unpack(p4.id);
assert.ok(u4.extra, '20 — сверху подарок');
// Летописец: заказ в посте — посылка из поста, свайп её убирает
const post = C.keyOf(ctx.chat[1]);
assert.deepEqual(Po.afterPost({ order: [{ name: 'набор отвёрток с котиками', from: 'Amazon' }] }, post), ['Посылка «набор отвёрток с котиками» — в пути']);
assert.ok(Po.all().some(p => p.src === 'post'));
// эпоха: 2013 — до подъезда (могут украсть), 1943 — сброс
era = '2013'; assert.match(Po.track({ st: 'way', eta: '2013-10-01', fate: 'lost' }, '2013-10-02'), /украли из подъезда/);
era = '1943'; assert.match(Po.track({ st: 'way', eta: '1943-12-01', fate: 'ok' }, '1943-12-02'), /сброс/);
era = null;
// «что бы заказать» — заделы не проходят
replies['что заказать'] = { items: [{ name: 'набор отвёрток с котиками', desc: 'для кухонной лабы', price: 25 }, { name: 'приставка', desc: 'для Баки', price: 500 }] };
const ideas = await Po.ideas();
assert.deepEqual(ideas.map(x => x.name), ['набор отвёрток с котиками'], 'задел «приставка» отсеян');
assert.match(asked.at(-1).msgs[1].content, /Задел: плейстейшн/);

// 7. дела по дому: что умеет Баки, кубик, слова модели, полка встаёт в домик
assert.equal(Ch.catOf('починить кран на кухне'), 'fine'); assert.equal(Ch.catOf('настроить роутер'), 'tech'); assert.equal(Ch.catOf('повесить полку в детской'), 'wood');
assert.equal(Ch.modOf({ t: 'настроить роутер' }, 'Баки').mod, -4, 'технику века он догоняет');
assert.equal(Ch.modOf({ t: 'передвинуть шкаф' }, 'Баки').mod, 3);
assert.equal(Ch.modOf({ t: 'настроить роутер' }, 'Баки', 'Хеди').mod, -2, 'Хеди помогает с техникой');
assert.equal(Ch.tierOf(1, 9), 'disaster'); assert.equal(Ch.tierOf(20, 15), 'perfect'); assert.equal(Ch.tierOf(5, 6), 'fail'); assert.equal(Ch.tierOf(9, 11), 'meh'); assert.equal(Ch.tierOf(14, 16), 'good');
const c1 = Ch.add('повесить полку', { room: 'bedroom' });
assert.ok(c1 && !Ch.add('Повесить полку'), 'повтор не добавился');
replies['дела по дому'] = { res: 'Баки повесил полку идеально ровно и проверил уровнем три раза.' };
const before = Dl.roomState('bedroom').furn.filter(p => p.t === 'wshelf').length;
const r1 = await Ch.attempt(c1.id, { who: 'Баки', roll: 15, addPiece: (room, t) => Dl.addPiece(Dl.roomState(room), t) });
assert.equal(r1.total, 16); assert.equal(r1.tier, 'good'); assert.equal(r1.st, 'done');
assert.match(r1.res, /уровнем/);
assert.equal(Dl.roomState('bedroom').furn.filter(p => p.t === 'wshelf').length, before + 1, 'полка встала в спальню');
const c2 = Ch.add('починить кран');
replies['дела по дому'] = {};
const r2 = await Ch.attempt(c2.id, { who: 'Баки', roll: 1 });
assert.equal(r2.tier, 'disaster'); assert.match(r2.res, /одно дело больше/);
assert.ok(Ch.open().some(x => /разгрести последствия: починить кран/.test(x.t)), 'катастрофа — новое дело');
assert.ok(Ch.toScene(r1.id)); assert.match(C.M().shots.at(-1).text, /Баки взялся — «повесить полку».*Кубик 15 \+ 1/s);
assert.deepEqual(Ch.afterPost({ fix: 'смазать дверь в спальню' }, post), ['В список дел: смазать дверь в спальню']);
assert.match(C.promptNote('normal'), /в списке дел по дому: .*Баки может взяться сам/);
const cn = Ch.add('разобрать коробки');
const rn = await Ch.attempt(cn.id, { who: 'Наташа', roll: 8 });
assert.match(rn.res, /Наташа/); assert.ok(Ch.fem('Наташа'));

// 8. стена роста: Морган по возрасту (ВОЗ), малышка из Зёрнышка, отметки, дельта
assert.equal(Gr.medianAt('F', 6), 115); assert.ok(Math.abs(Gr.medianAt('F', 6.45) - 118) <= 1);
const mo = Gr.personById('morgan');
assert.ok(mo && Math.abs(Gr.suggest(mo) - 118) <= 1, `Морган ≈ 118 см, вышло ${Gr.suggest(mo)}`);
Gr._setZr({ kids: () => [{ id: 'k1', stage: 'baby', birth: { at: 1 }, genes: { sex: { v: 'F' } } }], kidName: () => 'Уинни', age: () => ({ months: 14 }), growthNow: () => ({ l: 77.3 }) });
const ps = Gr.people();
assert.deepEqual(ps.map(p => p.name), ['Морган', 'Уинни']);
assert.equal(Gr.suggest(Gr.personById('zr:k1')), 77.3);
date = '01.07.2024';
Gr.mark({ kid: 'morgan', cm: 114, by: 'Хеди' });
date = '21.11.2024';
const m2 = Gr.mark({ kid: 'morgan', cm: 117.5, by: 'Баки', note: 'на цыпочках не считается' });
assert.equal(Gr.delta(m2), '+3.5 см за 5 мес');
assert.ok(Gr.toScene(m2.id)); assert.match(C.M().shots.at(-1).text, /Морган, 117.5 см \(\+3.5 см за 5 мес\), отметил Баки.*«динозавр»/s);
assert.match(C.promptNote('normal'), /на дверном косяке кухни — отметки роста: Морган — 117.5 см \(21.11.2024\)/);
assert.match(Gr.frameHtml(), /dm-mark/);
era = '2014'; assert.equal(Gr.can(), false, 'стена роста — только в доме 2024-го'); era = null;

// 9. магниты: на холодильник, по эпохе — открытки, из поста — поездка
const mg = Bo.add({ place: 'Бухарест', when: 'весна 2016-го', line: 'он купил ей сливы на рынке' });
assert.equal(mg.room, 'kitchen'); assert.equal(mg.style, 'magnet');
assert.ok(!Bo.add({ place: 'бухарест' }), 'повтор не вешается');
await Bo.draw(mg);
assert.match(drawn.at(-1).prompt, /fridge magnet souvenir from Бухарест.*сливы/s);
assert.match(C.promptNote('normal'), /на холодильнике — магниты из мест, где были: Бухарест/);
assert.deepEqual(Bo.afterPost({ trip: 'Ваканда' }, post), ['Новый магнит: Ваканда']);
Bo.move(mg.id, 150, -20); assert.deepEqual([mg.x, mg.y], [94, 10], 'за край дверцы не уезжает');
era = '1943';
assert.equal(Bo.styleOf().kind, 'card'); assert.equal(Bo.styleOf().title, 'Открытки и трофеи');
era = null;

// 10. свайп поста убирает то, что из него пришло
ctx.chat[1] = { name: 'Баки', mes: 'Другой ответ.', swipe_id: 1 };
C.bump();
assert.ok(!Po.all().some(p => p.src === 'post'), 'посылка из свайпнутого поста ушла');
assert.ok(!Ch.open().some(x => x.src === 'post'), 'дело — тоже');
assert.ok(!Bo.list().filter(x => Bo.on('kitchen').includes(x)).some(x => x.src === 'post'), 'магнит — тоже');

console.log('дом 0.5 · эпохи и седьмая волна: все проверки прошли');
