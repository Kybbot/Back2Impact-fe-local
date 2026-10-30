import { type FC } from "react";
import { DropdownMenu } from "radix-ui";

import { UserBadgeContent } from "@/components/shared/user-badge/user-badge";

import { useT } from "@/i18n/use-t";
import { Link } from "@/i18n/navigation";

import { useLogout } from "@/hooks/use-auth-mutations";

import type { UserData } from "@/services/user-service/types";

import { getProfilePath } from "@/utils/home-path";
import { getPortalContainer } from "@/utils/portal-container";

type Props = {
    user: UserData;
};

export const MainUserMenu: FC<Props> = ({ user }) => {
    const { t } = useT("home");
    const logout = useLogout();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className="app-header__user-block mainUserMenu__trigger">
                <UserBadgeContent user={user} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal container={getPortalContainer()}>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    collisionPadding={16}
                    className="mainUserMenu"
                >
                    <DropdownMenu.Item asChild className="mainUserMenu__item">
                        <Link to={getProfilePath(user)}>{t("nav.profile")}</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        disabled={logout.isPending}
                        className="mainUserMenu__item"
                        onSelect={() => logout.mutate()}
                    >
                        {t("nav.logout")}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
