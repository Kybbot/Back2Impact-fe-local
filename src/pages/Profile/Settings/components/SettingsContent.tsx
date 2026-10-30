import { type FC } from "react";
import { Switch } from "radix-ui";

import { DeleteAccountDialog } from "./DeleteAccountDialog";

import { useLogout } from "../../../../hooks/use-auth-mutations";
import { useChangeLanguage } from "../../../../hooks/use-change-language";
import { useChangeUserSettings } from "../../../../hooks/useChangeUserSettings";
import { LOCALE_TO_STORED, STORED_TO_LOCALE } from "../../../../i18n/stored-language";
import { useT } from "../../../../i18n/use-t";

import type { StoredLanguage } from "../../../../i18n/stored-language";
import type { GetUserSettingsType } from "../../../../services/user-service/types";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

type Props = {
    settings: GetUserSettingsType;
};

export const SettingsContent: FC<Props> = ({ settings }) => {
    const { t } = useT("profile");
    // clears the `me` query on success; the guard around /profile then sends
    // the visitor to the login page
    const logout = useLogout();

    const { newOpportunitiesEmails, applicationUpdatesEmails, profileVisibleToEmployers } = settings;

    const { isPending, mutate } = useChangeUserSettings();

    const { changeLanguage, isPending: isLngPending } = useChangeLanguage({
        silent: false,
        settings: {
            newOpportunitiesEmails,
            applicationUpdatesEmails,
            profileVisibleToEmployers,
        },
    });

    const isSaving = isPending || isLngPending;

    const handleChangeLng = (value: StoredLanguage) => {
        changeLanguage(STORED_TO_LOCALE[value]);
    };

    const handleChangeOptions = (
        key: "newOpportunitiesEmails" | "applicationUpdatesEmails" | "profileVisibleToEmployers",
        value: boolean,
    ) => {
        mutate({ body: { ...settings, [key]: value } });
    };

    return (
        <>
            <div className="settings__block settingsAccount">
                <h2 className="settings__title">{t("settings.account.title")}</h2>
                {/* <div className="settings__wrapper">
                    <div className="settings__text">
                        <p className="settings__subTitle">Email</p>
                        <p className="settings__description">olena@email.com</p>
                    </div>
                    <button type="button" className="settings__btn">
                        Change
                    </button>
                </div> */}
                <div className="settings__wrapper">
                    <div className="settings__text">
                        <p className="settings__subTitle">{t("settings.account.password")}</p>
                        <p className="settings__description">{t("settings.account.passwordHint")}</p>
                    </div>
                    <ChangePasswordDialog />
                </div>
                <div className="settings__wrapper">
                    <div className="settings__text">
                        <p className="settings__subTitle">{t("settings.account.language")}</p>
                        <p className="settings__description">{t("settings.account.languageHint")}</p>
                    </div>
                    <div className="settings__subBtns">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleChangeLng("ua")}
                            className={`settings__subBtn ${settings.language === LOCALE_TO_STORED.uk ? "settings__subBtn--active" : ""}`}
                        >
                            UA <span>🇺🇦</span>
                        </button>
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleChangeLng("en")}
                            className={`settings__subBtn ${settings.language === LOCALE_TO_STORED.en ? "settings__subBtn--active" : ""}`}
                        >
                            EN <span>🇬🇧</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="settings__block settingsNotifications">
                <h2 className="settings__title">{t("settings.notifications.title")}</h2>
                <div className="settings__wrapper settings__wrapper--grid">
                    <div className="settings__action">
                        <p className="settings__subTitle">{t("settings.notifications.opportunities")}</p>
                        <Switch.Root
                            disabled={isSaving}
                            checked={newOpportunitiesEmails}
                            className="setting__switch"
                            onCheckedChange={(checked) =>
                                handleChangeOptions("newOpportunitiesEmails", checked)
                            }
                        >
                            <Switch.Thumb className="setting__thumb" />
                        </Switch.Root>
                    </div>
                    <p className="settings__description">{t("settings.notifications.opportunitiesHint")}</p>
                </div>
                <div className="settings__wrapper settings__wrapper--grid">
                    <div className="settings__action">
                        <p className="settings__subTitle">{t("settings.notifications.updates")}</p>
                        <Switch.Root
                            checked={applicationUpdatesEmails}
                            disabled={isSaving}
                            className="setting__switch"
                            onCheckedChange={(checked) =>
                                handleChangeOptions("applicationUpdatesEmails", checked)
                            }
                        >
                            <Switch.Thumb className="setting__thumb" />
                        </Switch.Root>
                    </div>
                    <p className="settings__description">{t("settings.notifications.updatesHint")}</p>
                </div>
            </div>
            <div className="settings__block settingsPrivacy">
                <h2 className="settings__title">{t("settings.privacy.title")}</h2>
                <div className="settings__wrapper settings__wrapper--grid">
                    <div className="settings__action">
                        <p className="settings__subTitle">{t("settings.privacy.visible")}</p>
                        <Switch.Root
                            disabled={isSaving}
                            checked={profileVisibleToEmployers}
                            className="setting__switch"
                            onCheckedChange={(checked) =>
                                handleChangeOptions("profileVisibleToEmployers", checked)
                            }
                        >
                            <Switch.Thumb className="setting__thumb" />
                        </Switch.Root>
                    </div>
                    <p className="settings__description">{t("settings.privacy.visibleHint")}</p>
                </div>
            </div>
            <div className="settings__block settingsLogout">
                <div className="settings__wrapper">
                    <div className="settings__text">
                        <p className="settings__subTitle">{t("settings.logout.title")}</p>
                    </div>
                    <button
                        type="button"
                        className="settings__btn"
                        disabled={logout.isPending}
                        onClick={() => logout.mutate()}
                    >
                        {t("settings.logout.action")}
                    </button>
                </div>
            </div>
            <div className="settingsDelete">
                <div className="settings__wrapper settings__wrapper--delete">
                    <div className="settings__text">
                        <p className="settings__subTitle">{t("settings.delete.title")}</p>
                        <p className="settings__description">{t("settings.delete.hint")}</p>
                    </div>
                    <DeleteAccountDialog />
                </div>
            </div>
        </>
    );
};
