import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

import type { PatchEmployerApplicationStatusDTO } from "../types";

export const usePatchApplicationStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, PatchEmployerApplicationStatusDTO>({
        mutationFn: (pl) => employerService.patchApplicationStatus(pl),
        // the list, and the dashboard's "+N new", which counts applications still in "new"
        async onSuccess() {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.employerApplications }),
                queryClient.invalidateQueries({ queryKey: queryKeys.employerDashboard }),
            ]);
        },
    });
};
