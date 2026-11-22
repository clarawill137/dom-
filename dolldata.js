// ✦ Дом — кукольный домик 2.5D: обои, полы, мебель-коробочки в изометрии и раскладки комнат по лору.
// Мир комнаты — 10 × 10 × 6: x идёт вдоль правой стены (к зрителю вправо), y — вдоль левой (к зрителю влево), z — вверх.
// Задний угол — (0, 0, 0). Детали мебели — коробки [x, y, z, ширина, глубина, высота, цвет];
// цвет 'm' — основной (меняется), 'm2' темнее, 'm3' светлее, 'a' — второй цвет, 'sky' — небо в окне.

export const ROOM = { W: 10, D: 10, H: 6 };

const svgUrl = (s) => `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;
const svg = (w, h, body) => `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`;

function bricks(c, m) {
    return svgUrl(svg(48, 32, `<rect width='48' height='32' fill='${m}'/>`
        + `<rect x='1' y='1' width='22' height='14' rx='1.5' fill='${c[0]}'/><rect x='25' y='1' width='22' height='14' rx='1.5' fill='${c[1]}'/>`
        + `<rect x='-11' y='17' width='22' height='14' rx='1.5' fill='${c[2]}'/><rect x='13' y='17' width='22' height='14' rx='1.5' fill='${c[3]}'/>`
        + `<rect x='37' y='17' width='22' height='14' rx='1.5' fill='${c[4]}'/>`));
}
const FLORAL = svgUrl(svg(32, 32, `<rect width='32' height='32' fill='#f2e6cf'/><g fill='#d98b8f'><circle cx='8' cy='8' r='3.2'/><circle cx='24' cy='24' r='3.2'/></g>`
    + `<g fill='#f4c6c0'><circle cx='8' cy='8' r='1.3'/><circle cx='24' cy='24' r='1.3'/></g><g fill='#8fae86'><ellipse cx='12.5' cy='10' rx='2.6' ry='1.2'/><ellipse cx='4' cy='5.5' rx='2.4' ry='1.1'/>`
    + `<ellipse cx='28.5' cy='26' rx='2.6' ry='1.2'/><ellipse cx='20' cy='21.5' rx='2.4' ry='1.1'/></g><circle cx='24' cy='8' r='1' fill='#c9a66b'/><circle cx='8' cy='24' r='1' fill='#c9a66b'/>`));
const DAMASK = svgUrl(svg(28, 40, `<rect width='28' height='40' fill='#2f4a3e'/><g fill='none' stroke='#c7a861' stroke-opacity='.55' stroke-width='1.2'>`
    + `<path d='M14 2 C22 10 22 18 14 20 C6 18 6 10 14 2Z'/><path d='M14 22 C20 28 20 36 14 38 C8 36 8 28 14 22Z' stroke-opacity='.3'/><path d='M0 20 C4 24 4 30 0 32 M28 20 C24 24 24 30 28 32'/></g>`));
const STARS = svgUrl(svg(30, 30, `<rect width='30' height='30' fill='#d7e5f4'/><g fill='#f4d27a'><path d='M8 4l1.3 3 3.2.3-2.4 2.1.7 3.1L8 10.9l-2.8 1.6.7-3.1L3.5 7.3l3.2-.3z'/>`
    + `<path d='M23 17l1 2.2 2.4.2-1.8 1.6.5 2.3-2.1-1.2-2.1 1.2.5-2.3-1.8-1.6 2.4-.2z'/></g><circle cx='20' cy='6' r='.9' fill='#fff'/><circle cx='6' cy='22' r='.9' fill='#fff'/>`));
const CLOUDS = svgUrl(svg(40, 30, `<rect width='40' height='30' fill='#c4def3'/><g fill='#fff' fill-opacity='.9'><ellipse cx='10' cy='9' rx='6' ry='3.2'/><ellipse cx='14' cy='7.5' rx='4' ry='3'/>`
    + `<ellipse cx='30' cy='22' rx='6' ry='3.2'/><ellipse cx='26' cy='20.5' rx='4' ry='3'/></g>`));
const SUBWAY = svgUrl(svg(24, 12, `<rect width='24' height='12' fill='#cfc9c0'/><rect x='.6' y='.6' width='22.8' height='4.8' rx='1' fill='#f5f2ec'/>`
    + `<rect x='-11.4' y='6.6' width='22.8' height='4.8' rx='1' fill='#f1ede6'/><rect x='12.6' y='6.6' width='22.8' height='4.8' rx='1' fill='#f1ede6'/>`));
const PLANKS = svgUrl(svg(64, 24, `<rect width='64' height='24' fill='#6e4528'/><rect y='.6' width='40' height='10.8' fill='#a8774c'/><rect x='40.6' y='.6' width='23.4' height='10.8' fill='#9c6c43'/>`
    + `<rect y='12.6' width='14' height='10.8' fill='#9f6f46'/><rect x='14.6' y='12.6' width='49.4' height='10.8' fill='#ad7b4f'/>`
    + `<path d='M4 4h22M30 8h8M20 17h30M46 20h14' stroke='#7c5232' stroke-opacity='.35' stroke-width='.7'/>`));
const HERRING = svgUrl(svg(32, 32, `<rect width='32' height='32' fill='#6f4628'/><g fill='#b07f50'><path d='M0 0h16v8H0z'/><path d='M16 8h16v8H16z'/></g><g fill='#9d6d43'><path d='M16 0h8v16h-8z' transform='translate(0 0)'/>`
    + `<path d='M0 8h8v16H0z'/></g><g fill='#a8774b'><path d='M8 16h16v8H8z'/><path d='M24 16h8v16h-8z'/></g><path d='M0 24h8v8H0z' fill='#b58553'/><path d='M8 24h16v8H8z' fill='#9a6a41'/>`));
const DECK = svgUrl(svg(60, 20, `<rect width='60' height='20' fill='#7a5638'/><rect y='.8' width='60' height='8.6' fill='#c09468'/><rect y='10.6' width='60' height='8.6' fill='#b88b5f'/>`
    + `<circle cx='6' cy='5' r='.7' fill='#6b4a30'/><circle cx='54' cy='15' r='.7' fill='#6b4a30'/>`));
const TERRAZZO = svgUrl(svg(30, 30, `<rect width='30' height='30' fill='#ece6dc'/><g fill='#c97b6b'><circle cx='5' cy='7' r='1.3'/><circle cx='22' cy='19' r='1'/></g>`
    + `<g fill='#7fa39a'><circle cx='17' cy='5' r='1.1'/><circle cx='8' cy='24' r='1.4'/></g><g fill='#d6b35a'><circle cx='26' cy='9' r='.9'/><circle cx='13' cy='15' r='.8'/></g><circle cx='27' cy='27' r='1.2' fill='#8d8d8d'/>`));

/** Небо по времени суток: [верх, низ]. */
export const SKY = {
    dawn: ['#9fb6dc', '#f6c4a2'], day: ['#8fcaf0', '#dff2fc'], evening: ['#e8925a', '#f8d59c'],
    dusk: ['#3f3b74', '#c27a9c'], night: ['#0d1430', '#27345e'],
};
function skyline(ph) {
    const [top, low] = SKY[ph] || SKY.day;
    const night = ph === 'night' || ph === 'dusk';
    const b = night ? '#141a2c' : ph === 'evening' ? '#5b4660' : '#7b8ea6';
    const w = night ? '#f6d27a' : 'rgba(255,255,255,.35)';
    const city = svgUrl(svg(120, 60, `<g fill='${b}'><rect x='0' y='26' width='16' height='34'/><rect x='18' y='12' width='14' height='48'/><rect x='34' y='30' width='20' height='30'/>`
        + `<rect x='56' y='6' width='12' height='54'/><rect x='61' y='0' width='2' height='8'/><rect x='70' y='22' width='18' height='38'/><rect x='90' y='16' width='12' height='44'/><rect x='104' y='32' width='16' height='28'/></g>`
        + `<g fill='${w}'><rect x='4' y='32' width='2' height='2'/><rect x='10' y='40' width='2' height='2'/><rect x='22' y='18' width='2' height='2'/><rect x='27' y='30' width='2' height='2'/>`
        + `<rect x='59' y='14' width='2' height='2'/><rect x='63' y='26' width='2' height='2'/><rect x='75' y='30' width='2' height='2'/><rect x='94' y='24' width='2' height='2'/><rect x='108' y='38' width='2' height='2'/></g>`));
    return `${city} 0 100%/120px 60px repeat-x, linear-gradient(${top}, ${low})`;
}

/** Обои. bg(фаза) → CSS background (в координатах стены, без перекоса). */
export const WALLS = [
    { id: 'brick', name: 'Кирпич', bg: () => `${bricks(['#a24e3c', '#97462f', '#9b4837', '#a9533f', '#a04b3b'], '#c9a089')} 0 0/26px 17px` },
    { id: 'pbrick', name: 'Крашеный кирпич', bg: () => `${bricks(['#eadbe7', '#e4d3e1', '#e7d7e4', '#efe1ec', '#e2d0de'], '#f7eef5')} 0 0/26px 17px` },
    { id: 'wbrick', name: 'Белый кирпич', bg: () => `${bricks(['#f1ede6', '#ebe6de', '#eee9e1', '#f4f0ea', '#e8e2d9'], '#d6d0c6')} 0 0/26px 17px` },
    { id: 'cream', name: 'Сливочные', bg: () => '#efe3cd' },
    { id: 'eggplant', name: 'Баклажан', bg: () => 'repeating-linear-gradient(90deg, rgba(214,178,98,.18) 0 1px, transparent 1px 22px), #4a2747' },
    { id: 'sage', name: 'Шалфей', bg: () => '#a8bda2' },
    { id: 'mint', name: 'Мятная полоска', bg: () => 'repeating-linear-gradient(90deg, #cde6da 0 9px, #e5f3ec 9px 18px)' },
    { id: 'rose', name: 'Розовая полоска', bg: () => 'repeating-linear-gradient(90deg, #f0c9d0 0 9px, #f9e4e8 9px 18px)' },
    { id: 'dots', name: 'Горошек', bg: () => 'radial-gradient(circle, #e2a3b1 2.2px, transparent 2.7px) 0 0/14px 14px, radial-gradient(circle, #e2a3b1 2.2px, transparent 2.7px) 7px 7px/14px 14px, #fbeff2' },
    { id: 'floral', name: 'Цветочки 40-х', bg: () => `${FLORAL} 0 0/22px 22px` },
    { id: 'damask', name: 'Дамаск', bg: () => `${DAMASK} 0 0/20px 28px` },
    { id: 'plaid', name: 'Клетка', bg: () => 'repeating-linear-gradient(90deg, rgba(25,35,60,.38) 0 4px, transparent 4px 16px), repeating-linear-gradient(0deg, rgba(25,35,60,.38) 0 4px, transparent 4px 16px), repeating-linear-gradient(90deg, rgba(240,220,160,.3) 0 1px, transparent 1px 8px), #93302f' },
    { id: 'stars', name: 'Звёздочки', bg: () => `${STARS} 0 0/22px 22px` },
    { id: 'clouds', name: 'Облака', bg: () => `${CLOUDS} 0 0/34px 26px` },
    { id: 'wood', name: 'Дерево', bg: () => 'repeating-linear-gradient(90deg, rgba(0,0,0,.2) 0 1px, transparent 1px 15px), linear-gradient(90deg, #8b5a36, #7a4e2f 50%, #8b5a36)' },
    { id: 'wainscot', name: 'Панели', bg: () => 'linear-gradient(to top, #4d311d 0 1.5%, #6f4a2e 1.5% 32%, #3f2818 32% 33.5%, transparent 33.5%), repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 1px, transparent 1px 12px), #efe3cd' },
    { id: 'tiles', name: 'Плитка', bg: () => `${SUBWAY} 0 0/16px 8px` },
    { id: 'blueprint', name: 'Чертёж', bg: () => 'linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px) 0 0/12px 12px, linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px) 0 0/12px 12px, #1f4d78' },
    { id: 'concrete', name: 'Бетон', bg: () => 'radial-gradient(rgba(0,0,0,.08) 1px, transparent 1.5px) 0 0/7px 7px, radial-gradient(rgba(255,255,255,.1) 1px, transparent 1.5px) 3px 4px/9px 9px, #9b9b96' },
    { id: 'skyline', name: 'Небо и город', bg: (ph) => skyline(ph) },
];
export const FLOORS = [
    { id: 'planks', name: 'Доски', bg: () => `${PLANKS} 0 0/48px 18px` },
    { id: 'herring', name: 'Ёлочка', bg: () => `${HERRING} 0 0/24px 24px` },
    { id: 'checker', name: 'Шахматка', bg: () => 'conic-gradient(#efe9df 25%, #2d2b2b 0 50%, #efe9df 0 75%, #2d2b2b 0) 0 0/22px 22px' },
    { id: 'mintcheck', name: 'Мятная шахматка', bg: () => 'conic-gradient(#f6f3ec 25%, #a9d8c8 0 50%, #f6f3ec 0 75%, #a9d8c8 0) 0 0/22px 22px' },
    { id: 'carpet', name: 'Ковролин', bg: () => 'radial-gradient(rgba(255,255,255,.28) 1px, transparent 1.4px) 0 0/5px 5px, #d8b9b3' },
    { id: 'terrazzo', name: 'Терраццо', bg: () => `${TERRAZZO} 0 0/26px 26px` },
    { id: 'concrete', name: 'Бетон', bg: () => 'radial-gradient(rgba(0,0,0,.09) 1px, transparent 1.5px) 0 0/8px 8px, #8f8f8b' },
    { id: 'rubber', name: 'Резина', bg: () => 'linear-gradient(rgba(0,0,0,.4) 1px, transparent 1px) 0 0/30px 30px, linear-gradient(90deg, rgba(0,0,0,.4) 1px, transparent 1px) 0 0/30px 30px, #3b3d42' },
    { id: 'deck', name: 'Настил', bg: () => `${DECK} 0 0/60px 20px` },
    { id: 'turf', name: 'Газон', bg: () => 'radial-gradient(rgba(30,70,30,.35) 1px, transparent 1.6px) 0 0/6px 6px, radial-gradient(rgba(170,220,130,.35) 1px, transparent 1.6px) 3px 3px/7px 7px, #6c9a4f' },
];
export const wallById = (id) => WALLS.find(w => w.id === id) || null;
export const floorById = (id) => FLOORS.find(w => w.id === id) || null;

/** Палитра для мебели. */
export const PALETTE = ['#7a4b2a', '#b5835a', '#e9dcc3', '#f1ece4', '#4a2747', '#6b7f8e', '#8da58a', '#a9d8c8', '#d99aa5', '#c99a3c', '#2f3b5c', '#9e3b34', '#3b3d42', '#8b8f96'];

// ───────────── мебель ─────────────

const b = (x, y, z, w, d, h, c) => [x, y, z, w, d, h, c];
function legs(w, d, h, c = 'm2', t = 0.16, i = 0.06) {
    return [b(i, i, 0, t, t, h, c), b(w - i - t, i, 0, t, t, h, c), b(i, d - i - t, 0, t, t, h, c), b(w - i - t, d - i - t, 0, t, t, h, c)];
}
const BOOK = ['#8e3b46', '#2f4f6f', '#c9a227', '#3e6b48', '#6a3d6b', '#d6c3a5', '#a0522d', '#1f2f3f'];
const JAR = ['#d9483b', '#e9c46a', '#7fb04f', '#f1e3c6', '#2f5d3a', '#c0703a'];
/** Ряд книжек (или банок) на полке высоты z между x0 и x1. */
function row(z, x0, x1, pal, seed, jars = false) {
    const out = [];
    let x = x0, i = seed;
    while (x < x1 - 0.18) {
        const w = jars ? 0.36 : 0.16 + ((i * 7) % 5) * 0.035;
        const h = jars ? 0.42 + ((i * 3) % 3) * 0.12 : 0.56 + ((i * 5) % 4) * 0.08;
        if (x + w > x1) break;
        out.push(b(x, jars ? 0.25 : 0.18, z, w, jars ? 0.4 : 0.58, h, pal[i % pal.length]));
        x += w + (jars ? 0.08 : 0.02);
        i++;
    }
    return out;
}
function shelving(jars = false) {
    const parts = [b(0, 0, 0, 2.4, 0.1, 4.2, 'm2'), b(0, 0.1, 0, 0.12, 0.8, 4.2, 'm'), b(2.28, 0.1, 0, 0.12, 0.8, 4.2, 'm')];
    [0, 1.05, 2.1, 3.15].forEach((z, k) => { parts.push(b(0.12, 0.1, z, 2.16, 0.8, 0.1, 'm')); parts.push(...row(z + 0.1, 0.2, 2.2, jars ? JAR : BOOK, k * 3 + (jars ? 1 : 0), jars)); });
    parts.push(b(0, 0, 4.2, 2.4, 0.9, 0.1, 'm'));
    return parts;
}
const BULB = ['#ffd27a', '#ff9a8a', '#a8e0ff', '#c8f7a8', '#ffd27a'];
function garland(len) {
    const parts = [b(0, 0, 0.22, len, 0.02, 0.02, 'm')];
    const glow = [];
    for (let u = 0.2, i = 0; u < len - 0.1; u += 0.5, i++) {
        const z = 0.04 + (i % 2) * 0.06;
        parts.push(b(u, 0.02, z, 0.12, 0.08, 0.16, BULB[i % BULB.length]));
        glow.push([u + 0.06, 0.06, z + 0.08, BULB[i % BULB.length], 0.9]);
    }
    return { parts, glow };
}
const G = garland(4.4);

/**
 * Каталог. Напольные: w×d — след, parts — коробки, top — высота поверхности, на которую можно ставить вещи.
 * Настенные (wall): len — длина вдоль стены, z — высота подвеса; parts в осях [вдоль, от стены, вверх];
 * surf — [от, до вдоль стены, глубина] полочки/подоконника. glow — [x, y, z, цвет, радиус] — светится вечером и ночью.
 * flat — лежит на полу (ковёр, мат): рисуется раньше всего.
 */
export const FURN = {
    bed: { name: 'Кровать', cat: 'sleep', w: 4, d: 5, col: '#7a4b2a', acc: '#c9a5b8', top: 1.49, parts: [b(0, 0, 0, 4, 0.35, 2.5, 'm2'), b(0, 0.35, 0, 4, 4.65, 0.9, 'm'), b(0.1, 0.35, 0.9, 3.8, 4.55, 0.45, '#f3eee5'), b(0.3, 0.5, 1.35, 1.55, 0.95, 0.38, '#fbf8f2'), b(2.15, 0.5, 1.35, 1.55, 0.95, 0.38, '#fbf8f2'), b(0.05, 2.1, 1.35, 3.9, 2.85, 0.14, 'a')] },
    crib: { name: 'Кроватка', cat: 'kids', w: 2.4, d: 1.6, col: '#f1ece4', acc: '#a9d8c8', top: 1.17, parts: [...legs(2.4, 1.6, 0.75, 'm2', 0.14), b(0, 0, 0.75, 2.4, 1.6, 0.2, 'm'), b(0, 0, 0.95, 2.4, 0.12, 1.05, 'm'), b(0, 0.12, 0.95, 0.12, 1.36, 1.05, 'm'), b(2.28, 0.12, 0.95, 0.12, 1.36, 1.05, 'm'), b(0.12, 0.12, 0.95, 2.16, 1.36, 0.22, 'a'), b(0, 1.48, 0.95, 2.4, 0.12, 0.55, 'm')] },
    boxes: { name: 'Коробки от кроватки', cat: 'kids', w: 1.9, d: 1.6, col: '#c9a46b', top: 1.5, parts: [b(0, 0, 0, 1.9, 0.55, 1.5, 'm'), b(0.1, 0.65, 0, 1.5, 0.9, 0.55, 'm3'), b(0.2, 0.75, 0.55, 1.0, 0.7, 0.35, 'm2')] },
    changing: { name: 'Пеленальный столик', cat: 'kids', w: 2, d: 1.1, col: '#f1ece4', acc: '#a9d8c8', top: 1.75, parts: [b(0, 0, 0, 2, 1.1, 1.6, 'm'), b(0.1, 1.1, 0.1, 1.8, 0.03, 0.65, 'm3'), b(0.1, 1.1, 0.85, 1.8, 0.03, 0.65, 'm3'), b(0.1, 0.1, 1.6, 1.8, 0.9, 0.15, 'a')] },
    rocking: { name: 'Кресло-качалка', cat: 'seat', w: 1.6, d: 1.8, col: '#b5835a', acc: '#e9dcc3', top: 1.04, parts: [b(0, 0, 0, 0.12, 1.8, 0.22, 'm2'), b(1.48, 0, 0, 0.12, 1.8, 0.22, 'm2'), b(0.05, 0.2, 0.22, 0.1, 0.1, 0.6, 'm2'), b(1.45, 0.2, 0.22, 0.1, 0.1, 0.6, 'm2'), b(0.05, 1.5, 0.22, 0.1, 0.1, 0.6, 'm2'), b(1.45, 1.5, 0.22, 0.1, 0.1, 0.6, 'm2'), b(0, 0.1, 0.82, 1.6, 1.6, 0.12, 'm'), b(0, 0.1, 0.94, 1.6, 0.14, 1.7, 'm'), b(0.1, 0.24, 0.94, 1.4, 1.3, 0.1, 'a')] },
    sofa: { name: 'Диван', cat: 'seat', w: 4.5, d: 2, col: '#6b7f8e', acc: '#e7d8c5', top: 1.15, parts: [b(0, 0, 0, 4.5, 0.6, 1.9, 'm2'), b(0, 0.6, 0, 0.5, 1.4, 1.4, 'm2'), b(4, 0.6, 0, 0.5, 1.4, 1.4, 'm2'), b(0.5, 0.6, 0, 3.5, 1.4, 0.9, 'm'), b(0.55, 0.65, 0.9, 1.68, 1.3, 0.25, 'm3'), b(2.27, 0.65, 0.9, 1.68, 1.3, 0.25, 'm3'), b(3.2, 0.6, 1.15, 0.75, 1.42, 0.05, 'a')] },
    armchair: { name: 'Кресло', cat: 'seat', w: 2, d: 2, col: '#c99a3c', top: 1.07, parts: [b(0, 0, 0, 2, 0.5, 1.9, 'm2'), b(0, 0.5, 0, 0.35, 1.5, 1.35, 'm2'), b(1.65, 0.5, 0, 0.35, 1.5, 1.35, 'm2'), b(0.35, 0.5, 0, 1.3, 1.5, 0.85, 'm'), b(0.38, 0.55, 0.85, 1.24, 1.4, 0.22, 'm3')] },
    chair: { name: 'Стул', cat: 'seat', w: 1, d: 1, col: '#b5835a', top: 1.0, parts: [...legs(1, 1, 0.88, 'm2', 0.1, 0.04), b(0, 0, 0.88, 1, 1, 0.12, 'm'), b(0, 0, 1.0, 1, 0.12, 1.1, 'm')] },
    bench: { name: 'Скамья', cat: 'gym', w: 3, d: 1, col: '#3b3d42', top: 1.0, parts: [...legs(3, 1, 0.8, '#9aa0a6', 0.12), b(0, 0, 0.8, 3, 1, 0.2, 'm')] },
    deckchair: { name: 'Шезлонг', cat: 'garden', w: 1.2, d: 2.4, col: '#3f7f8f', top: 0.62, parts: [...legs(1.2, 2.4, 0.5, '#b88a5f', 0.1), b(0, 0, 0.5, 1.2, 2.4, 0.12, 'm'), b(0, 0, 0.62, 1.2, 0.25, 1.2, 'm')] },
    table: { name: 'Стол', cat: 'table', w: 3, d: 2, col: '#b5835a', top: 1.58, parts: [...legs(3, 2, 1.4), b(0, 0, 1.4, 3, 2, 0.18, 'm')] },
    ctable: { name: 'Журнальный столик', cat: 'table', w: 2.4, d: 1.4, col: '#7a4b2a', top: 0.85, parts: [...legs(2.4, 1.4, 0.7, 'm2', 0.14), b(0, 0, 0.7, 2.4, 1.4, 0.15, 'm')] },
    desk: { name: 'Рабочий стол', cat: 'table', w: 3.2, d: 1.6, col: '#7a4b2a', top: 1.58, parts: [b(2.1, 0, 0, 1.1, 1.6, 1.4, 'm2'), b(0.06, 0.06, 0, 0.16, 0.16, 1.4, 'm2'), b(0.06, 1.38, 0, 0.16, 0.16, 1.4, 'm2'), b(2.2, 1.6, 0.15, 0.9, 0.03, 0.55, 'm3'), b(2.2, 1.6, 0.8, 0.9, 0.03, 0.5, 'm3'), b(0, 0, 1.4, 3.2, 1.6, 0.18, 'm')] },
    nightstand: { name: 'Тумбочка', cat: 'store', w: 1, d: 1, col: '#7a4b2a', top: 1.1, parts: [b(0, 0, 0, 1, 1, 1.1, 'm'), b(0.1, 1, 0.55, 0.8, 0.03, 0.4, 'm3')] },
    nightlamp: { name: 'Тумбочка с лампой', cat: 'light', w: 1, d: 1, col: '#7a4b2a', acc: '#f0d9a8', top: 1.1, parts: [b(0, 0, 0, 1, 1, 1.1, 'm'), b(0.1, 1, 0.55, 0.8, 0.03, 0.4, 'm3'), b(0.38, 0.38, 1.1, 0.24, 0.24, 0.4, '#cdbb96'), b(0.2, 0.2, 1.5, 0.6, 0.6, 0.45, 'a')], glow: [[0.5, 0.5, 1.72, '#ffcf8a', 2.6]] },
    dresser: { name: 'Комод', cat: 'store', w: 2.4, d: 1.1, col: '#f1ece4', top: 1.6, parts: [b(0, 0, 0, 2.4, 1.1, 1.6, 'm'), b(0.1, 1.1, 0.1, 2.2, 0.03, 0.42, 'm3'), b(0.1, 1.1, 0.6, 2.2, 0.03, 0.42, 'm3'), b(0.1, 1.1, 1.1, 2.2, 0.03, 0.42, 'm3')] },
    wardrobe: { name: 'Шкаф', cat: 'store', w: 2.6, d: 1.2, col: '#7a4b2a', top: 4.4, parts: [b(0, 0, 0, 2.6, 1.2, 4.4, 'm'), b(0.08, 1.2, 0.15, 1.18, 0.03, 4.1, 'm3'), b(1.34, 1.2, 0.15, 1.18, 0.03, 4.1, 'm3'), b(1.12, 1.23, 2.0, 0.06, 0.04, 0.5, '#d4b15a'), b(1.42, 1.23, 2.0, 0.06, 0.04, 0.5, '#d4b15a')] },
    bookcase: { name: 'Стеллаж с книгами', cat: 'store', w: 2.4, d: 0.9, col: '#7a4b2a', top: 4.3, parts: shelving(false) },
    pantry: { name: 'Полки с банками', cat: 'shop', w: 2.4, d: 0.9, col: '#b5835a', top: 4.3, parts: shelving(true) },
    record: { name: 'Проигрыватель', cat: 'decor', w: 1.6, d: 1.2, col: '#7a4b2a', acc: '#c9a227', top: 1.56, parts: [b(0, 0, 0, 1.6, 1.2, 1.4, 'm'), b(0.1, 0.1, 1.4, 1.4, 1.0, 0.16, '#2a2a2c'), b(0.3, 0.25, 1.56, 0.8, 0.7, 0.02, '#111111'), b(0.6, 0.5, 1.58, 0.2, 0.2, 0.01, 'a')] },
    radio: { name: 'Радиола', cat: 'decor', w: 1.6, d: 0.9, col: '#7a4b2a', top: 2.3, parts: [...legs(1.6, 0.9, 0.4), b(0, 0, 0.4, 1.6, 0.9, 1.9, 'm'), b(0.2, 0.9, 1.2, 1.2, 0.03, 0.8, '#d9c79c'), b(0.4, 0.9, 0.7, 0.8, 0.03, 0.25, '#e9ddb8')] },
    counter: { name: 'Кухонная тумба', cat: 'kitchen', w: 3, d: 1.2, col: '#e9e2d4', top: 1.72, parts: [b(0, 0, 0, 3, 1.2, 1.6, 'm'), b(0.1, 1.2, 0.12, 1.35, 0.03, 1.35, 'm3'), b(1.55, 1.2, 0.12, 1.35, 0.03, 1.35, 'm3'), b(0, 0, 1.6, 3, 1.25, 0.12, '#c8c0b2')] },
    sink: { name: 'Мойка', cat: 'kitchen', w: 3, d: 1.2, col: '#e9e2d4', top: 1.72, parts: [b(0, 0, 0, 3, 1.2, 1.6, 'm'), b(0.1, 1.2, 0.12, 1.35, 0.03, 1.35, 'm3'), b(1.55, 1.2, 0.12, 1.35, 0.03, 1.35, 'm3'), b(0, 0, 1.6, 3, 1.25, 0.12, '#c8c0b2'), b(0.7, 0.2, 1.72, 1.4, 0.85, 0.02, '#9aa3ad'), b(1.32, 0.04, 1.72, 0.16, 0.14, 0.62, '#b9c0c7')] },
    stove: { name: 'Плита', cat: 'kitchen', w: 1.4, d: 1.2, col: '#ece7dd', top: 1.71, parts: [b(0, 0, 0, 1.4, 0.2, 2.3, 'm'), b(0, 0.2, 0, 1.4, 1.0, 1.6, 'm'), b(0.15, 1.2, 0.25, 1.1, 0.03, 0.95, '#2b2b2e'), b(0.1, 1.2, 1.3, 1.2, 0.03, 0.15, '#bdb6a8'), b(0.05, 0.25, 1.6, 1.3, 0.9, 0.08, '#2f2f31'), b(0.2, 0.35, 1.68, 0.4, 0.3, 0.03, '#58585c'), b(0.8, 0.35, 1.68, 0.4, 0.3, 0.03, '#58585c'), b(0.2, 0.75, 1.68, 0.4, 0.3, 0.03, '#58585c'), b(0.8, 0.75, 1.68, 0.4, 0.3, 0.03, '#58585c')] },
    fridge: { name: 'Холодильник', cat: 'kitchen', w: 1.6, d: 1.4, col: '#a9d8c8', top: 4.0, parts: [b(0, 0, 0, 1.6, 1.4, 4, 'm'), b(0.05, 1.4, 0.1, 1.5, 0.04, 2.5, 'm3'), b(0.05, 1.4, 2.7, 1.5, 0.04, 1.25, 'm3'), b(1.32, 1.44, 1.8, 0.08, 0.06, 0.7, '#c7cdd2'), b(1.32, 1.44, 2.85, 0.08, 0.06, 0.7, '#c7cdd2')] },
    rug: { name: 'Ковёр', cat: 'decor', w: 4, d: 3, flat: true, col: '#b65a4a', acc: '#e8d3b0', top: 0.07, parts: [b(0, 0, 0, 4, 3, 0.04, 'm'), b(0.3, 0.3, 0.04, 3.4, 2.4, 0.02, 'a'), b(0.7, 0.7, 0.06, 2.6, 1.6, 0.01, 'm3')] },
    lamp: { name: 'Торшер', cat: 'light', w: 0.8, d: 0.8, col: '#e9d7b2', parts: [b(0.2, 0.2, 0, 0.4, 0.4, 0.08, '#3a3a3a'), b(0.35, 0.35, 0.08, 0.1, 0.1, 2.9, '#3a3a3a'), b(0.05, 0.05, 2.98, 0.7, 0.7, 0.75, 'm')], glow: [[0.4, 0.4, 3.3, '#ffcf8a', 3.4]] },
    plant: { name: 'Фикус', cat: 'garden', w: 1, d: 1, col: '#b5653a', parts: [b(0.15, 0.15, 0, 0.7, 0.7, 0.75, 'm'), b(0, 0, 0.75, 1, 1, 0.9, '#5b8f55'), b(0.15, 0.15, 1.65, 0.7, 0.7, 0.6, '#6aa363'), b(0.3, 0.3, 2.25, 0.4, 0.4, 0.35, '#78b26f')] },
    catbed: { name: 'Лежанка Альпин', cat: 'decor', w: 1.3, d: 1.3, col: '#9b7bb0', parts: [b(0, 0, 0, 1.3, 1.3, 0.35, 'm'), b(0.25, 0.3, 0.35, 0.75, 0.6, 0.32, '#fbfaf6'), b(0.3, 0.9, 0.35, 0.4, 0.34, 0.32, '#ffffff'), b(0.33, 0.95, 0.67, 0.1, 0.1, 0.12, '#f1d2d9'), b(0.57, 0.95, 0.67, 0.1, 0.1, 0.12, '#f1d2d9')] },
    planter: { name: 'Грядка', cat: 'garden', w: 3, d: 1.2, col: '#8a5a36', top: 0.85, parts: [b(0, 0, 0, 3, 1.2, 0.8, 'm'), b(0.1, 0.1, 0.8, 2.8, 1.0, 0.05, '#4b3526')] },
    greenhouse: { name: 'Мини-теплица', cat: 'garden', w: 2, d: 1.4, col: 'rgba(214,238,230,.5)', top: 2.2, parts: [b(0, 0, 0, 2, 1.4, 0.15, '#7d8f86'), b(0.25, 0.3, 0.15, 0.5, 0.5, 0.7, '#5b8f55'), b(1.1, 0.5, 0.15, 0.6, 0.5, 0.9, '#6aa363'), b(0, 0, 0.15, 2, 1.4, 1.9, 'm'), b(0, 0.55, 2.05, 2, 0.3, 0.15, '#7d8f86')] },
    mat: { name: 'Мат', cat: 'gym', w: 3, d: 3, flat: true, col: '#3a5f8f', top: 0.26, parts: [b(0, 0, 0, 3, 3, 0.25, 'm')] },
    bag: { name: 'Груша', cat: 'gym', w: 1, d: 1, col: '#8b2f2f', parts: [b(0.15, 0.15, 1.3, 0.7, 0.7, 2.25, 'm'), b(0.12, 0.12, 3.55, 0.76, 0.76, 0.15, '#2b2b2b'), b(0.45, 0.45, 3.7, 0.1, 0.1, 2.3, '#777777')] },
    rack: { name: 'Гантели', cat: 'gym', w: 2.4, d: 0.9, col: '#3a3a3a', parts: [b(0, 0, 0, 2.4, 0.9, 0.12, 'm'), b(0, 0, 0.12, 0.1, 0.9, 1.25, 'm'), b(2.3, 0, 0.12, 0.1, 0.9, 1.25, 'm'), b(0.1, 0, 0.6, 2.2, 0.9, 0.08, 'm'), b(0.1, 0, 1.29, 2.2, 0.9, 0.08, 'm'), b(0.3, 0.25, 0.68, 0.5, 0.4, 0.25, '#1f1f1f'), b(1.0, 0.25, 0.68, 0.5, 0.4, 0.25, '#1f1f1f'), b(1.7, 0.25, 0.68, 0.4, 0.4, 0.25, '#b23b3b'), b(0.4, 0.25, 1.37, 0.6, 0.4, 0.3, '#1f1f1f'), b(1.3, 0.25, 1.37, 0.6, 0.4, 0.3, '#1f1f1f')] },
    workbench: { name: 'Верстак', cat: 'lab', w: 3.6, d: 1.4, col: '#9a6a3e', top: 1.68, parts: [...legs(3.6, 1.4, 1.5, 'm2', 0.18), b(0.25, 0.25, 0.4, 3.1, 0.9, 0.08, 'm2'), b(0, 0, 1.5, 3.6, 1.4, 0.18, 'm'), b(0.3, 0.25, 1.68, 0.6, 0.5, 0.35, '#5a6b7d'), b(1.2, 0.4, 1.68, 0.4, 0.3, 0.15, '#d4a13c'), b(2.4, 0.2, 1.68, 0.8, 0.6, 0.25, '#3b3f48')] },
    holo: { name: 'Голостол', cat: 'lab', w: 2.2, d: 2.2, col: '#353a46', top: 1.32, parts: [b(0.6, 0.6, 0, 1.0, 1.0, 1.2, 'm'), b(0, 0, 1.2, 2.2, 2.2, 0.12, 'm2'), b(0.35, 0.35, 1.32, 1.5, 1.5, 1.4, 'rgba(110,215,255,.3)')], glow: [[1.1, 1.1, 2.0, '#6fd8ff', 3.0, 'always']] },
    bot: { name: 'Робот-помощник', cat: 'lab', w: 0.9, d: 0.9, col: '#eef1f4', parts: [b(0.1, 0.1, 0, 0.7, 0.7, 0.7, 'm'), b(0.2, 0.2, 0.7, 0.5, 0.5, 0.4, 'm'), b(0.32, 0.7, 0.82, 0.26, 0.02, 0.14, '#5fd3ff')], glow: [[0.45, 0.72, 0.9, '#5fd3ff', 0.8, 'always']] },
    car: { name: 'Машина', cat: 'garage', w: 3.4, d: 6, col: '#4a2547', top: 1.4, parts: [b(0, 0.7, 0, 0.35, 1.2, 1.0, '#1b1b1d'), b(3.05, 0.7, 0, 0.35, 1.2, 1.0, '#1b1b1d'), b(0, 4.1, 0, 0.35, 1.2, 1.0, '#1b1b1d'), b(3.05, 4.1, 0, 0.35, 1.2, 1.0, '#1b1b1d'), b(0.35, 0, 0.45, 2.7, 6, 0.95, 'm'), b(0.55, 1.7, 1.4, 2.3, 2.6, 0.85, 'm2'), b(0.6, 4.3, 1.4, 2.2, 0.05, 0.8, '#9cc3d6'), b(0.6, 6, 0.8, 0.4, 0.03, 0.25, '#f5e6a8'), b(2.4, 6, 0.8, 0.4, 0.03, 0.25, '#f5e6a8')] },
    moto: { name: 'Мотоцикл', cat: 'garage', w: 1.1, d: 3.2, col: '#2b2b2e', parts: [b(0.4, 0, 0, 0.3, 1.0, 1.0, '#1b1b1d'), b(0.4, 2.2, 0, 0.3, 1.0, 1.0, '#1b1b1d'), b(0.3, 1.0, 0.45, 0.5, 1.2, 0.75, 'm'), b(0.33, 1.05, 1.2, 0.44, 0.55, 0.15, '#1f1f1f'), b(0.32, 1.6, 1.2, 0.46, 0.6, 0.35, '#7a1f2b'), b(0.5, 2.15, 1.0, 0.1, 0.1, 0.5, '#a8adb3'), b(0, 2.15, 1.5, 1.1, 0.1, 0.08, '#a8adb3')] },
    shopcounter: { name: 'Прилавок', cat: 'shop', w: 4, d: 1.4, col: '#7a4b2a', top: 1.82, parts: [b(0, 0.1, 0, 4, 1.3, 1.7, 'm'), b(0.2, 1.4, 0.3, 3.6, 0.03, 1.0, 'm3'), b(0, 0, 1.7, 4, 1.4, 0.12, '#d9d1c3'), b(0.4, 0.3, 1.82, 0.8, 0.7, 0.5, '#8d7a55'), b(2.4, 0.3, 1.82, 1.2, 0.6, 0.25, '#d9a25c')] },
    crates: { name: 'Ящики с овощами', cat: 'shop', w: 2.6, d: 1.1, col: '#b0895a', parts: [b(0, 0, 0, 1.25, 1.1, 0.6, 'm'), b(0.08, 0.08, 0.6, 1.09, 0.94, 0.14, '#d9483b'), b(1.35, 0, 0, 1.25, 1.1, 0.6, 'm'), b(1.43, 0.08, 0.6, 1.09, 0.94, 0.14, '#7fb04f')] },
    // ── на стену ──
    window: { name: 'Окно', cat: 'wall', wall: true, len: 2.6, z: 1.5, col: '#f3efe8', surf: [-0.15, 2.75, 0.6], top: 0.15, parts: [b(-0.15, 0, 0, 2.9, 0.6, 0.15, 'm'), b(0.18, 0, 0.33, 2.24, 0.04, 2.69, 'sky'), b(0, 0, 0.15, 0.18, 0.12, 3.05, 'm'), b(2.42, 0, 0.15, 0.18, 0.12, 3.05, 'm'), b(0.18, 0, 0.15, 2.24, 0.12, 0.18, 'm'), b(0.18, 0, 3.02, 2.24, 0.12, 0.18, 'm'), b(1.25, 0.04, 0.33, 0.1, 0.06, 2.69, 'm'), b(0.18, 0.04, 1.62, 2.24, 0.06, 0.1, 'm')] },
    wshelf: { name: 'Полка на стене', cat: 'wall', wall: true, len: 2.4, z: 3.3, col: '#7a4b2a', surf: [0, 2.4, 0.7], top: 0.12, parts: [b(0.25, 0, -0.4, 0.08, 0.5, 0.4, 'm2'), b(2.07, 0, -0.4, 0.08, 0.5, 0.4, 'm2'), b(0, 0, 0, 2.4, 0.7, 0.12, 'm')] },
    mirror: { name: 'Зеркало', cat: 'wall', wall: true, len: 1.2, z: 1.3, col: '#b08a4a', parts: [b(0.12, 0, 0.12, 0.96, 0.03, 2.16, '#cfe0ea'), b(0, 0, 0, 0.12, 0.08, 2.4, 'm'), b(1.08, 0, 0, 0.12, 0.08, 2.4, 'm'), b(0.12, 0, 0, 0.96, 0.08, 0.12, 'm'), b(0.12, 0, 2.28, 0.96, 0.08, 0.12, 'm')] },
    door: { name: 'Дверь', cat: 'wall', wall: true, len: 1.8, z: 0, col: '#efe9df', parts: [b(0, 0, 0, 1.8, 0.08, 3.9, 'm'), b(0.25, 0.08, 0.35, 1.3, 0.03, 1.5, 'm3'), b(0.25, 0.08, 2.1, 1.3, 0.03, 1.5, 'm3'), b(1.45, 0.08, 1.85, 0.12, 0.12, 0.12, '#d4b15a')] },
    clock: { name: 'Часы', cat: 'wall', wall: true, len: 0.9, z: 4.3, col: '#f3efe8', parts: [b(0, 0, 0, 0.9, 0.08, 0.9, 'm'), b(0.43, 0.08, 0.45, 0.04, 0.02, 0.3, '#333333'), b(0.45, 0.08, 0.43, 0.25, 0.02, 0.04, '#333333')] },
    garland: { name: 'Гирлянда', cat: 'light', wall: true, len: 4.4, z: 5.2, col: '#3a3a3a', parts: G.parts, glow: G.glow },
    holoscreen: { name: 'Голоэкран', cat: 'lab', wall: true, len: 2.6, z: 2.8, col: 'rgba(110,215,255,.3)', parts: [b(0, 0.3, 0, 2.6, 0.02, 1.6, 'm')], glow: [[1.3, 0.3, 0.8, '#6fd8ff', 3.2, 'always']] },
    toolswall: { name: 'Стена инструментов', cat: 'garage', wall: true, len: 3, z: 1.9, col: '#c9a46b', parts: [b(0, 0, 0, 3, 0.08, 2, 'm'), b(0.3, 0.08, 0.3, 0.15, 0.06, 1.2, '#7f8a94'), b(0.7, 0.08, 0.6, 0.5, 0.06, 0.15, '#c0392b'), b(1.4, 0.08, 0.2, 0.12, 0.06, 1.4, '#7f8a94'), b(1.8, 0.08, 0.9, 0.7, 0.06, 0.5, '#3d6e9e'), b(2.6, 0.08, 0.4, 0.12, 0.06, 1.1, '#d4a13c')] },
};
export const furnById = (t) => FURN[t] || null;
export const FURN_CATS = [['seat', 'Сидеть'], ['sleep', 'Спать'], ['table', 'Столы'], ['store', 'Хранение'], ['kitchen', 'Кухня'], ['kids', 'Детская'], ['light', 'Свет'], ['decor', 'Уют'], ['wall', 'На стену'], ['garden', 'Сад'], ['gym', 'Зал'], ['lab', 'Лаба'], ['garage', 'Гараж'], ['shop', 'Лавка']];

/** Раскладки комнат по лору. Напольное: [тип, x, y, поворот]; настенное: [тип, 'L'|'R', вдоль, высота?]. */
export const LAYOUT = {
    kitchen: { wall: 'brick', floor: 'checker', furn: [['counter', 0, 0, 0], ['stove', 3, 0, 0], ['sink', 4.4, 0, 0], ['fridge', 0, 1.4, 1], ['table', 4, 4.6, 0], ['chair', 5, 3.4, 0], ['chair', 4.3, 6.8, 2], ['chair', 5.7, 6.8, 2], ['window', 'L', 4.6], ['wshelf', 'R', 0.4, 3.6], ['garland', 'R', 0.3], ['clock', 'L', 1.6]] },
    living: { wall: 'brick', floor: 'herring', furn: [['rug', 2.4, 3.4, 1], ['bookcase', 0.4, 0, 0], ['record', 3.4, 0, 0], ['sofa', 0, 3, 1], ['ctable', 2.8, 4.6, 1], ['armchair', 6, 5.2, 3], ['lamp', 0.3, 8, 0], ['catbed', 6.2, 1.6, 0], ['plant', 8.6, 0.3, 0], ['window', 'R', 5.6], ['wshelf', 'L', 3.5, 4.4]] },
    bedroom: { wall: 'brick', floor: 'planks', furn: [['rug', 3.2, 5.6, 0], ['bed', 3, 0, 0], ['nightlamp', 1.8, 0.1, 0], ['nightstand', 7.2, 0.1, 0], ['wardrobe', 0, 6.2, 1], ['chair', 8.2, 6.2, 3], ['window', 'L', 1.8], ['mirror', 'L', 4.7], ['wshelf', 'R', 7.4, 3.6]] },
    nursery: { wall: 'pbrick', floor: 'carpet', furn: [['rug', 2.6, 3.6, 0], ['crib', 3.6, 0.3, 0], ['changing', 0, 3.2, 1], ['rocking', 6.6, 4.6, 3], ['lamp', 0.3, 6.8, 0], ['window', 'L', 6.6], ['wshelf', 'R', 6.6, 3.4]] },
    roof: { wall: 'skyline', floor: 'deck', furn: [['planter', 0.3, 0, 0], ['planter', 3.7, 0, 0], ['planter', 0, 1.6, 1], ['greenhouse', 7.4, 0.3, 0], ['deckchair', 4.6, 4.8, 0], ['deckchair', 6.3, 4.8, 0], ['ctable', 4.9, 7.6, 0], ['plant', 0.4, 8.4, 0], ['garland', 'R', 0.4, 4.2], ['garland', 'L', 0.4, 4.2]] },
    gym: { wall: 'brick', floor: 'rubber', furn: [['mat', 0.8, 3, 0], ['mat', 4, 3, 0], ['rack', 0.5, 0, 0], ['bag', 8, 1.6, 0], ['bench', 1, 7.6, 0], ['window', 'L', 2.6], ['clock', 'R', 4.5, 4.4]] },
    lab: { wall: 'brick', floor: 'concrete', furn: [['workbench', 0.6, 0, 0], ['workbench', 0, 2.2, 1], ['desk', 5.4, 0.2, 0], ['holo', 4.4, 4.4, 0], ['bot', 7.4, 6.2, 0], ['holoscreen', 'R', 5.6], ['toolswall', 'L', 6.6], ['wshelf', 'R', 0.8, 3.6]] },
    garage: { wall: 'brick', floor: 'concrete', furn: [['car', 1.2, 1.6, 0], ['moto', 7, 2.6, 0], ['workbench', 6.2, 0, 0], ['toolswall', 'R', 1, 1.9], ['wshelf', 'R', 5.6, 3.4]] },
    shop: { wall: 'wainscot', floor: 'checker', furn: [['pantry', 0.3, 0, 0], ['pantry', 3.1, 0, 0], ['radio', 6.4, 0.2, 0], ['shopcounter', 1.2, 5, 0], ['crates', 6.6, 6.4, 0], ['window', 'L', 2.2], ['clock', 'R', 8.4, 4.3]] },
};

/** Вещи как наклейки: высота в единицах комнаты и плоская ли (фото — плоское, на стену). */
export const STICK = { photo: [1.7, true], book: [0.95, false], plush: [1.25, false], plant: [1.5, false], nursery: [1.3, false], hobby: [1.1, false], decor: [1.4, false] };
/** Куда ставить вещь по месту из 0.2 (spot) — какие предметы мебели подходят. */
export const SPOT_FURN = {
    shelf: ['wshelf', 'bookcase', 'pantry', 'dresser'], table: ['table', 'ctable', 'desk', 'nightstand', 'nightlamp', 'dresser', 'counter', 'workbench', 'shopcounter', 'changing'],
    window: ['window'], bed: ['bed', 'crib'], sofa: ['sofa', 'armchair', 'rocking'], fridge: ['fridge'], plant: ['planter', 'greenhouse', 'window'],
};
