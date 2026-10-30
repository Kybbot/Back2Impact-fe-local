import { useState, type FocusEvent, type KeyboardEvent } from "react";

import { useT } from "@/i18n/use-t";

import { Input } from "@/components/shared/form/Input/Input";

type Props = {
    disabled: boolean;
    additionalEmail: string | null;
    onSave: (additionalEmail: string | null) => void;
};

/**
 * Saved on blur, like the rest of the page saves on click. Remounted by the
 * parent whenever the saved address changes, so a failed save that rolls
 * `me` back also puts the old address back into the field.
 */
function ApplicationsInbox({ disabled, additionalEmail, onSave }: Props) {
    const { t } = useT("employers");
    const { t: tErrors } = useT("errors");

    const [value, setValue] = useState(additionalEmail ?? "");
    const [error, setError] = useState<string>();

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        const next = value.trim();

        if (next === (additionalEmail ?? "")) return;

        // an empty field is valid too: it removes the address
        if (!event.currentTarget.checkValidity()) {
            setError(tErrors("validation.email"));

            return;
        }

        onSave(next || null);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") event.currentTarget.blur();
    };

    return (
        <section className="employer-settings__card employer-settings__section">
            <div className="employer-settings__section-header">
                <h2 className="employer-settings__section-heading">{t("settings.inbox.heading")}</h2>
                <p className="employer-settings__muted">{t("settings.inbox.description")}</p>
            </div>

            <Input
                type="email"
                value={value}
                error={error}
                disabled={disabled}
                autoComplete="email"
                id="additionalEmail"
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="employer-settings__input"
                label={t("settings.inbox.label")}
                placeholder={t("settings.inbox.placeholder")}
                onChange={(event) => {
                    setValue(event.target.value);
                    setError(undefined);
                }}
            />
        </section>
    );
}

export default ApplicationsInbox;
