import { Dialog } from "radix-ui";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";

import { useT } from "@/i18n/use-t";
import { useLocalized } from "@/i18n/pick-localized";

import ErrorBlock from "@/components/shared/error-block/error-block";

import { useDeleteEmployerJob } from "@/services/employer-service";
import type { EmployerJobType } from "@/services/employer-service/types";

import { getPortalContainer } from "@/utils/portal-container";

type Props = {
    /** a draft; the API deletes nothing else */
    job: Pick<EmployerJobType, "id" | "nameUk" | "nameEn">;
    onClose: () => void;
};

/** deletes a draft for good, once the employer confirms */
function DeleteDialog({ job, onClose }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const localized = useLocalized();

    const deleteJob = useDeleteEmployerJob();

    // Esc, outside click and both Dialog.Close buttons
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && !deleteJob.isPending) onClose();
    };

    const handleDelete = () => {
        deleteJob.mutate(job.id, {
            onSuccess() {
                toast.success(t("vacancies.delete.success"));
                onClose();
            },
            onError(e) {
                Sentry.captureException(e);
            },
        });
    };

    return (
        <Dialog.Root open onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="vacancy-dialog__overlay" />
                <Dialog.Content className="vacancy-dialog__content vacancy-dialog__content_small">
                    <div className="vacancy-dialog__header">
                        <Dialog.Title className="vacancy-dialog__title">
                            {t("vacancies.delete.heading")}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                className="vacancy-dialog__close"
                                aria-label={t("vacancyForm.close")}
                            >
                                <svg
                                    width="13"
                                    height="13"
                                    fill="none"
                                    viewBox="0 0 13 13"
                                    aria-hidden="true"
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
                    <div className="vacancy-dialog__main">
                        <div className="vacancy-form vacancy-form__section">
                            <Dialog.Description className="vacancy-form__hint">
                                {t("vacancies.delete.description", {
                                    name: localized(job, "name") || t("vacancies.table.untitled"),
                                })}
                            </Dialog.Description>
                        </div>
                    </div>
                    <div className="vacancy-dialog__footer">
                        {deleteJob.isError && (
                            <ErrorBlock
                                className="vacancy-dialog__error"
                                message={tErrors("generic.tryAgainSoon")}
                            />
                        )}
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                disabled={deleteJob.isPending}
                                className="vacancy-dialog__btn"
                            >
                                {t("vacancyForm.cancel")}
                            </button>
                        </Dialog.Close>
                        <button
                            type="button"
                            disabled={deleteJob.isPending}
                            onClick={handleDelete}
                            className="vacancy-dialog__btn vacancy-dialog__btn_danger"
                        >
                            {t("vacancies.delete.submit")}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default DeleteDialog;
