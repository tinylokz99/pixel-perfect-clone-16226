import { describe, it, expect, vi } from "vitest";
import { resolveDiscountCode, type DiscountRow } from "./discount";

const row: DiscountRow = { code: "SAVE10", kind: "percent", value: 10, active: true };

describe("resolveDiscountCode", () => {
  it("returns null for empty input", async () => {
    const fetcher = vi.fn();
    const result = await resolveDiscountCode("   ", true, fetcher);
    expect(result).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns invalid without calling fetcher when discounts are disabled", async () => {
    const fetcher = vi.fn();
    const result = await resolveDiscountCode("SAVE10", false, fetcher);
    expect(result).toEqual({ status: "invalid", message: "Discount codes are currently disabled" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns invalid when discounts enabled but code not found", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: null, error: null });
    const result = await resolveDiscountCode("NOPE", true, fetcher);
    expect(fetcher).toHaveBeenCalledWith("NOPE");
    expect(result).toEqual({ status: "invalid", message: "Code not found or inactive" });
  });

  it("returns valid when discounts enabled and code found", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: row, error: null });
    const result = await resolveDiscountCode("save10", true, fetcher);
    expect(fetcher).toHaveBeenCalledWith("save10");
    expect(result).toEqual({ status: "valid", code: "SAVE10", kind: "percent", value: 10 });
  });

  it("returns invalid with error message when fetcher errors", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const result = await resolveDiscountCode("X", true, fetcher);
    expect(result).toEqual({ status: "invalid", message: "boom" });
  });
});
