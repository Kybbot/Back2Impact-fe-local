import { useLocation, useNavigate } from "react-router";

import useCurrentUser from "./useCurrentUser";
import { useChangeUserSettings } from "./useChangeUserSettings";
import { getEmployerSettings, useChangeEmployerSettings } from "./useChangeEmployerSettings";

import type { Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/use-locale";
import { switchLocalePath } from "@/i18n/locale";
import { rememberLocale } from "@/i18n/locale-cookie";
import { LOCALE_TO_STORED } from "@/i18n/stored-language";

import type { ChangeUserSettingsBodyType } from "@/services/user-service/types";

type SettingsFields = Omit<ChangeUserSettingsBodyType, "language">;

type Options = {
    silent?: boolean;
    settings?: SettingsFields;
};

export const useChangeLanguage = ({ silent = true, settings }: Options = {}) => {
    const locale = useLocale();
    const location = useLocation();
    const navigate = useNavigate();

    const { data: user } = useCurrentUser();
    const { mutate, isPending } = useChangeUserSettings({ silent });
    const employerSettings = useChangeEmployerSettings({ silent });

    /** remembers the choice and stores it on the account, without leaving the page */
    const saveLanguage = (next: Locale) => {
        rememberLocale(next);

        const language = LOCALE_TO_STORED[next];

        // employers keep their preferences behind an endpoint of their own
        if (user?.role === "employer") {
            employerSettings.mutate({ body: { ...getEmployerSettings(user), language } });
        } else {
            const fields: SettingsFields | undefined =
                settings ??
                (user
                    ? {
                          newOpportunitiesEmails: user.newOpportunitiesEmails,
                          applicationUpdatesEmails: user.applicationUpdatesEmails,
                          profileVisibleToEmployers: user.profileVisibleToEmployers,
                      }
                    : undefined);

            if (user && fields) mutate({ body: { language, ...fields } });
        }
    };

    const changeLanguage = (next: Locale) => {
        saveLanguage(next);

        if (next !== locale) navigate(switchLocalePath(location, next));
    };

    return { changeLanguage, saveLanguage, isPending: isPending || employerSettings.isPending };
};
