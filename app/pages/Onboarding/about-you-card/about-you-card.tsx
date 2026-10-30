import { Controller, useFormContext } from "react-hook-form";
import { useT } from "@/i18n/use-t";
import { useOutletContext } from "react-router";
import CardHeader from "../components/card-header/card-header";
import { Radio } from "@/components/shared/radio/radio";

type Props = {
    className?: string;
};

type OnboardingContext = {
    options: { audienceSegments: { [key: string]: string } };
};

function AboutYouCard({ className }: Props) {
    const { t } = useT("onboarding");
    const { options } = useOutletContext<OnboardingContext>();
    const { register, control } = useFormContext();

    return (
        <div className={`about-you-card ${className}`}>
            <CardHeader heading={t("aboutYou.heading")} description={t("aboutYou.description")} />
            <div className="about-you-card__main">
                <Controller
                    name="audienceSegment"
                    control={control}
                    render={({ field }) => (
                        <>
                            {Object.entries(options.audienceSegments).map((i) => (
                                <div
                                    key={i[0]}
                                    className={`
                                about-you-card__input-block
                                ${field.value === i[0] ? "about-you-card__input-block_selected" : ""}
                            `}
                                    onClick={() => field.onChange(i[0])}
                                >
                                    <Radio
                                        {...register("audienceSegment")}
                                        checked={field.value === i[0]}
                                        type="radio"
                                        value={i[0]}
                                    />
                                    <span className="about-you-card__label">{i[1]}</span>
                                </div>
                            ))}
                        </>
                    )}
                />
            </div>
        </div>
    );
}

export default AboutYouCard;
