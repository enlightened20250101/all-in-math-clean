// src/components/viz/presets/index.ts
import type { VizSpec } from "@/lib/vizSpec";

export const PresetSamples = {
  parabola_vertex_shift(a=1,h=0,k=0): VizSpec {
    return {
      preset: "parabola_vertex_shift",
      params: { a,h,k, xRange:[-5,5] },
      bbox: [-6,6,6,-6],
      objects: [
        { type:"grid", id:"grid" },
        { type:"axes", id:"axes" },
        // 頂点 V(h,k)
        { type:"point", id:"V", coords:[h,k], label:"V" },
        // 軸 x = h
        { type:"line", id:"axis", expr:`x=${h}`, style:"dashed" },
        // 曲線 y = a(x-h)^2 + k
        { type:"curve", id:"curve", fx:`${a}*(x-(${h}))**2 + (${k})`, },
        { type:"text", id:"form", pos:[-5.5,5.5], text:`$y=${a}(x-${h})^2+${k}$` },
      ],
      steps: [
        { reveal:["grid","axes"] },
        { reveal:["curve"] },
        { reveal:["V","axis"], highlight:["V","axis"], note:"頂点と軸を確認" },
      ],
      notes: [{ text:"平方完成 $y=a(x-h)^2+k$", anchor:"V" }],
    };
  },

  tangent_at_point(f="x^2", x0=1): VizSpec {
    // 接線の式 y = f'(x0)(x-x0) + f(x0) を表示（接点P、法線Nもオプション）
    return {
      preset: "tangent_at_point",
      params: { f, x0, xRange:[-5,5] },
      bbox: [-6,6,6,-6],
      objects: [
        { type:"grid", id:"grid" },
        { type:"axes", id:"axes" },
        { type:"curve", id:"f", fx:f, xRange:[-5,5] },
        { type:"point", id:"P", coords:[x0, 0], label:"P" }, // y座標はランタイムで f(x0) に合わせたいが MVP では手入力
        { type:"text", id:"form", pos:[-5.5,5.5], text:`$y=f(x),\\ x_0=${x0}$` },
      ],
      steps: [
        { reveal:["grid","axes"] },
        { reveal:["f"] },
        { reveal:["P"], highlight:["P"], note:"接点を確認" },
      ]
    };
  },

  riemann_sum_left_right_mid(f="x^2", a=0, b=3, n=6, mode:"left"|"right"|"mid"="mid"): VizSpec {
    return {
      preset: "riemann_sum_left_right_mid",
      params: { f,a,b,n,mode },
      bbox: [-1, (f==="x^2"?10:6), b+1, -1],
      objects: [
        { type:"grid", id:"grid" },
        { type:"axes", id:"axes" },
        { type:"curve", id:"f", fx:f, xRange:[a-0.5,b+0.5] },
        { type:"text", id:"info", pos:[a, (f==="x^2"?9:5.2)], text:`Riemann ${mode}, n=${n}` }
      ],
      steps: [
        { reveal:["grid","axes"] },
        { reveal:["f"] },
      ]
    };
  },

  inequality_region_1d(expr="(x-2)*(x-3) <= 0"): VizSpec {
    // 数直線用の簡易表現：根と閉/開区間可視化は後続拡張
    return {
      preset: "inequality_region_1d",
      params: { expr },
      bbox: [-1, 1, 7, -1],
      objects: [
        { type:"axes", id:"axes" },
        { type:"text", id:"t", pos:[0,0.5], text:`$${expr}$` },
        // 実装簡易化：根近傍に点を打つ（将来: verify/numeric で根計算）
        { type:"point", id:"r1", coords:[2,0], label:"2" },
        { type:"point", id:"r2", coords:[3,0], label:"3" },
        { type:"segment", id:"seg", ends:["r1","r2"] },
      ],
      steps: [
        { reveal:["axes","t"] },
        { reveal:["r1","r2","seg"], highlight:["seg"] }
      ]
    };
  }
};
