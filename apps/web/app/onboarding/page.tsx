"use client";

import { useState, useTransition } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  SelectPrime as Select,
} from "@repo/ui/select";
import { SelectionCard } from "@repo/ui/selection-card";
import { ProgressBar } from "@repo/ui/progress";
import { submitCompanyProfile } from "@/actions/onboarding";
import { OnboardingData } from "@/lib/schemas";
import {
  Industry,
  EmployeeCount,
  RevenueRange,
  AIInteraction,
  GovernanceStructure,
  AIRole,
} from "@repo/database/enums";
import { useRouter } from "next/navigation";

// Helper to convert Enum to Options for Select component
const enumToOptions = (enumObj: object) => {
  return Object.values(enumObj).map((value) => ({
    label: (value as string)
      .replace(/_/g, " ")
      .replace(
        /\w\S*/g,
        (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
      ), // Title Case
    value: value as string,
  }));
};

const STEPS = ["Basics", "Scale", "Reach", "Compliance", "Role"];

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    operatingRegions: [],
    certifications: [],
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 5;

  const handleNext = () => {
    setError(null);

    // Basic Client-side Validation logic per step
    if (step === 1) {
      if (!formData.name) return setError("Company name is required");
      if (!formData.address) return setError("Address is required");
      if (!formData.industry) return setError("Please select an industry");
    }
    if (step === 2) {
      if (!formData.employeeCount)
        return setError("Please select employee count");
      if (!formData.revenue) return setError("Please select revenue range");
    }
    if (step === 3) {
      if (!formData.operatingRegions || formData.operatingRegions.length === 0)
        return setError("Select at least one region");
      // If not EU, we require the interaction answer
      const hasEU = formData.operatingRegions.some(
        (r) => r.includes("EU") || r.includes("EEA"),
      );
      if (!hasEU && !formData.euInteraction)
        return setError("Please specify your interaction with the EU");
    }
    if (step === 4) {
      if (!formData.governance)
        return setError("Please select a governance structure");
    }
    if (step === 5) {
      if (!formData.aiRole) return setError("Please select your AI role");
      handleSubmit(); // Submit on final step
      return;
    }

    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      console.log("Submitting company profile:", formData);

      const result = await submitCompanyProfile(formData as OnboardingData);
      console.log("Server Response:", result);
      if (result?.success) {
        if (result.threadId) {
          console.log("Redirecting to dashboard with tread:", result.threadId);
          let redirectUrl = `/dashboard?thread=${result.threadId}`;
          if (result.question) {
            const encodedQ = btoa(encodeURIComponent(result.question));
            redirectUrl += `&q=${encodedQ}&s=interrupt`;
          }
          console.log("Final Redirect URL:", redirectUrl);
          router.push(redirectUrl);
        } else {
          console.log("Profile saved but workflow failed");
          setError(result.message || "Profile saved but workflow failed.");
          setTimeout(() => {
            router.push(`/dashboard`);
          }, 2000); // Redirect after showing error for 2 seconds
        }
      } else {
        console.log("Submissions Failed:", result.error, result.details);
        setError(
          result?.error || "Unexpected error occurred during submission.",
        );
      }
    });
  };

  const toggleSelection = (field: keyof OnboardingData, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header - Gusto Style */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight text-primary">
            Mandate-Main
          </span>
          <div className="text-sm text-muted-foreground">
            Questions? (800) 936-0383
          </div>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-16 w-full"></div>

      
      {/* Main Content */}
      <main className="w-full flex flex-col items-center py-10 px-6 flex-1">
        {/* Page Header */}
        <div className="w-full max-w-4xl mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Create your company profile
          </h1>

          {/* Progress Bar */}
          <ProgressBar current={step} total={totalSteps} />

          {/* Step Info */}
          <div className="mt-3 text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Form Content - Centered with max width */}
        <div className="w-full max-w-2xl flex flex-col gap-12">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Input
                label="Q1. What is your company's registered legal name?"
                placeholder="e.g. Acme Corp, Inc."
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
              />
              <Input
                label="Q2. What is your company's primary registered address?"
                placeholder="e.g. 123 Innovation Dr, San Francisco, CA"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <Select
                label="Q3. What is your company's primary industry?"
                options={enumToOptions(Industry || {})}
                value={formData.industry || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    industry: e.target.value as Industry,
                  })
                }
              />
            </div>
          )}

          {/* Step 2: Scale */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Select
                label="Q4. How many employees does your company have?"
                options={enumToOptions(EmployeeCount || {})}
                value={formData.employeeCount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employeeCount: e.target.value as EmployeeCount,
                  })
                }
              />
              <Select
                label="Q5. What was your company's annual revenue last fiscal year?"
                options={enumToOptions(RevenueRange || {})}
                value={formData.revenue || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    revenue: e.target.value as RevenueRange,
                  })
                }
              />
            </div>
          )}

          {/* Step 3: Reach */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-base font-semibold text-foreground mb-3">
                  Q6. In which countries/regions does your company operate?
                </label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all that apply. If your team changes, you'll be able to
                  add more worker types at any time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "EU/EEA",
                    "United Kingdom",
                    "United States",
                    "APAC",
                    "Other",
                  ].map((region) => (
                    <SelectionCard
                      key={region}
                      title={region}
                      selected={
                        formData.operatingRegions?.includes(region) || false
                      }
                      onClick={() =>
                        toggleSelection("operatingRegions", region)
                      }
                      type="checkbox"
                    />
                  ))}
                </div>
              </div>

              {/* Conditional Q7 */}
              {!formData.operatingRegions?.some(
                (r) => r.includes("EU") || r.includes("EEA"),
              ) && (
                <div>
                  <label className="block text-base font-semibold text-foreground mb-3">
                    Q7. Do you sell to customers in the EU, or does your AI
                    output affect people in the EU?
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.values(AIInteraction || {}).map((interaction) => (
                      <SelectionCard
                        key={interaction as string}
                        title={(interaction as string).replace(/_/g, " ")}
                        selected={formData.euInteraction === interaction}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            euInteraction: interaction as AIInteraction,
                          })
                        }
                        type="radio"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Compliance */}
          {step === 4 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-base font-semibold text-foreground mb-3">
                  Q8. Which compliance certifications does your company
                  currently hold?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "SOC 2 Type I/II",
                    "ISO 27001",
                    "ISO 42001",
                    "HIPAA",
                    "GDPR",
                    "NIST CSF",
                    "None",
                  ].map((cert) => (
                    <SelectionCard
                      key={cert}
                      title={cert}
                      selected={
                        formData.certifications?.includes(cert) || false
                      }
                      onClick={() => toggleSelection("certifications", cert)}
                      type="checkbox"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-foreground mb-3">
                  Q9. Does your company have a formal AI governance structure?
                </label>
                <div className="space-y-3">
                  {Object.values(GovernanceStructure || {}).map((gov) => (
                    <SelectionCard
                      key={gov as string}
                      title={(gov as string).replace(/_/g, " ")}
                      selected={formData.governance === gov}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          governance: gov as GovernanceStructure,
                        })
                      }
                      type="radio"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Role */}
          {step === 5 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="block text-base font-semibold text-foreground mb-2">
                Q10. At a high level, does your company BUILD AI systems, USE
                third-party AI, or both?
              </label>
              <div className="grid grid-cols-1 gap-4">
                <SelectionCard
                  title="We build/develop our own AI (Provider)"
                  description="You develop an AI system or have an AI system developed with a view to placing it on the market or putting it into service under your own name or trademark."
                  selected={
                    formData.aiRole === (AIRole?.PROVIDER ?? "PROVIDER")
                  }
                  onClick={() =>
                    setFormData({
                      ...formData,
                      aiRole: AIRole?.PROVIDER ?? "PROVIDER",
                    })
                  }
                  type="radio"
                />
                <SelectionCard
                  title="We use AI built by others (Deployer)"
                  description="You use an AI system under your authority in the course of your professional activity."
                  selected={
                    formData.aiRole === (AIRole?.DEPLOYER ?? "DEPLOYER")
                  }
                  onClick={() =>
                    setFormData({
                      ...formData,
                      aiRole: AIRole?.DEPLOYER ?? "DEPLOYER",
                    })
                  }
                  type="radio"
                />
                <SelectionCard
                  title="Both"
                  description="You act as both a provider and a deployer for different systems."
                  selected={formData.aiRole === (AIRole?.BOTH ?? "BOTH")}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      aiRole: AIRole?.BOTH ?? "BOTH",
                    })
                  }
                  type="radio"
                />
                <SelectionCard
                  title="Not Sure"
                  description="You need help determining your role."
                  selected={
                    formData.aiRole === (AIRole?.NOT_SURE ?? "NOT_SURE")
                  }
                  onClick={() =>
                    setFormData({
                      ...formData,
                      aiRole: AIRole?.NOT_SURE ?? "NOT_SURE",
                    })
                  }
                  type="radio"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 mt-8 ">
            <Button
              variant="secondary"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || isPending}
              className={step === 1 ? "invisible" : ""}
            >
              Back
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isPending}
              className="min-w-35"
            >
              {isPending
                ? "Saving..."
                : step === totalSteps
                  ? "Finish Profile"
                  : "Continue"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-4xl mt-16 text-center text-sm text-muted-foreground">
          By creating a profile, you agree to our{" "}
          <a href="#" className="text-foreground underline hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-foreground underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </div>
      </main>
    </div>
  );
}
