const MONTHS_URL = 'data/index.json';
const esc = (s='') => String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const tone = n => n >= 76 ? 'red' : n >= 41 ? 'orange' : n >= 26 ? 'yellow' : 'green';
const pill = (n, label='') => `<span class="pill ${tone(Number(n))}"><span class="dot"></span>${esc(label || n)}</span>`;
const fmt = value => value == null ? '—' : esc(value);

let APP = { registry:null, report:null, issues:[], evidence:[], revelation:null, observations:[], map:null, storyKind:null, storyItem:null };

const cityCoords = {
  'Tengger':[ -7.942,112.953 ], 'Karanganyar':[-7.596,110.951], 'Banyumas':[-7.515,109.294], 'Barito Utara':[-0.78,114.74],
  'Tuban':[-6.897,112.064], 'Bangka':[-2.15,106.12], 'Medan':[3.595,98.672], 'Mempawah':[0.35,108.95],
  'Palangka Raya':[-2.21,113.92], 'Cibubur':[-6.37,106.88], 'Dieng':[-7.21,109.92], 'Trenggalek':[-8.05,111.70],
  'Indonesia':[ -2.5,118.0 ], 'Online':[0,0], 'Berbagai daerah':[-2.5,118.0]
};

async function getJson(url) {
  const response = await fetch(url, {cache:'no-store'});
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

async function boot() {
  APP.registry = await getJson(MONTHS_URL);
  populateMonthSelect(APP.registry.months || []);
  const current = APP.registry.months?.find(m=>m.id==='2026-08') || APP.registry.months?.[0];
  await loadMonth(current);
  restoreTheme();
  document.querySelector('#themeToggle')?.addEventListener('click', toggleTheme);
  document.querySelector('#monthSelect')?.addEventListener('change', async e => {
    const month = APP.registry.months.find(m=>m.id===e.target.value); if (month) await loadMonth(month);
  });
}

function populateMonthSelect(months){
  const select=document.querySelector('#monthSelect');
  if(!select) return;
  select.innerHTML=months.map(m=>`<option value="${esc(m.id)}">${esc(m.label)}${m.status==='final'?' · Final':''}</option>`).join('');
}

async function loadMonth(month){
  if(!month) return;
  APP.currentMonth=month;
  const [report,issues,evidence,revelation] = await Promise.all([
    getJson(month.path), getJson(month.issues), getJson(month.evidence), getJson(month.revelation)
  ]);
  APP.report=report; APP.issues=issues; APP.evidence=evidence; APP.revelation=revelation; APP.observations=report.observations || [];
  document.querySelector('#heroMonth').textContent = String(month.label).toUpperCase();
  document.querySelector('#heroPeriod').textContent = report.period || month.label;
  render(report,issues,evidence,revelation);
  bindFilters();
  initMap();
}

function render(report, issues, evidence, revelation){
  document.querySelector('#kpis').innerHTML=(report.kpis||[]).slice(0,8).map(k=>`<article class="kpi"><div class="label">${esc(k.label)}</div><div class="value">${esc(k.value)}</div><div class="note">${esc(k.note)}</div></article>`).join('');
  renderTimeline(report.observations||[]);
  renderObservations(report.observations||[]);
  renderGapBars(report.observations||[]);
  renderCausality(report.causality||[]);
  document.querySelector('#issueTable tbody').innerHTML=issues.map((i,idx)=>`<tr><td><strong>${esc(i.id)}</strong></td><td><strong>${esc(i.issue)}</strong><div class="cell-note">${esc(i.target||'')}</div></td><td>${esc(i.priority)}</td><td>${esc(i.target)}</td><td>${esc(i.status)}</td><td><button class="row-btn" type="button" onclick="openIssue(${idx})">View</button></td></tr>`).join('');
  document.querySelector('#issueCount').textContent=issues.length;
  document.querySelector('#evidenceCards').innerHTML=evidence.map((e,idx)=>`<article class="evidence-card"><div class="eyebrow">${esc(e.type||'SOURCE')}</div><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p><div class="evidence-meta"><span>${esc(e.source_grade||'Evidence')}</span><button class="row-btn" type="button" onclick="openEvidence(${idx})">View</button></div></article>`).join('');
  document.querySelector('#evidenceCount').textContent=evidence.length;
  renderRevelationCards(revelation);
}

function renderTimeline(observations){
  const rail=document.querySelector('#timelineRail');
  rail.innerHTML=observations.map((o,i)=>`<button class="timeline-item" type="button" onclick="openObservation(${i})"><span class="timeline-date">${esc(o.date)}</span><span class="timeline-dot ${tone(o.tauhid_gap)}"></span><span class="timeline-location">${esc(o.location)}</span><strong>${esc(o.practice)}</strong><span class="timeline-score">Gap ${esc(o.tauhid_gap)}/100</span></button>`).join('');
}

function renderGapBars(observations){
  const groups=[
    {key:'green',label:'Green · 0–25'}, {key:'yellow',label:'Yellow · 26–40'}, {key:'orange',label:'Orange · 41–75'}, {key:'red',label:'Red · 76–100'}
  ];
  const counts=groups.map(g=>({ ...g, count: observations.filter(o=>tone(Number(o.tauhid_gap))===g.key).length }));
  const max=Math.max(1,...counts.map(x=>x.count));
  document.querySelector('#gapBars').innerHTML=counts.map(g=>`<div class="bar-row"><div class="bar-head"><span>${g.label}</span><strong>${g.count}</strong></div><div class="bar-track"><div class="bar-fill ${g.key}" style="width:${Math.round(g.count/max*100)}%"></div></div></div>`).join('');
}

function renderCausality(items){
  document.querySelector('#causalList').innerHTML=items.map(c=>`<div class="causal-item"><strong><span>${esc(c.name)}</span>${pill(c.score,`${c.score}/100`)}</strong><span>${esc(c.finding)}</span></div>`).join('');
}

function revelationCell(o){
  const refs=o?.revelation_refs || APP.revelation?.default_row_refs || {Q:'112:1–4',I:'Mark 12:29–31',T:'Deut. 6:4–5',Z:'Ps. 86:10'};
  return `<div class="revelation-mini"><span class="ref-q">Q ${esc(refs.Q)}</span><span class="ref-i">I ${esc(refs.I)}</span><span class="ref-t">T ${esc(refs.T)}</span><span class="ref-z">Z ${esc(refs.Z)}</span></div>`;
}

function renderRevelationCards(revelation){
  const target=document.querySelector('#revelationCards'); if(!target)return;
  target.innerHTML=(revelation?.traditions||[]).map(r=>`<article class="revelation-card"><div class="revelation-key">${esc(r.key)}</div><div><div class="eyebrow">${esc(r.name)}</div><h3>${esc(r.references.join(' · '))}</h3><p>${esc(r.focus)}</p></div><a href="${esc(r.url)}" target="_blank" rel="noreferrer noopener">Open reference ↗</a></article>`).join('');
}

function renderObservations(observations){
  const tbody=document.querySelector('#masterTable tbody');
  tbody.innerHTML=observations.map((o,i)=>`<tr><td><strong>${esc(o.date)}</strong></td><td>${esc(o.location)}</td><td>${esc(o.actor)}</td><td><strong>${esc(o.practice)}</strong><div class="cell-note">${esc(o.summary)}</div></td><td>${pill(o.evidence_score,`${o.evidence_score}/100`)}</td><td>${pill(o.tauhid_gap,`${o.tauhid_gap}/100`)}</td><td>${pill(o.causality,`${o.causality}/100`)}</td><td>${revelationCell(o)}</td><td><button class="row-btn" type="button" onclick="openObservation(${i})">View</button></td></tr>`).join('');
  const count=document.querySelector('#observationCount'); if(count)count.textContent=`${observations.length} observations`;
}

function bindFilters(){
  const search=document.querySelector('#observationSearch'), gapFilter=document.querySelector('#gapFilter'); if(!search||!gapFilter)return;
  const nextSearch=search.cloneNode(true), nextGap=gapFilter.cloneNode(true); search.replaceWith(nextSearch); gapFilter.replaceWith(nextGap);
  const apply=()=>{const q=nextSearch.value.trim().toLowerCase(), selected=nextGap.value; const filtered=APP.observations.filter(o=>{const hay=[o.date,o.location,o.actor,o.practice,o.summary].join(' ').toLowerCase();return(!q||hay.includes(q))&&(selected==='all'||tone(Number(o.tauhid_gap))===selected)});renderObservations(filtered);};
  nextSearch.addEventListener('input',apply); nextGap.addEventListener('change',apply);
}

function initMap(){
  const el=document.querySelector('#mapCanvas'); if(!el||!window.L)return;
  if(APP.map){ APP.map.remove(); }
  APP.map=L.map(el,{scrollWheelZoom:false,zoomControl:true}).setView([-2.5,118],4.2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(APP.map);
  APP.observations.forEach((o,i)=>{ const c=cityCoords[o.location] || cityCoords.Indonesia; if(!c)return; const marker=L.circleMarker(c,{radius:7,weight:2,color:scoreColor(o.tauhid_gap),fillOpacity:.85}); marker.bindTooltip(`${esc(o.location)} · ${esc(o.practice)}`,{direction:'top'}); marker.on('click',()=>openObservation(i)); marker.addTo(APP.map); });
}

function scoreColor(n){const v=Number(n); return v>=76?'#c43b49':v>=41?'#bf641f':v>=26?'#a97800':'#159a70';}

function openObservation(index){
  const item=APP.observations[index]; if(!item)return;
  openDrawer(`<div class="drawer-kpi-row"><div>${pill(item.evidence_score,`Evidence ${item.evidence_score}/100`)}</div><div>${pill(item.tauhid_gap,`Tauhid Gap ${item.tauhid_gap}/100`)}</div><div>${pill(item.causality,`Causality ${item.causality}/100`)}</div></div><div class="detail-grid"><div><span>Date</span><strong>${esc(item.date)}</strong></div><div><span>Location</span><strong>${esc(item.location)}</strong></div><div><span>Community / Actor</span><strong>${esc(item.actor)}</strong></div><div><span>Practice</span><strong>${esc(item.practice)}</strong></div></div><div class="detail-block"><label>Observation</label><p>${esc(item.summary)}</p></div><div class="detail-block"><label>Four Revelation</label>${revelationCell(item)}</div><div class="detail-actions"><button class="primary-btn" onclick="storyFromObservation(${index})">Generate Image · Story</button><a class="secondary-btn" href="${esc(item.source)}" target="_blank" rel="noreferrer noopener">Open source ↗</a></div>`,'Observation detail');
}

function openIssue(index){const item=APP.issues[index];if(!item)return;openDrawer(`<div class="drawer-kpi-row"><span class="priority-chip">${esc(item.priority)}</span><span class="status-chip">${esc(item.status)}</span></div><div class="detail-block"><label>Issue</label><p>${esc(item.issue)}</p></div><div class="detail-grid"><div><span>ID</span><strong>${esc(item.id)}</strong></div><div><span>Target</span><strong>${esc(item.target)}</strong></div></div><div class="detail-block"><label>Resolution</label><p>${esc(item.resolution || item.next_action || 'Review evidence, religious context, intent and revelation references.')}</p></div><div class="detail-actions"><button class="primary-btn" onclick="storyFromIssue(${index})">Generate Image · Story</button></div>`,'Issue detail');}

function openEvidence(index){const item=APP.evidence[index];if(!item)return;openDrawer(`<div class="detail-block"><label>Type</label><p>${esc(item.type || '')}</p></div><div class="detail-block"><label>Description</label><p>${esc(item.description)}</p></div><div class="detail-grid"><div><span>Grade</span><strong>${esc(item.source_grade || '—')}</strong></div><div><span>Published</span><strong>${esc(item.published || '—')}</strong></div></div><div class="detail-actions"><a class="primary-btn" href="${esc(item.url)}" target="_blank" rel="noreferrer noopener">Open source ↗</a><button class="secondary-btn" onclick="storyFromEvidence(${index})">Generate Image · Story</button></div>`,'Evidence detail');}

function openDrawer(body,title){document.querySelector('#drawerTitle').textContent=title;document.querySelector('#drawerBody').innerHTML=body;document.querySelector('#detailDrawer').classList.add('open');document.querySelector('#detailDrawer').setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');}
function closeDrawer(){document.querySelector('#detailDrawer').classList.remove('open');document.querySelector('#detailDrawer').setAttribute('aria-hidden','true');document.body.classList.remove('drawer-open');}

function storyFromObservation(i){closeDrawer();generateStory('observation',APP.observations[i]);}
function storyFromIssue(i){closeDrawer();generateStory('issue',APP.issues[i]);}
function storyFromEvidence(i){closeDrawer();generateStory('evidence-item',APP.evidence[i]);}

function restoreTheme(){const saved=localStorage.getItem('wm-theme')||'light';document.documentElement.dataset.theme=saved==='dark'?'dark':'light';const b=document.querySelector('#themeToggle');if(b)b.textContent=document.documentElement.dataset.theme==='dark'?'☀':'☾';}
function toggleTheme(){const root=document.documentElement,next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;localStorage.setItem('wm-theme',next);const b=document.querySelector('#themeToggle');if(b)b.textContent=next==='dark'?'☀':'☾';if(APP.map){setTimeout(()=>APP.map.invalidateSize(),120);}}

let STORY_CONTEXT={kind:'',item:null};
function generateStory(kind,item=null){STORY_CONTEXT={kind,item};const canvas=document.querySelector('#storyCanvas');if(!canvas)return;drawStory(canvas,kind,item);document.querySelector('#storyModal').classList.add('open');document.querySelector('#storyModal').setAttribute('aria-hidden','false');}
function closeStoryModal(){document.querySelector('#storyModal').classList.remove('open');document.querySelector('#storyModal').setAttribute('aria-hidden','true');}
function drawStory(canvas,kind,item){const w=540,h=960,ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);ctx.fillStyle='#f7f8fb';ctx.fillRect(0,0,w,h);ctx.fillStyle='#6f52c9';ctx.fillRect(0,0,w,7);ctx.fillStyle='#151923';ctx.font='700 14px Arial';ctx.fillText('WHERE MYTH FADE TO LEGEND',28,48);ctx.fillStyle='#7b8494';ctx.font='600 10px Arial';ctx.fillText('INDONESIA OBSERVATORY · AUGUST 2026',28,67);ctx.fillStyle='#151923';ctx.font='700 31px Arial';const title=kind==='observation'?(item?.practice||'Observation'):kind==='issue'?(item?.id||'Issue'):kind==='evidence-item'?(item?.title||'Evidence'):kind==='timeline'?'Monthly Timeline':kind==='map'?'Observation Geography':kind==='issues'?'Issue Resolution Queue':'Observation Snapshot';drawWrap(ctx,title,28,115,480,39,4);let y=265;if(item){const loc=item.location||item.target||'';ctx.fillStyle='#6f52c9';ctx.font='700 12px Arial';ctx.fillText([item.date,loc].filter(Boolean).join(' · '),28,y);y+=32;ctx.fillStyle='#151923';ctx.font='600 17px Arial';const summary=item.summary||item.issue||item.description||'';drawWrap(ctx,summary,28,y,475,26,8);y+=220;if(item.tauhid_gap!=null){ctx.fillStyle='#151923';ctx.font='700 16px Arial';ctx.fillText('TAUHID GAP',28,y);ctx.font='800 36px Arial';ctx.fillStyle=scoreColor(item.tauhid_gap);ctx.fillText(`${item.tauhid_gap}/100`,28,y+42);y+=100;}if(item.evidence_score!=null){ctx.fillStyle='#151923';ctx.font='700 16px Arial';ctx.fillText('EVIDENCE',28,y);ctx.font='800 32px Arial';ctx.fillText(`${item.evidence_score}/100`,28,y+38);}}else{const items=kind==='timeline'?APP.observations.slice(0,7):kind==='issues'?APP.issues.slice(0,7):APP.evidence.slice(0,6);items.forEach((x,i)=>{ctx.fillStyle='#ffffff';ctx.fillRect(25,y,w-50,74);ctx.strokeStyle='#dfe3ea';ctx.strokeRect(25,y,w-50,74);ctx.fillStyle='#151923';ctx.font='700 12px Arial';ctx.fillText(String(x.id||x.date||x.title||x.practice||'').slice(0,58),40,y+25);ctx.fillStyle='#667084';ctx.font='400 11px Arial';const s=x.summary||x.issue||x.description||x.practice||'';drawWrap(ctx,s.slice(0,95),40,y+47,450,15,2);y+=86;});}ctx.fillStyle='#6f52c9';ctx.font='700 11px Arial';ctx.fillText('Evidence-first · Neutral toward people · Firm on Tauhid',28,900);ctx.fillStyle='#7b8494';ctx.font='400 9px Arial';ctx.fillText('Generated from the monthly observatory dataset',28,925);}
function drawWrap(ctx,text,x,y,maxWidth,lineHeight,maxLines){let line='';const lines=[];for(const word of String(text).split(/\s+/)){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length===maxLines-1)break;}else line=test;}if(line&&lines.length<maxLines)lines.push(line);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));}
function downloadStory(){const c=document.querySelector('#storyCanvas');const a=document.createElement('a');a.download=`where-myth-${STORY_CONTEXT.kind||'snapshot'}-august-2026.png`;a.href=c.toDataURL('image/png');a.click();}

window.openObservation=openObservation;window.openIssue=openIssue;window.openEvidence=openEvidence;window.closeDrawer=closeDrawer;window.generateStory=generateStory;window.closeStoryModal=closeStoryModal;window.downloadStory=downloadStory;window.storyFromObservation=storyFromObservation;window.storyFromIssue=storyFromIssue;window.storyFromEvidence=storyFromEvidence;

boot().catch(err=>{console.error(err);document.querySelector('main').insertAdjacentHTML('afterbegin',`<section class="section"><div class="panel error-panel"><strong>Unable to load the observatory dataset.</strong><p>${esc(err.message)}</p></div></section>`);});
