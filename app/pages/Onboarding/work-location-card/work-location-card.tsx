import { useEffect } from "react";
import { useT } from "@/i18n/use-t";
import { useLocaleTag } from "@/i18n/use-locale";
import { Controller, useController, useFormContext, useWatch } from "react-hook-form";
import { useOutletContext } from "react-router";
import CardHeader from "../components/card-header/card-header";
import { CustomSelect, CustomSelectItem } from "@/components/shared/form/CustomSelect/CustomSelect";
import { CustomSearchSelect } from "@/components/shared/form/CustomSelect/CustomSearchSelect";
import { useLocations, type Location } from "@/hooks/use-locations";
import cancelIcon from "/img/cancel-icon.svg";

type Props = {
    className?: string;
};

type OnboardingContext = {
    options: {
        workLocationPreferences: { [key: string]: string };
        regions: { [key: string]: string };
    };
};

type FormValues = {
    workLocationPreference: string;
    locations: Location[];
};

function WorkLocationCard({ className }: Props) {
    const { t } = useT("onboarding");
    const localeTag = useLocaleTag();
    const { options } = useOutletContext<OnboardingContext>();
    const { setValue, control } = useFormContext<FormValues>();
    const workLocationPreference = useWatch({ name: "workLocationPreference" });

    const {
        field: { value: locations, onChange: setLocations },
    } = useController({ control, name: "locations" });

    const { settlementOptions, hasSettlements, pickedCities, addRegion, removeRegion, addCity, removeCity } =
        useLocations(locations, setLocations);

    useEffect(() => {
        if (workLocationPreference !== "ukraine") setValue("locations", []);
    }, [workLocationPreference]);

    return (
        <div className={`work-location-card ${className}`}>
            <CardHeader heading={t("workLocation.heading")} description={t("workLocation.description")} />
            <div className="work-location-card__main">
                <Controller
                    name="workLocationPreference"
                    control={control}
                    render={({ field }) => (
                        <div className="work-location-card__options-container">
                            {Object.entries(options.workLocationPreferences).map((i) => (
                                <button
                                    key={i[0]}
                                    className={`
                                    work-location-card__option
                                    ${field.value === i[0] ? "work-location-card__option_selected" : ""}
                                `}
                                    type="button"
                                    onClick={() => field.onChange(i[0])}
                                >
                                    {i[1]}
                                </button>
                            ))}
                        </div>
                    )}
                />
                {workLocationPreference === "ukraine" && (
                    <div className="work-location-card__regions">
                        {/* value stays empty: the select only adds a region, the chips below hold the selection */}
                        <CustomSelect
                            value=""
                            id="preferredRegions"
                            className="work-location-card__select"
                            placeholder={t("workLocation.regionsPlaceholder")}
                            onValueChange={addRegion}
                        >
                            {Object.entries(options.regions)
                                .filter(([code]) => !locations.some((l) => l.region === code))
                                .sort(([, a], [, b]) => a.localeCompare(b, localeTag))
                                .map(([code, name]) => (
                                    <CustomSelectItem key={code} value={code}>
                                        {name}
                                    </CustomSelectItem>
                                ))}
                        </CustomSelect>
                        {!!locations.length && (
                            <div className="work-location-card__selected-regions">
                                {locations.map(({ region }) => (
                                    <button
                                        key={region}
                                        type="button"
                                        className="work-location-card__selected-region"
                                        onClick={() => removeRegion(region)}
                                    >
                                        <span>{options.regions[region]}</span>
                                        <img src={cancelIcon} alt="" aria-hidden="true" />
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
                                    className="work-location-card__select"
                                    label={t("workLocation.citiesPlaceholder")}
                                    placeholder={t("workLocation.citiesPlaceholder")}
                                />
                                {!!pickedCities.length && (
                                    <div className="work-location-card__selected-regions">
                                        {pickedCities.map(({ region, city }) => (
                                            <button
                                                type="button"
                                                key={`${region}:${city}`}
                                                onClick={() => removeCity(region, city)}
                                                className="work-location-card__selected-region"
                                            >
                                                <span>{city}</span>
                                                <img src={cancelIcon} alt="" aria-hidden="true" />
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
    );
}

export default WorkLocationCard;
