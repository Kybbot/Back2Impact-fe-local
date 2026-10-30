import { Controller, useFormContext } from "react-hook-form";
import { useT } from "@/i18n/use-t";
import { useOutletContext } from "react-router";
import CardHeader from "../components/card-header/card-header";
import MultiSelectTiles from "@/components/shared/multi-select-tiles/multi-select-tiles";

export const MAX_PROFESSIONAL_AREAS = 3;

type Props = {
    className?: string;
};

type OnboardingContext = {
    options: { professionalAreas: { [key: string]: string } };
};

function ProfessionsCard({ className }: Props) {
    const { t } = useT("onboarding");
    const { options } = useOutletContext<OnboardingContext>();
    const { control } = useFormContext();

    return (
        <div className={`professions-card ${className}`}>
            <CardHeader
                className="professions-card__header"
                heading={t("professions.heading")}
                description={t("professions.description")}
            />
            <Controller
                name="professionalAreas"
                control={control}
                render={({ field }) => (
                    <MultiSelectTiles
                        value={field.value}
                        options={options.professionalAreas}
                        className="professions-card__select"
                        optionClassName="professions-card__tile"
                        selectedOptionClassName="professions-card__tile_selected"
                        onChange={(value) => {
                            if (value.length <= MAX_PROFESSIONAL_AREAS) field.onChange(value);
                        }}
                    />
                )}
            />
        </div>
    );
}

export default ProfessionsCard;
