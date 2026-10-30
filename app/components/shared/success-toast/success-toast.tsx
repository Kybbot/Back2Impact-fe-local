import successIcon from '/img/success-icon.svg';

type Props = {
    className?: string;
    message: string
}

function SuccessToast({
    className,
    message
}: Props) {
    return <div className={`success-toast ${className}`}>
        <img className="success-toast__icon" src={successIcon} alt="" aria-hidden="true" />
        <span className="success-toast__message">{message}</span>
    </div>
}

export default SuccessToast;