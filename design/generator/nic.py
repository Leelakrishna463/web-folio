from kit import page, callout

# Contact as a network card, drawn flat. Each labelled part tells one piece of "let's connect":
# the controller holds the one way to reach Lee, the ports say he's open, the buffers say messages get answered,
# and the PCIe edge is how he slots into a team.
PX0, PX1, PY0, PY1 = 400, 1260, 300, 640      # card
CX0, CX1, CY0, CY1 = 730, 930, 370, 570       # controller ASIC
PORT_Y = [322, 402, 482, 562]                 # four RJ45 jacks along the bracket

def ports():
    out = ['<g class="part" data-key="port" tabindex="0" aria-label="Ethernet ports">']
    out.append(f'<rect class="body" x="{PX0 - 40}" y="{PY0 - 40}" width="40" height="{PY1 - PY0 + 80}"></rect>')
    out.append(f'<path class="ln" d="M{PX0 - 40} {PY0 - 40} h-14 v24 h14 M{PX0 - 40} {PY1 + 40} h-14 v-24 h14"></path>')
    for k, y in enumerate(PORT_Y):
        out.append(f'<rect class="body" x="{PX0 - 4}" y="{y}" width="112" height="70" rx="1"></rect>')
        out.append(f'<rect class="lid" x="{PX0 + 6}" y="{y + 8}" width="84" height="54" rx="1"></rect>')
        out.append(f'<path class="ln" d="{"".join(f"M{PX0 + 30 + i * 6} {y + 16} v12 " for i in range(8))}"></path>')
        out.append(f'<path class="body hole" d="M{PX0 - 36} {y + 12} h26 v-4 h8 v4 h-2 v46 h-32 z"></path>')
        out.append(f'<rect class="led-link" x="{PX0 + 92}" y="{y + 10}" width="10" height="7"></rect>')
        out.append(f'<rect class="led-act" style="animation-delay: -{k * 0.7:.1f}s" x="{PX0 + 92}" y="{y + 52}" width="10" height="7"></rect>')
    out.append('</g>')
    return '\n'.join(out)

def small_chip(x, y, w, h, label):
    pins = ''.join(f'M{x + 8 + i * ((w - 16) / 5):.1f} {y - 6} v6 M{x + 8 + i * ((w - 16) / 5):.1f} {y + h} v6 ' for i in range(6))
    return (f'<path class="ln" d="{pins}"></path><rect class="body" x="{x}" y="{y}" width="{w}" height="{h}" rx="1"></rect>'
            f'<text class="etch dim" x="{x + w / 2}" y="{y + h / 2 + 3}" text-anchor="middle" style="font-size: 8px; letter-spacing: .14em">{label}</text>')

phys = '\n'.join(small_chip(560, y + 15, 70, 40, 'PHY') for y in PORT_Y)
# card traces: port → PHY → controller, controller → buffers
lanes = ''
for k, y in enumerate(PORT_Y):
    yy = y + 35
    ty = CY0 + 40 + k * 40
    for o in (-4, 4):
        lanes += f'M{PX0 + 108} {yy + o} H{560} M{630} {yy + o} H{660} L{660 + abs(ty - yy)} {ty + o} H{CX0} '
mem = [(1000, 330), (1110, 330), (1000, 420), (1110, 420)]
for (mx, my) in mem:
    lanes += f'M{CX1} {my + 26} H{mx} '
asic_pins = ''.join(f'M{CX0 + 14 + i * 12} {CY0 - 12} v12 M{CX0 + 14 + i * 12} {CY1} v12 M{CX0 - 12} {CY0 + 14 + i * 12} h12 M{CX1} {CY0 + 14 + i * 12} h12 ' for i in range(15))
fingers = ''.join(f'M{x} {PY1 - 18} V{PY1} ' for x in range(660, 1200, 6) if not (770 <= x <= 784))

comp = f'''
<rect class="body" x="{PX0}" y="{PY0}" width="{PX1 - PX0}" height="{PY1 - PY0}" rx="3"></rect>
<circle class="body" cx="{PX1 - 22}" cy="{PY0 + 22}" r="7"></circle><circle class="body" cx="{PX1 - 22}" cy="{PY1 - 40}" r="7"></circle>
<path class="lanes" d="{lanes}"></path>
<g class="part" data-key="phy">{phys}</g>
{ports()}
<g class="part" data-key="buf" tabindex="0" aria-label="Memory buffers">
  {''.join(small_chip(mx, my, 90, 52, 'BUFFER') for mx, my in mem)}
</g>
<g class="part asic" data-key="ctrl" tabindex="0" aria-label="Controller">
  <rect class="halo" x="{CX0 - 30}" y="{CY0 - 30}" width="{CX1 - CX0 + 60}" height="{CY1 - CY0 + 60}" rx="16"></rect>
  <path class="ln" d="{asic_pins}"></path>
  <rect class="body" x="{CX0}" y="{CY0}" width="{CX1 - CX0}" height="{CY1 - CY0}" rx="2"></rect>
  <rect class="lid core" x="{CX0 + 30}" y="{CY0 + 30}" width="{CX1 - CX0 - 60}" height="{CY1 - CY0 - 60}" rx="2"></rect>
  <path class="ln" d="M{CX0 + 12} {CY1 - 12} v-12 l12 12 z"></path>
  <text class="etch" x="{(CX0 + CX1) / 2}" y="{(CY0 + CY1) / 2 - 2}" text-anchor="middle" style="font-size: 30px; font-weight: 800; letter-spacing: .06em">LEE</text>
  <text class="etch" x="{(CX0 + CX1) / 2}" y="{(CY0 + CY1) / 2 + 20}" text-anchor="middle" style="font-size: 9px; font-weight: 600; letter-spacing: .2em">NIC CONTROLLER</text>
  <text class="etch dim" x="{(CX0 + CX1) / 2}" y="{(CY0 + CY1) / 2 + 36}" text-anchor="middle" style="font-size: 8px; letter-spacing: .16em">LINK READY</text>
</g>
<g class="part" data-key="bus" tabindex="0" aria-label="PCIe connector">
  <path class="gold" d="{fingers}"></path>
  <text class="etch dim" x="{PX1 - 30}" y="{PY1 - 26}" text-anchor="end" style="font-size: 9px; letter-spacing: .2em">PCIe 5.0 x16</text>
</g>
<text class="etch dim" x="{PX0 + 130}" y="{PY0 + 24}" style="font-size: 9px; letter-spacing: .2em">LEE-NIC · 4× 2.5 GbE</text>
'''
ports_amb = [{'x': 930, 'y': PY1, 'dir': 'd', 'n': 30, 'sp': 18, 'fan': 0.5}]

callouts = '\n'.join([
    callout('ctrl', ((CX0 + CX1) / 2, CY0 - 30), 'u', (CX0 + CX1) / 2, 240, 'above',
            '<div class="ref">U5 · Contact · Controller</div><p class="intro">Let\'s connect.</p><span class="v dim">One address, always listening.</span>'
            '<span class="v mailrow"><span id="mail">[you@example.com]</span><button class="copy" id="copy" type="button">Copy</button></span>',
            align='center', w=420),
    callout('port', (PX0 - 54, 470), 'l', 470, 250, 'left',
            '<span class="k"><b>PORTS</b>Link up</span><span class="v"><span class="led-dot" aria-hidden="true"></span>Open to senior backend roles</span><span class="v dim">[Bengaluru · on-site or remote]</span>', w=280),
    callout('buf', (1200, 356), 'r', 330, 1330, 'right',
            '<span class="k"><b>BUFFERS</b>Nothing dropped</span><span class="v">Every message gets a reply, usually within [24 hours].</span>', w=260),
    callout('bus', (PX1, 590), 'r', 600, 1330, 'right',
            '<span class="k"><b>PCIe</b>Ready to slot in</span><span class="v"><a class="btn primary" href="#" target="_blank" rel="noopener">Download résumé ↗</a></span>', w=260),
])

far = '''
<rect class="f" x="380" y="-80" width="840" height="40"></rect><rect class="f" x="380" y="-20" width="840" height="40"></rect>
<rect class="f" x="1300" y="820" width="380" height="260"></rect><circle class="p" cx="1480" cy="940" r="100"></circle>
<rect class="f" x="-160" y="820" width="320" height="220"></rect>'''

extra_css = '''
.lanes { fill: none; stroke: var(--glow); stroke-width: 1.3; opacity: .45; stroke-linejoin: round; }
.port .hole, .hole { fill: #07090b; }
.halo { fill: rgba(255,181,71,.07); stroke: var(--glow); stroke-width: 1.5; opacity: .55; filter: drop-shadow(0 0 18px rgba(255,181,71,.65)); animation: breathe 4s ease-in-out infinite; }
.asic .core { stroke: var(--glow); }
.asic.hot .halo { opacity: 1; animation: none; }
.led-link { fill: var(--green); filter: drop-shadow(0 0 4px var(--green)); }
.led-act { fill: var(--glow); filter: drop-shadow(0 0 4px var(--glow)); animation: act 1.9s steps(1) infinite; }
@keyframes act { 0%,100%{opacity:1} 9%{opacity:.15} 13%{opacity:1} 31%{opacity:.2} 34%{opacity:1} 37%{opacity:.2} 41%{opacity:1} 66%{opacity:.15} 72%{opacity:1} }
.part { outline: none; }
.part[tabindex]:focus-visible .body { stroke: var(--glow); }
.callout[data-key="ctrl"] { text-align: center; }
.callout[data-key="ctrl"] .intro { font-size: clamp(18px, 1.6vw, 24px); font-weight: 600; }
.mailrow { margin-top: 8px; }
.callout[data-key="ctrl"] .intro { margin-top: 4px; }
#mail { font: 600 16px var(--mono); color: var(--glow); }
.copy { font: 600 11px var(--mono); color: var(--text); background: transparent; border: 1px solid #343b44; padding: 5px 9px; margin-left: 10px; cursor: pointer; min-height: 28px; }
.copy:hover { border-color: var(--muted); }
.copy:focus-visible { outline: 2px solid var(--glow); outline-offset: 2px; }
.led-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); margin-right: 8px; vertical-align: 1px; }
.v.dim { color: var(--muted); font-size: 13px; }
.callout a.btn { color: #1b1305; text-decoration: none; margin-top: 4px; }
@media not all and (min-width: 1100px) and (min-aspect-ratio: 5/4) {
  :root { --scene-h: 42svh; }
  .callout[data-key="ctrl"] { text-align: left; }
}
@media (prefers-reduced-motion: reduce) { .led-act, .halo { animation: none; } }
'''

post_js = r'''
(function () {
  var copy = document.getElementById('copy');
  copy.addEventListener('click', function () {
    var el = document.getElementById('mail');
    var select = function () { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'Selected'; };
    try { navigator.clipboard.writeText(el.textContent.trim()).then(function () { copy.textContent = 'Copied'; }, select); } catch (err) { select(); }
    setTimeout(function () { copy.textContent = 'Copy'; }, 1600);
  });
})();
'''

html = page(title='lee.sh NIC', name='Contact', aria="Lee's contact page drawn as a network card: Ethernet ports, transceivers, a glowing controller chip holding Lee's email, memory buffers and a PCIe connector.",
            far=far, comp=comp, callouts=callouts, ports=ports_amb, narrow_box='330 250 960 450', narrow_from=[PX0 - 40, PY1 + 20],
            extra_css=extra_css, post_js=post_js, hint='Hover a component')
open('../lee-nic.html', 'w').write(html)
print('ok')
