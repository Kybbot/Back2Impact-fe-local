import VacancyActionsMenu from "./vacancy-actions-menu";

import { useT } from "@/i18n/use-t";
import { useOptionLabel } from "@/i18n/options";
import { useLocaleTag } from "@/i18n/use-locale";
import { useLocalized } from "@/i18n/pick-localized";

import type { EmployerJobStatus, EmployerJobType } from "@/services/employer-service/types";

import { useFormatShortDate } from "@/utils/date";

type Props = {
    jobs: EmployerJobType[];
    /** the previous page, still on screen while the requested one loads */
    isStale: boolean;
    onEdit: (job: EmployerJobType) => void;
    onDuplicate: (job: EmployerJobType) => void;
    onReopen: (job: EmployerJobType) => void;
    onClose: (job: EmployerJobType) => void;
    onDelete: (job: EmployerJobType) => void;
};

const EMPTY = "—";

/** never went live, so there is nothing counted and no closing date yet */
const NOT_LIVE: EmployerJobStatus[] = ["draft", "pending_review", "rejected"];

function VacanciesTable({ jobs, isStale, onEdit, onDuplicate, onReopen, onClose, onDelete }: Props) {
    const { t } = useT("employers");
    const localized = useLocalized();
    const localeTag = useLocaleTag();
    const optionLabel = useOptionLabel();

    const formatDate = useFormatShortDate();

    const formatNumber = (value: number) => new Intl.NumberFormat(localeTag).format(value);

    const onAction = {
        continue: onEdit,
        edit: onEdit,
        duplicate: onDuplicate,
        reopen: onReopen,
        close: onClose,
        delete: onDelete,
    };

    /** "Full-time · Hybrid, Kyiv", or "not finished" while none of it is filled in */
    const getMeta = (job: EmployerJobType) => {
        const types = job.opportunityTypes.map((type) => optionLabel("opportunityTypes", type)).join(", ");
        const format = job.format && optionLabel("filters.workFormats", job.format);
        const region = job.location && optionLabel("onboarding.regions", job.location);
        const place = [format, region].filter(Boolean).join(", ");

        return [types, place].filter(Boolean).join(" · ") || t("vacancies.table.notFinished");
    };

    const getClosingDate = (job: EmployerJobType) => {
        const date = job.status === "closed" ? job.closedAt : job.expiresAt;

        return date ? formatDate(date) : EMPTY;
    };

    return (
        <table
            className={`employer-vacancies__table ${isStale ? "employer-vacancies__table_stale" : ""}`}
            aria-busy={isStale}
        >
            <thead className="employer-vacancies__thead">
                <tr>
                    <th className="employer-vacancies__th" scope="col">
                        {t("vacancies.table.vacancy")}
                    </th>
                    <th className="employer-vacancies__th" scope="col">
                        {t("vacancies.table.status")}
                    </th>
                    <th className="employer-vacancies__th" scope="col">
                        {t("vacancies.table.views")}
                    </th>
                    <th className="employer-vacancies__th" scope="col">
                        {t("vacancies.table.candidates")}
                    </th>
                    <th className="employer-vacancies__th" scope="col">
                        {t("vacancies.table.closes")}
                    </th>
                    <th className="employer-vacancies__th" scope="col">
                        <span className="visually-hidden">{t("vacancies.table.actions")}</span>
                    </th>
                </tr>
            </thead>
            <tbody className="employer-vacancies__tbody">
                {jobs.map((job) => {
                    const isLive = !NOT_LIVE.includes(job.status);

                    return (
                        <tr key={job.id} className="employer-vacancies__row">
                            <td className="employer-vacancies__td employer-vacancies__td_name">
                                <p className="employer-vacancies__name">
                                    {localized(job, "name") || t("vacancies.table.untitled")}
                                </p>
                                <p className="employer-vacancies__meta">{getMeta(job)}</p>
                            </td>
                            <td className="employer-vacancies__td employer-vacancies__td_status">
                                <span
                                    className={`employer-vacancies__status employer-vacancies__status_${job.status}`}
                                >
                                    {t(`vacancies.status.${job.status}`)}
                                </span>
                            </td>
                            <td className="employer-vacancies__td" data-label={t("vacancies.table.views")}>
                                {isLive ? formatNumber(job.viewsCount) : EMPTY}
                            </td>
                            <td
                                className="employer-vacancies__td"
                                data-label={t("vacancies.table.candidates")}
                            >
                                {isLive ? formatNumber(job.applicationsCount) : EMPTY}
                            </td>
                            <td className="employer-vacancies__td" data-label={t("vacancies.table.closes")}>
                                {isLive ? getClosingDate(job) : EMPTY}
                            </td>
                            <td className="employer-vacancies__td employer-vacancies__td_actions">
                                <VacancyActionsMenu job={job} onAction={onAction} />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default VacanciesTable;
