import {
    useCallback,
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
    type MouseEvent,
} from "react";
import { Popover } from "radix-ui";

import { useT } from "@/i18n/use-t";
import { getPortalContainer } from "@/utils/portal-container";

export type SearchSelectOption = {
    value: string;
    label: string;
    description?: string;
};

interface Props {
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    /** in the order the list shows them while nothing is typed */
    options: SearchSelectOption[];
    onBlur?: () => void;
    label?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
    hideLabel?: boolean;
    isRequired?: boolean;
    placeholder?: string;
}

/**
 * The options whose label contains the query, ignoring case. Those with a word
 * that starts with it come first: "an" lists Andorra and Angola before
 * Afghanistan. Otherwise the given order is kept.
 */
const filterOptions = (options: SearchSelectOption[], query: string) => {
    const needle = query.trim().toLocaleLowerCase();

    if (!needle) return options;

    const wordStart: SearchSelectOption[] = [];
    const inside: SearchSelectOption[] = [];

    for (const option of options) {
        const label = option.label.toLocaleLowerCase();

        if (!label.includes(needle)) continue;

        if (label.split(/[\s-]+/).some((word) => word.startsWith(needle))) wordStart.push(option);
        else inside.push(option);
    }

    return [...wordStart, ...inside];
};

/**
 * Scrolls the list, and only the list, so the option is in view. `scrollIntoView`
 * would also scroll the page while the popover is still being positioned.
 */
const scrollToOption = (list: HTMLElement | null, index: number) => {
    const option = list?.children[index] as HTMLElement | undefined;

    if (!list || !option) return;

    if (option.offsetTop < list.scrollTop) {
        list.scrollTop = option.offsetTop;
    } else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
};

const stopPropagation = (event: Event) => event.stopPropagation();

/**
 * Keeps the list scrollable inside a modal Radix Dialog. The Dialog cancels
 * wheel and touch scrolling outside its content from a listener on the
 * document, and the list is portaled out of that content — so its scroll
 * events are stopped before they get there, and the browser scrolls it as
 * usual. The page behind stays locked: the Dialog hides its overflow too.
 *
 * Native listeners on the list itself: React's are on the document as well
 * (the app hydrates `document`), too late to keep the Dialog's from running.
 */
const isolateScroll = (list: HTMLElement) => {
    list.addEventListener("wheel", stopPropagation, { passive: true });
    list.addEventListener("touchmove", stopPropagation, { passive: true });

    return () => {
        list.removeEventListener("wheel", stopPropagation);
        list.removeEventListener("touchmove", stopPropagation);
    };
};

/**
 * `CustomSelect` with a search field: typing filters the list, the arrow keys
 * move through what is left and Enter picks it. Radix Select has no room for
 * an input — it moves focus onto its items — so this is a combobox on a Radix
 * Popover, dressed in the same `customSelect__*` styles.
 */
export const CustomSearchSelect = ({
    id,
    value,
    onValueChange,
    options,
    onBlur,
    label,
    error,
    className,
    disabled = false,
    hideLabel = false,
    isRequired = false,
    placeholder,
}: Props) => {
    const { t } = useT("common");

    const [open, setOpen] = useState(false);
    /** what is typed; `null` while nothing is, and the input shows the picked option */
    const [query, setQuery] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const listboxId = useId();

    // the list mounts and unmounts with the popover, so a ref callback rather than an effect
    const setListRef = useCallback((list: HTMLUListElement | null) => {
        listRef.current = list;

        if (!list) return;

        const cleanup = isolateScroll(list);

        return () => {
            cleanup();
            listRef.current = null;
        };
    }, []);

    const hasError = !!error;
    const selected = options.find((option) => option.value === value);
    const visibleOptions = query === null ? options : filterOptions(options, query);
    const activeOption = visibleOptions[activeIndex];

    const optionId = (index: number) => `${listboxId}-${index}`;

    const openList = () => {
        if (open || disabled) return;

        setOpen(true);
        // the arrow keys carry on from the picked option
        setActiveIndex(options.findIndex((option) => option.value === value));
    };

    // the field is touched once the list is closed, as with `DatePicker`
    const closeList = () => {
        setOpen(false);
        setQuery(null);
        onBlur?.();
    };

    const pick = (option: SearchSelectOption) => {
        onValueChange(option.value);
        closeList();
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextQuery = event.target.value;

        setQuery(nextQuery);
        // the best match, so Enter picks it right away
        setActiveIndex(nextQuery.trim() ? 0 : -1);
        if (listRef.current) listRef.current.scrollTop = 0;
        setOpen(true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            if (!open) {
                openList();
                return;
            }

            if (!visibleOptions.length) return;

            const step = event.key === "ArrowDown" ? 1 : -1;
            const nextIndex =
                activeIndex < 0
                    ? step > 0
                        ? 0
                        : visibleOptions.length - 1
                    : (activeIndex + step + visibleOptions.length) % visibleOptions.length;

            setActiveIndex(nextIndex);
            scrollToOption(listRef.current, nextIndex);
        }

        if (event.key === "Enter" && open) {
            // inside a form it would submit it
            event.preventDefault();
            if (activeOption) pick(activeOption);
        }
    };

    const handleInputClick = (event: MouseEvent<HTMLInputElement>) => {
        if (open) return;

        openList();
        // typing replaces the picked option rather than adding to it
        event.currentTarget.select();
    };

    // the arrow and the padding around the input toggle the list, as on `CustomSelect`
    const handleFieldMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (disabled || event.target === inputRef.current) return;

        event.preventDefault();
        inputRef.current?.focus();

        if (open) closeList();
        else openList();
    };

    return (
        <div className="customSelect__wrapper">
            {label && (
                <label htmlFor={id} className={`customSelect__label ${hideLabel ? "visually-hidden" : ""}`}>
                    {label} {isRequired ? <span className="customInput__asterisk">*</span> : null}
                </label>
            )}
            <Popover.Root open={open} onOpenChange={(nextOpen) => (nextOpen ? openList() : closeList())}>
                <Popover.Anchor asChild>
                    <div
                        ref={fieldRef}
                        data-state={open ? "open" : "closed"}
                        data-disabled={disabled ? "" : undefined}
                        onMouseDown={handleFieldMouseDown}
                        className={`
                            customSelect__trigger
                            customSearchSelect__field
                            ${className ? `${className}` : ""}
                            ${hasError ? "customSelect__trigger--error" : ""}
                        `}
                    >
                        <input
                            ref={inputRef}
                            id={id}
                            type="text"
                            role="combobox"
                            autoComplete="off"
                            aria-autocomplete="list"
                            aria-expanded={open}
                            aria-controls={listboxId}
                            aria-activedescendant={open && activeOption ? optionId(activeIndex) : undefined}
                            aria-invalid={hasError ? "true" : "false"}
                            value={query ?? selected?.label ?? ""}
                            placeholder={placeholder}
                            disabled={disabled}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onClick={handleInputClick}
                            className="customSearchSelect__input"
                        />
                        <span className="customSelect__icon" aria-hidden="true">
                            <svg
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    stroke="#838383"
                                    strokeWidth="1.5"
                                    d="M16 10L12 14L8 10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </div>
                </Popover.Anchor>
                {hasError && (
                    <p role="alert" className="customSelect__error">
                        {error}
                    </p>
                )}
                <Popover.Portal container={getPortalContainer()}>
                    <Popover.Content
                        side="bottom"
                        align="start"
                        collisionPadding={16}
                        className="customSelect__content customSearchSelect__content"
                        // the focus stays in the input, and the list opens on the picked option
                        onOpenAutoFocus={(event) => {
                            event.preventDefault();
                            scrollToOption(listRef.current, activeIndex);
                        }}
                        onCloseAutoFocus={(event) => event.preventDefault()}
                        // the field toggles the list itself, see `handleFieldMouseDown`
                        onInteractOutside={(event) => {
                            if (fieldRef.current?.contains(event.target as Node)) event.preventDefault();
                        }}
                    >
                        <ul
                            role="listbox"
                            id={listboxId}
                            ref={setListRef}
                            className="customSearchSelect__list"
                        >
                            {visibleOptions.map((option, index) => (
                                <li
                                    role="option"
                                    key={option.value}
                                    id={optionId(index)}
                                    className="customSelect__item"
                                    aria-selected={option.value === value}
                                    data-highlighted={index === activeIndex ? "" : undefined}
                                    data-state={option.value === value ? "checked" : "unchecked"}
                                    // keeps the focus in the input
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseMove={() => setActiveIndex(index)}
                                    onClick={() => pick(option)}
                                >
                                    {option.description ? (
                                        <span className="customSearchSelect__option-text">
                                            {option.label}
                                            <span className="customSearchSelect__option-description">
                                                {option.description}
                                            </span>
                                        </span>
                                    ) : (
                                        option.label
                                    )}
                                </li>
                            ))}
                        </ul>
                        {!visibleOptions.length && (
                            <p className="customSearchSelect__empty">{t("searchSelect.noResults")}</p>
                        )}
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
};
