import z from "zod";
import type { TFunction } from "i18next";

import { COMPANY_SIZES, type PutCompanyDTO } from "@/services/employer-service/types";

import type { Company } from "@/utils/company";

/** the limits the API validates against; the counters and the schema share them */
export const DESCRIPTION_MIN_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 400;
const WEBSITE_MAX_LENGTH = 255;
const HEADQUARTERS_MAX_LENGTH = 256;
const FOUNDED_MIN_YEAR = 1000;
export const MAX_SECTORS = 3;

export const createCompanySchemas = (t: TFunction<"errors">) => {
    const required = t("validation.required");
    const foundedMaxYear = new Date().getFullYear();

    // optional, but once something is typed it has to fit the API's bounds
    const description = z
        .string()
        .trim()
        .max(DESCRIPTION_MAX_LENGTH, t("employers.max", { count: DESCRIPTION_MAX_LENGTH }))
        .refine(
            (value) => !value || value.length >= DESCRIPTION_MIN_LENGTH,
            t("employers.min", { count: DESCRIPTION_MIN_LENGTH }),
        );
    const website = z
        .string()
        .trim()
        .max(WEBSITE_MAX_LENGTH, t("employers.max", { count: WEBSITE_MAX_LENGTH }))
        .refine((value) => !value || z.httpUrl().safeParse(value).success, t("employers.website"));
    const sectors = z.array(z.string()).max(MAX_SECTORS);

    // "Skip for now": only the name is needed, the rest is checked just when filled in
    const draft = z.object({
        logoKey: z.string().optional(),
        name: z.string().trim().min(1, required),
        descriptionUk: description,
        descriptionEn: description,
        website,
        // "" is the Radix Select placeholder state
        companySize: z.union([z.enum(COMPANY_SIZES), z.literal("")]),
        sectors,
        headquarters: z
            .string()
            .trim()
            .max(HEADQUARTERS_MAX_LENGTH, t("employers.max", { count: HEADQUARTERS_MAX_LENGTH })),
        founded: z
            .string()
            .trim()
            .refine(
                (value) =>
                    !value || (/^\d+$/.test(value) && +value >= FOUNDED_MIN_YEAR && +value <= foundedMaxYear),
                t("employers.founded", { min: FOUNDED_MIN_YEAR, max: foundedMaxYear }),
            ),
        // the API needs it on every save, skipped or not
        additionalEmail: z
            .string()
            .trim()
            .min(1, required)
            .refine((value) => !value || z.email().safeParse(value).success, t("validation.email")),
    });

    // "Save and continue": everything a candidate reads on a vacancy has to be there
    const complete = draft.extend({
        descriptionUk: description.min(1, required),
        descriptionEn: description.min(1, required),
        website: website.min(1, required),
        sectors: sectors.min(1, t("employers.sectors")),
    });

    return { draft, complete };
};

type Schemas = ReturnType<typeof createCompanySchemas>;
export type CompanyFormValues = z.input<Schemas["complete"]>;
export type CompanyFormData = z.output<Schemas["complete"]>;

const isCompanySize = (size: string | null): size is CompanyFormValues["companySize"] =>
    (COMPANY_SIZES as readonly (string | null)[]).includes(size);

/**
 * The form's starting point: empty for a new company, the saved one otherwise.
 * The email lives on the user rather than the company, so the caller picks it.
 */
export const getCompanyFormDefaults = (
    company: Partial<Company> | null | undefined,
    additionalEmail: string,
): CompanyFormValues => ({
    logoKey: company?.logoKey ?? undefined,
    name: company?.name ?? "",
    descriptionUk: company?.descriptionUk ?? "",
    descriptionEn: company?.descriptionEn ?? "",
    website: company?.website ?? "",
    companySize: company?.companySize && isCompanySize(company.companySize) ? company.companySize : "",
    sectors: company?.sectors ?? [],
    headquarters: company?.headquarters ?? "",
    founded: company?.founded ? String(company.founded) : "",
    additionalEmail,
});

/** empty fields are left out rather than sent as "" */
export const toPutCompanyDTO = (data: CompanyFormData): PutCompanyDTO => ({
    logoKey: data.logoKey,
    name: data.name,
    descriptionUk: data.descriptionUk || undefined,
    descriptionEn: data.descriptionEn || undefined,
    website: data.website || undefined,
    companySize: data.companySize || undefined,
    sectors: data.sectors.length ? data.sectors : undefined,
    headquarters: data.headquarters || undefined,
    founded: data.founded ? Number(data.founded) : undefined,
    additionalEmail: data.additionalEmail,
});
