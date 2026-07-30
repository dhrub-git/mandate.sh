import fs from "fs/promises";
// import pdfParse from "pdf-parse";
import pdf from "pdf-parse-new"
import { AccountabilityState } from "../accountabilityState";

export async function pdfToText(
  state: AccountabilityState,
): Promise<AccountabilityState> {
  try {
    const buffer = await fs.readFile(state.pdf_path);
    const data = await pdf(buffer);

    const text = data.text ?? "";

    // Populate all accountability-related fields from the same PDF
    state.project_documentation = text;
    state.org_chart_or_roles_doc = text;
    state.training_materials = text;
    state.audit_log_specs = text;
  } catch (err) {
    console.error("PDF read error:", err);

    state.project_documentation = "";
    state.org_chart_or_roles_doc = "";
    state.training_materials = "";
    state.audit_log_specs = "";
  }

  return state;
}
