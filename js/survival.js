export const DAY_SECONDS=720;
export const newNeeds=()=>({foodSeconds:0,restSeconds:0});
export function needLevels(needs){return {hungry:Math.floor(needs.foodSeconds/DAY_SECONDS),tired:Math.floor(needs.restSeconds/DAY_SECONDS)};}
export function advanceNeeds(needs,dt){needs.foodSeconds=Math.min(DAY_SECONDS*10,needs.foodSeconds+dt);needs.restSeconds=Math.min(DAY_SECONDS*10,needs.restSeconds+dt);}
export function needPenalties(needs){const {hungry,tired}=needLevels(needs);return {movement:1-Math.min(.75,.05*(2**tired-1)),staminaRegen:1-Math.min(.60,.03*(2**hungry-1))};}
// Chapter two can call these when a meal or adequate rest is completed.
export function satisfyHunger(needs){needs.foodSeconds=0;}
export function satisfyRest(needs){needs.restSeconds=0;}
export function nightSpeed(elapsed){const phase=elapsed%DAY_SECONDS;return phase>=360&&phase<660?1.06:1;}
