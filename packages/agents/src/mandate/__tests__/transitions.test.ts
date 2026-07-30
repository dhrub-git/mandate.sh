import { describe, it } from "node:test";
import assert from "node:assert/strict";

type PolicyStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

const VALID_TRANSITIONS: Record<PolicyStatus, PolicyStatus[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  REJECTED: ["DRAFT"],
  APPROVED: ["PUBLISHED"],
  PUBLISHED: [],
};

function validateTransition(from: PolicyStatus, to: PolicyStatus): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

describe("policy status transitions", () => {
  it("allows the happy path", () => {
    assert.equal(validateTransition("DRAFT", "IN_REVIEW"), true);
    assert.equal(validateTransition("IN_REVIEW", "APPROVED"), true);
    assert.equal(validateTransition("APPROVED", "PUBLISHED"), true);
  });

  it("rejects skips and published exits", () => {
    assert.equal(validateTransition("DRAFT", "PUBLISHED"), false);
    assert.equal(validateTransition("PUBLISHED", "DRAFT"), false);
    assert.equal(validateTransition("APPROVED", "IN_REVIEW"), false);
  });
});
