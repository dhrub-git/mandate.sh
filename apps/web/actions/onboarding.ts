"use server";
import { db } from "@repo/database";
import { onboardingSchema, OnboardingData } from "@/lib/schemas";
import { redirect } from "next/navigation";
import { startMandateWorkflow } from "./workflow";

type OnboardingResult = {
    success: true;
    threadId:string;
    question?:string;
    message?:string;
} | {
    success: false;
    error: string;
    details?:any;
}
export async function submitCompanyProfile(data: OnboardingData):Promise<OnboardingResult> {
  const result = onboardingSchema.safeParse(data);
  
  if (!result.success) {
    return {
        success: false,
        error:"Invalid input data",
        details: result.error.format(),
    };
  }
  try {
    // Assuming you have the logged-in user's email or ID from session/context
    // For now, we'll create the company and we might need to link it to a user later
    const company = await db.company.create({
      data: {
        ...result.data,
      },
    });

    console.log("Company created with ID:", company.id);
    // In a real auth flow, you would link this company to the current user here
    // await db.user.update({ where: { email: userEmail }, data: { companyId: company.id, onboarded: true } });


    const workflowResult = await startMandateWorkflow({
        companyId: company.id,
        ...result.data,
    });

    if (!workflowResult.success) {
      console.error("Failed to start workflow in onboarding:", workflowResult.error);
      
      //Stirll prceed to dashboard as we will be givign user option to start workflow later if it fails here
      return {
        success: true,
        threadId: "",
        message: "Profile saved But assessment failed. You can start it later from the dashboard."
      };
    }
    console.log("Workflow started successfully with thread ID:", workflowResult.threadId);

    //returning success with threadid
    return{
        success: true,
        threadId: workflowResult.threadId,
        question: workflowResult.question,
    };
  } catch (error) {
    console.error("Onboarding Error:", error);

    // if(error.message?.includes("NEXT_REDIRECT")){
    //     throw error
    // }
    return {
        success: false,
        error: "Failed to save company profile.",
    }
  }
}