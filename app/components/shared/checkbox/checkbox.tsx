import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label?: ReactNode;
    labelClass?: string;
    controlClassName?: string;
};
// LEGACY COMPONENT; NEW -> form/Checkbox
export function Checkbox({
    label,
    checked,
    onChange,
    disabled,
    labelClass,
    controlClassName,
    ...props
}: CheckboxProps) {
    return (
        <label className="checkbox">
            <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} {...props} />

            <span className={`checkbox__control ${controlClassName}`}>
                {checked && (
                    <svg viewBox="0 0 24 24" className="checkbox__icon">
                        <path
                            d="M20 6L9 17L4 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </span>

            {label && <span className={`checkbox__label ${labelClass ? labelClass : ""}`}>{label}</span>}
        </label>
    );
}
