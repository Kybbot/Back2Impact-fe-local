import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { AddUserEducationBodyType } from "../../../../services/user-service/types";

export const useAddUserEducation = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ body }: { body: AddUserEducationBodyType }) => {
            const data = await userService.addUserEducation(body);

            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-education"] });

            toast.success(t("experience.toast.education.added"));
        },
    });
};
