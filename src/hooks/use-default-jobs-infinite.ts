import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import jobService from "../services/job-service/job-service";
import type { GetAllJobsListType, JobFilters } from "@/types/jobs";

type Payload = {
    sortType: "all" | "for_you";
    searchString: string;
    filters: JobFilters;
};

export const JOBS_PAGE_SIZE = 10;

const PAGE_SIZE = JOBS_PAGE_SIZE;

const isDefaultQuery = (pl: Payload) =>
    pl.searchString === "" && Object.values(pl.filters).every((values) => values.length === 0);

/**
 * `initialPage` is the page rendered on the server. It is seeded into the
 * cache only when the current payload matches what the loader asked for —
 * `initialData` is tied to the hook call, not to the query key, so without
 * this check the unfiltered server data would leak into a filtered query.
 *
 * `initialPageNumber` is which page that was: `/jobs/all?page=N` is a real,
 * crawlable URL, so the server render does not always start at page 1.
 */
export const useDefaultJobsInfinite = (
    pl: Payload,
    initialPage?: GetAllJobsListType,
    initialPageNumber = 1,
) => {
    const seed =
        initialPage && isDefaultQuery(pl)
            ? { pages: [initialPage], pageParams: [initialPageNumber] }
            : undefined;

    return useInfiniteQuery({
        queryKey: [...queryKeys.defaultJobs, pl, initialPageNumber],
        initialPageParam: initialPageNumber,
        queryFn: async ({ pageParam }) =>
            jobService.getDefaultJobs({
                page: pageParam,
                tab: pl.sortType,
                pageSize: PAGE_SIZE,
                sortType: pl.sortType,
                searchString: pl.searchString,
                ...pl.filters,
            }),
        // counted from the last page actually fetched rather than from the
        // number of pages held, which would be wrong when the first one is N
        getNextPageParam: (lastPage, _pages, lastPageParam) => {
            if (!lastPage.hasNextPage) return undefined;

            return lastPageParam + 1;
        },
        placeholderData: keepPreviousData,
        // the loader forwards the visitor's cookies, so the page is already
        // theirs — score / isSaved / isApplied included
        initialData: seed,
        staleTime: 1000 * 60,
        //placeholderData: p => p,
    });
};
