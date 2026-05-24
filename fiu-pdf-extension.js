(function(){
  const $=id=>document.getElementById(id);
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const safe=s=>clean(s).replace(/[^a-z0-9._-]+/gi,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'fiu-transfer';
  function parseXml(){
    const xmlText=document.querySelector('#statementFiuTransferBody .xmlbox')?.textContent||'';
    const data={raw:xmlText};
    if(!xmlText.trim())return data;
    try{
      const xml=new DOMParser().parseFromString(xmlText,'application/xml');
      ['case_reference','decision','workflow_status','transaction_date','description','transaction_type','indicators','mlco_rationale','source'].forEach(k=>data[k]=clean(xml.querySelector(k)?.textContent||''));
      const amount=xml.querySelector('amount');
      data.amount=clean(amount?.textContent||'');
      data.currency=clean(amount?.getAttribute('currency')||'AWG');
    }catch(e){}
    return data;
  }
  function ensureJsPdf(){
    return new Promise((resolve,reject)=>{
      if(window.jspdf&&window.jspdf.jsPDF)return resolve(window.jspdf.jsPDF);
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload=()=>resolve(window.jspdf.jsPDF);
      s.onerror=()=>reject(new Error('PDF generator could not be loaded.'));
      document.head.appendChild(s);
    });
  }
  function row(doc,label,value,y){
    const left=42,right=553,labelW=170,valX=left+labelW,w=right-valX;
    const lines=doc.splitTextToSize(clean(value||'N/A'),w-16);
    const h=Math.max(28,16+lines.length*12);
    doc.rect(left,y,labelW,h); doc.rect(valX,y,right-valX,h);
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text(label,left+8,y+18);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.text(lines,valX+8,y+18);
    return y+h;
  }
  function section(doc,title,y){
    doc.setFillColor(0,0,0); doc.rect(42,y,511,22,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(title,50,y+15);
    doc.setTextColor(0,0,0);
    return y+22;
  }
  async function downloadPdf(){
    const d=parseXml();
    const jsPDF=await ensureJsPdf();
    const doc=new jsPDF({unit:'pt',format:'a4'});
    const pageW=595.28;
    doc.setProperties({title:'FIU transfer package '+(d.case_reference||''),subject:'Fictional demo FIU reporting package',creator:'AXIOMA Trust TM Demo'});
    doc.setFillColor(0,0,0); doc.rect(42,42,511,30,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.text('MELDFORMULIER ONGEBRUIKELIJKE TRANSACTIES',pageW/2,62,{align:'center'});
    doc.setTextColor(0,0,0); doc.rect(42,72,511,106);
    doc.setFillColor(35,169,214); doc.rect(220,96,68,68,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.text('FIU',254,136,{align:'center'});
    doc.setTextColor(0,0,0); doc.setFontSize(15); doc.text('Financial Intelligence Unit of Aruba',320,123);
    doc.setTextColor(26,166,211); doc.text('MOT',320,143);
    doc.setTextColor(0,0,0);
    let y=198;
    y=section(doc,'Naam melder',y);
    y=row(doc,'Handelsnaam:','Axioma',y);
    y=row(doc,'Meldingsnummer:',d.case_reference||'N/A',y);
    y=section(doc,'Transactiegegevens',y+14);
    y=row(doc,'Datum transactie:',d.transaction_date||'N/A',y);
    y=row(doc,'Transactietype:',d.transaction_type||'N/A',y);
    y=row(doc,'Bedrag / valuta:',(d.amount?Number(d.amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):'N/A')+' '+(d.currency||'AWG'),y);
    y=row(doc,'Specificatie transactie:',d.description||'N/A',y);
    y=row(doc,'Indicator(en):',d.indicators||'N/A',y);
    y=section(doc,'MLCO beoordeling',y+14);
    y=row(doc,'Beslissing:',d.decision||'N/A',y);
    y=row(doc,'Workflowstatus:',d.workflow_status||'N/A',y);
    y=row(doc,'Rationale:',d.mlco_rationale||'N/A',y);
    y=section(doc,'Demo-controle',y+14);
    y=row(doc,'Status:','Fictional demo package only. No real FIU submission is performed from this page.',y);
    doc.setFontSize(8); doc.setTextColor(90,90,90); doc.text('Generated from saved bank-statement MLCO case. Page 1 of 1',553,805,{align:'right'});
    doc.save((safe(d.case_reference)||'FIU-transfer')+'.pdf');
  }
  function addButton(){
    const xmlBtn=$('stmtDownloadTransferXml');
    const body=$('statementFiuTransferBody');
    if(!xmlBtn||!body||$('stmtDownloadTransferPdf'))return;
    const b=document.createElement('button');
    b.className='btn green';
    b.id='stmtDownloadTransferPdf';
    b.textContent='Download FIU PDF';
    b.onclick=downloadPdf;
    xmlBtn.insertAdjacentElement('afterend',b);
    xmlBtn.insertAdjacentText('afterend',' ');
  }
  const obs=new MutationObserver(addButton);
  obs.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('[data-prepare-fiu]'))setTimeout(addButton,120)},true);
  setTimeout(addButton,500);
})();
