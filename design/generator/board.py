"""Bird's-eye board (landing) plus a scroll-camera preview of the whole site.

The five approved component drawings are lifted out of the generated pages and placed on one board, each with its
connector facing the CPU, so every bus is a straight run with 45° bends (star topology). Every page's 1600×1000
frame maps to a camera frame on this board through its part's transform, so a page's composition is reproduced
exactly when the camera arrives. Run after the other generators: `python board.py`.
"""
import math
import random
import re

from kit import CSS

# part transforms: world = page * s + (dx, dy). The CPU's centre is the world origin.
PARTS = {
    'cpu': dict(s=1.0, dx=-800, dy=-500),
    'ram': dict(s=0.85, dx=126.4, dy=-430.95),
    'ssd': dict(s=0.65, dx=-1266, dy=-325),
    'gpu': dict(s=0.9, dx=-755, dy=-1039),
    'nic': dict(s=0.7, dx=357.8, dy=-848),
}
BOARD = (-1200, -900, 2500, 1240)          # x, y, w, h
OVERVIEW = (-1260, -960, 2620, 1360)
RUN = 22


def comp(name):
    html = open(f'../lee-{name}.html', encoding='utf-8').read()
    inner = re.search(r'<g id="comp">(.*)</g>\s*</svg>', html, re.S).group(1)
    return re.sub(r'\sid="[^"]*"', '', inner)


def cpu_chip():
    pins = ''
    for i in range(16):
        t = -150 + 18 + i * (264 / 15)
        pins += f'M{800 + t:.1f} 350 V336 M{800 + t:.1f} 650 V664 M650 {500 + t:.1f} H636 M950 {500 + t:.1f} H964 '
    return f'''<path class="pin" d="{pins}"></path>
<rect class="pkg" x="650" y="350" width="300" height="300" rx="3"></rect>
<rect class="lid" x="690" y="390" width="220" height="220" rx="2"></rect>
<path d="M702 598 L702 580 L720 598 Z" fill="none" stroke="#c3ccd5" stroke-width="1.2"></path>
<text class="etch" x="800" y="486" text-anchor="middle" style="font-size: 64px; font-weight: 800; letter-spacing: .04em">LEE</text>
<text class="etch" x="800" y="514" text-anchor="middle" style="font-size: 11px; font-weight: 600; letter-spacing: .2em">SENIOR BACKEND ENGINEER</text>
<line x1="730" y1="530" x2="870" y2="530" stroke="#4a535d" stroke-width="1"></line>
<text class="etch dim" x="800" y="550" text-anchor="middle" style="font-size: 9px; letter-spacing: .16em">PYTHON · DJANGO · POSTGRESQL</text>
<text class="etch dim" x="800" y="590" text-anchor="middle" style="font-size: 8px; letter-spacing: .16em">LEE-5Y · BENGALURU · e3</text>'''


def W(name, x, y):
    p = PARTS[name]
    return (x * p['s'] + p['dx'], y * p['s'] + p['dy'])


def t_at(i):
    return -150 + 18 + i * (264 / 15)


# ---------------- buses: CPU pin → contact, straight runs and 45° bends only ----------------
buses = {k: [] for k in ('ram', 'ssd', 'gpu', 'nic')}

# RAM (right side): CPU fan exactly as the CPU page (lane = 1.9t), RAM side like kit.route (out, 45° onto the lane)
s = PARTS['ram']['s']
ram_contacts = []
for k, py in enumerate([312, 442, 572, 702]):
    for c in (-15, -5, 5, 15):
        ram_contacts.append(W('ram', 416, py + c))
for i in range(16):
    t = t_at(i); lane = 1.9 * t
    xc, yc = ram_contacts[i]
    xr = xc - RUN * s
    buses['ram'].append([(178, t), (200, t), (200 + 0.9 * abs(t), lane), (xr - abs(lane - yc), lane), (xr, yc), (xc, yc)])

# SSD (left side): narrower CPU fan (lane = 1.3t) so the funnel into the M.2 edge stays short
s = PARTS['ssd']['s']
for i in range(16):
    t = t_at(i); lane = 1.3 * t
    xc, yc = W('ssd', 1240, 500 + (i + 2 - 9.5) * 10)
    xr = xc + RUN * s
    buses['ssd'].append([(-178, t), (-200, t), (-200 - 0.3 * abs(t), lane), (xr + abs(lane - yc), lane), (xr, yc), (xc, yc)])

# GPU (top, pins 0-11): almost straight up into the PCIe x16 slot
SLOT_Y = -386
gx = W('gpu', 800, 0)[0]
for i in range(12):
    t = t_at(i); xc = gx + (i - 5.5) * 17 * PARTS['gpu']['s']
    buses['gpu'].append([(t, -178), (t, -200), (xc, -200 - abs(xc - t)), (xc, SLOT_Y)])

# NIC (top, pins 12-15 = x4): up, turn right as a stacked bundle, run right, turn up into the slot
nx = W('nic', 930, 0)[0]
C45 = 30
for j, i in enumerate(range(12, 16)):
    t = t_at(i); yh = -275 - (15 - i) * 17.6; xc = nx + (j - 1.5) * 18 * PARTS['nic']['s']
    buses['nic'].append([(t, -178), (t, yh + C45), (t + C45, yh), (xc - C45, yh), (xc, yh - C45), (xc, SLOT_Y)])

# stubs: unused contacts and the CPU's bottom pins end at vias
rng = random.Random(7)
stubs = []
for k, py in enumerate([312, 442, 572, 702]):
    for c in (-45, -35, -25, 25, 35, 45):
        x, y = W('ram', 416, py + c); L = 12 + rng.random() * 22
        stubs.append(((x, y), (x - L, y)))
for i in (0, 1, 18, 19):
    x, y = W('ssd', 1240, 500 + (i - 9.5) * 10); L = 10 + rng.random() * 16
    stubs.append(((x, y), (x + L, y)))
for i in range(16):
    t = t_at(i); L = 14 + rng.random() * 18
    stubs.append(((t, 178), (t, 178 + L)))


def seg_cross(a, b, c, d):
    def o(p, q, r): return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    if max(a[0], b[0]) < min(c[0], d[0]) or max(c[0], d[0]) < min(a[0], b[0]): return False
    if max(a[1], b[1]) < min(c[1], d[1]) or max(c[1], d[1]) < min(a[1], b[1]): return False
    return o(a, b, c) * o(a, b, d) < -1e-6 and o(c, d, a) * o(c, d, b) < -1e-6


all_tr = [(k, n, p) for k, v in buses.items() for n, p in enumerate(v)]
crossings = 0
for x in range(len(all_tr)):
    for y in range(x + 1, len(all_tr)):
        A, B = all_tr[x][2], all_tr[y][2]
        for u in range(len(A) - 1):
            for v in range(len(B) - 1):
                if seg_cross(A[u], A[u + 1], B[v], B[v + 1]): crossings += 1


def d(pts):
    return ' '.join(('M' if k == 0 else 'L') + f'{p[0]:.1f} {p[1]:.1f}' for k, p in enumerate(pts))


bus_svg = []
for k, v in buses.items():
    g = [f'<g class="bus" data-part="{k}">']
    for n, p in enumerate(v):
        g.append(f'<path class="tr-glow" d="{d(p)}"></path><path class="tr" d="{d(p)}"></path>')
    for n, p in enumerate(v):
        if rng.random() < 0.4:
            g.append(f'<path class="pulse" d="{d(p)}" style="animation-duration: {3.5 + rng.random() * 4:.2f}s; animation-delay: -{rng.random() * 6:.2f}s"></path>')
    mid = v[len(v) // 2]
    g.append(f'<path class="carrier" d="{d(mid)}"></path>')
    g.append('</g>')
    bus_svg.append(''.join(g))
stub_svg = ''.join(f'<path class="tr" d="{d(st)}"></path><circle class="via" cx="{st[1][0]:.1f}" cy="{st[1][1]:.1f}" r="3.4"></circle>' for st in stubs)

# slots on the board: PCIe x16 for the GPU, PCIe x4 for the NIC (the DIMM slots are part of the RAM drawing)
gl, gr = W('gpu', 500, 0)[0] - 10, W('gpu', 1100, 0)[0] + 10
nl, nr = W('nic', 660, 0)[0] - 10, W('nic', 1200, 0)[0] + 10
slots = (f'<rect class="slot" x="{gl:.1f}" y="-400" width="{gr - gl:.1f}" height="14"></rect>'
         f'<rect class="slot" x="{nl:.1f}" y="-400" width="{nr - nl:.1f}" height="14"></rect>')


def part(name, inner):
    p = PARTS[name]
    return (f'<g class="partw" data-part="{name}" tabindex="0" role="button" aria-label="{LABELS[name][0]}">'
            f'<g transform="translate({p["dx"]} {p["dy"]}) scale({p["s"]})">{inner}</g></g>')


LABELS = {  # plain-English name, designator line, anchor, alignment
    'cpu': ('About me', 'U1 · CPU · THE HUB', (0, 268), 'middle'),
    'ram': ('Skills', 'U2 · RAM · 4× DDR5', (480, 290), 'start'),
    'ssd': ('Experience', 'U3 · SSD · M.2 NVMe', (-1080, 150), 'start'),
    'gpu': ('Projects', 'U4 · GPU · PCIe x16', (-430, -470), 'end'),
    'nic': ('Contact', 'U5 · NIC · PCIe x4', (580, -722), 'start'),
}
labels = ''.join(
    f'<g class="lbl" data-part="{k}"><text class="n" x="{x}" y="{y}" text-anchor="{a}">{n}</text>'
    f'<text class="s" x="{x}" y="{y + 24}" text-anchor="{a}">{sub}</text></g>'
    for k, (n, sub, (x, y), a) in LABELS.items())

bx, by, bw, bh = BOARD
holes = ''.join(f'<circle class="hole" cx="{x}" cy="{y}" r="10"></circle><circle class="ring" cx="{x}" cy="{y}" r="17"></circle>'
                for x, y in [(bx + 40, by + 40), (bx + bw - 40, by + 40), (bx + 40, by + bh - 40), (bx + bw - 40, by + bh - 40)])

title = f'''<g class="title">
  <text class="silk" x="-1130" y="-800">LEE.SH · BACKEND MAINBOARD · REV 2.0</text>
  <text class="name" x="-1134" y="-712">Lee</text>
  <text class="role" x="-1130" y="-664">Senior Backend Engineer</text>
  <text class="silk" x="-1130" y="-624">PYTHON · DJANGO · POSTGRESQL · BENGALURU</text>
  <rect class="pwr" x="-1130" y="-596" width="16" height="8"></rect>
  <text class="silk on" x="-1104" y="-588">PWR · OPEN TO SENIOR BACKEND ROLES</text>
</g>'''

world = f'''
<rect class="pcb" x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="3"></rect>
{holes}
<text class="silk" x="{bx + bw - 70}" y="{by + bh - 34}" text-anchor="end">BENGALURU · IN · MADE BY LEE</text>
{title}
<g class="stubs">{stub_svg}</g>
{''.join(bus_svg)}
{slots}
{part('ssd', comp('ssd'))}
{part('gpu', comp('gpu'))}
{part('nic', comp('nic'))}
{part('ram', comp('ram'))}
{part('cpu', cpu_chip())}
{labels}
<g id="bits"></g>'''


def frame(name):
    p = PARTS[name]
    return [p['dx'], p['dy'], 1600 * p['s'], 1000 * p['s']]


FRAMES = {k: frame(k) for k in PARTS}
FRAMES['board'] = list(OVERVIEW)
FRAMES['all'] = [OVERVIEW[0], OVERVIEW[1], OVERVIEW[2], OVERVIEW[3] + 200]

EXTRA = r'''
html { scroll-snap-type: y proximity; }
body { overflow: visible; }
.track section { height: 100vh; height: 100svh; scroll-snap-align: start; }
#world { position: fixed; inset: 0; width: 100%; height: 100%; display: block; background: radial-gradient(ellipse 70% 60% at 50% 45%, var(--bg-lift), var(--bg) 75%); }
.pcb { fill: #0e1115; stroke: #262c33; stroke-width: 2; }
.hole { fill: var(--bg); stroke: #3a424b; stroke-width: 1.5; }
.ring { fill: none; stroke: #262c33; stroke-width: 1.5; }
.slot { fill: #0f1317; stroke: var(--ink-dim); stroke-width: 1.4; }
.silk { font: 500 13px var(--mono); letter-spacing: .26em; fill: var(--muted); }
.silk.on { fill: #a9e9c2; }
.title .name { font: 600 92px var(--sans); fill: var(--text); letter-spacing: -.01em; }
.title .role { font: 400 34px var(--sans); fill: var(--text); }
.pwr { fill: var(--green); filter: drop-shadow(0 0 6px var(--green)); }
.carrier { fill: none; stroke: none; }
.pin { stroke: var(--ink); stroke-width: 1.6; }
.pkg { fill: var(--chip); stroke: var(--ink); stroke-width: 1.8; }
.partw[data-part="cpu"] > g { filter: drop-shadow(0 0 22px rgba(255, 181, 71, .16)); }
.bit { font: 700 13px var(--mono); fill: var(--hot); pointer-events: none; }
.led { fill: none; stroke: #5f6a76; stroke-width: 1; }
.led.on { fill: var(--glow); stroke: var(--glow); }
.etch.now { fill: var(--green); }
.rt { fill: none; stroke: var(--glow); stroke-width: 1.5; opacity: .35; stroke-linejoin: round; }
.lanes { fill: none; stroke: var(--glow); stroke-width: 1.3; opacity: .45; stroke-linejoin: round; }
.hole-j, .body.hole { fill: #07090b; }
.halo { fill: rgba(255,181,71,.07); stroke: var(--glow); stroke-width: 1.5; opacity: .55; }
.asic .core { stroke: var(--glow); }
.led-link { fill: var(--green); }
.led-act { fill: var(--glow); animation: act 1.9s steps(1) infinite; }
@keyframes act { 0%,100%{opacity:1} 9%{opacity:.15} 13%{opacity:1} 31%{opacity:.2} 34%{opacity:1} 37%{opacity:.2} 41%{opacity:1} 66%{opacity:.15} 72%{opacity:1} }

/* depth of field: whatever the camera is not looking at drops back, like each page's blurred board */
.partw, .bus, .stubs, .title, .slot { transition: filter .35s cubic-bezier(.23,1,.32,1), opacity .35s cubic-bezier(.23,1,.32,1); }
.far { filter: blur(6px); opacity: .45; }
.partw { cursor: pointer; outline: none; }
.partw.lit .body, .partw.lit .lid, .partw.lit .pkg { stroke: var(--glow); }
.partw:focus-visible .body, .partw:focus-visible .pkg { stroke: var(--hot); }
.bus .tr { transition: opacity .3s, stroke .3s; }
.bus.lit .tr { opacity: 1; stroke: var(--hot); }
.lbl { cursor: pointer; transition: opacity .3s; }
.lbl .n { font: 600 34px var(--sans); fill: var(--text); transition: fill .25s; }
.lbl .s { font: 600 12.5px var(--mono); letter-spacing: .2em; fill: var(--muted); }
.lbl.lit .n { fill: var(--glow); }
html.zoomed .lbl, html.zoomed .title { opacity: 0; pointer-events: none; }

/* chrome */
.top { position: fixed; z-index: 3; top: calc(20px + env(safe-area-inset-top, 0px)); left: 24px; right: 24px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; }
.top .brand { position: static; }
.top .btn { pointer-events: auto; min-height: 40px; padding: 9px 14px; }
/* section index lives in the top bar: the band above y=56 is the only place no page puts a note */
.index { position: fixed; z-index: 3; left: 50%; top: calc(20px + env(safe-area-inset-top, 0px)); transform: translateX(-50%); margin: 0; padding: 0; list-style: none; display: flex; gap: 26px; }
.index a { display: flex; align-items: center; gap: 9px; font: 600 10.5px var(--mono); letter-spacing: .18em; text-transform: uppercase; color: var(--muted); text-decoration: none; min-height: 40px; transition: color .2s ease; }
.index a::before { content: ""; width: 7px; height: 7px; border: 1px solid #4a535d; transition: background .2s ease, border-color .2s ease; }
.index a b { color: var(--ink-dim); font-weight: 600; }
@media (hover: hover) and (pointer: fine) { .index a:hover { color: var(--text); } }
.index a[aria-current="true"] { color: var(--glow); }
.index a[aria-current="true"]::before { background: var(--glow); border-color: var(--glow); box-shadow: 0 0 8px rgba(255,181,71,.7); }
.index a:focus-visible { outline: 2px solid var(--glow); outline-offset: 3px; }
.hint { display: flex; flex-direction: column; align-items: center; gap: 8px; transition: opacity .3s; }
.hint i { width: 1px; height: 28px; background: linear-gradient(var(--glow), transparent); animation: drip 2.4s ease-in-out infinite; }
@keyframes drip { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 51% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }
html:not([data-step="board"]) .hint { opacity: 0; }
.cap { position: fixed; z-index: 3; left: 24px; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); font: 500 11px var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); max-width: 46ch; }
.cap b { color: var(--glow); font-weight: 600; }
.closing { position: fixed; z-index: 3; left: 50%; bottom: calc(56px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; gap: 18px; align-items: center; flex-wrap: wrap; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .3s cubic-bezier(.23,1,.32,1); }
html[data-step="all"] .closing { opacity: 1; pointer-events: auto; }
.closing h2 { margin: 0; font: 600 clamp(20px, 2.2vw, 28px)/1.2 var(--sans); }
.closing h2 span { color: var(--glow); }
.btn:active { transform: scale(.97); }
.btn { transition: transform .16s cubic-bezier(.23,1,.32,1), background .2s; }

@media not all and (min-width: 1100px) and (min-aspect-ratio: 5/4) {
  .index, .cap, .track { display: none; }
  html { scroll-snap-type: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pulse, .led-act, .hint i { animation: none; }
  .bit { display: none; }
}
'''

JS = r'''
(function () {
  var FRAMES = %FRAMES%;
  var STEPS = [['board', 'Board', 'The whole board. Hover a part, or scroll to power on.'],
               ['cpu', 'About', 'CPU · the notes from lee-cpu.html float here'],
               ['ram', 'Skills', 'RAM · the notes from lee-ram.html float here'],
               ['ssd', 'Experience', 'SSD · the notes from lee-ssd.html float here'],
               ['gpu', 'Projects', 'GPU · the notes from lee-gpu.html float here'],
               ['nic', 'Contact', 'NIC · the notes from lee-nic.html float here'],
               ['all', 'Online', 'Closing shot · every part lit']];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = matchMedia('(min-width: 1100px) and (min-aspect-ratio: 5/4)');
  var svg = document.getElementById('world'), root = document.documentElement, NS = 'http://www.w3.org/2000/svg';
  var parts = [].slice.call(svg.querySelectorAll('.partw')), others = [].slice.call(svg.querySelectorAll('.stubs, .title, .slot'));
  function q(sel) { return [].slice.call(document.querySelectorAll(sel)); }

  // camera: frames are each page's 1600x1000 box in board units; fit them to the viewport like "slice"
  function fit(f, slice) {
    var A = innerWidth / innerHeight, w = f[2], h = f[3], cx = f[0] + w / 2, cy = f[1] + h / 2;
    if ((w / h > A) === !slice) h = w / A; else w = h * A;
    return [cx, cy, w];
  }
  function frameFor(id) { return fit(FRAMES[id], id !== 'board' && id !== 'all'); }
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  // flyTo: centre moves, width interpolates in log space with a zoom-out bump on long hops
  function between(a, b, t) {
    var e = ease(t), dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    var bump = Math.min(.9, dist / (a[2] + b[2]) * 1.1) * Math.sin(Math.PI * e);
    var w = Math.exp(Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * e) * (1 + bump);
    return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, w];
  }
  var HOLD = .22;   // each stop holds still for the middle 44% of its screen of scroll
  function cameraAt(pos) {
    var i = Math.max(0, Math.min(STEPS.length - 1, Math.floor(pos))), f = pos - i;
    if (i >= STEPS.length - 1) return frameFor(STEPS[STEPS.length - 1][0]);
    var a = frameFor(STEPS[i][0]), b = frameFor(STEPS[i + 1][0]);
    if (f <= HOLD) return a;
    if (f >= 1 - HOLD) return b;
    return between(a, b, (f - HOLD) / (1 - 2 * HOLD));
  }
  function setCam(c) {
    var h = c[2] * innerHeight / innerWidth;
    svg.setAttribute('viewBox', (c[0] - c[2] / 2).toFixed(1) + ' ' + (c[1] - h / 2).toFixed(1) + ' ' + c[2].toFixed(1) + ' ' + h.toFixed(1));
  }

  // steps, focus and lit state
  var index = document.getElementById('index');
  STEPS.slice(1, 6).forEach(function (s, k) {
    var li = document.createElement('li'), a = document.createElement('a');
    a.href = '#' + s[0]; a.dataset.go = k + 1; a.innerHTML = '<b>U' + (k + 1) + '</b>' + s[1];
    li.appendChild(a); index.appendChild(li);
  });
  var step = -1, hover = null;
  function refresh() {
    var id = STEPS[Math.max(0, step)][0], focus = ['cpu', 'ram', 'ssd', 'gpu', 'nic'].indexOf(id) >= 0 ? id : null;
    root.classList.toggle('zoomed', !!focus);
    parts.forEach(function (p) {
      var k = p.dataset.part;
      p.classList.toggle('far', !!focus && k !== focus);
      p.classList.toggle('lit', id === 'all' || (!focus && hover === k));
    });
    q('.bus').forEach(function (b) {
      var k = b.dataset.part;
      b.classList.toggle('far', !!focus && focus !== 'cpu' && k !== focus);
      b.classList.toggle('lit', id === 'all' || (!focus && hover === k) || focus === k);
    });
    others.forEach(function (o) { o.classList.toggle('far', !!focus); });
    q('.lbl').forEach(function (l) { l.classList.toggle('lit', hover === l.dataset.part); });
  }
  function setStep(i) {
    if (i === step) return;
    step = i; root.dataset.step = STEPS[i][0];
    index.querySelectorAll('a').forEach(function (a, j) { a.setAttribute('aria-current', j + 1 === i ? 'true' : 'false'); });
    document.getElementById('cap').innerHTML = '<b>' + String(i).padStart(2, '0') + ' · ' + STEPS[i][1] + '</b> · ' + STEPS[i][2];
    refresh();
  }
  function goStep(i) { scrollTo({ top: i * innerHeight, behavior: reduce ? 'auto' : 'smooth' }); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); goStep(+a.dataset.go); return; }
    var p = e.target.closest('[data-part]');
    if (p && wide.matches && step === 0) goStep(STEPS.findIndex(function (s) { return s[0] === p.dataset.part; }));
  });
  q('[data-part]').forEach(function (el) {
    var k = el.dataset.part;
    el.addEventListener('pointerenter', function () { hover = k; refresh(); });
    el.addEventListener('pointerleave', function () { if (hover === k) { hover = null; refresh(); } });
  });
  parts.forEach(function (p) {
    p.addEventListener('focus', function () { hover = p.dataset.part; refresh(); });
    p.addEventListener('blur', function () { hover = null; refresh(); });
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goStep(STEPS.findIndex(function (s) { return s[0] === p.dataset.part; })); } });
  });

  // bits riding each bus: together they spell LEE in ASCII
  var BITS = '010011000100010101000101', runners = [];
  q('.bus').forEach(function (bus, bi) {
    var path = bus.querySelector('.carrier'), len = path.getTotalLength();
    for (var k = 0; k < 4; k++) {
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'bit'); t.setAttribute('text-anchor', 'middle'); t.textContent = BITS[(bi * 6 + k) % BITS.length];
      document.getElementById('bits').appendChild(t);
      runners.push({ el: t, path: path, len: len, s: (k / 4) * len, dir: k % 2 ? -1 : 1, bus: bus });
    }
  });

  var pos = null, last = performance.now(), forced = new URLSearchParams(location.search).get('pos');   // ?pos=2.5 pins the camera, for review screenshots
  function frame(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now;
    if (wide.matches) {
      var target = forced !== null ? +forced : Math.max(0, Math.min(STEPS.length - 1, scrollY / innerHeight));
      if (forced !== null) pos = target;
      if (pos === null || reduce) pos = reduce ? Math.round(target) : target; else pos += (target - pos) * (1 - Math.exp(-dt * 8));
      setCam(cameraAt(pos));
      setStep(Math.max(0, Math.min(STEPS.length - 1, Math.round(target))));
    } else { setCam(frameFor('board')); if (step !== 0) setStep(0); }
    runners.forEach(function (r) {
      var lit = r.bus.classList.contains('lit');
      if (!reduce) r.s = (((r.s + dt * (lit ? 90 : 30) * r.dir) % r.len) + r.len) % r.len;
      var p = r.path.getPointAtLength(r.s);
      r.el.setAttribute('x', p.x.toFixed(1)); r.el.setAttribute('y', (p.y - 7).toFixed(1));
      var edge = Math.min(1, Math.min(r.s, r.len - r.s) / 30);
      r.el.style.opacity = ((r.bus.classList.contains('far') ? 0 : lit ? 1 : .35) * edge).toFixed(3);
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
'''.replace('%FRAMES%', repr(FRAMES).replace("'", '"'))

html = f'''<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>lee.sh Board</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
/* Layout: the bird's-eye board (landing) and a preview of the scroll camera. The five approved drawings sit on one
   board, every connector facing the CPU. Scrolling flies the camera to each page's exact framing; what it is not
   looking at drops back out of focus. Notes are left to the component pages; this file shows the board and the moves. */
{CSS}
{EXTRA}
</style>

<svg id="world" viewBox="{' '.join(map(str, OVERVIEW))}" role="img" aria-label="Lee's motherboard from above. The CPU in the centre is About me. Wired to it: the RAM on the right is Skills, the SSD on the left is Experience, the graphics card at the top is Projects and the network card at the top right is Contact.">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1d232a"></stop><stop offset=".45" stop-color="#151a20"></stop>
      <stop offset=".55" stop-color="#1b2128"></stop><stop offset="1" stop-color="#12161b"></stop>
    </linearGradient>
  </defs>
  {world}
</svg>

<header class="top"><a class="brand" href="#board" data-go="0" style="text-decoration: none; pointer-events: auto">lee.sh</a><a class="btn" href="#" target="_blank" rel="noopener">Résumé ↗</a></header>
<nav aria-label="Sections"><ol class="index" id="index"></ol></nav>
<div class="hint">Scroll<i></i></div>
<div class="cap" id="cap"></div>
<div class="closing"><h2>All systems online. <span>Let's talk.</span></h2><a class="btn primary" href="#nic" data-go="5">Email me</a><a class="btn" href="#" target="_blank" rel="noopener">Résumé ↗</a></div>
<div class="track" aria-hidden="true"><section></section><section></section><section></section><section></section><section></section><section></section><section></section></div>

<script>{JS}</script>
'''

open('../lee-board.html', 'w', encoding='utf-8').write(html)
print(f'ok · bus crossings: {crossings}')
