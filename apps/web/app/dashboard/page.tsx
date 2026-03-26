import DashboardContent from "@/components/dashboard/dashboard-content";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

type DashboardPageProps = {
  searchParams: Promise<{ thread?: string; q?: string; s?: string }>;
};

// Extract a company profile from raw onboarding_data JSON string

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
    <Suspense fallback={<Loading />}>
      <DashboardContent
        threadId={threadId}
        initialQuestion={initialQuestion}
        initialStatus={initialStatus}
      />
    </Suspense>
  );
}
