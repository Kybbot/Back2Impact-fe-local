/**
 * The values the vacancy filters send to the API.
 *
 * Only the codes live here — the labels are in the `options` namespace of the
 * translations, keyed by these same codes. That split matters: the code is
 * part of the API contract and must never change with the display language,
 * while the label is just text. Look these up through `src/i18n/options.ts`
 * rather than indexing a dictionary by hand.
 */
export const filterOptions = {
    professionalAreas: [
        "business_analysis",
        "customer_&_tech_support",
        "data_analytics",
        "design",
        "engineering_&_manufacturing",
        "executive_&_leadership_roles",
        "finance_&_accounting",
        "hr_&_recruiting",
        "software_development",
        "legal_&_compliance",
        "logistics_&_supply_chain",
        "management",
        "marketing",
        "media",
        "product_management",
        "project_management",
        "sales_&_business_development",
        "teaching_&_education",
    ],
    spheres: [
        "account",
        "administration",
        "advocacy",
        "analytics",
        "comms",
        "community",
        "consulting",
        "copywriting",
        "design",
        "education",
        "engineering",
        "event",
        "finance",
        "fundraising",
        "gr",
        "healthcare",
        "hr",
        "it",
        "journalism",
        "law",
        "marketing",
        "monitoring",
        "partnership",
        "pr",
        "procurement",
        "projectmanagement",
        "psychology",
        "recruitment",
        "research",
        "sales",
        "support",
        "topmanagement",
        "translation",
        "video",
    ],
    workFormats: ["hybrid", "in_office", "remote"],
    employmentTypes: ["full_time", "part_time", "internship", "short_term_project", "volunteering"],
    seniorityLevels: ["entry", "junior", "middle", "senior", "top_management"],
} as const;

export type FilterGroup = keyof typeof filterOptions;

export type SeniorityLevel = (typeof filterOptions.seniorityLevels)[number];

/**
 * The API can send a level this build does not know about; the JSON-LD builder
 * has to leave `experienceRequirements` out in that case rather than emit a raw
 * code, and a translation lookup on an unknown key would be a type error.
 */
export const isSeniorityLevel = (value: string): value is SeniorityLevel =>
    (filterOptions.seniorityLevels as readonly string[]).includes(value);
