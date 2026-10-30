import { useMemo } from "react";
import { Dialog } from "radix-ui";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    toStatusChangeDTO,
    createStatusChangeSchema,
    type NotifyingStatus,
    type StatusChangeFormValues,
} from "./status-change-schema";
import { getFirstName } from "./candidate-format";

import { useT } from "@/i18n/use-t";
import { useLocalized } from "@/i18n/pick-localized";

import { InputRhf } from "@/components/shared/form/Input/InputRhf";
import ErrorBlock from "@/components/shared/error-block/error-block";
import { CheckboxRhf } from "@/components/shared/form/Checkbox/CheckboxRhf";
import { TextareaRhf } from "@/components/shared/form/Textarea/TextareaRhf";

import useCurrentUser from "@/hooks/useCurrentUser";

import type {
    EmployerApplicationType,
    PatchEmployerApplicationStatusDTO,
} from "@/services/employer-service/types";

type Props = {
    application: EmployerApplicationType;
    status: NotifyingStatus;
    isBusy: boolean;
    /** the last submit failed */
    isError: boolean;
    onSubmit: (pl: PatchEmployerApplicationStatusDTO) => void;
};

/**
 * What the candidate is told along with the new status. Rendered inside the
 * candidate dialog in place of the profile; its close button and Cancel step
 * back to the profile through the dialog's `onOpenChange`.
 */
function StatusChangeForm({ application, status, isBusy, isError, onSubmit }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const localized = useLocalized();
    const { data: user } = useCurrentUser();

    const name = getFirstName(application.user.fullName);
    const vacancy = localized(application.job, "name") || t("vacancies.table.untitled");

    const schema = useMemo(() => createStatusChangeSchema(tErrors, status), [tErrors, status]);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<StatusChangeFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            // a starting point to edit; "not a fit" goes out neutral unless the employer adds a line
            message:
                status === "not_a_fit"
                    ? ""
                    : t(`candidates.statusChange.${status}.messageDefault`, { name, vacancy }),
            replyTo: user?.email ?? "",
            bookingLink: "",
            sendShortNote: true,
        },
    });

    const sendShortNote = useWatch({ control, name: "sendShortNote" });

    const submit = handleSubmit((data) => onSubmit(toStatusChangeDTO(application.id, status, data)));

    const renderNotAFitFields = () => (
        <>
            <CheckboxRhf
                name="sendShortNote"
                register={register}
                disabled={isBusy}
                label={
                    <>
                        <strong className="status-change__check-title">
                            {t("candidates.statusChange.not_a_fit.sendNote")}
                        </strong>{" "}
                        — {t("candidates.statusChange.not_a_fit.sendNoteHint")}
                    </>
                }
            />
            {sendShortNote && (
                <TextareaRhf
                    rows={3}
                    name="message"
                    register={register}
                    error={errors.message?.message}
                    label={t("candidates.statusChange.not_a_fit.note")}
                    placeholder={t("candidates.statusChange.not_a_fit.notePlaceholder")}
                />
            )}
        </>
    );

    const renderMessageFields = () => (
        <>
            <div className="status-change__field">
                <TextareaRhf
                    rows={5}
                    isRequired
                    name="message"
                    register={register}
                    error={errors.message?.message}
                    label={t("candidates.statusChange.message")}
                    aria-describedby="statusChangeMessageHint"
                />
                <p id="statusChangeMessageHint" className="candidate-dialog__muted">
                    {t("candidates.statusChange.messageHint")}
                </p>
            </div>
            <div className="status-change__field">
                <InputRhf
                    isRequired
                    type="email"
                    name="replyTo"
                    autoComplete="email"
                    register={register}
                    error={errors.replyTo?.message}
                    label={t("candidates.statusChange.replyTo")}
                    aria-describedby="statusChangeReplyToHint"
                />
                <p id="statusChangeReplyToHint" className="candidate-dialog__muted">
                    {t("candidates.statusChange.replyToHint")}
                </p>
            </div>
            {status === "invited" && (
                <InputRhf
                    type="url"
                    name="bookingLink"
                    register={register}
                    error={errors.bookingLink?.message}
                    label={t("candidates.statusChange.bookingLink")}
                    placeholder={t("candidates.statusChange.bookingLinkPlaceholder")}
                />
            )}
        </>
    );

    return (
        <form noValidate className="candidate-dialog__form" onSubmit={submit}>
            <div className="candidate-dialog__header">
                <Dialog.Title className="candidate-dialog__title">
                    {t(`candidates.statusChange.${status}.heading`, { name })}
                </Dialog.Title>
                <Dialog.Close asChild>
                    <button
                        type="button"
                        disabled={isBusy}
                        className="candidate-dialog__close"
                        aria-label={t("candidates.dialog.close")}
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

            <div className="candidate-dialog__main status-change">
                <p className="candidate-dialog__muted">
                    {status === "not_a_fit"
                        ? t("candidates.statusChange.not_a_fit.description", { name })
                        : t("candidates.statusChange.emailDescription", { name })}
                </p>

                {status === "not_a_fit" ? renderNotAFitFields() : renderMessageFields()}
            </div>

            <div className="candidate-dialog__footer">
                {isError && (
                    <ErrorBlock
                        className="candidate-dialog__error"
                        message={tErrors("generic.tryAgainSoon")}
                    />
                )}
                <Dialog.Close asChild>
                    <button type="button" disabled={isBusy} className="candidate-dialog__btn">
                        {t("candidates.statusChange.cancel")}
                    </button>
                </Dialog.Close>
                <button
                    type="submit"
                    disabled={isBusy}
                    className="candidate-dialog__btn candidate-dialog__btn_primary"
                >
                    {t(`candidates.statusChange.${status}.submit`)}
                </button>
            </div>
        </form>
    );
}

export default StatusChangeForm;
