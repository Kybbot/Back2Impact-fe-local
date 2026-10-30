import { Controller, type Control, type ControllerProps, type FieldValues, type Path } from "react-hook-form";

import { RichTextEditor, type Props } from "./RichTextEditor";

type RichTextEditorRhfProps<TFormValues extends FieldValues, TTransformedValues> = {
    name: Path<TFormValues>;
    control: Control<TFormValues, unknown, TTransformedValues>;
    rules?: ControllerProps<TFormValues, Path<TFormValues>, TTransformedValues>["rules"];
} & Omit<Props, "id" | "value" | "onChange" | "onBlur" | "ref">;

/** the field keeps the editor's HTML, or "" while it has no text */
export const RichTextEditorRhf = <TFormValues extends FieldValues, TTransformedValues = TFormValues>({
    name,
    rules,
    control,
    ...props
}: RichTextEditorRhfProps<TFormValues, TTransformedValues>) => {
    return (
        <Controller
            name={name}
            rules={rules}
            control={control}
            render={({ field }) => (
                <RichTextEditor
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
