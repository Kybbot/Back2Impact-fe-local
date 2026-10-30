import type { FieldValues, Path, RegisterOptions, UseFormRegister } from "react-hook-form";

import { Textarea, type Props } from "./Textarea";

type TextareaRhfProps<TFormValues extends FieldValues> = {
    label: string;
    error?: string;
    isRequired?: boolean;
    name: Path<TFormValues>;
    hideErrorMessage?: boolean;
    register: UseFormRegister<TFormValues>;
    rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
} & Omit<Props, "name">;

export const TextareaRhf = <TFormValues extends FieldValues>({
    name,
    label,
    error,
    rules,
    register,
    ...props
}: TextareaRhfProps<TFormValues>) => {
    return <Textarea id={name} label={label} error={error} {...props} {...register(name, rules)} />;
};
