(function(){
  const STORE_KEY='axioma_statement_mlco_reviews_v1';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  const money=n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' AWG';
  const now=()=>new Date().toLocaleString();
  const nextDate=()=>{const d=new Date();d.setDate(d.getDate()+5);return d.toISOString().slice(0,10)};
  function saved(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'[]')}catch(e){return[]}}
  function write(items){localStorage.setItem(STORE_KEY,JSON.stringify(items));renderCasesQueue()}
  function byId(id){return saved().find(x=>x.id===id)}
  function isActive(r){return r.decision==='FIU report ready'||r.decision==='Under MLCO review'}
  function isResolved(r){return !isActive(r)&&!!(r.decision||r.workflowStatus)}
  function status(msg){const s=$('statementMlcoCasesStatus');if(s){s.style.display='block';s.innerHTML=msg}}
  function xml(r){return `<?xml version="1.0" encoding="UTF-8"?>\n<fiu_transfer_demo>\n  <source>Bank statement post-transaction monitoring</source>\n  <case_reference>${esc(r.id)}</case_reference>\n  <decision>${esc(r.decision)}</decision>\n  <workflow_status>${esc(r.workflowStatus||'')}</workflow_status>\n  <transaction_date>${esc(r.date)}</transaction_date>\n  <description>${esc(r.desc)}</description>\n  <transaction_type>${esc(r.type)}</transaction_type>\n  <amount currency="AWG">${Number(r.amount||0).toFixed(2)}</amount>\n  <indicators>${esc((r.ind||[]).join(','))}</indicators>\n  <mlco_rationale>${esc(r.why||'')}</mlco_rationale>\n</fiu_transfer_demo>`}
  function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/xml'}));a.download=name;a.click()}
  function ensurePanel(){
    const cases=$('cases'); if(!cases) return null;
    let panel=$('statementMlcoCasesQueue');
    if(panel) return panel;
    const html=`<br><div id="statementMlcoCasesQueue" class="card"><div class="head">Bank statement MLCO follow-up queue</div><div class="body"><div id="statementMlcoCasesStatus" class="notice" style="display:none"></div><p class="muted">Saved post-transaction review items that still require MLCO follow-up or FIU transfer preparation.</p></div><div class="body" style="padding:0"><table class="table" id="statementMlcoCasesTable"></table></div></div><br><div id="statementFiuTransferPanel" class="card" style="display:none"><div class="head">FIU transfer preparation</div><div class="body" id="statementFiuTransferBody"></div></div><br><div id="statementResolvedCasesQueue" class="card"><div class="head">Resolved / cleared bank-statement cases</div><div class="body" style="padding:0"><table class="table" id="statementResolvedCasesTable"></table></div></div>`;
    cases.insertAdjacentHTML('beforeend',html);
    return $('statementMlcoCasesQueue');
  }
  function badge(r){
    const d=r.decision||'Pending';
    const c=d==='FIU report ready'?'p-red':d==='Under MLCO review'?'p-amber':d==='Reported to FIU'?'p-purple':'p-green';
    return `<span class="pill ${c}">${esc(d)}</span>`;
  }
  function dueLabel(r){
    if(r.decision==='FIU report ready') return '<span class="pill p-red">Ready for FIU transfer</span>';
    if(r.decision==='Under MLCO review') return `<span class="pill p-amber">Follow-up ${esc(r.followUp||'not set')}</span>`;
    if(r.decision==='Reported to FIU') return '<span class="pill p-purple">Reported / cleared</span>';
    return '<span class="pill p-green">Cleared</span>';
  }
  function updateCase(id, mutator){
    const items=saved();
    const ix=items.findIndex(v=>v.id===id);
    if(ix<0) return null;
    mutator(items[ix]);
    items[ix].updatedAt=now();
    write(items);
    return items[ix];
  }
  function markReady(id){
    const r=updateCase(id,x=>{x.decision='FIU report ready';x.workflowStatus='FIU package queue';x.clearedAt='';x.reportedAt='';x.followUp=x.followUp||nextDate()});
    if(r) status(`<b>${esc(r.desc)}</b> moved to FIU transfer preparation queue.`)
  }
  function returnReview(id){
    const r=updateCase(id,x=>{x.decision='Under MLCO review';x.workflowStatus='Follow-up pending';x.followUp=x.followUp||nextDate();x.clearedAt='';x.reportedAt=''});
    if(r) status(`<b>${esc(r.desc)}</b> returned to MLCO follow-up review.`)
  }
  function clearCase(id){
    const r=updateCase(id,x=>{x.decision='No report';x.workflowStatus='Cleared from MLCO queue - no FIU report';x.clearedAt=now();x.reportedAt=''});
    if(r) status(`<b>${esc(r.desc)}</b> cleared from the active MLCO queue.`)
  }
  function markReported(id){
    const r=updateCase(id,x=>{x.decision='Reported to FIU';x.workflowStatus='Reported to FIU - cleared from queue';x.reportedAt=now();x.clearedAt=now()});
    if(r) status(`<b>${esc(r.desc)}</b> marked as reported to FIU and cleared from the active queue.`)
  }
  function deleteSaved(id){
    const r=byId(id);
    write(saved().filter(x=>x.id!==id));
    if(r) status(`<b>${esc(r.desc)}</b> removed from the demo register.`)
  }
  function actions(r){
    if(r.decision==='FIU report ready'){
      return `<button class="btn primary" data-prepare-fiu="${esc(r.id)}">Prepare FIU transfer</button> <button class="btn green" data-mark-reported="${esc(r.id)}">Mark reported</button> <button class="btn" data-clear-case="${esc(r.id)}">Clear / no report</button> <button class="btn amber" data-return-review="${esc(r.id)}">Return to review</button>`;
    }
    if(r.decision==='Under MLCO review'){
      return `<button class="btn amber" data-open-mlco-saved="${esc(r.id)}">Open review</button> <button class="btn primary" data-mark-ready="${esc(r.id)}">Move to FIU report</button> <button class="btn" data-clear-case="${esc(r.id)}">Clear / no report</button>`;
    }
    return `<button class="btn amber" data-return-review="${esc(r.id)}">Reopen review</button> <button class="btn" data-delete-saved="${esc(r.id)}">Remove demo item</button>`;
  }
  function row(r, resolved){
    return `<tr><td><b>${esc(r.id)}</b><br><span class="muted">Saved ${esc(r.updatedAt||'')}</span>${r.reportedAt?`<br><span class="muted">Reported ${esc(r.reportedAt)}</span>`:''}${r.clearedAt?`<br><span class="muted">Cleared ${esc(r.clearedAt)}</span>`:''}</td><td><b>${esc(r.desc)}</b><br><span class="muted">${esc(r.date)} · ${esc(r.type)} · row ${esc(r.row)}</span></td><td class="right"><b>${money(r.amount)}</b></td><td>${badge(r)}<br><span class="muted">${esc(r.workflowStatus||'')}</span></td><td>${dueLabel(r)}</td><td>${actions(r)}</td></tr>`;
  }
  function renderCasesQueue(){
    const q=ensurePanel(); if(!q) return;
    const items=saved();
    const active=items.filter(isActive);
    const resolved=items.filter(isResolved).slice(0,12);
    const t=$('statementMlcoCasesTable');
    if(t){
      t.innerHTML='<thead><tr><th>Saved case</th><th>Transaction</th><th class="right">Amount</th><th>Decision</th><th>Follow-up / due</th><th>MLCO action</th></tr></thead><tbody>'+(active.length?active.map(r=>row(r,false)).join(''):`<tr><td colspan="6"><span class="muted">No saved bank-statement MLCO items requiring review or FIU transfer.</span></td></tr>`)+'</tbody>';
    }
    const rt=$('statementResolvedCasesTable');
    if(rt){
      rt.innerHTML='<thead><tr><th>Saved case</th><th>Transaction</th><th class="right">Amount</th><th>Decision</th><th>Status</th><th>MLCO action</th></tr></thead><tbody>'+(resolved.length?resolved.map(r=>row(r,true)).join(''):`<tr><td colspan="6"><span class="muted">No cleared or reported bank-statement cases yet.</span></td></tr>`)+'</tbody>';
    }
    document.querySelectorAll('[data-prepare-fiu]').forEach(b=>b.onclick=()=>prepareFiu(b.dataset.prepareFiu));
    document.querySelectorAll('[data-open-mlco-saved]').forEach(b=>b.onclick=()=>openSavedReview(b.dataset.openMlcoSaved));
    document.querySelectorAll('[data-mark-ready]').forEach(b=>b.onclick=()=>markReady(b.dataset.markReady));
    document.querySelectorAll('[data-return-review]').forEach(b=>b.onclick=()=>returnReview(b.dataset.returnReview));
    document.querySelectorAll('[data-clear-case]').forEach(b=>b.onclick=()=>clearCase(b.dataset.clearCase));
    document.querySelectorAll('[data-mark-reported]').forEach(b=>b.onclick=()=>markReported(b.dataset.markReported));
    document.querySelectorAll('[data-delete-saved]').forEach(b=>b.onclick=()=>deleteSaved(b.dataset.deleteSaved));
  }
  function prepareFiu(id){
    const r=byId(id); if(!r) return;
    const p=$('statementFiuTransferPanel'),body=$('statementFiuTransferBody'); if(!p||!body) return;
    p.style.display='block';
    const x=xml(r);
    body.innerHTML=`<div class="notice"><b>FIU transfer package prepared.</b><br>This simulated package was prepared from the saved bank-statement MLCO case. Final FIU submission remains a controlled MLCO action.</div><div class="row"><span>Case reference</span><span>${esc(r.id)}</span></div><div class="row"><span>Transaction</span><span>${esc(r.desc)}</span></div><div class="row"><span>Amount</span><span>${money(r.amount)}</span></div><div class="row"><span>Indicators</span><span>${esc((r.ind||[]).join(', '))}</span></div><br><button class="btn primary" id="stmtDownloadTransferXml">Download FIU XML</button> <button class="btn green" id="stmtSimulateFiuSubmit">Simulate FIU API handoff</button> <button class="btn green" id="stmtMarkReportedClear">Mark reported & clear</button> <button class="btn" id="stmtClearNoReport">Clear / no report</button> <button class="btn blue" id="stmtCloseTransferPanel">Close</button><br><br><div class="xmlbox">${esc(x)}</div>`;
    $('stmtDownloadTransferXml').onclick=()=>download('FIU-transfer-'+r.id+'.xml',x);
    $('stmtSimulateFiuSubmit').onclick=()=>{
      updateCase(id,x=>{x.workflowStatus='FIU transfer package prepared';x.preparedAt=now()});
      body.querySelector('.notice').innerHTML='<b>Simulated FIU API handoff prepared.</b><br>No real FIU submission was performed. Use Mark reported & clear after final MLCO approval.';
    };
    $('stmtMarkReportedClear').onclick=()=>{markReported(id);p.style.display='none'};
    $('stmtClearNoReport').onclick=()=>{clearCase(id);p.style.display='none'};
    $('stmtCloseTransferPanel').onclick=()=>p.style.display='none';
    p.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function openSavedReview(id){
    const nav=document.querySelector('[data-route="statementReview"]');
    if(nav) nav.click();
    setTimeout(()=>{
      const btn=document.querySelector(`[data-open-saved="${CSS.escape(id)}"]`);
      if(btn) btn.click();
    },150);
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-route="cases"]')) setTimeout(renderCasesQueue,80)},true);
  window.addEventListener('storage',renderCasesQueue);
  setInterval(()=>{if($('cases')&&$('cases').classList.contains('active'))renderCasesQueue()},1500);
  setTimeout(renderCasesQueue,300);
})();
