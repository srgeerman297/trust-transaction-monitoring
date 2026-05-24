(function(){
  const brand='Complywhistle TM';
  function replaceText(s){
    return String(s||'')
      .replace(/Fraugster/g,brand)
      .replace(/TRUST TM ADD-ON/g,'')
      .replace(/Trust Transaction Monitoring Demo/g,brand)
      .replace(/Products Demo - Shufti Backoffice/g,brand)
      .replace(/\s{2,}/g,' ')
      .trim();
  }
  function applyTextNodes(root){
    if(!root||!document.body) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const targets=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      const parent=node.parentElement;
      if(!parent) continue;
      if(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION'].includes(parent.tagName)) continue;
      if(/Fraugster|TRUST TM ADD-ON|Trust Transaction Monitoring Demo|Products Demo - Shufti Backoffice/.test(node.nodeValue)) targets.push(node);
    }
    targets.forEach(n=>{
      const next=replaceText(n.nodeValue);
      if(next!==n.nodeValue) n.nodeValue=next;
    });
  }
  function run(){
    document.title=brand;
    const logo=document.querySelector('.logo');
    if(logo && logo.textContent.trim()!==brand){
      logo.textContent=brand;
      logo.style.fontSize='26px';
      logo.style.lineHeight='1.15';
      logo.style.letterSpacing='0';
    }
    applyTextNodes(document.body);
    document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(el=>{
      ['title','aria-label','placeholder'].forEach(attr=>{
        if(el.hasAttribute(attr)){
          const current=el.getAttribute(attr);
          const next=replaceText(current);
          if(next!==current) el.setAttribute(attr,next);
        }
      });
    });
  }
  function schedule(){setTimeout(run,80)}
  run();
  document.addEventListener('click',e=>{if(e.target.closest('[data-route],button'))schedule()},true);
  document.addEventListener('change',schedule,true);
})();
