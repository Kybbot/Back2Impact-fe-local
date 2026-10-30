
type Props = { className?: string }

function SkeletonJobsList({
    className
}: Props) {
    return <div className={`skeleton-jobs-list ${className ?? ''}`}>
        <div className="skeleton-jobs-list__count"></div>
        <div className="skeleton-jobs-list__jobs-container">
            <div className="skeleton-jobs-list__job"></div>
            <div className="skeleton-jobs-list__job"></div>
            <div className="skeleton-jobs-list__job"></div>
            <div className="skeleton-jobs-list__job"></div>
        </div>
    </div>
}

export default SkeletonJobsList;