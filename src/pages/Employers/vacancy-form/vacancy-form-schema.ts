import z from "zod";
import type { TFunction } from "i18next";

import {
    JOB_ENGLISH_LEVELS,
    JOB_UKRAINIAN_LEVELS,
    type EmployerJobDTO,
    type EmployerJobType,
} from "@/services/employer-service/types";

import type { JobCurrency } from "@/types/jobs";

import { toDateValue } from "@/utils/date";
import { htmlToText } from "@/utils/html";
import { CURRENCY_KEYS } from "@/utils/job-currency";
import { filterOptions, type SeniorityLevel } from "@/utils/filter-options";

/** the limits the API validates against; the counters and the schema share them */
export const DESCRIPTION_MIN_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const MAX_PROFESSIONAL_AREAS = 3;
export const MAX_SECTORS = 3;
/** how far ahead the deadline can be set; the role can be extended later */
export const MAX_OPEN_DAYS = 30;

export const SENIORITY_LEVELS = filterOptions.seniorityLevels;
/** in the order the design lists them rather than the filters' A–Z */
export const WORK_FORMATS = ["in_office", "hybrid", "remote"] as const;
export const CURRENCIES = Object.keys(CURRENCY_KEYS) as JobCurrency[];
/** the opportunity type that asks for the internship's dates and season */
export const INTERNSHIP = "internship";

type WorkFormat = (typeof WORK_FORMATS)[number];

/** what the limits apply to: the description's text without its markup; the counters show it too */
export const getDescriptionLength = (html: string) => htmlToText(html).trim().length;

/** the deadline is picked from today up to `MAX_OPEN_DAYS` ahead */
export const getDeadlineRange = () => {
    const today = new Date();
    const last = new Date(today);

    last.setDate(today.getDate() + MAX_OPEN_DAYS);

    return { min: toDateValue(today), max: toDateValue(last) };
};

/** the vacancy form's deadline, also all a reopened vacancy is asked for */
export const createDeadlineSchema = (t: TFunction<"errors">) => {
    const deadline = getDeadlineRange();

    return (
        z
            .string()
            .min(1, t("validation.required"))
            // `yyyy-mm-dd` compares as a date
            .refine(
                (value) => value >= deadline.min && value <= deadline.max,
                t("employers.vacancy.deadline", { count: MAX_OPEN_DAYS }),
            )
    );
};

/** the end of the picked day in the employer's time zone, so the role stays open through all of it */
export const toDeadlineISO = (value: string) => new Date(`${value}T23:59:59.999`).toISOString();

/** the start of the picked day in the employer's time zone */
const toDateISO = (value: string) => new Date(`${value}T00:00:00`).toISOString();

export const createVacancySchema = (t: TFunction<"errors">) => {
    const required = t("validation.required");
    const pickOne = t("employers.vacancy.pickOne");

    const name = z.string().trim().min(1, required);
    // HTML from the rich-text editor, measured by the text a candidate reads rather than its tags
    const description = z.string().superRefine((value, ctx) => {
        const length = getDescriptionLength(value);

        if (!length) ctx.addIssue({ code: "custom", message: required });
        else if (length < DESCRIPTION_MIN_LENGTH)
            ctx.addIssue({
                code: "custom",
                message: t("employers.min", { count: DESCRIPTION_MIN_LENGTH }),
            });
        else if (length > DESCRIPTION_MAX_LENGTH)
            ctx.addIssue({
                code: "custom",
                message: t("employers.max", { count: DESCRIPTION_MAX_LENGTH }),
            });
    });
    // optional, but a whole amount once typed; checked below, as an unpaid role ignores it
    const salary = z.string().trim();
    // "" is the nothing-picked state (the Radix Select placeholder); the type predicate drops it from
    // the output, and unlike a failed enum a failed refine still lets the cross-field checks below run
    const seniority = z
        .union([z.enum(SENIORITY_LEVELS), z.literal("")])
        .refine((value): value is SeniorityLevel => value !== "", required);

    return z
        .object({
            nameUk: name,
            nameEn: name,
            descriptionUk: description,
            descriptionEn: description,
            professionalAreas: z.array(z.string()).min(1, pickOne).max(MAX_PROFESSIONAL_AREAS),
            sectors: z.array(z.string()).min(1, pickOne).max(MAX_SECTORS),
            spheres: z.array(z.string()),
            opportunityTypes: z.array(z.string()).min(1, pickOne),
            // optional, and only asked for an internship; the range is checked below
            internshipStart: z.string(),
            internshipEnd: z.string(),
            internshipSeason: z.string().trim(),
            format: z
                .union([z.enum(WORK_FORMATS), z.literal("")])
                .refine((value): value is WorkFormat => value !== "", required),
            // one pick, sent as a one-item list; required unless the role is remote, checked below
            region: z.string(),
            seniorityFrom: seniority,
            seniorityTo: seniority,
            englishLevel: z.enum(JOB_ENGLISH_LEVELS),
            ukrainianLevel: z.enum(JOB_UKRAINIAN_LEVELS),
            minimumSalary: salary,
            maximumSalary: salary,
            currency: z.enum(CURRENCIES),
            acceptApplicationsUntil: createDeadlineSchema(t),
            requiresCoverLetter: z.boolean(),
            requiresAttachment: z.boolean(),
            additionalEmail: z
                .string()
                .trim()
                .min(1, required)
                .refine((value) => !value || z.email().safeParse(value).success, t("validation.email")),
        })
        .superRefine((data, ctx) => {
            if (data.format !== "remote" && !data.region)
                ctx.addIssue({ code: "custom", path: ["region"], message: required });

            // the dates are hidden unless the role is an internship; `yyyy-mm-dd` compares as a date
            if (
                data.opportunityTypes.includes(INTERNSHIP) &&
                data.internshipStart &&
                data.internshipEnd &&
                data.internshipEnd < data.internshipStart
            )
                ctx.addIssue({
                    code: "custom",
                    path: ["internshipEnd"],
                    message: t("employers.vacancy.internshipRange"),
                });

            // both are only compared once each is valid on its own
            const from = SENIORITY_LEVELS.indexOf(data.seniorityFrom);
            const to = SENIORITY_LEVELS.indexOf(data.seniorityTo);

            if (from !== -1 && to !== -1 && to < from)
                ctx.addIssue({
                    code: "custom",
                    path: ["seniorityTo"],
                    message: t("employers.vacancy.seniorityRange"),
                });

            // the amounts are hidden for an unpaid role, so whatever was left in them is not checked
            if (data.currency === "Unpaid") return;

            for (const field of ["minimumSalary", "maximumSalary"] as const)
                if (data[field] && !/^\d+$/.test(data[field]))
                    ctx.addIssue({ code: "custom", path: [field], message: t("employers.vacancy.salary") });

            const minimum = Number(data.minimumSalary);
            const maximum = Number(data.maximumSalary);

            if (data.minimumSalary && data.maximumSalary && maximum < minimum)
                ctx.addIssue({
                    code: "custom",
                    path: ["maximumSalary"],
                    message: t("employers.vacancy.salaryRange"),
                });
        });
};

type Schema = ReturnType<typeof createVacancySchema>;
export type VacancyFormValues = z.input<Schema>;
export type VacancyFormData = z.output<Schema>;

const isWorkFormat = (format: string): format is WorkFormat =>
    (WORK_FORMATS as readonly string[]).includes(format);

/** the form's starting point: the saved vacancy, or an empty one in the company's sectors and with its email */
export const getVacancyFormDefaults = (
    job: EmployerJobType | null,
    companySectors: string[],
    companyEmail: string,
): VacancyFormValues => ({
    nameUk: job?.nameUk ?? "",
    nameEn: job?.nameEn ?? "",
    descriptionUk: job?.descriptionUk ?? "",
    descriptionEn: job?.descriptionEn ?? "",
    professionalAreas: job?.professionalAreas ?? [],
    sectors: job?.sectors ?? companySectors.slice(0, MAX_SECTORS),
    spheres: job?.spheres ?? [],
    opportunityTypes: job?.opportunityTypes ?? [],
    internshipStart: job?.internshipStart ? toDateValue(new Date(job.internshipStart)) : "",
    internshipEnd: job?.internshipEnd ? toDateValue(new Date(job.internshipEnd)) : "",
    internshipSeason: job?.internshipSeason ?? "",
    format: job && isWorkFormat(job.format) ? job.format : "",
    region: job?.location ?? "",
    seniorityFrom: job?.seniorityFrom ?? "",
    seniorityTo: job?.seniorityTo ?? "",
    englishLevel: job?.englishLevel ?? "Not required",
    ukrainianLevel: job?.ukrainianLevel ?? "Not required",
    minimumSalary: typeof job?.minimumSalary === "number" ? String(job.minimumSalary) : "",
    maximumSalary: typeof job?.maximumSalary === "number" ? String(job.maximumSalary) : "",
    currency: job?.currency ?? "USD per month",
    acceptApplicationsUntil: job?.expiresAt ? toDateValue(new Date(job.expiresAt)) : getDeadlineRange().max,
    requiresCoverLetter: job?.requiresCoverLetter ?? false,
    requiresAttachment: job?.requiresAttachment ?? false,
    additionalEmail: job?.additionalEmail || companyEmail,
});

export const toEmployerJobDTO = (data: VacancyFormData): EmployerJobDTO => {
    const isUnpaid = data.currency === "Unpaid";
    const minimumSalary = !isUnpaid && data.minimumSalary ? Number(data.minimumSalary) : null;
    const maximumSalary = !isUnpaid && data.maximumSalary ? Number(data.maximumSalary) : null;
    // the internship's fields stay in the form when the type is unpicked, but go out only with it
    const isInternship = data.opportunityTypes.includes(INTERNSHIP);

    return {
        nameUk: data.nameUk,
        nameEn: data.nameEn,
        descriptionUk: data.descriptionUk,
        descriptionEn: data.descriptionEn,
        minimumSalary,
        maximumSalary,
        // a currency means nothing without an amount, while an unpaid role never has one
        currency: !isUnpaid && minimumSalary === null && maximumSalary === null ? null : data.currency,
        englishLevel: data.englishLevel,
        ukrainianLevel: data.ukrainianLevel,
        sectors: data.sectors,
        spheres: data.spheres.length ? data.spheres : null,
        region: data.format === "remote" ? null : data.region,
        professionalAreas: data.professionalAreas,
        format: data.format,
        opportunityTypes: data.opportunityTypes,
        seniorityFrom: data.seniorityFrom,
        seniorityTo: data.seniorityTo,
        requiresCoverLetter: data.requiresCoverLetter,
        requiresAttachment: data.requiresAttachment,
        acceptApplicationsUntil: toDeadlineISO(data.acceptApplicationsUntil),
        internshipStart: isInternship && data.internshipStart ? toDateISO(data.internshipStart) : null,
        internshipEnd: isInternship && data.internshipEnd ? toDateISO(data.internshipEnd) : null,
        internshipSeason: isInternship && data.internshipSeason ? data.internshipSeason : null,
        additionalEmail: data.additionalEmail,
    };
};
