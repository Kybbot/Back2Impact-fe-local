import { useState, type Ref } from "react";
import { Popover } from "radix-ui";
import { DayPicker, type Matcher } from "@daypicker/react";
import { enUS, uk, type DayPickerLocale } from "@daypicker/react/locale";

import { useT } from "@/i18n/use-t";
import type { Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/use-locale";

import { parseDateValue, toDateValue } from "@/utils/date";
import { getPortalContainer } from "@/utils/portal-container";

/** the calendar's month and weekday names and its aria labels, in the page's language */
const CALENDAR_LOCALES: Record<Locale, DayPickerLocale> = { uk, en: enUS };

export type Props = {
    id: string;
    label: string;
    /** `yyyy-mm-dd`, or "" when no day is picked */
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    /** on the trigger, so a form can focus it */
    ref?: Ref<HTMLButtonElement>;
    /** the first day that can be picked, `yyyy-mm-dd` */
    min?: string;
    /** the last day that can be picked, `yyyy-mm-dd` */
    max?: string;
    error?: string;
    isRequired?: boolean;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
};

export const DatePicker = ({
    id,
    label,
    value,
    onChange,
    onBlur,
    ref,
    min,
    max,
    error,
    isRequired = false,
    placeholder,
    className,
    disabled,
}: Props) => {
    const { t } = useT("common");
    const locale = useLocale();

    const [open, setOpen] = useState(false);

    const hasError = !!error;
    const selected = parseDateValue(value);
    const minDate = min ? parseDateValue(min) : undefined;
    const maxDate = max ? parseDateValue(max) : undefined;

    const disabledDays: Matcher[] = [];
    if (minDate) disabledDays.push({ before: minDate });
    if (maxDate) disabledDays.push({ after: maxDate });

    // the field is touched once the calendar is closed, not when focus moves into it
    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) onBlur?.();
    };

    const handleSelect = (date: Date | undefined) => {
        onChange(date ? toDateValue(date) : "");
        handleOpenChange(false);
    };

    return (
        <div className={`customInput datePicker ${className ? className : ""}`}>
            <label htmlFor={id} className="customInput__label">
                {label} {isRequired ? <span className="customInput__asterisk">*</span> : null}
            </label>

            <Popover.Root open={open} onOpenChange={handleOpenChange}>
                <Popover.Trigger asChild>
                    <button
                        id={id}
                        ref={ref}
                        type="button"
                        disabled={disabled}
                        aria-invalid={hasError ? "true" : "false"}
                        data-placeholder={selected ? undefined : ""}
                        className={`customInput__field datePicker__trigger ${hasError ? "customInput__field--error" : ""}`}
                    >
                        {/* `dd.mm.yyyy` in every language; a picked value is a valid `yyyy-mm-dd` */}
                        {selected
                            ? value.split("-").reverse().join(".")
                            : (placeholder ?? t("datePicker.placeholder"))}
                        <svg
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="datePicker__icon"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke="#838383"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 3V6M16 3V6M3.5 9.5H20.5M5.5 4.5H18.5C19.6 4.5 20.5 5.4 20.5 6.5V18.5C20.5 19.6 19.6 20.5 18.5 20.5H5.5C4.4 20.5 3.5 19.6 3.5 18.5V6.5C3.5 5.4 4.4 4.5 5.5 4.5Z"
                            />
                        </svg>
                    </button>
                </Popover.Trigger>
                <Popover.Portal container={getPortalContainer()}>
                    <Popover.Content
                        side="bottom"
                        align="start"
                        sideOffset={4}
                        collisionPadding={16}
                        className="datePicker__content"
                        // the calendar's own focus target (the picked day, else today, else the first one
                        // that can be picked) rather than its first button; no scroll while it is positioned
                        onOpenAutoFocus={(event) => {
                            event.preventDefault();
                            (event.currentTarget as HTMLElement)
                                .querySelector<HTMLButtonElement>('.rdp-day_button[tabindex="0"]')
                                ?.focus({ preventScroll: true });
                        }}
                    >
                        <DayPicker
                            mode="single"
                            // a required day can't be unpicked by clicking it again
                            required={isRequired}
                            selected={selected}
                            onSelect={handleSelect}
                            disabled={disabledDays}
                            defaultMonth={selected ?? minDate}
                            startMonth={minDate}
                            endMonth={maxDate}
                            locale={CALENDAR_LOCALES[locale]}
                        />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            {hasError && (
                <p role="alert" className="customInput__error">
                    {error}
                </p>
            )}
        </div>
    );
};
