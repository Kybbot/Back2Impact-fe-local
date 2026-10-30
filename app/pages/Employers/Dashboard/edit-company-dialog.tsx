import { useMemo, useState } from "react";
import { Dialog } from "radix-ui";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    toPutCompanyDTO,
    createCompanySchemas,
    getCompanyFormDefaults,
    type CompanyFormData,
    type CompanyFormValues,
} from "../company-form/company-form-schema";
import CompanyFormFields from "../company-form/company-form-fields";
import { useCompanyLogoUpload } from "../company-form/use-company-logo-upload";

import { useT } from "@/i18n/use-t";

import ErrorBlock from "@/components/shared/error-block/error-block";
import DiscardChangesPopup from "@/components/shared/discard-changes-popup/discard-changes-popup";

import { ApiError } from "@/errors/api-error";

import { usePutCompany } from "@/services/employer-service";

import { getPortalContainer } from "@/utils/portal-container";
import { getCompanyLogoUrl, type Company } from "@/utils/company";

// an expected answer rather than a failure: the name is taken
const isNameTaken = (e: unknown) => e instanceof ApiError && e.status === 409;

type Props = {
    company: Company | null;
    /** the saved one, or the account email until there is one */
    additionalEmail: string;
    onClose: () => void;
};

/** mounted only while open, so every opening starts from the saved company */
function EditCompanyDialog({ company, additionalEmail, onClose }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");
    const [showDiscardPopup, setShowDiscardPopup] = useState(false);

    const putCompany = usePutCompany();

    const schemas = useMemo(() => createCompanySchemas(tErrors), [tErrors]);

    const {
        control,
        register,
        setValue,
        setError,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<CompanyFormValues, unknown, CompanyFormData>({
        // the profile is what candidates read on a vacancy, so here it is always saved complete
        resolver: zodResolver(schemas.complete),
        defaultValues: getCompanyFormDefaults(company, additionalEmail),
    });

    const logo = useCompanyLogoUpload(
        (key) => setValue("logoKey", key, { shouldDirty: true }),
        getCompanyLogoUrl(company?.logoKey ?? null),
    );

    const isBusy = putCompany.isPending || logo.isUploading;
    const showSaveError = putCompany.isError && !isNameTaken(putCompany.error);

    // Esc, outside click and both Dialog.Close buttons all end up here
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen || isBusy) return;

        if (isDirty) setShowDiscardPopup(true);
        else onClose();
    };

    const onSubmit = handleSubmit((data) => {
        putCompany.mutate(toPutCompanyDTO(data), {
            onSuccess() {
                toast.success(t("dashboard.edit.saved"));
                onClose();
            },
            onError(e) {
                if (isNameTaken(e)) {
                    setError("name", { message: tErrors("employers.companyExists") }, { shouldFocus: true });

                    return;
                }

                Sentry.captureException(e);
            },
        });
    });

    return (
        <Dialog.Root open onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="company-dialog__overlay" />
                <Dialog.Content className="company-dialog__content" aria-describedby={undefined}>
                    {showDiscardPopup ? (
                        <DiscardChangesPopup
                            onCancel={() => setShowDiscardPopup(false)}
                            onConfirm={onClose}
                        />
                    ) : (
                        <form className="company-dialog__form" noValidate onSubmit={onSubmit}>
                            <div className="company-dialog__header">
                                <Dialog.Title className="company-dialog__title">
                                    {t("dashboard.edit.heading")}
                                </Dialog.Title>
                                <Dialog.Close asChild>
                                    <button
                                        type="button"
                                        className="company-dialog__close"
                                        aria-label={t("dashboard.edit.close")}
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
                            <div className="company-dialog__main">
                                <CompanyFormFields
                                    register={register}
                                    control={control}
                                    errors={errors}
                                    logo={logo}
                                />
                            </div>
                            <div className="company-dialog__footer">
                                {showSaveError && <ErrorBlock message={tErrors("generic.tryAgainSoon")} />}
                                <div className="company-dialog__btns">
                                    <Dialog.Close asChild>
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            className="company-dialog__btn"
                                        >
                                            {t("dashboard.edit.cancel")}
                                        </button>
                                    </Dialog.Close>
                                    <button
                                        type="submit"
                                        disabled={isBusy}
                                        className="company-dialog__btn company-dialog__btn_primary"
                                    >
                                        {t("dashboard.edit.save")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default EditCompanyDialog;
