import fs from "fs/promises";
// import pdfParse from "pdf-parse";
import pdfParse from "pdf-parse-new";
import { PrivacySecurityState } from "../privacySecurityState";

export async function pdfToText(
  state: PrivacySecurityState,
): Promise<PrivacySecurityState> {
  try {
    const buffer = await fs.readFile(state.pdf_path);
    const data = await pdfParse(buffer);

    const text = data.text ?? "";

    state.project_documentation = text;
    state.data_flow_map = text;
    state.security_policies = text;
  } catch (err) {
    console.error("PDF read error:", err);

    state.project_documentation = "";
    state.data_flow_map = "";
    state.security_policies = "";
  }

  return state;
}
