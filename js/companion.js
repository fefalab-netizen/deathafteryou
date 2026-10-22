const lines=[
  ['Still here, then.', 'That little mark? Health. Try keeping some.'],
  ['And this one…', 'Stamina. Even heroic flailing needs a breather.']
];
let dismiss=null;
export function closeCompanion(){document.getElementById('companionDialogue').hidden=true;dismiss=null;}
export function showCompanion(reveal,onClose){
  const get=id=>document.getElementById(id),dialog=get('companionDialogue');let page=0;
  const finish=()=>{reveal(2);closeCompanion();onClose();get('game').tabIndex=-1;get('game').focus({preventScroll:true});};
  dismiss=finish;
  const display=()=>{get('companionName').textContent=lines[page][0];get('companionLine').textContent=lines[page][1];get('companionCount').textContent=`${page+1} / ${lines.length}`;get('companionNext').textContent=page===lines.length-1?'All right. Together. →':'Go on →';reveal(page+1);};
  get('companionNext').onclick=()=>{if(++page===lines.length)finish();else display();};
  get('companionSkip').onclick=finish;
  dialog.onkeydown=e=>{if(e.key==='Tab'){const first=get('companionNext'),last=get('companionSkip');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  dialog.hidden=false;display();get('companionNext').focus();
}
