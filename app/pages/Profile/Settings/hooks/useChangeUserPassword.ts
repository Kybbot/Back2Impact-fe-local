import { toast } from "react-toastify";
import { useT } from "@/i18n/use-t";
import { useMutation } from "@tanstack/react-query";

import userService from "../../../../services/user-service/user-service";

import type { ChangeUserPasswordBodyType } from "../../../../services/user-service/types";

export const useChangeUserPassword = () => {
    const { t } = useT("profile");
    return useMutation({
        mutationFn: async ({ body }: { body: ChangeUserPasswordBodyType }) => {
            const data = await userService.changeUserPassword(body);

            return data;
        },
        onSuccess: () => {
            toast.success(t("password.updated"));
        },
    });
};
