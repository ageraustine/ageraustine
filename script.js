// ============================================================
// AGER AUSTINE — PORTFOLIO SCRIPT
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- NAV: scroll state + mobile toggle ---------- */
(function nav(){
  const navEl = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');

  const onScroll = () => {
    navEl.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  toggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.querySelectorAll('.nav-mobile a').forEach(a=>{
    a.addEventListener('click', () => {
      navEl.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
    });
  });
})();

/* ---------- NAV: scroll-spy active section ---------- */
(function scrollSpy(){
  const sections = ['log', 'projects', 'stack', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const links = Array.from(document.querySelectorAll('.nav-links a'));
  if(!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => io.observe(sec));
})();

/* ---------- SCROLL REVEAL ---------- */
(function reveal(){
  const items = document.querySelectorAll('.reveal');
  if(prefersReducedMotion){
    items.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry, i)=>{
      if(entry.isIntersecting){
        const el = entry.target;
        setTimeout(()=> el.classList.add('is-visible'), (i%4) * 70);
        io.unobserve(el);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
  items.forEach(el=> io.observe(el));
})();

/* ---------- METRIC COUNT-UP ---------- */
(function metrics(){
  const nums = document.querySelectorAll('.metric-num');
  if(!nums.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const isDecimal = String(target).includes('.');
    const duration = 1200;
    const start = performance.now();

    if(prefersReducedMotion){
      el.textContent = target;
      return;
    }

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isDecimal ? val.toFixed(1) : Math.round(val);
      if(p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.6 });

  nums.forEach(el=> io.observe(el));
})();

/* ---------- HERO SIGNATURE: phase-portrait / signal trace ----------
   A generative SVG evoking a Neural-ODE phase portrait crossed with
   an oscilloscope trace: a family of spiral flow-lines plus a
   traveling waveform, drawn with CSS variables from the palette. */
(function heroTrace(){
  const svg = document.getElementById('phasePortrait');
  if(!svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 1200, H = 800;
  const isMobile = window.innerWidth <= 760;
  const cx = W * (isMobile ? 0.58 : 0.72), cy = H * 0.42;

  const mk = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    return el;
  };

  // faint background grid (blueprint feel)
  const gridGroup = mk('g', { opacity: '0.06' });
  for(let x = 0; x <= W; x += 60){
    gridGroup.appendChild(mk('line', { x1:x, y1:0, x2:x, y2:H, stroke:'#2B2116', 'stroke-width':1 }));
  }
  for(let y = 0; y <= H; y += 60){
    gridGroup.appendChild(mk('line', { x1:0, y1:y, x2:W, y2:y, stroke:'#2B2116', 'stroke-width':1 }));
  }
  svg.appendChild(gridGroup);

  // spiral flow lines — several damped spirals at different phases/radii,
  // referencing the "spiral" Neural ODE case + damped-pendulum dynamics
  const colors = ['#AD8324', '#AD8324', '#8B5A2B'];
  const spiralPaths = [];

  for(let s = 0; s < 3; s++){
    const points = [];
    const turns = 3.2 + s * 0.4;
    const steps = 260;
    const rStart = 210 + s * 46;
    const decay = 0.997 - s * 0.001;
    const phase = s * 1.3;
    let r = rStart;
    for(let i = 0; i <= steps; i++){
      const t = (i/steps) * turns * Math.PI * 2;
      r *= decay;
      const x = cx + Math.cos(t + phase) * r * 0.62;
      const y = cy + Math.sin(t + phase) * r * 0.9 * 0.62 * 0.75;
      points.push(`${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const d = points.join(' ');
    const path = mk('path', {
      d,
      fill:'none',
      stroke: colors[s],
      'stroke-width': s === 2 ? 1.1 : 1.4,
      'stroke-linecap':'round',
      opacity: s === 2 ? 0.35 : 0.5,
    });
    svg.appendChild(path);
    spiralPaths.push(path);
  }

  // animate stroke draw-on for the primary two spirals
  if(!prefersReducedMotion){
    spiralPaths.forEach((path, i) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.style.transition = `stroke-dashoffset ${2.6 + i*0.4}s cubic-bezier(.16,.6,.2,1) ${i*0.25}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        path.style.strokeDashoffset = '0';
      }));
    });
  } else {
    spiralPaths.forEach(p => { p.style.opacity = String(p.getAttribute('opacity')); });
  }

  // small orbiting node marking "current state" on the outer spiral
  if(!prefersReducedMotion){
    const dot = mk('circle', { r:4, fill:'#E3B94E' });
    svg.appendChild(dot);
    const path = spiralPaths[0];
    const len = path.getTotalLength();
    let start = null;
    const dur = 9000;
    const tick = (ts) => {
      if(start === null) start = ts;
      const p = ((ts - start) % dur) / dur;
      const pt = path.getPointAtLength(len * p);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // faint waveform strip along the bottom — nods to the audio-generation work
  const waveGroup = mk('g', { opacity:'0.32', class:'hero-wave' });
  const waveY = H * 0.86;
  const bars = 64;
  const barW = (W * 0.42) / bars;
  // On mobile the trace sits in a small box next to the name (not the full
  // hero), so center the waveform under the spiral itself rather than
  // aligning to the readout row further down the page.
  const waveStartX = isMobile ? (cx - (bars * barW) / 2) : W * 0.06;
  for(let i = 0; i < bars; i++){
    const h = 6 + Math.abs(Math.sin(i * 0.45) * Math.cos(i * 0.12)) * 46;
    const x = waveStartX + i * barW;
    waveGroup.appendChild(mk('rect', {
      x: x.toFixed(1),
      y: (waveY - h/2).toFixed(1),
      width: Math.max(barW - 1.4, 1),
      height: h.toFixed(1),
      fill:'#8B5A2B',
      rx: 0.6,
    }));
  }
  svg.appendChild(waveGroup);

  // Align the waveform's left edge with the hero content column (the readout
  // row / hero-inner), accounting for the SVG's xMidYMid "slice" scaling.
  const alignWaveform = () => {
    if(isMobile) return; // mobile trace box isn't tied to the readout row's position
    const target = document.querySelector('.hero-readout') || document.querySelector('.hero-inner');
    if(!target) return;
    const svgRect = svg.getBoundingClientRect();
    if(!svgRect.width || !svgRect.height) return;
    const scale = Math.max(svgRect.width / W, svgRect.height / H);
    const offsetX = (svgRect.width - W * scale) / 2;
    const targetRect = target.getBoundingClientRect();
    const viewBoxX = (targetRect.left - svgRect.left - offsetX) / scale;
    waveGroup.setAttribute('transform', `translate(${(viewBoxX - waveStartX).toFixed(1)}, 0)`);
  };
  if(!isMobile){
    requestAnimationFrame(() => requestAnimationFrame(alignWaveform));
    window.addEventListener('resize', alignWaveform);
    window.addEventListener('load', alignWaveform);
  }

  // subtle cursor parallax on desktop — the trace drifts gently toward the pointer
  if(!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    const wrap = svg.parentElement; // .hero-trace
    const hero = document.getElementById('hero');
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    const maxShift = 14;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = nx * maxShift;
      targetY = ny * maxShift;
    });
    hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

    const raf = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      wrap.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
})();