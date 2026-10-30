import { Trans } from "react-i18next";

import { useT } from "@/i18n/use-t";

import { Checkbox } from "@/components/shared/checkbox/checkbox";

import type { ChangeEmployerSettingsBodyType, EmployerWhenApplies } from "@/services/user-service/types";

const WHEN_APPLIES_OPTIONS: EmployerWhenApplies[] = ["email_straight_away", "one_daily_summary", "dont_email_me"];

const ALSO_EMAIL_OPTIONS = [
    "emailWhenVacancyPassesReview",
    "emailWhenVacancyIsAboutToExpire",
    "emailWeeklySummary",
] as const;

type Props = {
    email: string;
    disabled: boolean;
    settings: ChangeEmployerSettingsBodyType;
    onChange: (patch: Partial<ChangeEmployerSettingsBodyType>) => void;
};

function EmailNotifications({ email, disabled, settings, onChange }: Props) {
    const { t } = useT("employers");

    return (
        <section className="employer-settings__card employer-settings__section">
            <div className="employer-settings__section-header">
                <h2 className="employer-settings__section-heading">{t("settings.notifications.heading")}</h2>
                <p className="employer-settings__muted">
                    <Trans
                        t={t}
                        i18nKey="settings.notifications.recipient"
                        values={{ email }}
                        components={{ email: <strong className="employer-settings__email" /> }}
                    />
                </p>
            </div>

            <div className="employer-settings__group">
                <p className="employer-settings__label">{t("settings.notifications.whenApplies.label")}</p>
                <div className="settings__subBtns employer-settings__options">
                    {WHEN_APPLIES_OPTIONS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            disabled={disabled}
                            aria-pressed={settings.whenApplies === option}
                            onClick={() => onChange({ whenApplies: option })}
                            className={`settings__subBtn ${settings.whenApplies === option ? "settings__subBtn--active" : ""}`}
                        >
                            {t(`settings.notifications.whenApplies.${option}`)}
                        </button>
                    ))}
                </div>
                <p className="employer-settings__hint">{t("settings.notifications.whenApplies.hint")}</p>
            </div>

            <div className="employer-settings__group">
                <p className="employer-settings__label">{t("settings.notifications.also.label")}</p>
                <div className="employer-settings__checkboxes">
                    {ALSO_EMAIL_OPTIONS.map((option) => (
                        <Checkbox
                            key={option}
                            disabled={disabled}
                            checked={settings[option]}
                            label={t(`settings.notifications.also.${option}`)}
                            onChange={(event) => onChange({ [option]: event.target.checked })}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default EmailNotifications;
