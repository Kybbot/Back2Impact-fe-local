import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useDefaultJobsInfinite } from "../../../../hooks/use-default-jobs-infinite";
import Job from "../job/job";
import SkeletonJobsList from "../skeleton-jobs-list/skeleton-jobs-list";
import NoVacanciesFoundBlock from "../no-jobs-found-block/no-jobs-found-block";
import { useIsLoggedIn } from "../../../../hooks/useCurrentUser";
import { useT } from "../../../../i18n/use-t";
import type { GetAllJobsListType, JobFilters, JobListType } from "@/types/jobs";

type Props = {
    className?: string;
    sortType: "all" | "for_you";
    searchString: string;
    filters: JobFilters;
    /** page rendered on the server, used to seed the query cache */
    initialPage?: GetAllJobsListType;
    /** which page that was — `/jobs/all?page=N` is a crawlable URL */
    initialPageNumber?: number;
    /**
     * When set, a real `<a href="…?page=N+1">` is rendered after the list.
     * Infinite scroll is what a sighted visitor uses, so the anchor is hidden
     * from sight (see assets/styles/widgets/default-jobs-list.css) but kept in
     * the DOM: it is what a crawler
     * follows, since scrolling never happens for one.
     */
    paginationPath?: string;
    onApplyClick: (job: JobListType) => void;
    onClearFiltersClick: () => void;
};

function DefaultJobsList({
    className,
    sortType,
    searchString,
    filters,
    initialPage,
    initialPageNumber = 1,
    paginationPath,
    onApplyClick,
    onClearFiltersClick,
}: Props) {
    const { t } = useT("jobs");
    const { t: tErrors } = useT("errors");
    const isLoggedIn = useIsLoggedIn();
    const { data, isLoading, isFetchingNextPage, isError, hasNextPage, fetchNextPage } =
        useDefaultJobsInfinite(
            {
                sortType,
                searchString,
                filters,
            },
            initialPage,
            initialPageNumber,
        );
    const { ref: bottomElementRef, inView } = useInView({ threshold: 0 });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) return <SkeletonJobsList className={className} />;
    if (isError) return <p>{tErrors("generic.short")}</p>;

    const jobsTotal = data?.pages[0].total;
    const lastPageParam = (data?.pageParams.at(-1) as number | undefined) ?? initialPageNumber;
    const nextPageNumber = lastPageParam + 1;
    const filtersAreEmpty =
        Object.keys(filters).reduce((_, curr) => filters[curr as keyof typeof filters].length, 0) === 0;

    return (
        <div className={`default-jobs-list ${className ?? ""}`}>
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
                    {filtersAreEmpty ? (
                        <NoVacanciesFoundBlock
                            className="default-jobs-list__no-jobs-found-block"
                            heading={t("empty.noResults.heading")}
                            description={t("empty.noResults.description")}
                            buttonStr={t("empty.noResults.action")}
                            onClick={onClearFiltersClick}
                        />
                    ) : (
                        <p className="default-jobs-list__no-jobs-str">{t("empty.noResults.heading")}</p>
                    )}
                </>
            )}
            {data?.pages
                .flatMap((i) => i.data)
                .map((i) => (
                    <Job
                        key={i.id}
                        job={i}
                        type="default"
                        isAuthorized={isLoggedIn}
                        onApplyClick={onApplyClick}
                    />
                ))}
            <p ref={bottomElementRef}></p>
            {isFetchingNextPage && <p>{t("loadingMore")}</p>}
            {paginationPath && hasNextPage && (
                <a
                    className="default-jobs-list__next-page-link"
                    rel="next"
                    href={`${paginationPath}?page=${nextPageNumber}`}
                >
                    {t("showMore")}
                </a>
            )}
        </div>
    );
}

export default DefaultJobsList;
