
type Props = { className?: string }

function SkeletonHeader({
    className
}: Props) {
    return <div className={`skeleton-header ${className}`}></div>
}

export default SkeletonHeader