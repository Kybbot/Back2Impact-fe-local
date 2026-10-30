import { type FC, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

type Props = {
    as?: "div" | "h2" | "p" | "footer";
    className: string;
    children: ReactNode;
};

// fades the block in once it scrolls into view. The prerendered HTML ships
// `data-revealed="false"`, the animation and its stagger live in main.css
export const MainReveal: FC<Props> = ({ as: Tag = "div", className, children }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.45, fallbackInView: true });

    return (
        <Tag ref={ref} className={`mainReveal ${className}`} data-revealed={inView}>
            {children}
        </Tag>
    );
};
