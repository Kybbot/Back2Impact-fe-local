import type { FC } from "react";

type Props = {
    count?: number;
    className?: string;
};

const Confetti: FC<Props> = ({ className, count = 32 }) => {
    return (
        <div className={`confetti ${className ?? ""}`} aria-hidden="true">
            <div className="confetti__field">
                {Array.from({ length: count }, (_, i) => (
                    <i key={i} className="confetti__piece" />
                ))}
            </div>
        </div>
    );
};

export default Confetti;
