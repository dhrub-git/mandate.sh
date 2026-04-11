import fs from "fs/promises";
// import pdfParse from "pdf-parse";
import pdfParse from "pdf-parse-new";
import { CommunityBenefitState } from "../communityBenefitState";

export async function pdfToText(
  state: CommunityBenefitState,
): Promise<CommunityBenefitState> {
  try {
    if (!state.pdf_path) return state;

    const buffer = await fs.readFile(state.pdf_path);

    const pdf = await pdfParse(buffer);

    if (!pdf || !pdf.text) {
      console.error("PDF parsing error: Text cannot be parsed.");
    }
    else {      console.log("PDF parsed successfully. Extracted text length:", pdf.text.length);
    }

    const text = pdf.text || "";

    state.project_documentation = text;
    state.strategic_plans = text;
    state.community_feedback = text;
  } catch (e) {
    console.error("PDF read error:", e);

    state.project_documentation = "";
    state.strategic_plans = "";
    state.community_feedback = "";
  }

  return state;
}
