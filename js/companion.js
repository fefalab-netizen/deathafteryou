const lines=[
  ['Oh, good. You’re still here.', 'Three bells. That’s quite a morning. I brought a pencil. It seemed more useful than screaming.'],
  ['Let’s put a little order to this.', 'That little body sketch is you. The mark beside it is how much hurt you can take. The other line is your breath. Short line? A moment, please.'],
  ['I’ll keep the tally.', 'Your weapon goes here. The bells and the ones you’ve put down go over there. Numbers are small enough to carry when everything else feels rather large.'],
  ['One thing at a time.', 'Your notebook keeps track of what you’re learning. Press P whenever you need it. You handle the bat. I’ll handle the extremely important scribbles.']
];
let dismiss=null;
export function closeCompanion(){document.getElementById('companionDialogue').hidden=true;dismiss=null;}
export function showCompanion(reveal,onClose){
  const get=id=>document.getElementById(id),dialog=get('companionDialogue');let page=0;
  const finish=()=>{reveal();closeCompanion();onClose();get('game').tabIndex=-1;get('game').focus({preventScroll:true});};
  dismiss=finish;
  const display=()=>{get('companionName').textContent=lines[page][0];get('companionLine').textContent=lines[page][1];get('companionCount').textContent=`${page+1} / ${lines.length}`;get('companionNext').textContent=page===lines.length-1?'All right. Together. →':'Go on →';if(page>=1)reveal();};
  get('companionNext').onclick=()=>{if(++page===lines.length)finish();else display();};
  get('companionSkip').onclick=finish;
  dialog.onkeydown=e=>{if(e.key==='Tab'){const first=get('companionNext'),last=get('companionSkip');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  dialog.hidden=false;display();get('companionNext').focus();
}
