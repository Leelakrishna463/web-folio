from kit import page, callout

# An M.2 drive laid out as a timeline: oldest role by the screw, newest at the controller next to the connector,
# so the data literally flows toward the present (and on to the CPU). A silkscreen year ruler runs underneath.
X0, X1, Y0, Y1 = 300, 1240, 380, 620
ROLES = [
    # key, x, width, kind, company, role, years
    ('r1', 370, 230, 'NAND', '[Company]', '[Backend Developer]', '[2019] – [2021]'),
    ('r2', 630, 230, 'NAND', '[Company]', '[Software Engineer]', '[2021] – [2023]'),
    ('r3', 900, 210, 'CTRL', '[Company]', '[Senior Software Engineer]', '[2023] – NOW'),
]
CH_Y, CH_H = 418, 160

def chip(key, x, w, kind, company, role, years):
    cx = x + w / 2
    return f'''<g class="part" data-key="{key}" tabindex="0" aria-label="{role} at {company}, {years}">
  <rect class="body" x="{x}" y="{CH_Y}" width="{w}" height="{CH_H}" rx="1"></rect>
  <rect class="lid" x="{x + 8}" y="{CH_Y + 8}" width="{w - 16}" height="{CH_H - 16}" rx="1"></rect>
  <path class="ln" d="M{x + 15} {CH_Y + CH_H - 15} v-10 l10 10 z"></path>
  <text class="etch dim" x="{cx}" y="{CH_Y + 36}" text-anchor="middle" style="font-size: 9px; letter-spacing: .2em">{kind} · {years}</text>
  <text class="etch" x="{cx}" y="{CH_Y + 74}" text-anchor="middle" style="font-size: 19px; font-weight: 800; letter-spacing: .04em">{company}</text>
  <text class="etch" x="{cx}" y="{CH_Y + 98}" text-anchor="middle" style="font-size: 10px; font-weight: 600; letter-spacing: .06em">{role}</text>
  {('<text class="etch now" x="' + str(cx) + '" y="' + str(CH_Y + 134) + '" text-anchor="middle" style="font-size: 9px; letter-spacing: .2em">● CURRENT</text>') if kind == 'CTRL' else ''}
</g>'''

fingers = ''.join(f'M{X1 - 26} {y} H{X1} ' for y in range(Y0 + 14, Y1 - 10, 8) if not (Y0 + 86 <= y <= Y0 + 104))
ruler_ticks = []
for (key, x, w, *_), yr in zip(ROLES, ['[2019]', '[2021]', '[2023]']):
    ruler_ticks.append(f'<path class="ln" d="M{x} {Y1 - 26} v-10"></path><text class="etch dim" x="{x}" y="{Y1 - 10}" text-anchor="middle" style="font-size: 9px; letter-spacing: .12em">{yr}</text>')
comp = f'''
<path class="body" d="M{X0} {Y0} H{X1} V{Y0 + 86} H{X1 - 10} V{Y0 + 104} H{X1} V{Y1} H{X0} V{(Y0 + Y1) // 2 + 24} A24 24 0 0 0 {X0} {(Y0 + Y1) // 2 - 24} Z"></path>
<circle class="body" cx="{X0}" cy="{(Y0 + Y1) // 2}" r="14"></circle><path class="ln" d="M{X0 - 7} {(Y0 + Y1) // 2} h14"></path>
<path class="gold" d="{fingers}"></path>
<text class="etch dim" x="{X0 + 40}" y="{Y0 + 24}" style="font-size: 9px; letter-spacing: .2em">M.2 2280 · NVMe · EXPERIENCE</text>
<text class="etch dim" x="{X1 - 40}" y="{Y0 + 24}" text-anchor="end" style="font-size: 9px; letter-spacing: .2em">TO CPU →</text>
<path class="ln" d="M{ROLES[0][1]} {Y1 - 30} H{X1 - 44}"></path>
<path class="ln" d="M{X1 - 52} {Y1 - 34} l8 4 l-8 4"></path>
{''.join(ruler_ticks)}
<text class="etch now" x="{X1 - 44}" y="{Y1 - 10}" text-anchor="end" style="font-size: 9px; letter-spacing: .12em">NOW</text>
{''.join(chip(*r) for r in ROLES)}
'''
# data flows out of the connector toward the CPU
ports = [{'x': X1, 'y': (Y0 + Y1) / 2, 'dir': 'r', 'n': 20, 'sp': 10, 'fan': 0.9}]

c = lambda r: (r[1] + r[2] / 2)
callouts = '\n'.join([
    callout('intro', (ROLES[0][1] + 40, CH_Y + CH_H), 'd', ROLES[0][1] + 40, 760, 'below',
            '<div class="ref">U3 · Experience</div><p class="intro">Where I\'ve worked, stored oldest to newest. The data flows toward the present, and on to the CPU.</p>', align='end', w=320),
    callout('r1', (c(ROLES[0]), CH_Y), 'u', c(ROLES[0]), 250, 'above',
            '<span class="k"><b>[2019–21]</b>Impact</span><span class="v">[What you shipped and the result, e.g. built X, cutting Y by Z%]</span>', w=300),
    callout('r2', (c(ROLES[1]), CH_Y + CH_H), 'd', c(ROLES[1]), 760, 'below',
            '<span class="k"><b>[2021–23]</b>Impact</span><span class="v">[Built a feature or migration with a measurable result]</span>', w=300),
    callout('r3', (c(ROLES[2]), CH_Y), 'u', c(ROLES[2]), 250, 'above',
            '<span class="k"><b>NOW</b>Impact</span><span class="v">[Led X: cut p95 latency of Y API from 800 ms to 120 ms]</span>', w=300),
])

far = '''
<rect class="f" x="1320" y="300" width="300" height="300"></rect>
<rect class="f" x="380" y="-60" width="840" height="40"></rect><rect class="f" x="380" y="0" width="840" height="40"></rect>
<rect class="f" x="1240" y="760" width="420" height="300"></rect><circle class="p" cx="1440" cy="900" r="110"></circle>
<rect class="f" x="-80" y="760" width="300" height="200"></rect>'''

extra_css = '''
.etch.now { fill: var(--green); }
.part { cursor: pointer; outline: none; }
.part:focus-visible .body { stroke: var(--glow); }
@media not all and (min-width: 1100px) and (min-aspect-ratio: 5/4) { :root { --scene-h: 36svh; } }
'''

html = page(title='lee.sh SSD', name='Experience', aria="Lee's experience shown as an M.2 drive. Each chip is a role, oldest by the screw and the current role at the controller next to the connector.",
            far=far, comp=comp, callouts=callouts, ports=ports, narrow_box='280 360 980 280', narrow_from=[ROLES[0][1], CH_Y + CH_H],
            extra_css=extra_css, hint='Hover a chip')
open('../lee-ssd.html', 'w').write(html)
print('ok')
