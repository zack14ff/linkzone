/*
 * Логика сайта: роутер на hash (#/mods, #/mod/<slug>), поиск, страницы проектов,
 * окно скачивания. Данные — data/projects.js, справочники — assets/js/catalog.js,
 * настройки — assets/js/config.js. Сборка не нужна: всё работает как есть.
 */
(function () {
  'use strict';

  /* ================= Настройки и справочники ================= */

  const CFG = Object.assign({
    name: 'ZoneLinks',
    heroTitle: '',
    tagline: '',
    pluginsEnabled: false,
    defaultTheme: 'dark',
    links: {},
    footerNote: ''
  }, window.SITE_CONFIG || {});

  const CAT = window.CATALOG;
  const TYPES = CAT.types;
  const TYPE_KEYS = Object.keys(TYPES);
  const LOADER_KEYS = Object.keys(CAT.loaders);
  const ROUTE_TO_TYPE = {};
  const SINGLE_TO_TYPE = {};
  TYPE_KEYS.forEach(k => {
    ROUTE_TO_TYPE[TYPES[k].route] = k;
    SINGLE_TO_TYPE[TYPES[k].single] = k;
  });

  const CHANNELS = {
    release: { label: 'Релиз', short: 'R' },
    beta: { label: 'Бета', short: 'B' },
    alpha: { label: 'Альфа', short: 'A' }
  };

  const SORTS = [
    ['relevance', 'По релевантности'],
    ['updated', 'Недавно обновлённые'],
    ['newest', 'Новые'],
    ['downloads', 'Популярные'],
    ['name', 'По названию']
  ];

  const LINKS = [
    ['modrinth', 'Modrinth', 'external'],
    ['curseforge', 'CurseForge', 'external'],
    ['source', 'Исходный код', 'code'],
    ['issues', 'Сообщить об ошибке', 'alert'],
    ['wiki', 'Вики', 'book'],
    ['discord', 'Discord', 'chat'],
    ['website', 'Сайт', 'globe']
  ];

  const THEME_KEY = 'zonelinks:theme';
  const VIEW_KEY = 'zonelinks:view';

  /* ================= Иконки ================= */

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    download: '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.6 6.6 0 0 0 9.7 9.7z"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    plug: '<path d="M9 2v5M15 2v5"/><path d="M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
    hourglass: '<path d="M6 2h12M6 22h12"/><path d="M7 2v3a5 5 0 0 0 10 0V2M7 22v-3a5 5 0 0 1 10 0v3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    server: '<rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
    scale: '<path d="M12 3v18M7 21h10M4 7h16"/><path d="m7 7-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="7" r="2"/><path d="M6 7v10M18 9v1a4 4 0 0 1-4 4H8"/>'
  };

  function ico(name) {
    return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ================= Утилиты ================= */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]); }
  function uniq(arr) { return Array.from(new Set(arr.filter(x => x != null && x !== ''))); }
  function norm(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е'); }

  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';
    return u;
  }

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* приватный режим */ } }
  };

  const renderMd = window.renderMarkdown || (s => '<p>' + esc(s) + '</p>');
  const nfCompact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });
  const dfLong = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  function toDate(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v) ? null : v;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v).trim());
    const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
    return isNaN(d) ? null : d;
  }
  function time(d) { return d ? d.getTime() : 0; }
  function fmtDate(v) { const d = toDate(v); return d ? dfLong.format(d) : ''; }

  function timeAgo(v) {
    const d = toDate(v);
    if (!d) return '';
    const day0 = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const days = Math.round((day0(d) - day0(new Date())) / 86400000);
    const a = Math.abs(days);
    if (a === 0) return 'сегодня';
    if (a < 7) return rtf.format(days, 'day');
    if (a < 30) return rtf.format(Math.round(days / 7), 'week');
    if (a < 365) return rtf.format(Math.round(days / 30), 'month');
    return rtf.format(Math.round(days / 365), 'year');
  }

  function fmtSize(b) {
    if (typeof b === 'string') return b.trim(); // размер можно указать текстом: '4.8 МБ'
    if (typeof b !== 'number' || !isFinite(b)) return '';
    const u = ['Б', 'КБ', 'МБ', 'ГБ'];
    let i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return (i ? b.toFixed(b < 10 ? 1 : 0) : b) + ' ' + u[i];
  }

  function plural(n, forms) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return forms[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
    return forms[2];
  }

  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  // Сортировка версий игры: 1.21.1 > 1.21 > 1.20.6 …, снапшоты — в конце
  function cmpGameVersion(a, b) {
    const ra = /^\d+(\.\d+)*$/.test(a), rb = /^\d+(\.\d+)*$/.test(b);
    if (ra && rb) {
      const x = a.split('.').map(Number), y = b.split('.').map(Number);
      for (let i = 0; i < Math.max(x.length, y.length); i++) {
        const d = (y[i] || 0) - (x[i] || 0);
        if (d) return d;
      }
      return 0;
    }
    if (ra !== rb) return ra ? -1 : 1;
    return b.localeCompare(a);
  }

  function loaderOrder(l) { const i = LOADER_KEYS.indexOf(l); return i < 0 ? 999 : i; }
  function loaderLabel(l) { return (CAT.loaders[l] && CAT.loaders[l].label) || l; }
  function categoryLabel(type, c) { return (CAT.categories[type] && CAT.categories[type][c]) || c; }
  function typeEnabled(t) { return t !== 'plugin' || !!CFG.pluginsEnabled; }
  function projectHref(p) { return '#/' + TYPES[p.type].single + '/' + encodeURIComponent(p.slug); }

  function options(list, selected) {
    return list.map(([v, l]) =>
      `<option value="${esc(v)}"${v === selected ? ' selected' : ''}>${esc(l)}</option>`).join('');
  }
  function selectBox(id, list, selected, label) {
    return `<div class="select-wrap"><select id="${id}" aria-label="${esc(label)}">${options(list, selected)}</select>${ico('chevron')}</div>`;
  }

  function setTitle(t) { document.title = t ? `${t} — ${CFG.name}` : CFG.name; }

  /* ================= Данные ================= */

  function warn(msg) { console.warn(`[${CFG.name}] ${msg}`); }

  function normalize(raw, index) {
    if (!raw || typeof raw !== 'object') return null;
    const where = `Проект #${index + 1} (${raw.slug || raw.title || 'без slug'})`;
    if (!TYPES[raw.type]) {
      warn(`${where}: неизвестный type «${raw.type}». Допустимо: ${TYPE_KEYS.join(', ')}.`);
      return null;
    }
    const type = raw.type;
    const slug = String(raw.slug || '').trim();
    if (!slug) { warn(`${where}: не указан slug — проект пропущен.`); return null; }

    const versions = (Array.isArray(raw.versions) ? raw.versions : []).map(v => {
      const files = (Array.isArray(v.files) ? v.files : []).filter(f => f && f.url).map(f => ({
        name: f.name || String(f.url).split('/').pop().split('?')[0],
        url: f.url,
        size: typeof f.size === 'number' || typeof f.size === 'string' ? f.size : null,
        primary: !!f.primary
      }));
      if (files.length && !files.some(f => f.primary)) files[0].primary = true;
      files.sort((a, b) => b.primary - a.primary);
      const number = String(v.number || v.name || '').trim();
      return {
        name: String(v.name || number || 'Без названия'),
        number,
        channel: CHANNELS[v.channel] ? v.channel : 'release',
        date: toDate(v.date) || toDate(raw.updated) || toDate(raw.published),
        gameVersions: uniq((v.gameVersions || []).map(String)).sort(cmpGameVersion),
        loaders: type === 'resourcepack' ? [] : uniq(v.loaders || []).sort((a, b) => loaderOrder(a) - loaderOrder(b)),
        changelog: v.changelog || '',
        files
      };
    }).sort((a, b) => time(b.date) - time(a.date));

    // Регистр не важен: 'Audio' и 'audio' — одна категория
    const knownCats = Object.keys(CAT.categories[type]);
    const categories = uniq((raw.categories || []).map(c => {
      const s = String(c).trim();
      return knownCats.find(k => k.toLowerCase() === s.toLowerCase()) || s;
    }));
    categories.forEach(c => {
      if (!CAT.categories[type][c]) warn(`${slug}: неизвестная категория «${c}» для типа ${type}.`);
    });

    const vTimes = versions.map(v => time(v.date)).filter(Boolean);
    const upd = Math.max(time(toDate(raw.updated)), ...vTimes, 0);
    const pub = toDate(raw.published) || (vTimes.length ? new Date(Math.min(...vTimes)) : null);

    return {
      type,
      slug,
      title: String(raw.title || slug),
      author: raw.author || '',
      authorUrl: raw.authorUrl || '',
      summary: raw.summary || '',
      description: raw.description || '',
      icon: raw.icon || '',
      categories,
      // 'review' — «На проверке», 'released' — «Опубликован», 'none' (или false) — без значка и плашки
      status: raw.status === false ? 'none' : ['review', 'released', 'none'].includes(raw.status) ? raw.status : 'review',
      demo: !!raw.demo,
      license: raw.license || '',
      licenseUrl: raw.licenseUrl || '',
      env: raw.environment || {},
      links: raw.links || {},
      dependencies: (Array.isArray(raw.dependencies) ? raw.dependencies : []).filter(d => d && (d.title || d.name)),
      gallery: (Array.isArray(raw.gallery) ? raw.gallery : [])
        .map(g => (typeof g === 'string' ? { url: g } : g)).filter(g => g && g.url),
      downloads: typeof raw.downloads === 'number' ? raw.downloads : null,
      versions,
      gameVersions: uniq(versions.flatMap(v => v.gameVersions)).sort(cmpGameVersion),
      loaders: uniq(versions.flatMap(v => v.loaders)).sort((a, b) => loaderOrder(a) - loaderOrder(b)),
      updatedAt: upd ? new Date(upd) : null,
      publishedAt: pub
    };
  }

  const projects = [];
  (function load() {
    const raw = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    if (!Array.isArray(window.PROJECTS)) warn('data/projects.js не загрузился или в нём ошибка — проверь консоль.');
    const seen = new Set();
    raw.forEach((r, i) => {
      const p = normalize(r, i);
      if (!p) return;
      const key = p.type + '/' + p.slug;
      if (seen.has(key)) { warn(`дубликат slug «${p.slug}» (${p.type}) — второй проект пропущен.`); return; }
      seen.add(key);
      if (typeEnabled(p.type)) projects.push(p);
    });
  })();

  /* ================= Поиск ================= */

  function score(p, tokens) {
    if (!tokens.length) return 1;
    const title = norm(p.title), slug = norm(p.slug), author = norm(p.author), summary = norm(p.summary);
    let total = 0;
    for (const t of tokens) {
      let s = 0;
      if (title === t) s = 100;
      else if (title.startsWith(t)) s = 60;
      else if (title.includes(t)) s = 40;
      else if (slug.includes(t)) s = 30;
      else if (author.includes(t)) s = 20;
      else if (summary.includes(t)) s = 10;
      if (!s) return 0;
      total += s;
    }
    return total;
  }

  const byUpdated = (a, b) => time(b.updatedAt) - time(a.updatedAt);

  function search(type, q, sort) {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    const cmp = {
      relevance: (a, b) => (b.s - a.s) || byUpdated(a.p, b.p),
      updated: (a, b) => byUpdated(a.p, b.p),
      newest: (a, b) => time(b.p.publishedAt) - time(a.p.publishedAt),
      downloads: (a, b) => (b.p.downloads || 0) - (a.p.downloads || 0),
      name: (a, b) => a.p.title.localeCompare(b.p.title, 'ru')
    }[sort] || ((a, b) => b.s - a.s);
    return projects
      .filter(p => p.type === type)
      .map(p => ({ p, s: score(p, tokens) }))
      .filter(x => x.s > 0)
      .sort(cmp)
      .map(x => x.p);
  }

  /* ================= Общие куски разметки ================= */

  function initials(title) {
    const w = String(title).split(/[\s\-_:.]+/).filter(Boolean);
    return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
  }

  function projectIcon(p, cls) {
    if (p.icon) return `<img class="picon ${cls}" src="${esc(safeUrl(p.icon))}" alt="" loading="lazy">`;
    const hue = (hashStr(p.slug) % 50) * 7.2;
    return `<div class="picon picon-gen ${cls}" style="--h:${hue.toFixed(0)}" aria-hidden="true">${esc(initials(p.title))}</div>`;
  }

  function statusBadge(p) {
    let html = '';
    if (p.demo) html += '<span class="badge badge-demo">Демо</span>';
    if (p.status === 'review') html += `<span class="badge badge-review">${ico('hourglass')}На проверке</span>`;
    if (p.status === 'released') html += `<span class="badge badge-released">${ico('check')}Опубликован</span>`;
    return html;
  }

  function categoryChips(p) {
    return p.categories.map(c => `<span class="chip">${esc(categoryLabel(p.type, c))}</span>`).join('');
  }

  function loaderChips(list) {
    return list.map(l => {
      const c = CAT.loaders[l] ? CAT.loaders[l].color : 'var(--muted)';
      return `<span class="chip chip-loader" style="--c:${esc(c)}">${esc(loaderLabel(l))}</span>`;
    }).join('');
  }

  function projectCard(p, opts) {
    opts = opts || {};
    const T = TYPES[p.type];
    return `
      <a class="pcard" href="${projectHref(p)}">
        ${projectIcon(p, 'pcard-icon')}
        <div class="pcard-main">
          <div class="pcard-title">
            <h3>${esc(p.title)}</h3>
            ${p.author ? `<span class="by">от ${esc(p.author)}</span>` : ''}
          </div>
          <p class="pcard-summary">${esc(p.summary)}</p>
          <div class="tags">${statusBadge(p)}${categoryChips(p)}${loaderChips(p.loaders)}</div>
        </div>
        <div class="pcard-stats">
          ${opts.showType ? `<span class="stat">${ico(T.icon)}${T.label}</span>` : ''}
          ${p.downloads != null ? `<span class="stat" title="Скачивания">${ico('download')}<b>${nfCompact.format(p.downloads)}</b></span>` : ''}
          ${p.updatedAt ? `<span class="stat" title="Обновлён ${esc(fmtDate(p.updatedAt))}">${ico('clock')}${timeAgo(p.updatedAt)}</span>` : ''}
        </div>
      </a>`;
  }

  function emptyState(icon, title, text, actions) {
    return `
      <div class="empty">
        <div class="empty-icon">${ico(icon)}</div>
        <h2>${title}</h2>
        ${text ? `<p>${text}</p>` : ''}
        ${actions ? `<div class="btn-row">${actions}</div>` : ''}
      </div>`;
  }

  function comingSoon(type) {
    const T = TYPES[type];
    return emptyState(T.icon, `${T.plural} — скоро`,
      `${esc(T.blurb)} Раздел уже в работе — загляни чуть позже.`,
      `<a class="btn btn-primary" href="#/mods">${ico('box')}К модам</a><a class="btn" href="#/resourcepacks">${ico('image')}К ресурспакам</a>`);
  }

  /* ================= Шапка, подвал, тема ================= */

  function currentTheme() { return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.innerHTML = ico(t === 'dark' ? 'sun' : 'moon');
    const label = t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }

  function renderChrome() {
    const gh = safeUrl(CFG.links && CFG.links.github);
    const dc = safeUrl(CFG.links && CFG.links.discord);
    document.getElementById('site-header').innerHTML = `
      <div class="container header-inner">
        <a class="brand" href="#/" aria-label="${esc(CFG.name)} — на главную">
          <img src="assets/img/logo.svg" alt="" width="34" height="34">
          <span>${esc(CFG.name)}</span>
        </a>
        <nav class="main-nav" aria-label="Разделы">
          ${TYPE_KEYS.map(k => `
            <a href="#/${TYPES[k].route}" data-nav="${k}">
              ${ico(TYPES[k].icon)}<span>${TYPES[k].plural}</span>${typeEnabled(k) ? '' : '<span class="soon">скоро</span>'}
            </a>`).join('')}
        </nav>
        <div class="header-actions">
          ${dc ? `<a class="icon-btn" href="${esc(dc)}" target="_blank" rel="noopener" title="Discord" aria-label="Discord">${ico('chat')}</a>` : ''}
          ${gh ? `<a class="icon-btn" href="${esc(gh)}" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">${ico('branch')}</a>` : ''}
          <button class="icon-btn" id="theme-toggle" type="button"></button>
        </div>
      </div>`;

    document.getElementById('site-footer').innerHTML = `
      <div class="container footer-inner">
        <div class="footer-top">
          <a class="brand brand-sm" href="#/"><img src="assets/img/logo.svg" alt="" width="26" height="26"><span>${esc(CFG.name)}</span></a>
          <nav class="footer-links">
            ${TYPE_KEYS.map(k => `<a href="#/${TYPES[k].route}">${TYPES[k].plural}</a>`).join('')}
          </nav>
        </div>
        <p>${esc(CFG.footerNote || 'Временная площадка для модов и ресурспаков, пока они проходят модерацию на больших сайтах.')}</p>
        <p class="footer-legal">Не является официальным продуктом Minecraft. Не одобрено и не связано с Mojang или Microsoft. Не связано с Modrinth.</p>
      </div>`;

    document.getElementById('theme-toggle').addEventListener('click', () => {
      const t = currentTheme() === 'dark' ? 'light' : 'dark';
      store.set(THEME_KEY, t);
      applyTheme(t);
    });
    applyTheme(currentTheme());
  }

  function setActiveNav(type) {
    document.querySelectorAll('.main-nav a').forEach(a => {
      const on = a.dataset.nav === type;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ================= Главная ================= */

  function viewHome() {
    setTitle('');
    document.title = `${CFG.name} — моды и ресурспаки на время проверки`;
    const heroTitle = esc(CFG.heroTitle || CFG.name).replace(/\*(.+?)\*/g, '<span class="grad">$1</span>');
    const recent = projects.slice().sort(byUpdated).slice(0, 6);

    const $app = document.getElementById('app');
    $app.innerHTML = `
      <section class="hero">
        <div class="container hero-inner">
          <img class="hero-logo" src="assets/img/logo.svg" alt="" width="88" height="88">
          <h1>${heroTitle}</h1>
          ${CFG.tagline ? `<p class="hero-text">${esc(CFG.tagline)}</p>` : ''}
          <form class="hero-search" role="search">
            ${ico('search')}
            <input type="search" name="q" placeholder="Найти мод или ресурспак…" autocomplete="off" spellcheck="false" aria-label="Поиск">
            <button class="btn btn-primary" type="submit">Найти</button>
          </form>
          <div class="hero-pills">
            ${TYPE_KEYS.map(k => {
              const T = TYPES[k];
              const badge = typeEnabled(k)
                ? `<span class="count">${projects.filter(p => p.type === k).length}</span>`
                : '<span class="soon">скоро</span>';
              return `<a class="pill" href="#/${T.route}">${ico(T.icon)}${T.plural}${badge}</a>`;
            }).join('')}
          </div>
        </div>
      </section>

      <section class="container section">
        <div class="section-head">
          <h2>Недавно обновлённые</h2>
          <a class="link-more" href="#/mods">Все моды ${ico('arrowRight')}</a>
        </div>
        ${recent.length
          ? `<div class="results grid">${recent.map(p => projectCard(p, { showType: true })).join('')}</div>`
          : emptyState('box', 'Пока пусто', 'Добавь первый проект в <code>data/projects.js</code> — инструкция в README.md.')}
      </section>

      <section class="container section">
        <div class="steps">
          <div class="step card">
            <span class="step-num">1</span>
            <h3>Найди проект</h3>
            <p>Ищи по названию, автору или описанию — среди модов, ресурспаков, а скоро и плагинов.</p>
          </div>
          <div class="step card">
            <span class="step-num">2</span>
            <h3>Выбери версию</h3>
            <p>Укажи версию Minecraft и платформу — сайт сам подберёт подходящий файл.</p>
          </div>
          <div class="step card">
            <span class="step-num">3</span>
            <h3>Скачай и играй</h3>
            <p>Файл качается напрямую. Когда проект пройдёт проверку, здесь появится ссылка на его официальную страницу.</p>
          </div>
        </div>
      </section>`;

    const form = $app.querySelector('.hero-search');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const q = form.q.value.trim();
      let target = 'mod';
      if (q) {
        const counts = TYPE_KEYS.filter(typeEnabled).map(k => [k, search(k, q, 'relevance').length]);
        const hit = counts.find(([k, n]) => k === 'mod' && n > 0) || counts.find(([, n]) => n > 0);
        if (hit) target = hit[0];
      }
      location.hash = '#/' + TYPES[target].route + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  /* ================= Каталог (поиск) ================= */

  function typeTabs(active, q) {
    return TYPE_KEYS.map(k => {
      const T = TYPES[k];
      const badge = typeEnabled(k)
        ? `<span class="count">${search(k, q, 'relevance').length}</span>`
        : '<span class="soon">скоро</span>';
      const href = '#/' + T.route + (q && typeEnabled(k) ? '?q=' + encodeURIComponent(q) : '');
      return `<a class="ttab${k === active ? ' active' : ''}" href="${href}">${ico(T.icon)}${T.plural}${badge}</a>`;
    }).join('');
  }

  function viewBrowse(type, params) {
    const T = TYPES[type];
    const $app = document.getElementById('app');
    setTitle(T.plural);

    const head = `
      <div class="page-head">
        <div>
          <h1>${T.plural}</h1>
          <p class="muted">${esc(T.blurb)}</p>
        </div>
      </div>`;

    if (!typeEnabled(type)) {
      $app.innerHTML = `<div class="container page">${head}<div class="type-tabs">${typeTabs(type, '')}</div>${comingSoon(type)}</div>`;
      return;
    }

    const sorts = SORTS.filter(([k]) => k !== 'downloads' || projects.some(p => p.downloads != null));
    const state = {
      q: params.get('q') || '',
      sort: sorts.some(([k]) => k === params.get('sort')) ? params.get('sort') : 'relevance',
      view: store.get(VIEW_KEY) === 'grid' ? 'grid' : 'list'
    };

    $app.innerHTML = `
      <div class="container page">
        ${head}
        <div class="type-tabs" id="type-tabs"></div>
        <div class="toolbar">
          <label class="search-box">
            ${ico('search')}
            <input type="search" id="q" placeholder="Поиск ${T.searchHint}…" value="${esc(state.q)}" autocomplete="off" spellcheck="false" aria-label="Поиск ${T.searchHint}">
            <kbd title="Нажми /, чтобы начать поиск">/</kbd>
          </label>
          <div class="toolbar-right">
            ${selectBox('sort', sorts, state.sort, 'Сортировка')}
            <div class="seg" role="group" aria-label="Вид списка">
              <button type="button" data-view="list" title="Списком" aria-label="Списком">${ico('list')}</button>
              <button type="button" data-view="grid" title="Сеткой" aria-label="Сеткой">${ico('grid')}</button>
            </div>
          </div>
        </div>
        <p class="results-info" id="info" aria-live="polite"></p>
        <div id="results"></div>
      </div>`;

    const $q = $app.querySelector('#q');
    const $sort = $app.querySelector('#sort');
    const $res = $app.querySelector('#results');
    const $info = $app.querySelector('#info');
    const $tabs = $app.querySelector('#type-tabs');

    function update() {
      const list = search(type, state.q, state.sort);
      $tabs.innerHTML = typeTabs(type, state.q);
      $info.textContent = state.q
        ? `Найдено: ${list.length}`
        : `${list.length} ${plural(list.length, ['проект', 'проекта', 'проектов'])}`;
      $res.className = 'results ' + state.view;

      if (list.length) {
        $res.innerHTML = list.map(p => projectCard(p)).join('');
      } else if (state.q) {
        const elsewhere = TYPE_KEYS.filter(k => k !== type && typeEnabled(k))
          .map(k => [k, search(k, state.q, 'relevance').length]).filter(([, n]) => n);
        $res.innerHTML = emptyState('search', 'Ничего не нашлось',
          `По запросу «${esc(state.q)}» среди ${T.searchHint} пусто.` + (elsewhere.length ? ' Но есть совпадения в других разделах:' : ' Попробуй другое слово.'),
          elsewhere.map(([k, n]) => `<a class="btn" href="#/${TYPES[k].route}?q=${encodeURIComponent(state.q)}">${ico(TYPES[k].icon)}${TYPES[k].plural}: ${n}</a>`).join(''));
      } else {
        $res.innerHTML = emptyState(T.icon, 'Здесь пока пусто', `${T.plural} появятся, как только их добавят в каталог.`);
      }

      $app.querySelectorAll('[data-view]').forEach(b => {
        b.classList.toggle('active', b.dataset.view === state.view);
        b.setAttribute('aria-pressed', b.dataset.view === state.view);
      });

      const qs = new URLSearchParams();
      if (state.q) qs.set('q', state.q);
      if (state.sort !== 'relevance') qs.set('sort', state.sort);
      const h = '#/' + T.route + (qs.toString() ? '?' + qs : '');
      if (location.hash !== h) history.replaceState(null, '', h);
    }

    $q.addEventListener('input', () => { state.q = $q.value.trim(); update(); });
    $sort.addEventListener('change', () => { state.sort = $sort.value; update(); });
    $app.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
      state.view = b.dataset.view;
      store.set(VIEW_KEY, state.view);
      update();
    }));
    update();
  }

  /* ================= Страница проекта ================= */

  function pickVersion(list) {
    return list.find(v => v.channel === 'release' && v.files.length) || list.find(v => v.files.length) || null;
  }

  function envInfo(p) {
    if (p.type === 'resourcepack') return { icon: 'monitor', label: 'Клиент', detail: 'Ставится в игру, на сервер не нужен' };
    const L = CAT.environment;
    const c = p.env.client, s = p.env.server;
    if (!L[c] && !L[s]) return p.type === 'plugin' ? { icon: 'server', label: 'Сервер', detail: '' } : null;
    const on = x => x === 'required' || x === 'optional';
    let label, icon;
    if (on(c) && !on(s)) { label = 'Только клиент'; icon = 'monitor'; }
    else if (!on(c) && on(s)) { label = 'Только сервер'; icon = 'server'; }
    else if (c === 'required' && s === 'required') { label = 'Клиент и сервер'; icon = 'globe'; }
    else if (c === 'required') { label = 'Клиент, сервер — по желанию'; icon = 'monitor'; }
    else if (s === 'required') { label = 'Сервер, клиент — по желанию'; icon = 'server'; }
    else { label = 'Клиент или сервер'; icon = 'globe'; }
    const detail = [L[c] ? 'Клиент: ' + L[c] : '', L[s] ? 'Сервер: ' + L[s] : ''].filter(Boolean).join(' · ');
    return { icon, label, detail };
  }

  function depsFor(p, loader) {
    return p.dependencies.filter(d => !loader || !Array.isArray(d.loaders) || !d.loaders.length || d.loaders.includes(loader));
  }

  function depItem(d) {
    const url = safeUrl(d.url);
    const meta = [d.required === false ? 'Необязательная' : 'Обязательная'];
    if (Array.isArray(d.loaders) && d.loaders.length) meta.push(d.loaders.map(loaderLabel).join(', '));
    const inner = `
      <span class="dep-ico">${ico('box')}</span>
      <span class="dep-text"><b>${esc(d.title || d.name)}</b><small>${esc(meta.join(' · '))}</small></span>
      ${url ? ico('external') : ''}`;
    return url
      ? `<a class="dep" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="dep">${inner}</div>`;
  }

  function statusBanners(p) {
    const out = [];
    if (p.demo) {
      out.push(`<div class="banner banner-demo">${ico('info')}<div><b>Это демо-проект.</b> Он показывает, как выглядит страница. Удали его из <code>data/projects.js</code> и добавь свои проекты.</div></div>`);
    }
    if (p.status === 'review') {
      out.push(`<div class="banner banner-review">${ico('hourglass')}<div><b>Проект на проверке.</b> Он ещё проходит модерацию на официальных площадках — а пока его можно скачать здесь.</div></div>`);
    }
    if (p.status === 'released') {
      const official = [['modrinth', 'Modrinth'], ['curseforge', 'CurseForge']].filter(([k]) => safeUrl(p.links[k]));
      out.push(`<div class="banner banner-released">${ico('check')}<div><b>Проект прошёл проверку.</b> На официальной странице всегда самая свежая версия.</div>
        ${official.length ? `<div class="banner-actions">${official.map(([k, l]) =>
          `<a class="btn btn-sm" href="${esc(safeUrl(p.links[k]))}" target="_blank" rel="noopener">${l}${ico('external')}</a>`).join('')}</div>` : ''}
      </div>`);
    }
    return out.join('');
  }

  function sidebar(p) {
    const T = TYPES[p.type];
    const cards = [];

    const compat = [];
    if (p.gameVersions.length) {
      const shown = p.gameVersions.slice(0, 12);
      const rest = p.gameVersions.length - shown.length;
      compat.push(`<div class="side-group"><div class="side-label">Minecraft: Java Edition</div><div class="tags">
        ${shown.map(v => `<span class="chip">${esc(v)}</span>`).join('')}
        ${rest > 0 ? `<span class="chip" title="${esc(p.gameVersions.slice(12).join(', '))}">+${rest}</span>` : ''}
      </div></div>`);
    }
    if (p.loaders.length) {
      compat.push(`<div class="side-group"><div class="side-label">Платформы</div><div class="tags">${loaderChips(p.loaders)}</div></div>`);
    }
    const env = envInfo(p);
    if (env) {
      compat.push(`<div class="side-group"><div class="side-label">Где нужен</div>
        <div class="env">${ico(env.icon)}<div><b>${esc(env.label)}</b>${env.detail ? `<small>${esc(env.detail)}</small>` : ''}</div></div></div>`);
    }
    if (compat.length) cards.push(`<section class="card side-card"><h3>Совместимость</h3>${compat.join('')}</section>`);

    if (p.dependencies.length) {
      cards.push(`<section class="card side-card"><h3>Зависимости</h3><div class="deps">${p.dependencies.map(depItem).join('')}</div></section>`);
    }

    const links = LINKS.filter(([k]) => safeUrl(p.links[k]));
    if (links.length) {
      cards.push(`<section class="card side-card"><h3>Ссылки</h3><div class="link-list">
        ${links.map(([k, label, icon]) => `<a href="${esc(safeUrl(p.links[k]))}" target="_blank" rel="noopener">${ico(icon)}<span>${label}</span>${ico('external')}</a>`).join('')}
      </div></section>`);
    }

    if (p.author) {
      const url = safeUrl(p.authorUrl);
      const inner = `<span class="avatar">${esc(initials(p.author))}</span><span><b>${esc(p.author)}</b><small>Автор</small></span>`;
      cards.push(`<section class="card side-card"><h3>Автор</h3>
        ${url ? `<a class="author" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="author">${inner}</div>`}
      </section>`);
    }

    const row = (icon, label, value) =>
      `<div class="detail">${ico(icon)}<span class="detail-label">${label}</span><span class="detail-value">${value}</span></div>`;
    const det = [row('tag', 'Тип', T.label)];
    if (p.license) {
      const lu = safeUrl(p.licenseUrl);
      det.push(row('scale', 'Лицензия', lu ? `<a href="${esc(lu)}" target="_blank" rel="noopener">${esc(p.license)}</a>` : esc(p.license)));
    }
    if (p.publishedAt) det.push(row('calendar', 'Опубликован', fmtDate(p.publishedAt)));
    if (p.updatedAt) det.push(row('clock', 'Обновлён', fmtDate(p.updatedAt)));
    cards.push(`<section class="card side-card"><h3>Детали</h3><div class="details">${det.join('')}</div></section>`);

    return cards.join('');
  }

  function versionTitle(v) {
    return v.number && v.number !== v.name ? `<b>${esc(v.name)}</b><small>${esc(v.number)}</small>` : `<b>${esc(v.name)}</b>`;
  }

  function channelMark(v) {
    const c = CHANNELS[v.channel];
    return `<span class="chan chan-${v.channel}" title="${c.label}">${c.short}</span>`;
  }

  function fileRow(f, primaryStyle) {
    const url = esc(safeUrl(f.url));
    const meta = [f.primary ? 'Основной файл' : 'Дополнительный файл', fmtSize(f.size)].filter(Boolean).join(' · ');
    return `
      <div class="file-row">
        <span class="file-ico">${ico('file')}</span>
        <span class="file-meta"><b>${esc(f.name)}</b><small>${meta}</small></span>
        <a class="btn${primaryStyle && f.primary ? ' btn-primary' : ''}" href="${url}" download="${esc(f.name)}">${ico('download')}<span>Скачать</span></a>
      </div>`;
  }

  function tabDescription(p) {
    return `<article class="card md">${p.description.trim() ? renderMd(p.description) : '<p class="muted">Описание пока не добавлено.</p>'}</article>`;
  }

  function tabGallery(p) {
    return `<div class="gallery">${p.gallery.map((g, i) => `
      <figure class="card gitem">
        <button type="button" data-gallery="${i}" aria-label="Открыть изображение ${i + 1}">
          <img src="${esc(safeUrl(g.url))}" alt="${esc(g.title || '')}" loading="lazy">
        </button>
        ${g.title || g.description ? `<figcaption>${g.title ? `<b>${esc(g.title)}</b>` : ''}${g.description ? `<span>${esc(g.description)}</span>` : ''}</figcaption>` : ''}
      </figure>`).join('')}</div>`;
  }

  function tabChangelog(p) {
    // Одна и та же версия под разные платформы показывается один раз
    const groups = [];
    const byKey = new Map();
    p.versions.forEach(v => {
      const key = v.number || v.name;
      if (byKey.has(key)) {
        const g = byKey.get(key);
        g.loaders = uniq(g.loaders.concat(v.loaders)).sort((a, b) => loaderOrder(a) - loaderOrder(b));
        g.gameVersions = uniq(g.gameVersions.concat(v.gameVersions)).sort(cmpGameVersion);
        if (!g.changelog && v.changelog) g.changelog = v.changelog;
      } else {
        const g = Object.assign({}, v);
        byKey.set(key, g);
        groups.push(g);
      }
    });
    if (!groups.length) return emptyState('layers', 'Версий пока нет', 'Файлы появятся здесь, как только автор их загрузит.');
    return `<div class="card timeline">${groups.map(v => `
      <div class="tl-item">
        <span class="tl-dot tl-${v.channel}"></span>
        <div class="tl-body">
          <div class="tl-head">
            <b>${esc(v.name)}</b>
            <span class="chan-label chan-${v.channel}">${CHANNELS[v.channel].label}</span>
            <span class="muted">${fmtDate(v.date)}</span>
          </div>
          <div class="tl-meta">${loaderChips(v.loaders)}${v.gameVersions.length ? `<span class="muted small">${esc(v.gameVersions.join(', '))}</span>` : ''}</div>
          <div class="md md-flat">${v.changelog.trim() ? renderMd(v.changelog) : '<p class="muted">Без описания изменений.</p>'}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  function tabVersions(p) {
    if (!p.versions.length) return emptyState('layers', 'Версий пока нет', 'Файлы появятся здесь, как только автор их загрузит.');
    const tools = [];
    if (p.gameVersions.length > 1) tools.push(selectBox('v-gv', [['', 'Все версии игры']].concat(p.gameVersions.map(v => [v, v])), '', 'Версия игры'));
    if (p.loaders.length > 1) tools.push(selectBox('v-loader', [['', 'Все платформы']].concat(p.loaders.map(l => [l, loaderLabel(l)])), '', 'Платформа'));
    return `
      ${tools.length ? `<div class="vtoolbar">${tools.join('')}</div>` : ''}
      <div class="card vlist">
        <div class="vrow vhead" aria-hidden="true">
          <span></span><span>Версия</span><span>Совместимость</span><span>Дата</span><span></span>
        </div>
        <div id="vrows"></div>
      </div>`;
  }

  function versionRows(p, list) {
    if (!list.length) return '<p class="vempty muted">Нет версий под выбранные параметры.</p>';
    return list.map(v => {
      const i = p.versions.indexOf(v);
      const f = v.files[0];
      const gv = v.gameVersions.length > 3
        ? `${v.gameVersions.slice(0, 3).join(', ')} и ещё ${v.gameVersions.length - 3}`
        : v.gameVersions.join(', ');
      return `
        <div class="vrow" data-i="${i}" tabindex="0" role="button" aria-expanded="false" aria-label="Подробнее о версии ${esc(v.name)}">
          ${f
            ? `<a class="dl-btn" href="${esc(safeUrl(f.url))}" download="${esc(f.name)}" title="Скачать ${esc(f.name)}" aria-label="Скачать ${esc(f.name)}">${ico('download')}</a>`
            : `<span class="dl-btn disabled" title="Нет файла">${ico('download')}</span>`}
          <div class="v-name">${channelMark(v)}<div>${versionTitle(v)}</div></div>
          <div class="v-compat">
            ${v.loaders.length ? `<div class="tags">${loaderChips(v.loaders)}</div>` : ''}
            <span class="v-gv" title="${esc(v.gameVersions.join(', '))}">${esc(gv)}</span>
          </div>
          <div class="v-date" title="${esc(fmtDate(v.date))}">${timeAgo(v.date)}</div>
          <span class="v-toggle">${ico('chevron')}</span>
        </div>
        <div class="vdetail" hidden>
          <div class="md md-flat">${v.changelog.trim() ? renderMd(v.changelog) : '<p class="muted">Без описания изменений.</p>'}</div>
          <div class="files">${v.files.map(fl => fileRow(fl, false)).join('') || '<p class="muted">У этой версии нет файлов.</p>'}</div>
        </div>`;
    }).join('');
  }

  function bindVersions(p) {
    const $app = document.getElementById('app');
    const $rows = $app.querySelector('#vrows');
    if (!$rows) return;
    const $gv = $app.querySelector('#v-gv');
    const $ld = $app.querySelector('#v-loader');

    function draw() {
      const gv = $gv ? $gv.value : '';
      const ld = $ld ? $ld.value : '';
      const list = p.versions.filter(v => (!gv || v.gameVersions.includes(gv)) && (!ld || v.loaders.includes(ld)));
      $rows.innerHTML = versionRows(p, list);
    }
    function toggle(row) {
      const detail = row.nextElementSibling;
      const open = detail.hidden;
      detail.hidden = !open;
      row.classList.toggle('open', open);
      row.setAttribute('aria-expanded', open);
    }
    $rows.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      const row = e.target.closest('.vrow');
      if (row) toggle(row);
    });
    $rows.addEventListener('keydown', e => {
      const row = e.target.closest('.vrow');
      if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(row); }
    });
    if ($gv) $gv.addEventListener('change', draw);
    if ($ld) $ld.addEventListener('change', draw);
    draw();
  }

  function viewProject(type, slug, tab) {
    const p = projects.find(x => x.type === type && x.slug === slug);
    if (!p) {
      if (!typeEnabled(type)) return viewBrowse(type, new URLSearchParams());
      return viewNotFound('Проект не найден', 'Возможно, его переименовали или удалили из каталога.');
    }
    const T = TYPES[type];
    const tabs = ['description', 'gallery', 'changelog', 'versions'];
    if (!tabs.includes(tab) || (tab === 'gallery' && !p.gallery.length)) tab = 'description';
    setTitle(p.title);

    const base = projectHref(p);
    const canDownload = p.versions.some(v => v.files.length);
    const body = { description: tabDescription, gallery: tabGallery, changelog: tabChangelog, versions: tabVersions }[tab](p);
    const tabLink = (key, label, count) =>
      `<a href="${base}${key === 'description' ? '' : '/' + key}"${tab === key ? ' class="active" aria-current="page"' : ''}>${label}${count != null ? `<span class="count">${count}</span>` : ''}</a>`;

    const $app = document.getElementById('app');
    $app.innerHTML = `
      <div class="container page project-page">
        <section class="card project-head">
          ${projectIcon(p, 'ph-icon')}
          <div class="ph-main">
            <div class="ph-kicker">${ico(T.icon)}${T.label}</div>
            <h1>${esc(p.title)}</h1>
            ${p.summary ? `<p class="ph-summary">${esc(p.summary)}</p>` : ''}
            <div class="tags">${statusBadge(p)}${categoryChips(p)}</div>
            <div class="ph-stats">
              ${p.downloads != null ? `<span class="stat">${ico('download')}<b>${nfCompact.format(p.downloads)}</b> ${plural(p.downloads, ['скачивание', 'скачивания', 'скачиваний'])}</span>` : ''}
              ${p.updatedAt ? `<span class="stat" title="${esc(fmtDate(p.updatedAt))}">${ico('clock')}Обновлён ${timeAgo(p.updatedAt)}</span>` : ''}
              <span class="stat">${ico('layers')}${p.versions.length} ${plural(p.versions.length, ['версия', 'версии', 'версий'])}</span>
              ${p.author ? `<span class="stat">${ico('user')}${esc(p.author)}</span>` : ''}
            </div>
          </div>
          <div class="ph-actions">
            <button class="btn btn-primary btn-lg" type="button" data-action="download"${canDownload ? '' : ' disabled'}>${ico('download')}${canDownload ? 'Скачать' : 'Файлов пока нет'}</button>
            <button class="btn" type="button" data-action="copy">${ico('link')}Скопировать ссылку</button>
          </div>
        </section>

        ${statusBanners(p)}

        <div class="project-layout">
          <div class="project-content">
            <nav class="tabs" aria-label="Разделы проекта">
              ${tabLink('description', 'Описание')}
              ${p.gallery.length ? tabLink('gallery', 'Галерея', p.gallery.length) : ''}
              ${tabLink('changelog', 'Изменения')}
              ${tabLink('versions', 'Версии', p.versions.length)}
            </nav>
            <div class="tab-body">${body}</div>
          </div>
          <aside class="project-side">${sidebar(p)}</aside>
        </div>
      </div>`;

    const dl = $app.querySelector('[data-action="download"]');
    if (canDownload) dl.addEventListener('click', () => openDownload(p));
    $app.querySelector('[data-action="copy"]').addEventListener('click', () => {
      copyText(location.href.split('#')[0] + base).then(
        () => toast('Ссылка скопирована'),
        () => toast('Не удалось скопировать ссылку'));
    });
    $app.querySelectorAll('[data-gallery]').forEach(b =>
      b.addEventListener('click', () => openLightbox(p, +b.dataset.gallery)));
    if (tab === 'versions') bindVersions(p);
  }

  /* ================= Окно скачивания ================= */

  function openDownload(p) {
    const T = TYPES[p.type];
    const useLoaders = p.loaders.length > 0;
    const best = pickVersion(p.versions);
    let gv = best && best.gameVersions[0] || '';
    let loader = useLoaders && best ? best.loaders[0] || '' : '';

    const bd = openModal(`
      <div class="modal-head">
        ${projectIcon(p, 'mh-icon')}
        <div class="mh-text">
          <h2>Скачать ${esc(p.title)}</h2>
          <p>${T.label}${p.author ? ' от ' + esc(p.author) : ''}</p>
        </div>
        <button class="icon-btn" type="button" data-close aria-label="Закрыть">${ico('close')}</button>
      </div>
      <div class="modal-body">
        ${p.demo ? `<div class="banner banner-demo banner-sm">${ico('info')}<div>Демо-проект: вместо мода скачается текстовый файл-заглушка.</div></div>` : ''}
        <div class="dl-fields">
          ${p.gameVersions.length ? `<label class="field"><span>Версия игры</span>${selectBox('dl-gv', p.gameVersions.map(v => [v, v]), gv, 'Версия игры')}</label>` : ''}
          ${useLoaders ? `<label class="field"><span>Платформа</span>${selectBox('dl-loader', [], '', 'Платформа')}</label>` : ''}
        </div>
        <div id="dl-result" aria-live="polite"></div>
        <div class="dl-hint">${ico('info')}<div>${T.install}</div></div>
      </div>
      <div class="modal-foot">
        <a class="link-more" href="${projectHref(p)}/versions">Все версии ${ico('arrowRight')}</a>
      </div>`, 'dl-modal');

    const $gv = bd.querySelector('#dl-gv');
    const $ld = bd.querySelector('#dl-loader');
    const $out = bd.querySelector('#dl-result');

    function refresh() {
      if ($gv) gv = $gv.value;
      if ($ld) {
        const avail = uniq(p.versions.filter(v => !gv || v.gameVersions.includes(gv)).flatMap(v => v.loaders))
          .sort((a, b) => loaderOrder(a) - loaderOrder(b));
        if (!avail.includes(loader)) loader = avail[0] || '';
        $ld.innerHTML = options(avail.map(l => [l, loaderLabel(l)]), loader);
      }
      const matches = p.versions.filter(v => (!gv || v.gameVersions.includes(gv)) && (!loader || v.loaders.includes(loader)));
      const v = pickVersion(matches);
      if (!v) {
        $out.innerHTML = `<div class="dl-none">${ico('alert')}Нет файлов для этой версии игры${useLoaders ? ' и платформы' : ''}.</div>`;
        return;
      }
      const deps = depsFor(p, loader);
      $out.innerHTML = `
        <div class="dl-version">
          ${channelMark(v)}
          <div>${versionTitle(v)}</div>
          <span class="muted small">${[CHANNELS[v.channel].label, fmtDate(v.date)].filter(Boolean).join(' · ')}</span>
        </div>
        <div class="files">${v.files.map(f => fileRow(f, true)).join('')}</div>
        ${deps.length ? `<div class="dl-deps"><div class="side-label">Также понадобится</div><div class="deps">${deps.map(depItem).join('')}</div></div>` : ''}`;
    }

    if ($gv) $gv.addEventListener('change', refresh);
    if ($ld) $ld.addEventListener('change', () => { loader = $ld.value; refresh(); });
    refresh();
    const first = bd.querySelector('select') || bd.querySelector('.btn-primary');
    if (first) first.focus({ preventScroll: true });
  }

  /* ================= Галерея ================= */

  function openLightbox(p, index) {
    const items = p.gallery;
    let i = index;
    const bd = openModal(`
      <button class="icon-btn lb-close" type="button" data-close aria-label="Закрыть">${ico('close')}</button>
      ${items.length > 1 ? `<button class="lb-nav lb-prev" type="button" aria-label="Предыдущее">${ico('chevronLeft')}</button>
      <button class="lb-nav lb-next" type="button" aria-label="Следующее">${ico('chevronRight')}</button>` : ''}
      <figure class="lb-figure"><img alt=""><figcaption></figcaption></figure>`, 'lightbox');
    const img = bd.querySelector('.lb-figure img');
    const cap = bd.querySelector('.lb-figure figcaption');

    function show() {
      const g = items[i];
      img.src = safeUrl(g.url);
      img.alt = g.title || '';
      cap.innerHTML = (g.title ? `<b>${esc(g.title)}</b>` : '') + (g.description ? `<span>${esc(g.description)}</span>` : '') +
        (items.length > 1 ? `<span class="muted small">${i + 1} / ${items.length}</span>` : '');
    }
    const step = d => { i = (i + d + items.length) % items.length; show(); };
    const prev = bd.querySelector('.lb-prev'), next = bd.querySelector('.lb-next');
    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));
    const onKey = e => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    modalCleanup = () => document.removeEventListener('keydown', onKey);
    bd.addEventListener('click', e => { if (e.target.classList.contains('modal') || e.target.classList.contains('lb-figure')) closeModal(); });
    show();
  }

  /* ================= Модальные окна, уведомления ================= */

  let modalCleanup = null;
  let lastFocus = null;

  function openModal(inner, cls) {
    closeModal();
    lastFocus = document.activeElement;
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop"><div class="modal ${cls || ''}" role="dialog" aria-modal="true">${inner}</div></div>`;
    const bd = root.firstElementChild;
    document.body.classList.add('modal-open');
    bd.addEventListener('mousedown', e => { if (e.target === bd) closeModal(); });
    bd.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
    const closeBtn = bd.querySelector('[data-close]');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    return bd;
  }

  function closeModal() {
    const root = document.getElementById('modal-root');
    if (!root.firstElementChild) return;
    if (modalCleanup) { modalCleanup(); modalCleanup = null; }
    root.innerHTML = '';
    document.body.classList.remove('modal-open');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) resolve(); else reject();
    });
  }

  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ================= 404 ================= */

  function viewNotFound(title, text) {
    setTitle('Не найдено');
    document.getElementById('app').innerHTML = `
      <div class="container page">
        <section class="nf">
          <div class="nf-code" aria-hidden="true">4<img src="assets/img/logo.svg" alt="">4</div>
          <h1>${esc(title || 'Эту страницу унесло течением')}</h1>
          <p>${esc(text || 'Такой страницы нет. Возможно, ссылка устарела или в ней опечатка.')}</p>
          <div class="btn-row">
            <a class="btn btn-primary" href="#/">На главную</a>
            <a class="btn" href="#/mods">${ico('box')}Каталог модов</a>
          </div>
        </section>
      </div>`;
  }

  /* ================= Роутер ================= */

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const qi = h.indexOf('?');
    const path = qi >= 0 ? h.slice(0, qi) : h;
    const params = new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : '');
    const parts = path.split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch (e) { return s; } });
    return { parts, params };
  }

  let lastPageKey = null;
  function router() {
    const { parts, params } = parseHash();
    closeModal();
    const [a, b, c] = parts;
    let navType = null;
    if (!a) viewHome();
    else if (ROUTE_TO_TYPE[a] && !b) { navType = ROUTE_TO_TYPE[a]; viewBrowse(navType, params); }
    else if (SINGLE_TO_TYPE[a] && b) { navType = SINGLE_TO_TYPE[a]; viewProject(navType, b, c); }
    else viewNotFound();
    setActiveNav(navType);
    const pageKey = parts.slice(0, 2).join('/');
    if (pageKey !== lastPageKey) window.scrollTo(0, 0);
    lastPageKey = pageKey;
  }

  /* ================= Запуск ================= */

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); return; }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const input = document.querySelector('#q, .hero-search input');
      if (input) { e.preventDefault(); input.focus(); input.select(); }
    }
  });

  renderChrome();
  window.addEventListener('hashchange', router);
  router();
})();
