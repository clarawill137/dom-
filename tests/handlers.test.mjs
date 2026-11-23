// Имена кнопок Дома: один обработчик на одно имя. HANDLERS собирается из нескольких кусков (Object.assign в ui.js
// и Doll.handlers), и одинаковое имя молча перезаписывает старое: в 0.4 «roll» плёнки съел «roll» хэд-машины —
// «Крутить» выкидывало на фотоплёнку. Тут — без таверны, по тексту файлов.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const here = new URL('..', import.meta.url);
const read = (f) => readFileSync(new URL(f, here), 'utf8');
const ui = read('ui.js');
const doll = read('doll.js');

/** Ключи верхнего уровня в блоке: строки с отступом ровно `pad` пробелов до закрывающей строки `end`. */
function keysOf(lines, from, pad, end) {
    const out = [];
    const re = new RegExp(`^ {${pad}}(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\\w$]*))\\s*:`);
    for (let i = from + 1; i < lines.length; i++) {
        if (end.test(lines[i])) return out;
        const m = lines[i].match(re);
        if (m) out.push({ key: m[1] || m[2] || m[3], line: i + 1 });
    }
    throw new Error(`блок со строки ${from + 1} не закрылся`);
}

const uiLines = ui.split('\n');
const all = [];
uiLines.forEach((l, i) => {
    if (/^const HANDLERS = \{\s*$/.test(l)) all.push(...keysOf(uiLines, i, 4, /^\};\s*$/).map(k => ({ ...k, file: 'ui.js' })));
    else if (/^Object\.assign\(HANDLERS, \{\s*$/.test(l)) all.push(...keysOf(uiLines, i, 4, /^\}\);\s*$/).map(k => ({ ...k, file: 'ui.js' })));
});
const dollLines = doll.split('\n');
const hStart = dollLines.findIndex(l => /^export function handlers\(/.test(l));
assert.ok(hStart >= 0, 'Doll.handlers на месте');
const ret = dollLines.findIndex((l, i) => i > hStart && /^ {4}return \{\s*$/.test(l));
assert.ok(ret > hStart, 'Doll.handlers возвращает объект');
all.push(...keysOf(dollLines, ret, 8, /^ {4}\};\s*$/).map(k => ({ ...k, file: 'doll.js' })));

assert.ok(all.length > 80, `обработчиков нашлось мало (${all.length}) — разбор файлов сломался?`);

// 1. ни одно имя не задано дважды
const seen = new Map();
const dups = [];
for (const k of all) {
    const was = seen.get(k.key);
    if (was) dups.push(`«${k.key}»: ${was.file}:${was.line} и ${k.file}:${k.line}`);
    else seen.set(k.key, k);
}
assert.deepEqual(dups, [], `одно имя — два обработчика (второй молча съест первый):\n${dups.join('\n')}`);

// 2. у каждой кнопки с постоянным именем есть обработчик
const names = new Set();
for (const src of [ui, doll]) {
    for (const m of src.matchAll(/data-dm="([A-Za-z_$][\w$]*)"/g)) names.add(m[1]);
    for (const m of src.matchAll(/\bbtn\('([A-Za-z_$][\w$]*)'/g)) names.add(m[1]);
}
const lost = [...names].filter(n => !seen.has(n));
assert.deepEqual(lost, [], `кнопки без обработчика: ${lost.join(', ')}`);

// 3. та самая пара: «Крутить» — хэд-машина, «Плёнка» — фотоплёнка
assert.match(ui, /^ {4}roll: \(\) => roll\(\),/m, '«roll» — это «Крутить» хэд-машины');
assert.match(ui, /data-dm="film">\$\{ic\('frame'\)\}<span>Плёнка/, 'кнопка «Плёнка» зовёт «film»');
assert.ok(seen.has('film') && !all.some(k => k.key === 'roll' && k.file === 'ui.js' && /modal\('roll'\)/.test(uiLines[k.line - 1])), 'плёнку открывает «film», не «roll»');

console.log(`дом · имена кнопок: ${all.length} обработчиков, ${names.size} кнопок с постоянным именем — дублей и сирот нет`);
