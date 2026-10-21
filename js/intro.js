let timer, audio, keyNoise;
export function showIntro(onEnter) {
  clearTimeout(timer);
  const overlay=document.getElementById('introMenu'),next=document.getElementById('enterCemetery'),soundButton=document.getElementById('introSound');
  overlay.hidden=false;overlay.scrollTop=0;
  let muted=false,done=false,index=0,letter=0;
  // One tiny noise buffer, reused for every key. No audio downloads.
  try {
    const Context=window.AudioContext||window.webkitAudioContext;
    if(Context&&!audio){audio=new Context();keyNoise=audio.createBuffer(1,Math.ceil(audio.sampleRate*.025),audio.sampleRate);const data=keyNoise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/data.length*8);}
    audio?.resume().catch(()=>{});
  } catch {}
  function click(){
    if(muted||!audio||audio.state!=='running'||document.hidden)return;
    const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=keyNoise;source.playbackRate.value=.85+Math.random()*.3;gain.gain.value=.09;source.connect(gain);gain.connect(audio.destination);source.onended=()=>{source.disconnect();gain.disconnect();};source.start();
  }
  soundButton.onclick=()=>{muted=!muted;soundButton.textContent='TYPEWRITER SOUND: '+(muted?'OFF':'ON');soundButton.setAttribute('aria-pressed',String(!muted));};
  soundButton.textContent='TYPEWRITER SOUND: ON';soundButton.setAttribute('aria-pressed','true');
  const blocks=[...overlay.querySelectorAll('h2,p,blockquote')];
  const entries=[];
  for(const block of blocks){
    block.style.minHeight=block.getBoundingClientRect().height+'px';
    const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){const node=walker.currentNode;node.introOriginal??=node.textContent;entries.push({node,text:node.introOriginal});}
    block.setAttribute('aria-label',entries.filter(e=>block.contains(e.node)).map(e=>e.text).join(' '));
  }
  entries.forEach(e=>e.node.textContent='');
  next.textContent='SHOW ALL WORDS →';
  function complete(){clearTimeout(timer);entries.forEach(e=>e.node.textContent=e.text);blocks.forEach(b=>b.style.minHeight='');done=true;next.textContent='TAKE THE BAT. SURVIVE. →';}
  function type(){
    if(overlay.hidden)return;
    if(document.hidden){timer=setTimeout(type,250);return;}
    const entry=entries[index];
    if(!entry){complete();return;}
    const char=entry.text[letter++];entry.node.textContent=entry.text.slice(0,letter);
    if(char&&char.trim())click();
    let delay=/[.!?]/.test(char)?220:24;
    if(letter>=entry.text.length){index++;letter=0;delay=320;}
    timer=setTimeout(type,delay);
  }
  next.onclick=()=>{if(!done){complete();return;}clearTimeout(timer);overlay.hidden=true;onEnter();};
  timer=setTimeout(type,2750);
}
