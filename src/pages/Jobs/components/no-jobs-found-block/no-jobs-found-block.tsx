
type Props = {
    className?: string;
    heading: string;
    description: string;
    buttonStr: string;
    onClick: () => void;
}

function NoJobsFoundBlock({
    className,
    heading,
    description,
    buttonStr,
    onClick
}: Props) {
    return <div className={`no-jobs-found-block ${className}`}>
        <div className="no-jobs-found-block__main">
            <div className="no-jobs-found-block__text-container">
                <p className="no-jobs-found-block__heading">{heading}</p>
                <p className="no-jobs-found-block__description">{description}</p>
            </div>
            <button
                className="no-jobs-found-block__btn"
                type="button"
                onClick={onClick}>
                {buttonStr}
            </button>
        </div>
    </div>
}

export default NoJobsFoundBlock;