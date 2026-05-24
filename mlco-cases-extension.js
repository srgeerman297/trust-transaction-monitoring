(function(){
  const STORE_KEY='axioma_statement_mlco_reviews_v1';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  const money=n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' AWG';
  function saved(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'[]')}catch(e){return[]}}
  function write(items){localStorage.setItem(STORE_KEY,JSON.stringify(items));renderCasesQueue()}
  function byId(id){return saved().find(x=>x.id===id)}
  function xml(r){return `<?xml version="1.0" encoding="UTF-8"?>\n<fiu_transfer_demo>\n  <source>Bank statement post-transaction monitoring</source>\n  <case_reference>${esc(r.id)}</case_reference>\n  <decision>${esc(r.decision)}</decision>\n  <workflow_status>${esc(r.workflowStatus||'')}</workflow_status>\n  <transaction_date>${esc(r.date)}</transaction_date>\n  <description>${esc(r.desc)}</description>\n  <transaction_type>${esc(r.type)}</transaction_type>\n  <amount currency="AWG">${Number(r.amount||0).toFixed(2)}</amount>\n  <indicators>${esc((r.ind||[]).join(','))}</indicators>\n  <mlco_rationale>${esc(r.why||'')}</mlco_rationale>\n</fiu_transfer_demo>`}
  function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/xml'}));a.download=name;a.click()}
  function ensurePanel(){
    const cases=$('cases'); if(!cases) return null;
    let panel=$('statementMlcoCasesQueue');
    if(panel) return panel;
    const html=`<br><div id="statementMlcoCasesQueue" class="card"><div class="head">Bank statement MLCO follow-up queue</div><div class="body" style="padding:0"><table class="table" id="statementMlcoCasesTable"></table></div></div><br><div id="statementFiuTransferPanel" class="card" style="display:none"><div class="head">FIU transfer preparation</div><div class="body" id="statementFiuTransferBody"></div></div>`;
    cases.insertAdjacentHTML('beforeend',html);
    return $('statementMlcoCasesQueue');
  }
  function badge(r){
    const d=r.decision||'Pending';
    const c=d==='FIU report ready'?'p-red':d==='Under MLCO review'?'p-amber':'p-green';
    return `<span class="pill ${c}">${esc(d)}</span>`;
  }
  function dueLabel(r){
    if(r.decision==='FIU report ready') return '<span class="pill p-red">Ready for FIU transfer</span>';
    if(r.decision==='Under MLCO review') return `<span class="pill p-amber">Follow-up ${esc(r.followUp||'not set')}</span>`;
    return '<span class="pill p-green">Closed</span>';
  }
  function renderCasesQueue(){
    const q=ensurePanel(); if(!q) return;
    const t=$('statementMlcoCasesTable'); if(!t) return;
    const items=saved();
    const active=items.filter(r=>r.decision==='FIU report ready'||r.decision==='Under MLCO review');
    t.innerHTML='<thead><tr><th>Saved case</th><th>Transaction</th><th class="right">Amount</th><th>Decision</th><th>Follow-up / due</th><th>FIU transfer</th></tr></thead><tbody>'+(active.length?active.map(r=>`<tr><td><b>${esc(r.id)}</b><br><span class="muted">Saved ${esc(r.updatedAt||'')}</span></td><td><b>${esc(r.desc)}</b><br><span class="muted">${esc(r.date)} · ${esc(r.type)} · row ${esc(r.row)}</span></td><td class="right"><b>${money(r.amount)}</b></td><td>${badge(r)}<br><span class="muted">${esc(r.workflowStatus||'')}</span></td><td>${dueLabel(r)}</td><td>${r.decision==='FIU report ready'?`<button class="btn primary" data-prepare-fiu="${esc(r.id)}">Prepare FIU transfer</button>`:`<button class="btn amber" data-open-mlco-saved="${esc(r.id)}">Open review</button>`}</td></tr>`).join(''):`<tr><td colspan="6"><span class="muted">No saved bank-statement MLCO items requiring review or FIU transfer.</span></td></tr>`)+'</tbody>';
    document.querySelectorAll('[data-prepare-fiu]').forEach(b=>b.onclick=()=>prepareFiu(b.dataset.prepareFiu));
    document.querySelectorAll('[data-open-mlco-saved]').forEach(b=>b.onclick=()=>openSavedReview(b.dataset.openMlcoSaved));
  }
  function prepareFiu(id){
    const r=byId(id); if(!r) return;
    const p=$('statementFiuTransferPanel'),body=$('statementFiuTransferBody'); if(!p||!body) return;
    p.style.display='block';
    const x=xml(r);
    body.innerHTML=`<div class="notice"><b>FIU transfer package prepared.</b><br>This simulated package was prepared from the saved bank-statement MLCO case. Final FIU submission remains a controlled MLCO action.</div><div class="row"><span>Case reference</span><span>${esc(r.id)}</span></div><div class="row"><span>Transaction</span><span>${esc(r.desc)}</span></div><div class="row"><span>Amount</span><span>${money(r.amount)}</span></div><div class="row"><span>Indicators</span><span>${esc((r.ind||[]).join(', '))}</span></div><br><button class="btn primary" id="stmtDownloadTransferXml">Download FIU XML</button> <button class="btn green" id="stmtSimulateFiuSubmit">Simulate FIU API handoff</button> <button class="btn blue" id="stmtCloseTransferPanel">Close</button><br><br><div class="xmlbox">${esc(x)}</div>`;
    $('stmtDownloadTransferXml').onclick=()=>download('FIU-transfer-'+r.id+'.xml',x);
    $('stmtSimulateFiuSubmit').onclick=()=>{
      const items=saved(); const ix=items.findIndex(v=>v.id===id);
      if(ix>=0){items[ix].workflowStatus='FIU transfer package prepared';items[ix].preparedAt=new Date().toLocaleString();write(items)}
      body.querySelector('.notice').innerHTML='<b>Simulated FIU API handoff prepared.</b><br>No real FIU submission was performed. The case status was updated for the demo.';
    };
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
