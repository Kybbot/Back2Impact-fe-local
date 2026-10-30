import type { JobEnglishLevel } from "@/services/employer-service/types";

export type JobCurrency = "USD per month" | "EUR per month" | "UAH per month" | "USD per project" | "Unpaid";

export type JobFilters = {
    professionalAreas: string[];
    spheres: string[];
    workFormats: string[];
    employmentTypes: string[];
    seniorityLevels: string[];
};

export type FetchJobsDTO = {
    searchString: string;
    page: number;
    pageSize: number;
    professionalAreas: string[];
    spheres: string[];
    employmentTypes: string[];
    seniorityLevels: string[];
    sortType: "all" | "for_you";
    workFormats: string[];
    tab: "all" | "for_you" | "saved" | "applied";
};

export type GetUserJobsDTO = {
    type: "saved" | "applied";
    searchString: string;
    page: number;
    pageSize: number;
    professionalAreas: string[];
    spheres: string[];
    employmentTypes: string[];
    seniorityLevels: string[];
    workFormats: string[];
    tab: "all" | "for_you" | "saved" | "applied";
};

export type JobListType = {
    score?: number;
    id: number;
    nameUk: string;
    nameEn: string;
    companyName: string;
    companyLogoUrl: string | null;
    minimumSalary?: number | null;
    maximumSalary?: number | null;
    format: string;
    opportunityTypes: string[];
    seniorityFrom: "entry" | "junior" | "middle" | "senior" | "top_management";
    seniorityTo: "entry" | "junior" | "middle" | "senior" | "top_management";
    createdAt: Date;
    isSaved?: boolean | null;
    isApplied?: boolean | null;
    applyStatus: "new" | "in_review" | "invited" | "hired" | "not_a_fit" | null;
    isArchived?: boolean;
    currency: JobCurrency | null;
    internshipStart: Date | null; // iso string
    internshipEnd: Date | null; // iso string
    internshipSeason: string | null;
    englishLevel: JobEnglishLevel | null;
    ukrainianLevel: JobEnglishLevel | null;
};

export type GetAllJobsListType = {
    data: JobListType[];
    total: number;
    hasNextPage: boolean;
};

export type GetOneJobType = {
    score?: number;
    id: number;
    nameUk: string;
    nameEn: string;
    descriptionUk: string;
    descriptionEn: string;
    minimumSalary?: number | null;
    maximumSalary?: number | null;
    companyName: string;
    companyWebsite: string;
    companyHeadquartes: string | null;
    companySize: string | null;
    companyDescriptionUk: string | null;
    companyDescriptionEn: string | null;
    companyLogoUrl: string | null;
    format: string;
    sectors: string[];
    region: string;
    opportunityTypes: string[];
    professionalAreas: string[];
    spheres: string[];
    seniorityFrom: string;
    seniorityTo: string;
    createdAt: Date;
    isArchived: boolean;
    isSaved: boolean;
    isApplied: boolean;
    applyStatus: "new" | "in_review" | "invited" | "hired" | "not_a_fit";
    currency: JobCurrency | null;
    requiresCoverLetter: boolean;
    requiresAttachment: boolean;
    internshipStart: Date | null; // iso string
    internshipEnd: Date | null; // iso string
    internshipSeason: string | null;
    englishLevel: JobEnglishLevel | null;
    ukrainianLevel: JobEnglishLevel | null;
};
