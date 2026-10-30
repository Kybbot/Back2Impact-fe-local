import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";


export const useDeleteUserWorkExperience = () => {
    const { t } = useT("profile");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const data = await userService.deleteUserWorkExperience(id);

            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-user-work-experience"] });

            toast.success(t("experience.toast.work.deleted"));
        },
    });
};
