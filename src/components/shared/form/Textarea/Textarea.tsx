import type { DetailedHTMLProps, TextareaHTMLAttributes, FC } from "react";

export type Props = {
    label: string;
    error?: string;
    isRequired?: boolean;
    hideErrorMessage?: boolean;
} & Omit<DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "size" | "ref">;

export const Textarea: FC<Props> = ({
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
        <div className={`customTextarea ${className ? className : ""}`}>
            <label htmlFor={id} className="customTextarea__label">
                {label} {isRequired ? <span className="customInput__asterisk">*</span> : null}
            </label>

            <textarea
                id={id}
                {...props}
                aria-invalid={hasError ? "true" : "false"}
                className={`customTextarea__field ${hasError ? "customTextarea__field--error" : ""}`}
            />

            {hasError && !hideErrorMessage && (
                <p role="alert" className="customTextarea__error">
                    {error}
                </p>
            )}
        </div>
    );
};
