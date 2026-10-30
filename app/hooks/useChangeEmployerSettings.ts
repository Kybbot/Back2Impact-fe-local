import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useT } from "@/i18n/use-t";
import { queryKeys } from "@/api/query-keys";
import userService from "@/services/user-service/user-service";

import type { UserData, ChangeEmployerSettingsBodyType } from "@/services/user-service/types";

type Options = {
    silent?: boolean;
};

/**
 * The employer's preferences as the endpoint takes them. `me` carries them
 * nullable, so an unset one falls back to what the settings page shows by default.
 */
export const getEmployerSettings = (user: UserData): ChangeEmployerSettingsBodyType => ({
    language: user.language,
    whenApplies: user.whenApplies ?? "email_straight_away",
    emailWhenVacancyPassesReview: user.emailWhenVacancyPassesReview ?? false,
    emailWhenVacancyIsAboutToExpire: user.emailWhenVacancyIsAboutToExpire ?? false,
    emailWeeklySummary: user.emailWeeklySummary ?? false,
    additionalEmail: user.additionalEmail,
});

/** the employer counterpart of `useChangeUserSettings`; the fields live in `me` only */
export const useChangeEmployerSettings = ({ silent = false }: Options = {}) => {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ body }: { body: ChangeEmployerSettingsBodyType }) => {
            const data = await userService.changeEmployerSettings(body);

            return data;
        },
        onMutate: ({ body }) => {
            const previousMe = queryClient.getQueryData<UserData | null>(queryKeys.me);

            queryClient.setQueryData<UserData | null>(queryKeys.me, (oldData) =>
                oldData ? { ...oldData, ...body } : oldData,
            );

            return { previousMe };
        },
        onSuccess: () => {
            if (!silent) toast.success(t("settings.saved"));
        },
        onError: (_error, _variables, context) => {
            if (context?.previousMe) queryClient.setQueryData(queryKeys.me, context.previousMe);

            toast.error(tErrors("generic.tryAgainSoon"));
        },
    });
};
