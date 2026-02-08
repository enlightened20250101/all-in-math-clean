// src/lib/course/templateRegistry.ts
import type { QuestionTemplate } from "./types";
import { quadGraphTemplates } from "./templates/math1/quad_graph_basic";
import { quadGraphVariantTemplates } from "./templates/math1/quad_graph_variant_basic";
import { quadGraphCoefficientVariantTemplates } from "./templates/math1/quad_graph_coefficient_variant_basic";
import { quadGraphThroughPointsVariantTemplates } from "./templates/math1/quad_graph_through_points_variant_basic";
import { quadMaxMinTemplates } from "./templates/math1/quad_maxmin_basic";
import { quadMaxMinVariantTemplates } from "./templates/math1/quad_maxmin_variant_basic";
import { quadInequalityTemplates } from "./templates/math1/quad_inequality_basic";
import { quadInequalityVariantTemplates } from "./templates/math1/quad_inequality_variant_basic";
import { combiTemplates } from "./templates/mathA/combi_basic";
import { combiPermutationTemplates } from "./templates/mathA/combi_permutation_basic";
import { combiPermutationVariantTemplates } from "./templates/mathA/combi_permutation_variant_basic";
import { algebraTemplates } from "./templates/math1/algebra_basic";
import { algCtPassageQuadraticTemplates } from "./templates/math1/alg_ct_passage_quadratic_basic";
import { algCtPassageQuadraticGraphTemplates } from "./templates/math1/alg_ct_passage_quadratic_graph_basic";
import { algebraCtPassageSystemTemplates } from "./templates/math1/algebra_ct_passage_system_basic";
import { algebraCtPassageFactorTemplates } from "./templates/math1/algebra_ct_passage_factor_basic";
import { algebraCtPassageRatioTemplates } from "./templates/math1/algebra_ct_passage_ratio_basic";
import { algebraCtPassageInequalityTemplates } from "./templates/math1/algebra_ct_passage_inequality_basic";
import { coordCtPassageLinearTemplates } from "./templates/math1/coord_ct_passage_linear_basic";
import { propCtPassageTemplates } from "./templates/math1/prop_ct_passage_basic";
import { inequalityCtPassageAmgmTemplates } from "./templates/math1/ineq_ct_passage_amgm_basic";
import { ratioCtPassageTemplates } from "./templates/math1/ratio_ct_passage_basic";
import { quadSolveTemplates } from "./templates/math1/quad_solve_basic";
import { quadDiscriminantTemplates } from "./templates/math1/quad_discriminant_basic";
import { quadDiscriminantVariantTemplates } from "./templates/math1/quad_discriminant_variant_basic";
import { quadRootsRelationsTemplates } from "./templates/math1/quad_roots_relations_basic";
import { quadRootsRelationsVariantTemplates } from "./templates/math1/quad_roots_relations_variant_basic";
import { trigRatioTemplates } from "./templates/math1/trig_ratio_basic";
import { trigRatioVariantTemplates } from "./templates/math1/trig_ratio_variant_basic";
import { trigRatioWordVariantTemplates } from "./templates/math1/trig_ratio_word_variant_basic";
import { trigSpecialAnglesTemplates } from "./templates/math1/trig_special_angles_basic";
import { trigSpecialAnglesVariantTemplates } from "./templates/math1/trig_special_angles_variant_basic";
import { trigCtPassageTriangleTemplates } from "./templates/math1/trig_ct_passage_triangle_basic";
import { geoMeasureRightTriangleTemplates } from "./templates/math1/geo_measure_right_triangle_basic";
import { geoMeasureRightTriangleVariantTemplates } from "./templates/math1/geo_measure_right_triangle_variant_basic";
import { geoCtPassageAngleTemplates } from "./templates/math1/geo_ct_passage_angle_basic";
import { geoCtPassageSimilarityTemplates } from "./templates/math1/geo_ct_passage_similarity_basic";
import { geoSineCosineLawTemplates } from "./templates/math1/geo_sine_cosine_law_basic";
import { geoSineCosineLawVariantTemplates } from "./templates/math1/geo_sine_cosine_law_variant_basic";
import { setOperationsTemplates } from "./templates/math1/set_operations_basic";
import { setOperationsVariantTemplates } from "./templates/math1/set_operations_variant_basic";
import { setCtPassageTemplates } from "./templates/mathA/set_ct_passage_basic";
import { propPropositionTemplates } from "./templates/math1/prop_proposition_basic";
import { propPropositionVariantTemplates } from "./templates/math1/prop_proposition_variant_basic";
import { dataSummaryTemplates } from "./templates/math1/data_summary_basic";
import { dataSummaryFrequencyVariantTemplates } from "./templates/math1/data_summary_frequency_variant_basic";
import { dataVarianceSdTemplates } from "./templates/math1/data_variance_sd_basic";
import { dataVarianceSdVariantTemplates } from "./templates/math1/data_variance_sd_variant_basic";
import { statsVarianceVariantTemplates } from "./templates/mathB/stats_variance_variant_basic";
import { dataScatterTemplates } from "./templates/math1/data_scatter_basic";
import { dataScatterVariantTemplates } from "./templates/math1/data_scatter_variant_basic";
import { dataCovarianceTemplates } from "./templates/math1/data_covariance_basic";
import { dataCovarianceVariantTemplates } from "./templates/math1/data_covariance_variant_basic";
import { dataCovarianceVariant2Templates } from "./templates/math1/data_covariance_variant2_basic";
import { dataCorrelationTemplates } from "./templates/math1/data_correlation_basic";
import { dataCorrelationVariantTemplates } from "./templates/math1/data_correlation_variant_basic";
import { dataRegressionTemplates } from "./templates/math1/data_regression_basic";
import { dataRegressionVariantTemplates } from "./templates/math1/data_regression_variant_basic";
import { probBasicTemplates } from "./templates/mathA/prob_basic";
import { probBasicVariantTemplates } from "./templates/mathA/prob_basic_variant_basic";
import { probBasicConditionVariantTemplates } from "./templates/mathA/prob_basic_condition_variant_basic";
import { probComplementTemplates } from "./templates/mathA/prob_complement_basic";
import { probComplementVariantTemplates } from "./templates/mathA/prob_complement_variant_basic";
import { combiConditionsTemplates } from "./templates/mathA/combi_conditions_basic";
import { combiConditionsVariantTemplates } from "./templates/mathA/combi_conditions_variant_basic";
import { probCombiTemplates } from "./templates/mathA/prob_combi_basic";
import { probCombiVariantTemplates } from "./templates/mathA/prob_combi_variant_basic";
import { probCombiConditionVariantTemplates } from "./templates/mathA/prob_combi_condition_variant_basic";
import { intDivisorMultipleTemplates } from "./templates/mathA/int_divisor_multiple_basic";
import { intDivisorMultipleVariantTemplates } from "./templates/mathA/int_divisor_multiple_variant_basic";
import { intRemainderTemplates } from "./templates/mathA/int_remainder_basic";
import { intRemainderVariantTemplates } from "./templates/mathA/int_remainder_variant_basic";
import { intRemainderAppliedVariantTemplates } from "./templates/mathA/int_remainder_applied_variant_basic";
import { intPrimeFactorTemplates } from "./templates/mathA/int_prime_factor_basic";
import { intGcdLcmApplicationsTemplates } from "./templates/mathA/int_gcd_lcm_applications_basic";
import { intGcdLcmVariantTemplates } from "./templates/mathA/int_gcd_lcm_variant_basic";
import { intDiophantineTemplates } from "./templates/mathA/int_diophantine_basic";
import { intDiophantineVariantTemplates } from "./templates/mathA/int_diophantine_variant_basic";
import { intModArithmeticIntroTemplates } from "./templates/mathA/int_mod_arithmetic_intro";
import { geoRatioTheoremTemplates } from "./templates/mathA/geo_ratio_theorems";
import { geoCircleGeometryTemplates } from "./templates/mathA/geo_circle_geometry";
import { geoTriangleCentersTemplates } from "./templates/mathA/geo_triangle_centers";
import { geoCircleRelationsTemplates } from "./templates/mathA/geo_circle_relations";
import { geoCtPassageCircleTemplates } from "./templates/mathA/geo_ct_passage_circle_basic";
import { inductionTemplates } from "./templates/mathA/induction_basic";
import { expLogBasicTemplates } from "./templates/math2/exp_log_basic";
import { expLogBasicVariantTemplates } from "./templates/math2/exp_log_basic_variant_basic";
import { expLogUnknownBaseTemplates } from "./templates/math2/exp_log_unknown_base_basic";
import { expLogUnknownExponentTemplates } from "./templates/math2/exp_log_unknown_exponent_basic";
import { expLogEquationTemplates } from "./templates/math2/exp_log_equations_basic";
import { expLogEquationVariantTemplates } from "./templates/math2/exp_log_equation_variant_basic";
import { expLogMixedEquationTemplates } from "./templates/math2/exp_log_mixed_equation_basic";
import { expLogPropertyTemplates } from "./templates/math2/exp_log_property_basic";
import { expLogPropertyVariantTemplates } from "./templates/math2/exp_log_property_variant_basic";
import { expLogPropertyBacksolveTemplates } from "./templates/math2/exp_log_property_backsolve_basic";
import { expLogChangeBaseTemplates } from "./templates/math2/exp_log_change_base_basic";
import { expLogChangeBaseVariantTemplates } from "./templates/math2/exp_log_change_base_variant_basic";
import { expLogChangeBaseVariant2Templates } from "./templates/math2/exp_log_change_base_variant2_basic";
import { expLogGrowthTemplates } from "./templates/math2/exp_log_growth_basic";
import { expLogGrowthVariantTemplates } from "./templates/math2/exp_log_growth_variant_basic";
import { expLogDomainTemplates } from "./templates/math2/exp_log_domain_basic";
import { expLogDomainVariantTemplates } from "./templates/math2/exp_log_domain_variant_basic";
import { expLogSimpleEquationTemplates } from "./templates/math2/exp_log_simple_equation_basic";
import { expLogSimpleEquationVariantTemplates } from "./templates/math2/exp_log_simple_equation_variant_basic";
import { expLogPowerEquationTemplates } from "./templates/math2/exp_log_power_equation_basic";
import { expLogPowerEquationVariantTemplates } from "./templates/math2/exp_log_power_equation_variant_basic";
import { expLogLogEquationTemplates } from "./templates/math2/exp_log_log_equation_basic";
import { expLogLogEquationVariantTemplates } from "./templates/math2/exp_log_log_equation_variant_basic";
import { expLogLogProductTemplates } from "./templates/math2/exp_log_log_product_basic";
import { expLogLogProductVariantTemplates } from "./templates/math2/exp_log_log_product_variant_basic";
import { expLogLogSumTemplates } from "./templates/math2/exp_log_log_sum_basic";
import { expLogLogSumVariantTemplates } from "./templates/math2/exp_log_log_sum_variant_basic";
import { expLogLogDiffTemplates } from "./templates/math2/exp_log_log_diff_basic";
import { expLogLogDiffVariantTemplates } from "./templates/math2/exp_log_log_diff_variant_basic";
import { expLogCtPassageTemplates } from "./templates/math2/exp_log_ct_passage_basic";
import { calcCtPassageTemplates } from "./templates/math2/calc_ct_passage_basic";
import { calcCtPassageIntegralTemplates } from "./templates/math2/calc_ct_passage_integral_basic";
import { calcCtPassageExtremaTemplates } from "./templates/math2/calc_ct_passage_extrema_basic";
import { polyRemainderTemplates } from "./templates/math2/poly_remainder_basic";
import { polyRemainderVariantTemplates } from "./templates/math2/poly_remainder_variant_basic";
import { polyFactorKTemplates } from "./templates/math2/poly_factor_k_basic";
import { polyFactorKVariantTemplates } from "./templates/math2/poly_factor_k_variant_basic";
import { polyValueSumTemplates } from "./templates/math2/poly_value_sum_basic";
import { polyValueSumVariantTemplates } from "./templates/math2/poly_value_sum_variant_basic";
import { polyCoeffFromRootsTemplates } from "./templates/math2/poly_coeff_from_roots_basic";
import { polyCoeffFromRootsVariantTemplates } from "./templates/math2/poly_coeff_from_roots_variant_basic";
import { binomialCoeffTemplates } from "./templates/math2/binomial_coeff_basic";
import { binomialCoeffVariantTemplates } from "./templates/math2/binomial_coeff_variant_basic";
import { binomialXyCoeffTemplates } from "./templates/math2/binomial_xy_coeff_basic";
import { binomialXyCoeffVariantTemplates } from "./templates/math2/binomial_xy_coeff_variant_basic";
import { binomialValueTemplates } from "./templates/math2/binomial_value_basic";
import { binomialValueVariantTemplates } from "./templates/math2/binomial_value_variant_basic";
import { binomialMiddleCoeffTemplates } from "./templates/math2/binomial_middle_coeff_basic";
import { binomialMiddleCoeffVariantTemplates } from "./templates/math2/binomial_middle_coeff_variant_basic";
import { identityEvalTemplates } from "./templates/math2/identity_eval_basic";
import { identityEvalVariantTemplates } from "./templates/math2/identity_eval_variant_basic";
import { identityCoefficientTemplates } from "./templates/math2/identity_coefficient_basic";
import { identityCoefficientVariantTemplates } from "./templates/math2/identity_coefficient_variant_basic";
import { identityCoeffQuadraticTemplates } from "./templates/math2/identity_coeff_quadratic_basic";
import { identityCoeffQuadraticVariantTemplates } from "./templates/math2/identity_coeff_quadratic_variant_basic";
import { inequalityMeanTemplates } from "./templates/math2/inequality_mean_basic";
import { inequalityMeanVariantTemplates } from "./templates/math2/inequality_mean_variant_basic";
import { inequalitySumProductTemplates } from "./templates/math2/inequality_sum_product_basic";
import { inequalitySumProductVariantTemplates } from "./templates/math2/inequality_sum_product_variant_basic";
import { inequalityAmgmTemplates } from "./templates/math2/inequality_amgm_basic";
import { inequalityAmgmVariantTemplates } from "./templates/math2/inequality_amgm_variant_basic";
import { inequalityAmgmVariant2Templates } from "./templates/math2/inequality_amgm_variant2_basic";
import { coordLineSlopeTemplates } from "./templates/math2/coord_line_slope_basic";
import { coordLineSlopeVariantTemplates } from "./templates/math2/coord_line_slope_variant_basic";
import { coordLineInterceptTemplates } from "./templates/math2/coord_line_intercept_basic";
import { coordLineInterceptVariantTemplates } from "./templates/math2/coord_line_intercept_variant_basic";
import { coordLineGeneralInterceptVariantTemplates } from "./templates/math2/coord_line_general_to_intercept_variant_basic";
import { coordLineParallelPerpTemplates } from "./templates/math2/coord_line_parallel_perp_basic";
import { coordLineParallelPerpVariantTemplates } from "./templates/math2/coord_line_parallel_perp_variant_basic";
import { coordDistancePointLineTemplates } from "./templates/math2/coord_distance_point_line_basic";
import { coordDistancePointLineVariantTemplates } from "./templates/math2/coord_distance_point_line_variant_basic";
import { coordCircleRadiusTemplates } from "./templates/math2/coord_circle_radius_basic";
import { coordCircleRadiusVariantTemplates } from "./templates/math2/coord_circle_radius_variant_basic";
import { coordCircleRadiusFromGeneralVariantTemplates } from "./templates/math2/coord_circle_radius_from_general_variant_basic";
import { coordCircleCenterTemplates } from "./templates/math2/coord_circle_center_basic";
import { coordCircleCenterVariantTemplates } from "./templates/math2/coord_circle_center_variant_basic";
import { coordCircleGeneralCenterVariantTemplates } from "./templates/math2/coord_circle_general_center_variant_basic";
import { coordCtPassageCircleTemplates } from "./templates/mathC/coord_ct_passage_circle_basic";
import { coordCtPassageLineTemplates } from "./templates/math2/coord_ct_passage_line_basic";
import { coordRegionTemplates } from "./templates/math2/coord_region_basic";
import { coordRegionVariantTemplates } from "./templates/math2/coord_region_variant_basic";
import { trigIdentityTemplates } from "./templates/math2/trig_identities_basic";
import { trigAmplitudeTemplates } from "./templates/math2/trig_amplitude_basic";
import { trigAmplitudeVariantTemplates } from "./templates/math2/trig_graph_amplitude_variant_basic";
import { trigAmplitudeFromMaxMinVariantTemplates } from "./templates/math2/trig_amplitude_from_maxmin_variant_basic";
import { trigPhaseShiftTemplates } from "./templates/math2/trig_phase_shift_basic";
import { trigPhaseShiftVariantTemplates } from "./templates/math2/trig_phase_shift_variant_basic";
import { trigVerticalShiftTemplates } from "./templates/math2/trig_vertical_shift_basic";
import { trigGraphVerticalShiftVariantTemplates } from "./templates/math2/trig_graph_vertical_shift_variant_basic";
import { trigGraphRangeTemplates } from "./templates/math2/trig_graph_range_basic";
import { trigGraphRangeVariantTemplates } from "./templates/math2/trig_graph_range_variant_basic";
import { trigGraphPeriodTemplates } from "./templates/math2/trig_graph_period_basic";
import { trigGraphPeriodVariantTemplates } from "./templates/math2/trig_graph_period_variant_basic";
import { trigPhasePeriodVariantTemplates } from "./templates/math2/trig_phase_period_variant_basic";
import { trigGraphMidlineTemplates } from "./templates/math2/trig_graph_midline_basic";
import { trigGraphMidlineVariantTemplates } from "./templates/math2/trig_graph_midline_variant_basic";
import { trigMidlineFromMaxMinVariantTemplates } from "./templates/math2/trig_midline_from_maxmin_variant_basic";
import { trigGraphMaxTemplates } from "./templates/math2/trig_graph_max_basic";
import { trigGraphMaxMinVariantTemplates } from "./templates/math2/trig_graph_maxmin_variant_basic";
import { trigGraphMinTemplates } from "./templates/math2/trig_graph_min_basic";
import { trigGraphMinMaxFromMidlineVariantTemplates } from "./templates/math2/trig_graph_minmax_from_midline_variant_basic";
import { trigGraphInterceptTemplates } from "./templates/math2/trig_graph_intercept_basic";
import { trigGraphInterceptVariantTemplates } from "./templates/math2/trig_graph_intercept_variant_basic";
import { trigGraphInterceptVariant2Templates } from "./templates/math2/trig_graph_intercept_variant2_basic";
import { trigEquationRadianTemplates } from "./templates/math2/trig_equation_radian_basic";
import { trigEquationRadianVariantTemplates } from "./templates/math2/trig_equation_radian_variant_basic";
import { trigIdentityTanTemplates } from "./templates/math2/trig_identity_tan_basic";
import { trigIdentityTanVariantTemplates } from "./templates/math2/trig_identity_tan_variant_basic";
import { trigIdentityTanRelationTemplates } from "./templates/math2/trig_identity_tan_relation_basic";
import { trigIdentityTanRelationVariantTemplates } from "./templates/math2/trig_identity_tan_relation_variant_basic";
import { trigIdentityPythagTemplates } from "./templates/math2/trig_identity_pythag_basic";
import { trigIdentityPythagVariantTemplates } from "./templates/math2/trig_identity_pythag_variant_basic";
import { trigBasicVariantTemplates } from "./templates/math2/trig_basic_variant_basic";
import { trigAdditionTemplates } from "./templates/math2/trig_addition_basic";
import { trigAdditionVariantTemplates } from "./templates/math2/trig_addition_variant_basic";
import { trigDoubleAngleTemplates } from "./templates/math2/trig_double_angle_basic";
import { trigDoubleAngleVariantTemplates } from "./templates/math2/trig_double_angle_variant_basic";
import { trigPeriodTemplates } from "./templates/math2/trig_period_basic";
import { trigRadianTemplates } from "./templates/math2/trig_radian_basic";
import { trigCtPassageTemplates } from "./templates/math2/trig_ct_passage_basic";
import { trigCtPassageGraphTemplates } from "./templates/math2/trig_ct_passage_graph_basic";
import { derivativeBasicTemplates } from "./templates/math2/calculus_derivative_basic";
import { derivativeVariantTemplates } from "./templates/math2/calculus_derivative_variant_basic";
import { derivativeLinearTemplates } from "./templates/math2/calculus_derivative_linear_basic";
import { derivativeLinearVariantTemplates } from "./templates/math2/calculus_derivative_linear_variant_basic";
import { integralBasicTemplates } from "./templates/math2/calculus_integral_basic";
import { integralVariantTemplates } from "./templates/math2/calculus_integral_variant_basic";
import { trigEquationTemplates } from "./templates/math2/trig_equations_basic";
import { trigEquationsVariantTemplates } from "./templates/math2/trig_equations_variant_basic";
import { calcLimitBasicTemplates } from "./templates/math3/calc_limit_basic";
import { calcLimitInftyBasicTemplates } from "./templates/math3/calc_limit_infty_basic";
import { calcContinuityBasicTemplates } from "./templates/math3/calc_continuity_basic";
import { calcDerivativeAdvancedBasicTemplates } from "./templates/math3/calc_derivative_advanced_basic";
import { calcDerivativeChainBasicTemplates } from "./templates/math3/calc_derivative_chain_basic";
import { calcIntegralAdvancedBasicTemplates } from "./templates/math3/calc_integral_advanced_basic";
import { calcCurveAreaBasicTemplates } from "./templates/math3/calc_curve_area_basic";
import { calcParametricBasicTemplates } from "./templates/math3/calc_parametric_basic";
import { sequenceArithmeticTemplates } from "./templates/mathB/sequence_arithmetic_basic";
import { sequenceArithmeticBacksolveTemplates } from "./templates/mathB/sequence_arithmetic_backsolve_basic";
import { sequenceArithmeticTermBacksolveTemplates } from "./templates/mathB/sequence_arithmetic_term_backsolve_basic";
import { sequenceGeometricTemplates } from "./templates/mathB/sequence_geometric_basic";
import { sequenceGeometricBacksolveTemplates } from "./templates/mathB/sequence_geometric_backsolve_basic";
import { sequenceGeometricTermBacksolveTemplates } from "./templates/mathB/sequence_geometric_term_backsolve_basic";
import { sequenceSumTemplates } from "./templates/mathB/sequence_sum_basic";
import { sequenceSumVariantTemplates2 } from "./templates/mathB/sequence_sum_variant_basic2";
import { vectorOperationsTemplates } from "./templates/mathC/vector_operations_basic";
import { vectorInnerTemplates } from "./templates/mathC/vector_inner_basic";
import { sequenceRecurrenceTemplates } from "./templates/mathB/sequence_recurrence_basic";
import { sequenceRecurrenceVariantTemplates } from "./templates/mathB/sequence_recurrence_variant_basic";
import { sequenceRecurrenceTermTemplates } from "./templates/mathB/sequence_recurrence_term_basic";
import { sequenceRecurrenceTermVariantTemplates } from "./templates/mathB/sequence_recurrence_term_variant_basic";
import { sequenceCommonRatioFromTermsTemplates } from "./templates/mathB/sequence_common_ratio_from_terms_basic";
import { sequenceCommonRatioFromTermsVariantTemplates } from "./templates/mathB/sequence_common_ratio_from_terms_variant_basic";
import { sequenceGeometricMeanTemplates } from "./templates/mathB/sequence_geometric_mean_basic";
import { sequenceGeometricMeanVariantTemplates } from "./templates/mathB/sequence_geometric_mean_variant_basic";
import { sequenceGeometricSumNTemplates } from "./templates/mathB/sequence_geometric_sum_n_basic";
import { sequenceGeometricSumNBacksolveTemplates } from "./templates/mathB/sequence_geometric_sum_n_backsolve_basic";
import { sequenceTermFromSumTemplates } from "./templates/mathB/sequence_term_from_sum_basic";
import { sequenceTermFromSumConditionTemplates } from "./templates/mathB/sequence_term_from_sum_condition_basic";
import { sequenceCtWordTemplates } from "./templates/mathB/sequence_ct_word_basic";
import { sequenceCtGeometricWordTemplates } from "./templates/mathB/sequence_ct_geometric_word_basic";
import { sequenceCtGeometricLimitWordTemplates } from "./templates/mathB/sequence_ct_geometric_limit_word_basic";
import { sequenceCtRecurrenceWordTemplates } from "./templates/mathB/sequence_ct_recurrence_word_basic";
import { sequenceCtWordChangeTemplates } from "./templates/mathB/sequence_ct_word_change_basic";
import { sequenceCtGeometricChangeTemplates } from "./templates/mathB/sequence_ct_geometric_change_basic";
import { sequenceCtPassageArithmeticTemplates } from "./templates/mathB/sequence_ct_passage_arithmetic_basic";
import { sequenceCtPassageArithmeticBacksolveTemplates } from "./templates/mathB/sequence_ct_passage_arithmetic_backsolve_basic";
import { sequenceCtPassageGeometricTemplates } from "./templates/mathB/sequence_ct_passage_geometric_basic";
import { sequenceCtPassageGeometricBacksolveTemplates } from "./templates/mathB/sequence_ct_passage_geometric_backsolve_basic";
import { sequenceCtPassageLimitTemplates } from "./templates/mathB/sequence_ct_passage_limit_basic";
import { sequenceCtPassageRecurrenceTemplates } from "./templates/mathB/sequence_ct_passage_recurrence_basic";
import { sequenceCtPassageCompareTemplates } from "./templates/mathB/sequence_ct_passage_compare_basic";
import { sequenceCtPassageBacksolveTemplates } from "./templates/mathB/sequence_ct_passage_backsolve_basic";
import { statsCtPassageTemplates } from "./templates/mathB/stats_ct_passage_basic";
import { statsCtPassageRegressionTemplates } from "./templates/mathB/stats_ct_passage_regression_basic";
import { statsCtPassageInferenceTemplates } from "./templates/mathB/stats_ct_passage_inference_basic";
import { statsCtPassageResidualTemplates } from "./templates/mathB/stats_ct_passage_residual_basic";
import { statsCtPassageCorrelationTemplates } from "./templates/mathB/stats_ct_passage_correlation_basic";
import { statsCtPassageOutlierTemplates } from "./templates/mathB/stats_ct_passage_outlier_basic";
import { statsCtPassageShapeTemplates } from "./templates/mathB/stats_ct_passage_shape_basic";
import { statsCtPassageTableTemplates } from "./templates/mathB/stats_ct_passage_table_basic";
import { statsCtPassageMixedTemplates } from "./templates/mathB/stats_ct_passage_mixed_basic";
import { vectorCtPassageTemplates } from "./templates/mathB/vector_ct_passage_basic";
import { vectorCtPassageBasicTemplates } from "./templates/mathC/vector_ct_passage_basic";
import { probCtPassageTemplates } from "./templates/mathA/prob_ct_passage_basic";
import { probCtPassageComplementTemplates } from "./templates/mathA/prob_ct_passage_complement_basic";
import { probCtPassageConditionalTemplates } from "./templates/mathA/prob_ct_passage_conditional_basic";
import { probCtPassageMixedTemplates } from "./templates/mathA/prob_ct_passage_mixed_basic";
import { probCtPassageConditionalAdvancedTemplates } from "./templates/mathA/prob_ct_passage_conditional_advanced_basic";
import { probCtPassageTrialsTemplates } from "./templates/mathA/prob_ct_passage_trials_basic";
import { probCtPassageBayesTemplates } from "./templates/mathA/prob_ct_passage_bayes_basic";
import { dataCtPassageTemplates } from "./templates/math1/data_ct_passage_basic";
import { dataCtPassageScatterTemplates } from "./templates/math1/data_ct_passage_scatter_basic";
import { dataCtPassageSummaryTemplates } from "./templates/math1/data_ct_passage_summary_basic";
import { dataCtPassageRegressionTemplates } from "./templates/math1/data_ct_passage_regression_basic";
import { statsSampleMeanTemplates } from "./templates/mathB/stats_sample_mean_basic";
import { statsSamplingMeanTemplates } from "./templates/mathB/stats_sampling_mean_basic";
import { statsStandardErrorTemplates } from "./templates/mathB/stats_standard_error_basic";
import { statsCtStandardErrorBacksolveTemplates } from "./templates/mathB/stats_ct_standard_error_backsolve_basic";
import { statsConfidenceIntervalTemplates } from "./templates/mathB/stats_confidence_interval_basic";
import { statsCtInferenceWordTemplates } from "./templates/mathB/stats_ct_inference_word_basic";
import { statsCtRegressionTemplates } from "./templates/mathB/stats_ct_regression_basic";
import { statsCtScatterContextTemplates } from "./templates/mathB/stats_ct_scatter_context_basic";
import { statsCtResidualContextTemplates } from "./templates/mathB/stats_ct_residual_context_basic";
import { statsCtFitCompareTemplates } from "./templates/mathB/stats_ct_fit_compare_basic";
import { statsCtConfidenceBoundsTemplates } from "./templates/mathB/stats_ct_confidence_bounds_basic";
import { statsScatterTemplates } from "./templates/mathB/stats_scatter_basic";
import { statsScatterVariantTemplates } from "./templates/mathB/stats_scatter_variant_basic";
import { statsCovarianceTemplates } from "./templates/mathB/stats_covariance_basic";
import { statsCovarianceVariantTemplates } from "./templates/mathB/stats_covariance_variant_basic";
import { statsCorrelationTemplates } from "./templates/mathB/stats_correlation_basic";
import { statsCorrelationVariantTemplates } from "./templates/mathB/stats_correlation_variant_basic";
import { statsCorrelationVariant2Templates } from "./templates/mathB/stats_correlation_variant2_basic";
import { statsRegressionTemplates } from "./templates/mathB/stats_regression_basic";
import { statsRegressionVariantTemplates } from "./templates/mathB/stats_regression_variant_basic";
import { statsInferenceTemplates } from "./templates/mathB/stats_inference_basic";
import { vectorLengthTemplates } from "./templates/mathC/vector_length_basic";
import { vectorUnitTemplates } from "./templates/mathC/vector_unit_basic";
import { vectorParallelTemplates } from "./templates/mathC/vector_parallel_basic";
import { vectorComponentTemplates } from "./templates/mathC/vector_component_basic";
import { vectorLinePointTemplates } from "./templates/mathC/vector_line_point_basic";
import { vectorOrthogonalConditionTemplates } from "./templates/mathC/vector_orthogonal_condition_basic";
import { vectorDistancePlaneTemplates } from "./templates/mathC/vector_distance_plane_basic";
import { vectorPlaneNormalTemplates } from "./templates/mathC/vector_plane_normal_basic";
import { vectorMidpointTemplates } from "./templates/mathC/vector_midpoint_basic";
import { vectorInnerFromAngleTemplates } from "./templates/mathC/vector_inner_from_angle_basic";
import { sequenceGeometricLimitTemplates } from "./templates/mathB/sequence_geometric_limit_basic";
import { sequenceGeometricLimitVariantTemplates } from "./templates/mathB/sequence_geometric_limit_variant_basic";
import { sequenceGeometricLimitConditionTemplates } from "./templates/mathB/sequence_geometric_limit_condition_basic";
import { sequenceArithmeticSumFromTermsTemplates } from "./templates/mathB/sequence_arithmetic_sum_from_terms_basic";
import { sequenceArithmeticMeanTemplates } from "./templates/mathB/sequence_arithmetic_mean_basic";
import { sequenceArithmeticDiffFromTermsTemplates } from "./templates/mathB/sequence_arithmetic_diff_from_terms_basic";
import { sequenceGeneralTermVariantTemplates } from "./templates/mathB/sequence_general_term_variant_basic";
import { vectorProjectionTemplates } from "./templates/mathC/vector_projection_basic";
import { vectorLineTemplates } from "./templates/mathC/vector_line_basic";
import { vectorAreaTemplates } from "./templates/mathC/vector_area_basic";
import { vectorEquationTemplates } from "./templates/mathC/vector_equation_basic";
import { vectorEquationVariantTemplates } from "./templates/mathC/vector_equation_variant_basic";
import { vectorCtWordTemplates } from "./templates/mathC/vector_ct_word_basic";
import { vectorCtContextTemplates } from "./templates/mathC/vector_ct_context_basic";
import { complexBasicTemplates } from "./templates/mathC/complex_basic";
import { complexModulusTemplates } from "./templates/mathC/complex_modulus_basic";
import { conicCircleTemplates } from "./templates/mathC/conic_circle_basic";
import { conicParabolaTemplates } from "./templates/mathC/conic_parabola_basic";
import { conicParabolaDirectrixTemplates } from "./templates/mathC/conic_parabola_directrix_basic";
import { conicParabolaFocusTemplates } from "./templates/mathC/conic_parabola_focus_basic";
import { conicParabolaLatusRectumTemplates } from "./templates/mathC/conic_parabola_latus_rectum_basic";
import { conicParabolaVertexTemplates } from "./templates/mathC/conic_parabola_vertex_basic";
import { conicParabolaTangentSlopeTemplates } from "./templates/mathC/conic_parabola_tangent_slope_basic";
import { conicParabolaTangentSlopeExtraTemplates } from "./templates/mathC/conic_parabola_tangent_slope_basic2";
import { conicParabolaTangentSlopeExtraTemplates2 } from "./templates/mathC/conic_parabola_tangent_slope_basic3";
import { conicCircleRadiusTemplates } from "./templates/mathC/conic_circle_radius_basic";
import { conicCircleRadiusExtraTemplates } from "./templates/mathC/conic_circle_radius_basic2";
import { conicEllipseAxisTemplates } from "./templates/mathC/conic_ellipse_axis_basic";
import { conicEllipseMajorAxisTemplates } from "./templates/mathC/conic_ellipse_major_axis_basic";
import { conicEllipseMajorAxisExtraTemplates2 } from "./templates/mathC/conic_ellipse_major_axis_basic3";
import { conicEllipseMinorAxisTemplates } from "./templates/mathC/conic_ellipse_minor_axis_basic";
import { conicEllipseMinorAxisExtraTemplates } from "./templates/mathC/conic_ellipse_minor_axis_basic2";
import { conicEllipseMinorAxisExtraTemplates2 } from "./templates/mathC/conic_ellipse_minor_axis_basic3";
import { conicEllipseTangentTemplates } from "./templates/mathC/conic_ellipse_tangent_basic";
import { conicEllipseTangentExtraTemplates } from "./templates/mathC/conic_ellipse_tangent_basic2";
import { conicHyperbolaVertexTemplates } from "./templates/mathC/conic_hyperbola_vertex_basic";
import { conicHyperbolaVertexExtraTemplates } from "./templates/mathC/conic_hyperbola_vertex_basic2";
import { complexArgumentAxisTemplates } from "./templates/mathC/complex_argument_axis_basic";
import { complexArgumentAxisExtraTemplates } from "./templates/mathC/complex_argument_axis_basic2";
import { complexArgumentQuadrantTemplates } from "./templates/mathC/complex_argument_quadrant_basic";
import { complexArgumentQuadrantExtraTemplates } from "./templates/mathC/complex_argument_quadrant_basic2";
import { complexArgumentDegreeTemplates } from "./templates/mathC/complex_argument_degree_basic";
import { complexArgumentDegreeExtraTemplates } from "./templates/mathC/complex_argument_degree_basic2";
import { complexPolarValueTemplates } from "./templates/mathC/complex_polar_value_basic";
import { complexPolarValueExtraTemplates } from "./templates/mathC/complex_polar_value_basic2";
import { complexDeMoivreTemplates } from "./templates/mathC/complex_de_moivre_basic";
import { complexRootUnityTemplates } from "./templates/mathC/complex_root_unity_basic";
import { complexMultiplyRealTemplates } from "./templates/mathC/complex_multiply_real_basic";
import { complexMultiplyImagTemplates } from "./templates/mathC/complex_multiply_imag_basic";
import { complexModulusProductTemplates } from "./templates/mathC/complex_modulus_product_basic";
import { complexModulusProductExtraTemplates } from "./templates/mathC/complex_modulus_product_basic2";
import { complexModulusProductExtraTemplates2 } from "./templates/mathC/complex_modulus_product_basic3";
import { complexEquationAbsTemplates } from "./templates/mathC/complex_equation_abs_basic";
import { complexEquationAbsExtraTemplates } from "./templates/mathC/complex_equation_abs_basic2";
import { complexEquationRealImagTemplates } from "./templates/mathC/complex_equation_real_imag_basic";
import { complexEquationRealImagExtraTemplates } from "./templates/mathC/complex_equation_real_imag_basic2";
import { complexEquationConjugateTemplates } from "./templates/mathC/complex_equation_conjugate_basic";
import { complexEquationConjugateExtraTemplates } from "./templates/mathC/complex_equation_conjugate_basic2";
import { complexRotationRealTemplates } from "./templates/mathC/complex_rotation_real_basic";
import { complexRotationRealExtraTemplates } from "./templates/mathC/complex_rotation_real_basic2";
import { complexRotationImagTemplates } from "./templates/mathC/complex_rotation_imag_basic";
import { complexRotationImagExtraTemplates } from "./templates/mathC/complex_rotation_imag_basic2";
import { complexRotation180Templates } from "./templates/mathC/complex_rotation_180_basic";
import { complexRotation180ExtraTemplates } from "./templates/mathC/complex_rotation_180_basic2";
import { complexDivisionRealTemplates } from "./templates/mathC/complex_division_real_basic";
import { complexDivisionRealExtraTemplates } from "./templates/mathC/complex_division_real_basic2";
import { complexModulusSumTemplates } from "./templates/mathC/complex_modulus_sum_basic";
import { complexModulusSumExtraTemplates } from "./templates/mathC/complex_modulus_sum_basic2";
import { complexModulusSumExtraTemplates2 } from "./templates/mathC/complex_modulus_sum_basic3";
import { complexModulusSumExtraTemplates3 } from "./templates/mathC/complex_modulus_sum_basic4";
import { complexPolarImagTemplates } from "./templates/mathC/complex_polar_imag_basic";
import { complexPolarImagExtraTemplates } from "./templates/mathC/complex_polar_imag_basic2";
import { complexConjugateModulusTemplates } from "./templates/mathC/complex_conjugate_modulus_basic";
import { complexConjugateModulusExtraTemplates } from "./templates/mathC/complex_conjugate_modulus_basic2";
import { complexAddModulusSquareTemplates } from "./templates/mathC/complex_add_modulus_square_basic";
import { complexAddModulusSquareExtraTemplates } from "./templates/mathC/complex_add_modulus_square_basic2";
import { complexAddModulusSquareExtraTemplates2 } from "./templates/mathC/complex_add_modulus_square_basic3";
import { complexSubModulusSquareTemplates } from "./templates/mathC/complex_sub_modulus_square_basic";
import { complexSubModulusSquareExtraTemplates } from "./templates/mathC/complex_sub_modulus_square_basic2";
import { complexTriangleAreaTemplates } from "./templates/mathC/complex_triangle_area_basic";
import { complexTriangleAreaExtraTemplates } from "./templates/mathC/complex_triangle_area_basic2";
import { complexMidpointDistanceTemplates } from "./templates/mathC/complex_midpoint_distance_basic";
import { complexMidpointDistanceExtraTemplates } from "./templates/mathC/complex_midpoint_distance_basic2";
import { complexMidpointExtraTemplates2 } from "./templates/mathC/complex_midpoint_basic3";
import { complexDistanceExtraTemplates2 } from "./templates/mathC/complex_distance_basic3";
import { complexDistanceExtraTemplates3 } from "./templates/mathC/complex_distance_basic4";
import { complexMidpointExtraTemplates3 } from "./templates/mathC/complex_midpoint_basic4";
import { complexParallelConditionTemplates } from "./templates/mathC/complex_parallel_condition_basic";
import { complexParallelConditionExtraTemplates } from "./templates/mathC/complex_parallel_condition_basic2";
import { complexParallelConditionExtraTemplates2 } from "./templates/mathC/complex_parallel_condition_basic3";
import { complexParallelConditionExtraTemplates3 } from "./templates/mathC/complex_parallel_condition_basic4";
import { complexPerpendicularConditionTemplates } from "./templates/mathC/complex_perpendicular_condition_basic";
import { complexPerpendicularConditionExtraTemplates } from "./templates/mathC/complex_perpendicular_condition_basic2";
import { complexPerpendicularConditionExtraTemplates2 } from "./templates/mathC/complex_perpendicular_condition_basic3";
import { complexPerpendicularConditionExtraTemplates3 } from "./templates/mathC/complex_perpendicular_condition_basic4";
import { complexLocusCircleRadiusTemplates } from "./templates/mathC/complex_locus_circle_radius_basic";
import { complexLocusCircleRadiusExtraTemplates } from "./templates/mathC/complex_locus_circle_radius_basic2";
import { complexLocusCircleRadiusExtraTemplates2 } from "./templates/mathC/complex_locus_circle_radius_basic3";
import { complexLocusCircleCenterTemplates } from "./templates/mathC/complex_locus_circle_center_basic";
import { complexLocusCircleCenterExtraTemplates } from "./templates/mathC/complex_locus_circle_center_basic2";
import { complexLocusCircleCenterExtraTemplates2 } from "./templates/mathC/complex_locus_circle_center_basic3";
import { complexArgumentProductTemplates } from "./templates/mathC/complex_argument_product_basic";
import { complexArgumentProductExtraTemplates } from "./templates/mathC/complex_argument_product_basic2";
import { complexArgumentProductExtraTemplates2 } from "./templates/mathC/complex_argument_product_basic3";
import { complexArgumentQuotientTemplates } from "./templates/mathC/complex_argument_quotient_basic";
import { complexArgumentQuotientExtraTemplates } from "./templates/mathC/complex_argument_quotient_basic2";
import { complexArgumentQuotientExtraTemplates2 } from "./templates/mathC/complex_argument_quotient_basic3";
import { complexRotation90MatrixTemplates } from "./templates/mathC/complex_rotation_90_matrix_basic";
import { complexRotation90MatrixExtraTemplates } from "./templates/mathC/complex_rotation_90_matrix_basic2";
import { complexArgumentPowerTemplates } from "./templates/mathC/complex_argument_power_basic";
import { complexArgumentPowerExtraTemplates } from "./templates/mathC/complex_argument_power_basic2";
import { complexArgumentPowerExtraTemplates2 } from "./templates/mathC/complex_argument_power_basic3";
import { complexModulusPowerTemplates } from "./templates/mathC/complex_modulus_power_basic";
import { complexModulusPowerExtraTemplates } from "./templates/mathC/complex_modulus_power_basic2";
import { complexModulusPowerExtraTemplates2 } from "./templates/mathC/complex_modulus_power_basic3";
import { complexModulusPowerExtraTemplates3 } from "./templates/mathC/complex_modulus_power_basic4";
import { complexLocusBisectorTemplates } from "./templates/mathC/complex_locus_bisector_basic";
import { complexLocusBisectorExtraTemplates } from "./templates/mathC/complex_locus_bisector_basic2";
import { complexLocusVerticalLineTemplates } from "./templates/mathC/complex_locus_vertical_line_basic";
import { complexLocusVerticalLineExtraTemplates } from "./templates/mathC/complex_locus_vertical_line_basic2";
import { complexLocusHorizontalLineTemplates } from "./templates/mathC/complex_locus_horizontal_line_basic";
import { complexLocusHorizontalLineExtraTemplates } from "./templates/mathC/complex_locus_horizontal_line_basic2";
import { complexSectionInternalTemplates } from "./templates/mathC/complex_section_internal_basic";
import { complexSectionInternalExtraTemplates } from "./templates/mathC/complex_section_internal_basic2";
import { complexSectionExternalTemplates } from "./templates/mathC/complex_section_external_basic";
import { complexSectionExternalExtraTemplates } from "./templates/mathC/complex_section_external_basic2";
import { complexLinePointTemplates } from "./templates/mathC/complex_line_point_basic";
import { complexLinePointExtraTemplates } from "./templates/mathC/complex_line_point_basic2";
import { complexArgumentConjugateTemplates } from "./templates/mathC/complex_argument_conjugate_basic";
import { complexArgumentInverseTemplates } from "./templates/mathC/complex_argument_inverse_basic";
import { binomialExpectationTemplates } from "./templates/mathC/prob_binomial_expectation_basic";
import { complexPlaneTemplates } from "./templates/mathC/complex_plane_basic";
import { binomialVarianceTemplates } from "./templates/mathC/prob_binomial_variance_basic";
import { vectorSectionTemplates } from "./templates/mathC/vector_section_basic";
import { vectorSpaceTemplates } from "./templates/mathC/vector_space_basic";
import { vectorDistanceTemplates } from "./templates/mathC/vector_distance_basic";
import { vectorPlaneTemplates } from "./templates/mathC/vector_plane_basic";
import { complexConjugateTemplates } from "./templates/mathC/complex_conjugate_basic";
import { complexRotationTemplates } from "./templates/mathC/complex_rotation_basic";
import { complexArgumentTemplates } from "./templates/mathC/complex_argument_basic";
import { complexPolarTemplates } from "./templates/mathC/complex_polar_basic";
import { conicEllipseTemplates } from "./templates/mathC/conic_ellipse_basic";
import { conicEllipseFocusTemplates } from "./templates/mathC/conic_ellipse_focus_basic";
import { conicEllipseFocusExtraTemplates } from "./templates/mathC/conic_ellipse_focus_basic2";
import { conicHyperbolaTemplates } from "./templates/mathC/conic_hyperbola_basic";
import { conicHyperbolaAsymptoteTemplates } from "./templates/mathC/conic_hyperbola_asymptote_basic";
import { conicHyperbolaAsymptoteSlopeTemplates } from "./templates/mathC/conic_hyperbola_asymptote_slope_basic";
import { conicHyperbolaAsymptoteSlopeExtraTemplates } from "./templates/mathC/conic_hyperbola_asymptote_slope_basic2";
import { conicHyperbolaAsymptoteSlopeExtraTemplates2 } from "./templates/mathC/conic_hyperbola_asymptote_slope_basic3";
import { conicHyperbolaAsymptoteEquationTemplates } from "./templates/mathC/conic_hyperbola_asymptote_equation_basic";
import { conicHyperbolaAsymptoteEquationExtraTemplates } from "./templates/mathC/conic_hyperbola_asymptote_equation_basic2";
import { conicHyperbolaTransverseAxisTemplates } from "./templates/mathC/conic_hyperbola_transverse_axis_basic";
import { conicHyperbolaTransverseAxisExtraTemplates } from "./templates/mathC/conic_hyperbola_transverse_axis_basic2";
import { conicHyperbolaTransverseAxisExtraTemplates2 } from "./templates/mathC/conic_hyperbola_transverse_axis_basic3";
import { conicCircleTangentSlopeTemplates } from "./templates/mathC/conic_circle_tangent_slope_basic";
import { conicCircleTangentSlopeExtraTemplates } from "./templates/mathC/conic_circle_tangent_slope_basic2";
import { conicCircleTangentSlopeExtraTemplates2 } from "./templates/mathC/conic_circle_tangent_slope_basic3";
import { conicLineIntersectionCountTemplates } from "./templates/mathC/conic_line_intersection_count_basic";
import { conicLineIntersectionCountExtraTemplates } from "./templates/mathC/conic_line_intersection_count_basic2";
import { conicLineIntersectionCountExtraTemplates2 } from "./templates/mathC/conic_line_intersection_count_basic3";
import { conicLineIntersectionCountExtraTemplates3 } from "./templates/mathC/conic_line_intersection_count_basic4";
import { conicCircleGeneralRadiusTemplates } from "./templates/mathC/conic_circle_general_radius_basic";
import { conicCircleGeneralRadiusExtraTemplates } from "./templates/mathC/conic_circle_general_radius_basic2";
import { conicCircleGeneralRadiusExtraTemplates2 } from "./templates/mathC/conic_circle_general_radius_basic3";
import { conicCircleGeneralRadiusExtraTemplates3 } from "./templates/mathC/conic_circle_general_radius_basic4";
import { conicCircleGeneralCenterTemplates } from "./templates/mathC/conic_circle_general_center_basic";
import { conicCircleGeneralCenterExtraTemplates } from "./templates/mathC/conic_circle_general_center_basic2";
import { conicCircleGeneralCenterExtraTemplates2 } from "./templates/mathC/conic_circle_general_center_basic3";
import { conicHyperbolaFociDistanceTemplates } from "./templates/mathC/conic_hyperbola_foci_distance_basic";
import { conicHyperbolaFociDistanceExtraTemplates } from "./templates/mathC/conic_hyperbola_foci_distance_basic2";
import { conicHyperbolaFociDistanceExtraTemplates2 } from "./templates/mathC/conic_hyperbola_foci_distance_basic3";
import { conicEllipseCTemplates } from "./templates/mathC/conic_ellipse_c_basic";
import { conicEllipseCExtraTemplates } from "./templates/mathC/conic_ellipse_c_basic2";
import { conicHyperbolaCTemplates } from "./templates/mathC/conic_hyperbola_c_basic";
import { conicHyperbolaCExtraTemplates } from "./templates/mathC/conic_hyperbola_c_basic2";
import { conicParabolaLineIntersectionCountTemplates } from "./templates/mathC/conic_parabola_line_intersection_count_basic";
import { conicParabolaLineIntersectionCountExtraTemplates } from "./templates/mathC/conic_parabola_line_intersection_count_basic2";
import { conicParabolaLineIntersectionCountExtraTemplates2 } from "./templates/mathC/conic_parabola_line_intersection_count_basic3";
import { conicEllipseValueTemplates } from "./templates/mathC/conic_ellipse_value_basic";
import { conicEllipseValueExtraTemplates } from "./templates/mathC/conic_ellipse_value_basic2";
import { conicHyperbolaValueTemplates } from "./templates/mathC/conic_hyperbola_value_basic";
import { conicHyperbolaValueExtraTemplates } from "./templates/mathC/conic_hyperbola_value_basic2";
import { conicParabolaGeneralFocusTemplates } from "./templates/mathC/conic_parabola_general_focus_basic";
import { conicParabolaGeneralFocusExtraTemplates } from "./templates/mathC/conic_parabola_general_focus_basic2";
import { conicParabolaVertexShiftTemplates } from "./templates/mathC/conic_parabola_vertex_shift_basic";
import { conicParabolaVertexShiftExtraTemplates } from "./templates/mathC/conic_parabola_vertex_shift_basic2";
import { conicCircleTangentPointTemplates } from "./templates/mathC/conic_circle_tangent_point_basic";
import { conicCircleTangentPointExtraTemplates } from "./templates/mathC/conic_circle_tangent_point_basic2";
import { conicParabolaFocusVerticalTemplates } from "./templates/mathC/conic_parabola_focus_vertical_basic";
import { conicParabolaFocusVerticalExtraTemplates } from "./templates/mathC/conic_parabola_focus_vertical_basic2";
import { conicParabolaFocusVerticalExtraTemplates2 } from "./templates/mathC/conic_parabola_focus_vertical_basic3";
import { conicParabolaDirectrixVerticalTemplates } from "./templates/mathC/conic_parabola_directrix_vertical_basic";
import { conicParabolaDirectrixVerticalExtraTemplates } from "./templates/mathC/conic_parabola_directrix_vertical_basic2";
import { conicParabolaDirectrixVerticalExtraTemplates2 } from "./templates/mathC/conic_parabola_directrix_vertical_basic3";
import { conicEllipseFocusDistanceTemplates } from "./templates/mathC/conic_ellipse_focus_distance_basic";
import { conicEllipseFocusDistanceExtraTemplates } from "./templates/mathC/conic_ellipse_focus_distance_basic2";
import { conicEllipseFocusDistanceExtraTemplates2 } from "./templates/mathC/conic_ellipse_focus_distance_basic3";
import { conicCirclePointOnTemplates } from "./templates/mathC/conic_circle_point_on_basic";
import { conicCirclePointOnExtraTemplates } from "./templates/mathC/conic_circle_point_on_basic2";
import { conicCirclePointOnExtraTemplates2 } from "./templates/mathC/conic_circle_point_on_basic3";
import { conicCircleCenterExtraTemplates } from "./templates/mathC/conic_circle_center_basic2";
import { conicEllipseMajorAxisExtraTemplates } from "./templates/mathC/conic_ellipse_major_axis_basic2";
import { conicEllipseCenterTemplates } from "./templates/mathC/conic_ellipse_center_basic";
import { conicEllipseCenterExtraTemplates } from "./templates/mathC/conic_ellipse_center_basic2";
import { conicHyperbolaCenterTemplates } from "./templates/mathC/conic_hyperbola_center_basic";
import { conicHyperbolaCenterExtraTemplates } from "./templates/mathC/conic_hyperbola_center_basic2";
import { conicParabolaTangentInterceptTemplates } from "./templates/mathC/conic_parabola_tangent_intercept_basic";
import { conicParabolaTangentInterceptExtraTemplates } from "./templates/mathC/conic_parabola_tangent_intercept_basic2";
import { normalDistributionTemplates } from "./templates/mathC/normal_distribution_basic";
import { normalDistributionExtraTemplates } from "./templates/mathC/normal_distribution_basic2";
import { normalBacksolveTemplates } from "./templates/mathC/normal_backsolve_basic";
import { normalBacksolveExtraTemplates } from "./templates/mathC/normal_backsolve_basic2";
import { normalBacksolveExtraTemplates2 } from "./templates/mathC/normal_backsolve_basic3";
import { complexDistanceTemplates } from "./templates/mathC/complex_distance_basic";
import { complexDistanceExtraTemplates } from "./templates/mathC/complex_distance_basic2";
import { complexMidpointTemplates } from "./templates/mathC/complex_midpoint_basic";
import { complexMidpointExtraTemplates } from "./templates/mathC/complex_midpoint_basic2";
import { complexSquareRealTemplates } from "./templates/mathC/complex_square_real_basic";
import { complexSquareRealExtraTemplates } from "./templates/mathC/complex_square_real_basic2";
import { complexPowerITemplates } from "./templates/mathC/complex_power_i_basic";
import { complexPowerIExtraTemplates } from "./templates/mathC/complex_power_i_basic2";
import { complexConjugateProductTemplates } from "./templates/mathC/complex_conjugate_product_basic";
import { complexConjugateProductExtraTemplates } from "./templates/mathC/complex_conjugate_product_basic2";
import { complexConjugateProductExtraTemplates2 } from "./templates/mathC/complex_conjugate_product_basic3";
import { complexModulusSquareTemplates } from "./templates/mathC/complex_modulus_square_basic";
import { complexModulusSquareExtraTemplates } from "./templates/mathC/complex_modulus_square_basic2";
import { complexModulusSquareExtraTemplates2 } from "./templates/mathC/complex_modulus_square_basic3";
import { complexModulusExtraTemplates } from "./templates/mathC/complex_modulus_basic2";
import { vectorOrthogonalityTemplates } from "./templates/mathC/vector_orthogonality_basic";
import { vectorAngleTemplates } from "./templates/mathC/vector_angle_basic";
import { tangentSlopeTemplates } from "./templates/math2/calculus_tangent_slope_basic";
import { tangentSlopeVariantTemplates } from "./templates/math2/calculus_tangent_slope_variant_basic";
import { tangentLineTemplates } from "./templates/math2/calculus_tangent_line_basic";
import { tangentLineVariantTemplates } from "./templates/math2/calculus_tangent_line_variant_basic";
import { calcIncreasingTemplates } from "./templates/math2/calculus_increasing_basic";
import { calcIncreasingVariantTemplates } from "./templates/math2/calculus_increasing_variant_basic";
import { calcAverageValueTemplates } from "./templates/math2/calculus_average_value_basic";
import { calcAverageValueBacksolveTemplates } from "./templates/math2/calculus_average_value_backsolve_basic";
import { calcAreaBetweenLinesTemplates } from "./templates/math2/calculus_area_between_lines_basic";
import { calcAreaBetweenLinesBacksolveTemplates } from "./templates/math2/calculus_area_between_lines_backsolve_basic";
import { calcAreaBetweenLinesVariantTemplates } from "./templates/math2/calculus_area_between_lines_variant_basic";
import { integralLinear2Templates } from "./templates/math2/calculus_integral_linear_basic2";
import { calcIntegralLinearBacksolveTemplates } from "./templates/math2/calculus_integral_linear_backsolve_basic";
import { calcAreaBetweenParabolaTemplates } from "./templates/math2/calculus_area_between_parabola_basic";
import { calcAreaBetweenParabolaVariantTemplates } from "./templates/math2/calculus_area_between_parabola_variant_basic";
import { calcAreaUnderLineTemplates } from "./templates/math2/calculus_area_under_line_basic";
import { calcAreaUnderLineBacksolveTemplates } from "./templates/math2/calculus_area_under_line_backsolve_basic";
import { calcAreaUnderLineVariantTemplates } from "./templates/math2/calculus_area_under_line_variant_basic";
import { tangentValueTemplates } from "./templates/math2/calculus_tangent_value_basic";
import { tangentValueVariantTemplates } from "./templates/math2/calculus_tangent_value_variant_basic";
import { calcIntegralSumTemplates } from "./templates/math2/calculus_integral_sum_basic";
import { calcIntegralSumVariantTemplates } from "./templates/math2/calc_integral_sum_variant_basic";
import { calcIntegralSumBacksolveTemplates } from "./templates/math2/calculus_integral_sum_backsolve_basic";
import { calcIntegralConstantTemplates } from "./templates/math2/calculus_integral_constant_basic";
import { calcIntegralConstantVariantTemplates } from "./templates/math2/calculus_integral_constant_variant_basic";
import { integralQuadraticTemplates } from "./templates/math2/calculus_integral_quadratic_basic";
import { integralQuadraticVariantTemplates } from "./templates/math2/calculus_integral_quadratic_variant_basic";
import { sequenceCommonDifferenceTemplates } from "./templates/mathB/sequence_common_difference_basic";
import { sequenceCommonDifferenceVariantTemplates } from "./templates/mathB/sequence_common_difference_variant_basic";
import { conicCircleCenterTemplates } from "./templates/mathC/conic_circle_center_basic";
import { normalStandardizationTemplates } from "./templates/mathC/normal_standardization_basic";
import { normalStandardizationExtraTemplates } from "./templates/mathC/normal_standardization_basic2";
import { normalStandardizationExtraTemplates2 } from "./templates/mathC/normal_standardization_basic3";
import { normalStandardizationExtraTemplates3 } from "./templates/mathC/normal_standardization_basic4";
import { extremaTemplates } from "./templates/math2/calculus_extrema_basic";
import { extremaVariantTemplates } from "./templates/math2/calculus_extrema_variant_basic";
import { sequenceGeometricSumTemplates } from "./templates/mathB/sequence_geometric_sum_basic";
import { sequenceGeometricSumConditionTemplates } from "./templates/mathB/sequence_geometric_sum_condition_basic";
import { conicIntersectionTemplates } from "./templates/mathC/conic_intersection_basic";
import { conicTangentTemplates } from "./templates/mathC/conic_tangent_basic";
import { areaBasicTemplates } from "./templates/math2/calculus_area_basic";
import { areaBacksolveTemplates } from "./templates/math2/calculus_area_backsolve_basic";
import { sequenceArithmeticSumTemplates } from "./templates/mathB/sequence_arithmetic_sum_basic";
import { sequenceArithmeticSumVariantTemplates } from "./templates/mathB/sequence_arithmetic_sum_variant_basic";
import { sequenceArithmeticSumConditionTemplates } from "./templates/mathB/sequence_arithmetic_sum_condition_basic";
import { binomialProbabilityTemplates } from "./templates/mathC/prob_binomial_probability_basic";
import { highDifficultyTemplates } from "./templates/high_difficulty_pack";

const RAW_TEMPLATES: QuestionTemplate[] = [
  ...quadSolveTemplates,
  ...quadDiscriminantTemplates,
  ...quadDiscriminantVariantTemplates,
  ...quadRootsRelationsTemplates,
  ...quadRootsRelationsVariantTemplates,
  ...quadInequalityTemplates,
  ...quadInequalityVariantTemplates,
  ...trigRatioTemplates,
  ...trigRatioVariantTemplates,
  ...trigRatioWordVariantTemplates,
  ...trigSpecialAnglesTemplates,
  ...trigSpecialAnglesVariantTemplates,
  ...trigCtPassageTriangleTemplates,
  ...geoMeasureRightTriangleTemplates,
  ...geoMeasureRightTriangleVariantTemplates,
  ...geoCtPassageAngleTemplates,
  ...geoCtPassageSimilarityTemplates,
  ...geoSineCosineLawTemplates,
  ...geoSineCosineLawVariantTemplates,
  ...setOperationsTemplates,
  ...setOperationsVariantTemplates,
  ...setCtPassageTemplates,
  ...propPropositionTemplates,
  ...propPropositionVariantTemplates,
  ...dataSummaryTemplates,
  ...dataSummaryFrequencyVariantTemplates,
  ...dataVarianceSdTemplates,
  ...dataVarianceSdVariantTemplates,
  ...statsVarianceVariantTemplates,
  ...dataScatterTemplates,
  ...dataScatterVariantTemplates,
  ...dataCovarianceTemplates,
  ...dataCovarianceVariantTemplates,
  ...dataCovarianceVariant2Templates,
  ...dataCorrelationTemplates,
  ...dataCorrelationVariantTemplates,
  ...dataRegressionTemplates,
  ...dataRegressionVariantTemplates,
  ...quadGraphTemplates,
  ...quadGraphVariantTemplates,
  ...quadGraphCoefficientVariantTemplates,
  ...quadGraphThroughPointsVariantTemplates,
  ...quadMaxMinTemplates,
  ...quadMaxMinVariantTemplates,
  ...probBasicTemplates,
  ...probBasicVariantTemplates,
  ...probBasicConditionVariantTemplates,
  ...probComplementTemplates,
  ...probComplementVariantTemplates,
  ...combiConditionsTemplates,
  ...combiConditionsVariantTemplates,
  ...probCombiTemplates,
  ...probCombiVariantTemplates,
  ...probCombiConditionVariantTemplates,
  ...intDivisorMultipleTemplates,
  ...intDivisorMultipleVariantTemplates,
  ...intRemainderTemplates,
  ...intRemainderVariantTemplates,
  ...intRemainderAppliedVariantTemplates,
  ...intPrimeFactorTemplates,
  ...intGcdLcmApplicationsTemplates,
  ...intGcdLcmVariantTemplates,
  ...intDiophantineTemplates,
  ...intDiophantineVariantTemplates,
  ...intModArithmeticIntroTemplates,
  ...geoRatioTheoremTemplates,
  ...geoCircleGeometryTemplates,
  ...geoTriangleCentersTemplates,
  ...geoCircleRelationsTemplates,
  ...geoCtPassageCircleTemplates,
  ...inductionTemplates,
  ...combiTemplates,
  ...combiPermutationTemplates,
  ...combiPermutationVariantTemplates,
  ...algebraTemplates,
  ...algCtPassageQuadraticTemplates,
  ...algCtPassageQuadraticGraphTemplates,
  ...algebraCtPassageSystemTemplates,
  ...algebraCtPassageFactorTemplates,
  ...algebraCtPassageRatioTemplates,
  ...algebraCtPassageInequalityTemplates,
  ...coordCtPassageLinearTemplates,
  ...propCtPassageTemplates,
  ...inequalityCtPassageAmgmTemplates,
  ...ratioCtPassageTemplates,
  ...expLogBasicTemplates,
  ...expLogBasicVariantTemplates,
  ...expLogUnknownBaseTemplates,
  ...expLogUnknownExponentTemplates,
  ...expLogEquationTemplates,
  ...expLogEquationVariantTemplates,
  ...expLogMixedEquationTemplates,
  ...expLogChangeBaseTemplates,
  ...expLogChangeBaseVariantTemplates,
  ...expLogChangeBaseVariant2Templates,
  ...expLogGrowthTemplates,
  ...expLogGrowthVariantTemplates,
  ...expLogDomainTemplates,
  ...expLogDomainVariantTemplates,
  ...expLogSimpleEquationTemplates,
  ...expLogSimpleEquationVariantTemplates,
  ...expLogPowerEquationTemplates,
  ...expLogPowerEquationVariantTemplates,
  ...expLogLogEquationTemplates,
  ...expLogLogEquationVariantTemplates,
  ...expLogLogSumTemplates,
  ...expLogLogSumVariantTemplates,
  ...expLogLogDiffTemplates,
  ...expLogLogDiffVariantTemplates,
  ...expLogLogProductTemplates,
  ...expLogLogProductVariantTemplates,
  ...expLogCtPassageTemplates,
  ...polyRemainderTemplates,
  ...polyRemainderVariantTemplates,
  ...polyFactorKTemplates,
  ...polyFactorKVariantTemplates,
  ...polyValueSumTemplates,
  ...polyValueSumVariantTemplates,
  ...polyCoeffFromRootsTemplates,
  ...polyCoeffFromRootsVariantTemplates,
  ...binomialCoeffTemplates,
  ...binomialCoeffVariantTemplates,
  ...binomialXyCoeffTemplates,
  ...binomialXyCoeffVariantTemplates,
  ...binomialValueTemplates,
  ...binomialValueVariantTemplates,
  ...binomialMiddleCoeffTemplates,
  ...binomialMiddleCoeffVariantTemplates,
  ...identityEvalTemplates,
  ...identityEvalVariantTemplates,
  ...identityCoefficientTemplates,
  ...identityCoefficientVariantTemplates,
  ...identityCoeffQuadraticTemplates,
  ...identityCoeffQuadraticVariantTemplates,
  ...inequalityMeanTemplates,
  ...inequalityMeanVariantTemplates,
  ...inequalitySumProductTemplates,
  ...inequalitySumProductVariantTemplates,
  ...inequalityAmgmTemplates,
  ...inequalityAmgmVariantTemplates,
  ...inequalityAmgmVariant2Templates,
  ...coordLineSlopeTemplates,
  ...coordLineSlopeVariantTemplates,
  ...coordLineInterceptTemplates,
  ...coordLineInterceptVariantTemplates,
  ...coordLineGeneralInterceptVariantTemplates,
  ...coordLineParallelPerpTemplates,
  ...coordLineParallelPerpVariantTemplates,
  ...coordDistancePointLineTemplates,
  ...coordDistancePointLineVariantTemplates,
  ...coordCircleRadiusTemplates,
  ...coordCircleRadiusVariantTemplates,
  ...coordCircleRadiusFromGeneralVariantTemplates,
  ...coordCircleCenterTemplates,
  ...coordCircleCenterVariantTemplates,
  ...coordCircleGeneralCenterVariantTemplates,
  ...coordCtPassageCircleTemplates,
  ...coordCtPassageLineTemplates,
  ...coordRegionTemplates,
  ...coordRegionVariantTemplates,
  ...expLogPropertyTemplates,
  ...expLogPropertyVariantTemplates,
  ...expLogPropertyBacksolveTemplates,
  ...trigIdentityTemplates,
  ...trigAmplitudeTemplates,
  ...trigAmplitudeVariantTemplates,
  ...trigAmplitudeFromMaxMinVariantTemplates,
  ...trigPhaseShiftTemplates,
  ...trigPhaseShiftVariantTemplates,
  ...trigVerticalShiftTemplates,
  ...trigGraphVerticalShiftVariantTemplates,
  ...trigGraphRangeTemplates,
  ...trigGraphRangeVariantTemplates,
  ...trigCtPassageTemplates,
  ...trigCtPassageGraphTemplates,
  ...trigGraphPeriodTemplates,
  ...trigGraphPeriodVariantTemplates,
  ...trigPhasePeriodVariantTemplates,
  ...trigGraphMidlineTemplates,
  ...trigGraphMidlineVariantTemplates,
  ...trigMidlineFromMaxMinVariantTemplates,
  ...trigGraphMaxTemplates,
  ...trigGraphMaxMinVariantTemplates,
  ...trigGraphMinTemplates,
  ...trigGraphMinMaxFromMidlineVariantTemplates,
  ...trigGraphInterceptTemplates,
  ...trigGraphInterceptVariantTemplates,
  ...trigGraphInterceptVariant2Templates,
  ...trigEquationRadianTemplates,
  ...trigEquationRadianVariantTemplates,
  ...trigIdentityTanTemplates,
  ...trigIdentityTanVariantTemplates,
  ...trigIdentityTanRelationTemplates,
  ...trigIdentityTanRelationVariantTemplates,
  ...trigIdentityPythagTemplates,
  ...trigIdentityPythagVariantTemplates,
  ...trigBasicVariantTemplates,
  ...trigAdditionTemplates,
  ...trigAdditionVariantTemplates,
  ...trigDoubleAngleTemplates,
  ...trigDoubleAngleVariantTemplates,
  ...trigPeriodTemplates,
  ...trigRadianTemplates,
  ...derivativeBasicTemplates,
  ...derivativeVariantTemplates,
  ...derivativeLinearTemplates,
  ...derivativeLinearVariantTemplates,
  ...integralBasicTemplates,
  ...integralVariantTemplates,
  ...trigEquationTemplates,
  ...trigEquationsVariantTemplates,
  ...calcLimitBasicTemplates,
  ...calcLimitInftyBasicTemplates,
  ...calcContinuityBasicTemplates,
  ...calcDerivativeAdvancedBasicTemplates,
  ...calcDerivativeChainBasicTemplates,
  ...calcIntegralAdvancedBasicTemplates,
  ...calcCurveAreaBasicTemplates,
  ...calcParametricBasicTemplates,
  ...tangentSlopeTemplates,
  ...tangentSlopeVariantTemplates,
  ...tangentLineTemplates,
  ...tangentLineVariantTemplates,
  ...calcIncreasingTemplates,
  ...calcIncreasingVariantTemplates,
  ...calcAverageValueTemplates,
  ...calcAverageValueBacksolveTemplates,
  ...calcAreaBetweenLinesTemplates,
  ...calcAreaBetweenLinesBacksolveTemplates,
  ...calcAreaBetweenLinesVariantTemplates,
  ...integralLinear2Templates,
  ...calcIntegralLinearBacksolveTemplates,
  ...calcAreaBetweenParabolaTemplates,
  ...calcAreaBetweenParabolaVariantTemplates,
  ...calcAreaUnderLineTemplates,
  ...calcAreaUnderLineBacksolveTemplates,
  ...calcAreaUnderLineVariantTemplates,
  ...tangentValueTemplates,
  ...tangentValueVariantTemplates,
  ...calcIntegralSumTemplates,
  ...calcIntegralSumVariantTemplates,
  ...calcIntegralSumBacksolveTemplates,
  ...calcIntegralConstantTemplates,
  ...calcIntegralConstantVariantTemplates,
  ...integralQuadraticTemplates,
  ...integralQuadraticVariantTemplates,
  ...calcCtPassageTemplates,
  ...calcCtPassageIntegralTemplates,
  ...calcCtPassageExtremaTemplates,
  ...extremaTemplates,
  ...extremaVariantTemplates,
  ...areaBasicTemplates,
  ...areaBacksolveTemplates,
  ...sequenceArithmeticTemplates,
  ...sequenceArithmeticBacksolveTemplates,
  ...sequenceArithmeticTermBacksolveTemplates,
  ...sequenceGeometricTemplates,
  ...sequenceGeometricBacksolveTemplates,
  ...sequenceGeometricTermBacksolveTemplates,
  ...sequenceSumTemplates,
  ...sequenceSumVariantTemplates2,
  ...sequenceGeometricSumTemplates,
  ...sequenceGeometricSumConditionTemplates,
  ...sequenceGeometricLimitTemplates,
  ...sequenceGeometricLimitVariantTemplates,
  ...sequenceGeometricLimitConditionTemplates,
  ...sequenceArithmeticSumTemplates,
  ...sequenceArithmeticSumVariantTemplates,
  ...sequenceArithmeticSumConditionTemplates,
  ...sequenceArithmeticSumFromTermsTemplates,
  ...sequenceArithmeticMeanTemplates,
  ...sequenceArithmeticDiffFromTermsTemplates,
  ...sequenceGeneralTermVariantTemplates,
  ...sequenceCommonDifferenceTemplates,
  ...sequenceCommonDifferenceVariantTemplates,
  ...vectorOperationsTemplates,
  ...vectorInnerTemplates,
  ...sequenceRecurrenceTemplates,
  ...sequenceRecurrenceVariantTemplates,
  ...sequenceRecurrenceTermTemplates,
  ...sequenceRecurrenceTermVariantTemplates,
  ...sequenceCommonRatioFromTermsTemplates,
  ...sequenceCommonRatioFromTermsVariantTemplates,
  ...sequenceGeometricMeanTemplates,
  ...sequenceGeometricMeanVariantTemplates,
  ...sequenceGeometricSumNTemplates,
  ...sequenceGeometricSumNBacksolveTemplates,
  ...sequenceTermFromSumTemplates,
  ...sequenceTermFromSumConditionTemplates,
  ...sequenceCtWordTemplates,
  ...sequenceCtGeometricWordTemplates,
  ...sequenceCtGeometricLimitWordTemplates,
  ...sequenceCtRecurrenceWordTemplates,
  ...sequenceCtWordChangeTemplates,
  ...sequenceCtGeometricChangeTemplates,
  ...sequenceCtPassageArithmeticTemplates,
  ...sequenceCtPassageArithmeticBacksolveTemplates,
  ...sequenceCtPassageGeometricTemplates,
  ...sequenceCtPassageGeometricBacksolveTemplates,
  ...sequenceCtPassageLimitTemplates,
  ...sequenceCtPassageRecurrenceTemplates,
  ...sequenceCtPassageCompareTemplates,
  ...sequenceCtPassageBacksolveTemplates,
  ...statsCtPassageTemplates,
  ...statsCtPassageRegressionTemplates,
  ...statsCtPassageInferenceTemplates,
  ...statsCtPassageResidualTemplates,
  ...statsCtPassageCorrelationTemplates,
  ...statsCtPassageOutlierTemplates,
  ...statsCtPassageShapeTemplates,
  ...statsCtPassageTableTemplates,
  ...statsCtPassageMixedTemplates,
  ...vectorCtPassageTemplates,
  ...vectorCtPassageBasicTemplates,
  ...probCtPassageTemplates,
  ...probCtPassageComplementTemplates,
  ...probCtPassageConditionalTemplates,
  ...probCtPassageMixedTemplates,
  ...probCtPassageConditionalAdvancedTemplates,
  ...probCtPassageTrialsTemplates,
  ...probCtPassageBayesTemplates,
  ...dataCtPassageTemplates,
  ...dataCtPassageScatterTemplates,
  ...dataCtPassageSummaryTemplates,
  ...dataCtPassageRegressionTemplates,
  ...statsSampleMeanTemplates,
  ...statsSamplingMeanTemplates,
  ...statsStandardErrorTemplates,
  ...statsCtStandardErrorBacksolveTemplates,
  ...statsConfidenceIntervalTemplates,
  ...statsCtInferenceWordTemplates,
  ...statsCtRegressionTemplates,
  ...statsCtScatterContextTemplates,
  ...statsCtResidualContextTemplates,
  ...statsCtFitCompareTemplates,
  ...statsCtConfidenceBoundsTemplates,
  ...statsScatterTemplates,
  ...statsScatterVariantTemplates,
  ...statsCovarianceTemplates,
  ...statsCovarianceVariantTemplates,
  ...statsCorrelationTemplates,
  ...statsCorrelationVariantTemplates,
  ...statsCorrelationVariant2Templates,
  ...statsRegressionTemplates,
  ...statsRegressionVariantTemplates,
  ...statsInferenceTemplates,
  ...vectorLengthTemplates,
  ...vectorUnitTemplates,
  ...vectorParallelTemplates,
  ...vectorComponentTemplates,
  ...vectorLinePointTemplates,
  ...vectorOrthogonalConditionTemplates,
  ...vectorDistancePlaneTemplates,
  ...vectorPlaneNormalTemplates,
  ...vectorMidpointTemplates,
  ...vectorInnerFromAngleTemplates,
  ...vectorCtWordTemplates,
  ...vectorCtContextTemplates,
  ...complexBasicTemplates,
  ...complexModulusTemplates,
  ...complexModulusExtraTemplates,
  ...conicCircleTemplates,
  ...conicCircleCenterTemplates,
  ...conicIntersectionTemplates,
  ...conicTangentTemplates,
  ...conicParabolaTemplates,
  ...conicParabolaDirectrixTemplates,
  ...conicParabolaLatusRectumTemplates,
  ...conicParabolaFocusTemplates,
  ...conicParabolaVertexTemplates,
  ...conicParabolaTangentSlopeTemplates,
  ...conicParabolaTangentSlopeExtraTemplates,
  ...conicParabolaTangentSlopeExtraTemplates2,
  ...conicCircleRadiusTemplates,
  ...conicCircleRadiusExtraTemplates,
  ...conicEllipseAxisTemplates,
  ...conicEllipseMajorAxisTemplates,
  ...conicEllipseMajorAxisExtraTemplates,
  ...conicEllipseMajorAxisExtraTemplates2,
  ...conicEllipseMinorAxisTemplates,
  ...conicEllipseMinorAxisExtraTemplates,
  ...conicEllipseMinorAxisExtraTemplates2,
  ...conicEllipseTangentTemplates,
  ...conicEllipseTangentExtraTemplates,
  ...conicHyperbolaVertexTemplates,
  ...conicHyperbolaVertexExtraTemplates,
  ...complexArgumentAxisTemplates,
  ...complexArgumentAxisExtraTemplates,
  ...complexArgumentQuadrantTemplates,
  ...complexArgumentQuadrantExtraTemplates,
  ...complexArgumentDegreeTemplates,
  ...complexArgumentDegreeExtraTemplates,
  ...complexPolarValueTemplates,
  ...complexPolarValueExtraTemplates,
  ...complexDeMoivreTemplates,
  ...complexRootUnityTemplates,
  ...complexMultiplyRealTemplates,
  ...complexMultiplyImagTemplates,
  ...complexModulusProductTemplates,
  ...complexModulusProductExtraTemplates,
  ...complexModulusProductExtraTemplates2,
  ...complexEquationAbsTemplates,
  ...complexEquationAbsExtraTemplates,
  ...complexEquationRealImagTemplates,
  ...complexEquationRealImagExtraTemplates,
  ...complexEquationConjugateTemplates,
  ...complexEquationConjugateExtraTemplates,
  ...complexRotationRealTemplates,
  ...complexRotationRealExtraTemplates,
  ...complexRotationImagTemplates,
  ...complexRotationImagExtraTemplates,
  ...complexRotation180Templates,
  ...complexRotation180ExtraTemplates,
  ...complexDivisionRealTemplates,
  ...complexDivisionRealExtraTemplates,
  ...complexModulusSumTemplates,
  ...complexModulusSumExtraTemplates,
  ...complexModulusSumExtraTemplates2,
  ...complexModulusSumExtraTemplates3,
  ...complexPolarImagTemplates,
  ...complexPolarImagExtraTemplates,
  ...complexConjugateModulusTemplates,
  ...complexConjugateModulusExtraTemplates,
  ...complexAddModulusSquareTemplates,
  ...complexAddModulusSquareExtraTemplates,
  ...complexAddModulusSquareExtraTemplates2,
  ...complexSubModulusSquareTemplates,
  ...complexSubModulusSquareExtraTemplates,
  ...complexTriangleAreaTemplates,
  ...complexTriangleAreaExtraTemplates,
  ...complexMidpointDistanceTemplates,
  ...complexMidpointDistanceExtraTemplates,
  ...complexParallelConditionTemplates,
  ...complexParallelConditionExtraTemplates,
  ...complexParallelConditionExtraTemplates2,
  ...complexParallelConditionExtraTemplates3,
  ...complexPerpendicularConditionTemplates,
  ...complexPerpendicularConditionExtraTemplates,
  ...complexPerpendicularConditionExtraTemplates2,
  ...complexPerpendicularConditionExtraTemplates3,
  ...complexLocusCircleRadiusTemplates,
  ...complexLocusCircleRadiusExtraTemplates,
  ...complexLocusCircleRadiusExtraTemplates2,
  ...complexLocusCircleCenterTemplates,
  ...complexLocusCircleCenterExtraTemplates,
  ...complexLocusCircleCenterExtraTemplates2,
  ...complexArgumentProductTemplates,
  ...complexArgumentProductExtraTemplates,
  ...complexArgumentProductExtraTemplates2,
  ...complexArgumentQuotientTemplates,
  ...complexArgumentQuotientExtraTemplates,
  ...complexArgumentQuotientExtraTemplates2,
  ...complexRotation90MatrixTemplates,
  ...complexRotation90MatrixExtraTemplates,
  ...complexArgumentPowerTemplates,
  ...complexArgumentPowerExtraTemplates,
  ...complexArgumentPowerExtraTemplates2,
  ...complexModulusPowerTemplates,
  ...complexModulusPowerExtraTemplates,
  ...complexModulusPowerExtraTemplates2,
  ...complexModulusPowerExtraTemplates3,
  ...complexLocusBisectorTemplates,
  ...complexLocusBisectorExtraTemplates,
  ...complexLocusVerticalLineTemplates,
  ...complexLocusVerticalLineExtraTemplates,
  ...complexLocusHorizontalLineTemplates,
  ...complexLocusHorizontalLineExtraTemplates,
  ...complexSectionInternalTemplates,
  ...complexSectionInternalExtraTemplates,
  ...complexSectionExternalTemplates,
  ...complexSectionExternalExtraTemplates,
  ...complexLinePointTemplates,
  ...complexLinePointExtraTemplates,
  ...complexArgumentConjugateTemplates,
  ...complexArgumentInverseTemplates,
  ...binomialExpectationTemplates,
  ...binomialProbabilityTemplates,
  ...complexPlaneTemplates,
  ...complexDistanceTemplates,
  ...complexDistanceExtraTemplates,
  ...complexDistanceExtraTemplates2,
  ...complexDistanceExtraTemplates3,
  ...complexMidpointTemplates,
  ...complexMidpointExtraTemplates,
  ...complexMidpointExtraTemplates2,
  ...complexMidpointExtraTemplates3,
  ...complexSquareRealTemplates,
  ...complexSquareRealExtraTemplates,
  ...complexPowerITemplates,
  ...complexPowerIExtraTemplates,
  ...complexConjugateProductTemplates,
  ...complexConjugateProductExtraTemplates,
  ...complexConjugateProductExtraTemplates2,
  ...complexModulusSquareTemplates,
  ...complexModulusSquareExtraTemplates,
  ...complexModulusSquareExtraTemplates2,
  ...complexConjugateTemplates,
  ...complexRotationTemplates,
  ...complexPolarTemplates,
  ...complexArgumentTemplates,
  ...conicEllipseTemplates,
  ...conicEllipseFocusTemplates,
  ...conicEllipseFocusExtraTemplates,
  ...conicHyperbolaTemplates,
  ...conicHyperbolaAsymptoteTemplates,
  ...conicHyperbolaAsymptoteSlopeTemplates,
  ...conicHyperbolaAsymptoteSlopeExtraTemplates,
  ...conicHyperbolaAsymptoteSlopeExtraTemplates2,
  ...conicHyperbolaAsymptoteEquationTemplates,
  ...conicHyperbolaAsymptoteEquationExtraTemplates,
  ...conicHyperbolaTransverseAxisTemplates,
  ...conicHyperbolaTransverseAxisExtraTemplates,
  ...conicHyperbolaTransverseAxisExtraTemplates2,
  ...conicCircleTangentSlopeTemplates,
  ...conicCircleTangentSlopeExtraTemplates,
  ...conicCircleTangentSlopeExtraTemplates2,
  ...conicLineIntersectionCountTemplates,
  ...conicLineIntersectionCountExtraTemplates,
  ...conicLineIntersectionCountExtraTemplates2,
  ...conicLineIntersectionCountExtraTemplates3,
  ...conicCircleGeneralRadiusTemplates,
  ...conicCircleGeneralRadiusExtraTemplates,
  ...conicCircleGeneralRadiusExtraTemplates2,
  ...conicCircleGeneralRadiusExtraTemplates3,
  ...conicCircleGeneralCenterTemplates,
  ...conicCircleGeneralCenterExtraTemplates,
  ...conicCircleGeneralCenterExtraTemplates2,
  ...conicHyperbolaFociDistanceTemplates,
  ...conicHyperbolaFociDistanceExtraTemplates,
  ...conicHyperbolaFociDistanceExtraTemplates2,
  ...conicEllipseCTemplates,
  ...conicEllipseCExtraTemplates,
  ...conicHyperbolaCTemplates,
  ...conicHyperbolaCExtraTemplates,
  ...conicParabolaLineIntersectionCountTemplates,
  ...conicParabolaLineIntersectionCountExtraTemplates,
  ...conicParabolaLineIntersectionCountExtraTemplates2,
  ...conicEllipseValueTemplates,
  ...conicEllipseValueExtraTemplates,
  ...conicHyperbolaValueTemplates,
  ...conicHyperbolaValueExtraTemplates,
  ...conicParabolaGeneralFocusTemplates,
  ...conicParabolaGeneralFocusExtraTemplates,
  ...conicParabolaVertexShiftTemplates,
  ...conicParabolaVertexShiftExtraTemplates,
  ...conicCircleTangentPointTemplates,
  ...conicCircleTangentPointExtraTemplates,
  ...conicParabolaFocusVerticalTemplates,
  ...conicParabolaFocusVerticalExtraTemplates,
  ...conicParabolaFocusVerticalExtraTemplates2,
  ...conicParabolaDirectrixVerticalTemplates,
  ...conicParabolaDirectrixVerticalExtraTemplates,
  ...conicParabolaDirectrixVerticalExtraTemplates2,
  ...conicEllipseFocusDistanceTemplates,
  ...conicEllipseFocusDistanceExtraTemplates,
  ...conicEllipseFocusDistanceExtraTemplates2,
  ...conicCirclePointOnTemplates,
  ...conicCirclePointOnExtraTemplates,
  ...conicCirclePointOnExtraTemplates2,
  ...conicCircleCenterExtraTemplates,
  ...conicParabolaTangentInterceptTemplates,
  ...conicParabolaTangentInterceptExtraTemplates,
  ...conicEllipseCenterTemplates,
  ...conicEllipseCenterExtraTemplates,
  ...conicHyperbolaCenterTemplates,
  ...conicHyperbolaCenterExtraTemplates,
  ...binomialVarianceTemplates,
  ...normalDistributionTemplates,
  ...normalDistributionExtraTemplates,
  ...normalStandardizationTemplates,
  ...normalStandardizationExtraTemplates,
  ...normalStandardizationExtraTemplates2,
  ...normalStandardizationExtraTemplates3,
  ...normalBacksolveTemplates,
  ...normalBacksolveExtraTemplates,
  ...normalBacksolveExtraTemplates2,
  ...vectorSectionTemplates,
  ...vectorSpaceTemplates,
  ...vectorDistanceTemplates,
  ...vectorPlaneTemplates,
  ...vectorOrthogonalityTemplates,
  ...vectorAngleTemplates,
  ...vectorProjectionTemplates,
  ...vectorLineTemplates,
  ...vectorAreaTemplates,
  ...vectorEquationTemplates,
  ...vectorEquationVariantTemplates,
  ...highDifficultyTemplates,
];

const totalByTopic = RAW_TEMPLATES.reduce((acc, t) => {
  acc.set(t.meta.topicId, (acc.get(t.meta.topicId) ?? 0) + 1);
  return acc;
}, new Map<string, number>());

function scaledDifficulty(index: number, total: number) {
  if (total < 10) {
    return null;
  }
  const cut1 = Math.max(1, Math.floor(total * 0.6));
  const cut2 = Math.max(cut1 + 1, Math.floor(total * 0.9));
  if (index <= cut1) return 1;
  if (index <= cut2) return 2;
  return 3;
}

const indexByTopic = new Map<string, number>();

function adjustDifficulty(template: QuestionTemplate): QuestionTemplate {
  if (template.meta.difficulty !== 1) {
    return template;
  }
  const total = totalByTopic.get(template.meta.topicId) ?? 0;
  const index = (indexByTopic.get(template.meta.topicId) ?? 0) + 1;
  indexByTopic.set(template.meta.topicId, index);
  const scaled = scaledDifficulty(index, total);
  if (!scaled) {
    return template;
  }
  const difficulty = scaled;
  if (difficulty === template.meta.difficulty) {
    return template;
  }
  return {
    ...template,
    meta: {
      ...template.meta,
      difficulty,
    },
  };
}

export const ALL_TEMPLATES: QuestionTemplate[] = RAW_TEMPLATES.map(adjustDifficulty);

export function getTemplatesByTopic(topicId: string): QuestionTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.meta.topicId === topicId);
}

export function getTemplateById(templateId: string): QuestionTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.meta.id === templateId);
}
