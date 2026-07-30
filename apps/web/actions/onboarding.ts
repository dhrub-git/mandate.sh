"use server";
import { db } from "@repo/database";
import { onboardingSchema, OnboardingData } from "@/lib/schemas";
import { startMandateWorkflow } from "./workflow";
import {
  getOrCreateSessionUser,
  linkUserToCompany,
  recordOwnedThread,
} from "@/lib/session";

type OnboardingResult =
  | {
      success: true;
      threadId: string;
      question?: string;
      message?: string;
    }
  | {
      success: false;
      error: string;
      details?: any;
    };

export async function submitCompanyProfile(
  data: OnboardingData,
): Promise<OnboardingResult> {
  const result = onboardingSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: "Invalid input data",
      details: result.error.format(),
    };
  }
  try {
    const sessionUser = await getOrCreateSessionUser();

    const company = await db.company.create({
      data: {
        ...result.data,
      },
    });

    await linkUserToCompany(sessionUser.id, company.id);
    console.log(
      "Company created with ID:",
      company.id,
      "linked to user",
      sessionUser.id,
    );

    const workflowResult = await startMandateWorkflow({
      companyId: company.id,
      ...result.data,
    });

    if (!workflowResult.success) {
      console.error(
        "Failed to start workflow in onboarding:",
        workflowResult.error,
      );

      return {
        success: true,
        threadId: "",
        message:
          "Profile saved But assessment failed. You can start it later from the dashboard.",
      };
    }

    await recordOwnedThread(company.id, workflowResult.threadId);
    console.log(
      "Workflow started successfully with thread ID:",
      workflowResult.threadId,
    );

    return {
      success: true,
      threadId: workflowResult.threadId,
      question: workflowResult.question,
    };
  } catch (error) {
    console.error("Onboarding Error:", error);

    return {
      success: false,
      error: "Failed to save company profile.",
    };
  }
}
