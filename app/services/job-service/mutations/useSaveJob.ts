import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { queryKeys } from "@/api/query-keys";

import userService from "../../user-service/user-service";
import type { UserData } from "../../user-service/types";

export const useSaveJob = () => {
    const { t } = useT("errors");
    const queryClient = useQueryClient();

    return useMutation<
        { savedCount: number },
        unknown,
        {
            jobId: number;
        }
    >({
        mutationFn: async ({ jobId }) => {
            const data = await userService.postJobSave(jobId);

            return data;
        },
        onSuccess(data) {
            queryClient.setQueryData<UserData | null>(queryKeys.me, (oldData) =>
                oldData ? { ...oldData, savedCount: data.savedCount } : oldData,
            );
            queryClient.invalidateQueries({ queryKey: queryKeys.defaultJobs });
            queryClient.invalidateQueries({ queryKey: queryKeys.userJobs });
        },
        onError() {
            toast.error(t("generic.tryAgainSoon"));
        },
    });
};
