import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { AddUserWorkExperienceBodyType } from "../../../../services/user-service/types";

export const useEditUserWorkExperience = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, body }: { id: string; body: AddUserWorkExperienceBodyType }) => {
            const data = await userService.editUserWorkExperience(id, body);

            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-work-experience"] });

            toast.success(t("experience.toast.work.updated"));
        },
    });
};
