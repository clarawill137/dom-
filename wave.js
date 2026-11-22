// ✦ Дом — седьмая волна в ядре: что знает модель и что берёт Летописец (посылки, дела, магниты, рост, сезон).
// Экраны — в ui.js; здесь только связи с core, чтобы логика работала и без окна.

import * as C from './core.js';
import * as Post from './post.js';
import * as Chores from './chores.js';
import * as Growth from './growth.js';
import * as Board from './board.js';
import * as Season from './season.js';

C.addNote(() => [...Post.notes(), ...Chores.notes(), ...Board.notes(), ...Growth.notes(), Season.decorLine()]);
C.setChronMore(() => `,${Post.CHRON},${Chores.CHRON},${Board.CHRON}`);
C.addAfter((d, post) => [...Post.afterPost(d, post), ...Chores.afterPost(d, post), ...Board.afterPost(d, post)]);
export const ready = true;
