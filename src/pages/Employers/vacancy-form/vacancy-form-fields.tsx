import { useMemo, type ReactNode, type Ref } from "react";
import {
    Controller,
    useWatch,
    type Control,
    type FieldErrors,
    type UseFormRegister,
    type UseFormSetValue,
} from "react-hook-form";

import {
    CURRENCIES,
    INTERNSHIP,
    MAX_SECTORS,
    WORK_FORMATS,
    MAX_OPEN_DAYS,
    SENIORITY_LEVELS,
    getDeadlineRange,
    getDescriptionLength,
    DESCRIPTION_MAX_LENGTH,
    MAX_PROFESSIONAL_AREAS,
    type VacancyFormData,
    type VacancyFormValues,
} from "./vacancy-form-schema";

import { useT } from "@/i18n/use-t";
import { useFilterOptions, useOptionLabel, useOptionMap } from "@/i18n/options";

import { InputRhf } from "@/components/shared/form/Input/InputRhf";
import { Checkbox } from "@/components/shared/form/Checkbox/Checkbox";
import { CheckboxRhf } from "@/components/shared/form/Checkbox/CheckboxRhf";
import { DatePickerRhf } from "@/components/shared/form/DatePicker/DatePickerRhf";
import { RichTextEditorRhf } from "@/components/shared/form/RichTextEditor/RichTextEditorRhf";
import MultiSelectTiles from "@/components/shared/multi-select-tiles/multi-select-tiles";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";

import {
    JOB_ENGLISH_LEVELS,
    JOB_UKRAINIAN_LEVELS,
    type JobEnglishLevel,
    type JobUkrainianLevel,
} from "@/services/employer-service/types";

import { CURRENCY_KEYS } from "@/utils/job-currency";

type Props = {
    setValue: UseFormSetValue<VacancyFormValues>;
    register: UseFormRegister<VacancyFormValues>;
    control: Control<VacancyFormValues, unknown, VacancyFormData>;
    errors: FieldErrors<VacancyFormValues>;
};

/** translation key under `vacancyForm.languageLevels.*` for each level the API takes */
const LANGUAGE_LEVEL_KEYS = {
    "Not required": "notRequired",
    A2: "a2",
    B1: "b1",
    B2: "b2",
    "C1+": "c1",
} as const satisfies Record<JobEnglishLevel | JobUkrainianLevel, string>;

type SectionProps = {
    heading: string;
    description: string;
    children: ReactNode;
};

function Section({ heading, description, children }: SectionProps) {
    return (
        <section className="vacancy-form__section">
            <div className="vacancy-form__section-header">
                <h3 className="vacancy-form__section-heading">{heading}</h3>
                <p className="vacancy-form__hint">{description}</p>
            </div>
            {children}
        </section>
    );
}

type GroupProps = {
    label: string;
    hint?: string;
    error?: string;
    /** almost every group in the form is */
    isRequired?: boolean;
    /** a Controller's `field.ref`: its control can't take focus, so a failed submit scrolls to the group */
    focusRef?: Ref<HTMLDivElement>;
    children: ReactNode;
};

/** a field that is more than one control, with a label, hint and error of its own */
function FieldGroup({ label, hint, error, isRequired = true, focusRef, children }: GroupProps) {
    return (
        <div ref={focusRef} tabIndex={focusRef ? -1 : undefined} className="vacancy-form__group">
            <div className="vacancy-form__group-header">
                <p className="vacancy-form__label">
                    {label} {isRequired && <span className="customInput__asterisk">*</span>}
                </p>
                {hint && <p className="vacancy-form__hint">{hint}</p>}
            </div>
            {children}
            {error && (
                <p role="alert" className="customInput__error">
                    {error}
                </p>
            )}
        </div>
    );
}

function VacancyFormFields({ setValue, register, control, errors }: Props) {
    const { t } = useT("employers");
    const { t: tJob } = useT("job");
    const optionLabel = useOptionLabel();

    const sectorOptions = useOptionMap("sectors");
    const regionOptions = useOptionMap("regions");
    const opportunityTypeOptions = useOptionMap("opportunityTypes");
    const professionalAreaOptions = useOptionMap("professionalAreas");

    // a filter group rather than an onboarding one, so it comes as a list and is turned into the tiles' map
    const sphereList = useFilterOptions("spheres");
    const sphereOptions = useMemo(
        () => Object.fromEntries(sphereList.map(({ code, label }) => [code, label])),
        [sphereList],
    );

    const deadline = getDeadlineRange();

    const [format, currency, descriptionUk, descriptionEn, opportunityTypes] = useWatch({
        control,
        name: ["format", "currency", "descriptionUk", "descriptionEn", "opportunityTypes"],
    });

    const titles = [
        {
            name: "nameUk",
            error: errors.nameUk?.message,
            label: t("vacancyForm.role.inUkrainian"),
            placeholder: t("vacancyForm.role.titleUkPlaceholder"),
        },
        {
            name: "nameEn",
            error: errors.nameEn?.message,
            label: t("vacancyForm.role.inEnglish"),
            placeholder: t("vacancyForm.role.titleEnPlaceholder"),
        },
    ] as const;

    // the editor's HTML, counted by its text
    const descriptions = [
        {
            length: getDescriptionLength(descriptionUk),
            name: "descriptionUk",
            error: errors.descriptionUk?.message,
            label: t("vacancyForm.role.inUkrainian"),
            placeholder: t("vacancyForm.role.aboutUkPlaceholder"),
        },
        {
            length: getDescriptionLength(descriptionEn),
            name: "descriptionEn",
            error: errors.descriptionEn?.message,
            label: t("vacancyForm.role.inEnglish"),
            placeholder: t("vacancyForm.role.aboutEnPlaceholder"),
        },
    ] as const;

    const renderCheckLabel = (title: string, hint: string) => (
        <>
            <strong className="vacancy-form__check-title">{title}</strong> — {hint}
        </>
    );

    return (
        <div className="vacancy-form">
            <Section heading={t("vacancyForm.role.heading")} description={t("vacancyForm.role.description")}>
                <FieldGroup label={t("vacancyForm.role.title")}>
                    <div className="vacancy-form__row vacancy-form__translations">
                        {titles.map((title) => (
                            <InputRhf
                                type="text"
                                key={title.name}
                                name={title.name}
                                register={register}
                                label={title.label}
                                error={title.error}
                                placeholder={title.placeholder}
                            />
                        ))}
                    </div>
                </FieldGroup>

                <FieldGroup label={t("vacancyForm.role.about")} hint={t("vacancyForm.role.aboutHint")}>
                    {descriptions.map((description) => (
                        <div key={description.name} className="vacancy-form__description">
                            <RichTextEditorRhf
                                control={control}
                                name={description.name}
                                label={description.label}
                                error={description.error}
                                placeholder={description.placeholder}
                            />
                            <p
                                className={`
                                    vacancy-form__counter 
                                    ${description.length > DESCRIPTION_MAX_LENGTH ? "vacancy-form__counter_error" : ""}
                                `}
                            >
                                {t("setup.fields.charactersCount", {
                                    current: description.length,
                                    max: DESCRIPTION_MAX_LENGTH,
                                })}
                            </p>
                        </div>
                    ))}
                </FieldGroup>
            </Section>

            <Section
                heading={t("vacancyForm.matching.heading")}
                description={t("vacancyForm.matching.description")}
            >
                <Controller
                    control={control}
                    name="professionalAreas"
                    render={({ field }) => (
                        <FieldGroup
                            focusRef={field.ref}
                            error={errors.professionalAreas?.message}
                            label={t("vacancyForm.matching.professionalAreas")}
                            hint={t("vacancyForm.matching.pickUpTo", { count: MAX_PROFESSIONAL_AREAS })}
                        >
                            <MultiSelectTiles
                                value={field.value}
                                options={professionalAreaOptions}
                                className="vacancy-form__tiles"
                                optionClassName="vacancy-form__tile"
                                selectedOptionClassName="vacancy-form__tile_selected"
                                onChange={(value) => {
                                    if (value.length <= MAX_PROFESSIONAL_AREAS) field.onChange(value);
                                }}
                            />
                        </FieldGroup>
                    )}
                />

                <Controller
                    name="sectors"
                    control={control}
                    render={({ field }) => (
                        <FieldGroup
                            focusRef={field.ref}
                            error={errors.sectors?.message}
                            label={t("vacancyForm.matching.sectors")}
                            hint={t("vacancyForm.matching.sectorsHint", { count: MAX_SECTORS })}
                        >
                            <MultiSelectTiles
                                value={field.value}
                                options={sectorOptions}
                                className="vacancy-form__tiles"
                                optionClassName="vacancy-form__tile"
                                selectedOptionClassName="vacancy-form__tile_selected"
                                onChange={(value) => {
                                    if (value.length <= MAX_SECTORS) field.onChange(value);
                                }}
                            />
                        </FieldGroup>
                    )}
                />

                <Controller
                    name="spheres"
                    control={control}
                    render={({ field }) => (
                        <FieldGroup
                            isRequired={false}
                            focusRef={field.ref}
                            error={errors.spheres?.message}
                            label={t("vacancyForm.matching.spheres")}
                            hint={t("vacancyForm.matching.spheresHint")}
                        >
                            <MultiSelectTiles
                                value={field.value}
                                options={sphereOptions}
                                onChange={field.onChange}
                                className="vacancy-form__tiles"
                                optionClassName="vacancy-form__tile"
                                selectedOptionClassName="vacancy-form__tile_selected"
                            />
                        </FieldGroup>
                    )}
                />

                <Controller
                    control={control}
                    name="opportunityTypes"
                    // the internship's dates are checked only for an internship, so their error follows the types
                    rules={{ deps: ["internshipEnd"] }}
                    render={({ field }) => (
                        <FieldGroup
                            focusRef={field.ref}
                            error={errors.opportunityTypes?.message}
                            label={t("vacancyForm.matching.opportunityTypes")}
                        >
                            <MultiSelectTiles
                                value={field.value}
                                onChange={field.onChange}
                                options={opportunityTypeOptions}
                                className="vacancy-form__tiles"
                                optionClassName="vacancy-form__tile"
                                selectedOptionClassName="vacancy-form__tile_selected"
                            />
                        </FieldGroup>
                    )}
                />

                {/* kept in the form while hidden, so picking the type again restores them */}
                {opportunityTypes.includes(INTERNSHIP) && (
                    <FieldGroup
                        isRequired={false}
                        label={t("vacancyForm.matching.internship")}
                        hint={t("vacancyForm.matching.internshipHint")}
                    >
                        <div className="vacancy-form__row vacancy-form__row_internship">
                            <DatePickerRhf
                                control={control}
                                name="internshipStart"
                                rules={{ deps: ["internshipEnd"] }}
                                error={errors.internshipStart?.message}
                                label={t("vacancyForm.matching.internshipStart")}
                            />
                            <DatePickerRhf
                                control={control}
                                name="internshipEnd"
                                error={errors.internshipEnd?.message}
                                label={t("vacancyForm.matching.internshipEnd")}
                            />
                            <InputRhf
                                type="text"
                                register={register}
                                name="internshipSeason"
                                error={errors.internshipSeason?.message}
                                label={t("vacancyForm.matching.internshipSeason")}
                                placeholder={t("vacancyForm.matching.internshipSeasonPlaceholder")}
                            />
                        </div>
                    </FieldGroup>
                )}

                <Controller
                    name="format"
                    control={control}
                    // a remote role needs no region, so the region's error follows the format
                    rules={{ deps: ["region"] }}
                    render={({ field }) => (
                        <FieldGroup
                            focusRef={field.ref}
                            error={errors.format?.message}
                            label={t("vacancyForm.matching.format")}
                        >
                            <div className="vacancy-form__tiles">
                                {WORK_FORMATS.map((code) => (
                                    <button
                                        key={code}
                                        type="button"
                                        aria-pressed={field.value === code}
                                        onClick={() => field.onChange(code)}
                                        className={`vacancy-form__tile ${field.value === code ? "vacancy-form__tile_selected" : ""}`}
                                    >
                                        {optionLabel("filters.workFormats", code)}
                                    </button>
                                ))}
                            </div>
                        </FieldGroup>
                    )}
                />

                {/* kept in the form while hidden, so going back from remote restores the pick */}
                {format !== "remote" && (
                    <Controller
                        name="region"
                        control={control}
                        render={({ field }) => (
                            <FieldGroup
                                focusRef={field.ref}
                                label={t("vacancyForm.matching.region")}
                                hint={t("vacancyForm.matching.regionHint")}
                            >
                                {/* the group draws the label and hint, the select its own error */}
                                <CustomSelect
                                    id="region"
                                    name={field.name}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    error={errors.region?.message}
                                    placeholder={t("vacancyForm.matching.regionPlaceholder")}
                                >
                                    {Object.entries(regionOptions).map(([code, label]) => (
                                        <CustomSelectItem key={code} value={code}>
                                            {label}
                                        </CustomSelectItem>
                                    ))}
                                </CustomSelect>
                            </FieldGroup>
                        )}
                    />
                )}
            </Section>

            <Section
                heading={t("vacancyForm.requirements.heading")}
                description={t("vacancyForm.requirements.description")}
            >
                <div className="vacancy-form__group">
                    <div className="vacancy-form__row">
                        <Controller
                            control={control}
                            name="seniorityFrom"
                            rules={{ deps: ["seniorityTo"] }}
                            render={({ field }) => (
                                <div ref={field.ref} tabIndex={-1} className="vacancy-form__field">
                                    <CustomSelect
                                        isRequired
                                        id="seniorityFrom"
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        error={errors.seniorityFrom?.message}
                                        label={t("vacancyForm.requirements.seniorityFrom")}
                                        placeholder={t("vacancyForm.requirements.select")}
                                    >
                                        {SENIORITY_LEVELS.map((level) => (
                                            <CustomSelectItem key={level} value={level}>
                                                {optionLabel("seniorityLevels", level)}
                                            </CustomSelectItem>
                                        ))}
                                    </CustomSelect>
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="seniorityTo"
                            render={({ field }) => (
                                <div ref={field.ref} tabIndex={-1} className="vacancy-form__field">
                                    <CustomSelect
                                        isRequired
                                        id="seniorityTo"
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        error={errors.seniorityTo?.message}
                                        label={t("vacancyForm.requirements.seniorityTo")}
                                        placeholder={t("vacancyForm.requirements.select")}
                                    >
                                        {SENIORITY_LEVELS.map((level) => (
                                            <CustomSelectItem key={level} value={level}>
                                                {optionLabel("seniorityLevels", level)}
                                            </CustomSelectItem>
                                        ))}
                                    </CustomSelect>
                                </div>
                            )}
                        />
                    </div>
                    <p className="vacancy-form__hint">{t("vacancyForm.requirements.seniorityHint")}</p>
                </div>

                <div className="vacancy-form__row">
                    <Controller
                        control={control}
                        name="englishLevel"
                        render={({ field }) => (
                            <CustomSelect
                                id="englishLevel"
                                name={field.name}
                                value={field.value}
                                onValueChange={field.onChange}
                                label={t("vacancyForm.requirements.englishLevel")}
                            >
                                {JOB_ENGLISH_LEVELS.map((level) => (
                                    <CustomSelectItem key={level} value={level}>
                                        {t(`vacancyForm.languageLevels.${LANGUAGE_LEVEL_KEYS[level]}`)}
                                    </CustomSelectItem>
                                ))}
                            </CustomSelect>
                        )}
                    />
                    <Controller
                        control={control}
                        name="ukrainianLevel"
                        render={({ field }) => (
                            <CustomSelect
                                id="ukrainianLevel"
                                name={field.name}
                                value={field.value}
                                onValueChange={field.onChange}
                                label={t("vacancyForm.requirements.ukrainianLevel")}
                            >
                                {JOB_UKRAINIAN_LEVELS.map((level) => (
                                    <CustomSelectItem key={level} value={level}>
                                        {t(`vacancyForm.languageLevels.${LANGUAGE_LEVEL_KEYS[level]}`)}
                                    </CustomSelectItem>
                                ))}
                            </CustomSelect>
                        )}
                    />
                </div>
            </Section>

            <Section
                heading={t("vacancyForm.salary.heading")}
                description={t("vacancyForm.salary.description")}
            >
                <div className="vacancy-form__row vacancy-form__row_salary">
                    <InputRhf
                        type="text"
                        inputMode="numeric"
                        name="minimumSalary"
                        register={register}
                        placeholder="1500"
                        disabled={currency === "Unpaid"}
                        rules={{ deps: ["maximumSalary"] }}
                        error={errors.minimumSalary?.message}
                        label={t("vacancyForm.salary.from")}
                    />
                    <InputRhf
                        type="text"
                        inputMode="numeric"
                        name="maximumSalary"
                        register={register}
                        placeholder="2200"
                        disabled={currency === "Unpaid"}
                        error={errors.maximumSalary?.message}
                        label={t("vacancyForm.salary.to")}
                    />
                    <Controller
                        control={control}
                        name="currency"
                        // an unpaid role hides the amounts, so their errors follow the currency
                        rules={{
                            deps: ["minimumSalary", "maximumSalary"],
                            onChange(event) {
                                const value = event.target.value;

                                if (value === "Unpaid") {
                                    setValue("minimumSalary", "");
                                    setValue("maximumSalary", "");
                                }
                            },
                        }}
                        render={({ field }) => (
                            <CustomSelect
                                id="currency"
                                name={field.name}
                                value={field.value}
                                onValueChange={field.onChange}
                                label={t("vacancyForm.salary.currency")}
                            >
                                {CURRENCIES.map((currency) => (
                                    <CustomSelectItem key={currency} value={currency}>
                                        {tJob(`currency.${CURRENCY_KEYS[currency]}`)}
                                    </CustomSelectItem>
                                ))}
                            </CustomSelect>
                        )}
                    />
                </div>

                <div className="vacancy-form__group">
                    <DatePickerRhf
                        isRequired
                        control={control}
                        min={deadline.min}
                        max={deadline.max}
                        className="vacancy-form__date"
                        name="acceptApplicationsUntil"
                        label={t("vacancyForm.salary.deadline")}
                        error={errors.acceptApplicationsUntil?.message}
                    />
                    <p className="vacancy-form__hint">
                        {t("vacancyForm.salary.deadlineHint", { count: MAX_OPEN_DAYS })}
                    </p>
                </div>
            </Section>

            <Section
                heading={t("vacancyForm.attachments.heading")}
                description={t("vacancyForm.attachments.description")}
            >
                <div className="vacancy-form__checks">
                    <Checkbox
                        checked
                        disabled
                        readOnly
                        label={renderCheckLabel(
                            t("vacancyForm.attachments.profile"),
                            t("vacancyForm.attachments.profileHint"),
                        )}
                    />
                    <Controller
                        control={control}
                        name="requiresCoverLetter"
                        render={({ field }) => (
                            <CheckboxRhf
                                name={field.name}
                                register={register}
                                label={renderCheckLabel(
                                    t("vacancyForm.attachments.coverLetter"),
                                    t("vacancyForm.attachments.coverLetterHint"),
                                )}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="requiresAttachment"
                        render={({ field }) => (
                            <CheckboxRhf
                                name={field.name}
                                register={register}
                                label={renderCheckLabel(
                                    t("vacancyForm.attachments.portfolio"),
                                    t("vacancyForm.attachments.portfolioHint"),
                                )}
                            />
                        )}
                    />
                </div>

                <div className="vacancy-form__group">
                    <InputRhf
                        isRequired
                        type="email"
                        register={register}
                        autoComplete="email"
                        name="additionalEmail"
                        error={errors.additionalEmail?.message}
                        label={t("vacancyForm.attachments.email")}
                        placeholder={t("vacancyForm.attachments.emailPlaceholder")}
                    />
                    <p className="vacancy-form__hint">{t("vacancyForm.attachments.emailHint")}</p>
                </div>
            </Section>
        </div>
    );
}

export default VacancyFormFields;
