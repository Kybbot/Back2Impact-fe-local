import { useState, type FC } from "react";
import { useT } from "@/i18n/use-t";
import { Dialog } from "radix-ui";
import { Controller, useForm } from "react-hook-form";

import DiscardChangesPopup from "../../../../components/shared/discard-changes-popup/discard-changes-popup";
import { InputRhf } from "../../../../components/shared/form/Input/InputRhf";
import { TextareaRhf } from "../../../../components/shared/form/Textarea/TextareaRhf";
import { CustomSelect, CustomSelectItem } from "../../../../components/shared/form/CustomSelect/CustomSelect";
import {
    CustomRadioGroup,
    CustomRadioGroupItem,
} from "../../../../components/shared/form/CustomRadioGroup/CustomRadioGroup";

import { useAddUserEducation } from "../hooks/useAddUserEducation";

import { years } from "../../../../utils/date";
import { useDegreeOptions } from "../utils/experience-options";

import type { AddUserEducationBodyType } from "../../../../services/user-service/types";
import { getPortalContainer } from "../../../../utils/portal-container";

type FormValues = {
    institution: string;
    fieldOfStudy: string;
    degree: NonNullable<AddUserEducationBodyType["degree"]> | "";
    startYear: string;
    endYear: string;
    description: string;
};

const defaultValues: FormValues = {
    institution: "",
    fieldOfStudy: "",
    degree: "",
    startYear: "",
    endYear: "",
    description: "",
};

export const EducationNewDialog: FC = () => {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const degrees = useDegreeOptions();
    const [open, setOpen] = useState(false);
    const [showDiscardPopup, setShowDiscardPopup] = useState(false);

    const { isError, isPending, mutate } = useAddUserEducation();

    const {
        reset,
        control,
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<FormValues>({ defaultValues });

    const handleClose = () => {
        setOpen(false);

        // Pass values explicitly: a bare reset() triggers a native form.reset(),
        // which Radix Select listens to and re-emits as onValueChange("") —
        // after a submit that re-runs the required validation on the selects.
        reset(defaultValues);
    };

    // Esc, outside click and both Dialog.Close buttons all end up here
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            // hidden on open rather than on close, so the popup doesn't flip back
            // to the form while the dialog is still animating out
            setShowDiscardPopup(false);
            setOpen(true);
        } else if (isDirty) setShowDiscardPopup(true);
        else handleClose();
    };

    const onSubmit = (formData: FormValues) => {
        mutate(
            {
                body: {
                    institution: formData.institution,
                    fieldOfStudy: formData.fieldOfStudy,
                    degree: formData.degree ? formData.degree : undefined,
                    startYear: +formData.startYear,
                    endYear: +formData.endYear ? +formData.endYear : undefined,
                    description: formData.description ? formData.description : undefined,
                },
            },
            {
                onSuccess() {
                    handleClose();
                },
            },
        );
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Trigger asChild>
                <button type="button" className="experience__btn">
                    {t("common.add")}
                    <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clipPath="url(#clip0_883_974)">
                            <path
                                strokeWidth="1.3"
                                stroke="#4577C9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.33398 3V11M3.33398 7H11.334"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_883_974">
                                <rect width="16" height="16" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </button>
            </Dialog.Trigger>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="experienceDialog__overlay" />
                <Dialog.Content className="experienceDialog__content">
                    {showDiscardPopup ? (
                        <DiscardChangesPopup
                            onCancel={() => setShowDiscardPopup(false)}
                            onConfirm={handleClose}
                        />
                    ) : (
                        <form className="experienceDialog__form" onSubmit={handleSubmit(onSubmit)}>
                            <div className="experienceDialog__header">
                                <Dialog.Title className="experienceDialog__title">
                                    {t("experience.education.addTitle")}
                                </Dialog.Title>
                                <Dialog.Close asChild>
                                    <button type="button" className="experienceDialog__close">
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
                            <div className="experienceDialog__main">
                                <div className="experienceDialog__fields">
                                    <InputRhf
                                        isRequired
                                        type="text"
                                        id="institutionId"
                                        name="institution"
                                        register={register}
                                        rules={{ required: tErrors("validation.required") }}
                                        label={t("experience.education.institution")}
                                        error={errors.institution?.message}
                                        placeholder={t("experience.education.institutionPlaceholder")}
                                    />
                                    <InputRhf
                                        isRequired
                                        type="text"
                                        id="fieldOfStudyId"
                                        name="fieldOfStudy"
                                        register={register}
                                        rules={{ required: tErrors("validation.required") }}
                                        placeholder={t("experience.education.fieldPlaceholder")}
                                        label={t("experience.education.field")}
                                        error={errors.fieldOfStudy?.message}
                                    />
                                    <hr className="experienceDialog__hr" />
                                    <Controller
                                        name="degree"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomRadioGroup
                                                {...field}
                                                id="degreeId"
                                                value={field.value}
                                                label={t("experience.education.degree")}
                                                onValueChange={field.onChange}
                                                error={errors.degree?.message}
                                            >
                                                {degrees.map((item) => (
                                                    <CustomRadioGroupItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </CustomRadioGroupItem>
                                                ))}
                                            </CustomRadioGroup>
                                        )}
                                    />
                                    <hr className="experienceDialog__hr" />
                                    <div className="experienceDialog__subFields">
                                        <Controller
                                            name="startYear"
                                            control={control}
                                            rules={{ required: tErrors("validation.required") }}
                                            render={({ field }) => (
                                                <CustomSelect
                                                    {...field}
                                                    isRequired
                                                    id="startYearId"
                                                    placeholder={t("experience.education.from")}
                                                    value={field.value}
                                                    label={t("experience.education.years")}
                                                    onValueChange={field.onChange}
                                                    error={errors.startYear?.message}
                                                >
                                                    {years().map((item) => (
                                                        <CustomSelectItem key={item} value={item.toString()}>
                                                            {item}
                                                        </CustomSelectItem>
                                                    ))}
                                                </CustomSelect>
                                            )}
                                        />
                                        <Controller
                                            name="endYear"
                                            control={control}
                                            render={({ field }) => (
                                                <CustomSelect
                                                    {...field}
                                                    id="endYearId"
                                                    placeholder={t("experience.education.to")}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    error={errors.endYear?.message}
                                                >
                                                    {years().map((item) => (
                                                        <CustomSelectItem key={item} value={item.toString()}>
                                                            {item}
                                                        </CustomSelectItem>
                                                    ))}
                                                </CustomSelect>
                                            )}
                                        />
                                    </div>
                                    <hr className="experienceDialog__hr" />
                                    <TextareaRhf
                                        rows={4}
                                        id="descriptionId"
                                        name="description"
                                        label={t("experience.education.description")}
                                        register={register}
                                        error={errors.description?.message}
                                        placeholder={t("experience.education.thesis")}
                                    />
                                </div>
                            </div>
                            <div className="experienceDialog__footer">
                                {isError && (
                                    <p className="experienceDialog__warning">
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
                                        <button
                                            type="button"
                                            disabled={isPending}
                                            className="experienceDialog__btn"
                                        >
                                            {t("common.cancel")}
                                        </button>
                                    </Dialog.Close>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="experienceDialog__btn experienceDialog__btn--active"
                                    >
                                        {t("common.save")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
