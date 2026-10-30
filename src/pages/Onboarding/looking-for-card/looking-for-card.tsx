import { Controller, useFormContext } from "react-hook-form";
import { useT } from "@/i18n/use-t";
import { useOutletContext } from "react-router";
import CardHeader from "../components/card-header/card-header";
import MultiSelectTiles from "@/components/shared/multi-select-tiles/multi-select-tiles";

type Props = {
    className?: string;
};

type OnboardingContext = {
    options: { opportunityTypes: { [key: string]: string } };
};

function LookingForCard({ className }: Props) {
    const { t } = useT("onboarding");
    const { options } = useOutletContext<OnboardingContext>();
    const { control } = useFormContext();

    return (
        <div className={`looking-for-card ${className}`}>
            <CardHeader
                heading={t("lookingFor.heading")}
                description={t("lookingFor.description")}
            />

            <Controller
                name="opportunityTypes"
                control={control}
                render={({ field }) => (
                    <MultiSelectTiles
                        value={field.value}
                        options={options.opportunityTypes}
                        className="looking-for-card__select"
                        optionClassName="looking-for-card__tile"
                        selectedOptionClassName="looking-for-card__tile_selected"
                        onChange={field.onChange}
                    />
                )}
            />
        </div>
    );
}

export default LookingForCard;
