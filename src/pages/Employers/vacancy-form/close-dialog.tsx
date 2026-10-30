import { useMemo } from "react";
import z from "zod";
import { Dialog } from "radix-ui";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useT } from "@/i18n/use-t";

import ErrorBlock from "@/components/shared/error-block/error-block";

import { usePatchEmployerJobStatus } from "@/services/employer-service";
import {
    EMPLOYER_JOB_CLOSE_REASONS,
    type EmployerJobType,
    type EmployerJobCloseReason,
} from "@/services/employer-service/types";

import { getPortalContainer } from "@/utils/portal-container";

type Props = {
    /** a published vacancy */
    job: EmployerJobType;
    onClose: () => void;
};

/** takes a vacancy down, asking what happened with the role — the API requires a reason to close */
function CloseDialog({ job, onClose }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");

    const patchJobStatus = usePatchEmployerJobStatus();

    // "" is the nothing-picked state; the type predicate drops it from the output
    const schema = useMemo(
        () =>
            z.object({
                closeReason: z
                    .union([z.enum(EMPLOYER_JOB_CLOSE_REASONS), z.literal("")])
                    .refine(
                        (value): value is EmployerJobCloseReason => value !== "",
                        tErrors("validation.required"),
                    ),
            }),
        [tErrors],
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { closeReason: "" },
    });

    // Esc, outside click and both Dialog.Close buttons; a single pick is not worth a discard prompt
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && !patchJobStatus.isPending) onClose();
    };

    const onSubmit = handleSubmit(({ closeReason }) => {
        patchJobStatus.mutate(
            { id: job.id, status: "closed", closeReason },
            {
                onSuccess() {
                    toast.success(t("vacancies.close.closed"));
                    onClose();
                },
                onError(e) {
                    Sentry.captureException(e);
                },
            },
        );
    });

    return (
        <Dialog.Root open onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="vacancy-dialog__overlay" />
                <Dialog.Content className="vacancy-dialog__content vacancy-dialog__content_small">
                    <form noValidate className="vacancy-dialog__form" onSubmit={onSubmit}>
                        <div className="vacancy-dialog__header">
                            <Dialog.Title className="vacancy-dialog__title">
                                {t("vacancies.close.heading")}
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
                                    {t("vacancies.close.description")}
                                </Dialog.Description>
                                <div
                                    role="radiogroup"
                                    className="vacancy-form__group"
                                    aria-labelledby="closeReasonLabel"
                                >
                                    <p id="closeReasonLabel" className="vacancy-form__label">
                                        {t("vacancies.close.reason")}{" "}
                                        <span className="customInput__asterisk">*</span>
                                    </p>
                                    <div className="vacancy-form__options">
                                        {EMPLOYER_JOB_CLOSE_REASONS.map((reason) => (
                                            <label key={reason} className="vacancy-form__tile">
                                                <input
                                                    type="radio"
                                                    value={reason}
                                                    className="visually-hidden"
                                                    disabled={patchJobStatus.isPending}
                                                    {...register("closeReason")}
                                                />
                                                {t(`vacancies.close.reasons.${reason}`)}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.closeReason && (
                                        <p role="alert" className="customInput__error">
                                            {errors.closeReason.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="vacancy-dialog__footer">
                            {patchJobStatus.isError && (
                                <ErrorBlock
                                    className="vacancy-dialog__error"
                                    message={tErrors("generic.tryAgainSoon")}
                                />
                            )}
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    disabled={patchJobStatus.isPending}
                                    className="vacancy-dialog__btn"
                                >
                                    {t("vacancyForm.cancel")}
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={patchJobStatus.isPending}
                                className="vacancy-dialog__btn vacancy-dialog__btn_primary"
                            >
                                {t("vacancies.close.submit")}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default CloseDialog;
