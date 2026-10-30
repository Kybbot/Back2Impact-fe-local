import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";

import employerService from "../employer-service";

export const useDeleteEmployerJob = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, number>({
        mutationFn: (id) => employerService.deleteEmployerJob(id),
        async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: queryKeys.employerJobs });
        },
    });
};
