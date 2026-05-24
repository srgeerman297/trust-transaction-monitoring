(function(){
  const brand='Complywhistle TM';
  function replaceText(s){
    return String(s||'')
      .replace(/Fraugster/g,brand)
      .replace(/TRUST TM ADD-ON/g,'')
      .replace(/Trust Transaction Monitoring Demo/g,brand)
      .replace(/Products Demo - Shufti Backoffice/g,brand)
      .replace(/\s{2,}/g,' ');
  }
  function run(){
    document.title=brand;
    const logo=document.querySelector('.logo');
    if(logo){
      logo.textContent=brand;
      logo.style.fontSize='26px';
      logo.style.lineHeight='1.15';
      logo.style.letterSpacing='0';
    }
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      const parent=node.parentElement;
      if(!parent) continue;
      if(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION'].includes(parent.tagName)) continue;
      if(/Fraugster|TRUST TM ADD-ON|Trust Transaction Monitoring Demo|Products Demo - Shufti Backoffice/.test(node.nodeValue)) nodes.push(node);
    }
    nodes.forEach(n=>{n.nodeValue=replaceText(n.nodeValue)});
    document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(el=>{
      ['title','aria-label','placeholder'].forEach(attr=>{
        if(el.hasAttribute(attr)) el.setAttribute(attr,replaceText(el.getAttribute(attr)).trim());
      });
    });
  }
  run();
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
