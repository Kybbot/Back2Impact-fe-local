import AccountDetails from "./account-details";
import ApplicationsInbox from "./applications-inbox";
import EmailNotifications from "./email-notifications";

import { useT } from "@/i18n/use-t";

import { DeleteAccountDialog } from "@/pages/Profile/Settings/components/DeleteAccountDialog";

import useCurrentUser from "@/hooks/useCurrentUser";
import { getEmployerSettings, useChangeEmployerSettings } from "@/hooks/useChangeEmployerSettings";

import type { ChangeEmployerSettingsBodyType } from "@/services/user-service/types";

function EmployerSettings() {
    const { t } = useT("employers");
    const { data: user } = useCurrentUser();

    const { isPending, mutate } = useChangeEmployerSettings();

    if (!user) return;

    const settings = getEmployerSettings(user);

    // the endpoint takes the whole set, so every change is sent on top of the saved one
    const handleChange = (patch: Partial<ChangeEmployerSettingsBodyType>) => {
        mutate({ body: { ...settings, ...patch } });
    };

    return (
        <div className="employer-settings">
            <section className="employer-settings__card employer-settings__header">
                <div className="employer-settings__emoji-container" aria-hidden="true">
                    <span>⚙️</span>
                </div>
                <div className="employer-settings__header-text">
                    <h1 className="employer-settings__heading">{t("settings.heading")}</h1>
                    <p className="employer-settings__muted">{t("settings.description")}</p>
                </div>
            </section>

            <EmailNotifications
                email={user.email}
                settings={settings}
                disabled={isPending}
                onChange={handleChange}
            />

            <ApplicationsInbox
                key={settings.additionalEmail ?? ""}
                disabled={isPending}
                additionalEmail={settings.additionalEmail}
                onSave={(additionalEmail) => handleChange({ additionalEmail })}
            />

            <AccountDetails user={user} />

            <div className="settingsDelete employer-settings__delete">
                <div className="settings__wrapper settings__wrapper--delete">
                    <div className="settings__text">
                        <p className="settings__subTitle">{t("settings.delete.title")}</p>
                        <p className="settings__description">{t("settings.delete.hint")}</p>
                    </div>
                    <DeleteAccountDialog />
                </div>
            </div>
        </div>
    );
}

export default EmployerSettings;
