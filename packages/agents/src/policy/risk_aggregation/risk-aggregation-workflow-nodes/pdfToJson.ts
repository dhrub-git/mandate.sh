import fs from "fs/promises";
// import pdfParse from "pdf-parse";
import pdfParse from "pdf-parse-new";

import { RiskAggregationState } from "../riskAggregationState";

export async function pdfToJson(
  state: RiskAggregationState,
): Promise<Partial<RiskAggregationState>> {
  try {
    const buffer = await fs.readFile(state.pdf_path);
    const pdf = await pdfParse(buffer);

    const text = pdf.text || "";

    state.community_benefit_report = text;
    state.fairness_report = text;
    state.privacy_security_report = text;
    state.transparency_report = text;
    state.accountability_report = text;

    state.project_metadata = {
      budget: 0,
      uses_digital_restart_fund: false,
      project_name: "Unknown",
      project_owner: "Unknown",
    };
  } catch (e) {
    const defaultText = "No report data available";

    state.community_benefit_report = defaultText;
    state.fairness_report = defaultText;
    state.privacy_security_report = defaultText;
    state.transparency_report = defaultText;
    state.accountability_report = defaultText;

    state.project_metadata = {
      budget: 0,
      uses_digital_restart_fund: false,
      project_name: "Unknown",
      project_owner: "Unknown",
    };
  }

  return state;
}
