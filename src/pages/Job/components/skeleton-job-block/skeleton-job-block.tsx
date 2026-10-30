
type Props = { className?: string }

function SkeletonJobBlock({ className }: Props) {
    return <div className={`skeleton-job-block ${className}`}>
        <div className="skeleton-job-block__main">
            <div className="skeleton-job-block__main-heading"></div>
            <div className="skeleton-job-block__content"></div>
        </div>
        <div className="skeleton-job-block__side-bar">
            <div className="skeleton-job-block__side-bar-header">
                <div className="skeleton-job-block__company-main-info">
                    <div className="skeleton-job-block__company-logo"></div>
                    <div className="skeleton-job-block__company-name"></div>
                </div>
                <div className="skeleton-job-block__company-workers-count"></div>
            </div>
            <div className="skeleton-job-block__company-description"></div>
            <div className="skeleton-job-block__side-bar-footer">
                <div className="skeleton-job-block__left-footer-block"></div>
                <div className="skeleton-job-block__right-footer-block"></div>
            </div>
        </div>
    </div>
}

export default SkeletonJobBlock;