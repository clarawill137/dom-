// ✦ Дом — уютное: их квартира по комнатам, хэды на холодильнике, хэд-машина. Без драмы.
// Живёт рядом с Life (мост LifeBridge): его время, умная модель со сводом истории, картинки через Гардероб,
// хедканоны Life — общая полка (что висит на холодильнике, модель знает).

import * as C from './core.js';
import * as D from './data.js';
import * as U from './ui.js';
import './wave.js';

const ID = 'dom';
let api = null;

function register() {
    const B = globalThis.LifeBridge;
    if (!B?.register) return false;
    B.register({
        id: ID,
        init(a) { api = a; C.setApi(a); },
        prompt: (type) => C.promptNote(type),
        chron: (i) => C.chronHook(i),
        afterPost: (i, j, m) => { const t = C.afterPost(i, j, m); if (t.length) C.toast('info', t.slice(0, 3).map(C.esc).join(' · ')); U.renderSoon(); },
    });
    return true;
}

// ───────────── палочка, настройки, команда ─────────────

function addWand() {
    const menu = document.getElementById('extensionsMenu');
    if (!menu) return false;
    if (document.getElementById('dm-wand')) return true;
    const el = document.createElement('div');
    el.id = 'dm-wand';
    el.className = 'list-group-item flex-container flexGap5 interactable';
    el.tabIndex = 0;
    el.innerHTML = '<div class="fa-solid fa-house-chimney extensionsMenuExtensionButton"></div><span>Дом</span>';
    el.addEventListener('click', () => { try { $('#extensionsMenu').fadeOut(200); } catch { /* */ } U.open(); });
    menu.append(el);
    return true;
}

function settingsDrawer() {
    const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
    if (!host || document.getElementById('dm-drawer')) return;
    const s = C.cfg();
    const opt = (v, cur, t) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${t}</option>`;
    host.insertAdjacentHTML('beforeend', `
    <div id="dm-drawer" class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header"><b>✦ Дом</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>
        <div class="inline-drawer-content">
            <label class="checkbox_label"><input type="checkbox" data-dmc="on" ${s.on ? 'checked' : ''}> Включено</label>
            <label class="checkbox_label"><input type="checkbox" data-dmc="autoDraw" ${s.autoDraw ? 'checked' : ''}> Хэды и вещи рисуются сразу</label>
            <label class="checkbox_label"><input type="checkbox" data-dmc="chron" ${s.chron ? 'checked' : ''}> Летописец замечает новое в доме, записки и хорошие моменты</label>
            <label>Уютные детали модели <select data-dmc="prompt">${opt('auto', s.prompt, 'когда сцена дома')}${opt('always', s.prompt, 'всегда')}${opt('off', s.prompt, 'выкл')}</select></label>
            <label>Сезонный декор <select data-dmc="season">${opt('auto', s.season, 'сам, по дате истории')}${opt('off', s.season, 'выкл')}</select></label>
            <label>Хэд-машина <select data-dmc="model">${opt('deep', s.model, 'умная модель Life (со сводом)')}${opt('chron', s.model, 'модель Летописца')}</select></label>
            <small>Палочка → «Дом», команда <code>/dom</code> (<code>/dom hc</code> — сразу хэд-машина). Нужен Life; картинки — через Гардероб. Дом свой у каждой эпохи (ядро «Священный таймлайн»): палатка 1943-го, Адская кухня, Бруклин, трейлер и «Скиталец», квартира с Наташей, дом над лавкой Марко.</small>
            <div class="menu_button" id="dm_open" style="margin-top:6px">Открыть</div>
        </div>
    </div>`);
    host.querySelectorAll('[data-dmc]').forEach(el => el.addEventListener('change', () => {
        const k = el.dataset.dmc;
        C.cfg()[k] = el.type === 'checkbox' ? el.checked : el.value;
        C.saveCfg();
        try { api?.updatePrompt?.(); } catch { /* */ }
    }));
    document.getElementById('dm_open')?.addEventListener('click', () => U.open());
}

function registerSlash() {
    try {
        const { SlashCommandParser, SlashCommand } = SillyTavern.getContext();
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'dom',
            helpString: 'Дом: этажи и комнаты, вещи, полки уюта, хэды на холодильнике. /dom hc — хэд-машина; /dom kitchen | living | nursery | roof — комната.',
            returns: 'ничего',
            unnamedArgumentList: [],
            callback: (_a, v) => {
                const w = String(v || '').trim().toLowerCase();
                if (['hc', 'хэд', 'хэды', 'gen'].includes(w)) U.open(null, true);
                else U.open(w || null);
                return '';
            },
        }));
    } catch (e) { console.warn('[Дом] команда', e); }
}

// для Life и соседей
globalThis.Dom = {
    version: C.VERSION, open: (room) => U.open(room || null), openGen: () => U.open(null, true),
    // соседям (Зёрнышко): вещь в дом — например, купленное приданое встаёт в Детскую; имена малыша — общая доска
    add: (kind, x = {}) => { const k = D.KINDS[kind] ? kind : 'decor'; const it = C.addItem(k, { ...x }, { src: 'zr', room: D.roomById(x.room) ? x.room : D.roomFor(k) }); if (it.room && !it.spot) it.spot = D.DEFAULT_SPOT?.[k] || 'shelf'; C.touch(); try { U.renderSoon(); } catch { /* */ } return it.id; },
    names: () => C.itemsOf('name').map(x => ({ id: x.id, name: x.name, meaning: x.meaning || x.desc || '', votes: { ...(x.votes || {}) } })),
    addName: (x = {}) => { const it = C.addItem('name', { name: String(x.name || '').trim(), meaning: x.meaning || '' }, { src: 'zr' }); C.touch(); try { U.renderSoon(); } catch { /* */ } return it.id; },
    vote: (id, who, v) => { C.vote(id, who, v); try { U.renderSoon(); } catch { /* */ } },
    setImg: (id, img) => { C.setItem(id, { img }); try { U.renderSoon(); } catch { /* */ } },
};

jQuery(async () => {
    C.cfg();
    document.addEventListener('click', U.onClick, true);
    document.addEventListener('change', U.onChange);
    document.addEventListener('input', U.onInput);
    settingsDrawer();
    registerSlash();
    if (!addWand()) { let t = 0; const iv = setInterval(() => { if (addWand() || ++t > 40) clearInterval(iv); }, 500); }
    let tries = 0;
    const iv = setInterval(() => {
        if (register()) { clearInterval(iv); console.log('[Дом] подключился к Life'); return; }
        if (++tries > 120) { clearInterval(iv); window.toastr?.warning?.('Дом живёт рядом с Life, а Life не найден или старый (нужен мост LifeBridge).', '✦ Дом', { timeOut: 12000 }); }
        else if (tries === 2) C.bank();
    }, 500);
    try {
        const { eventSource, event_types: E } = SillyTavern.getContext();
        eventSource.on(E.CHAT_CHANGED, () => { C.bump(); if (U.isOpen()) U.close(); });
        const refresh = () => { C.bump(); try { api?.updatePrompt?.(); } catch { /* */ } U.renderSoon(); };
        const onAi = (id, type) => { if (type === 'impersonate') return; const i = Number(id); if (Number.isFinite(i)) C.spendShots(i); refresh(); };
        if (E.CHARACTER_MESSAGE_RENDERED) eventSource.on(E.CHARACTER_MESSAGE_RENDERED, onAi);
        else if (E.MESSAGE_RECEIVED) eventSource.on(E.MESSAGE_RECEIVED, onAi);
        for (const ev of [E.MESSAGE_SWIPED, E.MESSAGE_DELETED, E.MESSAGE_EDITED, E.MESSAGE_UPDATED]) if (ev) eventSource.on(ev, refresh);
        if (E.APP_READY) eventSource.on(E.APP_READY, () => { addWand(); settingsDrawer(); });
    } catch (e) { console.warn('[Дом] события', e); }
});
