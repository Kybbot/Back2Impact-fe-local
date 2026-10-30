import type { UserData } from "../services/user-service/types";

export type Company = NonNullable<UserData["company"]>;

const R2_URL = import.meta.env.VITE_R2_URL;

/**
 * Everything a candidate reads about the company on a vacancy. Until it is all
 * filled in (setup can be skipped) the employer has nothing to post vacancies
 * under, so the vacancy pages stay hidden.
 */
export const isCompanyComplete = (company: UserData["company"]) =>
    !!company?.name &&
    !!company.sectors?.length &&
    !!company.descriptionUk &&
    !!company.descriptionEn &&
    !!company.website;

export const getCompanyLogoUrl = (logoKey: string | null) => (logoKey ? `${R2_URL}/${logoKey}` : null);

/** "Ukraine Global Scholars" → "UGS", the stand-in while there is no logo */
export const getCompanyInitials = (name: string | null | undefined) =>
    (name ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .map((word) => Array.from(word)[0])
        .join("")
        .toUpperCase();

/** "https://ugs.foundation/" → "ugs.foundation" */
export const formatWebsite = (website: string) => website.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** "11-50" → "11–50" */
export const formatCompanySize = (size: string) => size.replace("-", "–");
