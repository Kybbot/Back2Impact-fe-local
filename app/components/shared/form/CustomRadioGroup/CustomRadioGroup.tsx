import type { FC, ReactNode } from "react";
import { RadioGroup } from "radix-ui";


interface Props extends RadioGroup.RadioGroupProps {
    id: string;
    label?: string;
    error?: string;
    children: ReactNode;
    isRequired?: boolean;
}

export const CustomRadioGroup: FC<Props> = ({ id, error, label, children, isRequired = false, ...props }) => {
    const hasError = !!error;

    return (
        <div className="customRadioGroup__wrapper">
            {label && (
                <p id={`${id}Label`} className="customRadioGroup__label">
                    {label} {isRequired ? <span className="customRadioGroup__asterisk">*</span> : null}
                </p>
            )}
            <RadioGroup.Root
                {...props}
                id={id}
                orientation="horizontal"
                aria-labelledby={label ? `${id}Label` : undefined}
                className={`
					customRadioGroup__root
					${hasError ? "customRadioGroup__root--error" : ""}
				`}
            >
                {children}
            </RadioGroup.Root>
            {hasError && (
                <p role="alert" className="customRadioGroup__error">
                    {error}
                </p>
            )}
        </div>
    );
};

interface RadioGroupItemProps extends RadioGroup.RadioGroupItemProps {
    children: ReactNode;
}

export const CustomRadioGroupItem: FC<RadioGroupItemProps> = ({ children, ...props }) => {
    return (
        <RadioGroup.Item {...props} className="customRadioGroup__item">
            {children}
        </RadioGroup.Item>
    );
};
