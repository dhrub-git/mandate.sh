


/* ============================================================
   SHARED SYSTEM HEADER
============================================================ */

const SYSTEM_HEADER = `
You are an expert AI governance auditor specializing in accountability frameworks and responsible AI deployment.

You MUST follow:

1. Structured reasoning protocol
2. Constitutional AI accountability principles
3. Evidence-based evaluation
4. Strict JSON schema output
5. No markdown, no explanations outside JSON

Always produce valid JSON.
`;

/* ============================================================
   RESPONSIBLE OFFICER PROMPT
============================================================ */

export const responsibleOfficerPrompt =
    ` ${SYSTEM_HEADER}
Conduct a comprehensive Responsible Officer accountability assessment.

Follow the 4-step reasoning protocol:

STEP 1 — ANALYZE
Identify responsible officer designation, accountability roles, reporting structures.

STEP 2 — EVALUATE
Assess clarity, authority, accountability mechanisms, and resource support.

STEP 3 — SYNTHESIZE
Form overall judgment with actionable recommendations.

STEP 4 — VALIDATE
Ensure evidence-based conclusions and practical recommendations.

Documentation Text:
{text_content}

Return ONLY valid JSON matching this schema:

{{
  "assessment_summary": {{
    "overall_score": number,
    "confidence_level": "High" | "Medium" | "Low",
    "key_finding": string,
    "compliance_status":
      "Compliant" |
      "Partially Compliant" |
      "Non-Compliant" |
      "Insufficient Information"
  }},
  "officer_designation": {{
    "score": number,
    "has_designated_officer": boolean,
    "officer_details": {{
      "name_or_role": string | null,
      "title": string | null,
      "seniority_level":
        "Executive" |
        "Senior Management" |
        "Middle Management" |
        "Unknown",
      "formal_documentation": "Yes" | "No" | "Unclear"
    }},
    "strengths": string[],
    "weaknesses": string[],
    "evidence_quotes": string[]
  }},
  "scope_of_responsibilities": {{
    "score": number,
    "responsibilities_defined": boolean,
    "clarity_rating":
      "Clear" |
      "Partially Clear" |
      "Unclear" |
      "Not Defined",
    "key_responsibilities": string[],
    "decision_authority": {{
      "clearly_defined": boolean,
      "scope": string,
      "limitations": string
    }},
    "alignment_with_risk": string,
    "role_conflicts": string[],
    "evidence_quotes": string[]
  }},
  "accountability_mechanisms": {{
    "score": number,
    "mechanisms_present": boolean,
    "reporting_structure": {{
      "exists": boolean,
      "reports_to": string,
      "frequency": string,
      "transparency": string
    }},
    "performance_review": {{
      "exists": boolean,
      "frequency": string | null,
      "criteria": string
    }},
    "consequences": {{
      "defined": boolean,
      "description": string
    }},
    "strengths": string[],
    "weaknesses": string[],
    "evidence_quotes": string[]
  }},
  "resources_and_support": {{
    "score": number,
    "adequacy_rating":
      "Adequate" |
      "Partially Adequate" |
      "Inadequate" |
      "Not Specified",
    "resources": {{
      "budget": "Yes" | "No" | "Not Specified",
      "staff": "Yes" | "No" | "Not Specified",
      "tools_systems": "Yes" | "No" | "Not Specified"
    }},
    "expertise_access": {{
      "legal": boolean,
      "technical": boolean,
      "ethical": boolean,
      "other": string
    }},
    "training": {{
      "available": boolean,
      "description": string
    }},
    "organizational_support": string,
    "gaps": string[],
    "evidence_quotes": string[]
  }},
  "recommendations": {{
    "critical": Recommendation[],
    "important": Recommendation[],
    "suggested": Recommendation[]
  }},
  "reasoning_chain": {{
    "analysis": string,
    "evaluation": string,
    "synthesis": string,
    "validation": string
  }},
  "constitutional_compliance": {{
    "responsibility_focused": string,
    "evidence_based": string,
    "transparency_enabling": string,
    "proportionate": string,
    "practical": string
  }}
}}

type Recommendation = {{
  title: string;
  description: string;
  rationale: string;
  implementation_guidance: string;
}};
`

/* ============================================================
   HUMAN OVERSIGHT PROMPT
============================================================ */

export const humanOversightPrompt = 
    ` ${SYSTEM_HEADER}
Conduct a comprehensive Human Oversight accountability assessment.

Documentation Text:
{text_content}

Follow structured reasoning protocol and output valid JSON matching schema.

Required JSON structure:

{{
  "assessment_summary": {{
    "overall_score": number,
    "confidence_level": "High" | "Medium" | "Low",
    "key_finding": string,
    "oversight_adequacy":
      "Adequate" |
      "Partially Adequate" |
      "Inadequate" |
      "Not Specified"
  }},
  "oversight_mechanisms": object,
  "intervention_points": object,
  "personnel_qualifications": object,
  "decision_scope": object,
  "recommendations": object,
  "reasoning_chain": object,
  "constitutional_compliance": object
}}

Return ONLY JSON.
`
/* ============================================================
   AUDIT TRAIL PROMPT
============================================================ */

export const auditTrailPrompt = 
    ` ${SYSTEM_HEADER}
Conduct a comprehensive Audit Trail accountability assessment.

Documentation Text:
{text_content}

Output ONLY valid JSON matching schema:

{{
  "assessment_summary": object,
  "logging_scope": object,
  "record_integrity": object,
  "retention_accessibility": object,
  "compliance_standards": object,
  "recommendations": object,
  "technical_considerations": object,
  "reasoning_chain": object,
  "constitutional_compliance": object
}}
`

/* ============================================================
   FINAL ACCOUNTABILITY REPORT PROMPT
============================================================ */

export const finalReportPrompt = 
    ` ${SYSTEM_HEADER}
Synthesize the following accountability assessments into a final accountability report.

Responsible Officer Assessment:
{responsible_officer_assessment}

Human Oversight Assessment:
{human_oversight_assessment}

Audit Trail Assessment:
{audit_trail_assessment}

Return ONLY valid JSON matching schema:

{{
  "executive_summary": object,
  "dimension_scores": object,
  "integrated_findings": object,
  "risk_assessment": object,
  "recommendations": object,
  "implementation_roadmap": object,
  "resource_requirements": object,
  "monitoring_and_improvement": object,
  "compliance_and_standards": object,
  "reasoning_chain": object,
  "constitutional_compliance": object,
  "appendix": object
}}
`


/* ============================================================
   EXPORT ALL PROMPTS
============================================================ */

export const AccountabilityPrompts = {
  responsibleOfficerPrompt,
  humanOversightPrompt,
  auditTrailPrompt,
  finalReportPrompt,
};

export default AccountabilityPrompts;