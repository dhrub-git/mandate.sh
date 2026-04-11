// Reference: job_impact_agent/state.py
import { Annotation } from "@langchain/langgraph";
import { ClassifiedTask, UpskillingItem, ROI, ReportOutput } from "./type";
export const JobImpactState = Annotation.Root({
  // Inputs
  jobRole: Annotation<string>,
  aiToolDescription: Annotation<string>,
  employeeCount: Annotation<number>,
  hourlyRateAvg: Annotation<number>,
  // Outputs
  tasks: Annotation<string[]>,
  classifiedTasks: Annotation<ClassifiedTask[]>,
  upskillingPlan: Annotation<UpskillingItem[]>,
  roi: Annotation<ROI>,
  report: Annotation<ReportOutput>,
});