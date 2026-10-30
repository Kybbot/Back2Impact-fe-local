import { useMemo } from "react";
import { useNavigate as useRouterNavigate } from "react-router";

import type { NavigateFunction, NavigateOptions, To } from "react-router";

import { useLocalizeTo } from "./use-localize-to";

export function useNavigate(): NavigateFunction {
    const navigate = useRouterNavigate();
    const localize = useLocalizeTo();

    return useMemo(() => {
        const localizedNavigate = (to: To | number, options?: NavigateOptions) => {
            // `navigate(-1)` walks history and has no path to localize
            if (typeof to === "number") return navigate(to);

            return navigate(localize(to), options);
        };

        return localizedNavigate as NavigateFunction;
    }, [navigate, localize]);
}
