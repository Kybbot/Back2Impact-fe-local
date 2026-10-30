import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { AddUserProjectBodyType } from "../../../../services/user-service/types";

export const useEditUserProject = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, body }: { id: string; body: AddUserProjectBodyType }) => {
            const data = await userService.editUserProject(id, body);

            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-projects"] });

            toast.success(t("experience.toast.projects.updated"));
        },
    });
};
