import { ChatInterface } from "@/components/chat/ChatInterface";
import { getMandateWorkflowStatus } from "@/actions/workflow";
import { mandateGetThreadCurrentState } from "@repo/agents";
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

  // Fetch graph state (non-blocking failure)
  try {
    const graphState = await mandateGetThreadCurrentState(threadId);

    companyProfile = extractCompanyProfile(graphState?.values?.onboarding_data);

    if (graphState?.values?.policies) {
      finalPolicies = graphState.values.policies;
    }
  } catch (err) {
    console.warn("Graph state fetch failed:", err);
  }

  // If URL provided state → skip workflow API
  if (urlQuestion && urlStatus) {
    return (
      <ChatInterface
        threadId={threadId}
        initialStatus={urlStatus}
        initialQuestion={urlQuestion}
        companyProfile={companyProfile}
        initialPolicies={finalPolicies}
      />
    );
  }

  // Fetch workflow status
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
      initialPolicies={statusResult.policies}
      companyProfile={companyProfile}
    />
  );
}
