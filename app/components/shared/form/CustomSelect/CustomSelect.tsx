import type { FC, ReactNode } from "react";
import { Select } from "radix-ui";

import { getPortalContainer } from "../../../../utils/portal-container";

interface Props extends Select.SelectProps {
    id: string;
    label?: string;
    error?: string;
    className?: string;
    isForLng?: boolean;
    children: ReactNode;
    hideLabel?: boolean;
    isRequired?: boolean;
    placeholder?: string;
    useTriggerWidth?: boolean;
}

export const CustomSelect: FC<Props> = ({
    id,
    error,
    label,
    children,
    className,
    placeholder,
    isForLng = false,
    hideLabel = false,
    isRequired = false,
    useTriggerWidth = true,
    ...props
}) => {
    const hasError = !!error;

    return (
        <Select.Root {...props}>
            <div className="customSelect__wrapper">
                {label && (
                    <p className={`customSelect__label ${hideLabel ? "visually-hidden" : ""}`}>
                        {label} {isRequired ? <span className="customInput__asterisk">*</span> : null}
                    </p>
                )}
                <Select.Trigger
                    id={id}
                    disabled={props.disabled}
                    className={`
						customSelect__trigger
                        ${className ? `${className}` : ""}
                        ${isForLng ? "customSelect__trigger--lng" : ""}
						${hasError ? "customSelect__trigger--error" : ""}
					`}
                >
                    <Select.Value placeholder={placeholder} />
                    <Select.Icon className="customSelect__icon">
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
                    </Select.Icon>
                </Select.Trigger>
                {hasError && (
                    <p role="alert" className="customSelect__error">
                        {error}
                    </p>
                )}
            </div>
            <Select.Portal container={getPortalContainer()}>
                <Select.Content
                    position="popper"
                    className={`customSelect__content ${useTriggerWidth ? "customSelect__content--triggerWidth" : ""}`}
                >
                    <Select.Viewport className="customSelect__viewport">{children}</Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};

interface SelectItemProps extends Select.SelectItemProps {
    children: ReactNode;
}

export const CustomSelectItem: FC<SelectItemProps> = ({ children, ...props }) => {
    return (
        <Select.Item {...props} className="customSelect__item">
            <Select.ItemText>{children}</Select.ItemText>
        </Select.Item>
    );
};
