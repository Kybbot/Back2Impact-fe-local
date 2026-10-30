import { Controller, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import CompanyLogoField from "./company-logo-field";
import {
    MAX_SECTORS,
    DESCRIPTION_MAX_LENGTH,
    type CompanyFormData,
    type CompanyFormValues,
} from "./company-form-schema";
import type { useCompanyLogoUpload } from "./use-company-logo-upload";

import { useT } from "@/i18n/use-t";
import { useOptionMap } from "@/i18n/options";

import { InputRhf } from "@/components/shared/form/Input/InputRhf";
import { TextareaRhf } from "@/components/shared/form/Textarea/TextareaRhf";
import MultiSelectTiles from "@/components/shared/multi-select-tiles/multi-select-tiles";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";

import { COMPANY_SIZES } from "@/services/employer-service/types";

import { formatCompanySize, getCompanyInitials } from "@/utils/company";

type Props = {
    register: UseFormRegister<CompanyFormValues>;
    control: Control<CompanyFormValues, unknown, CompanyFormData>;
    errors: FieldErrors<CompanyFormValues>;
    logo: ReturnType<typeof useCompanyLogoUpload>;
};

/** the company fields shared by the setup page and the dashboard's edit dialog */
function CompanyFormFields({ register, control, errors, logo }: Props) {
    const { t } = useT("employers");
    const sectorOptions = useOptionMap("sectors");

    const [name, descriptionUk, descriptionEn] = useWatch({
        control,
        name: ["name", "descriptionUk", "descriptionEn"],
    });

    const descriptions = [
        {
            value: descriptionUk,
            name: "descriptionUk",
            label: t("setup.fields.aboutUk"),
            error: errors.descriptionUk?.message,
            placeholder: t("setup.fields.aboutUkPlaceholder"),
        },
        {
            value: descriptionEn,
            name: "descriptionEn",
            label: t("setup.fields.aboutEn"),
            error: errors.descriptionEn?.message,
            placeholder: t("setup.fields.aboutEnPlaceholder"),
        },
    ] as const;

    return (
        <div className="company-form">
            <CompanyLogoField
                error={logo.error}
                onSelect={logo.select}
                previewUrl={logo.previewUrl}
                isUploading={logo.isUploading}
                initials={getCompanyInitials(name)}
            />

            <InputRhf
                isRequired
                type="text"
                name="name"
                register={register}
                autoComplete="organization"
                error={errors.name?.message}
                label={t("setup.fields.name")}
                placeholder={t("setup.fields.namePlaceholder")}
            />

            <div className="company-form__group">
                <div className="company-form__group-header">
                    <p className="company-form__label">
                        {t("setup.fields.about")} <span className="customInput__asterisk">*</span>
                    </p>
                    <p className="company-form__hint">{t("setup.fields.aboutHint")}</p>
                </div>
                {descriptions.map((description) => (
                    <div key={description.name} className="company-form__description">
                        <TextareaRhf
                            rows={4}
                            register={register}
                            name={description.name}
                            label={description.label}
                            error={description.error}
                            placeholder={description.placeholder}
                        />
                        <p
                            className={`company-form__counter ${
                                description.value.trim().length > DESCRIPTION_MAX_LENGTH
                                    ? "company-form__counter_error"
                                    : ""
                            }`}
                        >
                            {t("setup.fields.charactersCount", {
                                current: description.value.trim().length,
                                max: DESCRIPTION_MAX_LENGTH,
                            })}
                        </p>
                    </div>
                ))}
            </div>

            <div className="company-form__row">
                <InputRhf
                    isRequired
                    type="url"
                    name="website"
                    inputMode="url"
                    autoComplete="url"
                    register={register}
                    error={errors.website?.message}
                    label={t("setup.fields.website")}
                    placeholder={t("setup.fields.websitePlaceholder")}
                />
                <Controller
                    control={control}
                    name="companySize"
                    render={({ field }) => (
                        <CustomSelect
                            id="companySize"
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                            error={errors.companySize?.message}
                            label={t("setup.fields.companySize")}
                            placeholder={t("setup.fields.companySizePlaceholder")}
                        >
                            {COMPANY_SIZES.map((size) => (
                                <CustomSelectItem key={size} value={size}>
                                    {t("setup.fields.companySizeOption", { range: formatCompanySize(size) })}
                                </CustomSelectItem>
                            ))}
                        </CustomSelect>
                    )}
                />
            </div>

            <div className="company-form__group">
                <div className="company-form__group-header">
                    <p className="company-form__label">
                        {t("setup.fields.sectors")} <span className="customInput__asterisk">*</span>
                    </p>
                    <p className="company-form__hint">{t("setup.fields.sectorsHint")}</p>
                </div>
                <Controller
                    name="sectors"
                    control={control}
                    render={({ field }) => (
                        <MultiSelectTiles
                            value={field.value}
                            options={sectorOptions}
                            className="company-form__tiles"
                            optionClassName="company-form__tile"
                            selectedOptionClassName="company-form__tile_selected"
                            onChange={(value) => {
                                if (value.length <= MAX_SECTORS) field.onChange(value);
                            }}
                        />
                    )}
                />
                {errors.sectors?.message && (
                    <p role="alert" className="customInput__error">
                        {errors.sectors.message}
                    </p>
                )}
            </div>

            <div className="company-form__row">
                <InputRhf
                    type="text"
                    name="headquarters"
                    register={register}
                    error={errors.headquarters?.message}
                    label={t("setup.fields.headquarters")}
                    placeholder={t("setup.fields.headquartersPlaceholder")}
                />
                <InputRhf
                    type="text"
                    maxLength={4}
                    name="founded"
                    inputMode="numeric"
                    register={register}
                    error={errors.founded?.message}
                    label={t("setup.fields.founded")}
                    placeholder={t("setup.fields.foundedPlaceholder")}
                />
            </div>

            <div className="company-form__description">
                <InputRhf
                    isRequired
                    type="email"
                    register={register}
                    autoComplete="email"
                    name="additionalEmail"
                    label={t("setup.fields.email")}
                    error={errors.additionalEmail?.message}
                    placeholder={t("setup.fields.emailPlaceholder")}
                />
                <p className="company-form__hint">{t("setup.fields.emailHint")}</p>
            </div>
        </div>
    );
}

export default CompanyFormFields;
