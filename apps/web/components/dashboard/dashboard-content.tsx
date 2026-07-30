import { ChatInterface } from "@/components/chat/ChatInterface";
import { getMandateWorkflowStatus } from "@/actions/workflow";
import {
  mandateGetThreadCurrentState,
  type MandateClassificationResult,
} from "@repo/agents";
import { extractCompanyProfile } from "@/utils/extract-company-profile";

type Props = {
  threadId: string;
  initialQuestion?: string;
  initialStatus?: "interrupt" | "completed" | "running" | "error";
};

export default async function DashboardContent({
  threadId,
  initialQuestion: urlQuestion,
  initialStatus: urlStatus,
}: Props) {
  let companyProfile;
  let finalPolicies: string | undefined;
  let initialRiskClassifications: MandateClassificationResult | null = null;
  let initialDrafts: Record<string, string> = {};
  let initialStagesComplete: string[] = [];

  try {
    const graphState = await mandateGetThreadCurrentState(threadId);
    const values = graphState?.values;

    companyProfile = extractCompanyProfile(values?.onboarding_data);

    if (values?.policies) {
      finalPolicies = values.policies;
    }

    if (values?.risk_classifications?.systems) {
      initialRiskClassifications = values.risk_classifications;
    }

    if (values?.draft_policy_2)
      initialDrafts.draft_policy_2 = values.draft_policy_2;
    if (values?.draft_policy_3)
      initialDrafts.draft_policy_3 = values.draft_policy_3;
    if (values?.draft_policy_4)
      initialDrafts.draft_policy_4 = values.draft_policy_4;

    if (values?.stage2_complete) initialStagesComplete.push("stage_2");
    if (values?.stage3_complete) initialStagesComplete.push("stage_3");
    if (values?.stage4_complete) initialStagesComplete.push("stage_4");
    if (values?.policies) initialStagesComplete.push("policy_generator");
  } catch (err) {
    console.warn("Graph state fetch failed:", err);
  }

  if (urlQuestion && urlStatus) {
    return (
      <ChatInterface
        threadId={threadId}
        initialStatus={urlStatus}
        initialQuestion={urlQuestion}
        companyProfile={companyProfile}
        initialPolicies={finalPolicies}
        initialRiskClassifications={initialRiskClassifications}
        initialDrafts={initialDrafts}
        initialStagesComplete={initialStagesComplete}
      />
    );
  }

  const statusResult = await getMandateWorkflowStatus(threadId);

  if (!statusResult.success) {
    throw new Error(statusResult.error);
  }

  const validStatus: "interrupt" | "completed" | "running" | "error" =
    statusResult.status === "interrupt"
      ? "interrupt"
      : statusResult.status === "completed"
        ? "completed"
        : statusResult.status === "error"
          ? "error"
          : "running";

  return (
    <ChatInterface
      threadId={threadId}
      initialStatus={validStatus}
      initialQuestion={statusResult.question}
      initialPolicies={statusResult.policies ?? finalPolicies}
      companyProfile={companyProfile}
      initialRiskClassifications={initialRiskClassifications}
      initialDrafts={initialDrafts}
      initialStagesComplete={initialStagesComplete}
    />
  );
}
