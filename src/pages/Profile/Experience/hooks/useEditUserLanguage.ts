import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { AddUserLanguageBodyType, GetUserLanguagesType } from "../../../../services/user-service/types";

type Payload = {
    index: number;
    languages: GetUserLanguagesType;
    body: AddUserLanguageBodyType[number];
};

export const useEditUserLanguage = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ index, languages, body }: Payload) => {
            const result = await userService.editUserLanguage(
                languages.map((item, itemIndex) => (itemIndex === index ? body : item)),
            );

            return result;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-languages"] });

            toast.success(t("experience.toast.languages.updated"));
        },
    });
};
