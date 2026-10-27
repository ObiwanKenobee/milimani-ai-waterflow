import { describe, expect, it } from "vitest";
import { BATCH_TRANSITIONS, canReleaseBatch } from "@/lib/operations";
import {
  ADMIN_ROLES,
  INVENTORY_ROLES,
  PRODUCTION_ROLES,
  QUALITY_ROLES,
  STAFF_ROLES,
} from "@/lib/roles";

describe("canReleaseBatch", () => {
  it("blocks release with no recorded tests", () => {
    expect(canReleaseBatch([])).toBe(false);
  });

  it("blocks release until at least one test passes", () => {
    expect(canReleaseBatch([{ result: "pending" }])).toBe(false);
    expect(canReleaseBatch([{ result: "pending" }, { result: "pass" }])).toBe(true);
  });

  it("blocks release when any recorded test failed", () => {
    expect(canReleaseBatch([{ result: "pass" }, { result: "fail" }])).toBe(false);
  });
});

describe("batch lifecycle transitions", () => {
  it("release is only reachable from quality_check", () => {
    expect(BATCH_TRANSITIONS.quality_check).toContain("released");
    expect(BATCH_TRANSITIONS.planned).not.toContain("released");
    expect(BATCH_TRANSITIONS.in_production).not.toContain("released");
    expect(BATCH_TRANSITIONS.released).toEqual([]);
  });
});

describe("operations role groups", () => {
  it("every operations role is staff", () => {
    for (const role of [...PRODUCTION_ROLES, ...QUALITY_ROLES, ...INVENTORY_ROLES]) {
      expect(STAFF_ROLES).toContain(role);
    }
  });

  it("core roles sit in the right group", () => {
    expect(PRODUCTION_ROLES).toContain("production_manager");
    expect(QUALITY_ROLES).toContain("quality_manager");
    expect(INVENTORY_ROLES).toContain("inventory_manager");
    expect(ADMIN_ROLES).toContain("operations_manager");
  });
});
