import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

import type { PutEmployerJobDTO } from "../types";

export const usePutEmployerJob = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, PutEmployerJobDTO>({
        mutationFn: async (pl) => {
            const data = await employerService.putEmployerJob(pl);

            return data;
        },
        // the list, and the dashboard's "on review" notice and expiring vacancies, which carry the name
        async onSuccess() {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.employerJobs }),
                queryClient.invalidateQueries({ queryKey: queryKeys.employerDashboard }),
            ]);
        },
    });
};
