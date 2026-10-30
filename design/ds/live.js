/* lee.sh, dark board pages: shared behaviour, loaded after ds.js.
   LIVE.card     the box that grows from a probed part's lead
   LIVE.trace    a trace (bus line) with a blip of light that now and then runs along it at a constant pace
   LIVE.board    the rest of the board, drawn blurred behind the focused part, each piece a link to its section
   LIVE.edge     where the drawing's visible edges fall, in drawing units, so parts can hug the screen edge
   LIVE.tour     opens each part in turn until the reader takes over
   LIVE.watch    re-fits a drawing whenever its canvas resizes */
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BLIP = 140;   // drawing units per second
  var touring = false;   // true while the tour, not the reader, is opening a part

  function wrap(str, n) {
    var out = [], line = '';
    str.split(' ').forEach(function (w) { if (line && (line + ' ' + w).length > n) { out.push(line); line = w; } else line = line ? line + ' ' + w : w; });
    if (line) out.push(line);
    return out;
  }

  // where a W × H box can open without covering anything that carries information (parts, chips, labels, lettering),
  // and the cord that reaches it from the lead's tip E without crossing any of it either. Traces and the blurred board
  // behind don't count, and neither does whatever E sits on (a card, a drive). The search covers the part of the drawing
  // that is on screen, plus the stage's edge beyond it on the right.
  // The cord is found on a grid (10 units, 5 on narrow drawings), moving only across or up and down and paying for every turn, so it comes out as a few
  // clean runs; the box chosen is the free one the cord reaches soonest. Returns { x, y, B: where the cord lands,
  // path: the cord's points } in drawing units, or null when nothing on screen is free (the caller then falls back).
  var D8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  function place(api, W, H, E, all) {
    var svg = api.svg, m = svg.getScreenCTM();
    if (!m) return null;
    var toX = function (cx) { return (cx - m.e) / m.a; }, toY = function (cy) { return (cy - m.f) / m.d; };
    var sr = svg.getBoundingClientRect(), stage = svg.closest('.stage'), st = stage ? stage.getBoundingClientRect() : sr;
    // beside the intro the drawing's own left edge is the limit; under it (small screens) the page gutter is free too
    var intro = document.querySelector('.intro'), beside = intro && intro.getBoundingClientRect().right <= sr.left + 1;
    var vx0 = toX(beside ? Math.max(sr.left, 0) : 0), vx1 = toX(Math.min(st.right, innerWidth));
    var vy0 = toY(Math.max(sr.top, st.top, all ? -Infinity : 0)), vy1 = toY(Math.min(sr.bottom, st.bottom, all ? Infinity : innerHeight));
    // what may not be covered, each with an 8-unit margin
    var raw = [];
    svg.querySelectorAll('text, rect, circle, path.pin, path.paper, path.pads, path.gold, path.ln, path.dash, path.body').forEach(function (el) {
      if (el.closest('.tip, .brd') || /\b(hit|focus|tagbg|ext)\b/.test(el.getAttribute('class') || '')) return;
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      raw.push([toX(r.left), toY(r.top), toX(r.right), toY(r.bottom)]);
    });
    var obs = raw.map(function (b) { return [b[0] - 8, b[1] - 8, b[2] + 8, b[3] + 8]; });
    obs.push([E[0] - 10, E[1] - 10, E[0] + 10, E[1] + 10]);

    // the grid the cord runs on; cells under content are walls
    // a finer grid on narrow drawings, where the gaps between parts are tighter
    var G = vx1 - vx0 < 500 ? 5 : 10, cols = Math.floor((vx1 - vx0) / G), rows = Math.floor((vy1 - vy0) / G);
    if (cols < 2 || rows < 2) return null;
    var N = cols * rows, wall = new Uint8Array(N);
    raw.forEach(function (b) {
      if (E[0] >= b[0] && E[0] <= b[2] && E[1] >= b[1] && E[1] <= b[3]) return;
      var c0 = Math.max(0, Math.floor((b[0] - 3 - vx0) / G)), c1 = Math.min(cols - 1, Math.floor((b[2] + 3 - vx0) / G));
      var r0 = Math.max(0, Math.floor((b[1] - 3 - vy0) / G)), r1 = Math.min(rows - 1, Math.floor((b[3] + 3 - vy0) / G));
      for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) wall[r * cols + c] = 1;
    });
    var ec = Math.floor((E[0] - vx0) / G), er = Math.floor((E[1] - vy0) / G);
    if (ec < 0 || er < 0 || ec >= cols || er >= rows) return null;
    var start = er * cols + ec;
    wall[start] = 0;

    // shortest cord to every cell, by (cell, heading): straight steps and square turns only (no diagonals), each turn costing 3 cells
    var S = N * 8, dist = new Float32Array(S).fill(Infinity), prev = new Int32Array(S).fill(-1);
    var hk = [], hs = [];
    function push(k, v) {
      var i = hk.length; hk.push(k); hs.push(v);
      while (i) { var j = (i - 1) >> 1; if (hk[j] <= k) break; hk[i] = hk[j]; hs[i] = hs[j]; hk[j] = k; hs[j] = v; i = j; }
    }
    function pop() {
      var v = hs[0], lk = hk.pop(), lv = hs.pop();
      if (hk.length) {
        hk[0] = lk; hs[0] = lv;
        for (var i = 0; ;) {
          var l = 2 * i + 1, r = l + 1, mI = i;
          if (l < hk.length && hk[l] < hk[mI]) mI = l;
          if (r < hk.length && hk[r] < hk[mI]) mI = r;
          if (mI === i) break;
          var tk = hk[i], tv = hs[i]; hk[i] = hk[mI]; hs[i] = hs[mI]; hk[mI] = tk; hs[mI] = tv; i = mI;
        }
      }
      return v;
    }
    for (var d0 = 0; d0 < 8; d0 += 2) { dist[start * 8 + d0] = 0; push(0, start * 8 + d0); }
    while (hk.length) {
      var k0 = hk[0], s0 = pop();
      if (k0 > dist[s0]) continue;
      var c = s0 >> 3, d = s0 & 7, cr = (c / cols) | 0, cc = c - cr * cols;
      for (var t = -2; t <= 2; t += 2) {
        var nd = (d + t + 8) & 7, dc = D8[nd][0], dr = D8[nd][1], nc = cc + dc, nr = cr + dr;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        var ni = nr * cols + nc;
        if (wall[ni] || (dc && dr && (wall[cr * cols + nc] || wall[nr * cols + cc]))) continue;
        var ns = ni * 8 + nd, nv = k0 + (dc && dr ? 1.414 : 1) + (t ? 3 : 0);
        if (nv < dist[ns]) { dist[ns] = nv; prev[ns] = s0; push(nv, ns); }
      }
    }
    var cell = new Float32Array(N).fill(Infinity), via = new Int32Array(N).fill(-1);
    for (var q = 0; q < S; q++) if (dist[q] < cell[q >> 3]) { cell[q >> 3] = dist[q]; via[q >> 3] = q; }

    // every free spot for the box, and how soon the cord reaches its edge
    var best = null;
    for (var y = vy0 + 6; y + H <= vy1 - 6; y += 10) {
      for (var x = vx0 + 6; x + W <= vx1 - 6; x += 10) {
        var free = true;
        for (var i = 0; i < obs.length; i++) {
          var o = obs[i];
          if (Math.min(x + W, o[2]) > Math.max(x, o[0]) && Math.min(y + H, o[3]) > Math.max(y, o[1])) { free = false; break; }
        }
        if (!free) continue;
        var bc0 = Math.max(0, Math.ceil((x - vx0) / G)), bc1 = Math.min(cols - 1, Math.floor((x + W - vx0) / G) - 1);
        var br0 = Math.max(0, Math.ceil((y - vy0) / G)), br1 = Math.min(rows - 1, Math.floor((y + H - vy0) / G) - 1);
        for (var pr = br0; pr <= br1; pr++) {
          var step = pr === br0 || pr === br1 ? 1 : Math.max(1, bc1 - bc0);
          for (var pc = bc0; pc <= bc1; pc += step) {
            var v = cell[pr * cols + pc];
            if (v < Infinity && (!best || v < best.cost)) best = { x: x, y: y, cost: v, end: pr * cols + pc };
          }
        }
      }
    }
    if (!best) return null;

    // the cord: back from the box's edge to the tip, cell by cell, merged into straight runs
    var cells = [];
    for (var sI = via[best.end]; sI >= 0; sI = prev[sI]) cells.push(sI);
    cells.reverse();
    var pts = [E], lastD = -1;
    cells.forEach(function (st2, idx) {
      if (idx === 0) return;
      var ci = st2 >> 3, cy = (ci / cols) | 0, cx = ci - cy * cols, p2 = [vx0 + (cx + .5) * G, vy0 + (cy + .5) * G];
      if ((st2 & 7) === lastD) pts[pts.length - 1] = p2; else pts.push(p2);
      lastD = st2 & 7;
    });
    // the first run lines up with the lead's tip, so the cord leaves it straight
    if (pts.length > 2 && cells.length > 1) {
      var h0 = D8[cells[1] & 7];
      if (!h0[1]) pts[1][1] = E[1]; else if (!h0[0]) pts[1][0] = E[0];
    }
    // land on the box's edge: the last run, clipped where it enters the box
    var bx = [best.x, best.y, best.x + W, best.y + H];
    if (pts.length === 1) pts.push([Math.max(bx[0], Math.min(E[0], bx[2])), Math.max(bx[1], Math.min(E[1], bx[3]))]);
    var a1 = pts[pts.length - 2], a2 = pts[pts.length - 1];
    var B = enter(a1, a2, bx) || [Math.max(bx[0], Math.min(a2[0], bx[2])), Math.max(bx[1], Math.min(a2[1], bx[3]))];
    pts[pts.length - 1] = B;
    return { x: best.x, y: best.y, B: B, path: pts };
  }
  // where the segment p–q first enters rectangle r (Liang–Barsky clipping), or null
  function enter(p, q, r) {
    var dx = q[0] - p[0], dy = q[1] - p[1], t0 = 0, t1 = 1;
    var P = [-dx, dx, -dy, dy], Q = [p[0] - r[0], r[2] - p[0], p[1] - r[1], r[3] - p[1]];
    for (var i = 0; i < 4; i++) {
      if (P[i] === 0) { if (Q[i] < 0) return null; continue; }
      var t = Q[i] / P[i];
      if (P[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; }
      else { if (t < t0) return null; if (t < t1) t1 = t; }
    }
    return t0 <= t1 ? [p[0] + t0 * dx, p[1] + t0 * dy] : null;
  }

  // o: { end: [x, y] the lead's tip, W, narrow, vb: [w, h], title, tag, flip (title on the right),
  //      rows: [{ small } | { text } | { act } | { load: n, text }],
  //      dir: 'l' | 'r' | 'u' | 'd', at, x, up: where the box opens if it can't be placed in free space (see place) }
  function card(api, layer, o) {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    var n = o.narrow, W = o.W, VW = o.vb[0], VH = o.vb[1];
    var fs = n ? 12.5 : 15.5, hh = n ? 24 : 32, padX = n ? 10 : 12, lh = fs * 1.35, sm = n ? 10.5 : 11.5, cpl = Math.floor((W - padX * 2) / (fs * 0.5));
    var ops = [], body = 0;
    o.rows.forEach(function (r) {
      if (r.small != null) { ops.push(['small', r.small]); body += sm + 8; }
      else if (r.load != null) { ops.push(['load', r.load, r.text]); body += lh; }
      else if (r.act != null) wrap(r.act.toUpperCase(), Math.floor((W - padX * 2) / (sm * 0.6))).forEach(function (l) { ops.push(['act', l]); body += sm + 6; });
      else wrap(r.text, cpl).forEach(function (l) { ops.push(['text', l]); body += lh; });
    });
    var H = hh + 12 + body + 6, at = o.at != null ? o.at : o.end[1];
    var lo = 4, hi = VW - W - 4, x, top, up;
    if (o.dir === 'r' || o.dir === 'l') {
      x = o.dir === 'r' ? o.end[0] : o.end[0] - W;
      top = at - hh / 2; up = top + H > VH - 6; if (up) top = at + hh / 2 - H;
    } else {
      x = Math.max(lo, Math.min(hi, o.end[0] - W / 2));
      up = o.dir === 'u'; top = up ? o.end[1] - H : o.end[1];
    }
    if (o.x != null) x = o.x;
    if (o.up != null) { up = o.up; top = up ? at + hh / 2 - H : at - hh / 2; }
    // a free spot, if there is one on screen: the box opens there, reached by a cord, and grows from where the cord lands
    var spot = place(api, W, H, o.end) || place(api, W, H, o.end, true), origin = o.end, style = '';
    if (spot) {
      x = spot.x; top = spot.y; up = false; origin = spot.B;
      var c = api.el('path', { d: api.d(spot.path), class: 'cord' }, layer), len = c.getTotalLength();
      c.style.strokeDasharray = c.style.strokeDashoffset = len;
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.style.strokeDashoffset = 0; }); });
      style = ';--d:' + (.22 + Math.min(.3, len / 1200)).toFixed(2) + 's';
    }
    var hy = up ? top + H - hh : top, by = up ? top : top + hh;
    var g = api.g(layer, { class: 'tip', style: '--o:' + origin[0] + 'px ' + origin[1] + 'px' + style });
    api.el('rect', { x: x, y: top, width: W, height: H, class: 'box' }, g);
    api.el('rect', { x: x, y: hy, width: W, height: hh, class: 'hd' }, g);
    api.text(g, o.flip ? x + W - padX : x + padX, hy + hh / 2, o.title, { size: fs, cls: 'lt hdt', anchor: o.flip ? 'end' : 'start', mid: true });
    if (o.tag) api.text(g, o.flip ? x + padX : x + W - padX, hy + hh / 2, o.tag, { size: sm, cls: 'lab hdt', anchor: o.flip ? 'start' : 'end', mid: true });
    var yy = by + 20;
    ops.forEach(function (p) {
      if (p[0] === 'small') { api.text(g, x + padX, yy, p[1], { size: sm, cls: 'num', mid: true }); yy += sm + 8; }
      else if (p[0] === 'load') {
        for (var i = 0; i < 3; i++) api.el('rect', { x: x + padX + i * 12, y: yy - 4.5, width: 9, height: 9, class: i < p[1] ? 'ink' : 'thin' }, g);
        api.text(g, x + padX + 44, yy, p[2], { size: fs, cls: 'mk', mid: true }); yy += lh;
      }
      else if (p[0] === 'act') { api.text(g, x + padX, yy, p[1], { size: sm + .5, cls: 'lab act', mid: true }); yy += sm + 6; }
      else { api.text(g, x + padX, yy, p[1], { size: fs, cls: 'mk', mid: true }); yy += lh; }
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { g.classList.add('in'); }); });
    // a box the reader opened (not the tour) that landed off screen is scrolled to
    if (spot && !touring) {
      var box = g.firstChild.getBoundingClientRect();
      if (box.top < 0 || box.bottom > innerHeight) setTimeout(function () { g.firstChild.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' }); }, 250);
    }
    return g;
  }

  // a trace and its blip; call set(points) whenever its ends move. seed (0–9) staggers its rhythm; inward runs the blip back
  function trace(api, parent, seed, inward) {
    var p = api.el('path', { class: 'trace' }, parent), b = api.el('path', { class: 'blip' }, parent), ran = false, run = null;
    return {
      path: p,
      set: function (pts) {
        var d = typeof pts === 'string' ? pts : api.d(pts);
        p.setAttribute('d', d); b.setAttribute('d', d);
        var len = p.getTotalLength();
        b.setAttribute('stroke-dasharray', '10 ' + Math.ceil(len + 10));
        // every blip travels at the same pace, so a long trace takes longer to cross; only the pause after it differs,
        // so traces never pulse together. The first run waits for the traces to draw out
        if (still || !b.animate) return;
        if (run) run.cancel();
        var travel = len / BLIP * 1000, gap = 2000 + seed * 600, k = travel / (travel + gap), end = -len + 'px';
        run = b.animate([
          { strokeDashoffset: '10px', opacity: 1, offset: 0 },
          { strokeDashoffset: end, opacity: 1, offset: k },
          { strokeDashoffset: end, opacity: 0, offset: Math.min(1, k + .001) },
          { strokeDashoffset: end, opacity: 0, offset: 1 }
        ], { duration: travel + gap, iterations: Infinity, delay: ran ? seed * 300 : 2800 + seed * 700, direction: inward ? 'reverse' : 'normal' });
        ran = true;
      }
    };
  }

  // the rest of the board, blurred: each piece is a simplified outline of its own page's part, and a link there
  function board(api, parent) {
    function box(p, x, y, w, h, cls) { return api.el('rect', { x: x, y: y, width: w, height: h, class: cls || 'ln' }, p); }
    function part(href, label, name, lx, ly, rot, draw, into) {
      var a = api.el('a', { href: href, class: 'brd', 'aria-label': label }, into || parent);
      draw(a);
      api.text(a, lx, ly, name, { size: 11, cls: 'lab', anchor: 'middle', rot: rot || null });
      return a;
    }
    return {
      // a CPU seen from its left edge: body, cavity, die with LEE; pins are added by the buses that reach it
      cpu: function (x, y, s, into) {
        return part('lee-cpu.html', 'About, drawn as the CPU', 'CPU · ABOUT', x + 18, y + s / 2, -90, function (a) {
          box(a, x, y, s, s, 'body'); box(a, x + 34, y + 34, s - 68, s - 68); box(a, x + 80, y + s * .23, s * .54, s * .54);
          api.text(a, x + 80 + s * .27, y + s / 2 + 24, 'LEE', { size: s * .17, cls: 'lt', anchor: 'middle' });
        }, into);
      },
      // a DIMM lying flat, gold contacts along its lower edge
      ram: function (x, y, w, into) {
        return part('lee-ram.html', 'Skills, drawn as RAM', 'RAM · SKILLS', x + w / 2, y + 55, 0, function (a) {
          box(a, x, y, w, 66, 'body');
          for (var i = 0; i < 3; i++) box(a, x + 26 + i * (w - 52) / 3, y + 8, (w - 52) / 3 - 18, 34);
          var t = ''; for (var cx = x + 6; cx < x + w - 4; cx += 8) t += 'M' + cx + ' ' + (y + 58) + 'v6 ';
          api.el('path', { d: t, class: 'thin' }, a);
        }, into);
      },
      // an M.2 stick, screw notch at its far end
      ssd: function (x, y, w, into) {
        return part('lee-ssd.html', 'Experience, drawn as an SSD', 'SSD · EXPERIENCE', x + w / 2, y + 54, 0, function (a) {
          box(a, x, y, w, 62, 'body');
          api.el('path', { d: 'M' + x + ' ' + (y + 22) + 'a9 9 0 0 1 0 18', class: 'thin' }, a);
          box(a, x + 50, y + 10, 64, 30); box(a, x + 130, y + 10, 64, 30); box(a, x + 210, y + 14, 34, 26);
        }, into);
      },
      // a graphics card's circuit side: the GPU with its memory around it
      gpu: function (x, y, w, h, into) {
        return part('lee-gpu.html', 'Projects, drawn as a GPU', 'GPU · PROJECTS', x + w / 2, y + h - 14, 0, function (a) {
          box(a, x, y, w, h, 'body'); box(a, x + w / 2 - 40, y + h / 2 - 50, 80, 80);
          [[22, 22], [w - 52, 22], [22, h - 70], [w - 52, h - 70]].forEach(function (p) { box(a, x + p[0], y + p[1], 30, 30); });
        }, into);
      },
      // a network card: controller and four jacks on the bracket
      nic: function (x, y, w, h, into) {
        return part('lee-nic.html', 'Contact, drawn as a network card', 'NIC · CONTACT', x + w / 2 - 20, y + h - 12, 0, function (a) {
          box(a, x, y, w, h, 'body'); box(a, x + 60, y + 22, 48, 48);
          for (var i = 0; i < 4; i++) box(a, x + w - 40, y + 8 + i * (h - 16) / 4, 32, (h - 16) / 4 - 6);
        }, into);
      }
    };
  }

  // the visible edges of a drawing, in its own units: left = the drawing's left edge, right/top/bottom = the stage's
  function edge(svg) {
    var m = svg.getScreenCTM(), stage = svg.closest('.stage');
    if (!m || !stage) return null;
    var r = svg.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { left: (r.left - m.e) / m.a, right: (s.right - m.e) / m.a, top: (s.top - m.f) / m.d, bottom: (s.bottom - m.f) / m.d };
  }

  function watch(canvas, fit) { new ResizeObserver(function () { requestAnimationFrame(fit); }).observe(canvas); }

  // an edge connector, the way a card's edge really looks: the board steps in at the shoulders and a tab stands out,
  // its gold fingers side by side down to the tip, keyed by a notch
  //   |                      |
  //   |__                  __|
  //      |_|_|_|_|_|_|_|_|
  // o: { x, y: where the tab starts on the board's edge, len: its length along the edge, d: how far it stands out,
  //      side: 'b' | 't' | 'r' | 'l' (which way it stands out), key: the notch's offset along the tab, pitch: finger spacing,
  //      snug: a narrower key gap, fewer fingers left out }
  function fingers(api, g, o) {
    var P = function (u, v) {
      return o.side === 'b' ? [o.x + u, o.y + v] : o.side === 't' ? [o.x + u, o.y - v] : o.side === 'r' ? [o.x + v, o.y + u] : [o.x - v, o.y + u];
    };
    var box = function (u0, v0, u1, v1, cls) {
      var a = P(u0, v0), b = P(u1, v1);
      return api.el('rect', { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(b[0] - a[0]), height: Math.abs(b[1] - a[1]), class: cls }, g);
    };
    var L = o.len, D = o.d, k = o.key, pitch = o.pitch || 5, pw = pitch * 0.66, kw = pitch * 0.8, r = Math.min(4, D * 0.3);
    // points around an arc: centre (cu, cv), radius rr, from angle a0 to a1 (degrees)
    var arc = function (cu, cv, rr, a0, a1) {
      var pts = [];
      for (var i = 0; i <= 8; i++) { var a = (a0 + (a1 - a0) * i / 8) * Math.PI / 180; pts.push([cu + rr * Math.cos(a), cv + rr * Math.sin(a)]); }
      return pts;
    };
    // the fingers, on their pitch; those that would run into the key leave a gap in the row
    // snug leaves out just the two fingers nearest the key; otherwise every finger within reach of it
    var all = [], fingersAt = [], gapL = -Infinity, gapR = Infinity, skip = [];
    for (var u = 3; u + pw <= L - 3; u += pitch) all.push(u);
    if (k != null) {
      skip = o.snug
        ? all.slice().sort(function (a, b) { return Math.abs(a + pw / 2 - k) - Math.abs(b + pw / 2 - k); }).slice(0, 2)
        : all.filter(function (u) { return u + pw > k - kw - 2 && u < k + kw + 2; });
    }
    all.forEach(function (u) {
      if (skip.indexOf(u) >= 0) return;
      fingersAt.push(u);
      if (k != null && u + pw <= k) gapL = Math.max(gapL, u + pw);
      if (k != null && u >= k) gapR = Math.min(gapR, u);
    });
    // the key sits centred in the gap the skipped fingers leave
    if (o.snug && isFinite(gapL) && isFinite(gapR)) k = (gapL + gapR) / 2;
    // the board's edge curves down into the tab at both shoulders; the tip runs straight across
    var out = arc(-r, r, r, -90, 0);
    out.push([0, D], [L, D]);
    out = out.concat(arc(L + r, r, r, 180, 270));
    // the tab, open where it joins the board, which hides the board's own edge across its root
    box(-r + .5, -1.5, L + r - .5, 1.5, 'tabfill');
    api.el('path', { d: api.d(out.map(function (q) { return P(q[0], q[1]); })), class: 'tab pcb' }, g);
    fingersAt.forEach(function (u) { box(u, 3, u + pw, D, 'finger'); });
    // the key: a straight-sided slot with a half-round end, cut up from the tip. It spans the whole gap, its sides meeting
    // the fingers either side, and keeps the slot's proportions, so it rises as far as its width asks, on into the board
    if (k != null && isFinite(gapL) && isFinite(gapR)) {
      var hw = (gapR - gapL) / 2, mid = (gapL + gapR) / 2, tall = (D - 2) / (2 * kw) * (gapR - gapL);
      var crown = D - tall + hw, slot = [[gapL, D + 1]].concat(arc(mid, crown, hw, 180, 360), [[gapR, D + 1]]);
      api.el('path', { d: api.d(slot.map(function (q) { return P(q[0], q[1]); })), class: 'keyslot' }, g);
    }
  }

  // keys(): the parts to visit, in order. Hovering, focusing or tapping the figure hands control to the reader
  function tour(fig, figEl, keys) {
    var at = -1, held = false, resume = null;
    function next() {
      if (held) return;
      var k = keys();
      if (!k.length) return;
      at = (at + 1) % k.length;
      touring = true; fig.show(k[at]); touring = false;
    }
    function hold() { held = true; clearTimeout(resume); }
    function release() { clearTimeout(resume); resume = setTimeout(function () { held = false; }, 6000); }
    figEl.addEventListener('pointerenter', hold); figEl.addEventListener('pointerleave', release);
    figEl.addEventListener('focusin', hold); figEl.addEventListener('focusout', release);
    setTimeout(function () { next(); setInterval(next, 3600); }, 2600);
  }

  window.LIVE = { still: still, wrap: wrap, card: card, trace: trace, board: board, edge: edge, watch: watch, tour: tour, fingers: fingers };
})();
