import { redirect } from "next/navigation";
import { ChatInterface } from "../components/ChatInterface";
import { getMandateWorkflowStatus } from "../actions/workflow";
import { mandateGetThreadCurrentState } from "@repo/agents";
import { Suspense } from "react";
type DashboardPageProps = {
  searchParams: Promise<{ thread?: string; q?: string; s?: string }>;
};

// Extract a company profile from raw onboarding_data JSON string
function extractCompanyProfile(onboardingDataRaw: string | undefined) {
  if (!onboardingDataRaw) return undefined;
  try {
    const d = JSON.parse(onboardingDataRaw);
    // onboarding_data is stored as JSON — try common field shapes
    const name = d.companyName ?? d.name ?? d.Q1 ?? d.company_name ?? "";
    const industry = d.industry ?? d.Q3 ?? d.sector ?? "";
    const size = d.companySize ?? d.size ?? d.Q4 ?? d.employees ?? "";
    const countries = d.countries ?? d.Q6 ?? d.operatingCountries ?? "";
    if (!name && !industry) return undefined;
    return { name, industry, size, countries };
  } catch {
    return undefined;
  }
}
export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const threadId = params.thread;
  const encodedQuestion = params.q;
  if (!threadId) {
    redirect("/onboarding");
  }

  let initialQuestion: string | undefined = undefined;
  let initialStatus: "interrupt" | "completed" | "running" | "error" =
    "running";
  if (encodedQuestion) {
    try {
      initialQuestion = decodeURIComponent(atob(encodedQuestion));
      initialStatus = "interrupt";
    } catch (err) {
      console.error("Failed to decode encoded question:", err);
    }
  }
  return (
    <Suspense fallback={<LoadingDashboard />}>
      <DashboardContent
        threadId={threadId}
        initialQuestion={initialQuestion}
        initialStatus={initialStatus}
      />
    </Suspense>
  );
}
async function DashboardContent({
  threadId,
  initialQuestion: urlQuestion,
  initialStatus: urlStatus,
}: {
  threadId: string;
  initialQuestion?: string;
  initialStatus?: "interrupt" | "completed" | "running" | "error";
}) {
  // Always attempt to read graph state so we can extract companyProfile
  let companyProfile:
    | { name: string; industry: string; size: string; countries: string }
    | undefined;
    let finalPolicies: string | undefined = undefined; // <-- NEW
  try {
    const graphState = await mandateGetThreadCurrentState(threadId);
    companyProfile = extractCompanyProfile(graphState?.values?.onboarding_data);
        // ─── NEW: EXACT POLICY EXTRACTION ───
            const values = graphState?.values || {};

    if (values.policies) {
      finalPolicies = values.policies;
    }
  } catch {
    // non-fatal — draft policy will just use generic placeholders
  }

  try {
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
    const statusResult = await getMandateWorkflowStatus(threadId);
    if (!statusResult.success) {
      return <ErrorDashboard message={statusResult.error} />;
    }
    // Type guard to ensure status is valid
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
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return <ErrorDashboard message={error.message} />;
  }
}

function LoadingDashboard() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading workflow...</p>
      </div>
    </div>
  );
}
function ErrorDashboard({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="mb-4">{message}</p>
        <a
          href="/onboarding"
          className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
        >
          Start Over
        </a>
      </div>
    </div>
  );
}
