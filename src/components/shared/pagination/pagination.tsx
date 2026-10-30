import { useT } from "@/i18n/use-t";

type Props = {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    className?: string;
};

const GAP = "gap";

/**
 * 1 … 4 5 6 … 12: both ends and the neighbours of the current page, the rest
 * collapsed. A gap of a single page shows that page instead — the "…" would
 * take the same room and hide it for nothing.
 */
const getPages = (page: number, totalPages: number): (number | typeof GAP)[] => {
    const visible = [...new Set([1, page - 1, page, page + 1, totalPages])]
        .filter((item) => item >= 1 && item <= totalPages)
        .sort((a, b) => a - b);

    return visible.flatMap((item, index) => {
        const prev = visible[index - 1];

        if (prev === undefined || item - prev === 1) return [item];

        return item - prev === 2 ? [item - 1, item] : [GAP, item];
    });
};

function Chevron({ direction }: { direction: "left" | "right" }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
                d={direction === "left" ? "M10 3L5 8L10 13" : "M6 3L11 8L6 13"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** nothing to page through on a single page, so it renders nothing then */
function Pagination({ page, totalPages, onChange, className }: Props) {
    const { t } = useT("common");

    if (totalPages <= 1) return null;

    return (
        <nav className={`pagination ${className ?? ""}`} aria-label={t("pagination.label")}>
            <button
                type="button"
                className="pagination__btn"
                disabled={page <= 1}
                aria-label={t("pagination.previous")}
                onClick={() => onChange(page - 1)}
            >
                <Chevron direction="left" />
            </button>
            <ul className="pagination__list">
                {getPages(page, totalPages).map((item, index) =>
                    item === GAP ? (
                        <li key={`${GAP}-${index}`} className="pagination__gap" aria-hidden="true">
                            …
                        </li>
                    ) : (
                        <li key={item}>
                            <button
                                type="button"
                                className={`pagination__btn ${item === page ? "pagination__btn_active" : ""}`}
                                aria-label={t("pagination.page", { page: item })}
                                aria-current={item === page ? "page" : undefined}
                                onClick={() => item !== page && onChange(item)}
                            >
                                {item}
                            </button>
                        </li>
                    ),
                )}
            </ul>
            <button
                type="button"
                className="pagination__btn"
                disabled={page >= totalPages}
                aria-label={t("pagination.next")}
                onClick={() => onChange(page + 1)}
            >
                <Chevron direction="right" />
            </button>
        </nav>
    );
}

export default Pagination;
