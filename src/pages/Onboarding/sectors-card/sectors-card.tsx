import { Controller, useFormContext } from "react-hook-form";
import { useT } from "@/i18n/use-t";
import { useOutletContext } from "react-router";
import CardHeader from "../components/card-header/card-header";
import MultiSelectTiles from "@/components/shared/multi-select-tiles/multi-select-tiles";

type Props = {
    className?: string;
};

type OnboardingContext = {
    options: { sectors: { [key: string]: string } };
};

function SectorsCard({ className }: Props) {
    const { t } = useT("onboarding");
    const { options } = useOutletContext<OnboardingContext>();
    const { control } = useFormContext();

    return (
        <div className={`sectors-card ${className}`}>
            <CardHeader heading={t("sectors.heading")} description={t("sectors.description")} />
            <Controller
                name="sectors"
                control={control}
                render={({ field }) => (
                    <MultiSelectTiles
                        value={field.value}
                        options={options.sectors}
                        className="sectors-card__select"
                        optionClassName="sectors-card__tile"
                        selectedOptionClassName="sectors-card__tile_selected"
                        onChange={field.onChange}
                    />
                )}
            ></Controller>
        </div>
    );
}

export default SectorsCard;
