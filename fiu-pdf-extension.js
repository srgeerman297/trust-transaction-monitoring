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
  function normalizeDate(v){
    const s=clean(v);
    const m=s.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    return m?`${m[2]}-${m[3]}-${m[1]}`:s||'N/A';
  }
  function normalizeTime(v){
    const s=clean(v);
    const m=s.match(/\b(\d{2}:\d{2})\b/);
    return m?m[1]:'N/A';
  }
  function amountDisplay(d){
    const n=Number(String(d.amount||'').replace(/,/g,''));
    return (Number.isFinite(n)?n.toFixed(2):clean(d.amount||'0.00'))+' '+(d.currency||'AWG');
  }
  function defaultSubject(){
    return {short:'R.M. Croes',role:'Opdrachtgever',isClient:'Klant',last:'Croes',married:'',initials:'R.M.',first:'Roberto Miguel',gender:'man',birth:'04-18-1978',birthCity:'Oranjestad',birthCountry:'Aruba',nationality:'Dutch',idType:'Paspoort',idNumber:'AUA302912',idIssue:'01-15-2026',idExpiry:'01-15-2031',idPlace:'Censo Aruba',idCountry:'Aruba',street:'Caya Betico Croes',house:'45',addon:'',city:'Oranjestad',postcode:'00000',country:'Aruba',phone:'+297 555 0120',email:'client@example.com'};
  }
  async function downloadPdf(){
    const d=parseXml();
    const jsPDF=await ensureJsPdf();
    const pdf=new jsPDF({unit:'mm',format:'a4'});
    const subject=defaultSubject();
    const total=3;
    const caseRef=d.case_reference||'BSR-DEMO';
    const inds=clean(d.indicators||'130103').split(',').map(x=>clean(x)).filter(Boolean);
    const subjective=inds.some(i=>i==='130201'||i==='130202');
    const rationale=d.mlco_rationale||'Transaction selected by MLCO for FIU reporting package preparation.';
    const client='Blue Harbor Foundation VBA';
    const company='Blue Harbor Operations VBA';
    const amount=amountDisplay(d);
    function title(){
      pdf.setFillColor(0,0,0);pdf.rect(4,4,202,9,'F');
      pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(10);
      pdf.text('MELDFORMULIER ONGEBRUIKELIJKE TRANSACTIES',105,10,{align:'center'});
      pdf.setTextColor(0,0,0);
    }
    function bar(t,y){
      pdf.setFillColor(0,0,0);pdf.rect(4,y,202,7,'F');
      pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(8.5);pdf.text(t,7,y+4.8);
      pdf.setTextColor(0,0,0);return y+7;
    }
    function prow(a,y,g){
      pdf.setFont('helvetica','normal');pdf.setFontSize(8);
      a.forEach(r=>{
        let l1=pdf.splitTextToSize(String(r[0]||''),94),l2=pdf.splitTextToSize(String(r[1]||''),94);
        let h=Math.max(l1.length,l2.length)*4.2+4;
        if(y+h>282){pdf.addPage();y=4;}
        if(g){pdf.setFillColor(220,220,220);pdf.rect(4,y,202,h,'F');}
        pdf.rect(4,y,101,h);pdf.rect(105,y,101,h);pdf.text(l1,7,y+5);pdf.text(l2,107,y+5);y+=h;
      });
      return y;
    }
    function foot(i){pdf.setFontSize(8);pdf.line(4,285,206,285);pdf.text(i+' / '+total,202,291,{align:'right'});}
    function head(){
      title();pdf.rect(4,13,202,40);
      pdf.setFillColor(35,169,214);pdf.rect(94,13,20,40,'F');
      pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(12);pdf.text('FIU',104,35,{align:'center'});
      pdf.setTextColor(0,0,0);pdf.setFont('helvetica','normal');pdf.setFontSize(11);pdf.text('Financial Intelligence Unit of Aruba',121,31);
      pdf.setTextColor(0,130,180);pdf.text('MOT',121,38);pdf.setTextColor(0,0,0);
    }
    let y=53;
    head();
    y=bar('Naam melder',y);y=prow([['Handelsnaam:','Axioma']],y);
    y=bar('Melding',y+7);y=prow([['Meldingsnummer:',caseRef]],y);
    y=bar('Toelichting',y+9);y=prow([[rationale,'']],y);
    y=bar('Indicator',y+9);y=prow([['Code',subjective?'Subjectieve Indicatoren':'Objectieve Indicatoren']].concat(inds.map(i=>[i,i==='130103'?'Een girale transactie van Afl. 500.000 of meer':i==='130104'?'Een contante transactie van Afl. 25.000 of meer':i==='130201'?'Aanleiding om te veronderstellen dat de transactie verband kan houden met witwassen':i==='130202'?'Aanleiding om te veronderstellen dat de transactie verband kan houden met terrorisme- of proliferatiefinanciering':'Indicator geselecteerd voor MLCO review'])),y,true);
    foot(1);
    pdf.addPage();y=4;
    y=bar('Transactiegegevens',y);
    y=prow([['Client:',client],['Aruba company:',company],['Datum transactie:',normalizeDate(d.transaction_date)],['Tijd:',normalizeTime(d.description)||normalizeTime(d.transaction_date)],['Stadium van transactie:','uitgevoerd'],['Transactietype:',d.transaction_type||'Giraal'],['Bedrag / valuta:',amount],['Bedrag, gespecificeerd per valutasoort:','']],y);
    y=bar('Specificatie transactie',y+9);
    y=prow([[`${subject.first} ${subject.last} (${subject.role})`,`${subject.isClient} Aruba`],['Transactieomschrijving:',d.description||'Selected bank-statement transaction'],['Workflowstatus:',d.workflow_status||d.decision||'FIU package queue']],y);
    foot(2);
    pdf.addPage();y=4;
    y=bar('NATUURLIJKE PERSOON - '+subject.short,y);y=prow([[subject.role,'']],y);
    y=bar('Subjectgegevens',y);y=prow([['Eigen naam:',subject.last],['Gehuwde naam:',subject.married],['Initialen:',subject.initials],['Voornamen:',subject.first],['Geslacht:',subject.gender],['Geboortedatum:',subject.birth],['Geboorteplaats:',subject.birthCity],['Geboorteland:',subject.birthCountry],['Land nationaliteit:',subject.nationality]],y);
    y=bar('Legitimatiegegevens',y);y=prow([['Type:',subject.idType],['Nummer:',subject.idNumber],['Uitgiftedatum:',subject.idIssue],['Vervaldatum:',subject.idExpiry],['Plaats van uitgifte:',subject.idPlace],['Land van uitgifte:',subject.idCountry],['Land nationaliteit:',subject.nationality]],y);
    y=bar('Adresgegevens',y);y=prow([['Straatnaam:',subject.street],['Huisnummer:',subject.house],['Toevoeging bij huisnummer:',subject.addon],['Plaats:',subject.city],['Postcode:',subject.postcode],['Land:',subject.country]],y);
    y=bar('Telefoongegevens',y);y=prow([['Telefoonnummer:',subject.phone]],y);
    y=bar('Email',y);y=prow([['Email adres:',subject.email]],y);
    foot(3);
    pdf.save('MOTWEB_'+safe(caseRef)+'.pdf');
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
