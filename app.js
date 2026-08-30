const DATA_URL = 'data/2026/08/report.json';
const ISSUE_URL = 'data/2026/08/issues.json';
const EVIDENCE_URL = 'data/2026/08/evidence.json';
const REVELATION_URL = 'data/2026/08/revelation.json';

const esc = (s='') => String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const tone = n => n >= 76 ? 'red' : n >= 41 ? 'orange' : n >= 26 ? 'yellow' : 'green';
const pill = (n, label='') => `<span class="pill ${tone(n)}"><span class="dot"></span>${esc(label || n)}</span>`;

let reportCache = null;
let STATE_ISSUES = [];
let STATE_EVIDENCE = [];
let REVELATION = null;

async function getJson(url) {
  const response = await fetch(url, {cache:'no-store'});
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

async function boot() {
  const [report, issues, evidence, revelation] = await Promise.all([
    getJson(DATA_URL),
    getJson(ISSUE_URL),
    getJson(EVIDENCE_URL),
    getJson(REVELATION_URL)
  ]);
  reportCache = report;
  STATE_ISSUES = issues;
  STATE_EVIDENCE = evidence;
  REVELATION = revelation;
  render(report, issues, evidence, revelation);
  bindFilters();
  restoreTheme();
  document.querySelector('#themeToggle')?.addEventListener('click', toggleTheme);
}

function render(report, issues, evidence, revelation) {
  document.querySelector('#kpis').innerHTML = (report.kpis || []).map(k => `
    <article class="kpi"><div class="label">${esc(k.label)}</div><div class="value">${esc(k.value)}</div><div class="note">${esc(k.note)}</div></article>`).join('');

  renderObservations(report.observations || []);

  document.querySelector('#gapBars').innerHTML = (report.gap_distribution || []).map(g => `
    <div class="bar-row"><div class="bar-head"><span>${esc(g.label)}</span><strong>${g.value}%</strong></div><div class="bar-track"><div class="bar-fill ${tone(g.value)}" style="width:${Math.min(100,Math.max(0,g.value))}%"></div></div></div>`).join('');

  document.querySelector('#causalList').innerHTML = (report.causality || []).map(c => `
    <div class="causal-item"><strong><span>${esc(c.name)}</span>${pill(c.score, `${c.score}/100`)}</strong><span>${esc(c.finding)}</span></div>`).join('');

  document.querySelector('#issueTable tbody').innerHTML = issues.map(i => `
    <tr><td><strong>${esc(i.id)}</strong></td><td>${esc(i.issue)}</td><td>${esc(i.priority)}</td><td>${esc(i.target)}</td><td>${esc(i.status)}</td></tr>`).join('');
  document.querySelector('#issueCount').textContent = issues.length;

  document.querySelector('#evidenceCards').innerHTML = evidence.map(e => `
    <article class="evidence-card"><div class="eyebrow">${esc(e.type)}</div><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p><a href="${esc(e.url)}" target="_blank" rel="noreferrer noopener">Open evidence ↗</a></article>`).join('');
  document.querySelector('#evidenceCount').textContent = evidence.length;

  renderRevelationCards(revelation);
}

function revelationCell() {
  const refs = REVELATION?.default_row_refs || {Q:'112:1-4', I:'Mark 12:29-31', T:'Deut. 6:4-5', Z:'Ps. 86:10'};
  return `<div class="revelation-mini"><span class="ref-q">Q ${esc(refs.Q)}</span><span class="ref-i">I ${esc(refs.I)}</span><span class="ref-t">T ${esc(refs.T)}</span><span class="ref-z">Z ${esc(refs.Z)}</span></div>`;
}

function renderRevelationCards(revelation) {
  const target = document.querySelector('#revelationCards');
  if (!target) return;
  target.innerHTML = (revelation?.traditions || []).map(r => `
    <article class="revelation-card">
      <div class="revelation-key">${esc(r.key)}</div>
      <div><div class="eyebrow">${esc(r.name)}</div><h3>${esc(r.references.join(' · '))}</h3><p>${esc(r.focus)}</p></div>
      <a href="${esc(r.url)}" target="_blank" rel="noreferrer noopener">Open reference ↗</a>
    </article>
  `).join('');
}

function renderObservations(observations) {
  const tbody = document.querySelector('#masterTable tbody');
  tbody.innerHTML = observations.map(o => `
    <tr>
      <td><strong>${esc(o.date)}</strong></td>
      <td>${esc(o.location)}</td>
      <td>${esc(o.actor)}</td>
      <td><strong>${esc(o.practice)}</strong><div class="cell-note">${esc(o.summary)}</div></td>
      <td>${pill(o.evidence_score, `${o.evidence_score}/100`)}</td>
      <td>${pill(o.tauhid_gap, `${o.tauhid_gap}/100`)}</td>
      <td>${pill(o.causality, `${o.causality}/100`)}</td>
      <td>${revelationCell()}</td>
      <td><a href="${esc(o.source)}" target="_blank" rel="noreferrer noopener">Open ↗</a></td>
    </tr>`).join('');
  const count = document.querySelector('#observationCount');
  if (count) count.textContent = `${observations.length} observations`;
}

function bindFilters() {
  const search = document.querySelector('#observationSearch');
  const gapFilter = document.querySelector('#gapFilter');
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    const selected = gapFilter.value;
    const filtered = reportCache.observations.filter(o => {
      const haystack = [o.date,o.location,o.actor,o.practice,o.summary].join(' ').toLowerCase();
      return (!q || haystack.includes(q)) && (selected === 'all' || tone(o.tauhid_gap) === selected);
    });
    renderObservations(filtered);
  };
  search.addEventListener('input', apply);
  gapFilter.addEventListener('change', apply);
}

function restoreTheme() {
  const saved = localStorage.getItem('wm-theme') || 'light';
  document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light';
  const btn = document.querySelector('#themeToggle');
  if (btn) btn.textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾';
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('wm-theme', next);
  const btn = document.querySelector('#themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '☀' : '☾';
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines=8) {
  const words = String(text).split(/\s+/);
  const lines = []; let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; if (lines.length === maxLines - 1) break; }
    else line = test;
  }
  if (line && lines.length < maxLines) lines.push(line);
  lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));
}

function generateStory(kind) {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle='#f7f8fb'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#6f52c9'; ctx.fillRect(0,0,W,10);
  ctx.fillStyle='#151923'; ctx.font='700 28px Arial'; ctx.fillText('WHERE MYTH FADE TO LEGEND',64,90);
  ctx.fillStyle='#667084'; ctx.font='600 18px Arial'; ctx.fillText('INDONESIA OBSERVATORY · AUGUST 2026',64,122);
  ctx.fillStyle='#151923'; ctx.font='700 60px Arial';
  ctx.fillText(kind==='observations'?'Observation Snapshot':kind==='issues'?'Issue Resolution Queue':'Evidence Snapshot',64,220);
  ctx.fillStyle='#667084'; ctx.font='400 25px Arial';
  ctx.fillText(kind==='observations'?`${reportCache.observations.length} documented observations`:kind==='issues'?`${STATE_ISSUES.length} issues under review`:`${STATE_EVIDENCE.length} evidence records`,64,262);
  const items = kind==='observations' ? reportCache.observations.slice(0,6).map(o=>({head:`${o.date} · ${o.location}`,body:`${o.practice} — Tauhid Gap ${o.tauhid_gap}/100`,score:o.tauhid_gap})) : kind==='issues' ? STATE_ISSUES.slice(0,8).map(i=>({head:i.id,body:`${i.issue} · ${i.priority}`,score:i.priority==='CRITICAL'?90:70})) : STATE_EVIDENCE.slice(0,6).map(e=>({head:e.title,body:e.description,score:0}));
  let y=350;
  items.forEach(item=>{ctx.fillStyle='#ffffff';ctx.fillRect(52,y,W-104,190);ctx.strokeStyle='#dfe3ea';ctx.lineWidth=2;ctx.strokeRect(52,y,W-104,190);ctx.fillStyle=item.score>=76?'#c83f4d':'#151923';ctx.font='700 24px Arial';ctx.fillText(item.head,84,y+48);ctx.fillStyle='#151923';ctx.font='600 28px Arial';drawWrapped(ctx,item.body,84,y+92,W-190,38,3);y+=215;});
  ctx.fillStyle='#6f52c9';ctx.font='700 22px Arial';ctx.fillText('Evidence-first · Neutral toward people · Firm on Tauhid',64,H-90);
  ctx.fillStyle='#667084';ctx.font='400 18px Arial';ctx.fillText('Generated from the August 2026 observatory dataset',64,H-54);
  const link=document.createElement('a'); link.download=`where-myth-fade-${kind}-august-2026.png`; link.href=canvas.toDataURL('image/png'); link.click();
}

window.generateStory = generateStory;
window.toggleTheme = toggleTheme;

boot().catch(err=>{
  console.error(err);
  document.querySelector('main').insertAdjacentHTML('afterbegin','<section class="section"><div class="panel"><strong>Data load error.</strong><p class="section-note">Check the monthly JSON files and GitHub Pages path.</p></div></section>');
});
