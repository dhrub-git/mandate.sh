export interface ClassifiedTask {
  task: string;
  impact: "AUTOMATABLE" | "AUGMENTABLE" | "HUMAN_ONLY";
  confidence: number;
  reasoning: string;
}
export interface UpskillingItem {
  gap: string;
  recommended_course: string;
}
export interface ROI {
  hours_saved_per_week: number;
  cost_saved_weekly: number;
}
export interface ImpactSummary {
  automation_level: string;
  augmentation_level: string;
  human_centric_level: string;
}
export interface TaskBreakdownItem {
  task: string;
  impact: "AUTOMATABLE" | "AUGMENTABLE" | "HUMAN_ONLY";
  reasoning: string;
  time_savings_weekly?: number;
}
export interface CoreResponsibility {
  task: string;
  reasoning: string;
}
export interface EnrichedUpskillingItem extends UpskillingItem {
  course_metadata: {
    thumbnail_url: string;
    course_url: string;
    duration: string;
  };
}
export interface ReportOutput {
  impact_summary: ImpactSummary;
  task_breakdown: TaskBreakdownItem[];
  upskilling_plan: EnrichedUpskillingItem[];
  core_human_responsibilities: CoreResponsibility[];
}