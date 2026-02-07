// src/lib/course/topics.ts
export type UnitId = 'math1' | 'mathA' | 'math2' | 'mathB' | 'mathC' | 'math3';

export type TopicId =
  | "quad_solve_basic"
  | "quad_discriminant_basic"
  | "quad_roots_relations_basic"
  | "quad_inequality_basic"
  | 'quad_maxmin_basic'
  | 'quad_graph_basic'
  | "trig_ratio_basic"
  | "trig_special_angles_basic"
  | "geo_measure_right_triangle_basic"
  | "geo_sine_cosine_law_basic"
  | "data_summary_basic"
  | "data_variance_sd_basic"
  | "data_scatter_basic"
  | "data_covariance_basic"
  | "data_correlation_basic"
  | "data_regression_basic"
  | 'combi_basic'
  | "combi_permutation_basic"
  | "prob_basic"
  | "prob_complement_basic"
  | "combi_conditions_basic"
  | "prob_combi_basic"
  | "int_divisor_multiple_basic"
  | "int_remainder_basic"
  | "int_prime_factor_basic"
  | "int_divisibility_tests_basic"
  | "int_gcd_lcm_applications_basic"
  | "int_diophantine_basic"
  | "int_mod_arithmetic_intro"
  | "geo_ratio_theorems"
  | "geo_circle_geometry"
  | "geo_triangle_centers"
  | "geo_circle_relations"
  | "induction_basic"
  | "set_operations_basic"
  | "prop_proposition_basic"
  | "algebra_expand_basic"
  | "algebra_factor_basic"
  | "algebra_linear_eq_basic"
  | "algebra_ineq_basic"
  | "exp_log_basic"
  | "exp_log_equations_basic"
  | "exp_log_change_base_basic"
  | "exp_log_growth_basic"
  | "trig_identities_basic"
  | "trig_amplitude_basic"
  | "trig_phase_shift_basic"
  | "trig_vertical_shift_basic"
  | "trig_graph_range_basic"
  | "trig_graph_period_basic"
  | "trig_graph_midline_basic"
  | "trig_graph_max_basic"
  | "trig_graph_min_basic"
  | "trig_graph_intercept_basic"
  | "trig_equation_radian_basic"
  | "trig_identity_tan_basic"
  | "trig_identity_pythag_basic"
  | "trig_identity_tan_relation_basic"
  | "trig_addition_basic"
  | "trig_double_angle_basic"
  | "trig_period_basic"
  | "trig_radian_basic"
  | "calc_derivative_basic"
  | "calc_derivative_linear_basic"
  | "calc_integral_basic"
  | "calc_tangent_slope_basic"
  | "calc_tangent_line_basic"
  | "calc_increasing_basic"
  | "calc_average_value_basic"
  | "calc_area_between_lines_basic"
  | "calc_integral_linear_basic2"
  | "calc_area_between_parabola_basic"
  | "calc_area_under_line_basic"
  | "exp_log_domain_basic"
  | "exp_log_simple_equation_basic"
  | "exp_log_power_equation_basic"
  | "exp_log_log_equation_basic"
  | "exp_log_log_sum_basic"
  | "exp_log_log_diff_basic"
  | "exp_log_log_product_basic"
  | "poly_remainder_basic"
  | "poly_factor_k_basic"
  | "poly_value_sum_basic"
  | "poly_coeff_from_roots_basic"
  | "binomial_coeff_basic"
  | "binomial_xy_coeff_basic"
  | "binomial_value_basic"
  | "binomial_middle_coeff_basic"
  | "identity_eval_basic"
  | "identity_coefficient_basic"
  | "identity_coeff_quadratic_basic"
  | "inequality_mean_basic"
  | "inequality_sum_product_basic"
  | "inequality_amgm_basic"
  | "coord_line_slope_basic"
  | "coord_line_intercept_basic"
  | "coord_line_parallel_perp_basic"
  | "coord_distance_point_line_basic"
  | "coord_circle_radius_basic"
  | "coord_circle_center_basic"
  | "coord_region_basic"
  | "calc_tangent_value_basic"
  | "calc_integral_sum_basic"
  | "calc_integral_constant_basic"
  | "calc_integral_quadratic_basic"
  | "calc_extrema_basic"
  | "calc_area_basic"
  | "calc_limit_basic"
  | "calc_continuity_basic"
  | "calc_derivative_advanced_basic"
  | "calc_integral_advanced_basic"
  | "calc_curve_area_basic"
  | "calc_parametric_basic"
  | "exp_log_property_basic"
  | "trig_equations_basic"
  | "seq_arithmetic_basic"
  | "seq_geometric_basic"
  | "seq_sum_basic"
  | "seq_common_difference_basic"
  | "seq_geometric_sum_basic"
  | "seq_geometric_limit_basic"
  | "seq_arithmetic_sum_basic"
  | "seq_arithmetic_sum_from_terms_basic"
  | "seq_arithmetic_mean_basic"
  | "seq_arithmetic_diff_from_terms_basic"
  | "seq_common_ratio_from_terms_basic"
  | "seq_geometric_mean_basic"
  | "seq_term_from_sum_basic"
  | "seq_geometric_sum_n_basic"
  | "stats_sample_mean_basic"
  | "stats_sampling_mean_basic"
  | "stats_standard_error_basic"
  | "stats_confidence_interval_basic"
  | "stats_scatter_basic"
  | "stats_covariance_basic"
  | "stats_correlation_basic"
  | "stats_regression_basic"
  | "stats_inference_basic"
  | "vector_inner_basic"
  | "vector_operations_basic"
  | "seq_recurrence_basic"
  | "seq_recurrence_term_basic"
  | "vector_length_basic"
  | "vector_unit_basic"
  | "vector_parallel_basic"
  | "vector_component_basic"
  | "vector_line_point_basic"
  | "vector_orthogonal_condition_basic"
  | "vector_distance_plane_basic"
  | "vector_plane_normal_basic"
  | "vector_midpoint_basic"
  | "vector_inner_from_angle_basic"
  | "complex_basic"
  | "complex_modulus_basic"
  | "complex_plane_basic"
  | "complex_conjugate_basic"
  | "complex_rotation_basic"
  | "complex_distance_basic"
  | "complex_midpoint_basic"
  | "complex_square_real_basic"
  | "complex_power_i_basic"
  | "complex_conjugate_product_basic"
  | "complex_modulus_square_basic"
  | "conic_circle_basic"
  | "conic_circle_center_basic"
  | "conic_intersection_basic"
  | "conic_tangent_basic"
  | "conic_parabola_basic"
  | "conic_ellipse_basic"
  | "conic_hyperbola_basic"
  | "conic_hyperbola_asymptote_basic"
  | "prob_binomial_expectation_basic"
  | "prob_binomial_probability_basic"
  | "prob_binomial_variance_basic"
  | "normal_distribution_basic"
  | "normal_standardization_basic"
  | "normal_backsolve_basic"
  | "vector_section_basic"
  | "vector_space_basic"
  | "vector_distance_basic"
  | "vector_plane_basic"
  | "vector_orthogonality_basic"
  | "vector_angle_basic"
  | "vector_projection_basic"
  | "vector_line_basic"
  | "vector_area_basic"
  | "vector_equation_basic"
  | "complex_polar_basic"
  | "conic_ellipse_focus_basic"
  | "conic_parabola_directrix_basic"
  | "conic_parabola_vertex_basic"
  | "conic_circle_radius_basic"
  | "conic_ellipse_axis_basic"
  | "conic_hyperbola_vertex_basic"
  | "complex_argument_axis_basic"
  | "complex_argument_quadrant_basic"
  | "complex_argument_degree_basic"
  | "complex_polar_value_basic"
  | "complex_de_moivre_basic"
  | "complex_root_unity_basic"
  | "complex_multiply_real_basic"
  | "complex_multiply_imag_basic"
  | "complex_modulus_product_basic"
  | "complex_equation_abs_basic"
  | "complex_equation_real_imag_basic"
  | "complex_equation_conjugate_basic"
  | "complex_rotation_real_basic"
  | "complex_rotation_imag_basic"
  | "complex_rotation_180_basic"
  | "complex_division_real_basic"
  | "complex_modulus_sum_basic"
  | "complex_polar_imag_basic"
  | "complex_conjugate_modulus_basic"
  | "complex_add_modulus_square_basic"
  | "complex_sub_modulus_square_basic"
  | "complex_triangle_area_basic"
  | "complex_midpoint_distance_basic"
  | "complex_parallel_condition_basic"
  | "complex_perpendicular_condition_basic"
  | "complex_locus_circle_radius_basic"
  | "complex_locus_circle_center_basic"
  | "complex_argument_product_basic"
  | "complex_argument_quotient_basic"
  | "complex_rotation_90_matrix_basic"
  | "complex_argument_power_basic"
  | "complex_modulus_power_basic"
  | "complex_locus_bisector_basic"
  | "complex_locus_vertical_line_basic"
  | "complex_argument_conjugate_basic"
  | "complex_argument_inverse_basic"
  | "complex_locus_horizontal_line_basic"
  | "complex_section_internal_basic"
  | "complex_section_external_basic"
  | "complex_line_point_basic"
  | "conic_parabola_focus_basic"
  | "conic_parabola_latus_rectum_basic"
  | "conic_parabola_tangent_slope_basic"
  | "conic_ellipse_major_axis_basic"
  | "conic_ellipse_minor_axis_basic"
  | "conic_ellipse_tangent_basic"
  | "conic_hyperbola_asymptote_slope_basic"
  | "conic_hyperbola_transverse_axis_basic"
  | "conic_circle_tangent_slope_basic"
  | "conic_line_intersection_count_basic"
  | "conic_circle_general_radius_basic"
  | "conic_circle_general_center_basic"
  | "conic_hyperbola_foci_distance_basic"
  | "conic_ellipse_c_basic"
  | "conic_hyperbola_c_basic"
  | "conic_parabola_line_intersection_count_basic"
  | "conic_ellipse_value_basic"
  | "conic_hyperbola_value_basic"
  | "conic_parabola_general_focus_basic"
  | "conic_parabola_vertex_shift_basic"
  | "conic_circle_tangent_point_basic"
  | "conic_parabola_focus_vertical_basic"
  | "conic_parabola_directrix_vertical_basic"
  | "conic_ellipse_focus_distance_basic"
  | "conic_circle_point_on_basic"
  | "conic_parabola_tangent_intercept_basic"
  | "conic_ellipse_center_basic"
  | "conic_hyperbola_center_basic"
  | "conic_hyperbola_asymptote_equation_basic"
  | "complex_argument_basic";

export type MasteryLevel = 'weak' | 'normal' | 'strong';

export type Topic = {
  id: TopicId;
  unit: UnitId;
  section?: string;
  title: string;
  description: string;
};

export const TOPICS: Topic[] = [
  {
    id: "quad_solve_basic",
    unit: "math1",
    section: "quadratic",
    title: "二次方程式の解（基本）",
    description:
      "判別式を使って、実数解の個数と解を求める基本問題に取り組みます。",
  },
  {
    id: "quad_discriminant_basic",
    unit: "math1",
    section: "quadratic",
    title: "判別式と解の個数（基本）",
    description:
      "判別式 D=b^2-4ac を計算し、実数解の個数を判断します。",
  },
  {
    id: "quad_roots_relations_basic",
    unit: "math1",
    section: "quadratic",
    title: "解と係数の関係（基本）",
    description:
      "解の和・積（-b/a, c/a）を使って値を求める基本問題に取り組みます。",
  },
  {
    id: "quad_inequality_basic",
    unit: "math1",
    section: "quadratic",
    title: "二次不等式（基本）",
    description:
      "因数分解と符号の変化を使って二次不等式の解の範囲を判断します。",
  },
  {
    id: 'quad_maxmin_basic',
    unit: 'math1',
    section: "quadratic",
    title: '二次関数の最大・最小（基本）',
    description:
      '平方完成を使って、二次関数の最大値・最小値を求める基本問題に取り組みます。',
  },
  {
    id: 'quad_graph_basic',
    unit: 'math1',
    section: "quadratic",
    title: '二次関数のグラフと頂点',
    description:
      'y=ax^2+bx+c のグラフの開き方・頂点・軸を理解するトピックです。',
  },
  {
    id: "trig_ratio_basic",
    unit: "math1",
    section: "trigonometry",
    title: "三角比（直角三角形）",
    description:
      "直角三角形での sin・cos・tan の基本を確認します。",
  },
  {
    id: "trig_special_angles_basic",
    unit: "math1",
    section: "trigonometry",
    title: "特殊角の三角比",
    description:
      "30°・45°・60°の sin・cos・tan の値を覚えて使います。",
  },
  {
    id: "geo_measure_right_triangle_basic",
    unit: "math1",
    section: "geometry",
    title: "直角三角形の計量（基本）",
    description:
      "三角比を使って高さ・距離を求める基本問題に取り組みます。",
  },
  {
    id: "geo_sine_cosine_law_basic",
    unit: "math1",
    section: "geometry",
    title: "正弦定理・余弦定理（基本）",
    description:
      "一般三角形の辺や角を、正弦定理・余弦定理で求めます。",
  },
  {
    id: "data_summary_basic",
    unit: "math1",
    section: "data",
    title: "データの代表値（平均・中央値・最頻値・範囲）",
    description:
      "平均・中央値・最頻値・範囲を求める基本問題に取り組みます。",
  },
  {
    id: "data_variance_sd_basic",
    unit: "math1",
    section: "data",
    title: "分散・標準偏差（基本）",
    description:
      "平均との差の二乗の平均（母分散）と標準偏差を求めます。",
  },
  {
    id: "data_scatter_basic",
    unit: "math1",
    section: "data",
    title: "散布図と傾向（基本）",
    description:
      "散布図から相関の向き（正・負）を読み取る基本問題に取り組みます。",
  },
  {
    id: "data_covariance_basic",
    unit: "math1",
    section: "data",
    title: "共分散（基本）",
    description:
      "共分散を計算し、2変量の関係を数値で表す基本問題に取り組みます。",
  },
  {
    id: "data_correlation_basic",
    unit: "math1",
    section: "data",
    title: "相関係数（基本）",
    description:
      "相関係数の値から相関の強さを読み取ります。",
  },
  {
    id: "data_regression_basic",
    unit: "math1",
    section: "data",
    title: "回帰直線（基本）",
    description:
      "回帰直線の式を用いて近似値を求めます。",
  },
  {
    id: 'combi_basic',
    unit: 'mathA',
    section: "combinatorics",
    title: '場合の数（和の法則・積の法則）',
    description:
      '「何通りあるか」を数えるための基本ルール（和の法則・積の法則）を学びます。',
  },
  {
    id: "combi_permutation_basic",
    unit: "mathA",
    section: "combinatorics",
    title: "順列（基本）",
    description:
      "順列 ${}_nP_r$ を用いて並べ方の数を求めます。",
  },
  {
    id: "prob_basic",
    unit: "mathA",
    section: "probability",
    title: "確率の基本",
    description: "起こりうる場合の数と、起こってほしい場合の数を数える",
  },
  {
    id: "prob_complement_basic",
    unit: "mathA",
    section: "probability",
    title: "補集合と確率",
    description: "余事象を使って「少なくとも1回」などを求める",
  },
  {
    id: "combi_conditions_basic",
    unit: "mathA",
    section: "combinatorics",
    title: "条件付きの数え上げ",
    description: "「少なくとも」「含まない」など条件付きで数える",
  },
  {
    id: "prob_combi_basic",
    unit: "mathA",
    section: "probability",
    title: "組合せと確率",
    description: "組合せで有利・全体を数えて確率を求める",
  },
  {
    id: "int_divisor_multiple_basic",
    unit: "mathA",
    section: "integer",
    title: "約数・倍数・最大公約数・最小公倍数（基本）",
    description: "約数の個数、最大公約数、最小公倍数を求める",
  },
  {
    id: "int_remainder_basic",
    unit: "mathA",
    section: "integer",
    title: "余りと剰余（基本）",
    description: "割り算の余りと簡単な剰余の考え方を確認する",
  },
  {
    id: "int_prime_factor_basic",
    unit: "mathA",
    section: "integer",
    title: "素因数分解と素数判定（基本）",
    description: "素因数分解・素数/合成数の判定・約数の個数を学ぶ",
  },
  {
    id: "int_divisibility_tests_basic",
    unit: "mathA",
    section: "integer",
    title: "整除性の判定（基本）",
    description: "2,3,4,5,8,9,11 の判定法を使う",
  },
  {
    id: "int_gcd_lcm_applications_basic",
    unit: "mathA",
    section: "integer",
    title: "最大公約数・最小公倍数の応用（基本）",
    description: "周期・分け方の問題で gcd/lcm を使う",
  },
  {
    id: "int_diophantine_basic",
    unit: "mathA",
    section: "integer",
    title: "一次不定方程式（基本）",
    description:
      "一次不定方程式 $ax+by=c$ の整数解の有無を判定する基本問題に取り組みます。",
  },
  {
    id: "int_mod_arithmetic_intro",
    unit: "mathA",
    section: "integer",
    title: "剰余の入門（基本）",
    description: "簡単な合同式・周期性・下1桁を扱う",
  },
  {
    id: "geo_ratio_theorems",
    unit: "mathA",
    section: "geometry_hs",
    title: "比の定理",
    description: "角の二等分線・中点連結・チェバ・メネラウス・面積比を扱う",
  },
  {
    id: "geo_circle_geometry",
    unit: "mathA",
    section: "geometry_hs",
    title: "円の性質",
    description: "内接四角形・接弦定理・円の冪で角度や長さを求める",
  },
  {
    id: "geo_triangle_centers",
    unit: "mathA",
    section: "geometry_hs",
    title: "三角形の中心",
    description: "重心・内心・外心の性質を使って比や長さを求める",
  },
  {
    id: "geo_circle_relations",
    unit: "mathA",
    section: "geometry_hs",
    title: "2円の位置関係",
    description: "中心間距離と半径の和・差で交点や共通接線を判断する",
  },
  {
    id: "induction_basic",
    unit: "mathA",
    section: "proof",
    title: "数学的帰納法（基本）",
    description:
      "帰納法の初期条件と帰納法のステップを確認する基本問題に取り組みます。",
  },
  {
    id: "set_operations_basic",
    unit: "math1",
    section: "logic",
    title: "集合の基本と演算（基本）",
    description: "和集合・共通部分・補集合などの基本を学ぶ",
  },
  {
    id: "prop_proposition_basic",
    unit: "math1",
    section: "logic",
    title: "命題と条件（基本）",
    description: "逆・裏・対偶、必要条件・十分条件を確認する",
  },
  {
    id: "algebra_expand_basic",
    unit: "math1",
    section: "algebra",
    title: "数と式：展開（基本）",
    description: "分配法則・展開の基本を、代入値で確認しながら身につける",
  },
  {
    id: "algebra_factor_basic",
    unit: "math1",
    section: "algebra",
    title: "数と式：因数分解（基本）",
    description: "二次式の因数分解を、因数分解→代入で確かめる",
  },
  {
    id: "algebra_linear_eq_basic",
    unit: "math1",
    section: "algebra",
    title: "数と式：一次方程式（基本）",
    description: "移項して解く一次方程式（整数解中心）",
  },
  {
    id: "algebra_ineq_basic",
    unit: "math1",
    section: "algebra",
    title: "数と式：一次不等式（基本）",
    description: "一次不等式を解き、最小の整数解を答える",
  },
  {
    id: "exp_log_basic",
    unit: "math2",
    section: "exp_log",
    title: "指数・対数の計算（基本）",
    description: "指数法則と対数の定義に基づいた計算の基本問題に取り組む",
  },
  {
    id: "exp_log_equations_basic",
    unit: "math2",
    section: "exp_log",
    title: "指数・対数方程式（基本）",
    description: "指数方程式・対数方程式の基本的な解き方を学ぶ",
  },
  {
    id: "exp_log_change_base_basic",
    unit: "math2",
    section: "exp_log",
    title: "底の変換（基本）",
    description: "底の変換を使って対数を簡単化する",
  },
  {
    id: "exp_log_growth_basic",
    unit: "math2",
    section: "exp_log",
    title: "指数成長（基本）",
    description: "指数的な増加で $n$ を求める",
  },
  {
    id: "exp_log_domain_basic",
    unit: "math2",
    section: "exp_log",
    title: "定義域（基本）",
    description: "対数関数の定義域を求める",
  },
  {
    id: "exp_log_simple_equation_basic",
    unit: "math2",
    section: "exp_log",
    title: "指数方程式（同底）（基本）",
    description: "同じ底の指数方程式を解く",
  },
  {
    id: "exp_log_power_equation_basic",
    unit: "math2",
    section: "exp_log",
    title: "指数方程式（2x）（基本）",
    description: "指数が 2x の形の方程式を解く",
  },
  {
    id: "exp_log_log_equation_basic",
    unit: "math2",
    section: "exp_log",
    title: "対数方程式（基本）",
    description: "対数方程式を指数に戻して解く",
  },
  {
    id: "exp_log_log_sum_basic",
    unit: "math2",
    section: "exp_log",
    title: "対数の加法（基本）",
    description: "対数の性質で和をまとめる",
  },
  {
    id: "exp_log_log_diff_basic",
    unit: "math2",
    section: "exp_log",
    title: "対数の減法（基本）",
    description: "対数の性質で差をまとめる",
  },
  {
    id: "exp_log_log_product_basic",
    unit: "math2",
    section: "exp_log",
    title: "対数と指数の積（基本）",
    description: "指数法則を使って対数を整理する",
  },
  {
    id: "poly_remainder_basic",
    unit: "math2",
    section: "polynomial",
    title: "余りの定理（基本）",
    description: "余りの定理で余りを求める",
  },
  {
    id: "poly_factor_k_basic",
    unit: "math2",
    section: "polynomial",
    title: "因数定理（基本）",
    description: "因数定理を使って係数を決める",
  },
  {
    id: "poly_value_sum_basic",
    unit: "math2",
    section: "polynomial",
    title: "多項式の値（基本）",
    description: "f(1)+f(-1) のような値を求める",
  },
  {
    id: "poly_coeff_from_roots_basic",
    unit: "math2",
    section: "polynomial",
    title: "因数から係数（基本）",
    description: "因数分解形から係数を読み取る",
  },
  {
    id: "binomial_coeff_basic",
    unit: "math2",
    section: "polynomial",
    title: "二項定理の係数（基本）",
    description: "(x+a)^n の係数を求める",
  },
  {
    id: "binomial_xy_coeff_basic",
    unit: "math2",
    section: "polynomial",
    title: "二項定理（x+y）（基本）",
    description: "(x+y)^n の係数を求める",
  },
  {
    id: "binomial_value_basic",
    unit: "math2",
    section: "polynomial",
    title: "二項定理の値（基本）",
    description: "(1+a)^n の値を求める",
  },
  {
    id: "binomial_middle_coeff_basic",
    unit: "math2",
    section: "polynomial",
    title: "二項定理の中央項（基本）",
    description: "(x+y)^n の中央項の係数を求める",
  },
  {
    id: "identity_eval_basic",
    unit: "math2",
    section: "identity_inequality",
    title: "恒等式の値（基本）",
    description: "恒等式に数値を代入して値を求める",
  },
  {
    id: "identity_coefficient_basic",
    unit: "math2",
    section: "identity_inequality",
    title: "恒等式の係数（基本）",
    description: "恒等式の係数を比較して求める",
  },
  {
    id: "identity_coeff_quadratic_basic",
    unit: "math2",
    section: "identity_inequality",
    title: "恒等式の係数比較（基本）",
    description: "積の係数から未知数を求める",
  },
  {
    id: "inequality_mean_basic",
    unit: "math2",
    section: "identity_inequality",
    title: "相加相乗（基本）",
    description: "相加相乗平均で最小値を求める",
  },
  {
    id: "inequality_sum_product_basic",
    unit: "math2",
    section: "identity_inequality",
    title: "和と積（基本）",
    description: "和一定のとき積の最大を求める",
  },
  {
    id: "inequality_amgm_basic",
    unit: "math2",
    section: "identity_inequality",
    title: "相加相乗の差（基本）",
    description: "相加平均と相乗平均の差を求める",
  },
  {
    id: "coord_line_slope_basic",
    unit: "math2",
    section: "coordinate",
    title: "直線の傾き（基本）",
    description: "2点から直線の傾きを求める",
  },
  {
    id: "coord_line_intercept_basic",
    unit: "math2",
    section: "coordinate",
    title: "直線の切片（基本）",
    description: "2点を通る直線の y 切片を求める",
  },
  {
    id: "coord_line_parallel_perp_basic",
    unit: "math2",
    section: "coordinate",
    title: "平行・垂直の傾き（基本）",
    description: "平行・垂直な直線の傾きを求める",
  },
  {
    id: "coord_distance_point_line_basic",
    unit: "math2",
    section: "coordinate",
    title: "点と直線の距離（基本）",
    description: "点と直線の距離を求める",
  },
  {
    id: "coord_circle_radius_basic",
    unit: "math2",
    section: "coordinate",
    title: "円の半径（基本）",
    description: "中心と通る点から半径を求める",
  },
  {
    id: "coord_circle_center_basic",
    unit: "math2",
    section: "coordinate",
    title: "円の中心（基本）",
    description: "標準形の式から中心を読み取る",
  },
  {
    id: "coord_region_basic",
    unit: "math2",
    section: "coordinate",
    title: "領域（基本）",
    description: "一次不等式の共通部分でできる領域を読み取る",
  },
  {
    id: "trig_identities_basic",
    unit: "math2",
    section: "trigonometry",
    title: "三角恒等式（基本）",
    description: "三角恒等式を用いた計算の基本問題に取り組む",
  },
  {
    id: "trig_identity_pythag_basic",
    unit: "math2",
    section: "trigonometry",
    title: "三角恒等式（1）（基本）",
    description: "sin^2+cos^2=1 を確認する",
  },
  {
    id: "trig_amplitude_basic",
    unit: "math2",
    section: "trigonometry",
    title: "振幅（基本）",
    description: "三角関数の振幅を求める",
  },
  {
    id: "trig_phase_shift_basic",
    unit: "math2",
    section: "trigonometry",
    title: "位相のずれ（基本）",
    description: "三角関数の位相のずれを求める",
  },
  {
    id: "trig_vertical_shift_basic",
    unit: "math2",
    section: "trigonometry",
    title: "上下移動（基本）",
    description: "三角関数の中心線を求める",
  },
  {
    id: "trig_graph_range_basic",
    unit: "math2",
    section: "trigonometry",
    title: "値域（基本）",
    description: "三角関数の値域を求める",
  },
  {
    id: "trig_graph_period_basic",
    unit: "math2",
    section: "trigonometry",
    title: "周期（グラフ）（基本）",
    description: "係数つき三角関数の周期を求める",
  },
  {
    id: "trig_graph_midline_basic",
    unit: "math2",
    section: "trigonometry",
    title: "中心線（基本）",
    description: "三角関数の中心線を求める",
  },
  {
    id: "trig_graph_max_basic",
    unit: "math2",
    section: "trigonometry",
    title: "最大値（基本）",
    description: "三角関数の最大値を求める",
  },
  {
    id: "trig_graph_min_basic",
    unit: "math2",
    section: "trigonometry",
    title: "最小値（基本）",
    description: "三角関数の最小値を求める",
  },
  {
    id: "trig_graph_intercept_basic",
    unit: "math2",
    section: "trigonometry",
    title: "y切片（基本）",
    description: "x=0 のときの値を求める",
  },
  {
    id: "trig_equation_radian_basic",
    unit: "math2",
    section: "trigonometry",
    title: "三角方程式（弧度）（基本）",
    description: "弧度法での基本方程式を解く",
  },
  {
    id: "trig_identity_tan_basic",
    unit: "math2",
    section: "trigonometry",
    title: "tanの値（基本）",
    description: "基本角の tan を求める",
  },
  {
    id: "trig_identity_tan_relation_basic",
    unit: "math2",
    section: "trigonometry",
    title: "tanの恒等式（基本）",
    description: "1+tan^2=1/cos^2 を使う",
  },
  {
    id: "trig_addition_basic",
    unit: "math2",
    section: "trigonometry",
    title: "加法定理（基本）",
    description: "加法定理で基本角の値を求める",
  },
  {
    id: "trig_double_angle_basic",
    unit: "math2",
    section: "trigonometry",
    title: "倍角（基本）",
    description: "倍角の値を基本角で計算する",
  },
  {
    id: "trig_period_basic",
    unit: "math2",
    section: "trigonometry",
    title: "周期（基本）",
    description: "三角関数の周期を求める",
  },
  {
    id: "trig_radian_basic",
    unit: "math2",
    section: "trigonometry",
    title: "弧度法（基本）",
    description: "弧度法の角で値を計算する",
  },
  {
    id: "calc_derivative_basic",
    unit: "math2",
    section: "calculus",
    title: "微分の計算（基本）",
    description: "2次関数の導関数を用いた基本計算に取り組む",
  },
  {
    id: "calc_derivative_linear_basic",
    unit: "math2",
    section: "calculus",
    title: "一次関数の微分（基本）",
    description: "一次関数の導関数を求める",
  },
  {
    id: "calc_integral_basic",
    unit: "math2",
    section: "calculus",
    title: "積分の計算（基本）",
    description: "1次関数の定積分を計算する基本問題に取り組む",
  },
  {
    id: "calc_tangent_slope_basic",
    unit: "math2",
    section: "calculus",
    title: "接線の傾き（基本）",
    description: "導関数を使って接線の傾きを求める",
  },
  {
    id: "calc_tangent_line_basic",
    unit: "math2",
    section: "calculus",
    title: "接線の式（基本）",
    description: "接線 $y=mx+k$ の切片を求める",
  },
  {
    id: "calc_increasing_basic",
    unit: "math2",
    section: "calculus",
    title: "増減（基本）",
    description: "導関数の符号から増加・減少を判定する",
  },
  {
    id: "calc_average_value_basic",
    unit: "math2",
    section: "calculus",
    title: "平均値（基本）",
    description: "区間での平均値を求める",
  },
  {
    id: "calc_area_between_lines_basic",
    unit: "math2",
    section: "calculus",
    title: "直線間の面積（基本）",
    description: "平行な直線に囲まれた面積を求める",
  },
  {
    id: "calc_integral_linear_basic2",
    unit: "math2",
    section: "calculus",
    title: "定積分（一次関数）（基本）",
    description: "一次関数の定積分を計算する",
  },
  {
    id: "calc_area_between_parabola_basic",
    unit: "math2",
    section: "calculus",
    title: "放物線と直線の面積（基本）",
    description: "放物線と直線に囲まれた面積を求める",
  },
  {
    id: "calc_area_under_line_basic",
    unit: "math2",
    section: "calculus",
    title: "直線下の面積（基本）",
    description: "直線と $x$ 軸で囲まれた面積を求める",
  },
  {
    id: "calc_tangent_value_basic",
    unit: "math2",
    section: "calculus",
    title: "接点の座標（基本）",
    description: "接点の $y$ 座標を求める",
  },
  {
    id: "calc_integral_constant_basic",
    unit: "math2",
    section: "calculus",
    title: "定数の積分（基本）",
    description: "定数の定積分を計算する",
  },
  {
    id: "calc_integral_sum_basic",
    unit: "math2",
    section: "calculus",
    title: "定積分（基本）",
    description: "定積分の値を求める",
  },
  {
    id: "calc_integral_quadratic_basic",
    unit: "math2",
    section: "calculus",
    title: "2次関数の積分（基本）",
    description: "簡単な2次関数の定積分を計算する",
  },
  {
    id: "calc_extrema_basic",
    unit: "math2",
    section: "calculus",
    title: "極値（基本）",
    description: "導関数を用いて極値を求める",
  },
  {
    id: "calc_area_basic",
    unit: "math2",
    section: "calculus",
    title: "面積（基本）",
    description: "非負関数の定積分で面積を求める",
  },
  {
    id: "calc_limit_basic",
    unit: "math3",
    section: "calculus",
    title: "極限（基本）",
    description: "多項式・分数関数の極限を計算する基本問題に取り組む",
  },
  {
    id: "calc_continuity_basic",
    unit: "math3",
    section: "calculus",
    title: "連続性（基本）",
    description: "関数の連続条件を確認し、値を決める基本問題に取り組む",
  },
  {
    id: "calc_derivative_advanced_basic",
    unit: "math3",
    section: "calculus",
    title: "微分法（応用）",
    description: "合成関数・指数/対数・三角関数を含む微分を扱う",
  },
  {
    id: "calc_integral_advanced_basic",
    unit: "math3",
    section: "calculus",
    title: "積分法（応用）",
    description: "置換積分・部分積分の基本パターンを扱う",
  },
  {
    id: "calc_curve_area_basic",
    unit: "math3",
    section: "calculus",
    title: "曲線で囲まれた面積（基本）",
    description: "2曲線で囲まれた面積を積分で求める基本問題に取り組む",
  },
  {
    id: "calc_parametric_basic",
    unit: "math3",
    section: "calculus",
    title: "媒介変数表示（基本）",
    description: "媒介変数表示の微分・接線・面積の基本を扱う",
  },
  {
    id: "exp_log_property_basic",
    unit: "math2",
    section: "exp_log",
    title: "対数の性質（基本）",
    description: "対数の性質を使った簡単な計算を行う",
  },
  {
    id: "trig_equations_basic",
    unit: "math2",
    section: "trigonometry",
    title: "三角方程式（基本）",
    description: "0°〜360°の基本的な三角方程式を解く",
  },
  {
    id: "seq_arithmetic_basic",
    unit: "mathB",
    section: "sequence",
    title: "等差数列の一般項（基本）",
    description: "初項と公差から一般項を求める基本問題に取り組む",
  },
  {
    id: "seq_geometric_basic",
    unit: "mathB",
    section: "sequence",
    title: "等比数列の一般項（基本）",
    description: "初項と公比から一般項を求める基本問題に取り組む",
  },
  {
    id: "seq_geometric_mean_basic",
    unit: "mathB",
    section: "sequence",
    title: "等比数列の平均（基本）",
    description: "$a_1$ と $a_3$ から $a_2$ を求める",
  },
  {
    id: "seq_term_from_sum_basic",
    unit: "mathB",
    section: "sequence",
    title: "和から項（基本）",
    description: "S_n と S_{n-1} から a_n を求める",
  },
  {
    id: "seq_geometric_sum_n_basic",
    unit: "mathB",
    section: "sequence",
    title: "等比数列の和（基本）",
    description: "等比数列の和を公式で求める",
  },
  {
    id: "seq_common_ratio_from_terms_basic",
    unit: "mathB",
    section: "sequence",
    title: "公比（項から）（基本）",
    description: "項の値から公比を求める",
  },
  {
    id: "seq_sum_basic",
    unit: "mathB",
    section: "sequence",
    title: "数列の和（基本）",
    description: "等差・等比数列の和の公式を使う基本問題に取り組む",
  },
  {
    id: "seq_common_difference_basic",
    unit: "mathB",
    section: "sequence",
    title: "公差の計算（基本）",
    description: "等差数列の公差を求める",
  },
  {
    id: "seq_geometric_sum_basic",
    unit: "mathB",
    section: "sequence",
    title: "等比数列の和（基本）",
    description: "等比数列の和の公式を用いる",
  },
  {
    id: "seq_geometric_limit_basic",
    unit: "mathB",
    section: "sequence",
    title: "等比数列の無限和（基本）",
    description: "公比の絶対値が1未満の無限和を求める",
  },
  {
    id: "seq_arithmetic_sum_basic",
    unit: "mathB",
    section: "sequence",
    title: "等差数列の和（基本）",
    description: "等差数列の和の公式を用いる",
  },
  {
    id: "seq_arithmetic_sum_from_terms_basic",
    unit: "mathB",
    section: "sequence",
    title: "等差数列の和（項から）（基本）",
    description: "初項と $a_n$ から和を求める",
  },
  {
    id: "seq_arithmetic_mean_basic",
    unit: "mathB",
    section: "sequence",
    title: "等差数列の平均（基本）",
    description: "$a_1$ と $a_3$ から $a_2$ を求める",
  },
  {
    id: "seq_arithmetic_diff_from_terms_basic",
    unit: "mathB",
    section: "sequence",
    title: "公差（項から）（基本）",
    description: "$a_1$ と $a_4$ から公差を求める",
  },
  {
    id: "stats_sample_mean_basic",
    unit: "mathB",
    section: "statistics",
    title: "標本平均（基本）",
    description: "データの平均を求める",
  },
  {
    id: "stats_sampling_mean_basic",
    unit: "mathB",
    section: "statistics",
    title: "標本平均の平均（基本）",
    description: "標本平均の期待値が母平均に等しいことを使う",
  },
  {
    id: "stats_standard_error_basic",
    unit: "mathB",
    section: "statistics",
    title: "標準誤差（基本）",
    description: "標準誤差 $\\sigma/\\sqrt{n}$ を求める",
  },
  {
    id: "stats_confidence_interval_basic",
    unit: "mathB",
    section: "statistics",
    title: "信頼区間の幅（基本）",
    description: "幅（片側）$z\\cdot \\text{SE}$ を求める",
  },
  {
    id: "stats_scatter_basic",
    unit: "mathB",
    section: "statistics",
    title: "散布図（基本）",
    description: "散布図から相関の向きを読み取る",
  },
  {
    id: "stats_covariance_basic",
    unit: "mathB",
    section: "statistics",
    title: "共分散（基本）",
    description: "共分散を計算して関係の向きを判断する",
  },
  {
    id: "stats_correlation_basic",
    unit: "mathB",
    section: "statistics",
    title: "相関係数（基本）",
    description: "相関係数の値から相関の強さを読み取る",
  },
  {
    id: "stats_regression_basic",
    unit: "mathB",
    section: "statistics",
    title: "回帰直線（基本）",
    description: "回帰直線の式を使って近似値を求める",
  },
  {
    id: "stats_inference_basic",
    unit: "mathB",
    section: "statistics",
    title: "統計的推定（基本）",
    description: "推定の用語や区間の読み取りに慣れる",
  },
  {
    id: "vector_operations_basic",
    unit: "mathB",
    section: "vector",
    title: "ベクトルの演算（基本）",
    description: "成分表示でのベクトル演算に慣れる",
  },
  {
    id: "vector_inner_basic",
    unit: "mathB",
    section: "vector",
    title: "内積（基本）",
    description: "内積の計算と直交条件を確認する",
  },
  {
    id: "seq_recurrence_basic",
    unit: "mathB",
    section: "sequence",
    title: "漸化式（基本）",
    description: "一次の漸化式から一般項を求める基本問題に取り組む",
  },
  {
    id: "seq_recurrence_term_basic",
    unit: "mathB",
    section: "sequence",
    title: "漸化式の項（基本）",
    description: "漸化式から具体的な項を求める",
  },
  {
    id: "vector_length_basic",
    unit: "mathB",
    section: "vector",
    title: "ベクトルの長さ（基本）",
    description: "成分表示のベクトルの長さ（長さの二乗）を求める",
  },
  {
    id: "vector_unit_basic",
    unit: "mathB",
    section: "vector",
    title: "単位ベクトル（基本）",
    description: "ベクトルを長さで割って単位ベクトルにする",
  },
  {
    id: "vector_parallel_basic",
    unit: "mathB",
    section: "vector",
    title: "平行条件（基本）",
    description: "平行なベクトルの比例係数を求める",
  },
  {
    id: "vector_component_basic",
    unit: "mathB",
    section: "vector",
    title: "成分（基本）",
    description: "ベクトルの成分を読み取る",
  },
  {
    id: "vector_line_point_basic",
    unit: "mathB",
    section: "vector",
    title: "直線上の点（基本）",
    description: "パラメータから座標を求める",
  },
  {
    id: "vector_orthogonal_condition_basic",
    unit: "mathB",
    section: "vector",
    title: "直交条件（基本）",
    description: "内積が0になる条件で未知数を求める",
  },
  {
    id: "vector_distance_plane_basic",
    unit: "mathB",
    section: "vector",
    title: "平面との距離（基本）",
    description: "点と平面の距離を求める",
  },
  {
    id: "vector_plane_normal_basic",
    unit: "mathB",
    section: "vector",
    title: "法線ベクトル（基本）",
    description: "平面の法線ベクトルの成分を読む",
  },
  {
    id: "vector_midpoint_basic",
    unit: "mathB",
    section: "vector",
    title: "中点（基本）",
    description: "2点の中点の座標を求める",
  },
  {
    id: "vector_inner_from_angle_basic",
    unit: "mathB",
    section: "vector",
    title: "内積と角（基本）",
    description: "大きさと角から内積を求める",
  },
  {
    id: "complex_basic",
    unit: "mathC",
    section: "complex",
    title: "複素数の計算（基本）",
    description: "複素数の加減乗の基本計算に取り組む",
  },
  {
    id: "complex_modulus_basic",
    unit: "mathC",
    section: "complex",
    title: "複素数の絶対値（基本）",
    description: "複素数の絶対値（大きさ）の計算に取り組む",
  },
  {
    id: "complex_plane_basic",
    unit: "mathC",
    section: "complex",
    title: "複素数平面（基本）",
    description: "複素数平面での点の対応を確認する",
  },
  {
    id: "complex_conjugate_basic",
    unit: "mathC",
    section: "complex",
    title: "共役複素数（基本）",
    description: "共役複素数の性質を使った計算に取り組む",
  },
  {
    id: "complex_rotation_basic",
    unit: "mathC",
    section: "complex",
    title: "複素数の回転（基本）",
    description: "$i$ 倍による90度回転の理解を深める",
  },
  {
    id: "complex_polar_basic",
    unit: "mathC",
    section: "complex",
    title: "極形式（基本）",
    description: "複素数を極形式で表す",
  },
  {
    id: "complex_distance_basic",
    unit: "mathC",
    section: "complex",
    title: "複素数平面の距離（基本）",
    description: "2点の距離（距離の二乗）を求める",
  },
  {
    id: "complex_midpoint_basic",
    unit: "mathC",
    section: "complex",
    title: "複素数平面の中点（基本）",
    description: "2点の中点の座標を求める",
  },
  {
    id: "complex_square_real_basic",
    unit: "mathC",
    section: "complex",
    title: "複素数の平方（実部）（基本）",
    description: "平方の実部 $a^2-b^2$ を求める",
  },
  {
    id: "complex_power_i_basic",
    unit: "mathC",
    section: "complex",
    title: "iの累乗（基本）",
    description: "$i^n$ を求める",
  },
  {
    id: "complex_conjugate_product_basic",
    unit: "mathC",
    section: "complex",
    title: "共役積（基本）",
    description: "$z\\overline{z}$ を求める",
  },
  {
    id: "complex_modulus_square_basic",
    unit: "mathC",
    section: "complex",
    title: "絶対値の二乗（基本）",
    description: "$|z|^2$ を求める",
  },
  {
    id: "conic_circle_basic",
    unit: "mathC",
    section: "conic",
    title: "円の方程式（基本）",
    description: "円の中心・半径の読み取りに慣れる",
  },
  {
    id: "conic_circle_center_basic",
    unit: "mathC",
    section: "conic",
    title: "円の中心（基本）",
    description: "円の中心の座標を読み取る",
  },
  {
    id: "conic_intersection_basic",
    unit: "mathC",
    section: "conic",
    title: "交点の判別（基本）",
    description: "円と直線の交点の個数を判定する",
  },
  {
    id: "conic_tangent_basic",
    unit: "mathC",
    section: "conic",
    title: "接線の条件（基本）",
    description: "円に接する直線の条件を判定する",
  },
  {
    id: "conic_parabola_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の基本（焦点）",
    description: "放物線の標準形から焦点を求める",
  },
  {
    id: "conic_parabola_directrix_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の準線（基本）",
    description: "放物線の準線を求める",
  },
  {
    id: "conic_parabola_focus_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の焦点（基本）",
    description: "放物線の焦点を求める",
  },
  {
    id: "conic_parabola_latus_rectum_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の準弦（基本）",
    description: "準弦の長さを求める",
  },
  {
    id: "conic_parabola_tangent_slope_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の接線の傾き（基本）",
    description: "接線の傾きを求める",
  },
  {
    id: "conic_parabola_vertex_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の頂点（基本）",
    description: "頂点の座標を読み取る",
  },
  {
    id: "conic_circle_radius_basic",
    unit: "mathC",
    section: "conic",
    title: "円の半径（基本）",
    description: "円の半径を求める",
  },
  {
    id: "conic_ellipse_axis_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の軸（基本）",
    description: "長軸がどの軸か判定する",
  },
  {
    id: "conic_hyperbola_vertex_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の頂点（基本）",
    description: "双曲線の頂点の座標を求める",
  },
  {
    id: "complex_argument_axis_basic",
    unit: "mathC",
    section: "complex",
    title: "偏角（軸上）（基本）",
    description: "軸上の点の偏角を求める",
  },
  {
    id: "complex_argument_quadrant_basic",
    unit: "mathC",
    section: "complex",
    title: "偏角（象限）（基本）",
    description: "象限から偏角を求める",
  },
  {
    id: "complex_argument_degree_basic",
    unit: "mathC",
    section: "complex",
    title: "偏角（度数法）（基本）",
    description: "度数法で偏角を求める",
  },
  {
    id: "complex_polar_value_basic",
    unit: "mathC",
    section: "complex",
    title: "極形式の実部（基本）",
    description: "極形式から実部を求める",
  },
  {
    id: "complex_de_moivre_basic",
    unit: "mathC",
    section: "complex",
    title: "ド・モアブル（基本）",
    description: "ド・モアブルで実部を求める",
  },
  {
    id: "complex_root_unity_basic",
    unit: "mathC",
    section: "complex",
    title: "n乗根の偏角（基本）",
    description: "n乗根の偏角を求める",
  },
  {
    id: "complex_multiply_real_basic",
    unit: "mathC",
    section: "complex",
    title: "積の実部（基本）",
    description: "複素数の積の実部を求める",
  },
  {
    id: "complex_multiply_imag_basic",
    unit: "mathC",
    section: "complex",
    title: "積の虚部（基本）",
    description: "複素数の積の虚部を求める",
  },
  {
    id: "complex_modulus_product_basic",
    unit: "mathC",
    section: "complex",
    title: "積の絶対値（基本）",
    description: "|z1z2|=|z1||z2| を使う",
  },
  {
    id: "complex_equation_abs_basic",
    unit: "mathC",
    section: "complex",
    title: "絶対値（基本）",
    description: "複素数の絶対値を求める",
  },
  {
    id: "complex_equation_real_imag_basic",
    unit: "mathC",
    section: "complex",
    title: "実部（基本）",
    description: "複素数の実部を求める",
  },
  {
    id: "complex_equation_conjugate_basic",
    unit: "mathC",
    section: "complex",
    title: "共役の和（基本）",
    description: "z+\\overline{z} を求める",
  },
  {
    id: "complex_rotation_real_basic",
    unit: "mathC",
    section: "complex",
    title: "回転の実部（基本）",
    description: "回転後の実部を求める",
  },
  {
    id: "complex_rotation_imag_basic",
    unit: "mathC",
    section: "complex",
    title: "回転の虚部（基本）",
    description: "回転後の虚部を求める",
  },
  {
    id: "complex_rotation_180_basic",
    unit: "mathC",
    section: "complex",
    title: "180度回転（基本）",
    description: "180度回転後の実部を求める",
  },
  {
    id: "complex_division_real_basic",
    unit: "mathC",
    section: "complex",
    title: "除法の実部（基本）",
    description: "複素数の除法の実部を求める",
  },
  {
    id: "complex_modulus_sum_basic",
    unit: "mathC",
    section: "complex",
    title: "絶対値の和（基本）",
    description: "|z_1|+|z_2| を求める",
  },
  {
    id: "complex_polar_imag_basic",
    unit: "mathC",
    section: "complex",
    title: "極形式の虚部（基本）",
    description: "極形式から虚部を求める",
  },
  {
    id: "complex_conjugate_modulus_basic",
    unit: "mathC",
    section: "complex",
    title: "共役の絶対値（基本）",
    description: "|\\overline{z}| を求める",
  },
  {
    id: "complex_add_modulus_square_basic",
    unit: "mathC",
    section: "complex",
    title: "和の絶対値（基本）",
    description: "|z_1+z_2|^2 を求める",
  },
  {
    id: "complex_sub_modulus_square_basic",
    unit: "mathC",
    section: "complex",
    title: "差の絶対値（基本）",
    description: "|z_1-z_2|^2 を求める",
  },
  {
    id: "complex_triangle_area_basic",
    unit: "mathC",
    section: "complex",
    title: "三角形の面積（基本）",
    description: "複素数平面上の三角形の面積を求める",
  },
  {
    id: "complex_midpoint_distance_basic",
    unit: "mathC",
    section: "complex",
    title: "中点と距離（基本）",
    description: "中点と距離を求める",
  },
  {
    id: "complex_parallel_condition_basic",
    unit: "mathC",
    section: "complex",
    title: "平行条件（基本）",
    description: "z1/z2 が実数かを判定する",
  },
  {
    id: "complex_perpendicular_condition_basic",
    unit: "mathC",
    section: "complex",
    title: "直交条件（基本）",
    description: "z1/z2 が純虚数かを判定する",
  },
  {
    id: "complex_locus_circle_radius_basic",
    unit: "mathC",
    section: "complex",
    title: "軌跡の半径（基本）",
    description: "|z-(a+bi)|=r の半径を求める",
  },
  {
    id: "complex_locus_circle_center_basic",
    unit: "mathC",
    section: "complex",
    title: "軌跡の中心（基本）",
    description: "|z-(a+bi)|=r の中心を求める",
  },
  {
    id: "complex_argument_product_basic",
    unit: "mathC",
    section: "complex",
    title: "偏角の加法（基本）",
    description: "積の偏角は和になる",
  },
  {
    id: "complex_argument_quotient_basic",
    unit: "mathC",
    section: "complex",
    title: "偏角の減法（基本）",
    description: "商の偏角は差になる",
  },
  {
    id: "complex_rotation_90_matrix_basic",
    unit: "mathC",
    section: "complex",
    title: "90度回転（基本）",
    description: "90度回転の座標を求める",
  },
  {
    id: "complex_argument_power_basic",
    unit: "mathC",
    section: "complex",
    title: "偏角のべき（基本）",
    description: "偏角のべきで nθ を求める",
  },
  {
    id: "complex_modulus_power_basic",
    unit: "mathC",
    section: "complex",
    title: "絶対値のべき（基本）",
    description: "|z|^n を求める",
  },
  {
    id: "complex_locus_bisector_basic",
    unit: "mathC",
    section: "complex",
    title: "垂直二等分線（基本）",
    description: "2点の等距離の軌跡を求める",
  },
  {
    id: "complex_locus_vertical_line_basic",
    unit: "mathC",
    section: "complex",
    title: "垂直二等分線（実軸）（基本）",
    description: "実軸上の2点の等距離の軌跡を求める",
  },
  {
    id: "complex_argument_conjugate_basic",
    unit: "mathC",
    section: "complex",
    title: "共役の偏角（基本）",
    description: "共役の偏角を求める",
  },
  {
    id: "complex_argument_inverse_basic",
    unit: "mathC",
    section: "complex",
    title: "逆数の偏角（基本）",
    description: "1/z の偏角を求める",
  },
  {
    id: "complex_locus_horizontal_line_basic",
    unit: "mathC",
    section: "complex",
    title: "垂直二等分線（虚軸対称）（基本）",
    description: "上下対称な2点の等距離の軌跡を求める",
  },
  {
    id: "complex_section_internal_basic",
    unit: "mathC",
    section: "complex",
    title: "内分点（基本）",
    description: "2点を内分する点の座標を求める",
  },
  {
    id: "complex_section_external_basic",
    unit: "mathC",
    section: "complex",
    title: "外分点（基本）",
    description: "2点を外分する点の座標を求める",
  },
  {
    id: "complex_line_point_basic",
    unit: "mathC",
    section: "complex",
    title: "線分上の点（基本）",
    description: "線分を比で内分する点を求める",
  },
  {
    id: "conic_ellipse_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の基本（長軸）",
    description: "楕円の標準形から長軸の長さを求める",
  },
  {
    id: "conic_ellipse_major_axis_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の長軸（基本）",
    description: "長軸の長さを求める",
  },
  {
    id: "conic_ellipse_minor_axis_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の短軸（基本）",
    description: "短軸の長さを求める",
  },
  {
    id: "conic_ellipse_tangent_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の接線（基本）",
    description: "接線の係数を求める",
  },
  {
    id: "conic_ellipse_focus_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の焦点（基本）",
    description: "楕円の焦点距離 $c$ を求める",
  },
  {
    id: "conic_hyperbola_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の基本（焦点）",
    description: "双曲線の標準形から焦点距離を求める",
  },
  {
    id: "conic_hyperbola_asymptote_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の漸近線（基本）",
    description: "漸近線の傾きを求める",
  },
  {
    id: "conic_hyperbola_asymptote_slope_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の漸近線の傾き（基本）",
    description: "漸近線の傾きを求める",
  },
  {
    id: "conic_hyperbola_transverse_axis_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の実軸（基本）",
    description: "実軸の長さを求める",
  },
  {
    id: "conic_circle_tangent_slope_basic",
    unit: "mathC",
    section: "conic",
    title: "円の接線の傾き（基本）",
    description: "接線と半径の関係を使う",
  },
  {
    id: "conic_line_intersection_count_basic",
    unit: "mathC",
    section: "conic",
    title: "円と直線の交点（基本）",
    description: "交点の個数を判定する",
  },
  {
    id: "conic_circle_general_radius_basic",
    unit: "mathC",
    section: "conic",
    title: "円の一般形の半径（基本）",
    description: "一般形から半径を求める",
  },
  {
    id: "conic_circle_general_center_basic",
    unit: "mathC",
    section: "conic",
    title: "円の一般形の中心（基本）",
    description: "一般形から中心を求める",
  },
  {
    id: "conic_hyperbola_foci_distance_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の焦点間距離（基本）",
    description: "2焦点間の距離を求める",
  },
  {
    id: "conic_ellipse_c_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の焦点距離（基本）",
    description: "c^2=a^2-b^2 を使う",
  },
  {
    id: "conic_hyperbola_c_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の焦点距離（基本）",
    description: "c^2=a^2+b^2 を使う",
  },
  {
    id: "conic_parabola_line_intersection_count_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線と直線の交点（基本）",
    description: "交点の個数を判定する",
  },
  {
    id: "conic_ellipse_value_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の代入値（基本）",
    description: "式に点を代入した値を求める",
  },
  {
    id: "conic_hyperbola_value_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の代入値（基本）",
    description: "式に点を代入した値を求める",
  },
  {
    id: "conic_parabola_general_focus_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の焦点（一般形）（基本）",
    description: "平行移動した放物線の焦点を求める",
  },
  {
    id: "conic_parabola_vertex_shift_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の頂点（平行移動）（基本）",
    description: "平行移動した放物線の頂点を求める",
  },
  {
    id: "conic_circle_tangent_point_basic",
    unit: "mathC",
    section: "conic",
    title: "円の接点（基本）",
    description: "与えられた接点の座標を答える",
  },
  {
    id: "conic_parabola_focus_vertical_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の焦点（縦）（基本）",
    description: "x^2=4py の焦点を求める",
  },
  {
    id: "conic_parabola_directrix_vertical_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の準線（縦）（基本）",
    description: "x^2=4py の準線を求める",
  },
  {
    id: "conic_ellipse_focus_distance_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の焦点間距離（基本）",
    description: "2焦点間距離を求める",
  },
  {
    id: "conic_circle_point_on_basic",
    unit: "mathC",
    section: "conic",
    title: "円上の点判定（基本）",
    description: "点が円上か判定する",
  },
  {
    id: "conic_parabola_tangent_intercept_basic",
    unit: "mathC",
    section: "conic",
    title: "放物線の接線の切片（基本）",
    description: "接線の切片を求める",
  },
  {
    id: "conic_ellipse_center_basic",
    unit: "mathC",
    section: "conic",
    title: "楕円の中心（基本）",
    description: "標準形から中心を求める",
  },
  {
    id: "conic_hyperbola_center_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の中心（基本）",
    description: "標準形から中心を求める",
  },
  {
    id: "conic_hyperbola_asymptote_equation_basic",
    unit: "mathC",
    section: "conic",
    title: "双曲線の漸近線の式（基本）",
    description: "漸近線の係数を求める",
  },
  {
    id: "prob_binomial_expectation_basic",
    unit: "mathC",
    section: "probability",
    title: "二項分布の期待値（基本）",
    description: "二項分布の期待値を求める基本問題に取り組む",
  },
  {
    id: "prob_binomial_probability_basic",
    unit: "mathC",
    section: "probability",
    title: "二項分布の確率（基本）",
    description: "二項分布の確率 $\\binom{n}{k}p^k(1-p)^{n-k}$ を使う",
  },
  {
    id: "prob_binomial_variance_basic",
    unit: "mathC",
    section: "probability",
    title: "二項分布の分散（基本）",
    description: "二項分布の分散 $np(1-p)$ を使う基本問題に取り組む",
  },
  {
    id: "normal_distribution_basic",
    unit: "mathC",
    section: "probability",
    title: "正規分布の平均・分散（基本）",
    description: "正規分布の平均と分散を読み取る",
  },
  {
    id: "normal_standardization_basic",
    unit: "mathC",
    section: "probability",
    title: "標準化（基本）",
    description: "正規分布の標準化で $z$ を求める",
  },
  {
    id: "normal_backsolve_basic",
    unit: "mathC",
    section: "probability",
    title: "標準化の逆（基本）",
    description: "$z$ から $x$ を求める",
  },
  {
    id: "vector_section_basic",
    unit: "mathB",
    section: "vector",
    title: "内分・外分（基本）",
    description: "線分の内分点・外分点の座標を求める",
  },
  {
    id: "vector_space_basic",
    unit: "mathB",
    section: "vector",
    title: "空間ベクトル（基本）",
    description: "空間ベクトルの成分計算に慣れる",
  },
  {
    id: "vector_distance_basic",
    unit: "mathB",
    section: "vector",
    title: "空間距離（基本）",
    description: "2点間の距離（距離の二乗）を求める",
  },
  {
    id: "vector_plane_basic",
    unit: "mathB",
    section: "vector",
    title: "平面の方程式（基本）",
    description: "法線ベクトルと通過点から平面方程式を作る",
  },
  {
    id: "vector_orthogonality_basic",
    unit: "mathB",
    section: "vector",
    title: "直交条件（基本）",
    description: "内積が0になる条件から未知数を求める",
  },
  {
    id: "vector_angle_basic",
    unit: "mathB",
    section: "vector",
    title: "ベクトルのなす角（基本）",
    description: "内積から cosθ を求める",
  },
  {
    id: "vector_projection_basic",
    unit: "mathB",
    section: "vector",
    title: "射影（基本）",
    description: "射影の長さの二乗を求める",
  },
  {
    id: "vector_line_basic",
    unit: "mathB",
    section: "vector",
    title: "直線のパラメータ（基本）",
    description: "方向ベクトルを使って点を求める",
  },
  {
    id: "vector_area_basic",
    unit: "mathB",
    section: "vector",
    title: "面積（基本）",
    description: "平行四辺形の面積を求める",
  },
  {
    id: "vector_equation_basic",
    unit: "mathB",
    section: "vector",
    title: "ベクトル方程式（基本）",
    description: "ベクトル方程式から係数や座標を求める",
  },
  {
    id: "complex_argument_basic",
    unit: "mathC",
    section: "complex",
    title: "偏角（基本）",
    description: "複素数の偏角を基本角で答える",
  },
];

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
