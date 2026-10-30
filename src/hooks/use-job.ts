import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys";
import jobService from "../services/job-service/job-service";
import type { GetOneJobType } from "@/types/jobs";

export const jobQueryKey = (id: string) => queryKeys.jobById(id);

/**
 * `initialJob` is the vacancy rendered on the server. The loader forwards the
 * visitor's cookies, so it already carries their
 * score / isSaved / isApplied / applyStatus.
 */
export const useJob = (id?: string, initialJob?: GetOneJobType | null) =>
    useQuery({
        queryKey: jobQueryKey(id ?? ""),
        queryFn: async () => await jobService.getOneJob(id!),

        enabled: !!id,
        staleTime: 1000 * 60,
        initialData: initialJob ?? undefined,
    });
