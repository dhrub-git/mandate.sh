export interface FairnessState {
    csv_path : string;
    json_data?: Record<string,unknown>[] ;
    data_quality ?: string ;
    bias_analysis ?: string ;
    fairness_results?: string;
    mitigation_plan?: string;
}