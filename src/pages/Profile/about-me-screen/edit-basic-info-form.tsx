import z from "zod";
import { Dialog } from "radix-ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect, useImperativeHandle, useState, type Ref } from "react";
import closeIcon from "/img/close-icon.svg";
import cancelIcon from "/img/cancel-icon.svg";
import ErrorBlock from "@/components/shared/error-block/error-block";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";
import { CustomSearchSelect } from "@/components/shared/form/CustomSelect/CustomSearchSelect";
import { useCountryMap, useOptionMap } from "@/i18n/options";
import { useT } from "@/i18n/use-t";
import { useLocations, type Location } from "@/hooks/use-locations";
import MultiSelectTiles from "@/components/shared/multi-select-tiles/multi-select-tiles";
import DiscardChangesPopup from "@/components/shared/discard-changes-popup/discard-changes-popup";
import { getPortalContainer } from "@/utils/portal-container";

type State = {
    opportunityTypes: string[];
    sectors: string[];
    professionalAreas: string[];
    basedCountry: string;
    workLocationPreference: string;
    locations: Location[];
};

type Handle = {
    isDirty: boolean;
    openPopup: () => void;
};

type Props = {
    isOpen: boolean;
    defaultValues?: State | null;
    onClose: () => void;
    onSubmit: (pl: State) => Promise<void> | void;
};

const schema = z
    .object({
        opportunityTypes: z.array(z.string()).nonempty(),
        sectors: z.array(z.string()).nonempty(),
        professionalAreas: z.array(z.string()).nonempty(),
        basedCountry: z.string(),
        workLocationPreference: z.string(),
        // `cities: null` is the whole region
        locations: z.array(
            z.object({ region: z.string(), cities: z.array(z.string()).nonempty().nullable() }),
        ),
    })
    .superRefine((data, ctx) => {
        if (data.workLocationPreference === "ukraine" && data.locations.length === 0)
            ctx.addIssue({
                code: "custom",
                path: ["locations"],
                // never rendered — these only gate `isValid`, so they stay developer-facing
                message: "There must be at least one region",
            });
        if (data.workLocationPreference !== "ukraine" && data.locations.length !== 0)
            ctx.addIssue({
                code: "custom",
                path: ["locations"],
                message: "The regions array should be empty",
            });
    });

function EditBasicInfoForm({ isOpen, defaultValues, onClose, onSubmit }: Props, ref: Ref<Handle>) {
    const { t } = useT("profile");
    const { t: tErrors } = useT("errors");
    const opportunityTypeOptions = useOptionMap("opportunityTypes");
    const sectorOptions = useOptionMap("sectors");
    const professionalAreaOptions = useOptionMap("professionalAreas");
    const workLocationOptions = useOptionMap("workLocationPreferences");
    const regionOptions = useOptionMap("regions");
    const countryOptions = useCountryMap();

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { isValid, isDirty, errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultValues ?? undefined,
    });
    const [currentForm, setCurrentForm] = useState<"main" | "popup">("main");
    const [showError, setShowError] = useState(false);

    useImperativeHandle(ref, () => ({
        isDirty,
        openPopup: () => setCurrentForm("popup"),
    }));

    useEffect(() => {
        if (showError) setShowError(false);
    }, [errors]);

    const handleWorkLocationPreferenceChange = (value: string) => {
        if (value !== "ukraine") setValue("locations", [], { shouldValidate: true, shouldDirty: true });

        setValue("workLocationPreference", value, { shouldValidate: true, shouldDirty: true });
    };

    const handleLocationsChange = (value: Location[]) =>
        setValue("locations", value, {
            shouldValidate: true,
            shouldDirty: true,
        });

    // Esc, outside click and both Dialog.Close buttons all end up here
    const handleOpenChange = (open: boolean) => {
        if (open) return;

        if (isDirty) setCurrentForm("popup");
        else onClose();
    };

    const handleClick = async () => {
        await handleSubmit(async (data) => {
            try {
                await onSubmit(data);
            } catch (e) {
                setShowError(true);
            }
        })();
    };

    const opportunityTypes = watch("opportunityTypes");
    const sectors = watch("sectors");
    const professionalAreas = watch("professionalAreas");
    const basedCountry = watch("basedCountry");
    const workLocationPreference = watch("workLocationPreference");
    const locations = watch("locations") ?? [];
    const { settlementOptions, hasSettlements, pickedCities, addRegion, removeRegion, addCity, removeCity } =
        useLocations(locations, handleLocationsChange);

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Portal container={getPortalContainer()}>
                <Dialog.Overlay className="about-me-screen__dark-background">
                    <Dialog.Content className="edit-basic-info-form__content" aria-describedby={undefined}>
                        {currentForm === "main" ? (
                            <form className="edit-basic-info-form">
                                <div className="edit-basic-info-form__header">
                                    <p className="edit-basic-info-form__heading">
                                        {t("basicInfo.editHeading")}
                                    </p>
                                    <Dialog.Close asChild>
                                        <button className="edit-basic-info-form__close-btn" type="button">
                                            <img
                                                className="edit-basic-info-form__close-icon"
                                                src={closeIcon}
                                                alt={t("close")}
                                            />
                                        </button>
                                    </Dialog.Close>
                                </div>
                                <div className="edit-basic-info-form__main">
                                    <div className="edit-basic-info-form__info-part">
                                        <div className="edit-basic-info-form__label-container">
                                            <div className="edit-basic-info-form__emoji-container">
                                                <span>👀</span>
                                            </div>
                                            <span className="edit-basic-info-form__label">
                                                {t("basicInfo.lookingFor")}
                                            </span>
                                        </div>
                                        <MultiSelectTiles
                                            className="edit-basic-info-form__multi-select"
                                            optionClassName="edit-basic-info-form__option"
                                            selectedOptionClassName="edit-basic-info-form__option_selected"
                                            options={opportunityTypeOptions}
                                            value={opportunityTypes}
                                            onChange={(v) =>
                                                setValue("opportunityTypes", v, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                })
                                            }
                                        />
                                    </div>
                                    <hr className="about-me-screen__line" />
                                    <div className="edit-basic-info-form__info-part">
                                        <div className="edit-basic-info-form__label-container">
                                            <div className="edit-basic-info-form__emoji-container">
                                                <span>🗂️</span>
                                            </div>
                                            <span className="edit-basic-info-form__label">
                                                {t("basicInfo.sectors")}
                                            </span>
                                        </div>
                                        <MultiSelectTiles
                                            className="edit-basic-info-form__multi-select"
                                            optionClassName="edit-basic-info-form__option"
                                            selectedOptionClassName="edit-basic-info-form__option_selected"
                                            options={sectorOptions}
                                            value={sectors}
                                            onChange={(v) =>
                                                setValue("sectors", v, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                })
                                            }
                                        />
                                    </div>
                                    <hr className="about-me-screen__line" />
                                    <div className="edit-basic-info-form__info-part">
                                        <div className="edit-basic-info-form__label-container">
                                            <div className="edit-basic-info-form__emoji-container">
                                                <span>💼</span>
                                            </div>
                                            <span className="edit-basic-info-form__label">
                                                {t("basicInfo.professions")}
                                            </span>
                                        </div>
                                        <MultiSelectTiles
                                            className="edit-basic-info-form__multi-select"
                                            optionClassName="edit-basic-info-form__option"
                                            selectedOptionClassName="edit-basic-info-form__option_selected"
                                            options={professionalAreaOptions}
                                            value={professionalAreas}
                                            onChange={(v) =>
                                                setValue("professionalAreas", v, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                })
                                            }
                                        />
                                    </div>
                                    <hr className="about-me-screen__line" />
                                    <div className="edit-basic-info-form__info-part">
                                        <div className="edit-basic-info-form__label-container">
                                            <div className="edit-basic-info-form__emoji-container">
                                                <span>🌏</span>
                                            </div>
                                            <span className="edit-basic-info-form__label">
                                                {t("basicInfo.basedIn")}
                                            </span>
                                        </div>
                                        <div className="edit-basic-info-form__select-container">
                                            <CustomSelect
                                                id="basedCountry"
                                                value={basedCountry ?? ""}
                                                onValueChange={(v) =>
                                                    setValue("basedCountry", v, {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    })
                                                }
                                                placeholder={t("basicInfo.selectCountry")}
                                            >
                                                {Object.entries(countryOptions).map(([code, name]) => (
                                                    <CustomSelectItem key={code} value={code}>
                                                        {name}
                                                    </CustomSelectItem>
                                                ))}
                                            </CustomSelect>
                                        </div>
                                    </div>
                                    <hr className="about-me-screen__line" />
                                    <div className="edit-basic-info-form__info-part">
                                        <div className="edit-basic-info-form__label-container">
                                            <div className="edit-basic-info-form__emoji-container">
                                                <span>📍</span>
                                            </div>
                                            <span className="edit-basic-info-form__label">
                                                {t("basicInfo.workLocation")}
                                            </span>
                                        </div>
                                        <div className="edit-basic-info-form__location-container">
                                            <div className="edit-basic-info-form__options-container">
                                                {Object.entries(workLocationOptions).map((i) => (
                                                    <button
                                                        key={i[0]}
                                                        className={`
                                            edit-basic-info-form__option
                                            ${workLocationPreference === i[0] ? "edit-basic-info-form__option_selected" : ""}
                                        `}
                                                        style={{ width: "auto" }}
                                                        type="button"
                                                        onClick={() =>
                                                            handleWorkLocationPreferenceChange(i[0])
                                                        }
                                                    >
                                                        {i[1]}
                                                    </button>
                                                ))}
                                            </div>
                                            {workLocationPreference === "ukraine" && (
                                                <div className="edit-basic-info-form__regions">
                                                    {/* value stays empty: the select only adds a region, the chips below hold the selection */}
                                                    <CustomSelect
                                                        value=""
                                                        id="preferredRegions"
                                                        onValueChange={addRegion}
                                                        placeholder={t("basicInfo.regionsPlaceholder")}
                                                    >
                                                        {Object.entries(regionOptions)
                                                            .filter(
                                                                ([code]) =>
                                                                    !locations.some((l) => l.region === code),
                                                            )
                                                            .map(([code, name]) => (
                                                                <CustomSelectItem key={code} value={code}>
                                                                    {name}
                                                                </CustomSelectItem>
                                                            ))}
                                                    </CustomSelect>
                                                    {!!locations.length && (
                                                        <div className="edit-basic-info-form__selected-regions">
                                                            {locations.map(({ region }) => (
                                                                <button
                                                                    key={region}
                                                                    className="edit-basic-info-form__selected-region"
                                                                    type="button"
                                                                    onClick={() => removeRegion(region)}
                                                                >
                                                                    <span>{regionOptions[region]}</span>
                                                                    <img
                                                                        src={cancelIcon}
                                                                        alt=""
                                                                        aria-hidden="true"
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {hasSettlements && (
                                                        <>
                                                            {/* the same as the regions: it only adds, the chips hold the selection */}
                                                            <CustomSearchSelect
                                                                value=""
                                                                hideLabel
                                                                id="preferredCities"
                                                                onValueChange={addCity}
                                                                options={settlementOptions}
                                                                label={t("basicInfo.citiesPlaceholder")}
                                                                placeholder={t("basicInfo.citiesPlaceholder")}
                                                            />
                                                            {!!pickedCities.length && (
                                                                <div className="edit-basic-info-form__selected-regions">
                                                                    {pickedCities.map(({ region, city }) => (
                                                                        <button
                                                                            type="button"
                                                                            key={`${region}:${city}`}
                                                                            onClick={() =>
                                                                                removeCity(region, city)
                                                                            }
                                                                            className="edit-basic-info-form__selected-region"
                                                                        >
                                                                            <span>{city}</span>
                                                                            <img
                                                                                alt=""
                                                                                src={cancelIcon}
                                                                                aria-hidden="true"
                                                                            />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="edit-basic-info-form__footer">
                                    {showError && (
                                        <ErrorBlock
                                            className="edit-basic-info-form__error-block"
                                            message={tErrors("generic.tryAgainSoon")}
                                        />
                                    )}
                                    <div className="edit-basic-info-form__btns-container">
                                        <Dialog.Close asChild>
                                            <button
                                                className="edit-basic-info-form__btn edit-basic-info-form__btn_cancel"
                                                type="button"
                                            >
                                                {t("cancel")}
                                            </button>
                                        </Dialog.Close>
                                        <button
                                            className="edit-basic-info-form__btn edit-basic-info-form__btn_save"
                                            type="button"
                                            disabled={!isValid || !isDirty}
                                            onClick={handleClick}
                                        >
                                            {t("save")}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <DiscardChangesPopup
                                onCancel={() => setCurrentForm("main")}
                                onConfirm={onClose}
                            />
                        )}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default forwardRef<Handle, Props>(EditBasicInfoForm);
