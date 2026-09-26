/*
 * Небольшой Markdown-рендер для описаний и списков изменений.
 * Умеет: заголовки, абзацы, **жирный**, *курсив*, ~~зачёркнутый~~, `код`, блоки ```,
 * ссылки, картинки, списки (в т.ч. вложенные и [x] задачи), цитаты, таблицы, ---.
 * Любой HTML внутри текста экранируется — вставить скрипт через описание нельзя.
 * Одиночный перенос строки внутри абзаца = перенос строки на странице.
 */
(function () {
  'use strict';

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const UNESC = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);
  const unesc = s => String(s).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => UNESC[e]);

  function safeUrl(raw) {
    const u = unesc(raw).trim();
    if (!u) return '';
    if (/^(https?:|mailto:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ''; // javascript:, data: и прочее — нельзя
    return u;
  }

  function inline(text) {
    const keep = [];
    const put = html => '\u0001' + (keep.push(html) - 1) + '\u0001';

    let s = String(text).replace(/`([^`]+)`/g, (m, code) => put('<code>' + esc(code) + '</code>'));
    s = esc(s);

    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
      const u = safeUrl(url);
      return u ? put('<img src="' + esc(u) + '" alt="' + alt + '" loading="lazy">') : '';
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const u = safeUrl(url);
      if (!u) return label;
      const ext = /^https?:/i.test(u) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return put('<a href="' + esc(u) + '"' + ext + '>') + label + put('</a>');
    });
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<\u0001]*[^\s<.,:;!?)\]\u0001])/g, (m, pre, url) =>
      pre + put('<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'));

    s = s.replace(/\*\*(?=\S)([^]*?\S)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^\p{L}\p{N}_])__(?=\S)([^]*?\S)__(?![\p{L}\p{N}_])/gu, '$1<strong>$2</strong>');
    s = s.replace(/(^|[^*\p{L}\p{N}])\*([^\s*](?:[^*]*[^\s*])?)\*(?![*\p{L}\p{N}])/gu, '$1<em>$2</em>');
    s = s.replace(/(^|[^\p{L}\p{N}_])_([^\s_](?:[^_]*[^\s_])?)_(?![\p{L}\p{N}_])/gu, '$1<em>$2</em>');
    s = s.replace(/~~(?=\S)([^]*?\S)~~/g, '<del>$1</del>');

    return s.replace(/\u0001(\d+)\u0001/g, (m, i) => keep[+i]);
  }

  const RE_FENCE = /^\s*(```|~~~)/;
  const RE_HEAD = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
  const RE_HR = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
  const RE_QUOTE = /^\s*>/;
  const RE_LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  const RE_TABLE_SEP = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

  const isBlockStart = l => RE_FENCE.test(l) || RE_HEAD.test(l) || RE_HR.test(l) || RE_QUOTE.test(l) || RE_LIST.test(l);
  const isTableAt = (lines, i) => lines[i].includes('|') && i + 1 < lines.length &&
    lines[i + 1].includes('|') && RE_TABLE_SEP.test(lines[i + 1]);
  const splitRow = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());

  function listItem(text) {
    const t = /^\[([ xX])\]\s+(.*)$/.exec(text);
    if (!t) return inline(text);
    return '<input type="checkbox" disabled' + (t[1] === ' ' ? '' : ' checked') + '> ' + inline(t[2]);
  }

  function renderList(items) {
    let html = '';
    const stack = [];
    items.forEach(it => {
      const tag = it.ordered ? 'ol' : 'ul';
      if (!stack.length || it.depth > stack[stack.length - 1].depth) {
        html += '<' + tag + '>';
        stack.push({ depth: it.depth, tag });
      } else {
        while (stack.length > 1 && it.depth < stack[stack.length - 1].depth) html += '</li></' + stack.pop().tag + '>';
        html += '</li>';
      }
      html += '<li>' + listItem(it.text);
    });
    while (stack.length) html += '</li></' + stack.pop().tag + '>';
    return html;
  }

  function render(src) {
    const lines = String(src == null ? '' : src).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      if (RE_FENCE.test(line)) {
        const fence = line.trim().slice(0, 3);
        const buf = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith(fence)) buf.push(lines[i++]);
        i++;
        out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }

      const h = RE_HEAD.exec(line);
      if (h) {
        const n = h[1].length;
        out.push('<h' + n + '>' + inline(h[2]) + '</h' + n + '>');
        i++;
        continue;
      }

      if (RE_HR.test(line)) { out.push('<hr>'); i++; continue; }

      if (RE_QUOTE.test(line)) {
        const buf = [];
        while (i < lines.length && RE_QUOTE.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
        out.push('<blockquote>' + render(buf.join('\n')) + '</blockquote>');
        continue;
      }

      if (RE_LIST.test(line)) {
        const items = [];
        while (i < lines.length) {
          const m = RE_LIST.exec(lines[i]);
          if (m) {
            items.push({ depth: m[1].replace(/\t/g, '    ').length, ordered: /^\d/.test(m[2]), text: m[3] });
            i++;
          } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) {
            items[items.length - 1].text += ' ' + lines[i++].trim();
          } else break;
        }
        out.push(renderList(items));
        continue;
      }

      if (isTableAt(lines, i)) {
        const head = splitRow(line);
        const align = splitRow(lines[i + 1]).map(c =>
          /^:-+:$/.test(c) ? 'center' : /-:$/.test(c) ? 'right' : '');
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) rows.push(splitRow(lines[i++]));
        const cell = (tag, c, j) =>
          '<' + tag + (align[j] ? ' style="text-align:' + align[j] + '"' : '') + '>' + inline(c) + '</' + tag + '>';
        out.push('<div class="table-wrap"><table><thead><tr>' +
          head.map((c, j) => cell('th', c, j)).join('') + '</tr></thead><tbody>' +
          rows.map(r => '<tr>' + head.map((_, j) => cell('td', r[j] || '', j)).join('') + '</tr>').join('') +
          '</tbody></table></div>');
        continue;
      }

      const buf = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i]) && !isTableAt(lines, i)) buf.push(lines[i++]);
      out.push('<p>' + buf.map(l => inline(l.trim())).join('<br>') + '</p>');
    }

    return out.join('\n');
  }

  window.renderMarkdown = render;
})();
