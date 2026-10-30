import { Link } from "@/i18n/navigation";
import { useT } from "@/i18n/use-t";

type Props = {
    className?: string;
    /** the HTTP status being rendered; 404 gets its own copy */
    status?: number;
    heading: string;
    description: string;
};

/**
 * What the root ErrorBoundary renders. The response status is set by whoever
 * threw — this only draws it, so a 404 stays a real 404 rather than a page
 * that says "not found" while answering 200.
 */
function NotFound({ className, status, heading, description }: Props) {
    const { t } = useT("common");

    return (
        <div className={`not-found-block ${className ?? ""}`}>
            <main className="not-found-block__main">
                {status && <p className="not-found-block__status">{status}</p>}
                <div className="not-found-block__text-container">
                    <h1 className="not-found-block__heading">{heading}</h1>
                    <p className="not-found-block__description">{description}</p>
                </div>
                <div className="not-found-block__actions">
                    {/* a 404 is a dead end for a crawler unless it links back
                        into the site, and these are the two pages worth linking */}
                    <Link className="not-found-block__btn not-found-block__btn_primary" to="/jobs/all">
                        {t("notFound.browseAll")}
                    </Link>
                    <Link className="not-found-block__btn" to="/">
                        {t("notFound.goHome")}
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default NotFound;
