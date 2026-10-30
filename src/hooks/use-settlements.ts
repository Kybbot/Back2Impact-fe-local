import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";

export type Settlement = {
    name: string;
    /** the district; empty for the regional centres */
    region: string;
    type: string;
};

/**
 * One chunk per region, fetched the first time the region is picked: all of
 * them together are about 2.5 MB. Keyed by the region code the file is named
 * after — the same codes as `onboardingOptions.regions`. `kyiv` (the city) and
 * `crimea` have no file.
 */
const loaders = Object.fromEntries(
    Object.entries(import.meta.glob<Settlement[]>("@/data/settlements/*.json", { import: "default" })).map(
        ([path, load]) => [path.slice(path.lastIndexOf("/") + 1, -".json".length), load],
    ),
);

/**
 * How a settlement is sent to the API in `locations[].cities`: "село Андріївка,
 * Вишгородський", or "місто Київ" for a regional centre. Unique within a region.
 */
export const formatSettlement = ({ name, region, type }: Settlement) =>
    `${type} ${name}${region ? `, ${region}` : ""}`;

/**
 * The settlements of the given regions, keyed by region code. A region is
 * missing until its file has loaded, and for good if it has none; one that is
 * no longer given stays, so picking it again shows it straight away.
 */
export const useSettlements = (regions: string[]) => {
    const [loaded, setLoaded] = useState<Partial<Record<string, Settlement[]>>>({});
    // a string, so the effect runs when the set changes rather than on every new array
    const missing = regions.filter((region) => !loaded[region] && loaders[region]).join();

    useEffect(() => {
        if (!missing) return;

        for (const region of missing.split(",")) {
            loaders[region]()
                .then((settlements) => setLoaded((prev) => ({ ...prev, [region]: settlements })))
                .catch((e) => Sentry.captureException(e));
        }
    }, [missing]);

    return loaded;
};
