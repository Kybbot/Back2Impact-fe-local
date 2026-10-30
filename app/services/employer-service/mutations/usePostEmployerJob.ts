import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

import type { PostEmployerJobDTO } from "../types";

export const usePostEmployerJob = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, PostEmployerJobDTO>({
        mutationFn: async (pl) => {
            const data = await employerService.postEmployerJob(pl);

            return data;
        },
        // the list, and the dashboard's counters and "on review" notice
        async onSuccess() {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.employerJobs }),
                queryClient.invalidateQueries({ queryKey: queryKeys.employerDashboard }),
            ]);
        },
    });
};
