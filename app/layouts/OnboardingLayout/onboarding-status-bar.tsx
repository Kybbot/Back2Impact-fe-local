import CheckMark from "../../components/shared/check-mark";

type Props = {
    className?: string;
    steps: number;
    currentStep: number;
};

function OnboardingStatusBar({ className, steps, currentStep }: Props) {
    let lineSize = (currentStep / steps) * (100 - 8.3);

    if (currentStep === 1) lineSize -= 0.9;

    const getSegmentState = (i: number) => {
        if (i < currentStep) return "completed";
        if (i === currentStep) return "current";
        return "upcoming";
    };

    return (
        <div className={`onboarding-status-bar ${className}`}>
            <div className="onboarding-status-bar__line" style={{ width: `${lineSize}%` }}></div>
            <div className="onboarding-status-bar__points-container">
                {Array.from({ length: steps }).map((_, ind) => {
                    const state = getSegmentState(ind + 1);

                    if (state === "completed") return <CheckMark key={ind} color="#4286F5" />;
                    else
                        return (
                            <div
                                key={ind}
                                className={`onboarding-status-bar__point onboarding-status-bar__point_${state}`}
                            ></div>
                        );
                })}
            </div>
        </div>
    );
}

export default OnboardingStatusBar;
