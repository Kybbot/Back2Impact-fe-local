import { useMemo } from "react";
import type { SearchSelectOption } from "@/components/shared/form/CustomSelect/CustomSearchSelect";
import { useOptionMap } from "@/i18n/options";
import type { BasicInfo } from "@/services/user-service/types";
import { formatSettlement, useSettlements } from "./use-settlements";

/** `cities: null` is the whole region */
export type Location = BasicInfo["locations"][number];

/**
 * "Київська область (місто Київ; село Андріївка, Вишгородський), Львівська
 * область". A city already has a comma in it, so the cities are split by ";".
 */
export const formatLocations = (locations: Location[], regionLabels: { [code: string]: string }) =>
    locations
        .map(({ region, cities }) =>
            cities ? `${regionLabels[region]} (${cities.join("; ")})` : regionLabels[region],
        )
        .join(", ");

/**
 * The region and settlement pickers of the work location, shared by the
 * onboarding and the profile: what the settlement select offers, and the
 * edits the selects and the chips make to `locations`.
 */
export const useLocations = (locations: Location[], onChange: (locations: Location[]) => void) => {
    const regionLabels = useOptionMap("regions");
    const settlements = useSettlements(locations.map((l) => l.region));

    // every settlement of the picked regions that is not picked itself
    const settlementOptions = useMemo<SearchSelectOption[]>(
        () =>
            locations
                .flatMap(({ region, cities }) =>
                    (settlements[region] ?? [])
                        .map((settlement) => ({ region, settlement, city: formatSettlement(settlement) }))
                        .filter(({ city }) => !cities?.includes(city)),
                )
                .map(({ region, settlement, city }) => ({
                    // a city is only unique within its region
                    value: JSON.stringify([region, city]),
                    label: `${settlement.type} ${settlement.name}`,
                    // the regional centres have no district
                    description: settlement.region || regionLabels[region],
                })),
        [locations, settlements, regionLabels],
    );

    const addCity = (value: string) => {
        const [region, city] = JSON.parse(value) as [string, string];

        onChange(locations.map((l) => (l.region === region ? { ...l, cities: [...(l.cities ?? []), city] } : l)));
    };

    const removeCity = (region: string, city: string) =>
        onChange(
            locations.map((l) => {
                if (l.region !== region) return l;

                const cities = (l.cities ?? []).filter((c) => c !== city);

                return { ...l, cities: cities.length ? cities : null };
            }),
        );

    return {
        settlementOptions,
        // `kyiv` (the city) and `crimea` have no settlements to offer
        hasSettlements: locations.some(({ region }) => settlements[region]),
        pickedCities: locations.flatMap(({ region, cities }) => (cities ?? []).map((city) => ({ region, city }))),
        addRegion: (region: string) => onChange([...locations, { region, cities: null }]),
        removeRegion: (region: string) => onChange(locations.filter((l) => l.region !== region)),
        addCity,
        removeCity,
    };
};
