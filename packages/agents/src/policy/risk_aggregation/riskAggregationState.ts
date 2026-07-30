export interface RiskAggregationState {
  pdf_path: string;

  community_benefit_report?: string;
  fairness_report?: string;
  privacy_security_report?: string;
  transparency_report?: string;
  accountability_report?: string;

  project_metadata?: {
    budget?: number;
    uses_digital_restart_fund?: boolean;
    project_name?: string;
    project_owner?: string;
    [key: string]: any;
  };

  consolidated_risk_profile?: string;
  integrated_mitigation_plan?: string;
  submission_recommendation?: string;
  final_integrated_report_package?: string;
}