type Props = {
    color: string;
};

function CheckMark({ color }: Props) {
    return (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
                d="M0.75 4.35L3.03571 6.75L8.75 0.75"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default CheckMark;
