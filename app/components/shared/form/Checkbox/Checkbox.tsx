import { type DetailedHTMLProps, forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type Ref = HTMLInputElement;

export type CheckboxProps = {
    error?: string;
    label: ReactNode;
    hideLabel?: boolean;
    isLabelBefore?: boolean;
} & Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "size" | "ref">;

export const Checkbox = forwardRef<Ref, CheckboxProps>(
    ({ id, label, error, className, hideLabel = false, isLabelBefore = false, ...props }, forwardedRef) => {
        const hasError = !!error;

        return (
            <div
                ref={forwardedRef}
                className={`customCheckbox ${className ? className : ""} ${hasError ? "customCheckbox--error" : ""}`}
            >
                {isLabelBefore && (
                    <label
                        htmlFor={id}
                        className={`
                            customCheckbox__label
                            ${hideLabel ? "srOnly" : ""}
                            ${props.disabled ? "customCheckbox__label--disabled" : ""}
                        `}
                    >
                        {label}
                    </label>
                )}
                <div className="customCheckbox__stack">
                    <div className="customCheckbox__square"></div>
                    <svg
                        width="14"
                        height="14"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="customCheckbox__icon"
                    >
                        <path
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            d="M20 6L9 17L4 12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        id={id}
                        {...props}
                        type="checkbox"
                        className={`customCheckbox__field`}
                        aria-invalid={hasError ? "true" : "false"}
                    />
                </div>
                {!isLabelBefore && (
                    <label
                        htmlFor={id}
                        className={`
                            customCheckbox__label
                            ${hideLabel ? "srOnly" : ""}
                            ${props.disabled ? "customCheckbox__label--disabled" : ""}
                        `}
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    },
);
