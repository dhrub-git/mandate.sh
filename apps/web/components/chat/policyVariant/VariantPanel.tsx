// "use client";

// import { useState, useEffect } from "react";
// // 1. MUST USE 'import type' to prevent Prisma server code from leaking to the browser
// import type { Policy, PolicyVariant } from "@prisma/client"; 
// import { generateVariant, getVariantsForPolicy } from "@/actions/policy-variants";
// import VariantViewer from "./VariantViewer";

// // 2. Use raw strings that match the Prisma Enum exactly
// type VariantType = "EXECUTIVE_SUMMARY" | "COMPREHENSIVE_POLICY" | "VENDOR_REQUIREMENTS" | "CODING_STANDARDS";

// const VARIANT_TABS: { id: VariantType; label: string; desc: string }[] =[
//   { id: "EXECUTIVE_SUMMARY", label: "Exec Summary", desc: "For Board & C-suite" },
//   { id: "COMPREHENSIVE_POLICY", label: "Comprehensive Policy", desc: "For Legal & Compliance" },
//   { id: "VENDOR_REQUIREMENTS", label: "Vendor Requirements", desc: "For Procurement" },
//   { id: "CODING_STANDARDS", label: "Coding Standards", desc: "For Engineering" },
// ];

// type VariantPanelProps = {
//   policy: Policy;
// };

// export default function VariantPanel({ policy }: VariantPanelProps) {
//   const [variants, setVariants] = useState<Record<string, PolicyVariant>>({});
//   const[activeTab, setActiveTab] = useState<VariantType>("EXECUTIVE_SUMMARY");
//   const[generating, setGenerating] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);

//   const isAnyGenerating = Object.values(generating).some(Boolean);
//   const isLockedStatus = policy.status === "IN_REVIEW" || policy.status === "PUBLISHED";

//   useEffect(() => {
//     getVariantsForPolicy(policy.id).then((data) => {
//       const map = data.reduce((acc, curr) => ({ ...acc, [curr.variantType]: curr }), {});
//       setVariants(map);
//     });
//   }, [policy.id]);

//   const handleGenerate = async (type: VariantType) => {
//     setError(null);
//     setGenerating((prev) => ({ ...prev,[type]: true }));
    
//     // We pass the string to the server action, which automatically matches the Prisma Enum
//     const result = await generateVariant(policy.id, type as any);
    
//     if (result.success && result.variant) {
//       setVariants((prev) => ({ ...prev, [type]: result.variant as PolicyVariant }));
//     } else {
//       setError(result.error || `Failed to generate ${type}`);
//     }
    
//     setGenerating((prev) => ({ ...prev, [type]: false }));
//   };

//   const handleGenerateAll = async () => {
//     for (const tab of VARIANT_TABS) {
//       setActiveTab(tab.id);
//       await handleGenerate(tab.id);
//     }
//   };

//   const downloadPdf = (variantId: string) => {
//     window.open(`/api/policies/variants/${variantId}/pdf`, "_blank");
//   };

//   const activeVariant = variants[activeTab];

//   return (
//     <div className="mt-8 border rounded-lg bg-white shadow-sm overflow-hidden">
//       <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
//         <h3 className="font-semibold text-lg">Policy Variants</h3>
//         <button
//           onClick={handleGenerateAll}
//           disabled={isAnyGenerating || isLockedStatus}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//         >
//           {isAnyGenerating ? "Generating..." : "Generate All"}
//         </button>
//       </div>

//       <div className="flex border-b overflow-x-auto">
//         {VARIANT_TABS.map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`px-6 py-3 whitespace-nowrap ${
//               activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       <div className="p-4 min-h-[300px]">
//         {error && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</div>}

//         {generating[activeTab] ? (
//           <div className="flex justify-center items-center h-full text-gray-500">
//             <span className="animate-pulse">Generating {VARIANT_TABS.find(t => t.id === activeTab)?.label}...</span>
//           </div>
//         ) : activeVariant ? (
//           <div>
//             <div className="flex justify-end gap-2 mb-4">
//               <button 
//                 onClick={() => handleGenerate(activeTab)}
//                 disabled={isAnyGenerating || isLockedStatus}
//                 className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Regenerate
//               </button>
//               <button 
//                 onClick={() => downloadPdf(activeVariant.id)}
//                 className="px-3 py-1 text-sm border bg-gray-900 text-white rounded hover:bg-gray-800"
//               >
//                 Download PDF
//               </button>
//             </div>
//             <VariantViewer 
//               variant={activeVariant} 
//               policyCreatedAt={policy.createdAt}
//               onRegenerate={() => handleGenerate(activeTab)}
//               isGenerating={isAnyGenerating}
//             />
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-4">
//             <p className="text-center">{VARIANT_TABS.find(t => t.id === activeTab)?.desc}</p>
//             <button
//               onClick={() => handleGenerate(activeTab)}
//               disabled={isAnyGenerating || isLockedStatus}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//             >
//               Generate {VARIANT_TABS.find(t => t.id === activeTab)?.label}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import type { Policy, PolicyVariant } from "@prisma/client";
import { generateVariant, getVariantsForPolicy } from "@/actions/policy-variants";
import VariantViewer from "./VariantViewer";
import { Loader2, Sparkles } from "lucide-react";
type VariantType = "EXECUTIVE_SUMMARY" | "COMPREHENSIVE_POLICY" | "VENDOR_REQUIREMENTS" | "CODING_STANDARDS";
const VARIANT_TABS: { id: VariantType; label: string; desc: string }[] = [
  { id: "EXECUTIVE_SUMMARY", label: "Exec Summary", desc: "For Board & C-suite" },
  { id: "COMPREHENSIVE_POLICY", label: "Comprehensive Policy", desc: "For Legal & Compliance" },
  { id: "VENDOR_REQUIREMENTS", label: "Vendor Requirements", desc: "For Procurement" },
  { id: "CODING_STANDARDS", label: "Coding Standards", desc: "For Engineering" },
];
type VariantPanelProps = {
  policy: Policy;
};
export default function VariantPanel({ policy }: VariantPanelProps) {
  const [variants, setVariants] = useState<Record<string, PolicyVariant>>({});
  const [activeTab, setActiveTab] = useState<VariantType>("EXECUTIVE_SUMMARY");
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const isAnyGenerating = Object.values(generating).some(Boolean);
  const isLockedStatus = policy.status === "IN_REVIEW" || policy.status === "PUBLISHED";
  useEffect(() => {
    getVariantsForPolicy(policy.id).then((data) => {
      const map = data.reduce((acc, curr) => ({ ...acc, [curr.variantType]: curr }), {});
      setVariants(map);
    });
  }, [policy.id]);
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
  const downloadPdf = (variantId: string) => {
    window.open(`/api/policies/variants/${variantId}/pdf`, "_blank");
  };
  const activeVariant = variants[activeTab];
  return (
    <div className="mt-8 border rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Header with Generate All */}
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h3 className="font-semibold text-lg text-gray-900">Policy Variants</h3>
        <button
          onClick={handleGenerateAll}
          disabled={isAnyGenerating || isLockedStatus}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnyGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate All
            </>
          )}
        </button>
      </div>
      {/* Tab Bar */}
      <div className="flex border-b overflow-x-auto">
        {VARIANT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 whitespace-nowrap text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content Area */}
      <div className="p-4 min-h-[300px]">
        {error && (
          <div className="text-red-600 mb-4 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}
        {generating[activeTab] ? (
          <div className="flex flex-col justify-center items-center h-48 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <span>Generating {VARIANT_TABS.find((t) => t.id === activeTab)?.label}...</span>
          </div>
        ) : activeVariant ? (
          <div>
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => handleGenerate(activeTab)}
                disabled={isAnyGenerating || isLockedStatus}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
              <button
                onClick={() => downloadPdf(activeVariant.id)}
                className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Download PDF
              </button>
            </div>
            <VariantViewer
              variant={activeVariant}
              policyCreatedAt={policy.createdAt}
              onRegenerate={() => handleGenerate(activeTab)}
              isGenerating={isAnyGenerating}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-4">
            <p className="text-center">{VARIANT_TABS.find((t) => t.id === activeTab)?.desc}</p>
            <button
              onClick={() => handleGenerate(activeTab)}
              disabled={isAnyGenerating || isLockedStatus}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Generate {VARIANT_TABS.find((t) => t.id === activeTab)?.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}