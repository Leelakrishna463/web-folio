from kit import page, callout

# Four DIMMs lying in their slots, interface on the left: gold contacts and slot on the left edge, traces fanning
# left into the board. Every memory chip is one skill; its three LEDs show how loaded it is.
GROUPS = [
    ('LANGUAGES', 'DIMM_A1', [('Python', 3), ('SQL', 3), ('C++', 2)]),
    ('FRAMEWORKS', 'DIMM_A2', [('Django', 3), ('DRF', 3), ('Celery', 2)]),
    ('DATA', 'DIMM_B1', [('PostgreSQL', 3), ('Redis', 2), None]),
    ('INFRA', 'DIMM_B2', [('[AWS]', 2), ('[Docker]', 2), ('[Nginx]', 2)]),
]
X0, X1, H, GAP, Y0 = 440, 1160, 104, 26, 260
YS = [Y0 + k * (H + GAP) for k in range(4)]
SLOT = 24

def stick(k, y, group, slot, chips):
    cy = y + H / 2
    s = [f'<g class="part" data-key="s{k}" tabindex="0" aria-label="{group.title()}: ' + ', '.join(c[0] for c in chips if c) + '">']
    s.append(f'<rect class="body" x="{X0}" y="{y}" width="{X1 - X0}" height="{H}" rx="2"></rect>')
    # gold contacts on the left edge, with the key notch
    fingers = ''.join(f'M{X0 + 2} {yy} H{X0 + 20} ' for yy in range(y + 8, y + H - 6, 5) if not (y + 44 <= yy <= y + 52))
    s.append(f'<path class="gold" d="{fingers}"></path>')
    # chips
    for j, c in enumerate(chips):
        x, cw, cy0, ch = X0 + 40 + j * 180, 164, y + 10, H - 20
        cx = x + cw / 2
        if c is None:
            s.append(f'<rect x="{x}" y="{cy0}" width="{cw}" height="{ch}" fill="none" stroke="#5f6a76" stroke-width="1.3" stroke-dasharray="5 5"></rect>')
            s.append(f'<text class="etch dim" x="{cx}" y="{cy0 + 40}" text-anchor="middle" style="font-size: 12px; font-weight: 700; letter-spacing: .14em">FREE</text>')
            s.append(f'<text class="etch dim" x="{cx}" y="{cy0 + 58}" text-anchor="middle" style="font-size: 8px; letter-spacing: .1em">NEXT SKILL</text>')
            continue
        name, load = c
        s.append(f'<rect class="body" x="{x}" y="{cy0}" width="{cw}" height="{ch}" rx="1"></rect>')
        s.append(f'<rect class="lid" x="{x + 7}" y="{cy0 + 7}" width="{cw - 14}" height="{ch - 14}" rx="1"></rect>')
        s.append(f'<path class="ln" d="M{x + 12} {cy0 + ch - 12} v-8 l8 8 z"></path>')
        s.append(f'<text class="etch" x="{cx}" y="{cy0 + 36}" text-anchor="middle" style="font-size: 16px; font-weight: 700">{name}</text>')
        s.append(f'<text class="etch dim" x="{cx}" y="{cy0 + 52}" text-anchor="middle" style="font-size: 8px; letter-spacing: .14em">DDR5 · {["", "WORKING", "COMFORT", "DAILY"][load]}</text>')
        for L in range(3):
            cls = 'led on' if L < load else 'led'
            s.append(f'<rect class="{cls}" x="{cx - 22 + L * 16}" y="{cy0 + 62}" width="12" height="6"></rect>')
    # sticker at the far end
    sx = X0 + 40 + 3 * 180
    s.append(f'<rect class="lid" x="{sx}" y="{y + 10}" width="{X1 - 12 - sx}" height="{H - 20}" rx="1"></rect>')
    s.append(f'<text class="etch" x="{(sx + X1 - 12) / 2}" y="{cy - 2}" text-anchor="middle" style="font-size: 11px; font-weight: 700; letter-spacing: .14em">{group}</text>')
    s.append(f'<text class="etch dim" x="{(sx + X1 - 12) / 2}" y="{cy + 16}" text-anchor="middle" style="font-size: 8px; letter-spacing: .14em">{slot} · 16 GB</text>')
    s.append('</g>')
    # slot and latches on the left
    s.append(f'<rect class="body" x="{X0 - SLOT}" y="{y - 8}" width="{SLOT}" height="{H + 16}"></rect>')
    s.append(f'<rect class="body" x="{X0 - SLOT - 8}" y="{y - 14}" width="{SLOT + 16}" height="8"></rect>')
    s.append(f'<rect class="body" x="{X0 - SLOT - 8}" y="{y + H + 6}" width="{SLOT + 16}" height="8"></rect>')
    return '\n'.join(s)

comp = '\n'.join(stick(k, YS[k], *GROUPS[k]) for k in range(4))
ports = [{'x': X0 - SLOT, 'y': y + H / 2, 'dir': 'l', 'n': 10, 'sp': 10, 'fan': 0.28, 'key': f's{k}'} for k, y in enumerate(YS)]

def leds(n):
    return '<span class="leds">' + ''.join(f'<i class="{"on" if i < n else ""}"></i>' for i in range(3)) + '</span>'

callouts = '\n'.join([
    callout('intro', (800, YS[0]), 'u', 800, 200, 'above',
            '<div class="ref">U2 · Skills</div><p class="intro">What\'s loaded in memory. Four sticks, one skill group each, and every chip is a skill.</p>', align='center', w=460),
    callout('strong', (X1, YS[0] + H / 2), 'r', YS[0] + H / 2, 1230, 'right',
            '<span class="k"><b>P1</b>Strongest</span><span class="v">Python · Django · PostgreSQL</span>', w=280),
    callout('legend', (X1, YS[1] + H / 2 + 50), 'r', YS[1] + H / 2 + 70, 1230, 'right',
            '<span class="k"><b>P2</b>Load, per chip</span>'
            f'<span class="v">{leds(3)}Daily driver</span><span class="v">{leds(2)}Comfortable</span><span class="v">{leds(1)}Working knowledge</span>', w=280),
    callout('next', (X1, YS[3] + H / 2), 'r', YS[3] + H / 2, 1230, 'right',
            '<span class="k"><b>P3</b>Next in the pipeline</span><span class="v">[What you\'re learning now]</span>', w=280),
])

far = '''
<rect class="f" x="-60" y="380" width="300" height="300"></rect>
<rect class="f" x="1300" y="820" width="380" height="260"></rect><circle class="p" cx="1480" cy="940" r="100"></circle>
<rect class="f" x="380" y="-80" width="840" height="40"></rect>'''

extra_css = '''
.led { fill: none; stroke: #5f6a76; stroke-width: 1; }
.led.on { fill: var(--glow); stroke: var(--glow); filter: drop-shadow(0 0 3px rgba(255,181,71,.8)); }
.leds { display: inline-flex; gap: 4px; margin-right: 10px; vertical-align: 1px; }
.leds i { width: 12px; height: 6px; border: 1px solid #5f6a76; }
.leds i.on { background: var(--glow); border-color: var(--glow); box-shadow: 0 0 6px rgba(255,181,71,.7); }
.part { cursor: pointer; outline: none; }
.part:focus-visible .body { stroke: var(--glow); }
.callout[data-key="intro"] { text-align: center; }
@media not all and (min-width: 1100px) and (min-aspect-ratio: 5/4) {
  :root { --scene-h: 44svh; }
  .callout[data-key="intro"] { text-align: left; }
}
'''

html = page(title='lee.sh RAM', name='Skills', aria="Lee's skills shown as four memory sticks with their contacts on the left. Each chip on a stick is one skill: languages, frameworks, data and infrastructure.",
            far=far, comp=comp, callouts=callouts, ports=ports, narrow_box='380 236 800 534', narrow_from=[X0 - SLOT, YS[-1] + H],
            extra_css=extra_css, hint='Hover a stick')
open('../lee-ram.html', 'w').write(html)
print('ok')
