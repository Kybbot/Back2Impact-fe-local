import { useMemo, useState } from "react";
import selectArrowIcon from '/img/select-arrow-icon.svg';
import cancelIcon from '/img/cancel-icon.svg';

type Props = {
    className?: string
    options: { [key: string]: string };
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

function SelectItemPicker({
    className,
    options,
    value,
    onChange,
    placeholder,
}: Props) {
    const [selected, setSelected] = useState('');

    const availableOptions = useMemo(
        () => Object.entries(options).filter(o => !value.includes(o[0])),
        [options, value]
    );

    const handleSelect = (item: string) => {
        if(!item) return;

        if(!value.includes(item))
            onChange([...value, item]);

        setSelected('');
    }

    const handleRemove = (item: string) => onChange(value.filter(i => i !== item));

    return <div className={`select-item-picker ${className ?? ''}`}>
            <div className="select-item-picker__select-container">
                <select
                    className="select-item-picker__select"
                    value={selected}
                    onChange={e => handleSelect(e.target.value)}>
                    <option value="">{placeholder ?? 'Select value'}</option>
                    {availableOptions.map(o => (
                        <option key={o[0]} value={o[0]}>{o[1]}</option>
                    ))}
                </select>
                <img
                    className="select-item-picker__select-icon"
                    src={selectArrowIcon} alt="" aria-hidden="true" />
            </div>
            <div className="select-item-picker__selected-items-container">
                {value.map(i => {
                    const option = Object.entries(options).find(o => o[0] === i);

                    if(!option) return null;

                    return <button
                        className="select-item-picker__selected-item"
                        key={i}
                        type="button"
                        onClick={() => handleRemove(i)}>
                        <span>{option[1]}</span>
                        <img
                            className="select-item-picker__cancel-icon"
                            src={cancelIcon} alt="" aria-hidden="true" />
                    </button>
                })}
            </div>
    </div>
}

export default SelectItemPicker;