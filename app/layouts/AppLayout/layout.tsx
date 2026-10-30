import { Outlet } from "react-router";

import AppHeader from "@/layouts/AppLayout/app-header/app-header";

import useCurrentUser from "@/hooks/useCurrentUser";
import { useHydrated } from "@/hooks/use-hydrated";

type Props = {
    className?: string;
    /** the server render already had the user (see routes/app-layout.tsx) */
    userKnown?: boolean;
};

/**
 * Never blanks the page: the server-rendered content below stays mounted
 * while the user is being looked up, and only the header's account block
 * waits for the answer.
 */
export default function Layout({ className, userKnown = false }: Props) {
    const { data: user, isPending } = useCurrentUser();
    // when the server could not tell who the visitor is, the header must not
    // know before hydration is over either — on a full load of /jobs/saved the
    // guard puts the user in the cache before React starts hydrating
    const hydrated = useHydrated();

    return (
        <div className={`layout ${className ?? ""}`}>
            <AppHeader
                className="layout__header"
                user={(!hydrated && !userKnown) || isPending ? undefined : (user ?? null)}
            />
            <Outlet />
        </div>
    );
}
