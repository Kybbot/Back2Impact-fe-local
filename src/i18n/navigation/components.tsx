import {
    Link as RouterLink,
    NavLink as RouterNavLink,
    Navigate as RouterNavigate,
} from "react-router";

import type { LinkProps, NavLinkProps, NavigateProps } from "react-router";

import { useLocalizeTo } from "./use-localize-to";

export function Link({ to, ...props }: LinkProps) {
    const localize = useLocalizeTo();

    return <RouterLink {...props} to={localize(to)} />;
}

export function NavLink({ to, ...props }: NavLinkProps) {
    const localize = useLocalizeTo();

    return <RouterNavLink {...props} to={localize(to)} />;
}

export function Navigate({ to, ...props }: NavigateProps) {
    const localize = useLocalizeTo();

    return <RouterNavigate {...props} to={localize(to)} />;
}
