"use client";

import { useState, useEffect } from "react";
import type { Policy, PolicyVariant } from "@prisma/client"; 
import { generateVariant, getVariantsForPolicy , getVariantsForThread } from "@/actions/policy-variants";
import VariantViewer from "./VariantViewer";
import { Loader2 } from "lucide-react"; // Nice loading spinner
import {generateVariantPDF} from "@/lib/downloadVariant";
import { set } from "date-fns";

type VariantType = "EXECUTIVE_SUMMARY" | "COMPREHENSIVE_POLICY" | "VENDOR_REQUIREMENTS" | "CODING_STANDARDS";

const VARIANT_TABS: { id: VariantType; label: string; desc: string }[] =[
  { id: "EXECUTIVE_SUMMARY", label: "Exec Summary", desc: "For Board & C-suite" },
  { id: "COMPREHENSIVE_POLICY", label: "Comprehensive Policy", desc: "For Legal & Compliance" },
  { id: "VENDOR_REQUIREMENTS", label: "Vendor Requirements", desc: "For Procurement" },
  { id: "CODING_STANDARDS", label: "Coding Standards", desc: "For Engineering" },
];

type VariantPanelProps = {
  policy: Policy;
  companyProfile?:{
    name: string;
    industry: string;
    size: string;
    countries: string;
  }
};

export default function VariantPanel({ policy, companyProfile }: VariantPanelProps) {
  const [variants, setVariants] = useState<Record<string, PolicyVariant>>({});
  const [activeTab, setActiveTab] = useState<VariantType>("EXECUTIVE_SUMMARY");
  const[generating, setGenerating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [variantsFromVersion, setVariantsFromVersion] = useState<number | null>(null);

  const isAnyGenerating = Object.values(generating).some(Boolean);
  const isLockedStatus = policy.status === "IN_REVIEW" || policy.status === "PUBLISHED";

  useEffect(() => {
    getVariantsForThread(policy.threadId).then((data) => {
      const map = data.variants.reduce((acc, curr) => ({ ...acc, [curr.variantType]: curr }), {});
      setVariants(map);
      setVariantsFromVersion(data.variantsFromVersion);
    });
    console.log("Fetching variants for policy ID:", policy.id);
  }, [policy.threadId]);

  const handleGenerate = async (type: VariantType) => {
    setError(null);
    setGenerating((prev) => ({ ...prev, [type]: true }));
    
    const result = await generateVariant(policy.id, type as any);
    
    if (result.success && result.variant) {
      setVariants((prev) => ({ ...prev, [type]: result.variant as PolicyVariant }));
    } else {
      setError(result.error || `Failed to generate ${type}`);
    }
    
    setGenerating((prev) => ({ ...prev, [type]: false }));
  };

  const handleGenerateAll = async () => {
    for (const tab of VARIANT_TABS) {
      setActiveTab(tab.id);
      await handleGenerate(tab.id);
    }
  };

  const downloadPdf = async (variant:PolicyVariant) => {
    if (!companyProfile) {
      setError("Company profile is required to download PDF.");
      return;
    }
    setIsDownloadingPDF(true);
    setError(null);
    try {
      const buffer = await generateVariantPDF(companyProfile, variant);
      // Normalize buffer → ArrayBuffer
      const arrayBuffer =
        buffer instanceof Uint8Array ? (buffer.buffer as ArrayBuffer) : buffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const variantLabel = variant.variantType.replace(/_/g, "_");
      a.download = `${companyProfile.name}_${variantLabel}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setError("Failed to download PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const activeVariant = variants[activeTab];
const isActiveVariantStale = activeVariant 
  ? new Date(activeVariant.generatedAt) < new Date(policy.createdAt)
  : false;
 return (
    // FIX: Removed "flex flex-col", now it will naturally size itself
    <div className="border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#121212] shadow-sm overflow-hidden block">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-900 p-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Policy Variants</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tailored AI guidelines for different stakeholders</p>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={isAnyGenerating || isLockedStatus}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {isAnyGenerating ? "Generating..." : "Generate All"}
        </button>
      </div>

      {/* Tabs */}
      {/* FIX: Added shrink-0 so the tabs never collapse */}
      <div className="flex shrink-0 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
        {VARIANT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 whitespace-nowrap text-sm transition-colors ${
              activeTab === tab.id 
                ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-6 min-h-[300px] block">
        {error && <div className="text-red-500 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded text-sm">{error}</div>}

        {generating[activeTab] ? (
          <div className="flex flex-col justify-center items-center h-[300px] text-gray-500 dark:text-gray-400 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span className="animate-pulse text-sm">Generating {VARIANT_TABS.find(t => t.id === activeTab)?.label}...</span>
          </div>
        ) : activeVariant ? (
          <div className="block">
            <div className="flex justify-end gap-2 mb-4">
              <button 
                onClick={() => handleGenerate(activeTab)}
                disabled={isAnyGenerating || isLockedStatus}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                Regenerate
              </button>
              <button 
                onClick={() => downloadPdf(activeVariant)}
                disabled={isDownloadingPDF || !companyProfile}
               className="px-3 py-1.5 text-xs font-medium border border-transparent bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-gray-800 dark:hover:bg-white transition-colors disabled:opacity-50"
              >
                {isDownloadingPDF ? "Downloading..." : "Download PDF"}
              </button>
            </div>
            
            {/* The Viewer */}
            <div className="text-gray-800 dark:text-gray-200 text-sm">
              <VariantViewer 
                variant={activeVariant} 
                isStale={isActiveVariantStale}
                // policyCreatedAt={policy.createdAt}
                variantsFromVersion={variantsFromVersion}
                currentPolicyVersion={policy.version}

                onRegenerate={() => handleGenerate(activeTab)}
                isGenerating={isAnyGenerating}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 dark:text-gray-400 gap-4">
            <p className="text-center text-sm">{VARIANT_TABS.find(t => t.id === activeTab)?.desc}</p>
            <button
              onClick={() => handleGenerate(activeTab)}
              disabled={isAnyGenerating || isLockedStatus}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 transition-colors"
            >
              Generate {VARIANT_TABS.find(t => t.id === activeTab)?.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
