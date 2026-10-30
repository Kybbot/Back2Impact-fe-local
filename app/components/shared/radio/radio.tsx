
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Radio({ label, ...props }: RadioProps) {
  return (
    <label className="radio">
      <input
        className="radio__input"
        type="radio"
        {...props}
      />

      <span className="radio__control">
        <span className="radio__dot" />
      </span>

      {label && <span>{label}</span>}
    </label>
  );
}