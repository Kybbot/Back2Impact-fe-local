import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

import type { PatchEmployerJobStatusDTO } from "../types";

export const usePatchEmployerJobStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, PatchEmployerJobStatusDTO>({
        mutationFn: (pl) => employerService.patchEmployerJobStatus(pl),
        // the list, and the dashboard's counters and "on review" notice
        async onSuccess() {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.employerJobs }),
                queryClient.invalidateQueries({ queryKey: queryKeys.employerDashboard }),
            ]);
        },
    });
};
