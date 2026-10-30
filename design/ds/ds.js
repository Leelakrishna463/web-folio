/* lee.sh datasheet: shared drawing + probe engine.
   A page calls DS.figure({ el, wide: [w, h], narrow: [w, h], narrowAt, build(api, mode) }).
   build() draws the part with the api helpers; every lettered part made with api.probe() becomes a control:
   hover, focus or click inverts it, lights its nets in red with LEE's bits running along them, and rewrites
   the figure caption. Arrow keys walk the parts, Escape clears, Enter follows a part's link. */
(function () {
  document.documentElement.classList.add('js');
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // "LEE" in ASCII, drawn as pulse code: 1 = long dash, 0 = short dash, wider gap between bytes
  var BYTES = ['01001100', '01000101', '01000101'];
  var BITS = [], BITLEN = 0;
  BYTES.forEach(function (b) {
    b.split('').forEach(function (c, i) {
      var on = c === '1' ? 7 : 2, off = i === 7 ? 14 : 4;
      BITS.push(on, off); BITLEN += on + off;
    });
  });

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function d(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + (+p[0]).toFixed(1) + ' ' + (+p[1]).toFixed(1); }).join(' '); }
  // PCB traces never turn square: cut every corner at 45°, r units back along each leg
  function chamfer(pts, r) {
    var out = [pts[0]];
    for (var i = 1; i < pts.length - 1; i++) {
      var a = pts[i - 1], p = pts[i], b = pts[i + 1];
      var l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
      var u1 = [(p[0] - a[0]) / l1, (p[1] - a[1]) / l1], u2 = [(b[0] - p[0]) / l2, (b[1] - p[1]) / l2];
      var square = Math.abs(u1[0] * u2[0] + u1[1] * u2[1]) < 1e-6 && (u1[0] === 0 || u1[1] === 0) && (u2[0] === 0 || u2[1] === 0);
      var c = Math.min(r, l1 / 2, l2 / 2);
      if (square && c > 0.5) { out.push([p[0] - u1[0] * c, p[1] - u1[1] * c]); out.push([p[0] + u2[0] * c, p[1] + u2[1] * c]); }
      else out.push(p);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function makeApi(svg, state) {
    var api = {
      svg: svg, el: el, d: d,
      g: function (parent, attrs) { return el('g', attrs || {}, parent || svg); },
      text: function (parent, x, y, str, o) {
        o = o || {};
        var t = el('text', { x: x, y: y, class: o.cls || 'lt', 'text-anchor': o.anchor || 'start', 'font-size': o.size || 12,
          transform: o.rot ? 'rotate(' + o.rot + ' ' + x + ' ' + y + ')' : null, 'dominant-baseline': o.mid ? 'central' : null }, parent);
        t.textContent = str;
        return t;
      },
      // several centred lines: [[text, size, cls], ...]
      lines: function (parent, x, y, rows, o) {
        o = o || {};
        var lh = o.lh || 1.3, yy = y;
        rows.forEach(function (r) {
          if (!r) return;
          api.text(parent, x, yy + r[1] * 0.35, r[0], { size: r[1], cls: r[2] || 'lt', anchor: o.anchor || 'middle' });
          yy += r[1] * lh + (r[3] || 0);
        });
        return yy;
      },
      // a row of pins along one edge; returns the outer end of each pin
      pins: function (parent, side, x, y, n, pitch, len, cls) {
        var out = [], p = '';
        for (var i = 0; i < n; i++) {
          var px = side === 't' || side === 'b' ? x + i * pitch : x, py = side === 'l' || side === 'r' ? y + i * pitch : y;
          var ex = px + (side === 'l' ? -len : side === 'r' ? len : 0), ey = py + (side === 't' ? -len : side === 'b' ? len : 0);
          p += 'M' + px + ' ' + py + ' L' + ex + ' ' + ey + ' ';
          out.push([ex, ey]);
        }
        el('path', { d: p, class: cls || 'pin' }, parent);
        return out;
      },
      // an IC package: body, optional pin rows on given edges, pin-1 mark
      chip: function (parent, o) {
        var g = api.g(parent);
        var pitch = o.pitch || 8, len = o.len || 5;
        (o.pins || '').split('').forEach(function (s) {
          var horiz = s === 't' || s === 'b', span = horiz ? o.w : o.h, n = Math.max(2, Math.floor((span - 10) / pitch));
          var start = (span - (n - 1) * pitch) / 2;
          if (horiz) api.pins(g, s, o.x + start, s === 't' ? o.y : o.y + o.h, n, pitch, len);
          else api.pins(g, s, s === 'l' ? o.x : o.x + o.w, o.y + start, n, pitch, len);
        });
        el('rect', { x: o.x, y: o.y, width: o.w, height: o.h, class: o.paper ? 'paper' : 'body' }, g);
        if (o.mark !== false) el('circle', { cx: o.x + 7, cy: o.y + 7, r: 2.2, class: 'ink in' }, g);
        return g;
      },
      // a net: the trace, plus an overlay that carries the bits when the net is live
      net: function (parent, pts, keys, o) {
        o = o || {};
        var dd = typeof pts === 'string' ? pts : d(o.square ? pts : chamfer(pts, o.r || 7));
        var p = el('path', { d: dd, class: 'net', 'data-net': keys }, parent);
        state.nets.push(p);
        var b = el('path', { d: dd, class: 'bits', 'data-net': keys, 'stroke-dasharray': BITS.join(' ') }, o.bitsParent || parent);
        b.style.setProperty('--bitlen', -BITLEN);
        state.bits.push(b);
        return p;
      },
      // bus-width mark: a short slash across the bus with its lane count
      width: function (parent, x, y, n, o) {
        o = o || {};
        el('path', { d: 'M' + (x - 5) + ' ' + (y + 5) + ' L' + (x + 5) + ' ' + (y - 5), class: 'ln' }, parent);
        api.text(parent, x + (o.dx != null ? o.dx : 7), y + (o.dy != null ? o.dy : -7), '/' + n, { cls: 'bw', size: 11, anchor: o.anchor });
      },
      // a lettered part that can be probed
      probe: function (parent, key, o) {
        var g = el('g', { class: 'pr', 'data-key': key, tabindex: 0, role: o.href ? 'link' : 'button', 'aria-label': o.label }, parent || svg);
        state.parts.push({ g: g, key: key, o: o });
        return g;
      }
    };
    return api;
  }

  function figure(cfg) {
    var fig = typeof cfg.el === 'string' ? document.querySelector(cfg.el) : cfg.el;
    var canvas = fig.querySelector('.canvas');
    // a figure reports a probe through its caption, through cfg.onShow (e.g. lettering on the part itself), or both
    var capN = fig.querySelector('figcaption .n'), capP = fig.querySelector('figcaption .p');
    var rest = capN ? { n: capN.textContent, p: capP.innerHTML } : null;
    var mode = null, pinned = null, shown = null, first = true, state;

    function build(m) {
      mode = m;
      var vb = cfg[m];
      canvas.innerHTML = '';
      var svg = el('svg', { viewBox: '0 0 ' + vb[0] + ' ' + vb[1], role: 'group', 'aria-label': fig.dataset.label || '' }, canvas);
      state = { nets: [], bits: [], parts: [] };
      cfg.build(makeApi(svg, state), m);
      // hit and focus boxes, sized to what each part actually drew
      state.parts.forEach(function (p) {
        var b = p.g.getBBox(), pad = p.o.pad != null ? p.o.pad : 4;
        var hit = el('rect', { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2, class: 'hit' });
        p.g.insertBefore(hit, p.g.firstChild);
        el('rect', { x: b.x - pad - 2, y: b.y - pad - 2, width: b.width + pad * 2 + 4, height: b.height + pad * 2 + 4, class: 'focus' }, p.g);
        wire(p);
      });
      if (first && !reduce) {
        svg.classList.add('draw');
        state.nets.forEach(function (n) {
          n.style.setProperty('--len', Math.ceil(n.getTotalLength()) + 1);
          n.style.setProperty('--d', (n.dataset.delay || 0) + 's');
        });
        setTimeout(function () { svg.classList.remove('draw'); }, 1500);
      }
      first = false;
      shown = null;
      show(pinned);
    }

    function find(key) { for (var i = 0; i < state.parts.length; i++) if (state.parts[i].key === key) return state.parts[i]; return null; }
    function show(key) {
      if (key === shown) return;
      shown = key;
      state.parts.forEach(function (p) { p.g.classList.toggle('on', p.key === key); });
      var live = function (n) { return key != null && (' ' + n.getAttribute('data-net') + ' ').indexOf(' ' + key + ' ') >= 0; };
      state.nets.forEach(function (n) { n.classList.toggle('live', live(n)); });
      state.bits.forEach(function (b) { b.classList.toggle('live', !reduce && live(b)); });
      var p = key != null && find(key);
      if (capN) {
        if (p) { capN.textContent = p.o.n || ''; capP.innerHTML = p.o.cap || ''; }
        else { capN.textContent = rest.n; capP.innerHTML = rest.p; }
      }
      if (cfg.onShow) cfg.onShow(p ? p.o : null, key);
    }
    function wire(p) {
      var g = p.g;
      g.addEventListener('pointerenter', function () { show(p.key); });
      g.addEventListener('pointerleave', function () { show(pinned); });
      g.addEventListener('focus', function () { show(p.key); });
      g.addEventListener('blur', function () { show(pinned); });
      g.addEventListener('click', function (e) { act(p, e); });
      g.addEventListener('keydown', function (e) {
        var k = e.key, i = state.parts.indexOf(p), next = null;
        if (k === 'Enter' || k === ' ') { e.preventDefault(); act(p); return; }
        if (k === 'Escape') { pinned = null; g.blur(); show(null); return; }
        if (k === 'ArrowRight' || k === 'ArrowDown') next = state.parts[(i + 1) % state.parts.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') next = state.parts[(i - 1 + state.parts.length) % state.parts.length];
        if (next) { e.preventDefault(); next.g.focus(); }
      });
    }
    var touch = matchMedia('(hover: none)');
    function act(p, e) {
      // on touch screens the first tap reveals what a linked part says; the second tap follows it
      if (p.o.href && touch.matches && e && pinned !== p.key) { pinned = p.key; show(p.key); return; }
      if (p.o.href) { location.href = p.o.href; return; }
      if (p.o.run) { p.o.run(); return; }
      pinned = pinned === p.key ? null : p.key;
      show(pinned === null ? p.key : pinned);
    }

    function pick() { return canvas.clientWidth < (cfg.narrowAt || 640) ? 'narrow' : 'wide'; }
    // draw once the lettering face is in, so hit boxes fit the real glyphs and the draw-in plays once
    var started = false;
    function start() {
      if (started) return; started = true;
      build(pick());
      new ResizeObserver(function () { var m = pick(); if (m !== mode) build(m); }).observe(canvas);
    }
    if (document.fonts) { document.fonts.ready.then(start); setTimeout(start, 900); } else start();
    return { show: function (k) { if (state) show(k); } };
  }

  // copy-to-clipboard with a select-text fallback
  function copy(btn, text) {
    btn.addEventListener('click', function () {
      var done = function () { var t = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = t; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
      function fallback() { var r = document.createRange(), s = getSelection(); r.selectNodeContents(document.getElementById(btn.dataset.target)); s.removeAllRanges(); s.addRange(r); }
    });
  }

  window.DS = { figure: figure, copy: copy };
})();
