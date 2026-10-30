import { useState } from "react";

import ExpiringJobs, { type ExpiringJob } from "./expiring-jobs";
import DeadlineDialog from "../vacancy-form/deadline-dialog";

import { useT } from "@/i18n/use-t";
import { useLocalized } from "@/i18n/pick-localized";
import { useLocaleTag } from "@/i18n/use-locale";

import ErrorBlock from "@/components/shared/error-block/error-block";
import LoaderBlock from "@/components/shared/loader-block/loader-block";

import { useEmployerDashboard } from "@/services/employer-service";

function DashboardStats() {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const localized = useLocalized();
    const localeTag = useLocaleTag();

    const { data, isPending, isError } = useEmployerDashboard();

    const [extending, setExtending] = useState<ExpiringJob | null>(null);

    if (isPending) return <LoaderBlock className="loader-block--blue employer-dashboard__loader" />;
    if (isError) return <ErrorBlock message={tErrors("generic.reload")} />;

    const formatNumber = (value: number) => new Intl.NumberFormat(localeTag).format(value);

    const pendingJobName = localized(data, "jobInPendingName");

    return (
        <>
            <div className="employer-dashboard__stats">
                <div className="employer-dashboard__card employer-dashboard__stat">
                    <p className="employer-dashboard__stat-value">{formatNumber(data.publishedJobs)}</p>
                    <p className="employer-dashboard__stat-label">{t("dashboard.stats.publishedJobs")}</p>
                </div>
                <div className="employer-dashboard__card employer-dashboard__stat">
                    <p className="employer-dashboard__stat-value">
                        {formatNumber(data.applicationsCount)}
                        {data.newApplicationsCount > 0 && (
                            <span className="employer-dashboard__stat-new">
                                {t("dashboard.stats.new", { count: data.newApplicationsCount })}
                            </span>
                        )}
                    </p>
                    <p className="employer-dashboard__stat-label">{t("dashboard.stats.applications")}</p>
                </div>
                <div className="employer-dashboard__card employer-dashboard__stat">
                    <p className="employer-dashboard__stat-value">{formatNumber(data.totalViewsCount)}</p>
                    <p className="employer-dashboard__stat-label">{t("dashboard.stats.vacancyViews")}</p>
                </div>
            </div>

            {pendingJobName && (
                <div className="employer-dashboard__card employer-dashboard__notice" role="status">
                    <span className="employer-dashboard__notice-emoji" aria-hidden="true">
                        ⏳
                    </span>
                    <div className="employer-dashboard__notice-text">
                        <p className="employer-dashboard__notice-heading">
                            {t("dashboard.pending.heading", { name: pendingJobName })}
                        </p>
                        <p className="employer-dashboard__muted">{t("dashboard.pending.description")}</p>
                    </div>
                </div>
            )}

            {data.expiringJobs.length > 0 && (
                <ExpiringJobs jobs={data.expiringJobs} onExtend={setExtending} />
            )}

            {extending && (
                <DeadlineDialog action="extend" job={extending} onClose={() => setExtending(null)} />
            )}
        </>
    );
}

export default DashboardStats;
