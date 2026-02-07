from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import random, math
from typing import List, Dict, Any, Optional, Tuple
import time, os, sympy as sp
from sympy.logic.boolalg import BooleanTrue, BooleanFalse
from sympy.core.relational import Relational
from sympy import Interval, Union, Intersection, Complement, FiniteSet, S, And, Or, Lt, Le, Gt, Ge, Eq, Ne
from fastapi import Query
from io import BytesIO
try:
    from PIL import Image, ImageDraw
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False

# =========================================================
# 0) Global setup
# =========================================================

FUNC_NAMES = [
    "sin","cos","tan","cot","sec","csc",
    "arcsin","arccos","arctan",
    "log","ln","exp","sqrt","abs","Abs",
    "diff","binomial","factorial","floor","ceiling","Mod","re","im","arg","conjugate"
]

START_TS = time.time()
VERSION  = os.getenv("VERIFY_VERSION", "2025-09-22")
CAPS = [
    "equation","derivative","integral","roots","system",
    "inequality","limit","series","numeric_compare","vector",
    "geo.line","geo.circle","geo.parabola","algebra.sums",
    "complex","congruence","matrix","det","solutions"
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Nextサーバ経由でしか叩かないなら厳しめでもOK
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- tiny TTL cache (60s) ---
_RESP_CACHE: Dict[str, Any] = {}
_RESP_CACHE_TTL = 60.0
def _cache_get(key: str):
    item = _RESP_CACHE.get(key)
    if not item: return None
    ts, val = item
    if time.time() - ts > _RESP_CACHE_TTL:
        _RESP_CACHE.pop(key, None)
        return None
    return val
def _cache_set(key: str, val: Any):
    _RESP_CACHE[key] = (time.time(), val)

@app.get("/health")
def health():
    return {
        "ok": True,
        "version": VERSION,
        "caps": CAPS,
        "sympy": sp.__version__,
        "pil": PIL_AVAILABLE,               # ★ 追加
        "uptime_s": int(time.time() - START_TS),
    }

# =========================================================
# 1) Payload models
# =========================================================

class EquationPayload(BaseModel):
    lhs_latex: str
    rhs_latex: str

class DiffPayload(BaseModel):
    expr_latex: str
    variable: str = "x"

class SolvePayload(BaseModel):
    equation_latex: str
    variable: str = "x"

class NumericComparePayload(BaseModel):
    lhs: str
    rhs: str
    var: str = "x"
    samples: int = 6
    domain: tuple[float, float] = (-2.0, 2.0)
    tol: float = 1e-6

class RootsPayload(BaseModel):
    equation: str
    var: str = "x"
    solutions: List[str]
    tol: float = 1e-6

class SimplifyPayload(BaseModel):
    expr: str

class IntegralPayload(BaseModel):
    integrand: str
    var: str = "x"
    expected: str

class SystemPayload(BaseModel):
    equations: List[str]
    vars: List[str]
    solution: List[str]
    tol: float = 1e-6

class InequalityPayload(BaseModel):
    expr: str
    var: str = "x"
    samples: int = 9
    domain: tuple[float,float] = (-5,5)
    tol: float = 1e-6

class LimitPayload(BaseModel):
    expr: str
    var: str = "x"
    at: str
    dir: str = "both"
    expected: str

class SeriesPayload(BaseModel):
    expr: str
    var: str = "x"
    center: str = "0"
    order: int = 5
    expected: str

class BatchItem(BaseModel):
    type: str
    payload: Dict[str, Any]
class BatchPayload(BaseModel):
    items: List[BatchItem]

class SeqTermPayload(BaseModel):
    term: str
    expected: str
    var: str = "n"
    samples: int = 8
    domain: tuple[int,int] = (1, 10)

class SumPayload(BaseModel):
    summand: str
    index: str = "k"
    lower: str
    upper: str
    expected: str
    param_vars: List[str] = []

class IntIdentityPayload(BaseModel):
    lhs: str
    rhs: str
    vars: List[str] = ["n"]
    domain: tuple[int,int] = (1, 10)
    samples: int = 10

class SampleFuncPayload(BaseModel):
    expr: str
    var: str = "x"
    domain: tuple[float, float] = (-5.0, 5.0)
    num: int = 200

class ComplexIdentityPayload(BaseModel):
    lhs: str
    rhs: str
    vars: List[str] = ["z"]
    domain: tuple[float,float] = (-3.0, 3.0)
    samples: int = 8
    tol: float = 1e-8

class CongruencePayload(BaseModel):
    lhs: str
    rhs: str
    mod: str
    vars: List[str] = []
    domain: tuple[int,int] = (0, 20)
    samples: int = 8

class MatrixEqPayload(BaseModel):
    lhs: List[List[str]]
    rhs: List[List[str]]
    vars: List[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6

class DeterminantPayload(BaseModel):
    mat: List[List[str]]
    expected: str
    vars: List[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6

class SampleParametricPayload(BaseModel):
    x_of_t: str
    y_of_t: str
    t: str = "t"
    tmin: float = 0.0
    tmax: float = 2*math.pi
    num: int = 400

class VectorEqPayload(BaseModel):
    lhs: list[str]
    rhs: list[str]
    vars: list[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6

class VectorDotPayload(BaseModel):
    a: list[str]
    b: list[str]
    expected: str
    vars: list[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6

class VectorCrossPayload(BaseModel):
    a: list[str]
    b: list[str]
    expected: list[str]
    vars: list[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6

class VectorMagPayload(BaseModel):
    a: list[str]
    expected: str
    vars: list[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6

class VectorAnglePayload(BaseModel):
    a: list[str]
    b: list[str]
    expected: Optional[str] = None
    vars: list[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6
    tol: float = 1e-6

class VectorBoolPayload(BaseModel):
    a: list[str]
    b: list[str]
    vars: list[str] = []
    domain: tuple[int,int] = (-5,5)
    samples: int = 6
    tol: float = 1e-9

class LineEqPayload(BaseModel):
    lhs: str
    rhs: str
    vars: List[str] = ["x", "y"]

class LineSlopePayload(BaseModel):
    equation: str
    slope: str
    intercept: str
    vars: List[str] = ["x", "y"]

class CircleFeaturesPayload(BaseModel):
    equation: str
    center_x: str
    center_y: str
    radius: str
    vars: List[str] = ["x", "y"]

class ParabolaFeaturesPayload(BaseModel):
    equation: str
    vertex_x: str
    vertex_y: str
    focus_x: str
    focus_y: str
    directrix: str
    vars: List[str] = ["x","y"]

class EllipseFeaturesPayload(BaseModel):
    equation: str
    center_x: str
    center_y: str
    a: str            # 長半径（正）
    b: str            # 短半径（正）
    vars: List[str] = ["x","y"]

class HyperbolaFeaturesPayload(BaseModel):
    equation: str
    center_x: str
    center_y: str
    a: str            # 軸方向半径（正）
    b: str            # もう一方の半径（正）
    vars: List[str] = ["x","y"]

class SolutionsIntervalPayload(BaseModel):
    equation: str      # "lhs = rhs" 形式（無ければ =0 扱い）
    var: str = "x"
    lower: str         # 例: "0"
    upper: str         # 例: "2*pi"
    expected: List[str]
    tol: float = 1e-6

class InequalitySetPayload(BaseModel):
    expr: str                    # 例: "x^2 >= 1" / "Abs(x-2) < 3"
    var: str = "x"
    expected: List[str]          # 例: ["(-oo,-1]","[1,oo)"]（合併は配列で）
    domain: tuple[float,float] = (-10.0, 10.0)  # 数値fallback用のサンプル域
    samples: int = 200
    tol: float = 1e-6

class FunctionTransformPayload(BaseModel):
    base: str       # f(x)
    target: str     # g(x)
    var: str = "x"
    a: Optional[str] = None   # 垂直倍率
    b: Optional[str] = None   # 水平倍率（x→b*(x-h) の b）
    h: Optional[str] = None   # 水平移動
    k: Optional[str] = None   # 垂直移動
    samples: int = 50
    domain: tuple[float,float] = (-5.0,5.0)
    tol: float = 1e-6


class OverlayBBox(BaseModel):
    xmin: float
    xmax: float
    ymin: float
    ymax: float

class OverlayLinePayload(BaseModel):
    ref_equation: str         # 例: "2*x + y + 1 = 0" / "y = -2*x -1"
    user_equation: str
    bbox: Optional[OverlayBBox] = None
    num: int = 400
    vars: List[str] = ["x","y"]

class OverlayCirclePayload(BaseModel):
    ref_equation: str          # 一般式 or 標準形
    user_equation: str
    bbox: Optional[OverlayBBox] = None
    num: int = 360
    vars: List[str] = ["x","y"]

class OverlayParabolaPayload(BaseModel):
    ref_equation: str          # 一般式 or 標準形（軸平行）
    user_equation: str
    bbox: Optional[OverlayBBox] = None
    num: int = 400
    vars: List[str] = ["x","y"]

class OverlayEllipsePayload(BaseModel):
    ref_equation: str          # 一般式 or 標準形（回転なし）
    user_equation: str
    bbox: Optional[OverlayBBox] = None
    num: int = 360
    vars: List[str] = ["x","y"]

class OverlayHyperbolaPayload(BaseModel):
    ref_equation: str          # 一般式 or 標準形（回転なし）
    user_equation: str
    bbox: Optional[OverlayBBox] = None
    num: int = 600
    vars: List[str] = ["x","y"]

class OverlayRenderPayload(BaseModel):
    bbox: OverlayBBox
    layers: List[Dict[str, Any]]     # [{label, points:[ [x,y] | [null,null] ]}]
    width: int = 800
    height: int = 600
    show_grid: bool = True

class OverlayShapePngPayload(BaseModel):
    width: int = 800
    height: int = 600
    show_grid: bool = True


# --- Derivative diagnose ---
class DiagnoseDerivativePayload(BaseModel):
    func_latex: str
    user_latex: str
    variable: str = "x"

class DiagnoseRootsPayload(BaseModel):
    equation: str
    var: str = "x"
    user_solutions: List[str]
    tol: float = 1e-6

# =========================================================
# 2) Utilities
# =========================================================

def _protect_funcs(s: str):
    tokens = {}
    out = s
    for i, name in enumerate(FUNC_NAMES):
        key = f"¤{i}¤"
        tokens[key] = name
        out = re.sub(rf"\b{name}\b", key, out)
    return out, tokens

def _restore_funcs(s: str, tokens: dict):
    out = s
    for key, name in tokens.items():
        out = out.replace(key, name)
    return out

def _equation_to_expr(eq_text: str) -> sp.Expr:
    t = normalize_expr(eq_text).replace('==','=')
    if '=' in t:
        lhs, rhs = t.split('=', 1)
        return sp.sympify(lhs) - sp.sympify(rhs)
    return sp.sympify(t)

def _int_symbols(names: List[str]) -> dict:
    return {nm: sp.Symbol(nm, integer=True) for nm in set(names)}

def _real_symbols(names: List[str]) -> dict:
    return {nm: sp.Symbol(nm, real=True) for nm in set(names)}

def _parse_rel(s, syms):
    e = sp.sympify(normalize_expr(s), locals=syms)
    if not isinstance(e, Relational):   # ← sp.Relational ではなく Relational
        raise ValueError("not relational")
    return e.lhs, e.rel_op, e.rhs


def _ineq_mult_ok(src, dst, factor, syms, domain, samples):
    a0,b0 = domain
    xs = list(syms.values())
    for _ in range(max(16, samples)):
        subs = { s: a0+(b0-a0)*random.random() for s in xs }
        lhs1,op1,rhs1 = _parse_rel(src, syms)
        lhs2,op2,rhs2 = _parse_rel(dst, syms)
        k = sp.N(sp.sympify(normalize_expr(factor or "1"), locals=syms).subs(subs))
        L = sp.simplify((lhs1*k) - lhs2).subs(subs)
        R = sp.simplify((rhs1*k) - rhs2).subs(subs)
        same_sides = (abs(float(sp.N(L)))<1e-8 and abs(float(sp.N(R)))<1e-8)
        if not same_sides: return False
        flipped = (op2 in {"<":">",">":"<","<=":">=",">=":"<="}.get(op1,""))
        if (k<0 and not flipped) or (k>0 and flipped):
            return False
    return True

def _line_coeffs(eq_text: str, syms: dict) -> Optional[tuple]:
    expr = _equation_to_expr(eq_text)
    x, y = syms["x"], syms["y"]
    try:
        poly = sp.Poly(sp.expand(expr), x, y, domain="EX")
    except Exception:
        return None
    # 直線条件：次数1以下
    if poly.total_degree() > 1:
        return None
    a = sp.simplify(poly.coeff_monomial(x))
    b = sp.simplify(poly.coeff_monomial(y))
    c = sp.simplify(poly.coeff_monomial(1))
    return (a, b, c)

def _holds_rel(expr_text: str, syms: dict, subs: dict, pre_subs: Optional[Dict[sp.Symbol, sp.Expr]] = None) -> bool:
    e = sp.sympify(normalize_expr(expr_text), locals=syms)
    # Python bool に化けていたら即返す
    if isinstance(e, bool):
        return e
    if pre_subs:
        try:
            e = e.subs(pre_subs)
        except Exception:
            return False
    # SymPy Boolean なら即返す
    if isinstance(e, (BooleanTrue, BooleanFalse)):
        return bool(e)
    # ← ここを try で囲う
    try:
        v = sp.simplify(e.subs(subs))
    except Exception:
        return False

    if isinstance(v, (BooleanTrue, BooleanFalse)):
        return bool(v)
    if isinstance(v, Relational):
        try:
            v2 = v.doit()
        except Exception:
            v2 = v
        try:
            return bool(v2)
        except Exception:
            return False
    try:
        vnum = sp.N(v)
        return bool(vnum != 0)
    except Exception:
        return False


def _expr_equal(a_text: str, b_text: str, syms: dict, domain, samples: int, tol: float,
                pre_subs: Optional[Dict[sp.Symbol, sp.Expr]] = None) -> bool:
    a = sp.sympify(normalize_expr(a_text), locals=syms)
    b = sp.sympify(normalize_expr(b_text), locals=syms)
    if pre_subs:
        a = a.subs(pre_subs); b = b.subs(pre_subs)
    if sp.simplify(a - b) == 0:
        return True
    xs = list(syms.values())
    a0,b0 = domain
    for _ in range(samples):
        subs = {}
        for s in xs:
            v = a0 + (b0-a0)*random.random()
            subs[s] = v
        av = sp.N(a.subs(subs)); bv = sp.N(b.subs(subs))
        if (getattr(av,"is_finite",None) is False) or (getattr(bv,"is_finite",None) is False):
            continue
        denom = max(1.0, float(abs(bv)))
        if abs(float(av - bv))/denom > tol:
            return False
    return True

def _rel_equiv(a_text: str, b_text: str, syms: dict, domain, samples: int) -> bool:
    a0,b0 = domain
    xs = list(syms.values())
    for _ in range(samples):
        subs = {}
        for s in xs:
            v = a0 + (b0-a0)*random.random()
            subs[s] = v
        if _holds_rel(a_text, syms, subs) != _holds_rel(b_text, syms, subs):
            return False
    return True

def _rel_kind(expr_text: str) -> str:
    """
    粗い種別判定：不等式/等式/式
    """
    t = normalize_expr(expr_text)
    if re.search(r'(<=|>=|<|>|!=)', t):
        return "inequality"
    if '=' in t:
        return "equation"
    return "expression"


def _parse_subs_map(st, syms_shared: dict) -> Dict[sp.Symbol, sp.Expr]:
    mapping: Dict[sp.Symbol, sp.Expr] = {}
    if getattr(st, "subs", None):
        for k, v in st.subs.items():
            sym = sp.Symbol(k)
            mapping[sym] = sp.sympify(normalize_expr(v), locals=syms_shared)
    if getattr(st, "let", None):
        for item in st.let:
            try:
                lhs, rhs = item.split('=', 1)
                k = lhs.strip(); v = rhs.strip()
                sym = sp.Symbol(k)
                mapping[sym] = sp.sympify(normalize_expr(v), locals=syms_shared)
            except Exception:
                pass
    return mapping

def _infer_pre_subs(src_text: str, dst_text: str, syms: dict) -> Optional[Dict[sp.Symbol, sp.Expr]]:
    try:
        src = sp.sympify(normalize_expr(src_text), locals=syms)
        dst = sp.sympify(normalize_expr(dst_text), locals=syms)
    except Exception:
        return None
    if not (hasattr(src, "func") and hasattr(dst, "func")):
        return None
    if src.func != dst.func:
        return None
    if len(getattr(src, "args", ())) != 1 or len(getattr(dst, "args", ())) != 1:
        return None
    arg_src = src.args[0]
    arg_dst = dst.args[0]
    if isinstance(arg_dst, sp.Symbol):
        return { arg_dst: arg_src }
    return None

def _floatify(expr: sp.Expr, syms: dict) -> float:
    return float(sp.N(expr))

def _dedup_sorted(vals: List[float], tol: float = 1e-7) -> List[float]:
    if not vals: return []
    vs = sorted(vals)
    out = [vs[0]]
    for v in vs[1:]:
        if abs(v - out[-1]) > tol:
            out.append(v)
    return out

def _solve_on_interval_by_sampling(f: sp.Expr, x: sp.Symbol, lo: float, hi: float, samples: int = 200, tol: float = 1e-8) -> List[float]:
    """符号変化と小値探索→ nsolve で根を拾う簡易ルーチン（実数のみ）"""
    xs = [lo + (hi - lo) * i / samples for i in range(samples + 1)]
    vals = []
    for xv in xs:
        try:
            yv = float(sp.N(f.subs({x: xv})))
            if math.isfinite(yv):
                vals.append((xv, yv))
            else:
                vals.append((xv, None))
        except Exception:
            vals.append((xv, None))

    roots: List[float] = []
    # 近傍で小さい点
    for xv, yv in vals:
        if yv is not None and abs(yv) < 1e-3:
            try:
                r = sp.nsolve(f, x, xv)
                r = float(sp.N(r))
                if lo - 1e-9 <= r <= hi + 1e-9:
                    roots.append(r)
            except Exception:
                pass
    # 符号変化
    for ((x1,y1),(x2,y2)) in zip(vals, vals[1:]):
        if y1 is None or y2 is None: 
            continue
        if y1 == 0.0:
            roots.append(x1)
            continue
        if y1 * y2 < 0:
            xm = 0.5 * (x1 + x2)
            try:
                r = sp.nsolve(f, x, xm)
                r = float(sp.N(r))
                if lo - 1e-9 <= r <= hi + 1e-9:
                    roots.append(r)
            except Exception:
                pass
    return _dedup_sorted(roots, tol=1e-6)

def _parse_interval(s: str, syms: dict) -> sp.Set:
    s = s.strip()
    m = re.match(r'^(\(|\[)\s*(.+?)\s*,\s*(.+?)\s*(\)|\])$', s)
    if not m:
        raise ValueError(f"bad interval: {s}")
    lbr, a_str, b_str, rbr = m.groups()
    a = a_str.strip(); b = b_str.strip()
    a_val = -S.Infinity if a in ("-oo","-inf") else sp.sympify(normalize_expr(a), locals=syms)
    b_val =  S.Infinity if b in ("oo","+oo","inf") else sp.sympify(normalize_expr(b), locals=syms)
    left_closed  = (lbr == '[')
    right_closed = (rbr == ']')
    return Interval(a_val, b_val, left_open=not left_closed, right_open=not right_closed)

def _rel_to_set(rel: Relational, x: sp.Symbol) -> sp.Set:
    """
    x に関する単純な関係式を集合へ変換。
      x <= c, x < c, x >= c, x > c, x = c, x != c
    右辺に x、左辺が定数の時も処理（c <= x 等）。
    それ以外（両辺に x）には対応しない（呼び出し側で回避/数値fallback）。
    """
    lhs, rhs = rel.lhs, rel.rhs
    # x <= c / x < c
    if isinstance(rel, (Le, Lt)) and lhs == x and not rhs.has(x):
        c = sp.simplify(rhs)
        return Interval(-S.Infinity, c, left_open=True, right_open=isinstance(rel, Lt))
    # c <= x / c < x
    if isinstance(rel, (Le, Lt)) and rhs == x and not lhs.has(x):
        c = sp.simplify(lhs)
        return Interval(c, S.Infinity, left_open=isinstance(rel, Lt), right_open=True)
    # x >= c / x > c
    if isinstance(rel, (Ge, Gt)) and lhs == x and not rhs.has(x):
        c = sp.simplify(rhs)
        return Interval(c, S.Infinity, left_open=isinstance(rel, Gt), right_open=True)
    # c >= x / c > x
    if isinstance(rel, (Ge, Gt)) and rhs == x and not lhs.has(x):
        c = sp.simplify(lhs)
        return Interval(-S.Infinity, c, left_open=True, right_open=isinstance(rel, Gt))
    # x = c / c = x
    if isinstance(rel, Eq) and ((lhs == x and not rhs.has(x)) or (rhs == x and not lhs.has(x))):
        c = sp.simplify(rhs if lhs == x else lhs)
        return FiniteSet(c)
    # x != c / c != x  → R \ {c}
    if isinstance(rel, Ne) and ((lhs == x and not rhs.has(x)) or (rhs == x and not lhs.has(x))):
        c = sp.simplify(rhs if lhs == x else lhs)
        return Complement(S.Reals, FiniteSet(c))
    # ここまで来たら未対応
    raise ValueError("unsupported relational for set conversion")

def _bool_to_set(expr, x: sp.Symbol) -> Optional[sp.Set]:
    """
    And/Or/Relational/Boolean を集合（Interval/Union/…）へ再帰的に変換。
    変換できない場合は None を返す（数値fallbackへ）。
    """
    # 既に集合ならそのまま
    if isinstance(expr, sp.Set):
        return expr
    # 真偽
    if isinstance(expr, BooleanTrue):
        return S.Reals
    if isinstance(expr, BooleanFalse):
        return S.EmptySet
    # 関係式
    if isinstance(expr, Relational):
        try:
            return _rel_to_set(expr, x)
        except Exception:
            return None
    # 論理和/論理積
    if isinstance(expr, Or):
        parts = []
        for a in expr.args:
            s = _bool_to_set(a, x)
            if s is None:
                return None
            parts.append(s)
        return Union(*parts) if parts else S.EmptySet
    if isinstance(expr, And):
        parts = []
        for a in expr.args:
            s = _bool_to_set(a, x)
            if s is None:
                return None
            parts.append(s)
        return Intersection(*parts) if parts else S.EmptySet
    # 変換不可
    return None

def _resolve_bbox(bbox: Optional[Dict[str,float]] = None, fallback=(-5.0,5.0,-5.0,5.0)) -> Tuple[float,float,float,float]:
    if bbox and all(k in bbox for k in ("xmin","xmax","ymin","ymax")):
        return float(bbox["xmin"]), float(bbox["xmax"]), float(bbox["ymin"]), float(bbox["ymax"])
    return fallback

def _clip_points_to_bbox(points: List[Tuple[float,float]], bbox: Tuple[float,float,float,float]) -> List[Tuple[float,float]]:
    xmin,xmax,ymin,ymax = bbox
    out = []
    for x,y in points:
        if y is None or x is None:
            out.append((x,y))
            continue
        if (xmin-1e-9) <= x <= (xmax+1e-9) and (ymin-1e-9) <= y <= (ymax+1e-9):
            out.append((x,y))
    return out

def _line_to_function(eqt: str, syms: dict) -> Tuple[str, Any]:
    """
    直線 ax+by+c=0 を (mode, params) に変換
      mode='function' : y = m*x + b  → params=(m,b)
      mode='vertical' : x = x0       → params=(x0,)
    """
    x, y = syms["x"], syms["y"]
    t = normalize_expr(eqt)
    if '=' in t:
        L,R = t.split('=',1); expr = sp.sympify(L,locals=syms) - sp.sympify(R,locals=syms)
    else:
        expr = sp.sympify(t,locals=syms)
    expr = sp.expand(expr)
    poly = sp.Poly(expr, x, y, domain="EX")
    if poly.total_degree() > 1:
        raise ValueError("not a line")
    a = sp.simplify(poly.coeff_monomial(x))
    b = sp.simplify(poly.coeff_monomial(y))
    c = sp.simplify(poly.coeff_monomial(1))
    if sp.simplify(b) != 0:
        m = sp.simplify(-a/b)
        bb = sp.simplify(-c/b)
        return ("function", (m, bb))
    elif sp.simplify(a) != 0:
        x0 = sp.simplify(-c/a)
        return ("vertical", (x0,))
    else:
        raise ValueError("invalid line")
    

def _circle_features(eqt: str, syms: dict):
    x,y = syms["x"], syms["y"]
    t = normalize_expr(eqt)
    if '=' in t:
        L,R = t.split('=',1); expr = sp.sympify(L,locals=syms) - sp.sympify(R,locals=syms)
    else:
        expr = sp.sympify(t,locals=syms)
    expr = sp.expand(expr)
    poly = sp.Poly(expr, x, y, domain="EX")
    A = sp.simplify(poly.coeff_monomial(x**2))
    C = sp.simplify(poly.coeff_monomial(y**2))
    Bxy = sp.simplify(poly.coeff_monomial(x*y))
    D = sp.simplify(poly.coeff_monomial(x))
    E = sp.simplify(poly.coeff_monomial(y))
    F = sp.simplify(poly.coeff_monomial(1))
    if sp.simplify(Bxy)!=0 or sp.simplify(A-C)!=0 or sp.simplify(A)==0:
        raise ValueError("not a circle")
    h = sp.simplify(-D/(2*A)); k = sp.simplify(-E/(2*A))
    r2 = sp.simplify((D**2 + E**2)/(4*A**2) - F/A)
    if sp.simplify(r2) < 0: raise ValueError("negative radius")
    r = sp.simplify(sp.sqrt(r2))
    return (h,k,r)

def _parabola_model(eqt: str, syms: dict):
    """
    return ('vertical', a,h,k) for y = a(x-h)^2 + k
        or ('horizontal', a,h,k) for x = a(y-k)^2 + h
    """
    x,y = syms["x"], syms["y"]
    t = normalize_expr(eqt)
    if '=' in t:
        L,R = t.split('=',1); expr = sp.sympify(L,locals=syms) - sp.sympify(R,locals=syms)
    else:
        expr = sp.sympify(t,locals=syms)
    expr = sp.expand(expr)
    poly = sp.Poly(expr, x, y, domain="EX")
    Ax2 = sp.simplify(poly.coeff_monomial(x**2))
    Ay2 = sp.simplify(poly.coeff_monomial(y**2))
    Bxy = sp.simplify(poly.coeff_monomial(x*y))
    Dx = sp.simplify(poly.coeff_monomial(x))
    Ey = sp.simplify(poly.coeff_monomial(y))
    F0 = sp.simplify(poly.coeff_monomial(1))
    if sp.simplify(Bxy)!=0 or (sp.simplify(Ax2)!=0 and sp.simplify(Ay2)!=0):
        raise ValueError("not_axis_aligned_parabola")
    if sp.simplify(Ax2)!=0 and sp.simplify(Ay2)==0:
        if sp.simplify(Ey)==0: raise ValueError("invalid_parabola")
        a = sp.simplify(-Ax2/Ey); b = sp.simplify(-Dx/Ey); c = sp.simplify(-F0/Ey)
        h = sp.simplify(-b/(2*a)); k = sp.simplify(c - a*h**2)
        return ('vertical', a,h,k)
    if sp.simplify(Ay2)!=0 and sp.simplify(Ax2)==0:
        if sp.simplify(Dx)==0: raise ValueError("invalid_parabola")
        a = sp.simplify(-Ay2/Dx); b = sp.simplify(-Ey/Dx); c = sp.simplify(-F0/Dx)
        k = sp.simplify(-b/(2*a)); h = sp.simplify(c - a*k**2)
        return ('horizontal', a,h,k)
    raise ValueError("invalid_parabola")

def _ellipse_features(eqt: str, syms: dict):
    """
    一般二次 Ax^2 + C y^2 + D x + E y + F = 0（xy=0, A>0, C>0）から
    中心 (h,k) と半径 a,b（軸平行）を抽出。
    """
    x, y = syms["x"], syms["y"]
    t = normalize_expr(eqt)
    if '=' in t:
        L,R = t.split('=',1); expr = sp.sympify(L,locals=syms) - sp.sympify(R,locals=syms)
    else:
        expr = sp.sympify(t,locals=syms)
    expr = sp.expand(expr)
    poly = sp.Poly(expr, x, y, domain="EX")
    A = sp.simplify(poly.coeff_monomial(x**2))
    C = sp.simplify(poly.coeff_monomial(y**2))
    Bxy = sp.simplify(poly.coeff_monomial(x*y))
    D = sp.simplify(poly.coeff_monomial(x))
    E = sp.simplify(poly.coeff_monomial(y))
    F = sp.simplify(poly.coeff_monomial(1))
    # 必要条件：xy=0, A>0, C>0
    if sp.simplify(Bxy)!=0 or (sp.simplify(A)<=0) or (sp.simplify(C)<=0):
        raise ValueError("not_axis_aligned_ellipse")
    h = sp.simplify(-D/(2*A))
    k = sp.simplify(-E/(2*C))
    S = sp.simplify(A*h**2 + C*k**2 - F)
    a2 = sp.simplify(S/A)
    b2 = sp.simplify(S/C)
    if sp.simplify(a2)<=0 or sp.simplify(b2)<=0:
        raise ValueError("degenerate_ellipse")
    a = sp.simplify(sp.sqrt(a2))
    b = sp.simplify(sp.sqrt(b2))
    return (h,k,a,b)

def _hyperbola_model(eqt: str, syms: dict):
    """
    Ax^2 + C y^2 + D x + E y + F = 0（xy=0, A*C<0）から
    ('horizontal', a,b,h,k) or ('vertical', a,b,h,k) を返す。
    標準形：
      水平: (x-h)^2/a^2 - (y-k)^2/b^2 = 1
      垂直: (y-k)^2/b^2 - (x-h)^2/a^2 = 1
    """
    x, y = syms["x"], syms["y"]
    t = normalize_expr(eqt)
    if '=' in t:
        L,R = t.split('=',1); expr = sp.sympify(L,locals=syms) - sp.sympify(R,locals=syms)
    else:
        expr = sp.sympify(t,locals=syms)
    expr = sp.expand(expr)
    poly = sp.Poly(expr, x, y, domain="EX")
    A = sp.simplify(poly.coeff_monomial(x**2))
    C = sp.simplify(poly.coeff_monomial(y**2))
    Bxy = sp.simplify(poly.coeff_monomial(x*y))
    D = sp.simplify(poly.coeff_monomial(x))
    E = sp.simplify(poly.coeff_monomial(y))
    F = sp.simplify(poly.coeff_monomial(1))
    if sp.simplify(Bxy)!=0 or sp.simplify(A*C)>=0:
        raise ValueError("not_axis_aligned_hyperbola")
    h = sp.simplify(-D/(2*A))
    k = sp.simplify(-E/(2*C))
    S = sp.simplify(A*h**2 + C*k**2 - F)
    if sp.simplify(S)==0:
        raise ValueError("degenerate_hyperbola")
    if sp.simplify(A) > 0:  # 水平：A>0, C<0
        a2 = sp.simplify(S/A)
        b2 = sp.simplify(-S/C)
        if sp.simplify(a2)<=0 or sp.simplify(b2)<=0: raise ValueError("degenerate_hyperbola")
        return ('horizontal', sp.sqrt(a2), sp.sqrt(b2), h, k)
    else:                     # 垂直：A<0, C>0
        a2 = sp.simplify(-S/A)
        b2 = sp.simplify(S/C)
        if sp.simplify(a2)<=0 or sp.simplify(b2)<=0: raise ValueError("degenerate_hyperbola")
        return ('vertical', sp.sqrt(a2), sp.sqrt(b2), h, k)
    
def _world_to_img_factory(bbox: Tuple[float,float,float,float], width:int, height:int):
    xmin,xmax,ymin,ymax = bbox
    sx = width/(xmax-xmin); sy = height/(ymax-ymin)
    def map_pt(p):
        x,y = p
        if x is None or y is None or not (isinstance(x,(int,float)) and isinstance(y,(int,float))):
            return None
        X = int((x - xmin) * sx + 0.5)
        Y = int((ymax - y) * sy + 0.5)  # yは上下反転
        return (X,Y)
    return map_pt

def _render_from_overlay(overlay_func, overlay_payload: dict, w:int, h:int, show_grid: bool):
    # overlay_* を呼んで points を生成 → overlay_render_png に流す
    res = overlay_func(overlay_payload)
    if not res.get("ok", False):
        return res
    return overlay_render_png(OverlayRenderPayload(
        bbox=OverlayBBox(xmin=res["bbox"][0], xmax=res["bbox"][1], ymin=res["bbox"][2], ymax=res["bbox"][3]),
        layers=res["layers"],
        width=w, height=h, show_grid=show_grid
    ))

def _render_from_layers(bbox_list, layers, w:int, h:int, grid:bool):
    return overlay_render_png(OverlayRenderPayload(
        bbox=OverlayBBox(xmin=bbox_list[0], xmax=bbox_list[1], ymin=bbox_list[2], ymax=bbox_list[3]),
        layers=layers, width=w, height=h, show_grid=grid
    ))


# =========================================================
# 3) Core normalizer
# =========================================================

def normalize_expr(s: str) -> str:
    if s is None:
        return s
    t = s.strip()
    # LaTeX noise
    t = (t.replace(r'\left','').replace(r'\right','')
           .replace(r'\,',' ').replace(r'\;',' ').replace(r'\:',' ').replace(r'\!',' '))
    # frac
    t = re.sub(r'\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}', r'(\1)/(\2)', t)
    # binom
    t = re.sub(r'\\binom\s*\{([^{}]+)\}\s*\{([^{}]+)\}', r'binomial(\1,\2)', t)
    # abs
    t = re.sub(r'\\abs\s*\{([^{}]+)\}', r'Abs(\1)', t)
    t = re.sub(r'\\lvert\s*([^{}]+?)\s*\\rvert', r'Abs(\1)', t)
    t = re.sub(r'\|([^|]+)\|', r'Abs(\1)', t)
    # floor/ceil
    t = re.sub(r'\\lfloor\s*([^{}]+?)\s*\\rfloor', r'floor(\1)', t)
    t = re.sub(r'\\lceil\s*([^{}]+?)\s*\\rceil',   r'ceiling(\1)', t)
    # sqrt
    t = re.sub(r'\\sqrt\s*\{([^{}]+)\}', r'sqrt(\1)', t)
    # pre insert * before LaTeX funcs after number or ')'
    _fn = r'(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|log|ln|exp)'
    t = re.sub(r'(\d)\s*\\' + _fn + r'\s*\(', r'\1*\\\2(', t)
    t = re.sub(r'(\d)\s*\\' + _fn + r'\b',    r'\1*\\\2', t)
    t = re.sub(r'\)\s*\\' + _fn + r'\s*\(',   r')*\\\1(', t)
    t = re.sub(r'\)\s*\\' + _fn + r'\b',      r')*\\\1', t)
    # LaTeX funcs → plain
    t = re.sub(r'\\' + _fn + r'\s*\(', r'\1(', t)
    t = re.sub(r'\\' + _fn + r'\s+([A-Za-z0-9_])', r'\1(\2', t)
    # powers: \sin^2 x
    t = re.sub(r'\\' + _fn + r'\s*\^\s*(\d+)\s*\(\s*([^()]+?)\s*\)',
               lambda m: f"({m.group(1)}({m.group(3)}))**{m.group(2)}", t)
    t = re.sub(r'\\' + _fn + r'\s*\^\s*(\d+)\s+([A-Za-z0-9_]+)',
               lambda m: f"({m.group(1)}({m.group(3)}))**{m.group(2)}", t)
    # complex helpers
    t = re.sub(r'\\Re\s*\(?\s*([^()\s]+)\s*\)?', r're(\1)', t)
    t = re.sub(r'\\Im\s*\(?\s*([^()\s]+)\s*\)?', r'im(\1)', t)
    t = re.sub(r'\\arg\s*\(?\s*([^()\s]+)\s*\)?', r'arg(\1)', t)
    t = re.sub(r'\\overline\s*\{([^{}]+)\}', r'conjugate(\1)', t)
    t = re.sub(r'\\bar\s*\{([^{}]+)\}',       r'conjugate(\1)', t)
    t = re.sub(r'\bcis\s*\(\s*([^()]+)\s*\)', r'exp(I*(\1))', t)
    t = re.sub(r'(?<![A-Za-z0-9_])i(?![A-Za-z0-9_])', 'I', t)
    # congruence
    t = t.replace(r'\equiv','≡')
    t = re.sub(r'\((?:mod|Mod)\s*([^)]+)\)', r'mod \1', t)
    # operators
    t = t.replace('==','=')
    t = (t.replace('^','**').replace('−','-').replace('－','-')
           .replace('×','*').replace('·','*').replace(r'\cdot','*'))
    t = t.replace('≤','<=').replace('≥','>=')
    t = t.replace(r'\le','<=').replace(r'\ge','>=')
    # braces
    t = t.replace('{','(').replace('}',')')
    # protect
    t, toks = _protect_funcs(t)
    # factorial
    t = re.sub(r'\(([^()]+)\)!', r'factorial(\1)', t)
    t = re.sub(r'(?<![A-Za-z0-9_])(?!factorial\()([A-Za-z0-9_]+)!(?!=)', r'factorial(\1)', t)
    # implicit *
    t = re.sub(r'(\d)([A-Za-z])', r'\1*\2', t)
    t = re.sub(r'([A-Za-z])(\d)', r'\1*\2', t)
    t = re.sub(r'([A-Za-z0-9_])\(', r'\1*(', t)
    t = re.sub(r'\)(?=\()', ')*(', t)
    t = re.sub(r'\)(?=[A-Za-z0-9_])', r')*', t)
    # token boundaries
    t = re.sub(r'(\d)(¤\d+¤)', r'\1*\2', t)
    t = re.sub(r'\)(?=¤\d+¤)', r')*', t)
    t = re.sub(r'(¤\d+¤)(?=[A-Za-z0-9_])', r'\1*', t)
    t = re.sub(r'(¤\d+¤)\*\(', r'\1(', t)
    # spaces
    t = re.sub(r'\s+', ' ', t).strip()
    # restore
    t = _restore_funcs(t, toks)
    t = t.replace('ln(', 'log(')
    return t

# =========================================================
# 4) Steps grading (with substitution & numeric fallback)
# =========================================================

class StepItem(BaseModel):
    src: str
    dst: str
    kind: Optional[str] = None      # 'expression'|'equation'|'inequality'|'diff'|'int'|'eq_forward'|'eq_backward'|'ineq_mult'|'ineq_div'
    var:  Optional[str] = None      # diff/int 用の変数
    factor: Optional[str] = None    # ineq_mult/ineq_div 用
    let: Optional[List[str]] = None # 例: ["u=3x", "t=x+y"]
    subs: Optional[Dict[str, str]] = None  # 例: {"u":"3x","t":"x+y"}
    note: Optional[str] = None

class GradeStepsPayload(BaseModel):
    steps: List[StepItem]
    vars: List[str] = ["x"]
    domain: tuple[float,float] = (-5.0,5.0)
    samples: int = 16
    tol: float = 1e-6
    assumptions: List[str] = []

def _implies(src_text: str, dst_text: str, syms: dict, domain, samples: int,
             assumptions: Optional[List[str]] = None,
             pre_subs: Optional[Dict[sp.Symbol, sp.Expr]] = None) -> bool:
    a0, b0 = domain
    xs = list(syms.values())
    base = [a0, b0, (a0+b0)/2, 0, 1, -1, 2, -2, 0.5, -0.5]
    tries = max(samples, 16)
    for _ in range(tries):
        subs = { s: (base[random.randrange(len(base))] if random.random()<0.6 else a0+(b0-a0)*random.random()) for s in xs }
        if assumptions and not all(_holds_rel(cond, syms, subs) for cond in assumptions):
            continue
        prem = _holds_rel(src_text, syms, subs, pre_subs=pre_subs)
        if prem and not _holds_rel(dst_text, syms, subs, pre_subs=pre_subs):
            return False
    return True

def _parse_subs_map(st: StepItem, syms_shared: dict) -> Dict[sp.Symbol, sp.Expr]:
    mapping: Dict[sp.Symbol, sp.Expr] = {}
    if st.subs:
        for k, v in st.subs.items():
            sym = sp.Symbol(k)
            mapping[sym] = sp.sympify(normalize_expr(v), locals=syms_shared)
    if st.let:
        for item in st.let:
            try:
                lhs, rhs = item.split('=', 1)
                sym = sp.Symbol(lhs.strip())
                mapping[sym] = sp.sympify(normalize_expr(rhs.strip()), locals=syms_shared)
            except Exception:
                pass
    return mapping

def _infer_pre_subs(src_text: str, dst_text: str, syms: dict) -> Optional[Dict[sp.Symbol, sp.Expr]]:
    """
    1変数の“導入置換”を簡易推論:
      例) sin(3x) → sin(u) なら {u: 3x}
          f(g(x)) → f(u)     なら {u: g(x)}
    """
    try:
        src = sp.sympify(normalize_expr(src_text), locals=syms)
        dst = sp.sympify(normalize_expr(dst_text), locals=syms)
    except Exception:
        return None
    if not (hasattr(src, "func") and hasattr(dst, "func")):
        return None
    if src.func != dst.func:
        return None
    if len(getattr(src, "args", ())) != 1 or len(getattr(dst, "args", ())) != 1:
        return None
    arg_src = src.args[0]
    arg_dst = dst.args[0]
    if isinstance(arg_dst, sp.Symbol):
        return { arg_dst: arg_src }
    return None

@app.post("/grade_steps")
def grade_steps(p: GradeStepsPayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        results = []
        ok_count = 0

        for st in p.steps:
            kind = (st.kind or _rel_kind(st.src)).lower()
            var  = st.var or "x"

            # let/subs → pre_subs、無ければ自動推論
            pre_subs = _parse_subs_map(st, syms)
            if not pre_subs:
                inferred = _infer_pre_subs(st.src, st.dst, syms)
                if inferred:
                    pre_subs = inferred

            try:
                if kind == "diff":
                    x = sp.Symbol(var, real=True)
                    src = sp.sympify(normalize_expr(st.src), locals=syms | {var: x})
                    dst = sp.sympify(normalize_expr(st.dst), locals=syms | {var: x})
                    if pre_subs:
                        src = src.subs(pre_subs); dst = dst.subs(pre_subs)
                    diff_res = sp.simplify(sp.diff(src, x) - dst)
                    ok = (diff_res == 0)
                    if not ok:
                        try:
                            a0, b0 = p.domain
                            samples = max(8, p.samples)
                            count = 0
                            for _ in range(samples):
                                subs = { s: a0 + (b0 - a0) * random.random() for s in (src.free_symbols | dst.free_symbols) }
                                val = sp.N(diff_res.subs(subs))
                                if getattr(val, "is_finite", None) is False:
                                    continue
                                if abs(float(val)) < p.tol:
                                    count += 1
                            ok = (count >= max(4, samples // 2))
                        except Exception:
                            ok = False

                elif kind == "int":
                    x = sp.Symbol(var, real=True)
                    src = sp.sympify(normalize_expr(st.src), locals=syms | {var: x})
                    dst = sp.sympify(normalize_expr(st.dst), locals=syms | {var: x})
                    if pre_subs:
                        src = src.subs(pre_subs); dst = dst.subs(pre_subs)
                    diff_res = sp.simplify(sp.diff(dst, x) - src)
                    ok = (diff_res == 0) or (len(diff_res.free_symbols) == 0)  # +C 許容
                    if not ok:
                        try:
                            a0, b0 = p.domain
                            samples = max(8, p.samples)
                            count = 0
                            for _ in range(samples):
                                subs = { s: a0 + (b0 - a0) * random.random() for s in (src.free_symbols | dst.free_symbols) }
                                val = sp.N(diff_res.subs(subs))
                                if getattr(val, "is_finite", None) is False:
                                    continue
                                if abs(float(val)) < p.tol:
                                    count += 1
                            ok = (count >= max(4, samples // 2))
                        except Exception:
                            ok = False

                elif kind == "eq_forward":
                    ok = _implies(st.src, st.dst, syms, p.domain, p.samples, p.assumptions, pre_subs=pre_subs)

                elif kind == "eq_backward":
                    ok = _implies(st.src, st.dst, syms, p.domain, p.samples, p.assumptions, pre_subs=pre_subs)

                elif kind in ("ineq_mult", "ineq_div"):
                    k = st.factor or ("1" if kind == "ineq_mult" else "1")
                    if kind == "ineq_div" and st.factor:
                        k = f"1/({st.factor})"
                    ok = _ineq_mult_ok(st.src, st.dst, k, syms, p.domain, p.samples)

                elif kind == "expression":
                    ok = _expr_equal(st.src, st.dst, syms, p.domain, p.samples, p.tol, pre_subs=pre_subs)

                else:
                    ok = _rel_equiv(st.src, st.dst, syms, p.domain, p.samples)

                results.append({"ok": bool(ok), "kind": kind})
                if ok:
                    ok_count += 1

            except Exception as e:
                results.append({"ok": False, "kind": kind, "error": str(e)})

        score = ok_count / max(1, len(p.steps))
        return {"ok": True, "score": float(score), "items": results}

    except Exception as e:
        return {"ok": False, "error": str(e)}

# =========================================================
# 5) Core verifiers (equation / calc / sets / algebra)
# =========================================================

@app.post("/verify_equation")
def verify_equation(p: EquationPayload):
    try:
        key = f"verify_equation:{p.lhs_latex}|{p.rhs_latex}"
        cached = _cache_get(key)
        if cached is not None: return cached
        lhs = sp.sympify(normalize_expr(p.lhs_latex))
        rhs = sp.sympify(normalize_expr(p.rhs_latex))
        ok = (sp.simplify(lhs - rhs) == 0)
        res = {"ok": bool(ok)}
        _cache_set(key, res); return res
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/differentiate")
def differentiate(p: DiffPayload):
    try:
        expr = sp.sympify(normalize_expr(p.expr_latex))
        diffed = sp.diff(expr, sp.Symbol(p.variable))
        return {"result_latex": sp.latex(diffed)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/solve")
def solve(p: SolvePayload):
    try:
        expr = sp.sympify(normalize_expr(p.equation_latex))
        sol = sp.solve(expr, sp.Symbol(p.variable))
        return {"solutions_latex": [sp.latex(s) for s in sol]}
    except Exception as e:
        return {"error": str(e)}

class DerivativePayload(BaseModel):
    func_latex: str
    variable: str = "x"
    expected_latex: str

def _numeric_equal(f, g, x, samples=6, domain=(-2,2), tol=1e-6):
    a, b = domain
    ok = 0; tried = 0
    while tried < samples and ok < samples:
        tried += 1
        v = a + (b-a)*random.random()
        fv = sp.N(f.subs({x:v})); gv = sp.N(g.subs({x:v}))
        if (getattr(fv,"is_finite",None) is False) or (getattr(gv,"is_finite",None) is False):
            continue
        denom = max(1.0, float(abs(gv)))
        if abs(float(fv-gv))/denom < tol: ok += 1
        else: return False
    return ok >= samples

@app.post("/verify_derivative")
def verify_derivative(p: DerivativePayload):
    try:
        x = sp.Symbol(p.variable)
        f = sp.sympify(normalize_expr(p.func_latex))
        exp = sp.sympify(normalize_expr(p.expected_latex))
        d = sp.diff(f, x)
        if sp.simplify(d - exp) == 0 or _numeric_equal(d, exp, x):
            return {"ok": True, "computed_latex": sp.latex(d)}
        return {"ok": False, "reason": "mismatch", "computed_latex": sp.latex(d)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_integral")
def verify_integral(p: IntegralPayload):
    try:
        x = sp.Symbol(p.var)
        f = sp.sympify(normalize_expr(p.integrand))
        F = sp.sympify(normalize_expr(p.expected))
        ok = sp.simplify(sp.diff(F, x) - f) == 0
        return {"ok": bool(ok)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_roots")
def verify_roots(p: RootsPayload):
    try:
        x = sp.Symbol(p.var)
        expr = _equation_to_expr(p.equation)
        for s in p.solutions:
            s_norm = normalize_expr(s)
            val = sp.simplify(expr.subs({x: sp.sympify(s_norm)}))
            if val != 0:
                val_num = sp.N(val)
                if float(abs(val_num)) > p.tol:
                    return {"ok": False, "which": s}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_limit")
def verify_limit(p: LimitPayload):
    try:
        x = sp.Symbol(p.var)
        expr = sp.sympify(normalize_expr(p.expr))
        a = sp.sympify(normalize_expr(p.at))
        exp = sp.sympify(normalize_expr(p.expected))
        if p.dir in ("+","-"):
            val = sp.limit(expr, x, a, dir=p.dir)
            ok = bool(val == exp or (hasattr(val, "equals") and val.equals(exp)))
            return {"ok": ok, "computed": sp.sstr(val)}
        lp = sp.limit(expr, x, a, dir='-')
        rp = sp.limit(expr, x, a, dir='+')
        both_ok = (lp == rp or (hasattr(lp,"equals") and lp.equals(rp))) and \
                  (lp == exp or (hasattr(lp,"equals") and lp.equals(exp)))
        return {"ok": bool(both_ok), "left": sp.sstr(lp), "right": sp.sstr(rp)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_series")
def verify_series(p: SeriesPayload):
    try:
        x = sp.Symbol(p.var)
        expr = sp.sympify(normalize_expr(p.expr))
        a = sp.sympify(normalize_expr(p.center))
        exp_poly = sp.sympify(normalize_expr(p.expected))
        ser = sp.series(expr, x, a, p.order)
        ser_poly = sp.expand(ser.removeO())
        ok = sp.simplify(ser_poly - exp_poly) == 0
        return {"ok": bool(ok), "computed": sp.sstr(ser_poly)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_batch")
def verify_batch(p: BatchPayload):
    out = []
    for it in p.items:
        t = it.type
        try:
            if t == "derivative":
                out.append(verify_derivative(DerivativePayload(**it.payload)))
            elif t == "integral":
                out.append(verify_integral(IntegralPayload(**it.payload)))
            elif t == "equation":
                out.append(verify_equation(EquationPayload(**it.payload)))
            elif t == "roots":
                out.append(verify_roots(RootsPayload(**it.payload)))
            elif t == "system":
                out.append(verify_system(SystemPayload(**it.payload)))
            elif t == "inequality":
                out.append(verify_inequality(InequalityPayload(**it.payload)))
            elif t == "limit":
                out.append(verify_limit(LimitPayload(**it.payload)))
            elif t == "series":
                out.append(verify_series(SeriesPayload(**it.payload)))
            elif t == "numeric_compare":
                out.append(numeric_compare(NumericComparePayload(**it.payload)))
            else:
                out.append({"ok": False, "error": f"unknown type: {t}"})
        except Exception as e:
            out.append({"ok": False, "error": str(e)})
    return {"ok": True, "results": out}

# =========================================================
# 6) Sequences / Sums / Integer identities
# =========================================================

@app.post("/verify_sequence_term")
def verify_sequence_term(p: SeqTermPayload):
    try:
        syms = _int_symbols([p.var])
        n = syms[p.var]
        a = sp.sympify(normalize_expr(p.term),     locals=syms)
        b = sp.sympify(normalize_expr(p.expected), locals=syms)
        if sp.simplify(a-b) == 0:
            return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            v = random.randint(lo, hi)
            if sp.N(a.subs({n:v})) != sp.N(b.subs({n:v})):
                return {"ok": False, "counterexample": v}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_sum")
def verify_sum(p: SumPayload):
    try:
        names = list(set([p.index] + (p.param_vars or [])))
        syms  = _int_symbols(names)
        k     = syms[p.index]
        summand  = sp.sympify(normalize_expr(p.summand),  locals=syms)
        lower    = sp.sympify(normalize_expr(p.lower),    locals=syms)
        upper    = sp.sympify(normalize_expr(p.upper),    locals=syms)
        expected = sp.sympify(normalize_expr(p.expected), locals=syms)
        sym = sp.summation(summand, (k, lower, upper)).doit()
        if sp.simplify(sym - expected) == 0:
            return {"ok": True}
        if p.param_vars:
            for _ in range(6):
                subs = { syms[v]: random.randint(1, 10) for v in p.param_vars }
                symv = sp.summation(summand.subs(subs), (k, lower.subs(subs), upper.subs(subs))).doit()
                expv = sp.simplify(expected.subs(subs))
                if sp.N(symv) != sp.N(expv):
                    return {"ok": False, "counterexample": {v: int(subs[syms[v]]) for v in p.param_vars}}
            return {"ok": True}
        return {"ok": False, "reason": "symbolic_mismatch"}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_integer_identity")
def verify_integer_identity(p: IntIdentityPayload):
    try:
        syms = _int_symbols(p.vars)
        lhs = sp.sympify(normalize_expr(p.lhs), locals=syms)
        rhs = sp.sympify(normalize_expr(p.rhs), locals=syms)
        if sp.simplify(lhs - rhs) == 0:
            return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = {}
            if "n" in p.vars:
                n = random.randint(max(1, lo), hi)
                subs[syms["n"]] = n
            for v in p.vars:
                if v == "k" and "n" in p.vars:
                    subs[syms["k"]] = random.randint(0, subs[syms["n"]])
                elif syms.get(v) not in subs:
                    subs[syms[v]] = random.randint(max(1, lo), hi)
            if sp.N(lhs.subs(subs)) != sp.N(rhs.subs(subs)):
                return {"ok": False, "counterexample": {k: int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

# =========================================================
# 7) Complex / Congruence
# =========================================================

@app.post("/verify_complex_identity")
def verify_complex_identity(p: ComplexIdentityPayload):
    try:
        syms = { nm: sp.Symbol(nm) for nm in p.vars }
        lhs = sp.sympify(normalize_expr(p.lhs), locals=syms)
        rhs = sp.sympify(normalize_expr(p.rhs), locals=syms)
        if sp.simplify(lhs - rhs) == 0:
            return {"ok": True}
        a,b = p.domain
        for _ in range(p.samples):
            subs = {}
            for nm in p.vars:
                re = a + (b-a)*random.random()
                im = a + (b-a)*random.random()
                subs[syms[nm]] = re + im*sp.I
            lv = sp.N(lhs.subs(subs)); rv = sp.N(rhs.subs(subs))
            if complex(lv) != complex(rv):
                return {"ok": False, "counterexample": {k: complex(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_congruence")
def verify_congruence(p: CongruencePayload):
    try:
        syms = { nm: sp.Symbol(nm, integer=True) for nm in p.vars }
        lhs = sp.sympify(normalize_expr(p.lhs), locals=syms)
        rhs = sp.sympify(normalize_expr(p.rhs), locals=syms)
        m   = sp.sympify(normalize_expr(p.mod), locals=syms)
        try:
            if sp.simplify(sp.Mod(lhs - rhs, m)) == 0:
                return {"ok": True}
        except Exception:
            pass
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { syms[n]: random.randint(lo, hi) for n in p.vars }
            val = sp.Mod(sp.simplify((lhs - rhs).subs(subs)), m.subs(subs))
            if int(val) != 0:
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

# =========================================================
# 8) Matrices / Vectors
# =========================================================

@app.post("/verify_matrix_equal")
def verify_matrix_equal(p: MatrixEqPayload):
    try:
        if len(p.lhs) != len(p.rhs) or len(p.lhs[0]) != len(p.rhs[0]):
            return {"ok": False, "error": "shape_mismatch"}
        syms = { nm: sp.Symbol(nm) for nm in p.vars }
        A = sp.Matrix([[ sp.sympify(normalize_expr(e), locals=syms) for e in row ] for row in p.lhs])
        B = sp.Matrix([[ sp.sympify(normalize_expr(e), locals=syms) for e in row ] for row in p.rhs])
        if (A - B).applyfunc(sp.simplify) == sp.zeros(*A.shape):
            return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { syms[n]: random.randint(lo,hi) for n in p.vars }
            if (A.subs(subs) - B.subs(subs)) != sp.zeros(*A.shape):
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_determinant")
def verify_determinant(p: DeterminantPayload):
    try:
        syms = { nm: sp.Symbol(nm) for nm in p.vars }
        M = sp.Matrix([[ sp.sympify(normalize_expr(e), locals=syms) for e in row ] for row in p.mat])
        det = sp.simplify(M.det())
        exp = sp.sympify(normalize_expr(p.expected), locals=syms)
        if sp.simplify(det - exp) == 0:
            return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { syms[n]: random.randint(lo,hi) for n in p.vars }
            if sp.N(det.subs(subs)) != sp.N(exp.subs(subs)):
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def _vec(components: list[str], locals_map: dict) -> sp.Matrix:
    return sp.Matrix([ sp.sympify(normalize_expr(c), locals=locals_map) for c in components ])

def _vec_eq(A: sp.Matrix, B: sp.Matrix) -> bool:
    try:
        return (A - B).applyfunc(sp.simplify) == sp.zeros(*A.shape)
    except Exception:
        return False

@app.post("/verify_vector_equal")
def verify_vector_equal(p: VectorEqPayload):
    try:
        syms = _real_symbols(p.vars)
        A = _vec(p.lhs, syms); B = _vec(p.rhs, syms)
        if A.shape != B.shape: return {"ok": False, "error": "shape_mismatch"}
        if _vec_eq(A, B): return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { _real_symbols(p.vars)[v]: random.randint(lo,hi) for v in p.vars }  # same symbols
            if (A.subs(subs) - B.subs(subs)) != sp.zeros(*A.shape):
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_vector_dot")
def verify_vector_dot(p: VectorDotPayload):
    try:
        syms = _real_symbols(p.vars)
        A = _vec(p.a, syms); B = _vec(p.b, syms)
        if A.shape != B.shape: return {"ok": False, "error": "shape_mismatch"}
        dot = sp.simplify((A.T * B)[0])
        exp = sp.sympify(normalize_expr(p.expected), locals=syms)
        if sp.simplify(dot - exp) == 0: return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { _real_symbols(p.vars)[v]: random.randint(lo,hi) for v in p.vars }
            if sp.N(dot.subs(subs)) != sp.N(exp.subs(subs)):
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}, "computed": str(sp.N(dot.subs(subs)))}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_vector_cross")
def verify_vector_cross(p: VectorCrossPayload):
    try:
        syms = _real_symbols(p.vars)
        A = _vec(p.a, syms); B = _vec(p.b, syms); E = _vec(p.expected, syms)
        if A.shape != (3,1) or B.shape != (3,1) or E.shape != (3,1):
            return {"ok": False, "error": "cross_requires_3d"}
        C = sp.simplify(A.cross(B))
        if _vec_eq(C, E): return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { _real_symbols(p.vars)[v]: random.randint(lo,hi) for v in p.vars }
            if (C.subs(subs) - E.subs(subs)) != sp.zeros(3,1):
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_vector_magnitude")
def verify_vector_magnitude(p: VectorMagPayload):
    try:
        syms = _real_symbols(p.vars)
        A = _vec(p.a, syms)
        mag = sp.simplify(sp.sqrt(sum(c**2 for c in A)))
        exp = sp.sympify(normalize_expr(p.expected), locals=syms)
        if sp.simplify(mag - exp) == 0: return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { _real_symbols(p.vars)[v]: random.randint(lo,hi) for v in p.vars }
            if abs(float(sp.N(mag.subs(subs)) - sp.N(exp.subs(subs)))) > 1e-6:
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_vector_angle")
def verify_vector_angle(p: VectorAnglePayload):
    try:
        syms = _real_symbols(p.vars)
        A = _vec(p.a, syms); B = _vec(p.b, syms)
        if A.shape != B.shape: return {"ok": False, "error": "shape_mismatch"}
        dot = sp.simplify((A.T * B)[0])
        magA = sp.sqrt(sum(c**2 for c in A)); magB = sp.sqrt(sum(c**2 for c in B))
        cos_actual = sp.simplify(sp.together(dot/(magA*magB)))
        if p.expected is not None:
            ang = sp.sympify(normalize_expr(p.expected), locals=syms)
            cos_expected = sp.simplify(sp.cos(ang))
            if sp.simplify(cos_actual - cos_expected) == 0:
                return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { _real_symbols(p.vars)[v]: random.randint(lo,hi) for v in p.vars }
            ca = float(sp.N(cos_actual.subs(subs)))
            if p.expected is not None:
                ce = float(sp.N(sp.cos(sp.sympify(normalize_expr(p.expected), locals=syms)).subs(subs)))
                if abs(ca - ce) > p.tol:
                    return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}, "cos_actual": ca, "cos_expected": ce}
            else:
                if not math.isfinite(ca):
                    return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}, "cos_actual": ca}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_vector_orthogonal")
def verify_vector_orthogonal(p: VectorBoolPayload):
    try:
        syms = _real_symbols(p.vars)
        A = _vec(p.a, syms); B = _vec(p.b, syms)
        dot = sp.simplify((A.T * B)[0])
        if sp.simplify(dot) == 0: return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { _real_symbols(p.vars)[v]: random.randint(lo,hi) for v in p.vars }
            if abs(float(sp.N(dot.subs(subs)))) > p.tol:
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_vector_parallel")
def verify_vector_parallel(p: VectorBoolPayload):
    try:
        syms = _real_symbols(p.vars)
        A = _vec(p.a, syms); B = _vec(p.b, syms)
        if A.shape != B.shape: return {"ok": False, "error": "shape_mismatch"}
        if A.shape == (3,1):
            C = sp.simplify(A.cross(B))
            if C == sp.zeros(3,1): return {"ok": True}
        lo, hi = p.domain
        for _ in range(p.samples):
            subs = { _real_symbols(p.vars)[v]: random.randint(lo,hi) for v in p.vars }
            Av = list(map(lambda c: float(sp.N(c.subs(subs))), A))
            Bv = list(map(lambda c: float(sp.N(c.subs(subs))), B))
            ratios = []
            for ai, bi in zip(Av, Bv):
                if abs(bi) < 1e-9 and abs(ai) < 1e-9: continue
                if abs(bi) < 1e-9: return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
                ratios.append(ai/bi)
            if len(ratios) == 0:
                continue
            if max(ratios) - min(ratios) > 1e-6:
                return {"ok": False, "counterexample": {k:int(v) for k,v in subs.items()}}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

# =========================================================
# 9) Geometry: line / circle / parabola / (ellipse, hyperbola basic)
# =========================================================

@app.post("/verify_line_equal")
def verify_line_equal(p: LineEqPayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        A1 = _line_coeffs(p.lhs, syms); A2 = _line_coeffs(p.rhs, syms)
        if not A1 or not A2:
            return {"ok": False, "error": "not_a_line"}
        a1,b1,c1 = A1; a2,b2,c2 = A2
        ok = (
            sp.simplify(a1*b2 - a2*b1) == 0 and
            sp.simplify(a1*c2 - a2*c1) == 0 and
            sp.simplify(b1*c2 - b2*c1) == 0
        )
        return {"ok": bool(ok)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_line_slope_intercept")
def verify_line_slope_intercept(p: LineSlopePayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        coeffs = _line_coeffs(p.equation, syms)
        if not coeffs:
            return {"ok": False, "error": "not_a_line"}
        a,b,c = coeffs
        if sp.simplify(b) == 0:
            return {"ok": False, "error": "vertical_line"}
        m  = sp.simplify(-a/b)
        b0 = sp.simplify(-c/b)
        m_exp  = sp.sympify(normalize_expr(p.slope), locals=syms)
        b_exp  = sp.sympify(normalize_expr(p.intercept), locals=syms)
        ok = (sp.simplify(m - m_exp) == 0) and (sp.simplify(b0 - b_exp) == 0)
        return {"ok": bool(ok), "computed": {"slope": sp.sstr(m), "intercept": sp.sstr(b0)}}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_circle_features")
def verify_circle_features(p: CircleFeaturesPayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        x, y = syms["x"], syms["y"]
        t = normalize_expr(p.equation)
        if '=' in t:
            lhs, rhs = t.split('=', 1)
            expr = sp.sympify(lhs, locals=syms) - sp.sympify(rhs, locals=syms)
        else:
            expr = sp.sympify(t, locals=syms)
        expr = sp.expand(expr)
        def _coeffs(expr: sp.Expr):
            try:
                poly = sp.Poly(expr, x, y, domain="EX")
                A = sp.simplify(poly.coeff_monomial(x**2))
                C = sp.simplify(poly.coeff_monomial(y**2))
                Bxy = sp.simplify(poly.coeff_monomial(x*y))
                D = sp.simplify(poly.coeff_monomial(x))
                E = sp.simplify(poly.coeff_monomial(y))
                F = sp.simplify(poly.coeff_monomial(1))
                return A, Bxy, C, D, E, F
            except Exception:
                e = sp.expand(expr)
                A = sp.simplify(e.coeff(x, 2).coeff(y, 0))
                C = sp.simplify(e.coeff(y, 2).coeff(x, 0))
                Bxy = sp.simplify(e.coeff(x, 1).coeff(y, 1))
                D = sp.simplify(e.coeff(x, 1).coeff(y, 0))
                E = sp.simplify(e.coeff(y, 1).coeff(x, 0))
                F = sp.simplify(e.subs({x: 0, y: 0}))
                return A, Bxy, C, D, E, F
        A, Bxy, C, D, E, F = _coeffs(expr)
        if sp.simplify(Bxy) != 0 or sp.simplify(A - C) != 0:
            return {"ok": False, "error": "not_a_circle", "computed": {"A": sp.sstr(A), "C": sp.sstr(C)}}
        if sp.simplify(A) == 0:
            return {"ok": False, "error": "degenerate", "computed": {"A": sp.sstr(A), "C": sp.sstr(C)}}
        h = sp.simplify(-D/(2*A))
        k = sp.simplify(-E/(2*A))
        r2 = sp.simplify((D**2 + E**2)/(4*A**2) - F/A)
        if sp.simplify(r2) < 0:
            return {"ok": False, "error": "negative_radius", "computed": {"r2": sp.sstr(r2)}}
        r = sp.simplify(sp.sqrt(r2))
        hx = sp.sympify(normalize_expr(p.center_x), locals=syms)
        ky = sp.sympify(normalize_expr(p.center_y), locals=syms)
        rr = sp.sympify(normalize_expr(p.radius),   locals=syms)
        ok_center = (sp.simplify(h - hx) == 0) and (sp.simplify(k - ky) == 0)
        ok_radius = (sp.simplify(r - rr) == 0) or (sp.simplify(r + rr) == 0)
        return { "ok": bool(ok_center and ok_radius),
                 "computed": {"center_x": sp.sstr(h), "center_y": sp.sstr(k), "radius": sp.sstr(r)} }
    except Exception as e:
        return {"ok": False, "error": str(e)}

class ParabolaFeaturesPayload(BaseModel):
    equation: str
    vertex_x: str
    vertex_y: str
    focus_x: str
    focus_y: str
    directrix: str
    vars: List[str] = ["x","y"]

@app.post("/verify_parabola_features")
def verify_parabola_features(p: ParabolaFeaturesPayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        x, y = syms["x"], syms["y"]
        t = normalize_expr(p.equation)
        if '=' in t:
            lhs, rhs = t.split('=', 1)
            expr = sp.sympify(lhs, locals=syms) - sp.sympify(rhs, locals=syms)
        else:
            expr = sp.sympify(t, locals=syms)
        expr = sp.expand(expr)
        def _coeffs(expr: sp.Expr):
            try:
                poly = sp.Poly(expr, x, y, domain="EX")
                Ax2 = sp.simplify(poly.coeff_monomial(x**2))
                Ay2 = sp.simplify(poly.coeff_monomial(y**2))
                Bxy = sp.simplify(poly.coeff_monomial(x*y))
                Dx = sp.simplify(poly.coeff_monomial(x))
                Ey = sp.simplify(poly.coeff_monomial(y))
                F0 = sp.simplify(poly.coeff_monomial(1))
                return Ax2, Ay2, Bxy, Dx, Ey, F0
            except Exception:
                e = sp.expand(expr)
                Ax2 = sp.simplify(e.coeff(x,2).coeff(y,0))
                Ay2 = sp.simplify(e.coeff(y,2).coeff(x,0))
                Bxy = sp.simplify(e.coeff(x,1).coeff(y,1))
                Dx  = sp.simplify(e.coeff(x,1).coeff(y,0))
                Ey  = sp.simplify(e.coeff(y,1).coeff(x,0))
                F0  = sp.simplify(e.subs({x:0,y:0}))
                return Ax2, Ay2, Bxy, Dx, Ey, F0
        Ax2, Ay2, Bxy, Dx, Ey, F0 = _coeffs(expr)
        if sp.simplify(Bxy) != 0 or (sp.simplify(Ax2) != 0 and sp.simplify(Ay2) != 0):
            return {"ok": False, "error": "not_axis_aligned_parabola"}
        # 縦開き
        if sp.simplify(Ax2) != 0 and sp.simplify(Ay2) == 0:
            A = Ax2
            if sp.simplify(Ey) == 0: return {"ok": False, "error": "invalid_parabola"}
            a = sp.simplify(-A/Ey); b = sp.simplify(-Dx/Ey); c = sp.simplify(-F0/Ey)
            h = sp.simplify(-b/(2*a)); k = sp.simplify(c - a*h**2); ppar = sp.simplify(1/(4*a))
            focus = (sp.simplify(h), sp.simplify(k + ppar))
            directrix = sp.simplify(k - ppar)
            hx = sp.sympify(normalize_expr(p.vertex_x), locals=syms)
            ky = sp.sympify(normalize_expr(p.vertex_y), locals=syms)
            fx = sp.sympify(normalize_expr(p.focus_x),  locals=syms)
            fy = sp.sympify(normalize_expr(p.focus_y),  locals=syms)
            def _directrix_equal(d_expr):
                t2 = normalize_expr(str(d_expr))
                if '=' in t2:
                    L,R = t2.split('=',1)
                    de = sp.simplify(sp.sympify(L,locals=syms)-sp.sympify(R,locals=syms))
                else:
                    de = sp.simplify(sp.sympify(t2,locals=syms))
                return sp.simplify(de - (y - directrix)) == 0
            ok_vertex = (sp.simplify(h - hx) == 0) and (sp.simplify(k - ky) == 0)
            ok_focus  = (sp.simplify(focus[0] - fx) == 0) and (sp.simplify(focus[1] - fy) == 0)
            ok_direct = _directrix_equal(p.directrix)
            return {"ok": bool(ok_vertex and ok_focus and ok_direct),
                    "computed": {"vertex": (sp.sstr(h), sp.sstr(k)),
                                 "focus": (sp.sstr(focus[0]), sp.sstr(focus[1])),
                                 "directrix": f"y={sp.sstr(directrix)}"}}
        # 横開き
        if sp.simplify(Ay2) != 0 and sp.simplify(Ax2) == 0:
            A = Ay2
            if sp.simplify(Dx) == 0: return {"ok": False, "error": "invalid_parabola"}
            a = sp.simplify(-A/Dx); b = sp.simplify(-Ey/Dx); c = sp.simplify(-F0/Dx)
            k = sp.simplify(-b/(2*a)); h = sp.simplify(c - a*k**2); ppar = sp.simplify(1/(4*a))
            focus = (sp.simplify(h + ppar), sp.simplify(k))
            directrix = sp.simplify(h - ppar)
            hx = sp.sympify(normalize_expr(p.vertex_x), locals=syms)
            ky = sp.sympify(normalize_expr(p.vertex_y), locals=syms)
            fx = sp.sympify(normalize_expr(p.focus_x),  locals=syms)
            fy = sp.sympify(normalize_expr(p.focus_y),  locals=syms)
            def _directrix_equal_x(d_expr):
                t2 = normalize_expr(str(d_expr))
                if '=' in t2:
                    L,R = t2.split('=',1)
                    de = sp.simplify(sp.sympify(L,locals=syms)-sp.sympify(R,locals=syms))
                else:
                    de = sp.simplify(sp.sympify(t2,locals=syms))
                return sp.simplify(de - (x - directrix)) == 0
            ok_vertex = (sp.simplify(h - hx) == 0) and (sp.simplify(k - ky) == 0)
            ok_focus  = (sp.simplify(focus[0] - fx) == 0) and (sp.simplify(focus[1] - fy) == 0)
            ok_direct = _directrix_equal_x(p.directrix)
            return {"ok": bool(ok_vertex and ok_focus and ok_direct),
                    "computed": {"vertex": (sp.sstr(h), sp.sstr(k)),
                                 "focus": (sp.sstr(focus[0]), sp.sstr(focus[1])),
                                 "directrix": f"x={sp.sstr(directrix)}"}}
        return {"ok": False, "error": "not_axis_aligned_parabola"}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/verify_solutions_interval")
def verify_solutions_interval(p: SolutionsIntervalPayload):
    try:
        syms = { p.var: sp.Symbol(p.var, real=True) }
        x = syms[p.var]
        lo = float(sp.N(sp.sympify(normalize_expr(p.lower), locals=syms)))
        hi = float(sp.N(sp.sympify(normalize_expr(p.upper), locals=syms)))

        t = normalize_expr(p.equation)
        if '=' in t:
            L, R = t.split('=', 1)
            f = sp.simplify(sp.sympify(L, locals=syms) - sp.sympify(R, locals=syms))
        else:
            f = sp.simplify(sp.sympify(t, locals=syms))  # =0 とみなす

        # まず solveset（区間ドメイン）
        dom = sp.Interval(lo, hi)
        sols = sp.solveset(f, x, domain=dom)

        computed: List[float] = []
        if sols.is_FiniteSet:
            for s in sols:
                try:
                    r = float(sp.N(s))
                    computed.append(r)
                except Exception:
                    pass
        elif sols.is_EmptySet:
            computed = []
        else:
            # ConditionSet 等→数値探索で保険
            computed = _solve_on_interval_by_sampling(f, x, lo, hi, samples=300, tol=p.tol)

        computed = _dedup_sorted(computed, tol=1e-6)

        # 期待の解（文字列）を float 化
        expected_vals: List[float] = []
        for s in p.expected:
            try:
                expected_vals.append(float(sp.N(sp.sympify(normalize_expr(s), locals=syms))))
            except Exception:
                pass
        expected_vals = _dedup_sorted(expected_vals, tol=1e-6)

        # 相互包含（双方向）を tol 付きでチェック
        def _contains_all(a: List[float], b: List[float], tol: float) -> bool:
            used = [False]*len(a)
            for vb in b:
                ok = False
                for i, va in enumerate(a):
                    if not used[i] and abs(va - vb) <= tol:
                        used[i] = True
                        ok = True
                        break
                if not ok:
                    return False
            return True

        ok = _contains_all(computed, expected_vals, p.tol) and _contains_all(expected_vals, computed, p.tol)
        return {"ok": bool(ok), "computed": computed, "expected": expected_vals}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.post("/verify_inequality_set")
def verify_inequality_set(p: InequalitySetPayload):
    try:
        syms = { p.var: sp.Symbol(p.var, real=True) }
        x = syms[p.var]

        from sympy.solvers.inequalities import reduce_inequalities
        t = normalize_expr(p.expr)
        try:
            bool_expr = reduce_inequalities([sp.sympify(t, locals=syms)], x)
        except Exception:
            bool_expr = sp.sympify(t, locals=syms)

        parts = [ _parse_interval(seg, syms) for seg in p.expected ]
        expected_set = Union(*parts) if parts else S.EmptySet

        sol_set = _bool_to_set(bool_expr, x)
        if isinstance(sol_set, sp.Set):
            try:
                if (sol_set ^ expected_set) == S.EmptySet:
                    return {"ok": True, "computed": str(sol_set), "expected": str(expected_set)}
            except Exception:
                pass
            to_check = sol_set
        else:
            to_check = None

        lo, hi = p.domain
        xs = [lo + (hi-lo)*i/p.samples for i in range(p.samples+1)]

        def in_expected(xv: float) -> bool:
            try:    return bool(Interval(xv, xv) & expected_set)
            except: return False

        def in_solution(xv: float) -> bool:
            if isinstance(to_check, sp.Set):
                try:    return bool(Interval(xv, xv) & to_check)
                except: return False
            try:
                v = bool_expr.subs({x: xv})
                if isinstance(v, (BooleanTrue, BooleanFalse)): return bool(v)
                return bool(sp.N(v))
            except: return False

        ok = all(in_solution(xv) == in_expected(xv) for xv in xs)
        return {"ok": bool(ok),
                "computed": str(sol_set) if isinstance(sol_set, sp.Set) else str(bool_expr),
                "expected": str(expected_set)}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.post("/verify_function_transform")
def verify_function_transform(p: FunctionTransformPayload):
    try:
        syms = { p.var: sp.Symbol(p.var, real=True) }
        x = syms[p.var]
        f = sp.sympify(normalize_expr(p.base), locals=syms)
        g = sp.sympify(normalize_expr(p.target), locals=syms)

        # パラメータを式として解釈（未指定は1や0に）
        a = sp.sympify(normalize_expr(p.a), locals=syms) if p.a is not None else 1
        b = sp.sympify(normalize_expr(p.b), locals=syms) if p.b is not None else 1
        h = sp.sympify(normalize_expr(p.h), locals=syms) if p.h is not None else 0
        k = sp.sympify(normalize_expr(p.k), locals=syms) if p.k is not None else 0

        # 期待: g(x) ?= a * f( b*(x-h) ) + k
        F = a * sp.sympify(f.subs({x: b*(x-h)})) + k
        diff = sp.simplify(g - F)
        ok = (diff == 0)
        if not ok:
            lo, hi = p.domain
            xs = [lo + (hi-lo)*i/p.samples for i in range(p.samples+1)]
            cnt = 0
            for xv in xs:
                try:
                    val = float(sp.N(diff.subs({x: xv})))
                    if math.isfinite(val) and abs(val) < p.tol:
                        cnt += 1
                except Exception:
                    pass
            ok = (cnt >= p.samples * 0.8)  # 8割一致ならOKとみなす
        return {"ok": bool(ok), "computed_diff": sp.sstr(diff)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/overlay_line")
def overlay_line(p: OverlayLinePayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        x, y = syms["x"], syms["y"]
        mode_ref, pr_ref = _line_to_function(p.ref_equation, syms)
        mode_user, pr_user = _line_to_function(p.user_equation, syms)
        xmin,xmax,ymin,ymax = _resolve_bbox(p.bbox.dict() if p.bbox else None)

        num = max(2, min(5000, p.num))
        xs = [xmin + (xmax-xmin)*i/(num-1) for i in range(num)]
        def _sample(mode, pr):
            pts=[]
            if mode=="function":
                m,b0 = pr
                for xv in xs:
                    yv = sp.N(m*xv + b0)
                    yv = float(yv) if getattr(yv,"is_finite",None) is not False else None
                    pts.append((float(xv), yv))
            else: # vertical x=x0
                x0, = pr
                x0 = float(sp.N(x0))
                ys = [ymin + (ymax-ymin)*i/(num-1) for i in range(num)]
                for yv in ys:
                    pts.append((x0, float(yv)))
            return _clip_points_to_bbox(pts,(xmin,xmax,ymin,ymax))

        ref_pts  = _sample(mode_ref, pr_ref)
        user_pts = _sample(mode_user, pr_user)

        return {"ok": True, "bbox":[xmin,xmax,ymin,ymax],
                "layers":[
                    {"label":"ref","points":ref_pts},
                    {"label":"user","points":user_pts}
                ]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/overlay_circle")
def overlay_circle(p: OverlayCirclePayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        x,y = syms["x"], syms["y"]
        h1,k1,r1 = _circle_features(p.ref_equation, syms)
        h2,k2,r2 = _circle_features(p.user_equation, syms)
        xmin,xmax,ymin,ymax = _resolve_bbox(p.bbox.dict() if p.bbox else None)
        num = max(12, min(5000, p.num))
        ts = [2*math.pi*i/num for i in range(num+1)]
        def _pts(h,k,r):
            hh=float(sp.N(h)); kk=float(sp.N(k)); rr=float(sp.N(r))
            pts=[(hh+rr*math.cos(t), kk+rr*math.sin(t)) for t in ts]
            return _clip_points_to_bbox(pts,(xmin,xmax,ymin,ymax))
        return {"ok": True, "bbox":[xmin,xmax,ymin,ymax],
                "layers":[
                    {"label":"ref","points":_pts(h1,k1,r1)},
                    {"label":"user","points":_pts(h2,k2,r2)}
                ]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/overlay_parabola")
def overlay_parabola(p: OverlayParabolaPayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        x,y = syms["x"], syms["y"]
        mode1,a1,h1,k1 = _parabola_model(p.ref_equation, syms)
        mode2,a2,h2,k2 = _parabola_model(p.user_equation, syms)
        xmin,xmax,ymin,ymax = _resolve_bbox(p.bbox.dict() if p.bbox else None)
        num = max(50, min(5000, p.num))

        def _sample(mode,a,h,k):
            aa=float(sp.N(a)); hh=float(sp.N(h)); kk=float(sp.N(k))
            pts=[]
            if mode=='vertical':
                xs=[xmin + (xmax-xmin)*i/(num-1) for i in range(num)]
                for xv in xs:
                    yv = aa*(xv-hh)**2 + kk
                    pts.append((xv, yv if math.isfinite(yv) else None))
            else:
                ys=[ymin + (ymax-ymin)*i/(num-1) for i in range(num)]
                for yv in ys:
                    xv = aa*(yv-kk)**2 + hh
                    pts.append((xv if math.isfinite(xv) else None, yv))
            return _clip_points_to_bbox(pts,(xmin,xmax,ymin,ymax))

        ref_pts  = _sample(mode1,a1,h1,k1)
        user_pts = _sample(mode2,a2,h2,k2)

        return {"ok": True, "bbox":[xmin,xmax,ymin,ymax],
                "layers":[
                    {"label":"ref","points":ref_pts},
                    {"label":"user","points":user_pts}
                ]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/overlay_ellipse")
def overlay_ellipse(p: OverlayEllipsePayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        x,y = syms["x"], syms["y"]
        h1,k1,a1,b1 = _ellipse_features(p.ref_equation, syms)
        h2,k2,a2,b2 = _ellipse_features(p.user_equation, syms)
        xmin,xmax,ymin,ymax = _resolve_bbox(p.bbox.dict() if p.bbox else None)
        num = max(24, min(5000, p.num))
        ts = [2*math.pi*i/num for i in range(num+1)]
        def _pts(h,k,a,b):
            hh=float(sp.N(h)); kk=float(sp.N(k)); aa=float(sp.N(a)); bb=float(sp.N(b))
            pts=[(hh+aa*math.cos(t), kk+bb*math.sin(t)) for t in ts]
            return _clip_points_to_bbox(pts,(xmin,xmax,ymin,ymax))
        return {"ok": True, "bbox":[xmin,xmax,ymin,ymax],
                "layers":[
                    {"label":"ref","points":_pts(h1,k1,a1,b1)},
                    {"label":"user","points":_pts(h2,k2,a2,b2)}
                ]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/overlay_hyperbola")
def overlay_hyperbola(p: OverlayHyperbolaPayload):
    try:
        syms = { nm: sp.Symbol(nm, real=True) for nm in p.vars }
        x,y = syms["x"], syms["y"]
        mode1,a1,b1,h1,k1 = _hyperbola_model(p.ref_equation, syms)
        mode2,a2,b2,h2,k2 = _hyperbola_model(p.user_equation, syms)
        xmin,xmax,ymin,ymax = _resolve_bbox(p.bbox.dict() if p.bbox else None)
        num = max(200, min(8000, p.num))

        def _sample_horizontal(a,b,h,k):
            aa=float(sp.N(a)); bb=float(sp.N(b)); hh=float(sp.N(h)); kk=float(sp.N(k))
            pts=[]
            xs=[xmin + (xmax-xmin)*i/(num-1) for i in range(num)]
            gap=True
            for xv in xs:
                val = ( (xv-hh)**2 / (aa*aa) ) - 1.0
                if val >= 0:
                    yoff = bb*math.sqrt(val)
                    y1, y2 = kk + yoff, kk - yoff
                    # 2 ブランチを同一ポリラインに分断して入れる
                    pts.append((xv,y1))
                else:
                    # ギャップ（描画を切るため None）
                    if not gap:
                        pts.append((None,None)); gap=True
                    continue
                gap=False
            # 下側ブランチ
            pts.append((None,None))
            gap=True
            for xv in xs:
                val = ( (xv-hh)**2 / (aa*aa) ) - 1.0
                if val >= 0:
                    yoff = bb*math.sqrt(val)
                    y2 = kk - yoff
                    pts.append((xv,y2)); gap=False
                else:
                    if not gap:
                        pts.append((None,None)); gap=True
            return _clip_points_to_bbox(pts,(xmin,xmax,ymin,ymax))

        def _sample_vertical(a,b,h,k):
            aa=float(sp.N(a)); bb=float(sp.N(b)); hh=float(sp.N(h)); kk=float(sp.N(k))
            pts=[]
            ys=[ymin + (ymax-ymin)*i/(num-1) for i in range(num)]
            gap=True
            for yv in ys:
                val = ( (yv-kk)**2 / (bb*bb) ) - 1.0
                if val >= 0:
                    xoff = aa*math.sqrt(val)
                    x1, x2 = hh + xoff, hh - xoff
                    pts.append((x1,yv))
                else:
                    if not gap:
                        pts.append((None,None)); gap=True
                    continue
                gap=False
            pts.append((None,None))
            gap=True
            for yv in ys:
                val = ( (yv-kk)**2 / (bb*bb) ) - 1.0
                if val >= 0:
                    xoff = aa*math.sqrt(val)
                    x2 = hh - xoff
                    pts.append((x2,yv)); gap=False
                else:
                    if not gap:
                        pts.append((None,None)); gap=True
            return _clip_points_to_bbox(pts,(xmin,xmax,ymin,ymax))

        def _gen(mode,a,b,h,k):
            return _sample_horizontal(a,b,h,k) if mode=='horizontal' else _sample_vertical(a,b,h,k)

        return {"ok": True, "bbox":[xmin,xmax,ymin,ymax],
                "layers":[
                    {"label":"ref","points":_gen(mode1,a1,b1,h1,k1)},
                    {"label":"user","points":_gen(mode2,a2,b2,h2,k2)}
                ]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/overlay_render_png")
def overlay_render_png(p: OverlayRenderPayload):
    try:
        if not PIL_AVAILABLE:
            return {"ok": False, "error": "Pillow is not installed. pip install pillow"}
        bbox = (p.bbox.xmin, p.bbox.xmax, p.bbox.ymin, p.bbox.ymax)
        W,H = int(p.width), int(p.height)
        img = Image.new("RGB", (W,H), (255,255,255))
        drw = ImageDraw.Draw(img)
        map_pt = _world_to_img_factory(bbox, W, H)

        # grid
        if p.show_grid:
            xmin,xmax,ymin,ymax = bbox
            def nice_step(range_):
                raw = range_/8.0
                pw = 10**(math.floor(math.log10(max(1e-9, raw))))
                n = raw/pw
                if n<1.5: return 1*pw
                if n<3:   return 2*pw
                if n<7:   return 5*pw
                return 10*pw
            stepX = nice_step(xmax-xmin); stepY = nice_step(ymax-ymin)
            gx = []; x=xmin - (xmin % stepX)
            while x <= xmax + 1e-9: gx.append(x); x += stepX
            gy = []; y=ymin - (ymin % stepY)
            while y <= ymax + 1e-9: gy.append(y); y += stepY
            for x in gx:
                a = map_pt((x, ymin)); b = map_pt((x, ymax))
                if a and b: drw.line([a,b], fill=(230,233,239), width=1)
            for y in gy:
                a = map_pt((xmin, y)); b = map_pt((xmax, y))
                if a and b: drw.line([a,b], fill=(230,233,239), width=1)

        # layers
        COLORS = [(37,99,235),(239,68,68),(16,185,129),(245,158,11),(139,92,246),(20,184,166)]
        for idx, L in enumerate(p.layers):
            pts = L.get("points", [])
            col = COLORS[idx % len(COLORS)]
            prev = None
            for pt in pts:
                m = map_pt(pt)
                if m is None:
                    prev = None
                    continue
                if prev is not None:
                    drw.line([prev, m], fill=col, width=3)
                prev = m

        # encode
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        import base64
        b64 = base64.b64encode(buf.read()).decode('ascii')
        return {"ok": True, "png_base64": b64}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/overlay_line_png")
def overlay_line_png(
    p: OverlayLinePayload,
    width: int = Query(800),
    height: int = Query(600),
    show_grid: bool = Query(True),
):
    res = overlay_line(p)
    if not res.get("ok", False): return res
    return _render_from_layers(res["bbox"], res["layers"], width, height, show_grid)

@app.post("/overlay_circle_png")
def overlay_circle_png(
    p: OverlayCirclePayload,
    width: int = Query(800),
    height: int = Query(600),
    show_grid: bool = Query(True),
):
    res = overlay_circle(p)
    if not res.get("ok", False): return res
    return _render_from_layers(res["bbox"], res["layers"], width, height, show_grid)

@app.post("/overlay_parabola_png")
def overlay_parabola_png(
    p: OverlayParabolaPayload,
    width: int = Query(800),
    height: int = Query(600),
    show_grid: bool = Query(True),
):
    res = overlay_parabola(p)
    if not res.get("ok", False): return res
    return _render_from_layers(res["bbox"], res["layers"], width, height, show_grid)

@app.post("/overlay_ellipse_png")
def overlay_ellipse_png(
    p: OverlayEllipsePayload,
    width: int = Query(800),
    height: int = Query(600),
    show_grid: bool = Query(True),
):
    res = overlay_ellipse(p)
    if not res.get("ok", False): return res
    return _render_from_layers(res["bbox"], res["layers"], width, height, show_grid)

@app.post("/overlay_hyperbola_png")
def overlay_hyperbola_png(
    p: OverlayHyperbolaPayload,
    width: int = Query(800),
    height: int = Query(600),
    show_grid: bool = Query(True),
):
    res = overlay_hyperbola(p)
    if not res.get("ok", False): return res
    return _render_from_layers(res["bbox"], res["layers"], width, height, show_grid)

# （必要があれば楕円・双曲線の簡易検証も追加できます）

# =========================================================
# 10) Sampling / Numeric tools
# =========================================================

@app.post("/sample_parametric")
def sample_parametric(p: SampleParametricPayload):
    try:
        syms = { p.t: sp.Symbol(p.t) }
        tt = syms[p.t]
        xt = sp.sympify(normalize_expr(p.x_of_t), locals=syms)
        yt = sp.sympify(normalize_expr(p.y_of_t), locals=syms)
        n = max(10, min(5000, p.num))
        pts = []
        for i in range(n):
            tv = p.tmin + (p.tmax - p.tmin) * i / (n - 1)
            xv = sp.N(xt.subs({tt: tv})); yv = sp.N(yt.subs({tt: tv}))
            x = float(xv) if getattr(xv, "is_finite", None) is not False else None
            y = float(yv) if getattr(yv, "is_finite", None) is not False else None
            pts.append([x, y])
        return {"ok": True, "points": pts}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/sample_function")
def sample_function(p: SampleFuncPayload):
    try:
        x = sp.Symbol(p.var)
        s = normalize_expr(p.expr)
        f = sp.sympify(s)
        a, b = p.domain
        n = max(10, min(2000, p.num))
        xs = [a + (b-a)*i/(n-1) for i in range(n)]
        pts = []
        for xv in xs:
            yv = sp.N(f.subs({x: xv}))
            y = float(yv) if getattr(yv, "is_finite", None) is not False else None
            pts.append([float(xv), y])
        return {"ok": True, "points": pts}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/numeric_compare")
def numeric_compare(p: NumericComparePayload):
    try:
        x = sp.Symbol(p.var)
        l = sp.sympify(normalize_expr(p.lhs))
        r = sp.sympify(normalize_expr(p.rhs))
        a, b = p.domain
        ok_count = 0; tried = 0
        while tried < p.samples and ok_count < p.samples:
            tried += 1
            v = a + (b - a) * random.random()
            subs = {x: v}
            lv = sp.N(l.subs(subs)); rv = sp.N(r.subs(subs))
            if (getattr(lv, "is_finite", None) is False) or (getattr(rv, "is_finite", None) is False):
                continue
            denom = max(1.0, float(abs(rv)))
            if abs(float(lv - rv)) / denom < p.tol:
                ok_count += 1
            else:
                return {"ok": False}
        return {"ok": True} if ok_count >= p.samples else {"ok": False}
    except Exception as e:
        return {"ok": False, "error": str(e)}

# =========================================================
# 11) Diagnose (derivative / roots)
# =========================================================

@app.post("/diagnose_derivative")
def diagnose_derivative(p: DiagnoseDerivativePayload):
    try:
        x = sp.Symbol(p.variable)
        f = sp.sympify(normalize_expr(p.func_latex))
        u = sp.sympify(normalize_expr(p.user_latex))
        d = sp.diff(f, x)
        if sp.simplify(d-u) == 0:
            return {"ok": True, "kind": "exact", "computed_latex": sp.latex(d)}
        if sp.simplify(d+u) == 0:
            return {"ok": False, "kind": "sign_error", "computed_latex": sp.latex(d)}
        ratio = sp.simplify(sp.together(sp.simplify(d/u)))
        if (getattr(ratio, "is_Rational", False) and ratio != 1) or (ratio.is_Number and ratio.is_finite and ratio != 1):
            try: c = float(ratio)
            except Exception: c = None
            return {"ok": False, "kind": "missing_factor", "factor": c, "computed_latex": sp.latex(d)}
        return {"ok": False, "kind": "mismatch", "computed_latex": sp.latex(d)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/diagnose_roots")
def diagnose_roots(p: DiagnoseRootsPayload):
    try:
        x = sp.Symbol(p.var)
        expr = _equation_to_expr(p.equation)
        roots = sp.solveset(expr, x, domain=sp.S.Complexes)
        def num(v):
            vv = complex(sp.N(v))
            return round(vv.real, 6) if abs(vv.imag) < p.tol else None
        true_set = set()
        if roots.is_FiniteSet:
            for r in roots:
                v = num(r)
                if v is not None: true_set.add(v)
        user_set = set()
        for s in p.user_solutions:
            try:
                v = num(sp.sympify(normalize_expr(s)))
                if v is not None: user_set.add(v)
            except: pass
        missing = sorted(list(true_set - user_set))
        extra   = sorted(list(user_set - true_set))
        return {"ok": len(missing)==0 and len(extra)==0, "missing": missing, "extra": extra}
    except Exception as e:
        return {"ok": False, "error": str(e)}
