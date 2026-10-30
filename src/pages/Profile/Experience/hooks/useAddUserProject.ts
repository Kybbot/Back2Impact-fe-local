import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { AddUserProjectBodyType } from "../../../../services/user-service/types";

export const useAddUserProject = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ body }: { body: AddUserProjectBodyType }) => {
            const data = await userService.addUserProject(body);

            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-projects"] });

            toast.success(t("experience.toast.projects.added"));
        },
    });
};
