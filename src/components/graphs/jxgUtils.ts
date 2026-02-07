// src/components/graphs/jxgUtils.ts
export const CURVE = { strokeWidth: 2, fillOpacity: 0, fillColor: 'transparent', highlight: false, layer: 4 };
export const LINE  = { strokeWidth: 2, highlight: false, layer: 3 };
export const DASH  = { strokeWidth: 1, dash: 2, highlight: false, layer: 5 };

export function grid(ctx:any, color='#e5e7eb'){ return ctx.create('grid', [], { strokeColor: color, strokeWidth: 1, highlight:false, layer:1 }); }
export function curve(ctx:any, X:number[], Y:number[], color='#0ea5e9'){ if(X.length>1) return ctx.create('curve',[X,Y],{...CURVE, strokeColor:color}); }
export function line(ctx:any, P:[number,number], Q:[number,number], color='#0ea5e9'){ return ctx.create('line',[P,Q],{...LINE, strokeColor:color}); }
export function circle(ctx:any, C:[number,number], r:number, color='#0ea5e9'){ return ctx.create('circle',[C,r],{...LINE, strokeColor:color, fillOpacity:0, fillColor:'transparent'}); }
export function dashed(ctx:any, P:[number,number], Q:[number,number], color='#9ca3af'){ return ctx.create('segment',[P,Q],{...DASH, strokeColor:color}); }
export function point(ctx:any, P:[number,number], label:string, stroke='#111', fill='#fff', layer=9, fixed=false){
  return ctx.create('point', P, { name:label, withLabel:true, size:3, strokeColor:stroke, fillColor:fill, fixed, highlight:true, layer });
}
export function fitFromPoints(xs:number[], ys:number[]){
  return (xs.length && ys.length) ? { xs:[Math.min(...xs), Math.max(...xs)], ys:[Math.min(...ys), Math.max(...ys)] } : { xs:[-5,5], ys:[-5,5] };
}
