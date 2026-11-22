// ✦ Дом — данные: дом по этажам (по лору: довоенный кирпичный дом на Манхэттене, внизу лавка Марко, 2 этаж — жилой,
// 3 — тренировочный зал, 4 — лаборатория), полки уюта, настроения хэдов, покупки.

/** Этажи сверху вниз. n — номер на табличке. */
export const FLOORS = [
    { id: 'roof', n: '', name: 'Крыша', short: 'крыша', rooms: ['roof'] },
    { id: 'f4', n: '4', name: 'Лаборатория Хеди', short: 'лаба', rooms: ['lab'] },
    { id: 'f3', n: '3', name: 'Тренировочный зал', short: 'зал', rooms: ['gym'] },
    { id: 'f2', n: '2', name: 'Квартира', short: 'квартира', rooms: ['kitchen', 'living', 'bedroom', 'nursery'] },
    { id: 'f1', n: '1', name: 'Лавка Марко', short: 'лавка', rooms: ['shop'] },
    { id: 'yard', n: '', name: 'Двор', short: 'двор', rooms: ['garage'] },
];

/** Комнаты. shelves — полки уюта в комнате; link — комната ведёт в соседнее расширение (мостик). */
export const ROOMS = [
    { id: 'kitchen', name: 'Кухня', ico: 'cup', re: /кухн|столов|kitchen|dining/i, shelves: ['hc', 'note', 'recipe', 'joy'],
        en: 'kitchen in a pre-war Manhattan apartment: exposed red brick, a big retro fridge covered in photos and magnets, a framed photo of an old-fashioned 1930s woman on the wall, Christmas lights' },
    { id: 'living', name: 'Гостиная', ico: 'sofa', re: /гостин|зал(?![а-яё])|living|лаунж|диван/i, shelves: ['book', 'plush', 'card', 'catch', 'date', 'song', 'hobby', 'diary'],
        en: 'living room in a pre-war Manhattan apartment: exposed red brick, a deep sofa with a merino throw, bookshelves, a record player, a cat bed, warm lamps, snow behind tall windows' },
    { id: 'bedroom', name: 'Спальня', ico: 'bed', re: /спальн|bedroom/i, shelves: [],
        en: 'cosy bedroom: brick wall, big bed with soft linen, a reading lamp, a leather jacket on a chair' },
    { id: 'nursery', name: 'Детская', ico: 'baby', re: /детск|nursery/i, shelves: ['nursery', 'name'],
        en: 'a nursery being prepared for a baby girl: soft light, a crib, a rocking chair, brick wall painted in a gentle colour' },
    { id: 'gym', name: 'Тренировочный зал', ico: 'dumbbell', re: /тренировочн|спортзал|зал для|тренаж|gym/i, link: 'angar:spar',
        en: 'a private training hall on the third floor: red brick walls, mats, punching bags, a pull-up bar, weights, tall arched windows' },
    { id: 'lab', name: 'Лаборатория', ico: 'flask', re: /лаборатор|мастерск|workshop|lab/i, link: 'angar:lab',
        en: "a genius inventor's laboratory on the fourth floor: workbenches, holographic screens, half-built gadgets, a small round helper robot, brick walls" },
    { id: 'roof', name: 'Крыша', ico: 'leaf', re: /крыш|терраса|огород|roof/i, shelves: ['plant'],
        en: 'a small rooftop garden on a pre-war Manhattan building: planters, a tiny greenhouse, string lights, the city skyline' },
    { id: 'shop', name: 'Лавка Марко', ico: 'store', re: /лавк|марко|бакале|магазин внизу/i, shelves: [],
        en: "a small old Italian grocery shop on the ground floor: cheeses, bread, jars, an old radio playing Italian songs, warm light" },
    { id: 'garage', name: 'Гараж', ico: 'car', re: /гараж|garage/i, link: 'angar:gar',
        en: 'a garage with a muscle car in deep eggplant colour and a motorcycle, tools on the wall' },
];
export const roomById = (id) => ROOMS.find(r => r.id === id) || null;
export const floorOf = (roomId) => FLOORS.find(f => f.rooms.includes(roomId)) || null;

/** Куда в комнате: для «расставить». */
export const SPOTS = [['shelf', 'на полке'], ['wall', 'на стене'], ['table', 'на столе'], ['window', 'на подоконнике'], ['floor', 'на полу'], ['bed', 'на кровати'], ['sofa', 'на диване'], ['fridge', 'на холодильнике']];
export const spotName = (id) => SPOTS.find(s => s[0] === id)?.[1] || '';
/** Куда ставится вещь по умолчанию. */
export const DEFAULT_SPOT = { book: 'shelf', plush: 'shelf', photo: 'wall', plant: 'window', hobby: 'table', nursery: 'floor', decor: 'shelf' };

/** Полки уюта. pic: product — предмет на светлом фоне, dish — блюдо, scene — момент с людьми, cat — кошка, null — без картинки.
 *  place — вещь можно поставить в комнату. gen — что просить у модели; extra — свои поля схемы. */
export const KINDS = {
    hc: { name: 'Холодильник', one: 'хэд', ico: 'fridge', room: 'kitchen', special: true },
    note: { name: 'Записки', one: 'записка', ico: 'note', room: 'kitchen', pic: null,
        gen: 'записки, которые они оставляют друг другу на холодильнике: коротко, их голосом и почерком (Баки — пропись 40-х, Хеди — каракули), смешно или нежно', extra: '"from":"кто пишет","to":"кому"' },
    recipe: { name: 'Кухня Баки', one: 'рецепт', ico: 'pan', room: 'kitchen', pic: 'dish',
        gen: 'рецепты мамы Баки (Уинифред Барнс, Бруклин 1930-х) и его версии: он готовит строго по рецепту и опытом выводит лучшую версию; иногда — что любит Хеди', extra: '"ver":1,"rule":"его правило для этого блюда"' },
    joy: { name: 'Банка хорошего', one: 'записка', ico: 'jar', room: 'kitchen', pic: 'scene',
        gen: 'счастливые моменты их истории — по одной фразе: что было хорошо, тепло, смешно (без драмы); бери из свода истории', extra: '"day":"когда, по истории"' },
    book: { name: 'Полка Баки', one: 'книга', ico: 'book', room: 'living', pic: 'product', place: true,
        gen: 'книги на его полке: про полярников, научпоп про технику, художка; настоящие книги можно (название и автор, без цитат); почему ему', extra: '"author":"","page":0' },
    plush: { name: 'Плюшевый зоопарк', one: 'зверь', ico: 'bear', room: 'living', pic: 'product', place: true,
        gen: 'плюшевые звери Хеди (в Красной комнате игрушек не было, теперь она тащит домой всех — особенно нелепых): имя, кто это, какой на ощупь, откуда (кто подарил, где нашли)' },
    card: { name: 'Колода «вечер вдвоём»', one: 'карта', ico: 'cards', room: 'living', pic: null,
        gen: 'вопросы для тихого вечера вдвоём, как «36 вопросов», но про них: тёплые, неожиданные, иногда смешные; name — сам вопрос' },
    catch: { name: 'Догоняем век', one: 'пункт', ico: 'tv', room: 'living', pic: 'product',
        gen: 'что Баки пропустил за 70 лет (фильмы, музыка, еда, техника, места, привычки мира) — по одному пункту; что он об этом думает, если уже видел', extra: '"cat":"фильм|музыка|еда|техника|место|другое","take":"его мнение его голосом, если видел; иначе пусто"' },
    date: { name: 'Банка свиданий', one: 'свидание', ico: 'heart', room: 'living', pic: 'scene',
        gen: 'идеи свиданий под их эпоху и город — конкретно: где, что делают, чем кончится', extra: '"when":"когда лучше","cost":"сколько примерно"' },
    song: { name: 'Их песни', one: 'песня', ico: 'disc', room: 'living', pic: 'scene',
        gen: 'их песни: его из 40-х и её современные, песни их моментов — настоящие песни (название и исполнитель, без слов песни) и почему это их песня', extra: '"artist":"","year":0' },
    hobby: { name: 'Хобби-полка', one: 'занятие', ico: 'puzzle', room: 'living', pic: 'product', place: true,
        gen: 'их общие и личные хобби с прогрессом: пазл, лего, вязание, модели — конкретно и по-ихнему', extra: '"n":0,"max":100,"unit":"деталей|шагов|страниц"' },
    diary: { name: 'Дневник Альпин', one: 'запись', ico: 'cat', room: 'living', pic: 'cat',
        gen: 'дневник Альпин — белой кошки Баки (он её «батя», Хеди — «мама»): запись за день от её лица, 3–5 предложений, по последним событиям, смешно и мило', extra: '"day":""' },
    name: { name: 'Имена для малыша', one: 'имя', ico: 'baby', room: 'nursery', pic: null,
        gen: 'имена для их дочки: что значит, почему подходит им, чьё оно могло бы быть (семья, история)', extra: '"meaning":"значение"' },
    nursery: { name: 'Детская', one: 'вещь', ico: 'crib', room: 'nursery', pic: 'product', place: true,
        gen: 'вещи для детской их дочки: кроватка, ночник, мобиль, пледы, игрушки — конкретно, со вкусом их обоих' },
    plant: { name: 'Огород', one: 'растение', ico: 'leaf', room: 'roof', pic: 'product', place: true,
        gen: 'растения в их огороде на крыше и на подоконниках: Баки растит по графику (в Ваканде у него были сливы), у Хеди всё сохнет', extra: '"care":"как ухаживать"' },
    decor: { name: 'Вещи', one: 'вещь', ico: 'lamp', room: null, pic: 'product', place: true,
        gen: 'вещи для их дома: декор, свет, текстиль, посуда, рамки — со вкусом их обоих и с историей', extra: '"price":0' },
    photo: { name: 'Фото', one: 'фото', ico: 'frame', room: null, pic: 'photo', place: true, gen: '' },
};
export const kindOf = (k) => KINDS[k] || KINDS.decor;
/** Какие полки показываются в комнате вещей (расставляемые). */
export const PLACE_KINDS = Object.keys(KINDS).filter(k => KINDS[k].place);

/** Настроения хэдов. ask — что просить у модели. */
export const VIBES = [
    { id: 'cute', ico: '🌸', name: 'Мило', ask: 'нежное и милое: маленькие знаки любви, забота, уютные мелочи' },
    { id: 'home', ico: '🏠', name: 'Быт', ask: 'бытовое: как они живут — привычки дома, еда, покупки, уборка, утро и вечер' },
    { id: 'fun', ico: '😂', name: 'Смешно', ask: 'смешное: нелепые привычки, бытовые конфузы, их подколы — смешно без злости' },
    { id: 'pair', ico: '💞', name: 'Про них', ask: 'про них двоих: их ритуалы, как флиртуют спустя годы, как мирятся, их маленький мир' },
    { id: 'soul', ico: '🧠', name: 'Психология', ask: 'психологическое, но тёплое: как он любит, что в нём смягчилось, как она учится доверять — без ран и драмы, с хорошим концом' },
    { id: 'odd', ico: '🙃', name: 'Абсурд', ask: 'абсурдное, но правдоподобное именно для них: суперсолдат и гений в быту, странные правила дома' },
    { id: 'gold', ico: '✨', name: 'Золотой', ask: 'самый тёплый: маленькая правда о любви, от которой хочется улыбнуться и немного заплакать (хорошо заплакать)' },
];
export const vibeById = (id) => VIBES.find(v => v.id === id) || VIBES[0];
export const vibeOfRoll = (n) => (n >= 20 ? 'gold' : n >= 16 ? 'pair' : n >= 12 ? 'fun' : n >= 7 ? 'cute' : n >= 2 ? 'home' : 'odd');
export const DICE_HINT = '1 — абсурд · 2–6 — быт · 7–11 — мило · 12–15 — смешно · 16–19 — про них · 20 — золотой';
export const BATCH = 4;
export const MAGNETS = ['#ff8fa3', '#ffd166', '#7bdff2', '#b8f2a6', '#cdb4ff', '#ffb38a'];

/** Кубик свиданий: тон идеи по броску. */
export const dateTone = (n) => (n >= 20 ? 'идеальное — то самое, которое запомнят навсегда' : n >= 15 ? 'красивое и романтичное' : n >= 8 ? 'уютное и простое' : n >= 3 ? 'смешное, с бытовым приключением' : 'нелепое: всё пойдёт не так, и это будет лучшее');

/** Кроватка по инструкции: d20 → как прошла сборка. */
export const CRIB = [
    [1, 'Собрал. Осталось семь лишних шурупов и одна загадочная деталь. Кроватка стоит. Он не спит, пока не поймёт, откуда деталь.'],
    [4, 'Инструкция на шведском, картинки — для людей с тремя руками. У него две и одна вибраниевая — вышло, но ушло четыре часа.'],
    [8, 'Собрал с первого раза, но перекрутил шуруп вибраниевой рукой — теперь кроватку не разобрать никогда.'],
    [12, 'Ровно по инструкции, деталь к детали, как мама учила с рецептами. Хеди засекла время и надулась: быстрее, чем её прототип.'],
    [16, 'Собрал идеально и ещё усилил раму — кроватка выдержит падение метеорита. Хеди проверила: выдержит.'],
    [20, 'Собрал, отшлифовал края, вырезал на изголовье маленькую звезду. Ничего не сказал. Хеди нашла звезду сама.'],
];
export const cribOf = (n) => { let r = CRIB[0][1]; for (const [k, t] of CRIB) if (n >= k) r = t; return r; };

/** Покупки: разделы витрины. */
export const SHOP_CATS = [
    ['decor', 'Декор'], ['light', 'Свет'], ['textile', 'Текстиль'], ['plants', 'Растения'], ['dishes', 'Посуда'],
    ['frames', 'Рамки'], ['books', 'Книги'], ['plush', 'Плюшевые'], ['baby', 'Для малыша'], ['vintage', 'Барахолка'],
];
export const SHOP_KIND = { plush: 'plush', books: 'book', plants: 'plant', baby: 'nursery' };
