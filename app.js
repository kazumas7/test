/* ELEITORA — vanilla SPA, GitHub Pages ready.
   Live source: TSE official result distribution.
   Fallback data: current verified snapshot for a useful offline/failed-request experience.
*/
const TSE = {
  base: 'https://resultados.tse.jus.br/oficial',
  config: 'https://resultados.tse.jus.br/oficial/comum/config/ele-c.json',
  resultApp: 'https://resultados.tse.jus.br/oficial/app/index.html',
  openData: 'https://dadosabertos.tse.jus.br/',
  divCands: 'https://divulgacandcontas.tse.jus.br/divulga/'
};

const FALLBACK = {
  updatedAt: '2026-10-05T00:11:00-03:00',
  totalized: 99.99,
  valid: 125272513,
  blank: 2300781,
  nulled: 3674149,
  candidates: [
    {name:'Flávio Bolsonaro', party:'PL', votes:56104268, pct:47.03, color:'red', sub:'1º colocado • 2026'},
    {name:'Luiz Inácio Lula da Silva', party:'PT', votes:53876617, pct:45.16, color:'blue', sub:'2º colocado • 2026'}
  ],
  stateWinners: {
    AC:'Flávio', AL:'Lula', AP:'Lula', AM:'Lula', BA:'Lula', CE:'Lula', DF:'Flávio', ES:'Flávio',
    GO:'Flávio', MA:'Lula', MT:'Flávio', MS:'Flávio', MG:'Flávio', PA:'Lula', PB:'Lula', PR:'Flávio',
    PE:'Lula', PI:'Lula', RJ:'Flávio', RN:'Lula', RS:'Flávio', RO:'Flávio', RR:'Flávio', SC:'Flávio',
    SP:'Flávio', SE:'Lula', TO:'Flávio'
  }
};

const HISTORY = [
  {year:2018, turn:'1º turno', c1:'Jair Bolsonaro', p1:'PSL', v1:49276990, pct1:46.03, c2:'Fernando Haddad', p2:'PT', v2:31342005, pct2:29.28, valid:107050673, blank:3106936, nulled:7206205, absent:29941265},
  {year:2018, turn:'2º turno', c1:'Jair Bolsonaro', p1:'PSL', v1:57797847, pct1:55.13, c2:'Fernando Haddad', p2:'PT', v2:47040906, pct2:44.87, valid:104838753, blank:2486593, nulled:8608105, absent:31371704},
  {year:2022, turn:'1º turno', c1:'Luiz Inácio Lula da Silva', p1:'PT', v1:57259504, pct1:48.43, c2:'Jair Bolsonaro', p2:'PL', v2:51072345, pct2:43.20, valid:118229719, blank:1964779, nulled:3487874, absent:32770982},
  {year:2022, turn:'2º turno', c1:'Luiz Inácio Lula da Silva', p1:'PT', v1:60345999, pct1:50.90, c2:'Jair Bolsonaro', p2:'PL', v2:58206354, pct2:49.10, valid:118552151, blank:1794341, nulled:3651488, absent:32446638},
  {year:2026, turn:'1º turno', c1:'Flávio Bolsonaro', p1:'PL', v1:56104268, pct1:47.03, c2:'Luiz Inácio Lula da Silva', p2:'PT', v2:53876617, pct2:45.16, valid:125272513, blank:2300781, nulled:3674149, absent:null}
];

const RUNOFFS = [
  ['AC','Mailza Assis','Alan Rick'],['AM','Omar Aziz','Professora Maria do Carmo'],['DF','Celina Leão','Leandro Grass'],
  ['ES','Lorenzo Pazolini','Ricardo Ferraço'],['RN','Allyson','Cadu de Lula'],['RJ','Douglas Ruas','Eduardo Paes'],['TO','Professora Dorinha','Vicentinho Júnior']
];

const POLLS = [
  {name:'Datafolha', date:'1–3 out.', lula:47, flavio:46, note:'votos totais • pré-1º turno'},
  {name:'Quaest', date:'2–3 out.', lula:42, flavio:44, note:'votos totais • empate técnico'},
  {name:'PoderData/AYA', date:'30 set.–2 out.', lula:46, flavio:46, note:'empate técnico'}
];

const STATES = [
 ['AC','Rio Branco',-9.97499,-67.8243],['AL','Maceió',-9.64985,-35.70895],['AP','Macapá',0.03493,-51.06939],['AM','Manaus',-3.1190,-60.0217],['BA','Salvador',-12.9777,-38.5016],['CE','Fortaleza',-3.7319,-38.5267],['DF','Brasília',-15.7939,-47.8828],['ES','Vitória',-20.3155,-40.3128],['GO','Goiânia',-16.6869,-49.2648],['MA','São Luís',-2.5307,-44.3068],['MT','Cuiabá',-15.6014,-56.0979],['MS','Campo Grande',-20.4697,-54.6201],['MG','Belo Horizonte',-19.9167,-43.9345],['PA','Belém',-1.4558,-48.4902],['PB','João Pessoa',-7.1195,-34.8450],['PR','Curitiba',-25.4284,-49.2733],['PE','Recife',-8.0476,-34.8770],['PI','Teresina',-5.0892,-42.8016],['RJ','Rio de Janeiro',-22.9068,-43.1729],['RN','Natal',-5.7945,-35.2110],['RS','Porto Alegre',-30.0346,-51.2177],['RO','Porto Velho',-8.7608,-63.8999],['RR','Boa Vista',2.8235,-60.6758],['SC','Florianópolis',-27.5954,-48.5480],['SP','São Paulo',-23.5505,-46.6333],['SE','Aracaju',-10.9472,-37.0731],['TO','Palmas',-10.1689,-48.3317]
];

const UF_NAMES = Object.fromEntries(STATES.map(s=>[s[0],s[1]]));
const stateOrder = STATES.map(s=>s[0]);
let current = deepClone(FALLBACK);
let configCache = null;
let chartInstance = null;
let map = null;
let mapMarkers = [];
let mapLineLayer = null;
let lastRaw = null;
let autoRefresh = true;
let lastRefreshAt = null;
let proxyUrl = new URLSearchParams(location.search).get('tseProxy') || '';


function deepClone(x){return JSON.parse(JSON.stringify(x));}
function fmtInt(n){return Number(n||0).toLocaleString('pt-BR');}
function fmtPct(n){return Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';}
function fmtPP(n){return Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' pp';}
function safeNum(v){if(v===null||v===undefined||v==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null;}
function firstNumber(obj, keys){for(const k of keys){if(obj && Object.prototype.hasOwnProperty.call(obj,k)){const n=safeNum(obj[k]);if(n!==null)return n;}}return null;}
function firstString(obj, keys){for(const k of keys){if(obj && typeof obj[k]==='string' && obj[k].trim())return obj[k].trim();}return null;}
function walkObjects(root, out=[]){
  if(root===null||root===undefined)return out;
  if(Array.isArray(root)){for(const x of root)walkObjects(x,out);return out;}
  if(typeof root==='object'){out.push(root);for(const v of Object.values(root))if(typeof v==='object')walkObjects(v,out);} return out;
}
function parseCandidateRows(json){
  const objects=walkObjects(json);
  const result=[];
  for(const o of objects){
    const name=firstString(o,['nm','nome','nomeCandidato','candidateName','candName']);
    const votes=firstNumber(o,['vap','vv','votos','qtVotos','votes','vlrVotos','v']);
    const pct=firstNumber(o,['pvap','pct','percentual','percent','percentVotes','p']);
    const party=firstString(o,['sgPartido','partido','siglaPartido','party','ps']);
    if(name && votes!==null && (pct!==null || votes>500)) result.push({name:name.replace(/\s+/g,' '),votes,pct,party:party||'—'});
  }
  const uniq=new Map();
  for(const x of result){const key=x.name+'|'+x.votes;if(!uniq.has(key))uniq.set(key,x);}
  return [...uniq.values()].sort((a,b)=>b.votes-a.votes).slice(0,20);
}
function parseTotals(json, candidates){
  const objects=walkObjects(json);
  let totalized=firstNumber(json,['pst','pctTotalizacao','percentualTotalizacao','percentualTotalizado','pctTotalizado']);
  let valid=firstNumber(json,['votosValidos','vv','validos','qtVotosValidos']);
  let blank=firstNumber(json,['votosBrancos','vb','brancos','qtVotosBrancos']);
  let nulled=firstNumber(json,['votosNulos','vn','nulos','qtVotosNulos']);
  if(totalized===null){
    for(const o of objects){totalized=firstNumber(o,['pst','pctTotalizacao','percentualTotalizacao']);if(totalized!==null&&totalized<=100)break;}
  }
  if(valid===null && candidates?.length) valid=candidates.reduce((s,c)=>s+c.votes,0);
  if(valid===0)valid=null;
  return {totalized,valid,blank,nulled};
}
async function fetchJson(url, timeout=9000){
  if(proxyUrl){ url=proxyUrl.replace(/\/$/,'')+'/?url='+encodeURIComponent(url); }
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  try{const r=await fetch(url,{cache:'no-store',signal:controller.signal,headers:{'Accept':'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}
  finally{clearTimeout(timer);}
}
async function getConfig(){
  if(configCache && Date.now()-configCache.loadedAt<120000)return configCache.data;
  const data=await fetchJson(TSE.config);
  configCache={data,loadedAt:Date.now()};return data;
}
function findEleicaoConfig(config, code){
  const all=config?.pl||[];
  for(const p of all){for(const e of (p.e||[])){if(String(e.cd)===String(code))return {pleito:p,e};}}
  return null;
}
async function resolve2026Codes(){
  const cfg=await getConfig();
  const presidential=findEleicaoConfig(cfg,6257);
  const state=findEleicaoConfig(cfg,6259);
  if(!presidential||!state)throw new Error('configuração 2026 não encontrada');
  return {pres1:'6257',pres2:presidential.e.cdt2||'6258',state1:'6259',state2:state.e.cdt2||'6260'};
}
function resultUrl(scope, officeCode, electionCode){return `${TSE.base}/ele2026/${electionCode}/dados/${scope}/${scope}-c${String(officeCode).padStart(4,'0')}-e${String(electionCode).padStart(5,'0')}-u.json`;}
function stateResultUrl(uf, officeCode, electionCode){return `${TSE.base}/ele2026/${electionCode}/dados/${uf.toLowerCase()}/${uf.toLowerCase()}-c${String(officeCode).padStart(4,'0')}-e${String(electionCode).padStart(5,'0')}-u.json`;}

async function loadLivePresident(){
  try{
    const codes=await resolve2026Codes();
    let turn='1';let code=codes.pres1;let url=resultUrl('br',1,code);
    let json=await fetchJson(url);
    let cand=parseCandidateRows(json);
    // Quando o payload do 2º turno aparecer no ambiente oficial, passa a preferi-lo automaticamente.
    try{const j2=await fetchJson(resultUrl('br',1,codes.pres2));const c2=parseCandidateRows(j2);if(c2.length>=2){json=j2;cand=c2;code=codes.pres2;turn='2';url=resultUrl('br',1,code);}}catch(_){/* 2º turno ainda indisponível */}
    if(cand.length<2)throw new Error('payload recebido sem candidatos identificáveis');
    const totals=parseTotals(json,cand);
    current.turn=turn;current.source='tse-live';current.endpoint=url;current.raw=json;lastRaw=json;
    current.totalized=totals.totalized??current.totalized;current.valid=totals.valid??current.valid;current.blank=totals.blank??current.blank;current.nulled=totals.nulled??current.nulled;
    current.candidates=cand.slice(0,2).map((x,i)=>({name:x.name,party:x.party|| (i===0?'PL':'PT'),votes:x.votes,pct:x.pct??((x.votes/current.valid)*100),color:i===0?'red':'blue',sub:`${i+1}º colocado • TSE`}));
    localStorage.setItem('eleitora-last-live', JSON.stringify({...current,raw:undefined}));
    return true;
  }catch(e){
    current.source='fallback';current.raw={error:e.message,fallback:true,generated:new Date().toISOString()};lastRaw=current.raw;return false;
  }
}
async function loadLiveState(uf, officeCode=3, second=false){
  try{
    const codes=await resolve2026Codes();
    const e=second?codes.state2:codes.state1;
    const json=await fetchJson(stateResultUrl(uf,officeCode,e));
    const cand=parseCandidateRows(json);const totals=parseTotals(json,cand);
    return {uf,candidates:cand.slice(0,12),totals,raw:json,url:stateResultUrl(uf,officeCode,e)};
  }catch(e){return null;}
}

function loadCached(){
  try{const raw=localStorage.getItem('eleitora-last-live');if(!raw)return;const cached=JSON.parse(raw);if(cached&&cached.candidates?.length>=2){current={...current,...cached};}}catch(_){}
}
function renderMetrics(){
  const c=current.candidates[0],d=current.candidates[1];
  const diffPct=Math.abs((c?.pct||0)-(d?.pct||0));const diffVotes=Math.abs((c?.votes||0)-(d?.votes||0));
  document.getElementById('mTotalized').textContent=current.totalized==null?'—':fmtPct(current.totalized);
  document.getElementById('mTotalBar').style.width=`${Math.min(100,current.totalized||0)}%`;
  document.getElementById('mValid').textContent=fmtInt(current.valid);document.getElementById('mBlank').textContent=fmtInt(current.blank);document.getElementById('mNull').textContent=fmtInt(current.nulled);
  document.getElementById('mDiff').textContent=fmtPP(diffPct);document.getElementById('mDiffVotes').textContent=`${fmtInt(diffVotes)} votos`;
  const when=current.updatedAt?new Date(current.updatedAt):new Date();document.getElementById('mUpdated').textContent=`última leitura: ${when.toLocaleString('pt-BR')}`;document.getElementById('timestamp').textContent=`atualizado ${when.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
  document.getElementById('cand1Name').textContent=c?.name||'—';document.getElementById('cand1Party').textContent=c?.party||'—';document.getElementById('cand1Sub').textContent=c?.sub||'—';document.getElementById('cand1Pct').textContent=c?fmtPct(c.pct):'—';document.getElementById('cand1Votes').textContent=c?`${fmtInt(c.votes)} votos`:'—';document.getElementById('cand1Bar').style.width=`${Math.max(0,Math.min(100,c?.pct||0))}%`;
  document.getElementById('cand2Name').textContent=d?.name||'—';document.getElementById('cand2Party').textContent=d?.party||'—';document.getElementById('cand2Sub').textContent=d?.sub||'—';document.getElementById('cand2Pct').textContent=d?fmtPct(d.pct):'—';document.getElementById('cand2Votes').textContent=d?`${fmtInt(d.votes)} votos`:'—';document.getElementById('cand2Bar').style.width=`${Math.max(0,Math.min(100,d?.pct||0))}%`;
  document.getElementById('raceTitle').textContent=`${c?.name||'—'} × ${d?.name||'—'}`;document.getElementById('raceConcentration').textContent=`Os dois concentram ${fmtPct((c?.pct||0)+(d?.pct||0))} dos votos válidos.`;
  document.getElementById('payloadMeta').textContent=current.source==='tse-live'?'TSE • LIVE':'fallback • snapshot';
  document.getElementById('rawPayload').textContent=JSON.stringify(lastRaw||{},null,2);
  document.getElementById('liveText').textContent=current.source==='tse-live'?'TSE ONLINE':'MODO FALLBACK';document.querySelector('.live-dot').classList.toggle('off',current.source!=='tse-live');
}
function renderHistory(){
  const wrap=document.getElementById('historyCards');wrap.innerHTML='';
  HISTORY.forEach(h=>{const el=document.createElement('article');el.className='history-card';el.innerHTML=`<div class="history-year">${h.year}</div><div class="history-turn">${h.turn}</div><div class="history-bars"><div class="hbar red"><div class="hline"><span>${h.c1} <small>${h.p1}</small></span><span>${fmtPct(h.pct1)}</span></div><div class="htrack"><i style="width:${h.pct1}%"></i></div></div><div class="hbar blue"><div class="hline"><span>${h.c2} <small>${h.p2}</small></span><span>${fmtPct(h.pct2)}</span></div><div class="htrack"><i style="width:${h.pct2}%"></i></div></div></div><div class="history-footer"><span>válidos ${fmtInt(h.valid)}</span><span>brancos ${fmtPct(h.blank/h.valid*100)}</span><span>nulos ${fmtPct(h.nulled/h.valid*100)}</span></div>`;wrap.appendChild(el);});
}
function renderMiniStates(){
  const wrap=document.getElementById('miniStateList');wrap.innerHTML='';
  const counts={Flávio:0,Lula:0};stateOrder.forEach(uf=>counts[current.stateWinners?.[uf]||'—']=(counts[current.stateWinners?.[uf]||'—']||0)+1);
  ['Flávio','Lula'].forEach(w=>{const el=document.createElement('div');el.className='state-pill';el.innerHTML=`<b><i class="state-dot ${w==='Flávio'?'red':'blue'}"></i>${w}</b><small>${counts[w]} UFs</small>`;wrap.appendChild(el);});
  ['Norte','Nordeste','Centro-Oeste','Sudeste','Sul'].forEach(r=>{const el=document.createElement('div');el.className='state-pill';el.innerHTML=`<b>${r}</b><small>${r==='Nordeste'?'Lula domina':'clique no mapa'}</small>`;wrap.appendChild(el);});
}
function renderSecond(){
  const wrap=document.getElementById('runoffBadges');wrap.innerHTML='';RUNOFFS.forEach(x=>{const b=document.createElement('span');b.className='uf-badge';b.textContent=x[0];b.title=`${x[1]} × ${x[2]}`;wrap.appendChild(b);});
  document.getElementById('pollList').innerHTML=POLLS.map(p=>`<div class="poll-item"><div class="poll-name">${p.name} <span class="muted">${p.date}</span></div><div class="poll-values"><span>Lula <b>${p.lula}%</b></span><span>Flávio <b>${p.flavio}%</b></span></div></div>`).join('');
}
function initChart(){
  const ctx=document.getElementById('historyChart').getContext('2d');
  if(chartInstance)chartInstance.destroy();
  const labels=HISTORY.map(h=>`${h.year} • ${h.turn}`);
  const data1=HISTORY.map(h=>h.pct1),data2=HISTORY.map(h=>h.pct2);
  chartInstance=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Candidato 1',data:data1,borderWidth:2,tension:.35,pointRadius:3},{label:'Candidato 2',data:data2,borderWidth:2,tension:.35,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:getComputedStyle(document.documentElement).getPropertyValue('--muted'),boxWidth:10,usePointStyle:true,font:{size:10}}}},scales:{x:{ticks:{color:getComputedStyle(document.documentElement).getPropertyValue('--muted'),font:{size:9}},grid:{color:'rgba(255,255,255,.04)'}},y:{min:0,max:60,ticks:{color:getComputedStyle(document.documentElement).getPropertyValue('--muted'),font:{size:9},callback:v=>v+'%'},grid:{color:'rgba(255,255,255,.05)'}}}}});
}
function winnerColor(uf){return (current.stateWinners?.[uf]==='Lula')?'#4da3ff':'#ff466e';}
function initMap(){
  if(map)return;
  map=L.map('mapCanvas',{zoomControl:true,minZoom:3,maxZoom:8,scrollWheelZoom:true}).setView([-14.2,-53.0],4.25);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(map);
  drawMap();
}
function drawMap(){
  if(!map)return;
  mapMarkers.forEach(m=>m.remove());mapMarkers=[];
  if(mapLineLayer){mapLineLayer.remove();mapLineLayer=null;}
  const coords=STATES.map(s=>[s[2],s[3]]);
  mapLineLayer=L.polyline(coords,{color:'rgba(124,92,255,.3)',weight:1,dashArray:'4 8'}).addTo(map);
  STATES.forEach(([uf,capital,lat,lng])=>{
    const color=winnerColor(uf);const icon=L.divIcon({className:'custom-marker',html:`<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,.82);box-shadow:0 0 0 7px ${color}1f,0 0 28px ${color}66"></div>`,iconSize:[16,16],iconAnchor:[8,8]});
    const marker=L.marker([lat,lng],{icon}).addTo(map);marker.bindPopup(`<div class="popup-title">${uf} • ${capital}</div><div class="popup-sub">1º turno • líder: <b>${current.stateWinners?.[uf]||'—'}</b></div><button class="popup-btn" data-uf="${uf}">Carregar dados do TSE</button>`);marker.on('popupopen',e=>{const btn=e.popup.getElement().querySelector('[data-uf]');btn?.addEventListener('click',()=>loadStateDetails(uf));});mapMarkers.push(marker);
  });
  document.getElementById('mapStatus').textContent=current.source==='tse-live'?'mapa sincronizado com TSE • toque em uma UF':'mapa em modo snapshot • toque em uma UF';
  renderStateTable();
}
async function loadStateDetails(uf){
  const office=document.getElementById('officeSelect').value;
  const codes={governor:[3,false],senator:[5,false],federalDeputy:[6,false],stateDeputy:[7,false]}[office];
  if(!codes){toast('Presidente usa o placar nacional.');return;}
  const second=RUNOFFS.some(x=>x[0]===uf)&&office==='governor';
  const r=await loadLiveState(uf,codes[0],second);
  if(!r){toast(`Não foi possível ler o TSE para ${uf}.`);return;}
  const top=r.candidates.slice(0,5).map((c,i)=>`${i+1}. ${c.name} — ${c.pct==null?'—':fmtPct(c.pct)} (${fmtInt(c.votes)})`).join('\n');
  document.getElementById('rawPayload').textContent=JSON.stringify(r.raw,null,2);
  document.getElementById('payloadMeta').textContent=`TSE • ${uf} • ${office}`;
  toast(`${uf}: dados do TSE carregados.`); 
  alert(`${uf} • ${UF_NAMES[uf]}\n\n${top||'Nenhum candidato identificado pelo parser.'}`);
}
function renderStateTable(){
  const q=(document.getElementById('stateSearch').value||'').toLowerCase();const wrap=document.getElementById('stateTable');wrap.innerHTML='';
  STATES.filter(s=>s[0].toLowerCase().includes(q)||s[1].toLowerCase().includes(q)).forEach(([uf,capital])=>{const winner=current.stateWinners?.[uf]||'—';const row=document.createElement('div');row.className='state-row';row.innerHTML=`<span class="uf">${uf}</span><div><div class="state-name">${capital}</div><div class="state-meta">Presidente • 1º turno</div></div><span class="state-winner" style="color:${winnerColor(uf)}">${winner}</span>`;wrap.appendChild(row);});
}
function renderSources(){
  const sources=[
    ['TSE • Resultados','Fonte primária da totalização em tempo real e consulta por UF/município.',TSE.resultApp],
    ['TSE • Dados Abertos','CSV/ZIP com resultados, boletins de urna e outros conjuntos públicos.',TSE.openData],
    ['TSE • DivulgaCandContas','Candidaturas, partidos e prestação de contas eleitorais.',TSE.divCands],
    ['IBGE • Localidades','Base territorial para cruzamentos por estado e município.','https://servicodados.ibge.gov.br/api/v1/localidades/estados']
  ];
  document.getElementById('sourcesGrid').innerHTML=sources.map((s,i)=>`<a class="source-card" href="${s[2]}" target="_blank" rel="noopener"><div class="source-icon">0${i+1}</div><h4>${s[0]}</h4><p>${s[1]}</p></a>`).join('');
}
function renderCountdown(){
  const target=new Date('2026-10-25T08:00:00-03:00');const now=new Date();let ms=Math.max(0,target-now);const d=Math.floor(ms/86400000);ms%=86400000;const h=Math.floor(ms/3600000);ms%=3600000;const m=Math.floor(ms/60000);const s=Math.floor(ms/1000)%60;document.querySelector('#countdown span').textContent=`${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
}
function setupEvents(){
  document.querySelectorAll('.nav-tab,[data-section]').forEach(el=>el.addEventListener('click',()=>document.getElementById(el.dataset.section)?.scrollIntoView({behavior:'smooth'})));
  document.getElementById('refreshBtn').addEventListener('click',()=>refresh(true));
  document.getElementById('themeBtn').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('eleitora-theme',document.documentElement.classList.contains('light')?'light':'dark');initChart();});
  document.getElementById('shareBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copiado.');}catch(_){toast('Copie o endereço do navegador para compartilhar.');}});
  document.getElementById('stateSearch').addEventListener('input',renderStateTable);
  document.getElementById('officeSelect').addEventListener('change',()=>{document.querySelector('.compact-head h2').textContent=document.getElementById('officeSelect').selectedOptions[0].textContent+' • 1º turno';});
  document.getElementById('ufSelect').addEventListener('change',()=>{const uf=document.getElementById('ufSelect').value;if(uf!=='BR')loadStateDetails(uf);});
  document.getElementById('downloadSnapshot').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({generatedAt:new Date().toISOString(),data:current},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='eleitora-snapshot-2026.json';a.click();URL.revokeObjectURL(a.href);});
  document.getElementById('downloadCsv').addEventListener('click',()=>{const rows=[['UF','Capital','Liderança 2026']];STATES.forEach(([uf,capital])=>rows.push([uf,capital,current.stateWinners?.[uf]||'—']));const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='eleitora-estados-2026.csv';a.click();URL.revokeObjectURL(a.href);});
  document.getElementById('autoBtn').addEventListener('click',()=>{autoRefresh=!autoRefresh;document.getElementById('autoBtn').style.opacity=autoRefresh?'1':'.45';toast(autoRefresh?'Atualização automática ligada.':'Atualização automática pausada.');});
}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800);}
async function refresh(force=false){
  if(!force && lastRefreshAt && Date.now()-lastRefreshAt<15000)return;
  lastRefreshAt=Date.now();document.getElementById('liveText').textContent='CONSULTANDO TSE';
  const before=current.source;
  const ok=await loadLivePresident();
  if(ok){ current.updatedAt=new Date().toISOString(); current.dataFreshness='live'; }
  else if(before!=='tse-live'){ current.updatedAt=current.updatedAt||FALLBACK.updatedAt; current.dataFreshness='snapshot'; }
  else { current.updatedAt=current.updatedAt||FALLBACK.updatedAt; current.dataFreshness='snapshot'; }
  renderMetrics();
  if(!ok)toast('TSE indisponível no momento — mantendo snapshot.'); else toast('Painel atualizado pelo TSE.');
  renderStateTable();renderMiniStates();drawMap();
}
function populateUf(){const s=document.getElementById('ufSelect');STATES.forEach(x=>{const o=document.createElement('option');o.value=x[0];o.textContent=`${x[0]} • ${x[1]}`;s.appendChild(o);});}
function start(){
  loadCached();
  if(localStorage.getItem('eleitora-theme')==='light')document.documentElement.classList.add('light');
  populateUf();renderSecond();renderHistory();renderSources();renderMetrics();renderMiniStates();initChart();initMap();setupEvents();renderCountdown();setInterval(renderCountdown,1000);refresh();
  setInterval(()=>{if(autoRefresh)refresh(false);},30000);
}
start();
