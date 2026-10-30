
type Props = {
    className?: string;
    heading: string;
    description: string;
}

function CardHeader({
    className,
    heading,
    description
}: Props) {
    return <div className={`card-header ${className ?? ''}`}>
        <h2 className="card-header__heading">{heading}</h2>
        <p className="card-header__description">{description}</p>
    </div>
}

export default CardHeader;