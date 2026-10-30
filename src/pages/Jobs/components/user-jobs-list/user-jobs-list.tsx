import { useInView } from "react-intersection-observer";
import { useUserJobsInfinite } from "../../../../hooks/use-user-jobs-infinite";
import Job from "../job/job";
import SkeletonJobsList from "../skeleton-jobs-list/skeleton-jobs-list";
import { useEffect } from "react";
import NoJobsFoundBlock from "../no-jobs-found-block/no-jobs-found-block";
import { useIsLoggedIn } from "../../../../hooks/useCurrentUser";
import { useT } from "../../../../i18n/use-t";
import type { JobFilters, JobListType } from "@/types/jobs";

type Props = {
    className?: string;
    jobsType: "saved" | "applied";
    searchString: string;
    filters: JobFilters;
    onApplyClick: (job: JobListType) => void;
    onBrowseJobsClick: () => void;
};

function UserJobsList({
    className,
    jobsType,
    searchString,
    filters,
    onApplyClick,
    onBrowseJobsClick,
}: Props) {
    const { t } = useT("jobs");
    const { t: tErrors } = useT("errors");
    const isLoggedIn = useIsLoggedIn();
    const { data, isLoading, isFetchingNextPage, isError, hasNextPage, fetchNextPage } = useUserJobsInfinite({
        filters,
        type: jobsType,
        searchString,
    });
    const { ref: bottomElementRef, inView } = useInView({ threshold: 0 });
    //    const showRefetchLoader = useDelayedLoading(isLoading, 300);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) return <SkeletonJobsList className={className} />;
    if (isError) return <p>{tErrors("generic.short")}</p>;

    const jobsTotal = data?.pages[0].total;
    const noJobsHeading = t(`empty.${jobsType}.heading`);
    const noJobsDescription = t(`empty.${jobsType}.description`);

    return (
        <div className={`user-jobs-list ${className ?? ""}`}>
            {jobsTotal !== 0 ? (
                <div className="default-jobs-list__header">
                    {jobsTotal !== 0 && (
                        <p className="default-jobs-list__total-jobs">
                            {t("totalVacancies", { count: jobsTotal ?? 0 })}
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <NoJobsFoundBlock
                        className="default-jobs-list__no-jobs-found-block"
                        heading={noJobsHeading}
                        description={noJobsDescription}
                        buttonStr={t("empty.browseAll")}
                        onClick={onBrowseJobsClick}
                    />
                </>
            )}
            {data?.pages
                .flatMap((i) => i.data)
                .map((i) => (
                    <Job
                        key={i.id}
                        job={i}
                        type={jobsType}
                        isAuthorized={isLoggedIn}
                        onApplyClick={onApplyClick}
                    />
                ))}
            <p ref={bottomElementRef}></p>
            {isFetchingNextPage && <p>{t("loadingMore")}</p>}
        </div>
    );
}

export default UserJobsList;
