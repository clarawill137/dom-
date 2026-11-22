// ✦ Дом — уютное: их квартира по комнатам, хэды на холодильнике, хэд-машина. Без драмы.
// Живёт рядом с Life (мост LifeBridge): его время, умная модель со сводом истории, картинки через Гардероб,
// хедканоны Life — общая полка (что висит на холодильнике, модель знает).

import * as C from './core.js';
import * as U from './ui.js';

const ID = 'dom';
let api = null;

function register() {
    const B = globalThis.LifeBridge;
    if (!B?.register) return false;
    B.register({ id: ID, init(a) { api = a; C.setApi(a); } });
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
            <label class="checkbox_label"><input type="checkbox" data-dmc="autoDraw" ${s.autoDraw ? 'checked' : ''}> Хэды рисуются сразу</label>
            <label>Хэд-машина <select data-dmc="model">${opt('deep', s.model, 'умная модель Life (со сводом)')}${opt('chron', s.model, 'модель Летописца')}</select></label>
            <small>Палочка → «Дом», команда <code>/dom</code> (<code>/dom hc</code> — сразу хэд-машина). Нужен Life; картинки — через Гардероб.</small>
            <div class="menu_button" id="dm_open" style="margin-top:6px">Открыть</div>
        </div>
    </div>`);
    host.querySelectorAll('[data-dmc]').forEach(el => el.addEventListener('change', () => {
        const k = el.dataset.dmc;
        C.cfg()[k] = el.type === 'checkbox' ? el.checked : el.value;
        C.saveCfg();
    }));
    document.getElementById('dm_open')?.addEventListener('click', () => U.open());
}

function registerSlash() {
    try {
        const { SlashCommandParser, SlashCommand } = SillyTavern.getContext();
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'dom',
            helpString: 'Дом: комнаты, хэды на холодильнике, хэд-машина. /dom hc — сразу хэд-машина; /dom kitchen — кухня.',
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
globalThis.Dom = { version: C.VERSION, open: (room) => U.open(room || null), openGen: () => U.open(null, true) };

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
    }, 500);
    try {
        const { eventSource, event_types: E } = SillyTavern.getContext();
        eventSource.on(E.CHAT_CHANGED, () => { if (U.isOpen()) U.close(); });
        if (E.APP_READY) eventSource.on(E.APP_READY, () => { addWand(); settingsDrawer(); });
    } catch (e) { console.warn('[Дом] события', e); }
});
