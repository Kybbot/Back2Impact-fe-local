import type { JobCurrency } from "@/types/jobs";
import type { UserLanguageType } from "@/services/user-service/types";

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number];

export const COMPANY_LOGO_MIME_TYPES = ["image/png", "image/svg+xml"] as const;

export type CompanyLogoMimeType = (typeof COMPANY_LOGO_MIME_TYPES)[number];

/** 2 MB, the limit the API enforces on the presign request */
export const COMPANY_LOGO_MAX_SIZE = 1024 * 1024 * 2;

export type PostCompanyLogoDTO = {
    mimeType: CompanyLogoMimeType;
    size: number;
};

export type PostCompanyLogoResponse = {
    url: string;
    key: string;
};

export type EmployerDashboard = {
    publishedJobs: number;
    applicationsCount: number;
    newApplicationsCount: number;
    totalViewsCount: number;
    /** the company's first vacancy while it waits for moderation, `null` once there is none */
    jobInPendingNameUk: string | null;
    jobInPendingNameEn: string | null;
    expiringJobs: {
        id: number;
        nameEn: string;
        nameUk: string;
        expiresAt: string;
    }[];
};

export type PutCompanyDTO = {
    logoKey?: string;
    name: string;
    descriptionUk?: string;
    descriptionEn?: string;
    website?: string;
    companySize?: CompanySize;
    sectors?: string[];
    headquarters?: string;
    founded?: number;
    additionalEmail: string;
};

export type EmployerJobStatus = "draft" | "pending_review" | "published" | "rejected" | "expired" | "closed";

/** in the order the close dialog offers them */
export const EMPLOYER_JOB_CLOSE_REASONS = [
    "hired_via_platform",
    "hired_elsewhere",
    "paused",
    "cancelled",
] as const;

export type EmployerJobCloseReason = (typeof EMPLOYER_JOB_CLOSE_REASONS)[number];

export type JobSeniority = "entry" | "junior" | "middle" | "senior" | "top_management";

export const JOB_ENGLISH_LEVELS = ["Not required", "A2", "B1", "B2", "C1+"] as const;

export type JobEnglishLevel = (typeof JOB_ENGLISH_LEVELS)[number];

export const JOB_UKRAINIAN_LEVELS = ["Not required", "B1", "B2", "C1+"] as const;

export type JobUkrainianLevel = (typeof JOB_UKRAINIAN_LEVELS)[number];

export type EmployerJobType = {
    id: number;
    nameUk: string;
    nameEn: string;
    /** a code from `onboardingOptions.regions` */
    location: string | null;
    viewsCount: number;
    applicationsCount: number;
    expiresAt: Date | null;
    descriptionUk: string;
    descriptionEn: string;
    minimumSalary: number | null;
    maximumSalary: number | null;
    currency: JobCurrency | null;
    professionalAreas: string[];
    sectors: string[];
    opportunityTypes: string[];
    format: string;
    spheres: string[] | null;
    seniorityFrom: JobSeniority;
    seniorityTo: JobSeniority;
    requiresAttachment: boolean;
    requiresCoverLetter: boolean;
    ukrainianLevel: JobUkrainianLevel | null;
    englishLevel: JobEnglishLevel | null;
    internshipStart: Date | null;
    internshipEnd: Date | null;
    internshipSeason: string | null;
    additionalEmail: string | null;
    closeReason: EmployerJobCloseReason | null;
    closedAt: Date | null;
    createdAt: Date;
    status: EmployerJobStatus;
};

export type GetEmployerJobsDTO = {
    page: number;
    pageSize: number;
};

export type GetEmployerJobsResponse = {
    data: EmployerJobType[];
    total: number;
    totalPages: number;
};

/** the vacancy as the employer fills it in; the same body both creates and edits it */
export type EmployerJobDTO = {
    nameUk: string;
    nameEn: string;
    descriptionUk: string;
    descriptionEn: string;
    minimumSalary: number | null;
    maximumSalary: number | null;
    currency: JobCurrency | null;
    englishLevel: JobEnglishLevel;
    ukrainianLevel: JobUkrainianLevel;
    sectors: string[];
    /** codes from `filterOptions.spheres`, `null` when none is picked */
    spheres: string[] | null;
    /** codes from `onboardingOptions.regions`, `null` for a remote role */
    region: string | null;
    professionalAreas: string[];
    format: string;
    opportunityTypes: string[];
    seniorityFrom: JobSeniority;
    seniorityTo: JobSeniority;
    requiresCoverLetter: boolean;
    requiresAttachment: boolean;
    /** ISO date-time */
    acceptApplicationsUntil: string;
    /** ISO date-time; sent for an internship only, like the end and the season */
    internshipStart: string | null;
    /** ISO date-time */
    internshipEnd: string | null;
    internshipSeason: string | null;
    /** where applications to this vacancy are emailed */
    additionalEmail: string;
};

export type PostEmployerJobDTO = EmployerJobDTO & {
    status: "draft" | "published";
};

/** every field is optional on the API side; the form sends them all */
export type PutEmployerJobDTO = {
    id: number;
    pl: Partial<EmployerJobDTO>;
};

/** a reason is required only to close a vacancy */
export type PatchEmployerJobStatusDTO = { id: number } & (
    | { status: "published" }
    | { status: "closed"; closeReason: EmployerJobCloseReason }
);

/** in the order an application moves through them */
export const EMPLOYER_APPLICATION_STATUSES = ["new", "in_review", "invited", "hired", "not_a_fit"] as const;

export type EmployerApplicationStatus = (typeof EMPLOYER_APPLICATION_STATUSES)[number];

export type EmployerApplicationFile = {
    name: string;
    mimeType: string;
    url: string;
};

export type EmployerApplicationType = {
    id: number;
    createdAt: Date;
    status: EmployerApplicationStatus;
    /** 0–100 */
    score: number;
    job: {
        id: number;
        nameUk: string | null;
        nameEn: string | null;
    };
    user: {
        id: string;
        email: string;
        fullName: string;
        /** a key of `countryRegionCodes` */
        basedCountry: string;
        /** a code from `onboardingOptions.workLocationPreferences` */
        workLocationPreference: string | null;
        opportunityTypes: string[] | null;
        professionalAreas: string[] | null;
        sectors: string[] | null;
        languages: {
            id: number;
            language: string;
            level: UserLanguageType["level"];
        }[];
        workExperiences: {
            id: number;
            title: string;
            company: string;
            startMonth: number;
            startYear: number;
            endMonth: number | null;
            endYear: number | null;
            description: string | null;
        }[];
    };
    cv: EmployerApplicationFile | null;
    attachment: EmployerApplicationFile | null;
    letter: string | null;
};

export type GetEmployerApplicationsDTO = {
    page: number;
    pageSize: number;
    searchString?: string;
    /** every status when left out */
    status?: EmployerApplicationStatus;
};

export type GetEmployerApplicationsResponse = {
    data: EmployerApplicationType[];
    total: number;
    totalPages: number;
};

/**
 * The body depends on the status: "in review" changes nothing for the
 * candidate, every other one emails them, with the employer's address to
 * reply to. An application never goes back to "new".
 */
export type PatchEmployerApplicationStatusDTO = { id: number } & (
    | { status: "in_review" }
    | { status: "invited"; message: string; replyTo: string; bookingLink?: string }
    | { status: "hired"; message: string; replyTo: string }
    | {
          status: "not_a_fit";
          replyTo: string;
          /** whether the candidate is emailed a neutral note; */
          sendShortNote: boolean;
          /** the employer's own line, added to the note */
          message?: string;
      }
);
