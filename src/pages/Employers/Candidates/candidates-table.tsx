import { useT } from "@/i18n/use-t";
import { useCountryLabel } from "@/i18n/options";
import { useLocalized } from "@/i18n/pick-localized";

import { getScoreTone, useFormatScore, useWorkLocationLabel } from "./candidate-format";

import type { EmployerApplicationType } from "@/services/employer-service/types";

import { useFormatShortDate } from "@/utils/date";

type Props = {
    applications: EmployerApplicationType[];
    /** the previous page or filter, still on screen while the requested one loads */
    isStale: boolean;
    onView: (application: EmployerApplicationType) => void;
};

function CandidatesTable({ applications, isStale, onView }: Props) {
    const { t } = useT("employers");
    const localized = useLocalized();
    const countryLabel = useCountryLabel();
    const formatDate = useFormatShortDate();
    const formatScore = useFormatScore();
    const workLocationLabel = useWorkLocationLabel();

    /** "Germany · Ready to relocate" */
    const getMeta = ({ user }: EmployerApplicationType) =>
        [countryLabel(user.basedCountry, false), workLocationLabel(user)].filter(Boolean).join(" · ");

    return (
        <table
            className={`employer-candidates__table ${isStale ? "employer-candidates__table_stale" : ""}`}
            aria-busy={isStale}
        >
            <thead className="employer-candidates__thead">
                <tr>
                    <th className="employer-candidates__th" scope="col">
                        {t("candidates.table.candidate")}
                    </th>
                    <th className="employer-candidates__th" scope="col">
                        {t("candidates.table.vacancy")}
                    </th>
                    <th className="employer-candidates__th" scope="col">
                        {t("candidates.table.match")}
                    </th>
                    <th className="employer-candidates__th" scope="col">
                        {t("candidates.table.applied")}
                    </th>
                    <th className="employer-candidates__th" scope="col">
                        {t("candidates.table.status")}
                    </th>
                    <th className="employer-candidates__th" scope="col">
                        <span className="visually-hidden">{t("candidates.table.actions")}</span>
                    </th>
                </tr>
            </thead>
            <tbody className="employer-candidates__tbody">
                {applications.map((application) => (
                    <tr key={application.id} className="employer-candidates__row">
                        <td className="employer-candidates__td employer-candidates__td_name">
                            <p className="employer-candidates__name">{application.user.fullName}</p>
                            <p className="employer-candidates__meta">{getMeta(application)}</p>
                        </td>
                        <td
                            className="employer-candidates__td employer-candidates__td_vacancy"
                            data-label={t("candidates.table.vacancy")}
                        >
                            {localized(application.job, "name") || t("vacancies.table.untitled")}
                        </td>
                        <td
                            className={`employer-candidates__td employer-candidates__score employer-candidates__score_${getScoreTone(application.score)}`}
                            data-label={t("candidates.table.match")}
                        >
                            {formatScore(application.score)}
                        </td>
                        <td className="employer-candidates__td" data-label={t("candidates.table.applied")}>
                            {formatDate(application.createdAt)}
                        </td>
                        <td className="employer-candidates__td" data-label={t("candidates.table.status")}>
                            <span
                                className={`employer-candidates__status employer-candidates__status_${application.status}`}
                            >
                                {t(`candidates.status.${application.status}`)}
                            </span>
                        </td>
                        <td className="employer-candidates__td employer-candidates__td_actions">
                            <button
                                type="button"
                                className="employer-candidates__view"
                                onClick={() => onView(application)}
                            >
                                {t("candidates.table.view")}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default CandidatesTable;
