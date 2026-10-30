import { useMemo, useState } from "react";
import { Dialog } from "radix-ui";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    toEmployerJobDTO,
    createVacancySchema,
    getVacancyFormDefaults,
    type VacancyFormData,
    type VacancyFormValues,
} from "./vacancy-form-schema";
import VacancyFormFields from "./vacancy-form-fields";

import { useT } from "@/i18n/use-t";

import ErrorBlock from "@/components/shared/error-block/error-block";
import DiscardChangesPopup from "@/components/shared/discard-changes-popup/discard-changes-popup";

import useCurrentUser from "@/hooks/useCurrentUser";

import {
    usePutEmployerJob,
    usePostEmployerJob,
    usePatchEmployerJobStatus,
} from "@/services/employer-service";
import type { EmployerJobType, PostEmployerJobDTO } from "@/services/employer-service/types";

import { getPortalContainer } from "@/utils/portal-container";

type Props = {
    /** the vacancy to edit, `null` to post a new one */
    job: EmployerJobType | null;
    /** a closed or expired vacancy the new one is filled in from */
    copyOf?: EmployerJobType;
    onClose: () => void;
};

/** mounted only while open, so every opening starts from the saved vacancy */
function VacancyDialog({ job, copyOf, onClose }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const { data: user } = useCurrentUser();
    const [showDiscardPopup, setShowDiscardPopup] = useState(false);

    const postJob = usePostEmployerJob();
    const putJob = usePutEmployerJob();
    const patchJobStatus = usePatchEmployerJobStatus();

    const schema = useMemo(() => createVacancySchema(tErrors), [tErrors]);

    const {
        control,
        register,
        setValue,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<VacancyFormValues, unknown, VacancyFormData>({
        resolver: zodResolver(schema),
        defaultValues: getVacancyFormDefaults(
            // a copy is a new vacancy, so it starts with a new one's deadline rather than its source's
            job ?? (copyOf ? { ...copyOf, expiresAt: null } : null),
            user?.company?.sectors ?? [],
            user?.additionalEmail ?? user?.email ?? "",
        ),
    });

    const isDraft = job?.status === "draft";
    // publishing a draft awaits both its requests in one submit, so `isSubmitting` spans the gap between them
    const isBusy = isSubmitting || postJob.isPending || putJob.isPending;
    const showSaveError = !isBusy && (postJob.isError || putJob.isError || patchJobStatus.isError);

    // Esc, outside click and both Dialog.Close buttons all end up here
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen || isBusy) return;

        if (isDirty) setShowDiscardPopup(true);
        else onClose();
    };

    const onSaved = (message: string) => {
        toast.success(message);
        onClose();
    };

    const onError = (e: unknown) => {
        Sentry.captureException(e);
    };

    const create = (status: PostEmployerJobDTO["status"]) =>
        handleSubmit((data) => {
            postJob.mutate(
                { ...toEmployerJobDTO(data), status },
                {
                    onSuccess: () =>
                        onSaved(t(status === "draft" ? "vacancyForm.draftSaved" : "vacancyForm.published")),
                    onError,
                },
            );
        });

    // the edit body carries no status: a vacancy keeps the one it has
    const update = handleSubmit((data) => {
        if (!job) return;

        putJob.mutate(
            { id: job.id, pl: toEmployerJobDTO(data) },
            { onSuccess: () => onSaved(t("vacancyForm.saved")), onError },
        );
    });

    // a draft is saved first, so it goes out the way the employer left it
    const publish = handleSubmit(async (data) => {
        if (!job) return;

        try {
            await putJob.mutateAsync({ id: job.id, pl: toEmployerJobDTO(data) });
            await patchJobStatus.mutateAsync({ id: job.id, status: "published" });
            onSaved(t("vacancyForm.published"));
        } catch (e) {
            onError(e);
        }
    });

    // a new vacancy and a draft go out published, any other one is only saved
    const submit = !job ? create("published") : isDraft ? publish : update;

    return (
        <Dialog.Root open onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="vacancy-dialog__overlay" />
                <Dialog.Content className="vacancy-dialog__content" aria-describedby={undefined}>
                    {showDiscardPopup ? (
                        <DiscardChangesPopup
                            onCancel={() => setShowDiscardPopup(false)}
                            onConfirm={onClose}
                        />
                    ) : (
                        <form noValidate className="vacancy-dialog__form" onSubmit={submit}>
                            <div className="vacancy-dialog__header">
                                <Dialog.Title className="vacancy-dialog__title">
                                    {t(job ? "vacancyForm.editHeading" : "vacancyForm.createHeading")}
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
                                <VacancyFormFields
                                    setValue={setValue}
                                    register={register}
                                    control={control}
                                    errors={errors}
                                />
                            </div>
                            <div className="vacancy-dialog__footer">
                                {showSaveError && (
                                    <ErrorBlock
                                        className="vacancy-dialog__error"
                                        message={tErrors("generic.tryAgainSoon")}
                                    />
                                )}
                                {!job && (
                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        className="vacancy-dialog__btn"
                                        onClick={create("draft")}
                                    >
                                        {t("vacancyForm.saveDraft")}
                                    </button>
                                )}
                                {isDraft && (
                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        className="vacancy-dialog__btn"
                                        onClick={update}
                                    >
                                        {t("vacancyForm.save")}
                                    </button>
                                )}
                                {job && !isDraft && (
                                    <Dialog.Close asChild>
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            className="vacancy-dialog__btn"
                                        >
                                            {t("vacancyForm.cancel")}
                                        </button>
                                    </Dialog.Close>
                                )}
                                <button
                                    type="submit"
                                    disabled={isBusy}
                                    className="vacancy-dialog__btn vacancy-dialog__btn_primary"
                                >
                                    {t(job && !isDraft ? "vacancyForm.save" : "vacancyForm.publish")}
                                </button>
                            </div>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default VacancyDialog;
