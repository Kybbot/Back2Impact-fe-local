import {
    useRef,
    useMemo,
    useState,
    type Ref,
    forwardRef,
    type ChangeEvent,
    useImperativeHandle,
} from "react";
import z from "zod";
import * as Sentry from "@sentry/react";
import { Dialog, DropdownMenu } from "radix-ui";
import { Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import closeIcon from "/img/close-icon.svg";
import alertIcon from "/img/alert-icon.svg";
import paperPlaneImg from "/img/paper-plane.svg";

import { useT } from "@/i18n/use-t";
import { useLocalized } from "../../../i18n/pick-localized";

import useCurrentUser from "../../../hooks/useCurrentUser";

import { usePutFile } from "@/services/s3-service";
import userService from "@/services/user-service/user-service";
import { usePostJobApply, usePostJobApplyFile } from "@/services/user-service";

import { getPortalContainer } from "../../../utils/portal-container";

import { TextareaRhf } from "@/components/shared/form/Textarea/TextareaRhf";

import type { GetOneJobType, JobListType } from "@/types/jobs";
import type { UserData } from "@/services/user-service/types";

type Handle = {
    open: () => void;
};

type Props = {
    applyingJob: GetOneJobType | JobListType;
    onClose?: (isSuccess: boolean) => void;
    onSubmit: () => Promise<void> | void;
};

type Step = "form" | "success";
type FileType = "cv" | "attachment";
type FileState = "loading" | "error" | "loaded" | "pending";
type UserDocument = UserData["documents"][number];

const CV_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
];
const ATTACHMENT_TYPES = [
    ...CV_TYPES,
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const MAX_FILE_SIZE = 1024 * 1024 * 10;

/** the counter under the textarea and the schema must not drift apart */
const MAX_LETTER_LENGTH = 2000;
const MIN_LETTER_LENGTH = 10;

const DEFAULT_VALUES = {
    cv: undefined,
    letter: "",
    attachment: undefined,
};

const fileDataSchema = z.object({
    key: z.string().nonempty(),
    name: z.string().nonempty(),
    mimeType: z.string().nonempty(),
});

const createSchema = (
    hasCv: boolean,
    isLetterRequired: boolean,
    isAttachmentRequired: boolean,
    t: TFunction<"errors">,
) =>
    z.object({
        cv: hasCv
            ? fileDataSchema.optional()
            : z.object(fileDataSchema.shape, { error: t("validation.required") }),
        letter: isLetterRequired
            ? z
                  .string()
                  .trim()
                  .min(MIN_LETTER_LENGTH, t("validation.required", { count: MIN_LETTER_LENGTH }))
                  .max(MAX_LETTER_LENGTH, t("jobs.apply.letterMax", { count: MAX_LETTER_LENGTH }))
            : z.string(),
        attachment: isAttachmentRequired
            ? z.object(fileDataSchema.shape, { error: t("validation.required") })
            : fileDataSchema.optional(),
    });

function ApplyBlock({ applyingJob, onClose, onSubmit }: Props, ref: Ref<Handle>) {
    const { t } = useT("jobs");
    const { t: tErrors } = useT("errors");
    const localized = useLocalized();

    const { data: user, refetch: refetchUser } = useCurrentUser();

    const putFile = usePutFile();
    const postJobApply = usePostJobApply();
    const postJobApplyFile = usePostJobApplyFile();

    const [step, setStep] = useState<Step | null>(null);
    const [showApplyError, setShowApplyError] = useState(false);
    const [cvState, setCvState] = useState<FileState>("pending");
    const [attachmentState, setAttachmentState] = useState<FileState>("pending");
    const [menuPosition, setMenuPosition] = useState({ width: 0, sideOffset: 4, alignOffset: 0 });

    /** the file behind the `cv` form value, kept to upload it to the documents as well */
    const cvFileRef = useRef<File | null>(null);
    const cvInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const attachmentFieldRef = useRef<HTMLDivElement>(null);
    const attachmentTriggerRef = useRef<HTMLButtonElement>(null);

    const hasSavedCv = !!user?.documents.some((document) => document.type === "cv");
    const otherDocuments = user?.documents.filter((document) => document.type === "other") ?? [];
    /** list items don't carry these flags, so the fields stay enabled for them */
    const isLetterEnabled = !("requiresCoverLetter" in applyingJob) || applyingJob.requiresCoverLetter;
    /** without the flag we can't tell whether the job needs a document, so it stays optional */
    const isAttachmentRequired = "requiresAttachment" in applyingJob && applyingJob.requiresAttachment;

    const schema = useMemo(
        () => createSchema(!!user?.cvName, isLetterEnabled, isAttachmentRequired, tErrors),
        [user?.cvName, isLetterEnabled, isAttachmentRequired, tErrors],
    );

    const {
        watch,
        register,
        setValue,
        setError,
        clearErrors,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: DEFAULT_VALUES,
    });

    useImperativeHandle(ref, () => ({
        open: () => {
            reset({ ...DEFAULT_VALUES, letter: user?.coverLetter ?? "" });
            cvFileRef.current = null;
            setShowApplyError(false);
            setCvState("pending");
            setAttachmentState("pending");
            setStep("form");
        },
    }));

    const handleClose = () => {
        const isSuccess = step === "success";

        setStep(null);

        if (onClose) onClose(isSuccess);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) handleClose();
    };

    const changeFileState = (type: FileType, state: FileState) => {
        if (type === "cv") {
            setCvState(state);
        } else {
            setAttachmentState(state);
        }
    };

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>, type: FileType) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // The rejected file replaces the previous one: otherwise the field would
        // show the old file's name next to the error and Apply would send it.
        if (file.size > MAX_FILE_SIZE) {
            setValue(type, undefined);
            setError(type, { type: "manual", message: tErrors("file.tooBig") });
            changeFileState(type, "pending");

            return;
        }

        clearErrors(type);

        try {
            changeFileState(type, "loading");

            const { name, type: mimeType, size } = file;

            const presignedUrl = await postJobApplyFile.mutateAsync({ type, mimeType, size });

            await putFile.mutateAsync({
                file,
                url: presignedUrl.url,
            });

            setValue(
                type,
                {
                    key: presignedUrl.key,
                    name,
                    mimeType,
                },
                { shouldValidate: true },
            );

            if (type === "cv") cvFileRef.current = file;

            changeFileState(type, "loaded");
        } catch {
            changeFileState(type, "error");
        }
    };

    /**
     * Radix positions the menu by its trigger only, so the offsets stretch it
     * from the trigger to the edges of the whole field.
     */
    const handleAttachmentMenuOpenChange = (open: boolean) => {
        const field = attachmentFieldRef.current?.getBoundingClientRect();
        const trigger = attachmentTriggerRef.current?.getBoundingClientRect();

        if (!open || !field || !trigger) return;

        setMenuPosition({
            width: field.width,
            sideOffset: field.bottom - trigger.bottom + 4,
            alignOffset: trigger.right - field.right,
        });
    };

    /** a saved document is already in the storage, so its key goes to the application as is */
    const handleSavedDocumentSelect = ({ key, name, mimeType }: UserDocument) => {
        setValue("attachment", { key, name, mimeType }, { shouldValidate: true });
        changeFileState("attachment", "loaded");
    };

    /**
     * Uploaded separately from the apply file, so the document gets its own key under the user's CVs.
     * The application has already gone through by now, so a failure here is only reported.
     */
    const saveCvToDocuments = async (file: File) => {
        try {
            const { name, type: mimeType, size } = file;
            const { key, url } = await userService.getPresign({ type: "cv", mimeType, size });

            await putFile.mutateAsync({ file, url });
            await userService.postUserFile({ key, name, mimeType, type: "cv" });
            await refetchUser();
        } catch (e) {
            Sentry.captureException(e);
        }
    };

    /** handleSubmit marks the form as submitted, so the fields re-validate on change after the first click */
    const handleApplyClick = handleSubmit(async (data) => {
        try {
            await postJobApply.mutateAsync({
                jobId: applyingJob.id,
                ...data,
            });

            if (data.cv && cvFileRef.current && !hasSavedCv) await saveCvToDocuments(cvFileRef.current);

            setStep("success");

            onSubmit();
        } catch {
            setShowApplyError(true);
        }
    });

    const cv = watch("cv");
    const attachment = watch("attachment");
    const letter = watch("letter");
    const hasCv = !!user?.cvName || !!cv;
    const cvBtnText = hasCv ? t("apply.uploadDifferent") : t("apply.uploadCv");
    const attachmentBtnText = attachment ? t("apply.uploadDifferent") : t("apply.uploadDocument");

    return (
        <Dialog.Root open={step !== null} onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="apply-block">
                    <Dialog.Content className="apply-content" aria-describedby={undefined}>
                        {step === "form" && (
                            <form className="apply-form">
                                <Dialog.Close className="apply-form__close-btn" type="button">
                                    <img
                                        className="apply-form__close-img"
                                        src={closeIcon}
                                        alt={t("apply.close")}
                                    />
                                </Dialog.Close>
                                <div className="apply-form__header">
                                    <Dialog.Title className="apply-form__heading">
                                        {localized(applyingJob, "name")}
                                    </Dialog.Title>
                                    <p className="apply-form__company-name">{applyingJob.companyName}</p>
                                </div>
                                <div className="apply-form__input-container">
                                    <div className="apply-form__label-container">
                                        <label className="apply-form__label">
                                            CV <span className="customInput__asterisk">*</span>
                                        </label>
                                        {cvState === "loading" && (
                                            <span className="apply-form__file-loader"></span>
                                        )}
                                        {cvState === "error" && (
                                            <p className="apply-form__file-error-message">
                                                {tErrors("file.uploadFailed")}
                                            </p>
                                        )}
                                    </div>
                                    <div
                                        className={`
                                            apply-form__input-file-container
                                            ${errors.cv ? "apply-form__input-file-container_invalid" : ""}
                                        `}
                                    >
                                        {cv && <p className="apply-form__file-name">{cv.name}</p>}
                                        {user?.cvName && !cv && (
                                            <p className="apply-form__file-name">{user.cvName}</p>
                                        )}
                                        <button
                                            type="button"
                                            className="apply-form__upload-file-btn"
                                            onClick={() => cvInputRef.current?.click()}
                                        >
                                            {cvBtnText}
                                        </button>
                                        <input
                                            type="file"
                                            ref={cvInputRef}
                                            accept={CV_TYPES.join(",")}
                                            hidden
                                            onChange={(e) => handleFileSelect(e, "cv")}
                                        />
                                    </div>
                                    {errors.cv && (
                                        <p className="apply-form__field-error">{errors.cv.message}</p>
                                    )}
                                </div>
                                <div className="apply-form__input-container apply-form__input-container_letter">
                                    <TextareaRhf
                                        name="letter"
                                        register={register}
                                        isRequired={isLetterEnabled}
                                        label={t("apply.coverLetter")}
                                        error={errors.letter?.message}
                                        placeholder={t("apply.letterPlaceholder")}
                                    />
                                    <p className="apply-form__characters-count">
                                        {t("apply.charactersCount", {
                                            current: letter.length,
                                            max: MAX_LETTER_LENGTH,
                                        })}
                                    </p>
                                    {isLetterEnabled && (
                                        <p className="apply-form__hint">
                                            {t("apply.letterHint", { count: MIN_LETTER_LENGTH })}
                                        </p>
                                    )}
                                </div>
                                <div className="apply-form__input-container">
                                    <div className="apply-form__label-container">
                                        <label className="apply-form__label">
                                            {t("apply.additionalDocument")}{" "}
                                            {isAttachmentRequired && (
                                                <span className="customInput__asterisk">*</span>
                                            )}
                                        </label>
                                        {attachmentState === "loading" && (
                                            <span className="apply-form__file-loader"></span>
                                        )}
                                        {attachmentState === "error" && (
                                            <p className="apply-form__file-error-message">
                                                {tErrors("file.uploadFailed")}
                                            </p>
                                        )}
                                    </div>
                                    <div
                                        ref={attachmentFieldRef}
                                        className={`
                                            apply-form__input-file-container
                                            ${errors.attachment ? "apply-form__input-file-container_invalid" : ""}
                                        `}
                                    >
                                        {attachment && (
                                            <p className="apply-form__file-name">{attachment.name}</p>
                                        )}
                                        {otherDocuments.length ? (
                                            <DropdownMenu.Root onOpenChange={handleAttachmentMenuOpenChange}>
                                                <DropdownMenu.Trigger asChild>
                                                    <button
                                                        type="button"
                                                        ref={attachmentTriggerRef}
                                                        className="apply-form__upload-file-btn"
                                                    >
                                                        {attachmentBtnText}
                                                    </button>
                                                </DropdownMenu.Trigger>
                                                <DropdownMenu.Portal container={getPortalContainer()}>
                                                    <DropdownMenu.Content
                                                        align="end"
                                                        collisionPadding={16}
                                                        className="apply-form__menu"
                                                        sideOffset={menuPosition.sideOffset}
                                                        style={{ width: menuPosition.width }}
                                                        alignOffset={menuPosition.alignOffset}
                                                    >
                                                        <DropdownMenu.Item
                                                            className="apply-form__menu-item"
                                                            onSelect={() =>
                                                                attachmentInputRef.current?.click()
                                                            }
                                                        >
                                                            {t("apply.uploadFromDevice")}
                                                        </DropdownMenu.Item>
                                                        <DropdownMenu.Separator className="apply-form__menu-separator" />
                                                        <DropdownMenu.Label className="apply-form__menu-label">
                                                            {t("apply.savedDocuments")}
                                                        </DropdownMenu.Label>
                                                        {otherDocuments.map((document) => (
                                                            <DropdownMenu.Item
                                                                key={document.id}
                                                                className="apply-form__menu-item"
                                                                onSelect={() =>
                                                                    handleSavedDocumentSelect(document)
                                                                }
                                                            >
                                                                {document.name}
                                                            </DropdownMenu.Item>
                                                        ))}
                                                    </DropdownMenu.Content>
                                                </DropdownMenu.Portal>
                                            </DropdownMenu.Root>
                                        ) : (
                                            <button
                                                type="button"
                                                className="apply-form__upload-file-btn"
                                                onClick={() => attachmentInputRef.current?.click()}
                                            >
                                                {attachmentBtnText}
                                            </button>
                                        )}
                                        <input
                                            hidden
                                            type="file"
                                            ref={attachmentInputRef}
                                            required={isAttachmentRequired}
                                            accept={ATTACHMENT_TYPES.join(",")}
                                            onChange={(e) => handleFileSelect(e, "attachment")}
                                        />
                                    </div>
                                    {errors.attachment && (
                                        <p className="apply-form__field-error">{errors.attachment.message}</p>
                                    )}
                                </div>
                                <p className="apply-form__review-str">{t("apply.review")}</p>
                                {showApplyError && (
                                    <div className="apply-form__error-block">
                                        <img
                                            className="apply-form__error-img"
                                            src={alertIcon}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <p className="apply-form__error-message">
                                            {tErrors("generic.short")}
                                            <br />
                                            {tErrors("jobs.apply.description")}
                                        </p>
                                    </div>
                                )}
                                <div className="apply-form__btns-container">
                                    <Dialog.Close
                                        className="apply-form__btn apply-form__btn_cancel"
                                        type="button"
                                    >
                                        {t("apply.cancel")}
                                    </Dialog.Close>
                                    <button
                                        className={`
                                            apply-form__btn apply-form__btn_apply
                                            ${isSubmitting ? "apply-form__btn_loader" : ""}
                                            ${hasCv ? "" : "apply-form__btn_disabled"}
                                        `}
                                        type="button"
                                        disabled={!hasCv}
                                        onClick={handleApplyClick}
                                    >
                                        {t("apply.confirm")}
                                    </button>
                                </div>
                            </form>
                        )}
                        {step === "success" && (
                            <div className="successful-apply-popup">
                                <Dialog.Close className="successful-apply-popup__close-btn" type="button">
                                    <img
                                        className="successful-apply-popup__close-icon"
                                        src={closeIcon}
                                        alt={t("apply.close")}
                                    />
                                </Dialog.Close>
                                <img
                                    className="successful-apply-popup__img"
                                    src={paperPlaneImg}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <div className="successful-apply-popup__main">
                                    <Dialog.Title className="successful-apply-popup__heading">
                                        {t("apply.successHeading")}
                                    </Dialog.Title>
                                    <p className="successful-apply-popup__description">
                                        <Trans
                                            t={t}
                                            i18nKey="apply.successDescription"
                                            values={{ email: user?.email }}
                                            components={{
                                                email: <span className="successful-apply-popup__underline" />,
                                            }}
                                        />
                                    </p>
                                </div>
                                <Dialog.Close className="successful-apply-popup__btn" type="button">
                                    {t("apply.okay")}
                                </Dialog.Close>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default forwardRef<Handle, Props>(ApplyBlock);
