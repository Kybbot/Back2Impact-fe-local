import { Controller, type Control, type ControllerProps, type FieldValues, type Path } from "react-hook-form";

import { DatePicker, type Props } from "./DatePicker";

type DatePickerRhfProps<TFormValues extends FieldValues, TTransformedValues> = {
    name: Path<TFormValues>;
    control: Control<TFormValues, unknown, TTransformedValues>;
    rules?: ControllerProps<TFormValues, Path<TFormValues>, TTransformedValues>["rules"];
} & Omit<Props, "id" | "value" | "onChange" | "onBlur" | "ref">;

/** the field keeps the picked day as a `yyyy-mm-dd` string */
export const DatePickerRhf = <TFormValues extends FieldValues, TTransformedValues = TFormValues>({
    name,
    rules,
    control,
    ...props
}: DatePickerRhfProps<TFormValues, TTransformedValues>) => {
    return (
        <Controller
            name={name}
            rules={rules}
            control={control}
            render={({ field }) => (
                <DatePicker
                    id={name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    {...props}
                />
            )}
        />
    );
};
