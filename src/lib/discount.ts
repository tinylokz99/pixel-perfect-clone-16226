export type DiscountLookupResult =
  | { status: "invalid"; message: string }
  | { status: "valid"; code: string; kind: "percent" | "fixed"; value: number };

export type DiscountRow = {
  code: string;
  kind: string;
  value: number;
  active: boolean;
};

export type DiscountFetcher = (code: string) => Promise<{
  data: DiscountRow | null;
  error: { message: string } | null;
}>;

/**
 * Pure logic for resolving a discount code submission.
 * - Always returns "invalid" when discountsEnabled is false.
 * - Otherwise calls the injected fetcher and maps the result.
 */
export async function resolveDiscountCode(
  rawCode: string,
  discountsEnabled: boolean,
  fetcher: DiscountFetcher,
): Promise<DiscountLookupResult | null> {
  const code = rawCode.trim();
  if (!code) return null;
  if (!discountsEnabled) {
    return { status: "invalid", message: "Discount codes are currently disabled" };
  }
  try {
    const { data, error } = await fetcher(code);
    if (error) throw error;
    if (!data) return { status: "invalid", message: "Code not found or inactive" };
    return {
      status: "valid",
      code: data.code,
      kind: data.kind as "percent" | "fixed",
      value: data.value,
    };
  } catch (e: any) {
    return { status: "invalid", message: e?.message || "Could not check code" };
  }
}
