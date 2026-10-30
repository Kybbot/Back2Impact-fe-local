import { useMemo } from "react";
import z from "zod";
import { Dialog } from "radix-ui";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { MAX_OPEN_DAYS, toDeadlineISO, getDeadlineRange, createDeadlineSchema } from "./vacancy-form-schema";

import { useT } from "@/i18n/use-t";
import { useLocalized } from "@/i18n/pick-localized";

import ErrorBlock from "@/components/shared/error-block/error-block";
import { DatePickerRhf } from "@/components/shared/form/DatePicker/DatePickerRhf";

import { usePutEmployerJob } from "@/services/employer-service";
import type { EmployerJobType } from "@/services/employer-service/types";

import { getPortalContainer } from "@/utils/portal-container";

type Props = {
    /** "reopen" for an expired vacancy, "extend" for a published one about to expire */
    action: "reopen" | "extend";
    job: Pick<EmployerJobType, "id" | "nameUk" | "nameEn">;
    onClose: () => void;
};

/**
 * An expired vacancy is a published one past its deadline, so a new deadline
 * is all it takes to put it back up, or to keep an expiring one up; everything
 * else stays as it was.
 */
function DeadlineDialog({ action, job, onClose }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const localized = useLocalized();

    const putJob = usePutEmployerJob();

    const schema = useMemo(
        () => z.object({ acceptApplicationsUntil: createDeadlineSchema(tErrors) }),
        [tErrors],
    );
    const deadline = getDeadlineRange();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { acceptApplicationsUntil: deadline.max },
    });

    // Esc, outside click and both Dialog.Close buttons; a single date is not worth a discard prompt
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && !putJob.isPending) onClose();
    };

    const onSubmit = handleSubmit(({ acceptApplicationsUntil }) => {
        putJob.mutate(
            { id: job.id, pl: { acceptApplicationsUntil: toDeadlineISO(acceptApplicationsUntil) } },
            {
                onSuccess() {
                    toast.success(t(`vacancies.${action}.success`));
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
                                {t(`vacancies.${action}.heading`)}
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
                                    {t(`vacancies.${action}.description`, {
                                        name: localized(job, "name") || t("vacancies.table.untitled"),
                                    })}
                                </Dialog.Description>
                                <div className="vacancy-form__group">
                                    <DatePickerRhf
                                        isRequired
                                        control={control}
                                        min={deadline.min}
                                        max={deadline.max}
                                        name="acceptApplicationsUntil"
                                        className="vacancy-form__date"
                                        label={t("vacancyForm.salary.deadline")}
                                        error={errors.acceptApplicationsUntil?.message}
                                    />
                                    <p className="vacancy-form__hint">
                                        {t("vacancyForm.salary.deadlineHint", { count: MAX_OPEN_DAYS })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="vacancy-dialog__footer">
                            {putJob.isError && (
                                <ErrorBlock
                                    className="vacancy-dialog__error"
                                    message={tErrors("generic.tryAgainSoon")}
                                />
                            )}
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    disabled={putJob.isPending}
                                    className="vacancy-dialog__btn"
                                >
                                    {t("vacancyForm.cancel")}
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={putJob.isPending}
                                className="vacancy-dialog__btn vacancy-dialog__btn_primary"
                            >
                                {t(`vacancies.${action}.submit`)}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default DeadlineDialog;
