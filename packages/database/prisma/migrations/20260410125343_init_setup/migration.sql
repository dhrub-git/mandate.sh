-- CreateEnum
CREATE TYPE "PolicyVariantType" AS ENUM ('EXECUTIVE_SUMMARY', 'COMPREHENSIVE_POLICY', 'VENDOR_REQUIREMENTS', 'CODING_STANDARDS');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('TECHNOLOGY', 'HEALTHCARE', 'FINANCIAL_SERVICES', 'INSURANCE', 'EDUCATION', 'LEGAL', 'MANUFACTURING', 'RETAIL', 'GOVERNMENT', 'CRITICAL_INFRASTRUCTURE', 'LAW_ENFORCEMENT', 'HR', 'OTHER');

-- CreateEnum
CREATE TYPE "EmployeeCount" AS ENUM ('ONE_TO_49', 'FIFTY_TO_99', 'ONE_HUNDRED_TO_249', 'TWO_HUNDRED_FIFTY_TO_499', 'FIVE_HUNDRED_TO_999', 'ONE_THOUSAND_PLUS');

-- CreateEnum
CREATE TYPE "RevenueRange" AS ENUM ('UNDER_2M', 'TWO_TO_10M', 'TEN_TO_50M', 'FIFTY_TO_250M', 'OVER_250M');

-- CreateEnum
CREATE TYPE "AIInteraction" AS ENUM ('DIRECT_EU_CUSTOMERS', 'AI_OUTPUT_REACHES_EU', 'NO', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "GovernanceStructure" AS ENUM ('DEDICATED_COMMITTEE', 'PART_OF_EXISTING', 'NO_FORMAL_STRUCTURE', 'NO_GOVERNANCE');

-- CreateEnum
CREATE TYPE "AIRole" AS ENUM ('PROVIDER', 'DEPLOYER', 'BOTH', 'NOT_SURE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "industry" "Industry" NOT NULL,
    "employeeCount" "EmployeeCount" NOT NULL,
    "revenue" "RevenueRange" NOT NULL,
    "operatingRegions" TEXT[],
    "euInteraction" "AIInteraction",
    "certifications" TEXT[],
    "governance" "GovernanceStructure" NOT NULL,
    "aiRole" "AIRole" NOT NULL,
    "additionalInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "changeNote" TEXT,
    "parentId" TEXT,
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVariant" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "variantType" "PolicyVariantType" NOT NULL,
    "content" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Policy_threadId_idx" ON "Policy"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_threadId_version_key" ON "Policy"("threadId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVariant_policyId_variantType_key" ON "PolicyVariant"("policyId", "variantType");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVariant" ADD CONSTRAINT "PolicyVariant_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
