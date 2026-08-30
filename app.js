const DATA_URL = 'data/2026/08/report.json';
const ISSUE_URL = 'data/2026/08/issues.json';
const EVIDENCE_URL = 'data/2026/08/evidence.json';

const esc = (s='') => String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const tone = n => n >= 76 ? 'red' : n >= 41 ? 'orange' : n >= 26 ? 'yellow' : 'green';
const pill = (n, label='') => `<span class="pill ${tone(n)}"><span class="dot ${tone(n)}"></span>${esc(label || n)}</span>`;

async function load() {
  const [report, issues, evidence] = await Promise.all([
    fetch(DATA_URL).then(r => r.json()),
    fetch(ISSUE_URL).then(r => r.json()),
    fetch(EVIDENCE_URL).then(r => r.json())
  ]);
  render(report, issues, evidence);
}

function render(report, issues, evidence) {
  document.querySelector('#kpis').innerHTML = report.kpis.map(k => `
    <div class="kpi"><div class="label">${esc(k.label)}</div><div class="value">${esc(k.value)}</div><div class="note">${esc(k.note)}</div></div>
  `).join('');

  document.querySelector('#masterTable tbody').innerHTML = report.observations.map(o => `
    <tr>
      <td>${esc(o.date)}</td><td>${esc(o.location)}</td><td>${esc(o.actor)}</td>
      <td><strong>${esc(o.practice)}</strong><div style="color:#a9a2bd;margin-top:4px">${esc(o.summary)}</div></td>
      <td>${pill(o.evidence_score, `${o.evidence_score}/100`)}</td>
      <td>${pill(o.tauhid_gap, `${o.tauhid_gap}/100`)}</td>
      <td>${pill(o.causality, `${o.causality}/100`)}</td>
      <td><a href="${esc(o.source)}" target="_blank" rel="noreferrer">Source ↗</a></td>
    </tr>
  `).join('');

  document.querySelector('#gapBars').innerHTML = report.gap_distribution.map(g => `
    <div class="bar-row"><div class="bar-head"><span>${esc(g.label)}</span><strong>${g.value}%</strong></div><div class="bar-track"><div class="bar-fill ${tone(g.value)}" style="width:${g.value}%"></div></div></div>
  `).join('');

  document.querySelector('#causalList').innerHTML = report.causality.map(c => `
    <div class="causal-item"><strong>${esc(c.name)} ${pill(c.score, `${c.score}/100`)}</strong><span>${esc(c.finding)}</span></div>
  `).join('');

  document.querySelector('#issueTable tbody').innerHTML = issues.map(i => `
    <tr><td><strong>${esc(i.id)}</strong></td><td>${esc(i.issue)}</td><td>${esc(i.priority)}</td><td>${esc(i.target)}</td><td>${esc(i.status)}</td></tr>
  `).join('');

  document.querySelector('#evidenceCards').innerHTML = evidence.map(e => `
    <article class="evidence-card"><div class="eyebrow">${esc(e.type)}</div><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p><a href="${esc(e.url)}" target="_blank" rel="noreferrer">Open evidence ↗</a></article>
  `).join('');
}

load().catch(err => {
  console.error(err);
  document.querySelector('main').insertAdjacentHTML('afterbegin', '<section class="section"><div class="panel"><strong>Data load error.</strong><p style="color:#a9a2bd">Check the monthly JSON files and GitHub Pages path.</p></div></section>');
});
