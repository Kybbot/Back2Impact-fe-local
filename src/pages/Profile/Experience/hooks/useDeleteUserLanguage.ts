import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { GetUserLanguagesType } from "../../../../services/user-service/types";

type Payload = {
    index: number;
    languages: GetUserLanguagesType;
};

export const useDeleteUserLanguage = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ index, languages }: Payload) => {
            const result = await userService.editUserLanguage(
                languages.filter((_, itemIndex) => itemIndex !== index),
            );

            return result;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-languages"] });

            toast.success(t("experience.toast.languages.deleted"));
        },
    });
};
