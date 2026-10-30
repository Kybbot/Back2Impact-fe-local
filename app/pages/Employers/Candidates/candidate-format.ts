import { useT } from "@/i18n/use-t";
import { useLocaleTag } from "@/i18n/use-locale";

import type { EmployerApplicationType } from "@/services/employer-service/types";

type Candidate = EmployerApplicationType["user"];

/** green from 70%, amber from 50%, muted below — the row's colour, not a verdict */
export const getScoreTone = (score: number) => {
    if (score >= 70) return "high";
    if (score >= 50) return "medium";

    return "low";
};

/** "Anna" out of "Anna Smith" — how the emails to the candidate address them */
export const getFirstName = (fullName: string) => fullName.trim().split(/\s+/)[0] || fullName;

/** "85%", in the current locale's percent format */
export const useFormatScore = () => {
    const localeTag = useLocaleTag();

    return (score: number) =>
        new Intl.NumberFormat(localeTag, { style: "percent", maximumFractionDigits: 0 }).format(score / 100);
};

/**
 * Where the candidate would work, put the way an employer reads it. The
 * preference is stored in the candidate's own words ("In Ukraine — I'm here or
 * planning to move"), so whether that means relocating depends on the country
 * they are in now. `detailed` spells out where to — the dialog has the room,
 * the table row doesn't.
 */
export const useWorkLocationLabel = () => {
    const { t } = useT("employers");

    return ({ basedCountry, workLocationPreference }: Candidate, detailed = false) => {
        const isInUkraine = basedCountry === "ukraine";

        switch (workLocationPreference) {
            case "remote":
                return t("candidates.workLocation.remote");
            case "ukraine":
                if (isInUkraine) return t("candidates.workLocation.inUkraine");

                return t(
                    detailed
                        ? "candidates.workLocation.relocateToUkraine"
                        : "candidates.workLocation.relocate",
                );
            case "no_preference":
                return t(
                    isInUkraine ? "candidates.workLocation.inUkraine" : "candidates.workLocation.anywhere",
                );
            default:
                return null;
        }
    };
};
