(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  let refreshing=false;
  function activeView(){return document.querySelector('.view.active')?.id||''}
  function toast(msg){const t=$('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}}
  function currentFilters(){return{client:$('clientFilter')?.value||'all',clientText:$('clientFilter')?.selectedOptions?.[0]?.textContent||'All trust clients',status:$('statusFilter')?.value||'all',q:($('q')?.value||'').toLowerCase().trim()}}
  function rowMatches(row,f){
    const txt=row.textContent.toLowerCase();
    const statusOk=f.status==='all'||txt.includes(f.status.toLowerCase());
    const clientOk=f.client==='all'||txt.includes(f.clientText.toLowerCase());
    const qOk=!f.q||txt.includes(f.q);
    return statusOk&&clientOk&&qOk;
  }
  function applyTableFilter(tableId){
    const t=$(tableId);if(!t)return;
    const f=currentFilters();
    let visible=0;
    t.querySelectorAll('tbody tr').forEach(row=>{const ok=rowMatches(row,f);row.style.display=ok?'':'none';if(ok)visible++});
    return visible;
  }
  function applyCaseFilter(containerId){
    const el=$(containerId);if(!el)return;
    const f=currentFilters();
    let visible=0;
    el.querySelectorAll('.case').forEach(card=>{const ok=rowMatches(card,f);card.style.display=ok?'':'none';if(ok)visible++});
    return visible;
  }
  function getXmlData(){
    const x=$('xmlPreview')?.textContent||'';
    const pick=tag=>clean((x.match(new RegExp('<'+tag+'>([\\s\\S]*?)<\\/'+tag+'>','i'))||[])[1]||'');
    return{caseRef:pick('case')||pick('case_reference')||'CASE-DEMO',client:pick('client')||'Selected MLCO case',transaction:pick('transaction')||'Selected transaction',amount:pick('amount')||'0',indicators:pick('indicators')||'N/A'};
  }
  function renderXmlForFilter(){
    if(activeView()!=='xml')return;
    const f=currentFilters();
    const d=getXmlData();
    const status=f.status==='all'?'All statuses':f.status;
    const client=f.client==='all'?d.client:f.clientText;
    const xml=`<?xml version="1.0"?>\n<root>\n  <case>${esc(d.caseRef)}</case>\n  <client>${esc(client)}</client>\n  <status_filter>${esc(status)}</status_filter>\n  <transaction>${esc(d.transaction)}</transaction>\n  <amount>${esc(d.amount)}</amount>\n  <indicators>${esc(d.indicators)}</indicators>\n  <filter_note>Toolbar filter applied on XML/PDF package screen.</filter_note>\n</root>`;
    const preview=$('xmlPreview');if(preview)preview.textContent=xml;
    const pdfStatus=$('pdfStatus');if(pdfStatus)pdfStatus.innerHTML=`<b>Filter applied:</b> ${esc(status)}${f.client!=='all'?' · '+esc(f.clientText):''}. XML/PDF preview refreshed from the selected filter.`;
    let notice=$('xmlFilterNotice');
    if(!notice&&$('xml')){$('xml').querySelector('.notice')?.insertAdjacentHTML('afterend','<div id="xmlFilterNotice" class="notice"></div>');notice=$('xmlFilterNotice')}
    if(notice)notice.innerHTML=`<b>Package filter:</b> ${esc(status)}${f.client!=='all'?' for '+esc(f.clientText):''}. Use Generate full package to refresh from the selected MLCO case, or Download XML/PDF to export the filtered package shown below.`;
  }
  function downloadDomXml(){
    const xml=$('xmlPreview')?.textContent||'';if(!xml.trim())return false;
    const name=(getXmlData().caseRef||'fiu-package').replace(/[^a-z0-9._-]+/gi,'-')+'.xml';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([xml],{type:'application/xml'}));a.download=name;a.click();return true;
  }
  async function downloadDomPdf(){
    if(!($('xmlFilterNotice')&&activeView()==='xml'))return false;
    const d=getXmlData(),f=currentFilters();
    const jsPDF=window.jspdf&&window.jspdf.jsPDF;if(!jsPDF)return false;
    const doc=new jsPDF({unit:'pt',format:'a4'});
    doc.setFillColor(0,0,0);doc.rect(42,42,511,28,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text('MELDFORMULIER ONGEBRUIKELIJKE TRANSACTIES',297,61,{align:'center'});
    doc.setTextColor(0,0,0);doc.setFontSize(11);let y=100;
    function line(k,v){doc.setFont('helvetica','bold');doc.text(k,50,y);doc.setFont('helvetica','normal');doc.text(doc.splitTextToSize(clean(v||'N/A'),330),210,y);y+=34}
    line('Case reference:',d.caseRef);line('Client:',f.client==='all'?d.client:f.clientText);line('Status filter:',f.status==='all'?'All statuses':f.status);line('Transaction:',d.transaction);line('Amount:',d.amount+' AWG');line('Indicators:',d.indicators);line('Demo note:','Fictional XML/PDF package generated from the toolbar-filtered XML/PDF page. No real FIU submission is performed.');
    doc.save((d.caseRef||'fiu-package').replace(/[^a-z0-9._-]+/gi,'-')+'.pdf');return true;
  }
  function applyFilters(){
    const f=currentFilters();
    if(refreshing)return;
    if(activeView()!=='xml'){
      applyTableFilter('txTable');applyTableFilter('live');applyCaseFilter('casesList');applyCaseFilter('queue');
    }else{
      renderXmlForFilter();
    }
    if(f.status!=='all'||f.client!=='all'||f.q)toast('Filter applied: '+(f.status==='all'?'All statuses':f.status));
  }
  function refreshActive(){
    if(refreshing)return;refreshing=true;
    const active=document.querySelector('.nav button.active');
    if(active)active.click();
    setTimeout(()=>{refreshing=false;applyFilters()},120);
  }
  function wire(){
    const status=$('statusFilter'),client=$('clientFilter'),q=$('q');
    if(status&&!status.dataset.filterFix){status.dataset.filterFix='1';status.addEventListener('change',refreshActive)}
    if(client&&!client.dataset.filterFix){client.dataset.filterFix='1';client.addEventListener('change',refreshActive)}
    if(q&&!q.dataset.filterFix){q.dataset.filterFix='1';q.addEventListener('input',()=>setTimeout(applyFilters,80))}
    document.addEventListener('click',e=>{if(e.target.closest('[data-route]'))setTimeout(applyFilters,180)},true);
    const dx=$('downloadXmlBtn');if(dx&&!dx.dataset.filterFix){dx.dataset.filterFix='1';dx.addEventListener('click',e=>{if($('xmlFilterNotice')&&activeView()==='xml'){e.preventDefault();e.stopImmediatePropagation();downloadDomXml()}},true)}
    const dp=$('downloadPdfBtn');if(dp&&!dp.dataset.filterFix){dp.dataset.filterFix='1';dp.addEventListener('click',async e=>{if($('xmlFilterNotice')&&activeView()==='xml'){const ok=await downloadDomPdf();if(ok){e.preventDefault();e.stopImmediatePropagation()}}},true)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
  setTimeout(wire,400);
})();
