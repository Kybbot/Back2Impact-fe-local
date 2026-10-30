import { queryKeys } from "@/api/query-keys";
import type { JobFilters } from "@/types/jobs";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";

type ChangeJob = {
    id: number;
    isSaved: boolean;
    isApplied: boolean;
};

type Page = {
    data: ChangeJob[];
    hasNextPage: boolean;
};

type Payload = {
    queryClient: QueryClient;
    jobId: number;
    field: "isSaved" | "isApplied";
    filters: JobFilters;
    searchString: string;
};

export const toggleJob = ({ field, filters, searchString, jobId, queryClient }: Payload) => {
    const callBack = (oldData: InfiniteData<Page> | undefined) => {
        if (!oldData) return oldData;

        return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
                ...page,
                data: page.data.map((j) => (j.id === jobId ? { ...j, [field]: !j[field] } : j)),
            })),
        };
    };

    queryClient.setQueryData(["defaultJobs", { filters, sortType: "all", searchString }], callBack);
    queryClient.setQueryData(["defaultJobs", { filters, sortType: "for_you", searchString }], callBack);
    queryClient.setQueryData(["userJobs", { filters, type: "applied", searchString }], callBack);
    queryClient.setQueryData(["userJobs", { filters, type: "saved", searchString }], callBack);

    // setQueryData marks these entries fresh again, undoing the mutation's own invalidation,
    // and flipping a flag cannot add a job to the saved / applied list or drop it from there
    queryClient.invalidateQueries({ queryKey: queryKeys.userJobs });
};
