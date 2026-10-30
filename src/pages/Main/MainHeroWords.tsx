import { useEffect, useState, type FC } from "react";

import { useLocale } from "@/i18n/use-locale";

const WORD_DURATION = 2200;

type Props = {
    words: string[];
};

export const MainHeroWords: FC<Props> = ({ words }) => {
    const locale = useLocale();
    const [{ index, previous }, setWord] = useState({ index: 0, previous: -1 });

    const wordsKey = words.join("|");

    const current = index % words.length;
    const leaving = previous % words.length;

    useEffect(() => {
        if (words.length < 2) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const timer = window.setInterval(() => {
            setWord((state) => ({
                index: (state.index + 1) % words.length,
                previous: state.index,
            }));
        }, WORD_DURATION);

        return () => window.clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wordsKey]);

    return (
        <span className={`mainHero__title--span mainHero__title--span-${locale}`}>
            {words.map((word, position) => (
                <span
                    key={word}
                    className="mainHero__word"
                    data-state={position === current ? "active" : position === leaving ? "leaving" : "idle"}
                >
                    {word}
                </span>
            ))}
        </span>
    );
};
