import { db } from ".";

export async function saveAdditionalData(companyId: string, threadId: string, additionalData: any) {
    const existingCompany = await db.company.findUnique({
        where: { id: companyId },
    });
    if (!existingCompany) {
        throw new Error("Company not found");
    }
    const updatedCompany = await db.company.update({
        where: { id: companyId },
        data: {
            additionalInfo: {
                ...(existingCompany.additionalInfo as Record<string, any> ?? {}),
                [threadId]: additionalData,
            },
        },
    });

    return updatedCompany;
}

export async function getCompanyInfo(companyId: string) {
    const company = await db.company.findUnique({
        where: { id: companyId },
    });

    if (!company) {
        throw new Error("Company not found");
    }
    
    return company;
}