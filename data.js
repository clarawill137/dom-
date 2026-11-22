// ✦ Дом — данные: комнаты, настроения хэдов, кубик.

/** Комнаты. feats: [id, название, что это, готово ли]. link — комната открывает соседнее расширение. */
export const ROOMS = [
    { id: 'kitchen', name: 'Кухня', ico: 'cup', re: /кухн|столов|kitchen|dining/i, en: 'kitchen with a dining corner and a big retro fridge',
        feats: [['fridge', 'Холодильник', 'хэды-полароиды на магнитах и хэд-машина', true], ['recipes', 'Кухня Баки', 'рецепты мамы, его версии блюд', false], ['jar', 'Банка хорошего', 'счастливые моменты из истории', false]] },
    { id: 'living', name: 'Гостиная', ico: 'sofa', re: /гостин|зал(?![а-яё])|living|лаунж/i, en: 'living room with a sofa, bookshelves and a TV',
        feats: [['books', 'Полка Баки', 'его книги, закладки, сказка на ночь', false], ['plush', 'Плюшевый зоопарк', 'звери Хеди с именами', false], ['deck', 'Колода «вечер вдвоём»', 'вопросы для тихих вечеров', false], ['tv', 'Догоняем век', 'что Баки пропустил', false], ['dates', 'Банка свиданий', 'd20 → свидание', false]] },
    { id: 'nursery', name: 'Детская', ico: 'baby', re: /детск|nursery/i, en: 'nursery for a baby girl',
        feats: [['crib', 'Кроватка и обои', 'Баки собирает по инструкции', false], ['names', 'Имена для малыша', 'шорт-лист и голоса', false]] },
    { id: 'bedroom', name: 'Спальня', ico: 'bed', re: /спальн|bedroom/i, en: 'bedroom with a big bed and warm lamps', feats: [] },
    { id: 'balcony', name: 'Балкон', ico: 'leaf', re: /балкон|террас|лоджи|крыш|balcony|terrace/i, en: 'balcony or terrace with potted plants and a view of the city',
        feats: [['garden', 'Огород Баки', 'растения по дням истории', false]] },
    { id: 'lab', name: 'Мастерская', ico: 'flask', re: /мастерск|лаборатор|workshop|lab/i, en: "Hedy's home workshop full of gadgets and blueprints", link: 'angar:lab' },
    { id: 'garage', name: 'Гараж', ico: 'car', re: /гараж|garage/i, en: 'home garage with a motorcycle and tools', link: 'angar:gar' },
];
export const roomById = (id) => ROOMS.find(r => r.id === id) || null;

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
/** Кубик решает настроение: 1 — абсурд, 2–6 — быт, 7–11 — мило, 12–15 — смешно, 16–19 — про них, 20 — золотой. */
export const vibeOfRoll = (n) => (n >= 20 ? 'gold' : n >= 16 ? 'pair' : n >= 12 ? 'fun' : n >= 7 ? 'cute' : n >= 2 ? 'home' : 'odd');
export const DICE_HINT = '1 — абсурд · 2–6 — быт · 7–11 — мило · 12–15 — смешно · 16–19 — про них · 20 — золотой';

/** Сколько хэдов за раз (и картинок). */
export const BATCH = 4;
/** Цвета магнитиков на холодильнике. */
export const MAGNETS = ['#ff8fa3', '#ffd166', '#7bdff2', '#b8f2a6', '#cdb4ff', '#ffb38a'];
