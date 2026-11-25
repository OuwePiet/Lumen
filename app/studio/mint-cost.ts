export function mintCost(fee:number,total:number,change:number){
 if(![fee,total,change].every(n=>Number.isSafeInteger(n)&&n>=0)||change>total||fee>total-change)throw new Error("Invalid DeSo cost breakdown")
 return {fee,spend:total-change-fee,cost:total-change}
}