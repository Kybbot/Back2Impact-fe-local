
type Props = {
    value: string[];
    options: { [key: string]: string };
    onChange: (value: string[]) => void;
    className: string;
    optionClassName: string;
    selectedOptionClassName: string;
}

function MultiSelectTiles({
    className,
    optionClassName,
    selectedOptionClassName,
    value,
    options,
    onChange
}: Props) {
    const toggle = (id: string) => {
        if(value.includes(id)) onChange(value.filter(v => v !== id));
        else onChange([...value, id,]);
    }

    return (<div className={className}>
        {Object.entries(options).map(i => (
            <button
                key={i[0]}
                className={`${optionClassName} ${value.includes(i[0]) ? selectedOptionClassName : ''}`}
                type="button"
                onClick={() => toggle(i[0])}>
                {i[1]}
            </button>
        ))}
    </div>)
}

export default MultiSelectTiles;