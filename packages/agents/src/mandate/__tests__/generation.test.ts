import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyAISystems } from "../classifier/riskClassifier";
import { applyDeterministicSections } from "../config/deterministicSections";
import {
  getStageCompleteCall,
  isStageMarkedComplete,
} from "../tools/stageComplete";
import { compactStageSummary } from "../config/stageSummaries";

describe("classifyAISystems", () => {
  it("tiers resume screening as HIGH_RISK regardless of industry", () => {
    const result = classifyAISystems(
      [
        {
          systemName: "HireScreen",
          devSource: "Third-party",
          purpose: "resume screening for hiring",
          functionCategories: ["Decision support"],
        },
      ],
      {
        industry: "HEALTHCARE",
        operatingRegions: ["EU"],
        aiRole: "DEPLOYER",
      },
    );
    assert.equal(result.systems[0]?.tier, "HIGH_RISK");
    assert.match(result.systems[0]?.annexDomain ?? "", /Employment/i);
  });

  it("tiers chatbots as LIMITED_RISK", () => {
    const result = classifyAISystems(
      [
        {
          systemName: "Support Bot",
          devSource: "In-house",
          purpose: "customer support chatbot",
          functionCategories: ["Chatbot/virtual assistant"],
        },
      ],
      {
        industry: "TECHNOLOGY",
        operatingRegions: ["US"],
        aiRole: "PROVIDER",
      },
    );
    assert.equal(result.systems[0]?.tier, "LIMITED_RISK");
  });
});

describe("applyDeterministicSections", () => {
  it("overwrites purpose, regulations, inventory, review, and document control", () => {
    const risk = classifyAISystems(
      [
        {
          systemName: "Bot",
          devSource: "In-house",
          purpose: "chat",
          functionCategories: ["Chatbot/virtual assistant"],
        },
      ],
      {
        industry: "TECHNOLOGY",
        operatingRegions: ["EU"],
        aiRole: "PROVIDER",
        euInteraction: "DIRECT_EU_CUSTOMERS",
      },
    );

    const out = applyDeterministicSections(
      `## 1. Purpose & Scope\nOLD PURPOSE\n\n## 2. Applicable Regulations\nOLD REGS\n\n## 4. Governance Structure\nKEEP ME\n\n## 3. AI System Inventory Summary\nWRONG\n\n## 7. Policy Review Schedule\nOLD\n\n## 8. Document Control\nOLD DOC\n`,
      {
        name: "Acme AI",
        address: "Berlin",
        industry: "TECHNOLOGY",
        employeeCount: "FIFTY_TO_99",
        revenue: "TWO_TO_10M",
        operatingRegions: ["EU"],
        euInteraction: "DIRECT_EU_CUSTOMERS",
        certifications: ["ISO 27001"],
        governance: "NO_FORMAL_STRUCTURE",
        aiRole: "PROVIDER",
      },
      risk,
    );

    assert.match(out, /Acme AI/);
    assert.match(out, /EU AI Act/);
    assert.match(out, /Bot/);
    assert.match(out, /KEEP ME/);
    assert.doesNotMatch(out, /OLD PURPOSE/);
    assert.doesNotMatch(out, /WRONG/);
  });
});

describe("stage_complete detection", () => {
  it("detects tool call completion", () => {
    const response = {
      content: "",
      tool_calls: [
        {
          name: "stage_complete",
          id: "1",
          args: { stage: 2, summary: "done", systems: [] },
        },
      ],
    };
    assert.equal(isStageMarkedComplete(response, 2, ["[STAGE2_COMPLETE]"]), true);
    assert.equal(getStageCompleteCall(response, 2)?.args.summary, "done");
  });

  it("falls back to legacy markers", () => {
    const response = { content: "All set [STAGE3_COMPLETE]", tool_calls: [] };
    assert.equal(
      isStageMarkedComplete(response, 3, ["[STAGE3_COMPLETE]"]),
      true,
    );
  });
});

describe("compactStageSummary", () => {
  it("truncates long text", () => {
    const long = "x".repeat(5000);
    const out = compactStageSummary(2, long, 100);
    assert.ok(out.length <= 101);
    assert.match(out, /…$/);
  });
});
