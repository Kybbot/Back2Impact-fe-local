import { type DetailedHTMLProps, type InputHTMLAttributes, type FC } from "react";


export type Props = {
    label: string;
    error?: string;
    isRequired?: boolean;
    hideErrorMessage?: boolean;
} & Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "size" | "ref">;

export const Input: FC<Props> = ({
    id,
    label,
    error,
    className,
    isRequired = false,
    hideErrorMessage = false,
    ...props
}) => {
    const hasError = !!error;

    return (
        <div className={`customInput ${className ? className : ""}`}>
            <label htmlFor={id} className="customInput__label">
                {label} {isRequired ? <span className="customInput__asterisk">*</span> : null}
            </label>

            <input
                id={id}
                {...props}
                aria-invalid={hasError ? "true" : "false"}
                className={`customInput__field ${hasError ? "customInput__field--error" : ""}`}
            />

            {hasError && !hideErrorMessage && (
                <p role="alert" className="customInput__error">
                    {error}
                </p>
            )}
        </div>
    );
};
