import type { ReactNode } from "react";
import type { FieldValues, Path, RegisterOptions, UseFormRegister } from "react-hook-form";

import { Checkbox, type CheckboxProps } from "./Checkbox";

type CheckboxRhfProps<TFormValues extends FieldValues> = {
    label: ReactNode;
    error?: string;
    name: Path<TFormValues>;
    register: UseFormRegister<TFormValues>;
    rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
} & Omit<CheckboxProps, "name">;

export const CheckboxRhf = <TFormValues extends FieldValues>({
    name,
    label,
    rules,
    error,
    register,
    ...props
}: CheckboxRhfProps<TFormValues>) => {
    return <Checkbox id={name} label={label} error={error} {...props} {...register(name, rules)} />;
};
