export const SKILLS={
 melee:{name:'Melee',unit:'swings',base:50,stat:'swings',benefit:'1 less stamina per rank; 1.5% faster attacks'},
 shooting:{name:'Shooting',unit:'shots fired',base:25,stat:'shots',benefit:'2% faster reloads per rank'},
 running:{name:'Running',unit:'metres sprinted',base:250,stat:'sprintMetres',benefit:'1% faster sprint per rank'},
 stamina:{name:'Endurance',unit:'stamina spent',base:500,stat:'staminaSpent',benefit:'+2 maximum stamina per rank'},
 health:{name:'Vitality',unit:'seconds survived',base:300,stat:'seconds',benefit:'+2 maximum health per rank; no free healing'},
 exploration:{name:'Exploration',unit:'metres travelled',base:500,stat:'metres',benefit:'5% farther item detection per rank'}
};
export const SAVE_KEY='deathcomesafteryou.part1.progress.v1';
export function freshProgress(){return {version:1,stats:{swings:0,shots:0,hits:0,kills:0,metres:0,sprintMetres:0,staminaSpent:0,seconds:0,damageTaken:0,healthBoxes:0,healthRecovered:0,items:0,runs:0,wins:0,bestWave:0}};}
export function loadProgress(storage){
 const result=freshProgress();
 try{const data=JSON.parse(storage.getItem(SAVE_KEY));if(data?.version===1)for(const key of Object.keys(result.stats)){const value=data.stats?.[key];if(Number.isFinite(value)&&value>=0)result.stats[key]=Math.min(value,1e12);}}catch{}
 return result;
}
export function saveProgress(storage,progress){try{storage.setItem(SAVE_KEY,JSON.stringify({version:progress.version,stats:progress.stats}));return true;}catch{return false;}}
export function rankProgress(total,base){
 let rank=0,spent=0;while(rank<10&&total>=spent+base*(rank+1)){spent+=base*(rank+1);rank++;}
 return {rank,current:total-spent,needed:rank===10?0:base*(rank+1)};
}
export function skillRank(progress,id){if(progress.developer)return 10;const s=SKILLS[id];return rankProgress((progress.runStats||progress.stats)[s.stat],s.base).rank;}
export function bonuses(p){return {health:100+2*skillRank(p,'health'),stamina:100+2*skillRank(p,'stamina'),sprint:1+.01*skillRank(p,'running'),reload:1-.02*skillRank(p,'shooting'),detect:1+.05*skillRank(p,'exploration')};}
