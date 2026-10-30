import { Dialog } from "radix-ui";
import * as Sentry from "@sentry/react";
import { useMutation } from "@tanstack/react-query";

import { useT } from "@/i18n/use-t";

import userService from "@/services/user-service/user-service";

import { getPortalContainer } from "@/utils/portal-container";

import type { FileType } from "../types";

type FileData = {
    id: number;
    name: string;
    type: FileType;
};

type Props = {
    file: FileData;
    onClose: () => void;
    onDeleted: () => Promise<unknown>;
};

function FileDeleteDialog({ file, onClose, onDeleted }: Props) {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");

    const { mutate, isError, isPending } = useMutation({
        mutationFn: (id: number) => userService.deleteFile(id),
        onSuccess: async () => {
            await onDeleted();
            onClose();
        },
        onError: (e) => Sentry.captureException(e),
    });

    const description =
        t("documents.confirmDelete", { name: file.name }) +
        (file.type === "cv" ? ` ${t("documents.confirmDeleteCv")}` : "");

    const handleOpenChange = (open: boolean) => {
        if (!open && !isPending) onClose();
    };

    return (
        <Dialog.Root open onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="experienceDialog__overlay" />
                <Dialog.Content asChild className="experienceDialog__content">
                    <div className="deleteDialog">
                        <div className="deleteDialog__header">
                            <Dialog.Title className="deleteDialog__title">
                                {t("documents.deleteFile")}
                            </Dialog.Title>
                            <Dialog.Description className="deleteDialog__description">
                                {description}
                            </Dialog.Description>
                            <Dialog.Close asChild>
                                <button type="button" disabled={isPending} className="deleteDialog__close">
                                    <svg
                                        width="13"
                                        height="13"
                                        fill="none"
                                        viewBox="0 0 13 13"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            stroke="#333333"
                                            strokeWidth="1.5"
                                            strokeOpacity="0.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11.75 0.75L0.75 11.75M11.75 11.75L0.75 0.75"
                                        />
                                    </svg>
                                </button>
                            </Dialog.Close>
                        </div>
                        {isError && (
                            <p className="experienceDialog__warning" style={{ marginBottom: "16px" }}>
                                <svg
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M12.0004 17.0004C12.2337 17.0004 12.4295 16.9212 12.5879 16.7629C12.7462 16.6046 12.8254 16.4087 12.8254 16.1754C12.8254 15.9421 12.7462 15.7462 12.5879 15.5879C12.4295 15.4296 12.2337 15.3504 12.0004 15.3504C11.767 15.3504 11.5712 15.4296 11.4129 15.5879C11.2545 15.7462 11.1754 15.9421 11.1754 16.1754C11.1754 16.4087 11.2545 16.6046 11.4129 16.7629C11.5712 16.9212 11.767 17.0004 12.0004 17.0004ZM11.3254 13.1754H12.8254V6.85037H11.3254V13.1754ZM12.0254 23.2754L8.65039 20.0004H4.00039V15.3504L0.650391 12.0004L4.00039 8.65037V4.00039H8.65039L12.0254 0.650391L15.3504 4.00039H20.0004V8.65037L23.3504 12.0004L20.0004 15.3504V20.0004H15.3504L12.0254 23.2754Z"
                                        fill="#FAC9C3"
                                    />
                                    <path
                                        d="M12.0008 16.9996C12.2341 16.9996 12.4299 16.9205 12.5883 16.7622C12.7466 16.6038 12.8258 16.408 12.8258 16.1746C12.8258 15.9413 12.7466 15.7455 12.5883 15.5871C12.4299 15.4288 12.2341 15.3496 12.0008 15.3496C11.7674 15.3496 11.5716 15.4288 11.4133 15.5871C11.2549 15.7455 11.1758 15.9413 11.1758 16.1746C11.1758 16.408 11.2549 16.6038 11.4133 16.7622C11.5716 16.9205 11.7674 16.9996 12.0008 16.9996ZM11.3258 13.1746H12.8258V6.84961H11.3258V13.1746Z"
                                        fill="#BB3220"
                                    />
                                </svg>
                                {tErrors("generic.tryAgainSoon")}
                            </p>
                        )}
                        <div className="experienceDialog__btns">
                            <Dialog.Close asChild>
                                <button type="button" disabled={isPending} className="experienceDialog__btn">
                                    {t("common.cancel")}
                                </button>
                            </Dialog.Close>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => mutate(file.id)}
                                className="experienceDialog__btn experienceDialog__btn--delete"
                            >
                                {t("common.delete")}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default FileDeleteDialog;
