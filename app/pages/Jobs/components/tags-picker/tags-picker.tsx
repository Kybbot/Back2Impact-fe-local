type Option = {
    /** the value sent to the API */
    code: string;
    /** what the tag reads in the current language */
    label: string;
};

type Props = {
    options: Option[];
    value: string[];
    className?: string;
    onChange: (value: string) => void;
};

/**
 * Takes `{ code, label }` rather than bare strings: the tag has to display a
 * translated label while still toggling the API code the filter sends.
 */
function TagsPicker({ className, options, value, onChange }: Props) {
    return (
        <div className={`tags-picker ${className ?? ""}`}>
            {options.map(({ code, label }) => {
                const selected = value.includes(code);

                return (
                    <button
                        key={code}
                        className={`
                    tags-picker__tile
                    ${selected ? "tags-picker__tile_selected" : ""}
                `}
                        type="button"
                        onClick={() => onChange(code)}
                    >
                        #{label}
                    </button>
                );
            })}
        </div>
    );
}

export default TagsPicker;
