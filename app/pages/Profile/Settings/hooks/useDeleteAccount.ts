import { useMutation } from "@tanstack/react-query";
import { useT } from "@/i18n/use-t";
import { toast } from "react-toastify";

import userService from "../../../../services/user-service/user-service";

import type { DeleteAccountBodyType } from "../../../../services/user-service/types";

export const useDeleteAccount = () => {
    const { t } = useT("errors");
    return useMutation({
        mutationFn: async ({ body }: { body: DeleteAccountBodyType }) => {
            const data = await userService.deleteAccount(body);

            return data;
        },
        onError() {
            toast.error(t("generic.tryAgainSoon"));
        },
    });
};
