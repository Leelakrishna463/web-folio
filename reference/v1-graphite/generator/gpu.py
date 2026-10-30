from kit import page, callout

# The graphics card, flipped to its circuit side. The GPU die "renders" each project into one of the memory chips;
# hovering a project lights its render path from the die.
PROJECTS = [
    ('p1', '[project-one]', 'Django · Celery · Redis', '[Slow checkout API]', '[moved fan-out to Celery + Redis]', '[impact metric]'),
    ('p2', '[project-two]', 'PostgreSQL · DRF', '[What was broken]', '[what you changed]', '[impact metric]'),
    ('p3', '[project-three]', 'AWS · Docker', '[What was broken]', '[what you changed]', '[impact metric]'),
]
CX0, CX1, CY0, CY1 = 420, 1180, 270, 710          # card
DX0, DX1, DY0, DY1 = 470, 730, 360, 620           # die package
CHX0, CHX1, CHH = 820, 1120, 110
CHY = [300, 440, 580]

def chip(k, key, name, stack, *_):
    y = CHY[k]; cx = (CHX0 + CHX1) / 2
    return f'''<g class="part" data-key="{key}" tabindex="0" aria-label="Project {k + 1}: {name}">
  <rect class="body" x="{CHX0}" y="{y}" width="{CHX1 - CHX0}" height="{CHH}" rx="1"></rect>
  <rect class="lid" x="{CHX0 + 8}" y="{y + 8}" width="{CHX1 - CHX0 - 16}" height="{CHH - 16}" rx="1"></rect>
  <path class="ln" d="M{CHX0 + 15} {y + CHH - 15} v-9 l9 9 z"></path>
  <text class="etch dim" x="{CHX0 + 24}" y="{y + 30}" style="font-size: 9px; letter-spacing: .2em">VRAM_0{k + 1}</text>
  <text class="etch" x="{cx}" y="{y + 60}" text-anchor="middle" style="font-size: 18px; font-weight: 800">{name}</text>
  <text class="etch dim" x="{cx}" y="{y + 82}" text-anchor="middle" style="font-size: 9.5px; letter-spacing: .12em">{stack.upper()}</text>
</g>'''

def render_path(k, key):
    # three-line bundle from the die's right edge to the chip, one 45° bend
    starts = [[390, 400, 410], [485, 495, 505], [580, 590, 600]][k]
    ends = [[CHY[k] + 45, CHY[k] + 55, CHY[k] + 65]][0]
    out = []
    for s, e in zip(starts, ends):
        x1 = 752
        dx = abs(e - s)
        out.append(f'<path class="rt" data-key="{key}" d="M{DX1} {s} H{x1} L{x1 + dx} {e} H{CHX0}"></path>')
    return ''.join(out)

pads = ''
for i in range(12):
    t = DX0 + 26 + i * 19
    u = DY0 + 26 + i * 19
    pads += f'M{t} {DY0 - 10} v10 M{t} {DY1} v10 M{DX0 - 10} {u} h10 '
fingers = ''.join(f'M{x} {CY1 - 16} V{CY1 - 2} ' for x in range(500, 1100, 6) if not (636 <= x <= 650))
slots = ''.join(f'<rect class="ln" x="{CX0 - 16}" y="{y}" width="8" height="54"></rect>' for y in (300, 380, 460, 540))
pwr = ''.join(f'<rect class="ln" x="{1046 + c * 12}" y="{CY0 - 12}" width="7" height="7"></rect>' for c in range(6))

comp = f'''
<rect class="body" x="{CX0}" y="{CY0}" width="{CX1 - CX0}" height="{CY1 - CY0}" rx="3"></rect>
<rect class="body" x="{CX0 - 20}" y="{CY0 - 10}" width="20" height="{CY1 - CY0 + 20}"></rect>{slots}
<rect class="body" x="1040" y="{CY0 - 16}" width="80" height="16"></rect>{pwr}
<path class="gold" d="{fingers}"></path>
<text class="etch dim" x="{CX0 + 24}" y="{CY0 + 26}" style="font-size: 9px; letter-spacing: .2em">PCIEX16 · BACKSIDE · PROJECTS</text>
{''.join(render_path(k, p[0]) for k, p in enumerate(PROJECTS))}
<path class="ln" d="{pads}"></path>
<rect class="body" x="{DX0}" y="{DY0}" width="{DX1 - DX0}" height="{DY1 - DY0}" rx="2"></rect>
<rect class="lid" x="{DX0 + 50}" y="{DY0 + 50}" width="{DX1 - DX0 - 100}" height="{DY1 - DY0 - 100}" rx="1"></rect>
<path class="ln" d="M{DX0 + 12} {DY1 - 12} v-12 l12 12 z"></path>
<text class="etch" x="{(DX0 + DX1) / 2}" y="{(DY0 + DY1) / 2 - 2}" text-anchor="middle" style="font-size: 34px; font-weight: 800; letter-spacing: .06em">GPU</text>
<text class="etch" x="{(DX0 + DX1) / 2}" y="{(DY0 + DY1) / 2 + 22}" text-anchor="middle" style="font-size: 10px; font-weight: 600; letter-spacing: .2em">LEE-RENDER</text>
<text class="etch dim" x="{(DX0 + DX1) / 2}" y="{(DY0 + DY1) / 2 + 40}" text-anchor="middle" style="font-size: 8.5px; letter-spacing: .18em">3 PROJECTS SHIPPED</text>
{''.join(chip(k, *p) for k, p in enumerate(PROJECTS))}
'''
ports = [{'x': 800, 'y': CY1, 'dir': 'd', 'n': 34, 'sp': 17, 'fan': 0.5}]

def body(k, key, name, stack, problem, did, result):
    return (f'<span class="k"><b>0{k + 1}</b>{name}</span>'
            f'<span class="v">{problem} → {did}</span>'
            f'<span class="v res"><small>Result</small>{result}</span>')

lanes = [330, 495, 660]
callouts = '\n'.join(
    [callout('intro', (520, DY0 - 10), 'u', 480, 190, 'above',
             '<div class="ref">U4 · Projects</div><p class="intro">Things I\'ve built. The GPU renders each project into its own memory chip. Hover one to light its path.</p>', align='end', w=340)]
    + [callout(p[0], (CHX1, CHY[k] + CHH / 2), 'r', lanes[k], 1230, 'right', body(k, *p), w=300) for k, p in enumerate(PROJECTS)])

far = '''
<rect class="f" x="-120" y="380" width="300" height="300"></rect>
<rect class="f" x="200" y="-60" width="840" height="40"></rect>
<rect class="f" x="1300" y="820" width="300" height="180"></rect>
<circle class="p" cx="200" cy="860" r="90"></circle>'''

extra_css = '''
.rt { fill: none; stroke: var(--glow); stroke-width: 1.5; opacity: .35; transition: opacity .3s, stroke .3s; stroke-linejoin: round; }
.rt.hot { opacity: 1; stroke: var(--hot); filter: drop-shadow(0 0 4px rgba(255,181,71,.9)); stroke-dasharray: 6 4; animation: march .6s linear infinite; }
@keyframes march { to { stroke-dashoffset: -10; } }
.v.res { color: #7fd8b0; }
.part { cursor: pointer; outline: none; }
.part:focus-visible .body { stroke: var(--glow); }
@media not all and (min-width: 1100px) and (min-aspect-ratio: 5/4) { :root { --scene-h: 48svh; } }
@media (prefers-reduced-motion: reduce) { .rt.hot { animation: none; stroke-dasharray: none; } }
'''

html = page(title='lee.sh GPU', name='Projects', aria="Lee's projects shown on the back of a graphics card: the GPU die feeds three memory chips, one per project.",
            far=far, comp=comp, callouts=callouts, ports=ports, narrow_box='390 236 800 490', narrow_from=[DX0, DY1 - 40],
            extra_css=extra_css, hint='Hover a project')
open('../lee-gpu.html', 'w').write(html)
print('ok')
