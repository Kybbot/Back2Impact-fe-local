import alertIcon from '/img/alert-icon.svg';

type Props = {
    message: string;
    className?: string;
}

function ErrorBlock({
    message,
    className
}: Props) {
    return <div className={`error-block ${className ?? ''}`}>
        <img src={alertIcon} className="error-block__icon" alt="" aria-hidden="true" />
        <p className="error-block__message">{message}</p>
    </div>
}

export default ErrorBlock;