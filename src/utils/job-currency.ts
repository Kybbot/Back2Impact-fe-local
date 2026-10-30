import type { JobCurrency } from "@/types/jobs";

/** Translation key under `currency.*` for each currency the API returns */
export const CURRENCY_KEYS = {
    "USD per month": "usdPerMonth",
    "EUR per month": "eurPerMonth",
    "UAH per month": "uahPerMonth",
    "USD per project": "usdPerProject",
    Unpaid: "unpaid",
} as const satisfies Record<JobCurrency, string>;

/**
 * ISO 4217 code and schema.org `unitText` for the JobPosting JSON-LD.
 * schema.org has no unit for a per-project rate, so it is left out.
 * An unpaid role has no salary to describe, so it has no entry.
 */
export const CURRENCY_SCHEMA = {
    "USD per month": { code: "USD", unit: "MONTH" },
    "EUR per month": { code: "EUR", unit: "MONTH" },
    "UAH per month": { code: "UAH", unit: "MONTH" },
    "USD per project": { code: "USD", unit: undefined },
} as const satisfies Record<Exclude<JobCurrency, "Unpaid">, { code: string; unit: string | undefined }>;
