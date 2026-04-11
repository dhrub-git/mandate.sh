"use client";

import { useState } from "react";
import { readStreamableValue } from "@ai-sdk/rsc";
import {
  runSustainabilityAgent,
  runJobImpactAgent,
  runFairnessAgent,
  runAccountabilityAgent,
  runCommunityBenefitAgent,
  runPrivacySecurityAgent,
  runRiskAggregationAgent,
  runTransparencyAgent,
} from "@/actions/actions"

type AgentType =
  | "sustainability"
  | "job_impact"
  | "fairness"
  | "accountability"
  | "community_benefit"
  | "privacy"
  | "risk"
  | "transparency";

export function AgentRunner() {
  const [selectedAgent, setSelectedAgent] =
    useState<AgentType>("sustainability");
  const [logs, setLogs] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  // NEW: State for final report
  const [finalReport, setFinalReport] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    prompt: "How can I reduce the carbon footprint of my AWS infrastructure?",
    region: "ap-south-1",
    modelName: "gemini-2.0-flash",
    instanceType: "ml.p4d.24xlarge",
    jobRole: "Software Engineer",
    aiToolDescription: "Github Copilot for code completion",
    employeeCount: 100,
    hourlyRateAvg: 50,
    compliance_data: "The AI system is compliant with...",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStreaming(true);
    setLogs([]);
    setFinalReport(null); // Reset final report

    try {
      let result;

      // File-based agents common validation
      const needsFile = [
        "fairness",
        "accountability",
        "community_benefit",
        "privacy",
        "risk",
      ].includes(selectedAgent);

      if (needsFile && !file) {
        alert("Please upload a file first.");
        setIsStreaming(false);
        return;
      }

      if (selectedAgent === "sustainability") {
        result = await runSustainabilityAgent({
          prompt: formData.prompt,
          region: formData.region,
          modelName: formData.modelName,
          instanceType: formData.instanceType,
        });
      } else if (selectedAgent === "job_impact") {
        result = await runJobImpactAgent({
          jobRole: formData.jobRole,
          aiToolDescription: formData.aiToolDescription,
          employeeCount: formData.employeeCount,
          hourlyRateAvg: formData.hourlyRateAvg,
        });
      } else if (selectedAgent === "transparency") {
        result = await runTransparencyAgent({
          compliance_data: formData.compliance_data,
        });
      } else {
        // Handle all file upload agents
        const data = new FormData();
        if (file) data.append("file", file);

        switch (selectedAgent) {
          case "fairness":
            result = await runFairnessAgent(data);
            break;
          case "accountability":
            result = await runAccountabilityAgent(data);
            break;
          case "community_benefit":
            result = await runCommunityBenefitAgent(data);
            break;
          case "privacy":
            result = await runPrivacySecurityAgent(data);
            break;
          case "risk":
            result = await runRiskAggregationAgent(data);
            break;
        }
      }

      if (result && result.output) {
        for await (const event of readStreamableValue(result.output)) {
          console.log("Received event:", event);

          // Capture final report
          if (event.type === "data-final") {
            setFinalReport(
              typeof event.data === "string"
                ? event.data
                : JSON.stringify(event.data, null, 2),
            );
          } else {
            setLogs((prev) => [...prev, event]);
          }
        }
      }
    } catch (error) {
      console.error("Error executing agent:", error);
      setLogs((prev) => [...prev, { type: "error", error: String(error) }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const AgentButton = ({ type, label }: { type: AgentType; label: string }) => (
    <button
      onClick={() => setSelectedAgent(type)}
      disabled={isStreaming}
      style={{
        padding: "8px 16px",
        background: selectedAgent === type ? "#fff" : "#333",
        color: selectedAgent === type ? "#000" : "#fff",
        border: "1px solid #444",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #333",
          paddingBottom: "20px",
        }}
      >
        <h2>System Agent Runner</h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          <AgentButton type="sustainability" label="Sustainability" />
          <AgentButton type="job_impact" label="Job Impact" />
          <AgentButton type="fairness" label="Fairness (Policy)" />
          <AgentButton type="accountability" label="Accountability" />
          <AgentButton type="community_benefit" label="Community Benefit" />
          <AgentButton type="privacy" label="Privacy & Security" />
          <AgentButton type="risk" label="Risk Aggregation" />
          <AgentButton type="transparency" label="Transparency" />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          {selectedAgent === "sustainability" && (
            <>
              <label>
                Prompt:
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    minHeight: "80px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
              <label>
                Region:
                <input
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
              <label>
                Model Name:
                <input
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
              <label>
                Instance Type:
                <input
                  name="instanceType"
                  value={formData.instanceType}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
            </>
          )}

          {selectedAgent === "job_impact" && (
            <>
              <label>
                Job Role:
                <input
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
              <label>
                AI Tool Description:
                <input
                  name="aiToolDescription"
                  value={formData.aiToolDescription}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
              <label>
                Employee Count:
                <input
                  type="number"
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
              <label>
                Avg Hourly Rate ($):
                <input
                  type="number"
                  name="hourlyRateAvg"
                  value={formData.hourlyRateAvg}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #444",
                  }}
                />
              </label>
            </>
          )}

          {selectedAgent === "transparency" && (
            <label>
              Compliance Data:
              <textarea
                name="compliance_data"
                value={formData.compliance_data}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  minHeight: "150px",
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #444",
                }}
              />
            </label>
          )}

          {[
            "fairness",
            "accountability",
            "community_benefit",
            "privacy",
            "risk",
          ].includes(selectedAgent) && (
            <div
              style={{
                padding: "20px",
                border: "1px dashed #444",
                borderRadius: "8px",
              }}
            >
              <label>
                Upload File ({selectedAgent === "fairness" ? ".csv" : ".pdf"}):
                <br />
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={selectedAgent === "fairness" ? ".csv" : ".pdf"}
                  style={{ marginTop: "10px" }}
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isStreaming}
            style={{
              marginTop: "10px",
              padding: "12px",
              background: isStreaming ? "#666" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isStreaming ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {isStreaming ? "Running Agent..." : "Run Agent"}
          </button>
        </form>

        {/* NEW: Final Report Display */}
        {finalReport && (
          <div
            style={{
              marginTop: "20px",
              background: "#1e1e1e",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #444",
              color: "#e0e0e0",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#4caf50" }}>Final Report</h3>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {finalReport}
            </div>
          </div>
        )}
      </div>

      {/* Logs Output */}
      <div
        style={{
          background: "#111",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #333",
          minHeight: "300px",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: "#888",
            fontSize: "0.9rem",
            textTransform: "uppercase",
          }}
        >
          Execution Log
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontFamily: "monospace",
            fontSize: "0.85rem",
          }}
        >
          {logs.length === 0 && (
            <span style={{ color: "#444" }}>Waiting for execution...</span>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              style={{ borderBottom: "1px solid #222", paddingBottom: "4px" }}
            >
              <span
                style={{ color: getLogColor(log.type), fontWeight: "bold" }}
              >
                [{log.type}]
              </span>{" "}
              <span style={{ color: "#ccc" }}>
                {JSON.stringify(log.data || log.delta || log.error || "")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getLogColor(type: string) {
  switch (type) {
    case "start":
      return "#00ff00";
    case "finish":
      return "#00ff00";
    case "error":
      return "#ff0000";
    case "text-delta":
      return "#00ffff";
    case "data-metrics":
      return "#ff00ff";
    default:
      return "#ffff00";
  }
}
