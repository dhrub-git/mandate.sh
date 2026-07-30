export function extractCompanyProfile(onboardingDataRaw: string | undefined) {
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