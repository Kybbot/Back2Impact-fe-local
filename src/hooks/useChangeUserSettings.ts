import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useT } from "@/i18n/use-t";
import { queryKeys } from "@/api/query-keys";
import userService from "@/services/user-service/user-service";

import type {
    UserData,
    GetUserSettingsType,
    ChangeUserSettingsBodyType,
} from "@/services/user-service/types";

type Options = {
    silent?: boolean;
};

export const useChangeUserSettings = ({ silent = false }: Options = {}) => {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ body }: { body: ChangeUserSettingsBodyType }) => {
            const data = await userService.changeUserSettings(body);

            return data;
        },
        onMutate: ({ body }) => {
            const previousSettings = queryClient.getQueryData<GetUserSettingsType>(queryKeys.userSettings);
            const previousMe = queryClient.getQueryData<UserData | null>(queryKeys.me);

            queryClient.setQueryData<GetUserSettingsType>(queryKeys.userSettings, (oldData) =>
                oldData ? { ...oldData, ...body } : oldData,
            );

            queryClient.setQueryData<UserData | null>(queryKeys.me, (oldData) =>
                oldData ? { ...oldData, ...body } : oldData,
            );

            return { previousSettings, previousMe };
        },
        onSuccess: () => {
            if (!silent) toast.success(t("settings.saved"));
        },
        onError: (_error, _variables, context) => {
            if (context?.previousSettings) {
                queryClient.setQueryData(queryKeys.userSettings, context.previousSettings);
            }

            if (context?.previousMe) {
                queryClient.setQueryData(queryKeys.me, context.previousMe);
            }

            toast.error(tErrors("generic.tryAgainSoon"));
        },
    });
};
