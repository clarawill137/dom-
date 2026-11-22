// ✦ Дом — дома по эпохам. Эпоха — из ядра «Священный таймлайн» (SacredTimeline.context().era.id), без ядра — по дате
// истории (те же границы, что в Реестре). У каждой эпохи свои этажи, комнаты, раскладки кукольного домика, описания
// для картинок и строка модели; у 2017 и 2018 — два места: трейлер ↔ «Скиталец», квартира ↔ «Скиталец».
// Лор — из лорбуков эпох (их книги ищет roomLore по re комнаты); здесь только то, что в них сказано, и походная мебель.
//
// Комната: id, name, ico, re (место Horae и записи лорбуков), shelves (полки уюта), en (картинка), board (что вместо
// холодильника: хэды и записки), link (комната — мостик в Ангар или Арт), bridges (мостики-кнопки в обычной комнате),
// door (косяк со стеной роста), deco (не комната — табличка на фасаде).

// ───────────── 2024 — дом над лавкой Марко (как было) ─────────────

const F2024 = [
    { id: 'roof', n: '', name: 'Крыша', short: 'крыша', rooms: ['roof'], ico: 'leaf' },
    { id: 'f4', n: '4', name: 'Лаборатория Хеди', short: 'лаба', rooms: ['lab'] },
    { id: 'f3', n: '3', name: 'Тренировочный зал', short: 'зал', rooms: ['gym'] },
    { id: 'f2', n: '2', name: 'Квартира', short: 'квартира', rooms: ['kitchen', 'living', 'bedroom', 'nursery'] },
    { id: 'f1', n: '1', name: 'Лавка Марко', short: 'лавка', rooms: ['shop'] },
    { id: 'yard', n: '', name: 'Двор', short: 'двор', rooms: ['garage'], ico: 'car' },
];
const R2024 = [
    { id: 'kitchen', name: 'Кухня', ico: 'cup', re: /кухн|столов|kitchen|dining/i, shelves: ['hc', 'note', 'recipe', 'joy'], board: 'fridge', door: true,
        en: 'kitchen in a pre-war Manhattan apartment: exposed red brick, a big retro fridge covered in photos and magnets, a framed photo of an old-fashioned 1930s woman on the wall, Christmas lights' },
    { id: 'living', name: 'Гостиная', ico: 'sofa', re: /гостин|зал(?![а-яё])|living|лаунж|диван/i, shelves: ['book', 'plush', 'card', 'catch', 'date', 'song', 'hobby', 'diary'],
        en: 'living room in a pre-war Manhattan apartment: exposed red brick, a deep sofa with a merino throw, bookshelves, a record player, a cat bed, warm lamps, tall windows' },
    { id: 'bedroom', name: 'Спальня', ico: 'bed', re: /спальн|bedroom/i, shelves: [],
        en: 'cosy bedroom: brick wall, big bed with soft linen, a reading lamp, a leather jacket on a chair' },
    { id: 'nursery', name: 'Детская', ico: 'baby', re: /детск|nursery/i, shelves: ['nursery', 'name'],
        en: 'a nursery being prepared for a baby girl: soft light, a crib, a rocking chair, brick wall painted in a gentle colour' },
    { id: 'gym', name: 'Тренировочный зал', ico: 'dumbbell', re: /тренировочн|спортзал|зал для|тренаж|gym/i, link: 'angar:spar', linkName: 'Спарринг-зал Ангара',
        linkTxt: 'Тренировочный зал — спарринг в Ангаре: Баки учит Хеди, кубик, синяки, навыки растут и уходят в досье квартирмейстера.',
        en: 'a private training hall on the third floor: red brick walls, mats, punching bags, a pull-up bar, weights, tall arched windows' },
    { id: 'lab', name: 'Лаборатория', ico: 'flask', re: /лаборатор|мастерск|workshop|lab/i, link: 'angar:lab', linkName: 'Лаба Ангара',
        linkTxt: 'Лаборатория Хеди — это лаба Ангара: проекты, полигон, кубик инсайтов, кладбище прототипов.',
        en: "a genius inventor's laboratory on the fourth floor: workbenches, holographic screens, half-built gadgets, a small round helper robot, brick walls" },
    { id: 'roof', name: 'Крыша', ico: 'leaf', re: /крыш|терраса|огород|roof/i, shelves: ['plant'],
        en: 'a small rooftop garden on a pre-war Manhattan building: planters, a tiny greenhouse, string lights, the city skyline' },
    { id: 'shop', name: 'Лавка Марко', ico: 'store', re: /лавк|марко|бакале|магазин внизу/i, shelves: [],
        en: 'a small old Italian grocery shop on the ground floor: cheeses, bread, jars, an old radio playing Italian songs, warm light' },
    { id: 'garage', name: 'Гараж', ico: 'car', re: /гараж|garage/i, link: 'angar:gar', linkName: 'Гараж Ангара',
        linkTxt: 'Гараж — в Ангаре: «Додж» баклажанового цвета, мотоцикл, бак, урон, номера.',
        en: 'a garage with a muscle car in deep eggplant colour and a motorcycle, tools on the wall' },
];

// ───────────── «Скиталец» — отсеки корабля (2017 и 2018) ─────────────

const SHIP_FLOOR = (site) => ({ id: `ship-${site}`, site, n: '', name: '«Скиталец»', short: 'корабль', rooms: ['cabin', 'galley', 'sbridge', 'hold', 'slab'], ico: 'star' });
const SHIP_ROOMS = [
    { id: 'cabin', name: 'Каюта', ico: 'bed', re: /кают|койк|cabin|bunk/i, shelves: ['plush', 'hobby', 'song'],
        en: 'a cramped sleeping cabin aboard a small starship that its pilot built herself: a built-in bunk with a wool blanket, metal bulkhead panels with rivets, a round porthole full of stars, a fold-down desk, personal clutter' },
    { id: 'galley', name: 'Камбуз', ico: 'cup', re: /камбуз|кухн|galley/i, shelves: ['hc', 'note', 'joy'], board: 'galley',
        en: 'a tiny starship galley: a steel counter with a coffee machine, a small fridge unit, a bolted table with two stools, a porthole with stars, mugs everywhere' },
    { id: 'sbridge', name: 'Мостик', ico: 'star', re: /мостик|кабин[аеу] пилот|штурвал|bridge|cockpit/i, link: 'artur:bridge', linkName: 'Мостик в А.Р.Т.У.Р.е',
        linkTxt: 'Мостик «Скитальца» — в А.Р.Т.У.Р.е: запасы по дням, системы, прыжки, бортжурнал.',
        en: 'the cockpit bridge of a small starship: a curved console with glowing screens, two pilot seats, a wide viewport onto deep space and stars' },
    { id: 'hold', name: 'Трюм', ico: 'box', re: /трюм|hold|отсек/i, link: 'angar:gar', linkName: 'Трюм в Ангаре',
        linkTxt: 'Трюм «Скитальца» — в Ангаре: корабль, топливо варпа, урон по отсекам, всё железо на борту.',
        en: 'the cargo hold of a small starship: strapped metal containers, pipes along the bulkheads, dim work lights' },
    { id: 'slab', name: 'Бортовая лаба', ico: 'flask', re: /бортов[аоу][йя]? лаб|лаборатор|мастерск|lab/i, link: 'angar:lab', linkName: 'Бортовая лаба Ангара',
        linkTxt: 'Бортовая лаба — в Ангаре: проекты Хеди, кубик инсайтов, полигон.',
        en: "a small onboard laboratory on a starship: a workbench with half-built gadgets, a holographic table, a little round helper robot, a porthole" },
];

// ───────────── эпохи ─────────────

export const HOMES = {
    '2024': {
        id: '2024', name: 'Дом над лавкой Марко', sub: 'кирпич, довоенный, над лавкой Марко', style: 'brick',
        whose: 'in the home of Hedy and Bucky, a pre-war red-brick building in Manhattan',
        line: 'довоенный кирпичный дом на Манхэттене над итальянской лавкой Марко: 2 этаж — их квартира, 3 — тренировочный зал, 4 — лаборатория Хеди, на крыше огород',
        re: /(?<![а-яё])дом(?![а-яё])|дома\b|квартир|кухн|гостин|спальн|детск|ванн|манхэттен|лавк|марко|крыш|холодильник|полк|диван/i,
        floors: F2024, rooms: R2024, books: [], hint: 'Тап по комнате — зайти: полки, вещи, картинки. Лаборатория, зал и гараж — мостики в Ангар.',
        board: { fridge: ['Холодильник', 'магниты', 'Магниты из поездок'] }, growth: true, pet: 'cat',
        shop: 'довоенный кирпичный дом на Манхэттене, уют, немного винтажа, у Хеди — гиковские штуки, у Баки — 40-е',
        post: { name: 'Посылки', via: 'курьер до двери', days: [1, 3], abroad: [6, 12] },
        chores: { title: 'Дела Баки по дому', who: 'Баки', place: 'по дому' },
    },
    '1943': {
        id: '1943', name: 'Палатка капитана', sub: 'лагерь коммандос и маки в лесах Юры', style: 'tent',
        whose: 'inside the field wall tent of Captain Theodora "Teo" Erskine (Strategic Scientific Reserve) in a hidden Allied camp in the Jura forests, occupied France, winter 1943',
        line: 'палатка капитана Тео Эрскин (С.Н.Р.) в тайном лагере коммандос и маки в лесах Юры: оккупированная Франция, зима 1943-го; рядом палатки Ревущих коммандос, полевой госпиталь, мастерская Старка; Фриц-Секач',
        re: /палатк|лагер|маки|юр[аеуы]\b|юрск|костр|шинел|полог|тент/i,
        floors: [
            { id: 'camp', n: '', name: 'Лагерь в лесу', short: 'лагерь', rooms: ['tent'], ico: 'leaf' },
            { id: 'camp2', n: '', name: 'Рядом', short: 'рядом', rooms: ['workshop40', 'depot40'], ico: 'flask' },
            { id: 'camp3', n: '', name: 'Ещё в лагере', short: 'лес', deco: ['палатки Ревущих коммандос', 'полевой госпиталь', 'костёр и котелок'], ico: 'leaf' },
        ],
        rooms: [
            { id: 'tent', name: 'Палатка капитана', ico: 'tent', re: /палатк|тент|полог|койк|раскладушк|лагер/i, shelves: ['hc', 'note', 'card', 'song', 'book', 'joy', 'diary'], board: 'board',
                en: 'the inside of a WWII US Army officer\'s wall tent in a snowy forest camp: olive canvas walls and a tent pole, a folding cot with a wool army blanket, a footlocker, a field desk made of supply crates with maps and a kerosene lamp, a small iron stove with a pipe through the roof, a field radio, a map pinned to a board, a greatcoat on a hook, an army blanket on the ground where a German shepherd sleeps, snow at the tent flap' },
            { id: 'workshop40', name: 'Мастерская Старка', ico: 'flask', re: /мастерск|старк|лаборатор|workshop/i, link: 'angar:lab', linkName: 'Мастерская С.Н.Р. в Ангаре',
                linkTxt: 'Мастерская С.Н.Р. — в Ангаре: проекты Хеди и Говарда Старка, кубик инсайтов. Говард не знает, что работает с собственной внучкой.',
                en: 'a WWII field workshop tent of an SSR engineer: workbenches with tools, radio parts, prototypes under canvas, lamps, crates' },
            { id: 'depot40', name: 'Склад С.Н.Р.', ico: 'box', re: /склад|оружейн|интендант|depot|armory/i, link: 'angar:arm', linkName: 'Оружейная Ангара',
                linkTxt: 'Склад и оружейная С.Н.Р. — в Ангаре: стволы, патроны, разгрузка, трофеи.',
                en: 'a WWII supply depot tent: racks of rifles, ammunition crates, jerry cans, stencilled boxes' },
        ],
        books: ['1940s — война, СНР, историческая достоверность', '1943 · Рассказчик — сиды', '1943 · Ревущие коммандос — Хеди'],
        hint: 'Палатка — её дом на войне. Мастерская и склад — мостики в Ангар (эпоха С.Н.Р.).',
        board: { board: ['Доска над койкой', 'открытки', 'Открытки и трофеи'] }, pet: 'dog',
        kinds: {
            hc: { name: 'Доска над койкой' },
            note: { name: 'Записки и письма', gen: 'записки, которые капитан и сержант оставляют друг другу в лагере (под кружкой, в кармане шинели), и письма полевой почтой: коротко, их голосом — Тео сухо и по-командирски, сержант по-бруклински, с флиртом; война, 1943' },
            card: { name: 'Вопросы у фонаря', gen: 'вопросы для тихого вечера в палатке у керосиновой лампы, как «36 вопросов», но про них и про войну без мрака: тёплые, неожиданные, иногда смешные; name — сам вопрос' },
            song: { name: 'Песни 40-х', gen: 'песни их войны: что играет по радио и на патефоне в лагере, что поёт сержант — настоящие песни до 1944 года (название и исполнитель, без слов песни) и почему это их песня' },
            book: { name: 'Книжки сержанта', gen: 'книжки, которые сержант Барнс читает в лагере: карманные армейские издания, вестерны, комиксы, то, что ходит по рукам у коммандос, — настоящие книги до 1944 года (название и автор, без цитат); почему ему' },
            joy: { name: 'Жестянка хорошего', gen: 'хорошие минуты их войны — по одной фразе: тепло, смешно, вместе (без смертей и ужаса); бери из свода истории' },
            diary: { name: 'Дневник Фрица-Секача', gen: 'дневник Фрица-Секача — немецкой овчарки из замка Кауфманн, отрядного талисмана (слушается только капитана и сержанта, спит на Дугане, ворует тушёнку, рычит на немецкую речь): запись за день от его лица, 3–5 предложений, по последним событиям, смешно и мило', pic: 'dog' },
        },
        shop: 'палатка капитана в лесном лагере, война 1943-го: интендантский склад С.Н.Р., сбросы из Лондона, чёрный рынок в городке, посылки из дома полевой почтой — всё строго той эпохи',
        post: { name: 'Сбросы и полевая почта', via: 'ночной сброс или полевая почта', days: [2, 5], abroad: [8, 16], drop: true },
        chores: { title: 'Дела по лагерю', who: 'Баки', place: 'по лагерю' },
        snow: [
            ['coffee', '☕ Кофе из жестянки', 'кофе из жестяной кружки у печки, снег шуршит по брезенту палатки'],
            ['dog', '🐕 Фриц в сугробе', 'Фриц-Секач впервые за зиму валяется в сугробе, Дуган хохочет, капитан делает вид, что не улыбается'],
            ['snowball', '❄️ Снежки у костра', 'коммандос затевают снежки между палатками, сержант целится в капитана — и тут же жалеет'],
            ['letters', '✉️ Письма у печки', 'вечер у печки: пишут письма, сержант читает вслух куски из писем домой'],
        ],
        shots: ['pair', 'dog', 'view'],
    },
    '2013': {
        id: '2013', name: 'Квартира в Адской кухне', sub: 'серый дом без лица, четвёртый этаж', style: 'walkup',
        whose: "inside Hedy's shabby one-room walk-up apartment on the fourth floor in Hell's Kitchen, New York, 2013",
        line: 'обсосная однушка в Адской кухне: серый дом без лица, в подъезде сырость, кошки и пролитое пиво, четвёртый этаж, за тонкой стеной из гипсокартона — соседка Марика; по дороге — закусочная «Last Stop Café»',
        re: /адск|hell'?s kitchen|квартир|подъезд|стен[аеуы]|четвёрт|четверт|марик|last stop/i,
        floors: [
            { id: 'hk5', n: '5', name: 'Пятый', short: 'этажом выше', deco: ['пьяная пара ругается'] },
            { id: 'hk4', n: '4', name: 'Квартира Хеди', short: '4 этаж', rooms: ['hk_room'], deco: ['за стеной — Марика'] },
            { id: 'hk1', n: '1–3', name: 'Подъезд', short: 'подъезд', deco: ['сырость, кошки, пиво', '«Last Stop Café» за углом'] },
        ],
        rooms: [
            { id: 'hk_room', name: 'Квартира', ico: 'home', re: /квартир|комнат|адск|hell|стен[аеуы]|гипсокартон/i, shelves: ['hc', 'note', 'song', 'joy'], board: 'fridge',
                en: "a shabby one-room walk-up apartment in Hell's Kitchen: peeling grey paint and mold on bare concrete, one thin drywall wall to the neighbour, a mattress, a cheap table covered in tech parts and a laptop, empty bottles, a hot plate, a small old fridge, a red rubber ball, one grimy window" },
        ],
        books: ['2013 · Марика — lore', '2013 · Ray McCall — lore', '2013 · Гидра — кампания'],
        hint: 'Одна комната на четвёртом. Стена справа — тонкая: Марика слышит мячик, голоса и тишину.',
        board: { fridge: ['Холодильник', 'магниты', 'Магниты'] }, pet: '',
        kinds: {
            note: { gen: 'записки в её обсосной квартире в Адской кухне: самой себе на холодильнике, под дверью соседке Марике — коротко, её голосом (почерк — курица лапой), смешно или горько-смешно' },
            song: { name: 'Что играет', gen: 'музыка её 2013-го: что играет у неё ночью, что слышно через тонкую стену, что она слушает по дороге из «Last Stop» — настоящие песни (название и исполнитель, без слов) и почему' },
            joy: { gen: 'маленькое хорошее в плохой год: чизбургер по дороге домой, Марика за стеной, тихий вечер — по одной фразе, тепло и без драмы; бери из свода истории' },
        },
        shop: "обсосная однушка в Адской кухне, 2013: дешёвые магазины, ломбарды, барахолки, «на последние», что-то для железа Хеди",
        post: { name: 'Посылки', via: 'курьер до подъезда', days: [2, 4], abroad: [7, 14], stolen: true },
        chores: { title: 'Дела по квартире', who: 'Хеди', place: 'по квартире' },
        snow: [
            ['diner', '🍔 Чизбургер по снегу', 'чизбургер из «Last Stop» по дороге домой, снег на капюшоне, Марика рядом'],
            ['wall', '🧱 Мячик в стену', 'снег за грязным окном, мячик глухо стучит в тонкую стену — и в ответ стучат с той стороны'],
        ],
        shots: ['view', 'food'],
    },
    '2014': {
        id: '2014', name: 'Конспиративная квартира', sub: 'Бруклин: маленькая, тихая, окна во двор', style: 'brooklyn',
        whose: "inside Hedy's secret safehouse apartment in Brooklyn where Bucky is hiding with her, 2014–2016",
        line: 'её конспиративная квартира в Бруклине, о которой не знает никто: маленькая, тихая, окна во двор, пожарная лестница, на которой курят; здесь от всех прячется Баки, нейроприбор Хеди по кусочку возвращает ему память; чай вместо виски',
        re: /бруклин|конспиратив|квартир|пожарн|лестниц|кухн|двор/i,
        floors: [
            { id: 'bk3', n: '', name: 'Квартира', short: 'квартира', rooms: ['bk_kitchen', 'bk_room'], ico: 'home' },
            { id: 'bk2', n: '', name: 'Окно во двор', short: 'снаружи', rooms: ['bk_fire'], ico: 'leaf' },
        ],
        rooms: [
            { id: 'bk_kitchen', name: 'Кухня-лаба', ico: 'cup', re: /кухн|нейроприбор|чайник|чай(?![а-яё])/i, shelves: ['hc', 'note', 'joy'], board: 'fridge',
                bridges: [{ to: 'angar:lab', name: 'Кухонная лаба', txt: 'Кухонный стол — её лаба: нейроприбор и всё железо — в Ангаре.' }],
                en: 'a narrow kitchen in a small, quiet old Brooklyn apartment: white-painted brick, a kettle and mugs of tea, a kitchen table turned into a workbench with a half-built neural device and cables, a window onto the courtyard and the fire escape' },
            { id: 'bk_room', name: 'Комната', ico: 'sofa', re: /комнат|диван|кроват|спальн|гостин/i, shelves: ['book', 'catch', 'song', 'card', 'hobby', 'plush'],
                en: 'the main room of a small, quiet old Brooklyn safehouse apartment: a worn sofa with a blanket, a bed, a few books, warm lamp light, curtains drawn, a window onto the courtyard' },
            { id: 'bk_fire', name: 'Пожарная лестница', ico: 'leaf', re: /пожарн|лестниц|балкон|кур(ит|ят|ил)|сигарет/i, shelves: ['joy'],
                en: 'an iron fire escape outside a Brooklyn apartment window above a quiet courtyard: black railings, a ladder, a potted plant, an ashtray, a milk crate to sit on, old brick walls around' },
        ],
        books: ['2014 · Баки — Хеди', '2014 · Солярис — кампания'],
        hint: 'О квартире не знает никто: ни Тони, ни Мстители, ни Щ.И.Т. Кухонный стол — её лаба (мостик в Ангар).',
        board: { fridge: ['Холодильник', 'магниты', 'Магниты'] }, pet: '',
        kinds: {
            song: { name: 'Колыбельные и песни', gen: 'песни этой квартиры: колыбельные, которые Хеди поёт, когда его трясёт (народные — можно), песни его 40-х, которые возвращаются сами, и её — настоящие песни (название и исполнитель, без слов песни, кроме народных колыбельных) и почему они здесь' },
            card: { name: 'Вопросы на ночь', gen: 'вопросы для тихих ночей в конспиративной квартире: осторожные и тёплые — что он помнит, что ему нравится сейчас, чего он хочет; без давления, без «кто мы друг другу»; name — сам вопрос' },
            book: { name: 'Что читает Баки', gen: 'книги, которые Баки читает в бруклинской квартире, чтобы догнать век и вспомнить себя: история, техника, художка — настоящие книги (название и автор, без цитат); почему ему' },
            note: { gen: 'записки на холодильнике конспиративной квартиры: «чай в шкафу», «ушла, к восьми», короткие и бережные; Баки — прописью 40-х, которая возвращается, Хеди — курица лапой' },
        },
        shop: 'маленькая конспиративная квартира в Бруклине, 2014–16: барахолки, комиссионки, только наличные, ничего на своё имя',
        post: { name: 'Посылки', via: 'абонентский ящик на чужое имя', days: [2, 4], abroad: [7, 14], pobox: true },
        chores: { title: 'Дела Баки по квартире', who: 'Баки', place: 'по квартире' },
        snow: [
            ['tea', '🍵 Чай у окна', 'чай вместо виски, снег падает во двор, они молчат у окна, и это хорошее молчание'],
            ['fire', '🚬 Снег на пожарной лестнице', 'сигарета на пожарной лестнице под снегом, его куртка у неё на плечах'],
            ['blanket', '🛋 Плед и старое кино', 'плед, старое кино из его 40-х, он узнаёт мелодию раньше, чем название'],
        ],
        shots: ['back', 'food', 'view'],
    },
    '2017': {
        id: '2017', name: 'Трейлер и «Скиталец»', sub: 'лес в Вайоминге — потом космос', style: 'trailer',
        whose: "in Hedy's hideout",
        line: 'в бегах после «Противостояния»: старый трейлер на поляне в лесах Вайоминга (окна заклеены фольгой, печка, раскладушка, стол под расчётами), рядом сарай под брезентом, где она строит корабль «Скиталец»; с весны 2017-го она живёт на «Скитальце»',
        re: /трейлер|сарай|поляна|вайоминг|лес[ау]?\b|скиталец|скитальц|корабл|кают|камбуз|мостик|трюм/i,
        sites: [
            { id: 'trailer', name: 'Трейлер', ico: 'home', whose: 'inside an old camping trailer hidden in a forest clearing in Wyoming, winter 2016–17' },
            { id: 'ship', name: '«Скиталец»', ico: 'star', whose: 'aboard the «Скиталец», the small starship Hedy built herself' },
        ],
        siteAuto: (day) => (day && day < '2017-03-15' ? 'trailer' : 'ship'),
        floors: [
            { id: 'tr', site: 'trailer', n: '', name: 'Поляна в лесу', short: 'поляна', rooms: ['trailer', 'barn'], ico: 'leaf' },
            { id: 'tr2', site: 'trailer', n: '', name: 'Вокруг', short: 'лес', deco: ['камеры на соснах', 'генератор и солнечные панели', 'городок в 40 минутах'], ico: 'leaf' },
            SHIP_FLOOR('ship'),
        ],
        rooms: [
            { id: 'trailer', name: 'Трейлер', ico: 'home', re: /трейлер|раскладушк|печк|фольг/i, shelves: ['hc', 'note', 'joy', 'hobby'], board: 'fridge',
                en: 'the inside of an old camping trailer in a snowy forest clearing: wood veneer panels, windows covered with tin foil from the inside, a small wood stove, a folding cot, a table buried in calculations and printouts, coffee mugs and bottles, an old laptop glowing' },
            { id: 'barn', name: 'Сарай', ico: 'box', re: /сарай|брезент|стапел|barn/i, link: 'angar:gar', linkName: 'Корабль в Ангаре',
                linkTxt: 'В сарае под брезентом стоит «Скиталец» — он в Ангаре: корпус, двигатели, варп, урон по отсекам.',
                en: 'a big barn under tarpaulin at the edge of a forest clearing; inside, a sleek half-built starship under covers, cables, a generator, work lights' },
            ...SHIP_ROOMS,
        ],
        books: ['2017 · Скиталец — кампания', '2017 · Рассказчик — сиды'],
        hint: 'Зимой — трейлер в лесу и корабль в сарае. С весны 2017-го — «Скиталец»: мостик — в Арте, трюм и лаба — в Ангаре.',
        board: { fridge: ['Холодильник', 'магниты', 'Магниты'], galley: ['Переборка камбуза', 'нашивки', 'Нашивки с планет'] }, pet: '',
        kinds: {
            note: { gen: 'записки в трейлере и на корабле: самой себе, Наташе и Стиву, когда приезжают, А.Р.Т.У.Р.у — коротко, её голосом (почерк — курица лапой), смешно' },
            joy: { gen: 'маленькое хорошее в бегах: приезд Наташи или Стива, первый запуск двигателя, тишина в лесу — по одной фразе, без драмы; бери из свода истории' },
            hobby: { name: 'Чем занята', gen: 'её занятия в бегах с прогрессом: расчёты варп-двигателя, сборка узлов корабля, починка генератора — конкретно', extra: '"n":0,"max":100,"unit":"узлов|страниц|шагов"' },
            song: { name: 'Что играет на борту', gen: 'музыка её бегов и полётов: что играет в трейлере и на «Скитальце» — настоящие песни (название и исполнитель, без слов) и почему именно эта' },
            plush: { gen: 'плюшевые звери Хеди в бегах и на корабле (в Красной комнате игрушек не было, теперь она таскает их с собой — особенно нелепых): имя, кто это, откуда' },
        },
        shop: 'трейлер в лесу, 2016–17: хозяйственный и заправка в городке в 40 минутах, почта, наличные; в космосе — базары чужих миров',
        post: { name: 'Посылки', via: 'почта в городке, до востребования', days: [3, 6], abroad: [8, 15], pickup: true },
        chores: { title: 'Дела по хозяйству', who: '', place: 'по хозяйству' },
        snow: [
            ['storm', '🌨 Метель', 'метель за фольгой на окнах, печка гудит, кофе и тишина — никуда не надо'],
            ['stars', '✨ Звёзды над поляной', 'снег перестал, над поляной звёзды, она стоит у сарая с кружкой и смотрит вверх — туда, куда полетит'],
        ],
        shots: ['self', 'view', 'ship'],
    },
    '2018': {
        id: '2018', name: 'Квартира с Наташей', sub: 'съёмная, на двоих — и «Скиталец»', style: 'flat',
        whose: 'in the rented apartment Hedy shares with Natasha Romanoff, 2018',
        line: 'годы Скачка: Хеди живёт с Наташей в съёмной квартире (Локи — гость на их кухне; Стив приносит кофе), а в космос улетает на «Скитальце»',
        re: /квартир|кухн|гостин|комнат|наташ|скиталец|скитальц|корабл|кают|камбуз|мостик|трюм/i,
        sites: [
            { id: 'flat', name: 'Квартира', ico: 'home', whose: 'in the rented apartment Hedy shares with Natasha Romanoff, 2018' },
            { id: 'ship', name: '«Скиталец»', ico: 'star', whose: 'aboard the «Скиталец», the small starship Hedy built herself' },
        ],
        siteAuto: () => 'flat',
        floors: [
            { id: 'nf', site: 'flat', n: '', name: 'Съёмная квартира', short: 'квартира', rooms: ['n_kitchen', 'n_living', 'n_hedy', 'n_nat'], ico: 'home' },
            SHIP_FLOOR('ship'),
        ],
        rooms: [
            { id: 'n_kitchen', name: 'Кухня', ico: 'cup', re: /кухн|kitchen/i, shelves: ['hc', 'note', 'joy', 'card'], board: 'fridge',
                en: 'the kitchen of an ordinary rented city apartment shared by two women: a small table with three mismatched chairs, takeout boxes and good coffee, a fridge covered with notes, a window' },
            { id: 'n_living', name: 'Гостиная', ico: 'sofa', re: /гостин|диван|living/i, shelves: ['book', 'song', 'hobby'],
                en: 'the living room of an ordinary rented apartment: a sofa with a blanket, a coffee table, a bookshelf, a floor lamp, a window onto the city' },
            { id: 'n_hedy', name: 'Комната Хеди', ico: 'bed', re: /комнат[аеуы] хеди|её комнат|спальн/i, shelves: ['plush'],
                en: "a messy bedroom in a rented apartment: an unmade bed, a desk with engineering sketches, star charts pinned to the wall, a few bottles, deep eggplant-coloured walls" },
            { id: 'n_nat', name: 'Комната Наташи', ico: 'bed', re: /комнат[аеуы] наташ/i, shelves: [],
                en: 'a very tidy bedroom in a rented apartment: a neatly made bed, a dresser, a mirror, almost nothing personal, sage-green walls' },
            ...SHIP_ROOMS,
        ],
        books: ['Локи — Хеди', 'Стив — Хеди', 'Наташа & Хеди — связь и общая история'],
        hint: 'На Земле — квартира с Наташей; переключатель сверху — «Скиталец» (мостик в Арте, трюм и лаба — в Ангаре).',
        board: { fridge: ['Холодильник', 'магниты', 'Магниты'], galley: ['Переборка камбуза', 'нашивки', 'Нашивки с планет'] }, pet: '',
        kinds: {
            note: { gen: 'записки на холодильнике квартиры, где Хеди живёт с Наташей (годы Скачка): Наташа ↔ Хеди, иногда Локи или Стив — коротко, их голосом; бережно и с юмором, без нотаций' },
            joy: { gen: 'маленькое хорошее в годы Скачка: Наташа, Морган, Стив с кофе, Локи на их кухне — по одной фразе, тепло, без драмы; бери из свода истории' },
            card: { name: 'Вечер на кухне', gen: 'вопросы для вечера на их кухне — Хеди и Наташа, иногда Локи: тёплые, неожиданные, иногда смешные; name — сам вопрос' },
            song: { name: 'Что играет', gen: 'музыка этой квартиры: что ставит Наташа, что слушает Хеди, что играет на кухне — настоящие песни (название и исполнитель, без слов) и почему' },
            book: { name: 'Книжная полка', gen: 'книги в их квартире: что читает Наташа, что Хеди (техника, космос, фантастика) — настоящие книги (название и автор, без цитат); чьё и почему' },
        },
        shop: 'съёмная квартира на двоих, 2018–2023: обычные магазины города, доставка; в космосе — базары чужих миров',
        post: { name: 'Посылки', via: 'курьер до двери', days: [1, 3], abroad: [6, 12] },
        chores: { title: 'Дела по квартире', who: 'Наташа', place: 'по квартире' },
        snow: [
            ['cocoa', '☕ Какао у окна', 'какао у окна, снег, Наташа молча садится рядом и кладёт голову ей на плечо'],
            ['loki', '❄️ Локи и снег', 'Локи брезгливо стряхивает снег с плаща на их кухне и делает вид, что пришёл не ради неё'],
        ],
        shots: ['nat', 'food', 'view'],
    },
};
HOMES['2024'].rooms = R2024;

export const HOME_IDS = Object.keys(HOMES);
/** Эпоха по дате истории — границы как в Реестре: 1943 · 2013 · 2014 · 2017 · 2018 · 2024. */
export function homeByDate(day) {
    const d = String(day || '');
    if (!/^\d{4}/.test(d)) return '2024';
    const y = Number(d.slice(0, 4));
    if (y < 1950) return '1943';
    if (d >= '2013-01' && d < '2014-04') return '2013';
    if (d >= '2014-04' && d < '2016-12') return '2014';
    if (d >= '2016-12' && d < '2018-05') return '2017';
    if (d >= '2018-05' && d < '2023-11') return '2018';
    return '2024';
}
