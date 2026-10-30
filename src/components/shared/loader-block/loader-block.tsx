
type Props = {
    className?: string;
}

function LoaderBlock({
    className
}: Props) {
    return <div className={`loader-block ${className ?? ''}`}>
        <span className="loader-block__loader"></span>
    </div>
}

export default LoaderBlock;