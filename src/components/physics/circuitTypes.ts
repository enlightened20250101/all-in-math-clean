// src/components/physics/circuitTypes.ts
// 「配線テンプレ＋汎用ソルバー」方式の定義とロジックだけを置くファイル。
// 描画やUIは CircuitStudio.tsx 側に任せる。

// ==== 基本型 ===============================================================

export type ElementKind =
  | "resistor"
  | "voltageSource"
  | "capacitor"
  | "inductor"
  | "switch";
  
export type Scenario = "dc-initial" | "dc-steady";
// dc-initial : スイッチ投入直後 (t = 0⁺)
// dc-steady  : 十分時間が経った後 (t → ∞)


export interface ElectricalNode {
  id: string; // 例: "N_L", "N_R", "GND"
}

export interface ElementSlot {
  id: string; // スロットID（"R1"など）
  label: string; // キャンバス上に表示するラベル ("A","B" など)
  kind: ElementKind; // 抵抗 or 電源
  nodeAId: string; // 接続ノードA
  nodeBId: string; // 接続ノードB
  defaultValue: number; // デフォルト値（Ω or V）

  // 描画用
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
}

export interface WirePolyline {
  id: string;
  points: { x: number; y: number }[]; // 画面上の配線パス用（電気的意味は持たない）
}

export interface CircuitTemplate {
  id: string;
  label: string;
  width: number;
  height: number;
  nodes: ElectricalNode[];
  groundNodeId: string; // 電位 0[V] とみなすノード
  sourceSlotId: string; // 理想電源として扱うスロットID（1個想定）
  slots: ElementSlot[]; // ユーザーが値を設定する素子スロット
  wires: WirePolyline[]; // 見た目用の導線パス
}

// ==== ソルバー入出力 =======================================================

export interface SlotState {
  slotId: string;
  kind: ElementKind;
  enabled: boolean; // false ならそのスロットは回路から取り除く（開放）
  value: number; // 抵抗値[Ω] or 起電力[V]
}

export interface ElementSolveResult {
  slotId: string;
  kind: ElementKind;
  value: number;
  nodeAId: string;
  nodeBId: string;
  currentA: number; // A→B を正方向としたときの電流 [A]
  voltageV: number; // A側電位 - B側電位 [V]
  powerW: number; // P = V * I [W]（符号付き）
}

export interface CircuitSolveResult {
  ok: boolean;
  errors: string[];
  nodeVoltages: Record<string, number> | null; // ノード電位 [V]
  totalCurrentFromSourceA: number | null; // 電源の正極から流れ出る電流 [A]
  elements: ElementSolveResult[];
}

// ==== テンプレ定義 =========================================================

// 1) 1ループ直列回路：上側に3スロット、下側に2スロット（主に電池用）
const SERIES_2R_TEMPLATE: CircuitTemplate = {
  id: "series-2R", // id はそのままでもOK（ラベルだけ変えている）
  label: "1ループ直列 (上3・下2)",
  width: 400,
  height: 260,
  nodes: [
    { id: "N0" },   // 電源＋, 上段の左端
    { id: "N1" },   // 上段1〜2個目の間
    { id: "N2" },   // 上段2〜3個目の間
    { id: "GND" },  // 電源−, 上段の右端＋下レール
  ],
  groundNodeId: "GND",
  sourceSlotId: "V1", // とりあえず V1 を「主電源」とみなす
  slots: [
    // ---- 下側（手前）の素子スロット：主に電池用 ----
    {
      id: "V1",
      label: "",
      kind: "voltageSource",
      nodeAId: "N0",   // 正極
      nodeBId: "GND",  // 負極
      defaultValue: 3,
      x: 170,
      y: 220,
      orientation: "vertical",
    },
    {
      id: "V2",
      label: "",
      kind: "voltageSource",
      nodeAId: "N0",
      nodeBId: "GND",
      defaultValue: 0, // デフォルトで0Vにしておく（不要なら無効にする想定）
      x: 230,
      y: 220,
      orientation: "vertical",
    },

    // ---- 上側（奥側）の素子スロット：3つまで直列で置ける ----
    {
      id: "S1",
      label: "1",
      kind: "resistor",
      nodeAId: "N0",
      nodeBId: "N1",
      defaultValue: 10,
      x: 120,
      y: 80,
      orientation: "horizontal",
    },
    {
      id: "S2",
      label: "2",
      kind: "resistor",
      nodeAId: "N1",
      nodeBId: "N2",
      defaultValue: 10,
      x: 200,
      y: 80,
      orientation: "horizontal",
    },
    {
      id: "S3",
      label: "3",
      kind: "resistor",
      nodeAId: "N2",
      nodeBId: "GND",
      defaultValue: 10,
      x: 280,
      y: 80,
      orientation: "horizontal",
    },
  ],
  wires: [
    // 左の縦レール（上のS1左端〜下のレール入口）
    {
      id: "left",
      points: [
        { x: 80, y: 80 },
        { x: 80, y: 160 },
      ],
    },
    // 右の縦レール
    {
      id: "right",
      points: [
        { x: 320, y: 80 },
        { x: 320, y: 160 },
      ],
    },
    // 上側：S1〜S3の間の配線
    {
      id: "top-left",
      points: [
        { x: 80, y: 80 },
        { x: 104, y: 80 }, // S1 左端（x=120, 長さ32 → 120-16=104）
      ],
    },
    {
      id: "top-mid1",
      points: [
        { x: 136, y: 80 }, // S1 右端（120+16）
        { x: 184, y: 80 }, // S2 左端（200-16）
      ],
    },
    {
      id: "top-mid2",
      points: [
        { x: 216, y: 80 }, // S2 右端（200+16）
        { x: 264, y: 80 }, // S3 左端（280-16）
      ],
    },
    {
      id: "top-right",
      points: [
        { x: 296, y: 80 }, // S3 右端（280+16）
        { x: 320, y: 80 },
      ],
    },
    // 下側＋電池ループ
    {
      id: "bottom",
      points: [
        { x: 80, y: 160 },
        { x: 80, y: 220 },
        { x: 320, y: 220 },
        { x: 320, y: 160 },
      ],
    },
  ],
};


// 2) 並列回路：各枝に2素子 + 手前に電池スロット2つ + switch対応
const PARALLEL_2R_TEMPLATE: CircuitTemplate = {
  id: "parallel-2R",
  label: "並列回路 (各枝2素子 + 電池2)",
  width: 400,
  height: 260,

  // ノード構造：
  // N0  ── A1 ─ NA1 ─ A2 ─ GND   （上枝）
  // N0  ── B1 ─ NB1 ─ B2 ─ GND   （下枝）
  nodes: [
    { id: "N0" },
    { id: "NA1" },
    { id: "NB1" },
    { id: "GND" },
  ],

  groundNodeId: "GND",

  sourceSlotId: "V1", // メイン電源をV1として扱う

  slots: [
    // -------------------------------------------------------------
    // 下側（手前）電池スロット：V1 / V2
    // -------------------------------------------------------------
    {
      id: "V1",
      label: "",
      kind: "voltageSource",
      nodeAId: "N0",
      nodeBId: "GND",
      defaultValue: 3,
      x: 170,
      y: 220,
      orientation: "vertical",
    },

    {
      id: "V2",
      label: "",
      kind: "voltageSource",
      nodeAId: "N0",
      nodeBId: "GND",
      defaultValue: 0, // 初期は無効化を推奨
      x: 230,
      y: 220,
      orientation: "vertical",
    },

    // -------------------------------------------------------------
    // 上の枝（A）A1, A2
    // -------------------------------------------------------------
    {
      id: "A1",
      label: "A1",
      kind: "resistor",
      nodeAId: "N0",
      nodeBId: "NA1",
      defaultValue: 10,
      x: 140,
      y: 70,
      orientation: "horizontal",
    },
    {
      id: "A2",
      label: "A2",
      kind: "resistor",
      nodeAId: "NA1",
      nodeBId: "GND",
      defaultValue: 10,
      x: 260,
      y: 70,
      orientation: "horizontal",
    },

    // -------------------------------------------------------------
    // 下の枝（B）B1, B2
    // -------------------------------------------------------------
    {
      id: "B1",
      label: "B1",
      kind: "resistor",
      nodeAId: "N0",
      nodeBId: "NB1",
      defaultValue: 10,
      x: 140,
      y: 120,
      orientation: "horizontal",
    },
    {
      id: "B2",
      label: "B2",
      kind: "resistor",
      nodeAId: "NB1",
      nodeBId: "GND",
      defaultValue: 10,
      x: 260,
      y: 120,
      orientation: "horizontal",
    },
  ],

  // -------------------------------------------------------------
  // 見た目用 wires（電気的意味は無い）
  // -------------------------------------------------------------
  wires: [
    // 左の縦レール（上枝／下枝の共通左端）
    {
      id: "left",
      points: [
        { x: 80, y: 70 },
        { x: 80, y: 160 },
      ],
    },

    // 右の縦レール
    {
      id: "right",
      points: [
        { x: 320, y: 70 },
        { x: 320, y: 160 },
      ],
    },

    // 上枝の横配線
    {
      id: "top-left",
      points: [
        { x: 80, y: 70 },
        { x: 124, y: 70 }, // A1 左端
      ],
    },
    {
      id: "top-mid1",
      points: [
        { x: 156, y: 70 }, // A1 右端
        { x: 244, y: 70 }, // A2 左端
      ],
    },
    {
      id: "top-right",
      points: [
        { x: 276, y: 70 }, // A2 右端
        { x: 320, y: 70 },
      ],
    },

    // 下枝の横配線
    {
      id: "mid-left",
      points: [
        { x: 80, y: 120 },
        { x: 124, y: 120 },
      ],
    },
    {
      id: "mid-mid1",
      points: [
        { x: 156, y: 120 },
        { x: 244, y: 120 },
      ],
    },
    {
      id: "mid-right",
      points: [
        { x: 276, y: 120 },
        { x: 320, y: 120 },
      ],
    },

    // 一番下（電池ループ）
    {
      id: "bottom",
      points: [
        { x: 80, y: 160 },
        { x: 80, y: 220 },
        { x: 320, y: 220 },
        { x: 320, y: 160 },
      ],
    },
  ],
};






// テンプレ一覧
export const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  SERIES_2R_TEMPLATE,
  PARALLEL_2R_TEMPLATE,
];

export type CircuitTemplateId = (typeof CIRCUIT_TEMPLATES)[number]["id"];

export function getTemplateById(id: CircuitTemplateId): CircuitTemplate {
  const t = CIRCUIT_TEMPLATES.find((tpl) => tpl.id === id);
  if (!t) throw new Error(`Unknown circuit template: ${id}`);
  return t;
}

// ==== シナリオ別の等価回路変換 ============================================
//
// slots: 画面上の素子状態（UI用の元データ）
// scenario: t=0⁺ or t→∞
// 戻り値: solveCircuit に渡す用の SlotState 配列
//
// 近似ルール（高校物理レベルのDC）:
//  - コンデンサー C
//      dc-initial: 短絡 (導線) → 超小さい抵抗に置き換え
//      dc-steady : 開放 (電流ゼロ) → enabled=false にする
//  - コイル L
//      dc-initial: 開放 (電流まだ流れない)
//      dc-steady : 短絡 (導線)
//  - スイッチ
//      value = 1 => ON  → 短絡
//      value = 0 => OFF → 開放
export function normalizeSlotsForScenario(
  slotStates: SlotState[],
  scenario: Scenario
): SlotState[] {
  const R_SHORT = 1e-3; // 短絡相当
  // 開放は enabled=false で扱う

  return slotStates.map((s) => {
    if (!s.enabled) return s;

    if (s.kind === "capacitor") {
      if (scenario === "dc-initial") {
        // t=0⁺ では短絡相当
        return { ...s, kind: "resistor", value: R_SHORT };
      } else {
        // t→∞ では開放
        return { ...s, enabled: false };
      }
    }

    if (s.kind === "inductor") {
      if (scenario === "dc-initial") {
        // t=0⁺ では開放
        return { ...s, enabled: false };
      } else {
        // t→∞ では短絡
        return { ...s, kind: "resistor", value: R_SHORT };
      }
    }

    if (s.kind === "switch") {
      const isOn = s.value >= 0.5;
      if (isOn) {
        // ON → 短絡扱い
        return { ...s, kind: "resistor", value: R_SHORT };
      } else {
        // OFF → 開放
        return { ...s, enabled: false };
      }
    }

    // 抵抗・電源はそのまま
    return s;
  });
}

// ==== ソルバー本体 ========================================================

// 単一の理想電源＋抵抗ネットワークをノード解析で解く。
// ・groundNodeId の電位は 0[V]
// ・sourceSlot の nodeAId を +V、nodeBId を ground とする前提（1個想定）
export function solveCircuit(
  template: CircuitTemplate,
  slotStates: SlotState[]
): CircuitSolveResult {
  const errors: string[] = [];

  // テンプレ側の slot 定義のマップを用意
  const slotDefMap = new Map<string, ElementSlot>();
  for (const sl of template.slots) {
    slotDefMap.set(sl.id, sl);
  }

  // テンプレに存在しない slotId はここで落とす
  const cleanedStates = slotStates.filter((s) => slotDefMap.has(s.slotId));

  const enabledSlots = cleanedStates.filter(
    (s) => s.enabled && s.value > 0
  );
  if (enabledSlots.length === 0) {
    errors.push("有効な素子がありません。");
    return {
      ok: false,
      errors,
      nodeVoltages: null,
      totalCurrentFromSourceA: null,
      elements: [],
    };
  }

  const sourceSlotState = enabledSlots.find(
    (s) => s.slotId === template.sourceSlotId
  );
  const sourceSlotDef = slotDefMap.get(template.sourceSlotId);

  if (!sourceSlotDef) {
    errors.push("テンプレートに電源スロットが定義されていません。");
  } else if (!sourceSlotState || sourceSlotState.kind !== "voltageSource") {
    errors.push("電源が無効化されているか、値が不正です。");
  }

  const Vsource = sourceSlotState?.value ?? 0;
  if (Vsource <= 0) {
    errors.push("電源電圧が 0V 以下です。");
  }

  const resistorSlots = enabledSlots.filter(
    (s) => s.kind === "resistor" && s.value > 0
  );

  if (resistorSlots.length === 0) {
    errors.push("抵抗が 1 つも有効になっていません。");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      nodeVoltages: null,
      totalCurrentFromSourceA: null,
      elements: [],
    };
  }

  // ノード集合
  const nodeIds = new Set<string>();
  for (const s of resistorSlots) {
    const def = slotDefMap.get(s.slotId)!;
    nodeIds.add(def.nodeAId);
    nodeIds.add(def.nodeBId);
  }
  // 電源のノードも必ず含める
  nodeIds.add(sourceSlotDef!.nodeAId);
  nodeIds.add(sourceSlotDef!.nodeBId);
  nodeIds.add(template.groundNodeId);

  const nodes = Array.from(nodeIds);
  const groundId = template.groundNodeId;
  const sourcePosId = sourceSlotDef!.nodeAId;
  const sourceNegId = sourceSlotDef!.nodeBId;

  // 既知電位
  const knownVoltages: Record<string, number> = {
    [groundId]: 0,
    [sourceNegId]: 0,
    [sourcePosId]: Vsource,
  };

  const unknownNodeIds = nodes.filter((id) => !(id in knownVoltages));
  const M = unknownNodeIds.length;

  // 既知ノードだけで決まる場合もあるので、未知ノードが 0 でもOK
  let nodeVoltages: Record<string, number> = { ...knownVoltages };

  if (M > 0) {
    const A: number[][] = Array.from({ length: M }, () =>
      Array(M).fill(0)
    );
    const b: number[] = Array(M).fill(0);

    const idxUnknown = (nodeId: string): number | null => {
      const i = unknownNodeIds.indexOf(nodeId);
      return i === -1 ? null : i;
    };

    // 各未知ノードのKCL
    for (let row = 0; row < M; row++) {
      const nid = unknownNodeIds[row];

      for (const s of resistorSlots) {
        const def = slotDefMap.get(s.slotId)!;
        const { nodeAId, nodeBId } = def;

        let other: string | null = null;
        if (nid === nodeAId) other = nodeBId;
        else if (nid === nodeBId) other = nodeAId;
        else continue;

        const R = s.value;
        const g = 1 / R;

        A[row][row] += g;

        const j = idxUnknown(other);
        if (j != null) {
          A[row][j] -= g;
        } else {
          const Vother =
            knownVoltages[other] !== undefined ? knownVoltages[other] : 0;
          b[row] += g * Vother;
        }
      }
    }

    const x = solveLinearSystem(A, b);
    if (!x) {
      errors.push("連立方程式を解けませんでした（回路が不完全かもしれません）。");
      return {
        ok: false,
        errors,
        nodeVoltages: null,
        totalCurrentFromSourceA: null,
        elements: [],
      };
    }

    // 未知ノードの電位を反映
    unknownNodeIds.forEach((id, i) => {
      nodeVoltages[id] = x[i];
    });
  }

  // 各素子の結果
  const elements: ElementSolveResult[] = [];
  for (const s of enabledSlots) {
    const def = slotDefMap.get(s.slotId)!;
    const Va = nodeVoltages[def.nodeAId] ?? 0;
    const Vb = nodeVoltages[def.nodeBId] ?? 0;
    const V = Va - Vb;
    let I = 0;
    let P = 0;

    if (s.kind === "resistor") {
      const R = s.value;
      I = V / R;
      P = V * I;
    } else if (s.kind === "voltageSource") {
      // 理想電源はここでは電流0としておく（後で合算）
      I = 0;
      P = V * I;
    }

    elements.push({
      slotId: s.slotId,
      kind: s.kind,
      value: s.value,
      nodeAId: def.nodeAId,
      nodeBId: def.nodeBId,
      currentA: I,
      voltageV: V,
      powerW: P,
    });
  }

  // 電源正極から流れ出る電流
  let totalI = 0;
  for (const s of resistorSlots) {
    const def = slotDefMap.get(s.slotId)!;
    const { nodeAId, nodeBId } = def;
    const R = s.value;
    if (nodeAId === sourcePosId || nodeBId === sourcePosId) {
      const otherId = nodeAId === sourcePosId ? nodeBId : nodeAId;
      const Va = nodeVoltages[sourcePosId];
      const Vother = nodeVoltages[otherId];
      const I = (Va - Vother) / R;
      totalI += I;
    }
  }

  return {
    ok: true,
    errors: [],
    nodeVoltages,
    totalCurrentFromSourceA: totalI,
    elements,
  };
}


// シンプルなガウス消去（部分ピボット付き）
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row) => row.slice());
  const rhs = b.slice();

  for (let col = 0; col < n; col++) {
    // ピボット選択
    let pivot = col;
    for (let i = col + 1; i < n; i++) {
      if (Math.abs(M[i][col]) > Math.abs(M[pivot][col])) {
        pivot = i;
      }
    }
    if (Math.abs(M[pivot][col]) < 1e-12) {
      return null; // 特異行列
    }
    // 行入れ替え
    if (pivot !== col) {
      [M[col], M[pivot]] = [M[pivot], M[col]];
      [rhs[col], rhs[pivot]] = [rhs[pivot], rhs[col]];
    }

    // 前進消去
    const pivotVal = M[col][col];
    for (let i = col + 1; i < n; i++) {
      const f = M[i][col] / pivotVal;
      if (Math.abs(f) < 1e-12) continue;
      for (let j = col; j < n; j++) {
        M[i][j] -= f * M[col][j];
      }
      rhs[i] -= f * rhs[col];
    }
  }

  // 後退代入
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = rhs[i];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }
  return x;
}
