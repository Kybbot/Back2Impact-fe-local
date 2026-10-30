import { useId, useState } from "react";

import { useT } from "@/i18n/use-t";
import { useLocalized } from "@/i18n/pick-localized";

import type { EmployerDashboard } from "@/services/employer-service/types";

import { useFormatShortDate } from "@/utils/date";

export type ExpiringJob = EmployerDashboard["expiringJobs"][number];

type Props = {
    /** at least one */
    jobs: ExpiringJob[];
    onExtend: (job: ExpiringJob) => void;
};

/** a single vacancy stands on its own; more get a header with the count and show the first one until expanded */
function ExpiringJobs({ jobs, onExtend }: Props) {
    const { t } = useT("employers");
    const localized = useLocalized();
    const formatDate = useFormatShortDate();

    const listId = useId();
    const [isExpanded, setIsExpanded] = useState(false);

    const hasMore = jobs.length > 1;
    const visibleJobs = isExpanded ? jobs : jobs.slice(0, 1);

    return (
        <section className="employer-dashboard__card employer-dashboard__expiring">
            {hasMore && (
                <div className="employer-dashboard__expiring-header">
                    <h2 className="employer-dashboard__notice-heading">
                        {t("dashboard.expiring.heading", { count: jobs.length })}
                    </h2>
                    <button
                        type="button"
                        aria-controls={listId}
                        aria-expanded={isExpanded}
                        className="employer-dashboard__edit-btn"
                        onClick={() => setIsExpanded((prev) => !prev)}
                    >
                        {t(isExpanded ? "dashboard.expiring.hide" : "dashboard.expiring.showAll")}
                    </button>
                </div>
            )}
            <ul id={listId} className="employer-dashboard__expiring-list">
                {visibleJobs.map((job) => (
                    <li key={job.id} className="employer-dashboard__expiring-item">
                        <div className="employer-dashboard__notice-text">
                            <p className="employer-dashboard__notice-heading">
                                {localized(job, "name") || t("vacancies.table.untitled")}
                            </p>
                            <p className="employer-dashboard__muted">
                                {t("dashboard.expiring.expiresAt", { date: formatDate(job.expiresAt) })}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onExtend(job)}
                            className="employer-dashboard__notice-btn"
                        >
                            {t("dashboard.expiring.extend")}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default ExpiringJobs;
