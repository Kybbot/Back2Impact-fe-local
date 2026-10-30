import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

import userService from "../user-service";
import type { PostJobApplyDTO } from "../types";

export const usePostJobApply = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, PostJobApplyDTO>({
        mutationFn: async (pl) => {
            const data = await userService.postJobApply(pl);

            return data;
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: queryKeys.defaultJobs });
            queryClient.invalidateQueries({ queryKey: queryKeys.userJobs });
        },
    });
};
