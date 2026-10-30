import { useMutation } from "@tanstack/react-query";

import s3Service from "../s3-service";

export const usePutFile = () => {
    return useMutation<
        boolean,
        unknown,
        {
            file: File;
            url: string;
        }
    >({
        mutationFn: async ({ file, url }) => {
            const isOk = await s3Service.putFile({ file, url });

            if (!isOk) throw new Error("Failed to upload file");

            return isOk;
        },
    });
};
