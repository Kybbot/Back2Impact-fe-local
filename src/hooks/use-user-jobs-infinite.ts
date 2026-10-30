import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import jobService from "../services/job-service/job-service";
import type { JobFilters } from "@/types/jobs";

type Payload = {
    type: "saved" | "applied";
    searchString: string;
    filters: JobFilters;
};

const PAGE_SIZE = 10;

export const useUserJobsInfinite = (pl: Payload) => {
    return useInfiniteQuery({
        queryKey: [...queryKeys.userJobs, pl],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) =>
            jobService.getUserJobs({
                page: pageParam,
                pageSize: PAGE_SIZE,
                type: pl.type,
                tab: pl.type,
                searchString: pl.searchString,
                ...pl.filters,
            }),
        getNextPageParam: (lastPage, pages) => {
            if (!lastPage.hasNextPage) return undefined;

            return pages.length + 1;
        },
        staleTime: 1000 * 60,
        //     placeholderData: p => p
    });
};
