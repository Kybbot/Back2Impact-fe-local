type Props = {
    color: string;
};

function RightArrow({ color }: Props) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_626_162)">
                <path
                    d="M3.5 8H13.5M9.5 4L13.5 8L9.5 12"
                    stroke={color}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_626_162">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

export default RightArrow;
