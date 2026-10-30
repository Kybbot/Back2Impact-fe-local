import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { AddUserLanguageBodyType, GetUserLanguagesType } from "../../../../services/user-service/types";

type Payload = {
    languages: GetUserLanguagesType;
    body: AddUserLanguageBodyType[number];
};

export const useAddUserLanguage = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ languages, body }: Payload) => {
            const result = await userService.editUserLanguage([...languages, body]);

            return result;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-languages"] });

            toast.success(t("experience.toast.languages.added"));
        },
    });
};
